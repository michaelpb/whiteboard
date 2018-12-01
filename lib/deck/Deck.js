const fs = require('fs');

const { ModuleBase } = require('elmoed');
const schemaconf = require('schemaconf');
const pathlib = require('path');

const Slide = require('./Slide');
const { glyphIcon, flattenMenuTemplate, makeGlobalMenuTemplate } = require('../utils');
const dialogs = require('../utils/dialogs.js');
const { refreshBackground } = require('../utils/backgrounds.js');
const { checkIfDeckIsTestDeck } = require('../utils/utils.js');
const { getStore } = require('../utils/prefs.js');

const NOOP = () => {};
const SLIDE_MOUNT_POINT = '#current_slide';
const AUTOSAVE_RATE = 10 * 1000; // every 10 seconds

const WB_FORMAT = dialogs.WB_FORMAT;
const VERSION_ERROR = `
    Warning: Unrecognized Whiteboard file version. Your version of Whiteboard
    might be outdated, or the file may have an error.
`.replace(/[\s\n]+/g, ' ');

let _currentUID = 0;
function _uid(str = null) {
    _currentUID += 1;
    if (str) {
        return `${str}-${_currentUID}`;
    }
    return _currentUID;
}

class Deck extends ModuleBase {
    constructor(...args) {
        super(...args);

        // Init the background according to preferences
        const { browserWindow } = this.windowInfo;
        refreshBackground(browserWindow);

        this.setupEvents();
        this.setupWindowEvents();

        this.presentationMode = false;

        // File format meta information
        this.fileVersion = null;

        // Misc cached menu stuff
        this.globalMenu = null;
        this.contextMenu = null;

        // Set up data structures to contained slide data
        this.slideIDs = []; // ordering for slides
        this.slideData = {}; // data as it gets updated
        this.slideEditors = {}; // as editors get created, put here
        this.activeSlideID = null;

        // Used to determine if has unsaved data
        this._lastWrittenData = '';
        this._autosaveInterval = null;

        // Set up initial menu and context menu
        this.setMenu();
        this.setContextMenu();
    }

    addSlide() {
        const slideID = _uid('slide');
        const info = Slide.newSlideInfo();
        this.slideIDs.unshift(slideID);
        this.slideData[slideID] = info;
        this.activateSlide(slideID);
        this._updateSlideDataFromEditors();
    }

    _deleteSlide(slideID) {
        const editor = this.slideEditors[slideID];
        const { editors } = this.manager;

        // Trigger clean up events, then delete references to editor
        if (editor) {
            // editor.destroy(); // TODO fix editor clean up
            editors.callMethodRecursively(editor, 'onWindowClosed');
            editors.destroyEditor(editor);
        }

        delete this.slideData[slideID];
        delete this.slideEditors[slideID];
        if (this.activeSlideID === slideID) {
            this.activeSlideID = null;
        }
    }

    togglePresentationMode() {
        this.setPresentationMode(!this.presentationMode);
    }

    /*
        Either turns on or off presentation mode
    */
    setPresentationMode(presentationMode) {
        this.presentationMode = presentationMode;
        const { browserWindow } = this.windowInfo;
        browserWindow.setMenuBarVisibility(!this.presentationMode);
        browserWindow.setFullScreen(this.presentationMode);
    }

    deleteCurrentSlide() {
        const newSlidesIDs = this.slideIDs
            .filter(slideID => slideID !== this.activeSlideID);
        this.setFewerSlides(newSlidesIDs);
    }

    setFewerSlides(newSlideIDs) {
        const newSlides = new Set(newSlideIDs);
        for (const slideID of this.slideIDs) {
            if (!newSlides.has(slideID)) {
                // Found deletion
                this._deleteSlide(slideID);
            }
        }
        this.slideIDs = newSlideIDs;
        const deletedCurrentSlide = this.activeSlideID === null;

        if (this.slideIDs.length === 0) {
            // Check for deleting all slides
            this._initSlides({ slide: [] });
        }

        if (deletedCurrentSlide) {
            // Check for deleting active slide
            this.activateSlide(this.slideIDs[0]);
        } else {
            this.update();
        }
    }

