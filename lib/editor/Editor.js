'use strict';

const {ModuleBase} = require('elmoed');

const glob = require('glob');
const fs = require('fs');
const pathlib = require('path');

function split_text(text) {
    if (text.includes('\n')) {
        // Split by newline
        return text.split('\n');
    } else {
        return text.split(',');
    }
}

const DEFAULT_EMPTY = {
    path: 'new_file',
    text: '...',
};

class Editor extends ModuleBase {
    constructor(...args) {
        super(...args);

    }

    load(callback, text) {
        // Converts the text into a list of files, some of which might
        // be globs. These it attempts to resolve and put all in paths.
        const file_list = split_text(text);
        const globs = file_list.filter(glob.hasMagic);
        const normal_paths = file_list.filter(path => !glob.hasMagic(path));
        const flattened_paths = normal_paths.concat
            .apply(normal_paths,
                globs.map(gpath =>
                    glob.sync(gpath.trim(), {nodir: true})));

        this.data = Array.from(flattened_paths.map(partial_path => {
            const path = pathlib.resolve(partial_path.trim());
            let text = '';
            if (fs.existsSync(path)) {
                text = fs.readFileSync(path).toString();
            }
            return {path, text};
        }));

        if (this.data.length === 0) {
            this.data = [DEFAULT_EMPTY];
        }

        this.active_file_path = this.data[0].path;
        this.active_file_text = this.data[0].text;
        this.setup_events();
        callback();
    }

    setup_events(match) {
        this.on('change_tab', (event, updated_text, new_path) => {
            this.set_text(this.active_file_path, updated_text);
            this.activate(new_path);
        });

        this.on('save', (event, updated_text) => {
            this.save_text(this.active_file_path, updated_text);
        });
    }


    save_text(path, new_text) {
        // Saves the given path with the new text
        const active_file = this.get_file(path);
        active_file.text = new_text;
        if (path === this.active_file_path) {
            this.active_file_text = new_text;
        }
        fs.writeFile(active_file.path, new_text, err => {
            if (err) {
                console.error('error writing file: ', err);
            }
        });
    }

    get_context_menu() {
        return [
            {
                label: 'Save',
                accelerator: 'CommandOrControl+S',
                click: () => this.send('trigger_save'),
            },
        ];
    }

    set_text(path, new_text) {
        const active_file = this.get_file(path);
        active_file.text = new_text;
    }

    get_file(path) {
        const file = this.data.find(file => file.path === path);
        if (!file) {
            console.error('cannot find file ', file);
        }
        return file;
    }

    activate(path) {
        const active_file = this.get_file(path);
        this.active_file_path = path;
        this.active_file_text = active_file.text;
        this.update();
    }

    static get_iconic_preview(text) {
        return '<img src="svg/si-glyph-code.svg"/>';
    }

    getProps() {
        const tabs = this.data
            .map(file => ({
                title: pathlib.basename(file.path),
                path: file.path,
                active: file.path === this.active_file_path,
            }));
        const path = this.active_file_path;
        const text = this.active_file_text;
        return {path, tabs, text};
    }
}

module.exports = Editor;
