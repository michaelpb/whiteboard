

// TODO: rename file
const WhiteboardModule = require('../../lib/WhiteboardModule');

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
