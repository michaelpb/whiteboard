const TextBase = require('./TextBase');

const { glyphIcon } = require('../utils');

class Title extends TextBase {
    getExtraMenu() {
        return [];
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
}

module.exports = Title;
