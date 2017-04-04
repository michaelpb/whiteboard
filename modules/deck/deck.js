'use strict';

const WhiteboardModule = require('../../lib/WhiteboardModule');
const {Menu, MenuItem} = require('electron');

function capitalize(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
}

class Deck extends WhiteboardModule {
    get tagname() {
        // Name of the .tag and channel this should use
        return 'deck';
    }

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

        // once we're loaded, setup a nice menu
        this.context_menu = this.make_menu();

        // for now just have both be the menu
        Menu.setApplicationMenu(this.context_menu);

        // Default font size is 18 for now
        this.default_font_size = 18;
    }

    make_menu() {
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
            {type: 'separator'},
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

        return Menu.buildFromTemplate(template);
    }

    activate(path) {
        this.set_active(obj => obj.path === path);
        const activated = this.wbobj.objects.find(obj => obj.path === path);
        this.last_activated = activated;
        this.editor.mount(null, activated, '#editor_pane');
        this.update();
    }

    setup_events(match) {
        this.on('activate', (event, item_path) => {
            this.activate(item_path);
        });

        this.on('toggle', (event, groupname) => {
            const group = this.get_group(groupname);
            if (!group) {
                throw new Error('could not find group ' + groupname);
            }
            group.collapsed = !group.collapsed;
            this.update();
        });

        this.on('ready', (event, payload) => {
            // open the top thing
            this.activate(this.wbobj.objects[0].path);
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
        const next = this._get_obj_at_offset(this.last_activated.path, 1);
        this.activate(next.path);
    }

    previous_slide() {
        const prev = this._get_obj_at_offset(this.last_activated.path, -1);
        this.activate(prev.path);
    }

    _get_obj_at_offset(path, offset) {
        const activated = this.wbobj.objects
            .find(obj => obj.path === this.last_activated.path);
        let index = this.wbobj.objects.indexOf(activated) + offset;
        // bound index by array length
        index = Math.min(this.wbobj.objects.length - 1, Math.max(0, index));
        return this.wbobj.objects[index];
    }

    set_active(match) {
        this.objs = [];
        for (const obj of this.wbobj.objects) {
            this.objs.push({
                path: obj.path,
                active: match(obj),
                typename: obj.typename,
                title: capitalize(obj.title || obj.typename || ''),
            });
        }

        // clear objects since we just made them anew
        for (const group of this.groups) {
            group.objects = [];
        }

        // (re)-assign
        for (const obj of this.objs) {
            const group = this.get_group(obj.typename);
            if (group) {
                group.objects.push(obj);
                if (obj.active) {
                    // decollapse if active
                    group.collapsed = false;
                }
            }
        }
    }

    get_group(typename) {
        return this.groups.filter(group => group.typename === typename)[0];
    }

    get_opts() {
        return {
            pane_visible: this.pane_visible,
            groups: this.groups,
            objects: this.objs,
        };
    }
}

module.exports = Deck;
