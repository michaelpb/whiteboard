'use strict';

// TODO: rename file
const WhiteboardModule = require('../../lib/ScrollObjectEditor');

const fs = require('fs');

class Browser extends WhiteboardModule {
    get tagname() {
        return 'browser';
    }

    constructor(...args) {
        super(...args);
    }

    get_opts() {
        return {
            url: this.wbobj.text,
        };
    }
}

module.exports = Browser;
