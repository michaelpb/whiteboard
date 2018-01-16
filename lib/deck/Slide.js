const lodash = require('lodash');

const { ModuleBase } = require('elmoed');

const { glyphIcon, stripMenuTemplate, uniqueCount } = require('../utils');

const HORIZONTAL_LAYOUT = 'horizontal';
const VERTICAL_LAYOUT = 'vertical';
const GRID_LAYOUT = 'grid';

const nonPanular = new Set([
    // Meta information about the pane:
    'layout',
    'maximizedPane',
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

const PANE_ORDERING = [
    'title',
    'markdown',
    'rawhtml',
    'editor',
    'terminal',
    'browser',
];

const SHOW_DEFAULT_EDITOR = new Set([
    // 'title',
    // 'markdown',
    'browser',
]);

const isPane = PANE_MODS.has.bind(PANE_MODS);
const shouldShowDefaultEditor = SHOW_DEFAULT_EDITOR.has.bind(SHOW_DEFAULT_EDITOR);


/*
    Given a slide info, this maintains a guess as to what number should be used
    for the next slide, when a new slide is created. Often, this is New Slide
    1, but if many new slides are created in a row it will be a larger number.
*/
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

/*
    Given a slide info, possibly make title auto-maximized if there is no other
    content in the slide
*/

function _getDefaultMaximizedPane(info) {
    const paneTypes = Object.keys(info).filter(key => !nonPanular.has(key));
    if (paneTypes.length === 1 && paneTypes[0] === 'title') {
        // Only a single pane type and it is title
        return 'title';
    }
    return null;
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

        this.slideID = Slide.getNextSlideID();
    }

    static getNextSlideID() {
        return uniqueCount('slide');
    }

    // Creates new slide info, defaulting to empty
    static newSlideInfo() {
        return { title: `${NEW_SLIDE_TEXT}${newSlideCount}` };
    }

    // Given slide info object, lays out the panes.
    static layoutPanePreviews(manager, info) {
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
            const hint = editorClass.layoutHint || {};
            panes.push({ hint, preview, typename });
        }
        const layout = info.layout || HORIZONTAL_LAYOUT;
        return Slide.layoutRows(layout, panes, TOP_PANE_PREVIEW_SIZE);
    }

    static getPreview(editorClass, placeholder) {
        return editorClass.getIconicPreview
            ? editorClass.getIconicPreview(placeholder)
            : Slide.getDefaultIconicPreview(placeholder);
    }

    /*
        Given a list of pane descriptions, sort panes based on preferred
        ordering of each editor type
    */
    static sortPanes(panes) {
        const newPanes = Array.from(panes);
        const order = ({ typename }) => PANE_ORDERING.indexOf(typename);
        newPanes.sort((a, b) => order(a) > order(b));
        return newPanes;
    }

    /*
        Layout into rows an array of pane description objects based on a layout
        strategy
    */
    static layoutRows(layout, panes, topPaneDefaultSize = TOP_PANE_SIZE) {
        const rows = [];

        // First remove nonpanular meta-data and sort panes
        const realPanes = panes.filter(({ typename }) => !nonPanular.has(typename));
        const sortedPanes = Slide.sortPanes(realPanes);

        // Next, float up all prefer_top
        const topPanes = sortedPanes.filter(pane => pane.hint.prefer_top);
        const normalPanes = sortedPanes.filter(pane => !pane.hint.prefer_top);

        let vRealestate = 100;
        const hRealestate = 100;

        // Divide evenly by topPanes if there are no normal panes
        let topPaneSize = topPaneDefaultSize;
        if (normalPanes.length < 1) {
            topPaneSize = vRealestate / topPanes.length;
        }

        // Remove top rows and give them their fixed 10% height
        for (const pane of topPanes) {
            vRealestate -= topPaneSize;
            rows.push({
                width: hRealestate,
                height: topPaneSize,
                rowPanes: [pane],
            });
        }

        // No normal panes? Return now...
        if (normalPanes.length === 0) {
            return rows;
        }

        // Now divide the rest (V or H), or do 2 at a time (Grid)
        const makeRow = (height, rowPanes) => {
            const width = hRealestate / rowPanes.length;
            return { height, width, rowPanes };
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
                rowPanes: [pane],
            })));
        } else {
            // Grid layout
            const rowCount = Math.ceil(normalPanes.length / 2);
            const height = vRealestate / rowCount;
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
            this.panes = this._makePaneInfo(this.info);
            this.setupEvents();
        }
        callback();
    }

    // Given a path and the parsed info from a single Slide, return an
    // flat of array of objects in the expected format (e.g. with
    // 'typename' for each one)
    _makePaneInfo(slideInfo) {
        const panes = [];
        for (const typename of Object.keys(slideInfo)) {
            if (nonPanular.has(typename)) {
                continue; // Skip meta-info like layout
            }

            // Construct a pane info object to be used by the front-end in
            // setting up all the panes
            const text = slideInfo[typename];
            const path = this.getSubPath(typename);
            const editorClass = this.manager.getEditorClass(typename);
            const mountID = `${this.slideID}_pane_${typename}`;
            const hint = editorClass.layoutHint || {};
            panes.push({ hint, mountID, typename, path, text });
        }
        return panes;
    }

    static getDefaultIconicPreview(type) {
        return `<span class='slide-preview-default'>${type}</span>`;
    }

    mountPanes() {
        // Using the Editor mounting system, loop through mounting all
        // panes with their individual modules
        for (const pane of this.panes) {
            const paneEditor = this.subMount(pane.path, `#${pane.mountID}`, () => {}, pane.text);
            this.paneEditors[pane.mountID] = paneEditor;
        }
    }

    remountPaneByTypename(typename, value) {
        const pane = this.panes.find(p => p.typename === typename);
        pane.text = value;
        const paneEditor = this.subMount(pane.path, `#${pane.mountID}`, () => {}, pane.text);
        this.paneEditors[pane.mountID] = paneEditor;
    }

    setupEvents() {
        this.on('ready', () => {
            this.mountPanes();
        });

        this.on('change_focus', (event, mountID) => {
            const editor = this.paneEditors[mountID];
            this.setMenu(editor);
        });

        this.on('edit_panel_save', (event, payload) => {
            const { value, typename } = payload;
            this.setPaneValue(typename, value);
        });

        // When we redo the layout, this gets triggered when the backend is
        // done
        this.on('remount_editors', this.mountPanes.bind(this));
    }

    hasMultiplePanes() {
        const paneTypes = Object.keys(this.info)
            .filter(key => !nonPanular.has(key));
        return paneTypes.length > 1;
    }

    deletePane(typename) {
        // Delete all traces of the given typename
        if (!this.hasMultiplePanes()) {
            // Cannot delete last pane
            throw Error('Cannot delete last pane');
        }

        const pane = this.getPaneByType(typename);
        const { mountID } = pane;
        const editor = this.paneEditors[mountID];

        // Trigger clean up events, then delete references to editor
        const { editors } = this.manager;
        if (editor) {
            // editor.destroy(); // TODO fix editor clean up
            editors.callMethodRecursively(editor, 'onWindowClosed');
            editors.destroyEditor(editor);
        }

        // Destroy local references to editor
        delete this.info[typename];
        delete this.paneEditors[mountID];

        // Now recreate the pane info list and update the visuals
        this.panes = this._makePaneInfo(this.info);
        this._needsRemount = true;
        this.update();
        this._needsRemount = false;
    }

    editPane(typename) {
        const value = this.info[typename];
        this.send('edit_pane', { value, typename });
    }

    addPane(typename) {
        // TODO Fix this, need default value system
        let initialValue = `new ${typename}`;
        if (typename === 'markdown' || typename === 'title') {
            initialValue = ' ';
        }
        this.info[typename] = initialValue;
        this.panes = this._makePaneInfo(this.info);
        this._needsRemount = true;
        this.update();
        this._needsRemount = false;
    }

    makePaneMenu(editor, isFocused = false) {
        // TODO Fix this, add "reverse type name" to Elmoed:
        const splitted = editor.path.split('!');
        const name = splitted[splitted.length - 1];
        const verboseName = editor.verbose_name || lodash.startCase(name);
        const lowerName = verboseName.toLowerCase();

        // Only include the option to delete the current pane if we have
        // multiple sub-panes
        const modifySubmenu = !this.hasMultiplePanes() ? [] : [
            {
                label: `Remove ${lowerName}`,
                click: () => this.deletePane(name),
                icon: glyphIcon('delete'),
            },
        ];

        if (shouldShowDefaultEditor(name)) {
            modifySubmenu.unshift({
                label: `Edit ${lowerName}`,
                click: () => this.editPane(name),
                icon: glyphIcon('edit'),
            });
        }

        let focusedMenu = [];
        if (isFocused) {
            // Only show maximized if its the one that is focused
            const { maximizedPane } = this.info;
            focusedMenu = [
                {
                    label: `Maximize ${lowerName}`,
                    accelerator: 'F10',
                    type: 'checkbox',
                    checked: name === maximizedPane,
                    icon: glyphIcon('arrow-fullscreen'),
                    click: () => {
                        this.toggleMaximize(name);
                    },
                },
            ];
        }

        let paneMenu = [];
        if (editor.getContextMenu) {
            paneMenu = editor.getContextMenu();
        }
        return [
            {
                label: verboseName,
                enabled: false,
            },
            ...focusedMenu,
            ...modifySubmenu.length > 0 ? [
                {
                    label: `Modify ${lowerName}`,
                    submenu: modifySubmenu,
                },
            ] : [],
            ...paneMenu,
        ];
    }

    makeSlideMenu() {
        const doesNotHave = key => !(key in this.info);
        const mods = Object.keys(this.manager.modules)
            .filter(isPane).filter(doesNotHave);
        const typesSubmenu = mods.map((typename) => {
            const editorClass = this.manager.getEditorClass(typename);
            const label = editorClass.verbose_name || lodash.startCase(typename);
            const icon = editorClass.getPNGIconPath ? editorClass.getPNGIconPath() : undefined;
            return {
                icon,
                label,
                click: () => this.addPane(typename),
            };
        });

        return [
            {
                label: 'Slide',
                enabled: false,
            },
            {
                label: 'Add pane',
                submenu: typesSubmenu,
                icon: glyphIcon('square-plus'),
            },
            {
                label: 'Layout',
                submenu: [
                    {
                        label: 'Horizontal',
                        type: 'radio',
                        click: () => this.setLayout(HORIZONTAL_LAYOUT),
                        checked: this.layout === HORIZONTAL_LAYOUT,
                        icon: glyphIcon('layout-4'),
                    },
                    {
                        label: 'Vertical',
                        type: 'radio',
                        click: () => this.setLayout(VERTICAL_LAYOUT),
                        checked: this.layout === VERTICAL_LAYOUT,
                        icon: glyphIcon('layout-2'),
                    },
                    {
                        label: 'Grid',
                        type: 'radio',
                        click: () => this.setLayout(GRID_LAYOUT),
                        checked: this.layout === GRID_LAYOUT,
                        icon: glyphIcon('layout-3'),
                    },
                ],
            },
        ];
    }

    /*
       Given an editor which is assumed to be the editor that is currently
       focused (e.g. hovered), generate both the application menu and
       right-click context menu.
     */
    makeMenu(editor = null) {
        const focusedPaneMenu = editor ? this.makePaneMenu(editor, true) : [];

        const contextMenuTemplate = [
            ...focusedPaneMenu,
            { type: 'separator' },
            ...this.makeSlideMenu(),
        ];

        const globalMenuTemplate = this.makeSlideMenu();

        for (const otherEditor of Object.values(this.paneEditors)) {
            let editorMenu;
            if (otherEditor === editor) {
                // same object, use focusedPaneMenu
                editorMenu = focusedPaneMenu;
            } else {
                editorMenu = this.makePaneMenu(otherEditor, false);
                editorMenu = stripMenuTemplate(editorMenu, 'accelerator');
            }
            globalMenuTemplate.push(...[
                { type: 'separator' },
                ...editorMenu,
            ]);
        }

        return { globalMenuTemplate, contextMenuTemplate };
    }

    /*
       Same as above, except it also sets the menu.
     */
    setMenu(editor = null) {
        const { globalMenuTemplate, contextMenuTemplate } = this.makeMenu(editor);
        this.parentEditor.setMenu(globalMenuTemplate);
        this.parentEditor.setContextMenu(contextMenuTemplate);
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
        let { maximizedPane } = this.info;
        if (!maximizedPane) {
            // If there is no current one, check default
            maximizedPane = _getDefaultMaximizedPane(this.info);
        }

        if (!maximizedPane) {
            return null;
        }

        // If there is a specified one or a default, return the mount ID
        return this.getPaneByType(maximizedPane).mountID;
    }

    get layout() {
        return this.info.layout || VERTICAL_LAYOUT;
    }

    get slideData() {
        this._updateInfoFromPanes();
        return this.info;
    }

    _updateInfoFromPanes() {
        // Ensures that slide info is up-to-date by serializing all pane
        // editors
        for (const pane of this.panes) {
            const paneEditor = this.paneEditors[pane.mountID];
            if (!(pane.typename in this.info)) {
                console.error(`Pane editor not in info: ${pane.typename}`);
            } else if (paneEditor && 'serialized' in paneEditor) {
                this.info[pane.typename] = paneEditor.serialized();
            }
        }
    }

    toggleMaximize(typename) {
        // Toggles the `maximizedPane' field, and refreshes accordingly
        if (this.info.maximizedPane) {
            delete this.info.maximizedPane;
            this.send('unmaximize_pane');
        } else {
            this.info.maximizedPane = typename;
            this.send('maximize_pane', this.getMaximizedPaneID());
        }
    }

    setPaneValue(typename, value) {
        this.info[typename] = value;
        this.remountPaneByTypename(typename, value);
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
            pane_rows: Slide.layoutRows(this.layout, this.panes),
            layout_name: String(this.layout),
            maximizedPane: this.getMaximizedPaneID(),
        };
    }
}

module.exports = Slide;
