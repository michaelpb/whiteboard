'use strict';

// TODO: rename file
const WhiteboardModule = require('../../lib/WhiteboardModule');

const fs = require('fs');

class Editor extends WhiteboardModule {
    get tagname() {
        return 'editor';
    }

    constructor(...args) {
        super(...args);
        this.setup_events();
    }

    setup_events(match) {
        this.on('ready', (event, payload) => {
        });
    }

    get_opts() {
        console.log('this.wbobj.text', this.wbobj.text);
        return {
            tabs: [
                {title: 'test.js'},
                {title: 'another_example.js'},
                {title: 'third.js'},
            ],
            files: [
                {
                    path: 'test.js',
                    contents: 'var test_contents = "test";'
                }
            ],
        };
    }
}

module.exports = Editor;
