'use strict';

const WhiteboardModule = require('../../lib/WhiteboardModule');

class Title extends WhiteboardModule {
    get tagname() {
        // Name of the .tag and channel this should use
        return 'title';
    }

    /*constructor(...args) {
        super(...args);
    }*/

    static get layout_hint() {
        return {
            prefer_top: true,
        }
    }

    get_opts() {
        return {
            text: this.wbobj.text,
        };
    }
}

module.exports = Title;
