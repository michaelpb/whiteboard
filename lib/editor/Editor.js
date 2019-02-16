const fs = require('fs');
const pathlib = require('path');
const glob = require('glob');

const { ModuleBase } = require('elmoed');

const { glyphIcon } = require('../utils');

function splitText(infoText) {
    const text = infoText.trim();
    if (text.includes('\n')) {
        // Split by newline
        return text.split('\n').map(s => s.trim());
    } else if (text.includes(',')) {
        // Split by comma
        return text.split(',').map(s => s.trim());
    } else if (text.length > 0) {
        // Just return single element
        return [text];
    }
    // Empty string = empty list
    return [];
}

const DEFAULT_FONT_SIZE = 28;
const DEFAULT_THEME = 'light';

const _makeDefaultEmpty = () => ({
    path: 'NEW',
    text: '',
    edited: false,
    _default: true,
});

class Editor extends ModuleBase {
    constructor(...args) {
        super(...args);
        this.tabs = null;
        this.activeFilePath = null;
        this.font_size = DEFAULT_FONT_SIZE;
        this.theme = DEFAULT_THEME;
    }

    load(callback, text) {
        // Already loaded
        if (this.tabs !== null) {
            callback();
            return;
        }

        // Converts the text into a list of files, some of which might
        // be globs. These it attempts to resolve and put all in paths.
        const fileList = splitText(text);
        const globs = fileList.filter(glob.hasMagic);
        const normalPaths = fileList.filter(path => !glob.hasMagic(path));
        const globbedPaths = globs.map(
            gpath => glob.sync(gpath.trim(), { nodir: true }));
        const allPaths = Array.prototype.concat.apply(normalPaths, globbedPaths);

        this.setupEvents();
        this.tabs = [];
        this.addTabs(allPaths, callback);
    }

    getRelativePath(path) {
        const basepath = pathlib.dirname(this.getRealPath());
        return pathlib.relative(basepath, path);
    }

    serialized() {
        const paths = this.tabs.map(tab => this.getRelativePath(tab.path));
        let sep = ',';
        if (paths.join().length > 80) {
            // Too many files go on separate lines
            sep = '\n';
        }
        return paths.join(sep);
    }

    addTabs(paths, callback) {
        // "empty state" of just a single empty placeholder tab
        if (this.tabs.length === 1
                && this.tabs[0]._default
                && this.tabs[0].text.length < 1) {
            this.activeFilePath = null; // reset active file
            this.tabs = [];
        }

        // ////////////////////
        // TODO: For some reason, this is buggy on macOS, and I can't test it,
        // so I'm just adding extra chdir here to try to fix it
        const basepath = pathlib.dirname(this.getRealPath());
        process.chdir(basepath);
        // Hack, DELETEME when properly fixed
        // ////////////////////

        // Remove existing versions of tabs (in the case of dupes)

        // TODO: make async
        this.tabs = this.tabs.concat(paths.map((partialPath) => {
            const path = pathlib.resolve(partialPath.trim());
            let text = '';
            if (fs.existsSync(path)) {
                text = fs.readFileSync(path).toString();
            }
            return { path, text, edited: false };
        }));

        // Ensure we never have an empty tab list
        if (this.tabs.length === 0) {
            this.tabs = [_makeDefaultEmpty()];
        }

        // If nothing is open, auto-open first thing
        if (this.activeFilePath === null) {
            this.activeFilePath = this.tabs[0].path;
        }
        callback();
    }

    setupEvents() {
        this.on('change_tab', (event, updatedText, currentPath, newPath) => {
            if (currentPath !== this.activeFilePath) {
                // Shouldn't happen any more, but just in case leaving
                // this in here
                this.activeFilePath = currentPath;
            }
            this.setText(this.activeFilePath, updatedText);
            this.activeFilePath = newPath;
            this.update();
        });

        this.on('save', (event, updatedText) => {
            this.saveText(this.activeFilePath, updatedText);
        });

        this.on('saveas', (event, updatedText) => {
            this.changeActiveFilePath(() => {
                this.saveText(this.activeFilePath, updatedText);
                this.update();
            });
        });
    }