    load(callback, options) {
        const { creating } = (options || {});
        fs.open(this.path, 'r', (err, fd) => {
            // check if can't open, if so, assume it doesn't exist
            if (err) {
                if (!creating) {
                    console.error(err);
                    console.error(`Cannot open ${this.path}`);
                    throw err;
                }
                this._initSlides({ slide: [] });
                this._initMeta({ format: [{ version: WB_FORMAT }] });
                callback();
                return;
            }

            // otherwise read data from file
            fs.readFile(fd, 'utf-8', (fileErr, contents) => {
                const data = schemaconf.format.parse(contents);
                this._initSlides(data);
                this._initMeta(data);
                callback();
            });
        });
    }

    /*
    Generate savable data from the current status of the deck
    */
    getData() {
        const data = {
            slide: this.slideIDs.map(slideID => this.slideData[slideID]),
        };
        const version = this.fileVersion;
        if (version) {
            data.format = [{ version }];
        }

        const css = this.globalCss;
        if (css && css.length > 0) {
            data.deck = [{ css }];
        }

        return data;
    }

    save(callback = NOOP) {
        // console.log('saving!');
        this._updateSlideDataFromEditors();
        const data = this.getData();
        const string = schemaconf.format.stringify(data);
        fs.writeFile(this.path, string, (err) => {
            if (err) {
                console.error('cannot write to path: ', this.path);
                throw err;
            }
            this._lastWrittenData = JSON.stringify(data);
            callback();
        });
    }

    autosave() {
        // Cheaper just to automatically save, without a "edited" check
        // if (this.isSavedToDisk()) {
        // }
        this.save();
    }

    _updateSlideDataFromEditors() {
        for (const slideID of this.slideIDs) {
            const editor = this.slideEditors[slideID];
            if (editor) {
                this.slideData[slideID] = editor.slideData;
            }
        }
    }

    /*
        Given the data object, extract version information
    */
    _initMeta(data) {
        this.readonly = false;
        this.fileVersion = null; // default to unknown version
        this.globalCss = null; // defaults to no extra CSS

        if (data.deck) {
            const deck = data.deck[0];

            // Read CSS from file, if applicable
            if (deck.cssfile) {
                const dirPath = pathlib.dirname(this.path);
                const path = pathlib.resolve(dirPath, deck.cssfile);
                try {
                    this.globalCss = fs.readFileSync(path, 'utf-8');
                } catch (e) {
                    console.error('Error reading Global CSS file: ', e);
                }
            }

            // Add in custom deck CSS, if applicable
            if (deck.css) {
                if (!this.globalCss) {
                    this.globalCss = '';
                }
                this.globalCss += deck.css;
            }

            // Add in custom deck CSS, if applicable
            if (deck.readonly) {
                this.readonly = deck.readonly === 'true';
            }
        }

        // Load CSS from globalCss
        if (this.globalCss) {
            this._initCss(this.globalCss);
        }

        if (!data.format) {
            return;
        }

        if (data.format.length !== 1) {
            console.error('Format info error');
            return;
        }

        const format = data.format[0];
        if (format.version !== WB_FORMAT) {
            console.error('Unrecognized version: ', format);
            dialogs.showErrorMessage(this, VERSION_ERROR);
            return;
        }
        this.fileVersion = format.version;
    }

    _initSlides(data) {
        let slides = data.slide;
        if (slides.length === 0) {
            // Zero state, init with an empty slide
            slides = [Slide.newSlideInfo()];
        }

        // Loop through slides in the file populating the data structures,
        // generating a Slide ID for each one. IDs are ephemeral / not stored,
        // only used to keep track of ordering.
        for (const slide of slides) {
            const slideID = _uid('slide');
            this.slideData[slideID] = slide;
            this.slideIDs.push(slideID);
        }

        if (this.activeSlideID === null) {
            // Nothing yet active, activate first slide
            this.activeSlideID = this.slideIDs[0];
        }

        // Save a string to be used to check for changes
        const finalData = this.getData();
        this._lastWrittenData = JSON.stringify(finalData);

        // Initialize autosave status
        this.setAutosave(this.isAutosaveOn(), true);
    }

    _initCss(cssString) {
        const { browserWindow } = this.windowInfo;
        browserWindow.webContents.insertCSS(cssString);
    }

