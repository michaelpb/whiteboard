const fs = require('fs');

const { ModuleBase } = require('elmoed');
const schemaconf = require('schemaconf');

const Slide = require('./Slide');

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
    }

    _deleteSlide(slideID) {
        delete this.slideData[slideID];
        delete this.slideEditors[slideID];
        if (this.activeSlideID === slideID) {
            this.activeSlideID = null;
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
        this._updateSlideData();
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

    _updateSlideData() {
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

        // Loop through slides in the file populating the data structures
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
    Set up the menu with an optional prepended menu fragment
    */
    setMenu(menuToPrepend = []) {
        if (menuToPrepend.length > 0) {
            // Add a separator after
            menuToPrepend.push({ type: 'separator' });
        }
        const template = [
            {
                label: 'Next →',
                accelerator: 'CommandOrControl+Right',
                click: () => this.nextSlide(),
            },
            {
                label: '← Previous',
                accelerator: 'CommandOrControl+Left',
                click: () => this.previousSlide(),
            },
            {
                label: 'All slides',
                accelerator: 'F2',
                click: () => this.send('toggle_deck'),
            },
            { type: 'separator' },
            ...menuToPrepend,
            { role: 'togglefullscreen' },
            {
                label: 'Zoom',
                submenu: [
                    { role: 'resetzoom' },
                    { role: 'zoomin' },
                    { role: 'zoomout' },
                    { role: 'toggledevtools' },
                ],
            },
            { type: 'separator' },
            {
                label: 'Whiteboard',
                submenu: [
                    {
                        label: 'Save',
                        /* accelerator: 'CommandOrControl+O', */
                        click: () => this.save(),
                    },
                    {
                        label: 'Save as...',
                        /* accelerator: 'CommandOrControl+O', */
                        click: () => this.showSaveAsDialog(),
                    },
                    /*
                    { type: 'separator' },
                    {
                        label: 'Open...',
                        accelerator: 'CommandOrControl+O',
                        click: () => this.show_load_deck_dialog(),
                    },
                    */
                ],
            },
        ];
        // once we're loaded, setup a nice menu
        const { Menu } = this.manager.electron;
        this.contextMenu = Menu.buildFromTemplate(template);

        // for now just have both be the context and global menu
        Menu.setApplicationMenu(this.contextMenu);
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
            this._updateSlideData();
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
        const _layout = Slide.layoutPanePreviews;
        const slides = this.slideIDs.map(id => ({
            title: (this.slideData[id] || {}).title || 'Unnamed',
            is_active: this.activeSlideID === id,
            panerows: _layout(this.manager, this.slideData[id]),
            id,
        }));
        return {
            slides,
        };
    }
}

module.exports = Deck;
