const pathlib = require('path');

const dialogs = require('../utils/dialogs.js');

const { ModuleBase } = require('elmoed');

const { glyphIcon } = require('../utils');

class Browser extends ModuleBase {
    load(callback, text) {
        this.text = text;
        this.setupEvents();
        callback();
    }

    getFullURL() {
        const url = this.text;

        if (url === 'new browser') {
            // TODO: Add system of default values for panes, and of
            // about:whiteboardbrowser or something to clean this
            // 'new XYZ' nonsense up
            return url;
        }

        const lower = url.toLowerCase();
        if (lower.startsWith('http://')
                || lower.startsWith('https://')
                || lower.startsWith('file://')) {
            return url; // Already full / absolute URL
        }

        // Probably relative, turn it into a relative URL
        const basepath = pathlib.dirname(this.getRealPath());
        const path = pathlib.resolve(basepath, url);
        return `file://${path}`;
    }

    /*
    If the URL is a local file path, relativize it for saving, otherwise
    relativize it to the working directory
    */
    getRelativeURL() {
        const url = this.text;
        const lower = url.toLowerCase();
        if (!lower.startsWith('file://')) {
            return url; // Remote URL, no need to relativize
        }

        const abspath = url.substr(7);
        const basepath = pathlib.dirname(this.getRealPath());
        return pathlib.relative(basepath, abspath);
    }

    setupEvents() {
        this.on('navigation', (event, url) => {
            this.text = url;
        });

        this.on('open_file_dialog', () => {
            this.showOpenFileDialog();
        });

        this.on('navigation_force', (event, url) => {
            this.text = url;
            this.parentEditor.setPaneValue('browser', url);
        });
    }

    showOpenFileDialog() {
        const basepath = pathlib.dirname(this.getRealPath());
        dialogs.openHtml(this.manager, basepath, (newPath) => {
            this.text = newPath;
            this.parentEditor.setPaneValue('browser', newPath);
        });
    }

    getContextMenu() {
        return [
            {
                label: 'Open file...',
                icon: glyphIcon('folder-open'),
                click: () => this.showOpenFileDialog(),
            },
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
        return this.getRelativeURL();
    }

    static getPNGIconPath() {
        return glyphIcon('globe');
    }

    static getIconicPreview() {
        return '<img src="svg/si-glyph-globe.svg"/>';
    }

    getProps() {
        return { url: this.getFullURL() };
    }
}

module.exports = Browser;
