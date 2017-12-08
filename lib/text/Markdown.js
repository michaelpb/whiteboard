const { ModuleBase } = require('elmoed');
const TextBase = require('./TextBase');
const marked = require('marked');
const toMarkdown = require('to-markdown');

const { glyphIcon } = require('../utils');

const MAX_PREVIEW_SIZE = 50;

function addEllipses(text) {
    const alphanum = text
        .replace(/\s+/gi, ' ')
        .replace(/\([^)]+\)/gi, '') // remove everything in parens (e.g links)
        .replace(/[^0-9a-z ]/gi, '')
        .trim();
    if (alphanum.length < MAX_PREVIEW_SIZE) {
        return alphanum;
    }
    return `${alphanum.slice(0, MAX_PREVIEW_SIZE - 3)}&#8230;`;
}

class Markdown extends TextBase {
    static getPNGIconPath() {
        return glyphIcon('align-left');
    }

    static getIconicPreview(text) {
        return addEllipses(text);
    }
}

module.exports = Markdown;
