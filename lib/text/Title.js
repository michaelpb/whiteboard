'use strict';

const {ModuleBase} = require('elmoed');

class Title extends ModuleBase {
    load(callback, text) {
        this.text = text;
        callback();
    }

    static get layout_hint() {
        return {
            prefer_top: true,
        }
    }

    getProps() {
        return {text: this.text};
    }
}

module.exports = Title;
