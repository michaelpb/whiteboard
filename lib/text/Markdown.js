'use strict';

const {ModuleBase} = require('elmoed');
const marked = require('marked');

class Markdown extends ModuleBase {
    load(callback, text) {
        this.text = text;
        this.html = marked(text);
        callback();
    }

    getProps() {
        return {html: this.html};
    }
}

module.exports = Markdown;
