'use strict';


const marked = require('marked');

// TODO: rename file
const WhiteboardModule = require('../../lib/WhiteboardModule');

class Markdown extends WhiteboardModule {
    get tagname() {
        // Name of the .tag and channel this should use
        return 'markdown';
    }

    /*constructor(...args) {
        super(...args);
    }*/

    get_opts() {
        const html = marked(this.wbobj.text);
        return {html};
    }
}

module.exports = Markdown;
