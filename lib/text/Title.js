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

    static get_iconic_preview(text) {
        return `<span class='slide-preview-title'>${text}</span>`;
    }

    getProps() {
        return {text: this.text};
    }
}

module.exports = Title;