    makeNavigationMenu(includeSeparator = false) {
        return [
            {
                label: 'Next',
                accelerator: 'CommandOrControl+Right',
                click: () => this.nextSlide(),
                icon: glyphIcon('arrow-thin-right'),
            },
            {
                label: 'Previous',
                accelerator: 'CommandOrControl+Left',
                click: () => this.previousSlide(),
                icon: glyphIcon('arrow-thin-left'),
            },
            {
                label: 'All slides',
                accelerator: 'F2',
                click: () => this.send('toggle_deck'),
                icon: glyphIcon('picture-copy'),
            },
            ...(includeSeparator ? [{ type: 'separator' }] : []),
            {
                label: 'Fullscreen Presentation',
                accelerator: 'F5',
                icon: glyphIcon('easal'),
                click: () => this.togglePresentationMode(),
                // Looks better w/o the checkbox
                // type: 'checkbox',
                // checked: !!this.presentationMode,
            },
            {
                label: 'Cut',
                accelerator: 'CmdOrCtrl+X',
                role: 'cut',
            }, {
                label: 'Copy',
                accelerator: 'CmdOrCtrl+C',
                role: 'copy',
            }, {
                label: 'Paste',
                accelerator: 'CmdOrCtrl+V',
                role: 'paste',
            }, {
                label: 'Select All',
                accelerator: 'CmdOrCtrl+A',
                role: 'selectall',
            },
        ];
    }

    /*
    Set up the right click context with an optional appended menu fragment
    */
    setContextMenu(menuToAppend = []) {
        if (menuToAppend.length > 0) {
            // Add a separator after
            menuToAppend.unshift({ type: 'separator' });
        }

        const template = [
            ...this.makeNavigationMenu(),
            ...menuToAppend,
        ];

        // once we're loaded, setup a nice menu
        const { Menu } = this.manager.electron;
        this.contextMenu = Menu.buildFromTemplate(template);
    }

    makeFileMenu() {
        if (this.readonly) {
            return [
                {
                    label: 'Save disabled',
                    enabled: false,
                    icon: glyphIcon('lock'),
                },
            ];
        }

        const isAutosave = this.isAutosaveOn();
        const isAutosaveAvailable = this.fileVersion !== null;
        return [
            {
                label: 'Autosave',
                click: () => this.setAutosave(!isAutosave), // toggle
                checked: isAutosave,
                type: 'checkbox',
                enabled: isAutosaveAvailable,
                // icon: glyphIcon('refresh'),
            },
            // Conditionally include Save, only if not autosave included
            ...isAutosave ? [] : [
                {
                    label: 'Save',
                    click: () => this.save(),
                    icon: glyphIcon('floppy-disk'),
                },
            ],
            {
                label: 'Save as...',
                click: () => this.showSaveAsDialog(),
                icon: glyphIcon('floppy-disk'),
            },
        ];
    }

    makeTopLevelMenu(slideMenu) {
        const extraSlideOperations = [
            {
                label: 'Add slide',
                click: () => this.addSlide(),
                icon: glyphIcon('plus'),
            },
            {
                label: 'Delete slide',
                click: () => this.deleteCurrentSlide(),
                icon: glyphIcon('trash'),
            },
        ];

        return [
            {
                label: 'Navigation',
                submenu: this.makeNavigationMenu(true),
            },
            {
                label: 'Slide',
                submenu: slideMenu && slideMenu.length ? [
                    ...extraSlideOperations,
                    { type: 'separator' },
                    slideMenu[0],
                    ...slideMenu.slice(1),
                ] : [],
            },
        ];
    }

    makeHelpMenu() {
        return [
            {
                label: 'Shortcut help',
                icon: glyphIcon('keyboard'),
                accelerator: 'F1',
                click: () => this.send('toggle_help', this.helpInfo),
            },
        ];
    }

    /*
    Sets the status of autosave
    */
    setAutosave(isOn, skipSetting) {
        if (!skipSetting) {
            getStore().set('deckAutosave', isOn);
        }

        if (this._autosaveInterval) {
            clearInterval(this._autosaveInterval);
        }

        if (isOn) {
            this._autosaveInterval = setInterval(
                () => this.autosave(), AUTOSAVE_RATE);
        } else {
            this._autosaveInterval = null;
        }
    }

    onWindowFocused() {
        if (!this.globalMenu) {
            return;
        }

        // Set this as the global menu bar, and ensure is visible (if in
        // presentation mode)
        const { Menu } = this.manager.electron;
        const { browserWindow } = this.windowInfo;
        Menu.setApplicationMenu(this.globalMenu);
        browserWindow.setMenu(this.globalMenu);
    }

