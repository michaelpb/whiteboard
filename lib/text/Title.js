const { ModuleBase } = require('elmoed');

const { glyphIcon } = require('../utils');

class Title extends ModuleBase {
    load(callback, text) {
        this.text = text;
        callback();
    }

    static get layoutHint() {
        return {
            prefer_top: true,
        };
    }

    static getPNGIconPath() {
        return glyphIcon('remove');
    }

    static getIconicPreview(text) {
        return `<span class='slide-preview-title'>${text}</span>`;
    }

    getProps() {
        return { text: this.text };
    }
}

module.exports = Title;
