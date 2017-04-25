'use strict';

const {ModuleBase} = require('elmoed');

class RawHtml extends ModuleBase {
    load(callback, text) {
        this.html = text;
        callback();
    }
    getProps() {
        return {html: this.html};
    }
}

module.exports = RawHtml;
