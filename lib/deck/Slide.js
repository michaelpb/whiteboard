const lodash = require('lodash');

const { ModuleBase } = require('elmoed');

let _currentUID = 0;
function _uid(str = null) {
    _currentUID += 1;
    if (str) {
        return `${str}-${_currentUID}`;
    }
    return _currentUID;
}

const HORIZONTAL_LAYOUT = 'horizontal';
const VERTICAL_LAYOUT = 'vertical';
const GRID_LAYOUT = 'grid';

const nonPanular = new Set([
    // Meta information about the pane:
    'layout',
    'maximized_pane',
]);

// Size of 'prefer_top' panes, currently only the Title
const TOP_PANE_SIZE = 10;
const TOP_PANE_PREVIEW_SIZE = 60;

const NEW_SLIDE_TEXT = 'New Slide ';

// TODO: Add more complete modular registration listing to Elmoed manager
const PANE_MODS = new Set([
    'terminal',
    'editor',
    'title',
    // 'rawhtml',
    'markdown',
    'browser',
]);

const SHOW_DEFAULT_EDITOR = new Set([
    'title',
    'markdown',
    'browser',
]);

const isPane = PANE_MODS.has.bind(PANE_MODS);
const shouldShowDefaultEditor = SHOW_DEFAULT_EDITOR.has.bind(SHOW_DEFAULT_EDITOR);

let newSlideCount = 1;
function _guessNewSlideCount(info) {
    if (!info.title || !info.title.startsWith(NEW_SLIDE_TEXT)) {
        return;
    }
    const v = Number(info.title.slice(NEW_SLIDE_TEXT.length));

    if (Number.isFinite(v) && v >= newSlideCount) {
        newSlideCount = v + 1;
    }
}

class Slide extends ModuleBase {
    constructor(...args) {
        super(...args);

        // Setup each pane sub-editor
        this.panes = [];
        this.paneEditors = {};
        this._paneMaximized = false;
        this._needsRemount = false;
        this.info = null;
    }

    // Creates new slide info, defaulting to empty
    static new_slide_info() {
        return { title: `${NEW_SLIDE_TEXT}${newSlideCount}` };
    }

    // Given slide info object, lays out the panes.
    static layout_pane_previews(manager, info) {
        _guessNewSlideCount(info);
        const panes = [];
        for (const typename of Object.keys(info)) {
            if (nonPanular.has(typename)) {
                continue; // Skip meta-info like layout
            }

            // Construct a pane info object to be used by the front-end in
            // setting up all the panes
            const editorClass = manager.getEditorClass(typename);
            const preview = Slide.getPreview(editorClass, info[typename]);
            const hint = editorClass.layout_hint || {};
            panes.push({ hint, preview });
        }
        const layout = info.layout || HORIZONTAL_LAYOUT;
        return Slide.layout_rows(layout, panes, TOP_PANE_PREVIEW_SIZE);
    }

    static getPreview(editorClass, placeholder) {
        return editorClass.get_iconic_preview
            ? editorClass.get_iconic_preview(placeholder)
            : Slide.getDefaultIconicPreview(placeholder);
    }

