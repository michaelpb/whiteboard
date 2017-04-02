'use strict';

// TODO: rename file
const WhiteboardModule = require('../../lib/WhiteboardModule');

class HTML extends WhiteboardModule {
    get tagname() {
        // Name of the .tag and channel this should use
        return 'html';
    }

    /*constructor(...args) {
        super(...args);
    }*/

    get_opts() {
        return {
            html: this.wbobj.text,
        };
    }
}

module.exports = HTML;
