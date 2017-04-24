'use strict';

const {ModuleBase} = require('elmoed');

class Title extends ModuleBase {
    /*
    constructor(...args) {
        super(...args);
    }
    */

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
        const {text} = this;
        return {text};
    }
}

module.exports = Title;
