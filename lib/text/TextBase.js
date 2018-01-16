const pathlib = require('path');

const { ModuleBase } = require('elmoed');
const toMarkdown = require('to-markdown');

const { glyphIcon } = require('../utils');
const { relativizeMarkdown, absolutizeHtml } = require('../utils/markdown');

class TextBase extends ModuleBase {
    load(callback, text) {
        this.text = text;
        this.locked = true;

        if (text.trim() === '') {
            // Start unlocked if empty
            this.locked = false;
        }
        this.setupEvents();
        callback();
    }

    setupEvents() {
        this.on('changedHtml', (event, updatedHTML) => {
            if (updatedHTML.includes('src="file://')) {
                const markdown = toMarkdown(updatedHTML);

                // Relativize image paths with one easy trick
                const dirPath = pathlib.dirname(this.getRealPath());
                this.text = relativizeMarkdown(dirPath, markdown);

                console.log(`text getting changed: ${this.text}`);
            }
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
        const relativeHtml = this.renderText(text);
        const dirPath = pathlib.dirname(this.getRealPath());

        // Ensure that 'file://./' gets translated to absolute relative paths
        const html = absolutizeHtml(dirPath, relativeHtml);
        return { html, locked };
    }
}

module.exports = TextBase;