    static layout_rows(layout, panes, top_pane_default_size = TOP_PANE_SIZE) {
        const rows = [];

        // First, float up all prefer_top
        const top_panes = panes.filter(pane => pane.hint.prefer_top);
        const normalPanes = panes.filter(pane => !pane.hint.prefer_top);

        let vRealestate = 100;
        const hRealestate = 100;

        // Divide evenly by top_panes if there are no normal panes
        let top_pane_size = top_pane_default_size;
        if (normalPanes.length < 1) {
            top_pane_size = vRealestate / top_panes.length;
        }

        // Remove top rows and give them their fixed 10% height
        for (const pane of top_panes) {
            vRealestate -= top_pane_size;
            rows.push({
                width: hRealestate,
                height: top_pane_size,
                row_panes: [pane],
            });
        }

        // No normal panes? Return now...
        if (normalPanes.length === 0) {
            return rows;
        }

        // Now divide the rest (V or H), or do 2 at a time (Grid)
        const makeRow = (height, row_panes) => {
            const width = hRealestate / row_panes.length;
            return { height, width, row_panes };
        };

        if (layout === VERTICAL_LAYOUT) {
            // adds all normal panes in one row
            rows.push(makeRow(vRealestate, normalPanes));
        } else if (layout === HORIZONTAL_LAYOUT) {
            // Adds each pane in a separate row.
            // Calc row height, and push all the rows
            const rowHeight = vRealestate / normalPanes.length;
            rows.push(...normalPanes.map(pane => ({
                width: hRealestate,
                height: rowHeight,
                row_panes: [pane],
            })));
        } else {
            // Grid layout
            const row_count = Math.ceil(normalPanes.length / 2);
            const height = vRealestate / row_count;
            while (normalPanes.length > 0) {
                const rowPanes = [normalPanes.shift()];
                if (normalPanes.length > 0) {
                    rowPanes.push(normalPanes.shift());
                }
                rows.push(makeRow(height, rowPanes));
            }
        }
        return rows;
    }

    load(callback, info) {
        if (!this.info) {
            // not yet loaded
            this.info = info;
            this.panes = this._make_pane_info(this.info);
            this.setup_events();
        }
        callback();
    }

    // Given a path and the parsed info from a single Slide, return an
    // flat of array of objects in the expected format (e.g. with
    // 'typename' for each one)
    _make_pane_info(slide_info) {
        const panes = [];
        for (const typename of Object.keys(slide_info)) {
            if (nonPanular.has(typename)) {
                continue; // Skip meta-info like layout
            }

            // Construct a pane info object to be used by the front-end in
            // setting up all the panes
            const text = slide_info[typename];
            const path = this.getSubPath(typename);
            const editorClass = this.manager.getEditorClass(typename);
            const mount_id = `pane_${_uid()}`;
            const hint = editorClass.layout_hint || {};
            panes.push({ hint, mount_id, typename, path, text });
        }
        return panes;
    }

    static getDefaultIconicPreview(type) {
        return `<span class='slide-preview-default'>${type}</span>`;
    }

    mount_panes() {
        // Using the Editor mounting system, loop through mounting all
        // panes with their individual modules
        for (const pane of this.panes) {
            const paneEditor = this.subMount(pane.path, `#${pane.mount_id}`, () => {}, pane.text);
            this.paneEditors[pane.mount_id] = paneEditor;
        }
    }

    remount_pane_by_typename(typename, value) {
        const pane = this.panes.find(p => p.typename === typename);
        pane.text = value;
        const paneEditor = this.subMount(pane.path, `#${pane.mount_id}`, () => {}, pane.text);
        this.paneEditors[pane.mount_id] = paneEditor;
    }

    setup_events() {
        this.on('ready', () => {
            this.mount_panes();
        });

        this.on('change_focus', (event, mount_id) => {
            let paneMenu = [];
            const editor = this.paneEditors[mount_id];
            if (editor && editor.get_context_menu) {
                paneMenu = editor.get_context_menu();
            }
            this.setMenu(paneMenu, editor);
        });

        this.on('edit_panel_save', (event, payload) => {
            const { value, typename } = payload;
            this.setPaneValue(typename, value);
        });

        // When we redo the layout, this gets triggered when the backend is
        // done
        this.on('remount_editors', this.mount_panes.bind(this));
    }

    delete_pane(typename) {
        delete this.info[typename];
        this.panes = this._make_pane_info(this.info);
        this._needsRemount = true;
        this.update();
        this._needsRemount = false;
    }

    editPane(typename) {
        const value = this.info[typename];
        this.send('editPane', { value, typename });
    }

    addPane(typename) {
        this.info[typename] = `new ${typename}`;
        this.panes = this._make_pane_info(this.info);
        this._needsRemount = true;
        this.update();
        this._needsRemount = false;
    }

