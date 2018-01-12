const TextBase = require('./TextBase');
const { minimarkdown, cleanMinimarkdown } = require('../utils/markdown');

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
        const clean = cleanMinimarkdown(text);
        return `<span class='slide-preview-title'>${clean}</span>`;
    }
}

module.exports = Title;