    /*
    Set up the global menu with an optional slide menu fragment
    */
    setMenu(slideMenu = []) {
        const template = makeGlobalMenuTemplate(
            this.windowInfo,
            this.manager,
            pathlib.dirname(this.path),
            this.makeTopLevelMenu(slideMenu),
            this.makeFileMenu(),
            this.makeHelpMenu(),
        );

        // once we're loaded, setup a nice menu
        const { Menu } = this.manager.electron;
        this.globalMenu = Menu.buildFromTemplate(template);

        // Generate info about the current context for help purposes
        this.helpInfo = flattenMenuTemplate(template,
            'accelerator', 'label', 'icon').filter(item => item.accelerator);

        // Set this as the global menu bar, and ensure is visible (if in
        // presentation mode)
        Menu.setApplicationMenu(this.globalMenu);
        const { browserWindow } = this.windowInfo;
        // only not in presentation mode
        browserWindow.setMenuBarVisibility(!this.presentationMode);
        browserWindow.setMenu(this.globalMenu);
    }

    // Given a slide id, activate that slide for editing.
    activateSlide(slideID) {
        this.activeSlideID = slideID;
        this.update(); // updates the sidebar

        // Now get the relevant slide
        const info = this.slideData[slideID];
        const slidePath = this.getSubPath(slideID, 'slide');
        const slideEditor = this.subMount(
            slidePath, SLIDE_MOUNT_POINT, NOOP, info);
        this.slideEditors[slideID] = slideEditor;
    }

    setupWindowEvents() {
        dialogs.setupShowConfirmQuit(this);
    }

    isAutosaveOn() {
        if (checkIfDeckIsTestDeck(this)) {
            // Annoying hack: Check if we are in an end to end test, if so
            // ALWAYS disable autosave
            // TODO: Remove me once Issue #59 is fixed
            return false;
        }

        if (this.fileVersion === null) {
            // File version is unknown, don't do autosave
            return false;
        }

        if (this.readonly) {
            // If readonly, always skip autosave
            return false;
        }

        return getStore().get('deckAutosave');
    }

    isSavedToDisk() {
        // Updates slide and compares with what was last saved to disk
        this._updateSlideDataFromEditors();
        const data = this.getData();
        return this._lastWrittenData === JSON.stringify(data);
    }

    setupEvents() {
        this.on('activate', (event, slideID) => {
            this.activateSlide(slideID);
        });

        this.on('add_slide', () => {
            // Create new slide then activate it
            this.addSlide();
        });

        this.on('reorder', (event, slideIDs) => {
            if (slideIDs.length === 0) {
                // TODO figure this one out...
                console.error('Empty reorder attempt');
                return;
            }
            if (slideIDs.length !== this.slideIDs.length) {
                // Uh oh, should only be a reorder event
                throw new Error('Invalid slide reorder!');
            }
            this.slideIDs = slideIDs;
            this.update();
        });

        this.on('set_fewer_slides', (event, newSlideIDs) => {
            this.setFewerSlides(newSlideIDs);
        });

        this.on('ready', () => {
            // open the top thing
            this.activateSlide(this.slideIDs[0]);
        });

        this.on('next_slide', () => this.nextSlide());
        this.on('previous_slide', () => this.previousSlide());

        this.on('show_context_menu', (event, x, y) => {
            this.contextMenu.popup(undefined, { x, y });
        });
    }

    nextSlide() {
        const next = this.offsetSlideID(this.activeSlideID, 1);
        this.activateSlide(next);
    }

    previousSlide() {
        const prev = this.offsetSlideID(this.activeSlideID, -1);
        this.activateSlide(prev);
    }

    offsetSlideID(slideID, offset) {
        let index = this.slideIDs.indexOf(slideID) + offset;
        // bound index by array length
        index = Math.min(this.slideIDs.length - 1, Math.max(0, index));
        return this.slideIDs[index];
    }

    showSaveAsDialog() {
        const { dialog } = this.manager.electron;

        dialog.showSaveDialog({
            defaultPath: this.path,
            filters: [
                { name: 'Whiteboard', extensions: ['whiteboard'] },
            ],
        }, (newPath) => {
            if (!newPath) {
                return; // canceled
            }
            this.path = newPath;
            this.save();
        });
    }

    static layoutDeckPreview(manager, slides) {
        return slides.map(slide => ({
            panerows: Slide.layoutPanePreviews(manager, slide),
        }));
    }

    getProps() {
        const slides = this.slideIDs.map((id) => {
            const slide = this.slideData[id] || { title: 'Unnamed' };
            const { title } = slide;
            return {
                id,
                title,
                is_active: this.activeSlideID === id,
                panerows: Slide.layoutPanePreviews(this.manager, slide),
            };
        });

        return {
            slides,
        };
    }
}

module.exports = Deck;