    saveText(path, newText) {
        // Saves the given path with the new text
        const activeFile = this.getFile(path);
        activeFile.edited = false;
        activeFile.text = newText;
        fs.writeFile(activeFile.path, newText, (err) => {
            if (err) {
                console.error('error writing file: ', err);
            }
        });
    }

    closeTab() {
        // Saves the given path with the new text
        this.tabs = this.tabs.filter(({ path }) => path !== this.activeFilePath);
        if (this.tabs.length === 0) {
            this.tabs = [_makeDefaultEmpty()];
        }
        this.activeFilePath = this.tabs[0].path;
        this.update();
    }

    openFiles() {
        const { dialog } = this.manager.electron;
        dialog.showOpenDialog({
            title: 'Open new tab(s)...',
            properties: ['openFile', 'multiSelections'],
        }, (filePaths) => {
            if (!filePaths) {
                return; // Canceled
            }
            this.addTabs(filePaths, () => this.update());
        });
    }

    changeActiveFilePath(callback) {
        const { dialog } = this.manager.electron;
        const opts = {};

        // Hacky, check if this is a newly created file, if so, give no default
        // path
        if (this.activeFilePath !== 'NEW' &&
                this.activeFilePath !== 'new editor') {
            opts.defaultPath = this.activeFilePath;
        }

        dialog.showSaveDialog(opts, (newPath) => {
            if (!newPath) {
                return; // Canceled
            }
            // Reassigns the path
            const activeFile = this.getFile(this.activeFilePath);
            activeFile.path = newPath;
            this.activeFilePath = newPath;
            callback();
        });
    }

    getContextMenu() {
        const fontSizeSubmenu = number => ({
            label: `${number} pt`,
            type: 'radio',
            click: () => {
                this.font_size = number;
                this.update();
            },
            checked: this.font_size === number,
        });

        const themeSubmenu = (themeLabel, themeName) => ({
            label: themeLabel,
            type: 'radio',
            click: () => {
                this.theme = themeName;
                this.update();
            },
            checked: this.theme === themeName,
        });

        return [
            {
                label: 'Font Size',
                icon: glyphIcon('zoom-in'),
                submenu: [
                    fontSizeSubmenu(11),
                    fontSizeSubmenu(14),
                    fontSizeSubmenu(18),
                    fontSizeSubmenu(24),
                    fontSizeSubmenu(28),
                    fontSizeSubmenu(32),
                ],
            },
            {
                label: 'Theme',
                icon: glyphIcon('color-picker'),
                submenu: [
                    themeSubmenu('Light', 'light'),
                    themeSubmenu('Dark', 'dark'),
                ],
            },
            {
                label: 'Save',
                icon: glyphIcon('floppy-disk'),
                accelerator: 'CommandOrControl+S',
                click: () => this.send('trigger_save'),
            },
            {
                label: 'Save as...',
                icon: glyphIcon('floppy-disk'),
                accelerator: 'CommandOrControl+Shift+S',
                click: () => this.send('trigger_save_as'),
            },
            {
                label: 'Open file(s)...',
                icon: glyphIcon('folder-open'),
                accelerator: 'CommandOrControl+O',
                click: () => this.openFiles(),
            },
            {
                label: 'Close tab',
                icon: glyphIcon('delete'),
                accelerator: 'CommandOrControl+W',
                click: () => this.closeTab(),
            },
        ];
    }

    setText(path, newText) {
        const activeFile = this.getFile(path);
        activeFile.edited = true;
        activeFile.text = newText;
    }

    getFile(path) {
        const file = this.tabs.find(tab => tab.path === path);
        if (!file) {
            console.error('Cannot find file ', path);
        }
        return file;
    }

    getActiveFileText() {
        return this.getFile(this.activeFilePath).text;
    }

    includeInsertMenu() {
        return true;
    }

    static getPNGIconPath() {
        return glyphIcon('code');
    }

    static getIconicPreview() {
        return '<img src="svg/si-glyph-code.svg"/>';
    }

    getProps() {
        const tabs = this.tabs
            .map(file => ({
                title: pathlib.basename(file.path),
                path: file.path,
                active: file.path === this.activeFilePath,
            }));
        const path = this.activeFilePath;
        const text = this.getActiveFileText();
        const { font_size } = this;
        const { theme } = this;
        return { path, tabs, text, font_size, theme };
    }
}

module.exports = Editor;
