'use strict';

const WhiteboardModule = require('../../lib/WhiteboardModule');

let id = 0;
function _uid() {
    id++;
    return id;
}

function layout_rows(unordered_panes) {
    const panes = Array.from(unordered_panes);
    // TODO a mess
    const make_row = (panes, style) => ({
        row_panes: panes,
        column_class: `s${12 / panes.length}`,
        row_class: `slide-row-${panes[0].layout_hint.prefer_top ? 'short' : 'half'}`,
    });

    const rows = [];
    while (panes.length > 0) {
        const first_pane = panes.pop();
        rows.unshift(make_row([first_pane]));
    }
    console.log('this is rows', rows);
    return rows;


    // TODO: VERTICAL SPLIT BELOW:

    while (panes.length > 0) {
        const first_pane = panes.pop();
        if (first_pane.layout_hint.prefer_top || panes.length === 0) {
            rows.unshift(make_row([first_pane]));
            continue;
        }

        // Instead push both together
        const second_pane = panes.pop();
        rows.push(make_row([first_pane, second_pane]));
    }

    // now attach style
    return rows;
}


class Slide extends WhiteboardModule {
    get tagname() {
        // Name of the .tag and channel this should use
        return 'slide';
    }

    constructor(...args) {
        super(...args);

        // Setup each pane sub-editor
        this._make_pane_info(this.wbobj.path, this.wbobj.info);
        this.setup_events();
    }

    // Given a path and the parsed info from a single Slide, return an
    // flat of array of objects in the expected format (e.g. with
    // 'typename' for each one)
    _make_pane_info(path, slide_info) {
        this.panes = [];
        for (const typename of Object.keys(slide_info)) {
            const pane_info = slide_info[typename];
            const uid = _uid();
            const pane_path = `${path}~${_uid()}`;
            const editor_class = this.editor.get_editor_class(typename);
            const pane_obj = {
                typename,
                layout_hint: editor_class.layout_hint || {},
                path: pane_path,
                mount_id: 'slide_pane_' + uid,
                text: pane_info,
            };
            this.panes.push(pane_obj);
        }
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
            pane_rows: layout_rows(this.panes),
            layout_name: 'vertical',
        };
    }
}

module.exports = Slide;
