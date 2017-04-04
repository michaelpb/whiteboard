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

class Editor extends WhiteboardModule {
    get tagname() {
        return 'editor';
    }

    constructor(...args) {
        super(...args);
        this.data = Array.from(TEST_DATA);
        this.setup_events();
        this.active_file_path = 'test.js';
        this.active_file_text = '...';
    }

    setup_events(match) {
        this.on('ready', (event, payload) => {
            this.activate('test.js');
        });

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
        return this.data.find(file => file.path === path);
    }

    activate(path) {
        this.active_file_path = path;
        const active_file = this.get_file(this.active_file_path);
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
        const {active_file_text} = this;
        return {tabs, text: active_file_text};
    }
}

module.exports = Editor;
