const TextBase = require('./TextBase');
const { minimarkdown } = require('../utils/markdown');

const { glyphIcon } = require('../utils');

class Title extends TextBase {
    getExtraMenu() {
        return [];
    }

    renderText(text) {
        return minimarkdown(text.trim());
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
        const clean = text.replace(/\W+/g, '');
        return `<span class='slide-preview-title'>${clean}</span>`;
    }
}

module.exports = Title;
