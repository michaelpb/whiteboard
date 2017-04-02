'use strict';

// TODO: rename file
const WhiteboardModule = require('../../lib/ScrollObjectEditor');

const fs = require('fs');

class Whiteboard extends WhiteboardModule {
    get tagname() {
        return 'whiteboard';
    }

    constructor(...args) {
        super(...args);
    }

    get_opts() {
        return {
        };
    }
}

module.exports = Whiteboard;