    /*
     * Sets the context + global menu with given prepended menu
     */
    setMenu(prependMenu = [], editor = null) {
        const doesNotHave = key => !(key in this.info);
        const mods = Object.keys(this.manager.modules)
            .filter(isPane).filter(doesNotHave);
        const typesSubmenu = mods.map((typename) => {
            const editorClass = this.manager.getEditorClass(typename);
            const label = editorClass.verbose_name || lodash.startCase(typename);
            return {
                label,
                click: () => this.addPane(typename),
            };
        });

        let paneMenu = [];
        if (editor) {
            // TODO Fix this, add "reverse type name" to Elmoed:
            const splitted = editor.path.split('!');
            const name = splitted[splitted.length - 1];
            const modify_submenu = [
                {
                    label: `Remove ${name}`,
                    click: () => this.delete_pane(name),
                },
            ];

            if (shouldShowDefaultEditor(name)) {
                modify_submenu.unshift({
                    label: `Edit ${name}`,
                    click: () => this.editPane(name),
                });
            }

            paneMenu = [
                {
                    label: `Maximize ${name}`,
                    accelerator: 'F10',
                    type: 'checkbox',
                    checked: !!this.getMaximizedPaneID(),
                    click: () => {
                        this.toggleMaximize(name);
                    },
                },
                {
                    label: `Modify ${name}`,
                    submenu: modify_submenu,
                },
            ];
        }

        const template = [
            ...prependMenu,
            ...paneMenu,
            { type: 'separator' },
            {
                label: 'Add pane',
                submenu: typesSubmenu,
            },
            {
                label: 'Layout',
                submenu: [
                    {
                        label: '\u268C Horizontal',
                        type: 'radio',
                        click: () => this.setLayout(HORIZONTAL_LAYOUT),
                        checked: this.layout === HORIZONTAL_LAYOUT,
                    },
                    {
                        label: '\u2016 Vertical',
                        type: 'radio',
                        click: () => this.setLayout(VERTICAL_LAYOUT),
                        checked: this.layout === VERTICAL_LAYOUT,
                    },
                    {
                        label: '\u268F Grid',
                        type: 'radio',
                        click: () => this.setLayout(GRID_LAYOUT),
                        checked: this.layout === GRID_LAYOUT,
                    },
                ],
            },
        ];
        this.parentEditor.setMenu(template);
    }

    getPaneByType(typename) {
        for (const pane of this.panes) {
            if (pane.typename === typename) {
                return pane;
            }
        }
        return null;
    }

    getMaximizedPaneID() {
        // Get the mount ID of the current maximized pane
        const { maximized_pane } = this.info;
        if (!maximized_pane) {
            return null;
        }
        return this.getPaneByType(maximized_pane).mount_id;
    }

    get layout() {
        return this.info.layout || HORIZONTAL_LAYOUT;
    }


    /* eslint-disable camelcase */
    get slide_data() {
        this._updateInfoFromPanes();
        return this.info;
    }
    /* eslint-enable camelcase */

    _updateInfoFromPanes() {
        // Ensures that slide info is up-to-date by serializing all pane
        // editors
        for (const pane of this.panes) {
            const paneEditor = this.paneEditors[pane.mount_id];
            if (paneEditor && 'serialized' in paneEditor) {
                this.info[pane.typename] = paneEditor.serialized();
            }
        }
    }

    toggleMaximize(typename) {
        // Toggles the `maximized_pane' field, and refreshes accordingly
        if (this.info.maximized_pane) {
            delete this.info.maximized_pane;
            this.send('unmaximize_pane');
        } else {
            this.info.maximized_pane = typename;
            this.send('maximize_pane', this.getMaximizedPaneID());
        }
    }

    setPaneValue(typename, value) {
        this.info[typename] = value;
        this.remount_pane_by_typename(typename, value);
    }

    setLayout(newLayout) {
        this.info.layout = newLayout;

        // Needs to update, and the frontend needs to know that we need
        // a remount after this one
        this._needsRemount = true;
        this.update();
        this._needsRemount = false;
    }

    getProps() {
        return {
            _needs_remount: this._needsRemount,
            /* panes: this.panes, */
            pane_rows: Slide.layout_rows(this.layout, this.panes),
            layout_name: String(this.layout),
            maximized_pane: this.getMaximizedPaneID(),
        };
    }
}

module.exports = Slide;
