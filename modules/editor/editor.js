'use strict';

const WhiteboardModule = require('../../lib/WhiteboardModule');

const fs = require('fs');
const pathlib = require('path');

const TEST_DATA = [
    {
        path: 'test.js',
        text: 'var test_contents = "test";'
    },
    {
        path: 'full/path/greeting.js',
        text: 'function greeting () {\n  console.log("hi");\n}\n'
    },
];

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

class Editor extends WhiteboardModule {
    get tagname() {
        return 'editor';
    }

    constructor(...args) {
        super(...args);

        let file_list = split_text(this.wbobj.text);

        this.data = Array.from(file_list.map(partial_path => {
            const path = pathlib.resolve(partial_path.trim());
            let text = '';
            // TODO: remove sync
            if (fs.existsSync(path)) {
                text = fs.readFileSync(path).toString();
            }
            return {path, text};
        }));

        if (this.data.length === 0) {
            this.data = [DEFAULT_EMPTY];
        }

        console.log('this .data ', this.data);
        //this.data = TEST_DATA;
        console.log('this .data ', this.data);

        this.active_file_path = this.data[0].path;
        this.active_file_text = this.data[0].text;
        this.setup_events();
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
        fs.writeFile(active_file.path, new_text, err => {
            if (err) {
                console.error('error writing file: ', err);
            }
        });
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

    get_opts() {
        const tabs = this.data
            .map(file => ({
                title: pathlib.basename(file.path),
                path: file.path,
                active: file.path === this.active_file_path,
            }));
        return {tabs, text: this.active_file_text};
    }
}

module.exports = Editor;
