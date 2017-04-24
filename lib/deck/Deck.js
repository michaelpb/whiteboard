'use strict';

const {ModuleBase} = require('elmoed');
const {Menu, MenuItem} = require('electron');
const schemaconf = require('schemaconf');
const fs = require('fs');

let _uid = 0;
const uid = str => (str ? str + '-' : '') + _uid++;

function capitalize(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
}

class Deck extends ModuleBase {
    constructor(...args) {
        super(...args);

        // Makes the data structure that makes the hierarchical
        // left-pane
        this.setup_events();
        const make_group = typename =>
            ({label: capitalize(typename), typename: typename,
                collapsed: true, objects: []});
        this.groups = [
            make_group('slide'),
            //make_group('format'),
        ];
        this.pane_visible = false;

        //this.next_previous_menu = new Menu();

        // Default font size is 18 for now
        this.default_font_size = 18;

        this.slides = {};    // slide data is stored here
        this.slide_ids = []; // ordering for slides
        this.active_slide_id = '';

        this.set_menu()
    }

    load(callback) {
        fs.readFile(this.path, 'utf-8', (err, data) => {
            if (err) {
                console.error("cannot read path: ", path);
                throw err;
            }
            this.data = schemaconf.format.parse(data);
            this._update_slides();
            callback();
        });
    }

    _update_slides() {
        let num = 0;
        for (const slide of this.data.slide) {
            num++;
            const slide_id = uid('slide');
            this.slides[slide_id] = {
                info: slide,
                slide_id,
            };
            this.slide_ids.push(slide_id);
        }
        if (this.active_slide !== null) {
            this.active_slide = this.slide_ids[0];
        }
    }

    make_menu() {
        return Menu.buildFromTemplate(template);
    }

    set_menu(prepend_menu = []) {
        if (prepend_menu.length > 0) {
            // Add a separator after
            prepend_menu.push({type: 'separator'});
        }
        const template = [
            {role: 'toggledevtools'},
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
            {type: 'separator'},
            ...prepend_menu,
            {role: 'togglefullscreen'},
            {
                label: 'Zoom',
                submenu: [
                    {role: 'resetzoom'},
                    {role: 'zoomin'},
                    {role: 'zoomout'},
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
        this.context_menu = Menu.buildFromTemplate(template);

        // for now just have both be the context and global menu
        Menu.setApplicationMenu(this.context_menu);
    }

    activate_slide(slide_id) {
        this.active_slide = slide_id;
        this.subMount(this.getSubPath(slide_id, 'slide'), '#editor_pane');
        this.update();
    }

    /*
    activate(path) {
        return;
        this.set_active(obj => obj.path === path);
        const activated = this.wbobj.objects.find(obj => obj.path === path);
        this.last_activated = activated;
        const slide_editor = this.editor.mount(null, activated, '#editor_pane');
        slide_editor.parent_editor = this;
        this.update();
    }
    */

    setup_events(match) {
        this.on('activate', (event, slide_id) => {
            this.activate_slide(slide_id);
        });

        this.on('ready', (event, payload) => {
            // open the top thing
            this.activate_slide(this.slide_ids[0]);
        });

        this.on('toggle_deck', (event, payload) => {
            this.pane_visible = !this.pane_visible;
            this.update();
        });

        this.on('next_slide', () => this.next_slide());
        this.on('previous_slide', () => this.previous_slide());

        this.on('show_context_menu', (event, x, y) => {
            this.context_menu.popup(undefined, {x, y});
            //this.context_menu = this.setup_context_menu();
        });
    }

    next_slide() {
        const next = this._get_slide_id_at_offset(this.active_slide_id, 1);
        this.activate_slide(next);
    }

    previous_slide() {
        const prev = this._get_slide_id_at_offset(this.active_slide_id, -1);
        this.activate_slide(prev);
    }

    _get_obj_at_offset(slide_id, offset) {
        let index = this.slide_ids.indexOf(slide_id) + offset;
        // bound index by array length
        index = Math.min(this.slide_ids.length - 1, Math.max(0, index));
        return this.slide_id[index];
    }

    getProps() {
        return {
            pane_visible: this.pane_visible,
            //pane_visible: true,
            slides: this.slide_ids.map(id => ({
                title: this.slides[id].title || 'Unnamed',
                active: this.active_slide_id === id,
            })),
        };
    }
}

module.exports = Deck;
