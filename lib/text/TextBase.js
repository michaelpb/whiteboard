const { ModuleBase } = require('elmoed');
const marked = require('marked');
const toMarkdown = require('to-markdown');

const { glyphIcon } = require('../utils');
const dialogs = require('../utils/dialogs');

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

class TextBase extends ModuleBase {
    load(callback, text) {
        this.text = text;
        this.locked = false;
        callback();
        this.setupEvents();
    }

    setupEvents() {
        this.on('changedHtml', (event, updatedHTML) => {
            this.text = toMarkdown(updatedHTML);
            console.log('text getting changed: ' + this.text);
        });
    }

    toggleLocked() {
        this.locked = !this.locked;
        this.update();
    }

    serialized() {
        return this.text;
    }

    getContextMenu() {
        const icon = this.locked ? 'lock' : 'lock-unlock';
        const label = this.locked ? 'Unlock text' : 'Lock text';
        return [
            {
                label,
                icon: glyphIcon(icon),
                accelerator: 'CommandOrControl+L',
                click: () => this.toggleLocked(),
            },
            ...this.getExtraMenu(),
        ];
    }

    getProps() {
        const { text, locked } = this;
        const html = marked(text);
        return { html, locked };
    }
}

module.exports = TextBase;
