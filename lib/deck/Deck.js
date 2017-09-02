const fs = require('fs');

const { ModuleBase } = require('elmoed');
const schemaconf = require('schemaconf');
const pathlib = require('path');

const dialogs = require('../dialogs.js');

const Slide = require('./Slide');
const { glyphIcon } = require('../utils');

const NOOP = () => {};
const SLIDE_MOUNT_POINT = '#current_slide';

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

        this.setupEvents();

        this.slideIDs = []; // ordering for slides
        this.slideData = {}; // data as it gets updated
        this.slideEditors = {}; // as editors get created, put here
        this.activeSlideID = null;
        this.setMenu();
        this.setContextMenu();
    }

    _deleteSlide(slideID) {
        const editor = this.slideEditors[slideID];
        if (editor && editor.onWindowClosed) {
            editor.onWindowClosed(); // trigger destroy
        }

        delete this.slideData[slideID];
        delete this.slideEditors[slideID];
        if (this.activeSlideID === slideID) {
            this.activeSlideID = null;
        }
    }

    /*
    In turn, run onWindowClosed of all sub-editors
    */
    onWindowClosed() {
        for (const editor of Object.values(this.slideEditors)) {
            if (editor && editor.onWindowClosed) {
                editor.onWindowClosed();
            }
        }
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
                callback();
                return;
            }

            // otherwise read data from file
            fs.readFile(fd, 'utf-8', (fileErr, contents) => {
                const data = schemaconf.format.parse(contents);
                this._initSlides(data);
                callback();
            });
        });
    }

    save(callback = NOOP) {
        this._updateSlideDataFromEditors();
        const data = {
            slide: this.slideIDs.map(slideID => this.slideData[slideID]),
        };

        const string = schemaconf.format.stringify(data);
        fs.writeFile(this.path, string, (err) => {
            if (err) {
                console.error('cannot write to path: ', this.path);
                throw err;
            }
            callback();
        });
    }

    _updateSlideDataFromEditors() {
        for (const slideID of this.slideIDs) {
            const editor = this.slideEditors[slideID];
            if (editor) {
                this.slideData[slideID] = editor.slideData;
            }
        }
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
            ...menuToAppend,
        ];

        // once we're loaded, setup a nice menu
        const { Menu } = this.manager.electron;
        this.contextMenu = Menu.buildFromTemplate(template);
    }

    /*
    Set up the global menu with an optional slide menu fragment
    */
    setMenu(slideMenu = []) {
        /*
        */
        const template = [
            {
                label: 'File',
                submenu: [
                    {
                        label: 'New...',
                        icon: glyphIcon('document-plus'),
                        click: () => {
                            const path = pathlib.dirname(this.path);
                            dialogs.newDeck(this.manager, path, NOOP);
                        },
                    },
                    {
                        label: 'Open...',
                        icon: glyphIcon('folder-open'),
                        click: () => {
                            const path = pathlib.dirname(this.path);
                            dialogs.loadDeck(this.manager, path, NOOP);
                        },
                    },
                    { type: 'separator' },
                    {
                        label: 'Save',
                        click: () => this.save(),
                        icon: glyphIcon('floppy-disk'),
                    },
                    {
                        label: 'Save as...',
                        click: () => this.showSaveAsDialog(),
                        icon: glyphIcon('floppy-disk'),
                    },
                    { type: 'separator' },
                    {
                        label: 'Quit',
                        icon: glyphIcon('door'),
                        click: () => {
                            const { browserWindow } = this.windowInfo;
                            browserWindow.close();
                        },
                    },
                ],
            },
            {
                label: 'Navigation',
                submenu: [
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
                        //icon: glyphIcon('film'),
                        icon: glyphIcon('picture-copy'),
                    },
                ],
            },
            {
                label: 'Slide',
                submenu: slideMenu,
            },
            {
                label: 'Zoom',
                submenu: [
                    {
                        icon: glyphIcon('zoom-in'),
                        role: 'zoomin',
                    },
                    {
                        icon: glyphIcon('zoom-out'),
                        role: 'zoomout',
                    },
                    {
                        role: 'resetzoom',
                    },
                ],
            },
            {
                label: 'Help',
                submenu: [
                    {
                        label: 'Debugging tools',
                        submenu: [
                            {
                                role: 'toggledevtools'
                            },
                        ],
                    },
                    { type: 'separator' },
                    {
                        label: 'About',
                        icon: glyphIcon('circle-help'),
                        click: () => {
                            dialogs.showAboutWindow(this.manager, this.windowInfo);
                        },
                    },
                ],
            },
        ];

        // once we're loaded, setup a nice menu
        const { Menu } = this.manager.electron;
        // const shortcuts = menuTemplateToShortcutArray(template);
        this.globalMenu = Menu.buildFromTemplate(template);

        // for now just have both be the context and global menu
        Menu.setApplicationMenu(this.globalMenu);

        // Unregister all global shortcuts
        // const { globalShortcut } = editor.manager.electron;
        // globalShortcut.unregisterAll();
        // TODO move to elmoed
        // this.send('bind_shortcuts', shortcuts);
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

    setupEvents() {
        this.on('activate', (event, slideID) => {
            this.activateSlide(slideID);
        });

        this.on('add_slide', () => {
            // Create new slide then activate it
            const slideID = _uid('slide');
            const info = Slide.newSlideInfo();
            this.slideIDs.unshift(slideID);
            this.slideData[slideID] = info;
            this.activateSlide(slideID);
            this._updateSlideDataFromEditors();
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
