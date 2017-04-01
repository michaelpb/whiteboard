'use strict';

// TODO: rename file
const WhiteboardModule = require('../../lib/ScrollObjectEditor');

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
        this.pane_visible = true;
    }

    activate(path) {
        this.set_active(obj => obj.path === path);
        const activated = this.wbobj.objects.find(obj => obj.path === path);
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
    }

    set_active(match) {
        this.objs = [];
        for (const obj of this.wbobj.objects) {
            this.objs.push({
                path: obj.path,
                active: match(obj),
                typename: obj.typename,
                title: capitalize(obj.name || obj.typename || ''),
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
