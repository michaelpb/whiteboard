'use strict';

// TODO: rename file
const WhiteboardModule = require('../../lib/ScrollObjectEditor');

let id = 0;
function _uid() {
    id++;
    return id;
}


// Given a path and the parsed info from a single Slide, return an flat
// of array of objects in the expected format (e.g. with 'typename' for
// each one)
function _munge_info(path, slide_info) {
    const objects = [];
    let i = 0;
    for (const typename of Object.keys(slide_info)) {
        i++;
        const pane_info = slide_info[typename];
        const uid = _uid();
        const pane_path = `${path}~${_uid()}`;
        const pane_obj = {
            typename,
            path: pane_path,
            mount_id: 'slide_pane_' + uid,
            text: pane_info,
        };
        objects.push(pane_obj);
    }
    console.log('this is objects', objects);
    return objects;
}

class Slide extends WhiteboardModule {
    get tagname() {
        // Name of the .tag and channel this should use
        return 'slide';
    }

    constructor(...args) {
        super(...args);

        // Setup each pane sub-editor
        this.panes = _munge_info(this.wbobj.path, this.wbobj.info);
        this.setup_events();
    }

    mount_panes() {
        // Using the Editor mounting system, loop through mounting all
        // panes with their individual modules
        for (const pane of this.panes) {
            this.editor.mount(null, pane, `#${pane.mount_id}`);
        }
    }

    setup_events() {
        this.on('ready', (event, payload) => {
            this.mount_panes();
        });
    }

    get_opts() {
        return {
            panes: this.panes,
        };
    }
}

module.exports = Slide;
