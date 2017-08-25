const fs = require('fs');
const path = require('path');

const { ModuleBase } = require('elmoed');
const schemaconf = require('schemaconf');

const Slide = require('./Slide');
const { autogenerate_deck_from_dir } = require('../utils');

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

function save_to_file(filepath, data, callback) {
    const string = schemaconf.format.stringify(data);
    fs.writeFile(filepath, string, (err) => {
        if (err) {
            console.error('cannot write to path: ', this.path);
            throw err;
        }
        callback();
    });
}

class Deck extends ModuleBase {
    constructor(...args) {
        super(...args);

        this.setup_events();

        this.slide_ids = []; // ordering for slides
        this.slide_data = {}; // data as it gets updated
        this.slide_editors = {}; // as editors get created, put here
        this.active_slide_id = null;
        this.set_menu();
    }

    _delete_slide(slide_id) {
        delete this.slide_data[slide_id];
        delete this.slide_editors[slide_id];
        if (this.active_slide_id === slide_id) {
            this.active_slide_id = null;
        }
    }

    set_fewer_slides(new_slide_ids) {
        const new_slides = new Set(new_slide_ids);
        for (const slide_id of this.slide_ids) {
            if (!new_slides.has(slide_id)) {
                // Found deletion
                this._delete_slide(slide_id);
            }
        }
        this.slide_ids = new_slide_ids;
        const deleted_current_slide = this.active_slide_id === null;

        if (this.slide_ids.length === 0) {
            // Check for deleting all slides
            this._init_slides({ slide: [] });
        }

        if (deleted_current_slide) {
            // Check for deleting active slide
            this.activate_slide(this.slide_ids[0]);
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
                this._init_slides({ slide: [] });
                callback();
                return;
            }

            // otherwise read data from file
            fs.readFile(fd, 'utf-8', (fileErr, contents) => {
                const data = schemaconf.format.parse(contents);
                this._init_slides(data);
                callback();
            });
        });
    }

    save(callback = NOOP) {
        this._update_slide_data();
        const data = {
            slide: this.slide_ids.map(slide_id => this.slide_data[slide_id]),
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

    _update_slide_data() {
        for (const slide_id of this.slide_ids) {
            const editor = this.slide_editors[slide_id];
            if (editor) {
                this.slide_data[slide_id] = editor.slide_data;
            }
        }
    }

    _init_slides(data) {
        let slides = data.slide;
        if (slides.length === 0) {
            // Zero state, init with an empty slide
            slides = [Slide.new_slide_info()];
        }

        // Loop through slides in the file populating the data structures
        for (const slide of slides) {
            const slide_id = _uid('slide');
            this.slide_data[slide_id] = slide;
            this.slide_ids.push(slide_id);
        }

        if (this.active_slide_id === null) {
            // Nothing yet active, activate first slide
            this.active_slide_id = this.slide_ids[0];
        }
    }

    /*
    Set up the menu with an optional prepended menu fragment
    */
    set_menu(prepend_menu = []) {
        if (prepend_menu.length > 0) {
            // Add a separator after
            prepend_menu.push({ type: 'separator' });
        }
        const template = [
            {
                label: 'Next →',
                accelerator: 'CommandOrControl+Right',
                click: () => this.next_slide(),
            },
            {
                label: '← Previous',
                accelerator: 'CommandOrControl+Left',
                click: () => this.previous_slide(),
            },
            {
                label: 'All slides',
                accelerator: 'F2',
                click: () => this.send('toggle_deck'),
            },
            { type: 'separator' },
            ...prepend_menu,
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
                        click: () => this.show_save_as_dialog(),
                    },
                    { type: 'separator' },
                    {
                        label: 'Open...',
                        accelerator: 'CommandOrControl+O',
                        click: () => this.show_load_deck_dialog(),
                    },
                    {
                        label: 'Create deck from directory...',
                        click: () => this.show_import_directory_dialog(),
                    },
                ],
            },
            /*
            {type: 'separator'},
            {
                label: 'Text Size',
                submenu: [
                    {
                        label: 'Increase',
                        accelerator: 'CommandOrControl+Plus',
                        click: () => this.increase_font_size(),
                    },
                    {
                        label: 'Decrease',
                        accelerator: 'CommandOrControl+Minus',
                        click: () => this.decrease_font_size(),
                    },
                ],
            },
            */
        ];
        // once we're loaded, setup a nice menu
        const { Menu } = this.manager.electron;
        this.context_menu = Menu.buildFromTemplate(template);

        // for now just have both be the context and global menu
        Menu.setApplicationMenu(this.context_menu);
    }

    /*
    Given a slide id, activate that slide for editing.
    */
    activate_slide(slide_id) {
        this.active_slide_id = slide_id;
        this.update(); // updates the sidebar

        // Now get the relevant slide
        const info = this.slide_data[slide_id];
        const slide_path = this.getSubPath(slide_id, 'slide');
        const slide_editor = this.subMount(
            slide_path, SLIDE_MOUNT_POINT, NOOP, info);
        this.slide_editors[slide_id] = slide_editor;
    }

    setup_events() {
        this.on('activate', (event, slide_id) => {
            this.activate_slide(slide_id);
        });

        this.on('add_slide', () => {
            // Create new slide then activate it
            const slide_id = _uid('slide');
            const info = Slide.new_slide_info();
            this.slide_ids.unshift(slide_id);
            this.slide_data[slide_id] = info;
            this.activate_slide(slide_id);
            this._update_slide_data();
        });

        this.on('reorder', (event, slide_ids) => {
            if (slide_ids.length === 0) {
                // TODO figure this one out...
                console.error('Empty reorder attempt');
                return;
            }
            if (slide_ids.length !== this.slide_ids.length) {
                // Uh oh, should only be a reorder event
                throw new Error('Invalid slide reorder!');
            }
            this.slide_ids = slide_ids;
            this.update();
        });

        this.on('set_fewer_slides', (event, new_slide_ids) => {
            this.set_fewer_slides(new_slide_ids);
        });

        this.on('ready', () => {
            // open the top thing
            this.activate_slide(this.slide_ids[0]);
        });

        this.on('next_slide', () => this.next_slide());
        this.on('previous_slide', () => this.previous_slide());

        this.on('show_context_menu', (event, x, y) => {
            this.context_menu.popup(undefined, { x, y });
        });
    }

    next_slide() {
        const next = this._offset_slideid(this.active_slide_id, 1);
        this.activate_slide(next);
    }

    previous_slide() {
        const prev = this._offset_slideid(this.active_slide_id, -1);
        this.activate_slide(prev);
    }

    _offset_slideid(slide_id, offset) {
        let index = this.slide_ids.indexOf(slide_id) + offset;
        // bound index by array length
        index = Math.min(this.slide_ids.length - 1, Math.max(0, index));
        return this.slide_ids[index];
    }

    show_load_deck_dialog() {
        const { dialog } = this.manager.electron;
        dialog.showOpenDialog({
            properties: ['openFile'],
            defaultPath: this.path,
            filters: [
                { name: 'Whiteboard', extensions: ['whiteboard'] },
            ],
        }, (paths) => {
            if (!paths) {
                return; // canceled
            }

            if (this.path === paths[0]) {
                return; // don't do anything if we are re-opening same file
            }

            // Otherwise, create a new window opening this thing
            this.manager.createWindow(paths[0]);
        });
    }

    show_import_directory_dialog() {
        const { dialog } = this.manager.electron;
        dialog.showOpenDialog({
            properties: ['openDirectory'],
            defaultPath: this.path,
        }, (paths) => {
            if (!paths) {
                return; // canceled
            }

            // Otherwise, create a new window opening this thing
            const slides = autogenerate_deck_from_dir(paths[0]);
            if (slides && slides.length > 0) {
                const filepath = path.resolve(paths[0], 'deck.whiteboard');
                const data = { slide: slides };
                save_to_file(filepath, data, () => {
                    console.log('SAVED TO ', filepath);
                    this.manager.createWindow(filepath);
                });
            }
        });
    }

    show_save_as_dialog() {
        const { dialog } = this.manager.electron;

        dialog.showSaveDialog({
            defaultPath: this.path,
            filters: [
                { name: 'Whiteboard', extensions: ['whiteboard'] },
            ],
        }, (new_path) => {
            if (!new_path) {
                return; // canceled
            }
            this.path = new_path;
            this.save();
        });
    }

    static layout_deck_preview(manager, slides) {
        return slides.map(slide => ({
            panerows: Slide.layout_pane_previews(manager, slide),
        }));
    }

    getProps() {
        const _layout = Slide.layout_pane_previews;
        const slides = this.slide_ids.map(id => ({
            title: (this.slide_data[id] || {}).title || 'Unnamed',
            is_active: this.active_slide_id === id,
            panerows: _layout(this.manager, this.slide_data[id]),
            id,
        }));
        return {
            slides,
        };
    }
}

module.exports = Deck;
