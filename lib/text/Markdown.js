const { ModuleBase } = require('elmoed');
const marked = require('marked');

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

class Markdown extends ModuleBase {
    load(callback, text) {
        this.text = text;
        this.html = marked(text);
        callback();
    }

    static getIconicPreview(text) {
        return addEllipses(text);
    }

    getProps() {
        return { html: this.html };
    }
}

module.exports = Markdown;
