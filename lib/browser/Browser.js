const { ModuleBase } = require('elmoed');

const { glyphIcon } = require('../utils');

class Browser extends ModuleBase {
    load(callback, text) {
        this.text = text;
        this.setupEvents();
        callback();
    }

    setupEvents() {
        this.on('navigation', (event, url) => {
            this.text = url;
        });

        this.on('navigation_force', (event, url) => {
            this.text = url;
            this.parentEditor.setPaneValue('browser', url);
        });
    }

    getContextMenu() {
        return [
            {
                label: 'Back',
                icon: glyphIcon('arrow-left'),
                click: () => this.send('trigger_back'),
            },
            {
                label: 'Forward',
                icon: glyphIcon('arrow-right'),
                click: () => this.send('trigger_forward'),
            },
            {
                label: 'Refresh',
                icon: glyphIcon('arrow-reload'),
                accelerator: 'CommandOrControl+R',
                click: () => this.send('trigger_refresh'),
            },
        ];
    }

    serialized() {
        return this.text;
    }

    static getPNGIconPath() {
        return glyphIcon('globe');
    }

    static getIconicPreview() {
        return '<img src="svg/si-glyph-globe.svg"/>';
    }

    getProps() {
        return { url: this.text };
    }
}

module.exports = Browser;
