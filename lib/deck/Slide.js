'use strict';

const {ModuleBase} = require('elmoed');

let id = 0;
function _uid() {
    id++;
    return id;
}

const HORIZONTAL_LAYOUT = 'horizontal';
const VERTICAL_LAYOUT = 'vertical';
const GRID_LAYOUT = 'grid';

const nonPanular = new Set([
    'layout', // Layout is not included
]);

// Size of 'prefer_top' panes, currently only the Title
const TOP_PANE_SIZE = 10;

function layout_rows(layout, panes) {
    const rows = [];

    // First, float up all prefer_top
    const top_panes = panes.filter(pane => pane.hint.prefer_top);
    const normal_panes = panes.filter(pane => !pane.hint.prefer_top);

    let top_row_class;
    let row_class;
    let v_realestate = 100;
    let h_realestate = 100;

    // Now remove top rows and give them their fixed 10% height
    for (const pane of top_panes) {
        v_realestate -= TOP_PANE_SIZE;
        rows.push({
            width: h_realestate,
            height: TOP_PANE_SIZE,
            row_panes: [pane],
        });
    }

    // No normal panes? Return now...
    if (normal_panes.length === 0) {
        return rows;
    }

    // Now divide the rest (V or H), or do 2 at a time (Grid)
    const make_row = (height, row_panes) => {
        const width = h_realestate / row_panes.length;
        return {height, width, row_panes};
    };

    if (layout === VERTICAL_LAYOUT) {
        // adds all normal panes in one row
        rows.push(make_row(v_realestate, normal_panes));
    } else if (layout === HORIZONTAL_LAYOUT) {
        //  :
        // Calc row height, and push all the rows
        const row_height = v_realestate / normal_panes.length;
        rows.push(...normal_panes.map(pane => ({
            width: h_realestate,
            height: row_height,
            row_panes: [pane],
        })));
    } else {
        //  ::
        const height = v_realestate / (Math.floor((normal_panes.length / 2)));
        while (normal_panes.length > 0) {
            const row_panes = [normal_panes.shift()];
            if (normal_panes.length > 0) {
                row_panes.push(normal_panes.shift());
            }
            rows.push(make_row(height, row_panes));
        }
    }
    return rows;
}

function old_layout_rows(layout, unordered_panes) {
    // TODO Fix messiness
    const panes = Array.from(unordered_panes);
    const rows = [];
    const make_row = (panes, style) => ({
        row_panes: panes,
        column_class: `s${12 / panes.length}`,
        row_class: `slide-row-${panes[0].layout_hint.prefer_top ? 'short' : 'half'}`,
    });


    if (layout === HORIZONTAL_LAYOUT) {
        while (panes.length > 0) {
            const first_pane = panes.pop();
            rows.unshift(make_row([first_pane]));
        }
    } else if (layout === VERTICAL_LAYOUT) {
        const top_panes = panes.filter(pane => pane.layout_hint.prefer_top);
        const normal_panes = panes.filter(pane => !pane.layout_hint.prefer_top);
        for (const pane of top_panes) {
            rows.push(make_row([pane]));
        }
        rows.push(make_row(normal_panes));
    } else if (layout === GRID_LAYOUT) {
        // TODO: Fix grid layout (below)
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
    } else {
        throw new Error('Unknown layout ' + String(layout));
    }

    // now attach style
    return rows;
}


class Slide extends ModuleBase {
    constructor(...args) {
        super(...args);

        // Setup each pane sub-editor
        this.panes = [];
        this.pane_editors = {};
        this._pane_maximized = false;
        this._needs_remount = false;
        this.info = null;
    }

    load(callback, info) {
        if (!this.info) {
            // not yet loaded
            this.info = info;
            this._make_pane_info(this.path, this.info);
            this.setup_events();
        }
        callback();
    }

    // Given a path and the parsed info from a single Slide, return an
    // flat of array of objects in the expected format (e.g. with
    // 'typename' for each one)
    _make_pane_info(path, slide_info) {
        for (const typename of Object.keys(slide_info)) {
            if (nonPanular.has(typename)) {
                continue;
            }
            const pane_info = slide_info[typename];
            const uid = _uid();
            const pane_path = this.getSubPath(typename);
            const editor_class = this.manager.getEditorClass(typename);
            const pane_obj = {
                typename,
                hint: editor_class.layout_hint || {},
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
            const pane_editor = this.subMount(pane.path, `#${pane.mount_id}`, () => {}, pane.text);
            this.pane_editors[pane.mount_id] = pane_editor;
        }
    }

    setup_events() {
        this.on('ready', (event, payload) => {
            this.mount_panes();
        });

        this.on('change_focus', (event, mount_id) => {
            let pane_menu = [];
            const editor = this.pane_editors[mount_id];
            if (editor && editor.get_context_menu) {
                pane_menu = editor.get_context_menu();
            }
            this.set_menu(pane_menu);
        });

        // When we redo the layout, this gets triggered when the backend is
        // done
        this.on('remount_editors', this.mount_panes.bind(this));
    }

    /*
     * Sets the context + global menu with given prepended menu
     */
    set_menu(prepend_menu = []) {
        const template = [
            ...prepend_menu,
            {
                label: 'Maximize pane',
                accelerator: 'F10',
                type: 'checkbox',
                checked: this._pane_maximized,
                click: () => {
                    this._pane_maximized = !this._pane_maximized;
                    this.send('toggle_maximized_pane');
                },
            },
            {
                label: 'Layout',
                submenu: [
                    {
                        label: '\u268C Horizontal',
                        type: 'radio',
                        click: () => this.set_layout(HORIZONTAL_LAYOUT),
                        checked: this.layout === HORIZONTAL_LAYOUT,
                    },
                    {
                        label: '\u2016 Vertical',
                        type: 'radio',
                        click: () => this.set_layout(VERTICAL_LAYOUT),
                        checked: this.layout === VERTICAL_LAYOUT,
                    },
                    {
                        label: '\u268F Grid',
                        type: 'radio',
                        click: () => this.set_layout(GRID_LAYOUT),
                        checked: this.layout === GRID_LAYOUT,
                    },
                ],
            },
        ];
        this.parentEditor.set_menu(template);
    }

    get layout() {
        return this.info.layout || HORIZONTAL_LAYOUT;
    }

    set_layout(new_layout) {
        this.info.layout = new_layout;

        // Needs to update, and the frontend needs to know that we need a
        // remount after this one
        this._needs_remount = true;
        this.update();
        this._needs_remount = false;
    }

    getProps() {
        return {
            _needs_remount: this._needs_remount,
            panes: this.panes,
            pane_rows: layout_rows(this.layout, this.panes),
            layout_name: String(this.layout),
        };
    }
}

Slide.layout_rows = layout_rows; // expose for testing

module.exports = Slide;
