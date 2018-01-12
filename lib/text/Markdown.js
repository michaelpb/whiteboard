const TextBase = require('./TextBase');
const marked = require('marked');

const { glyphIcon } = require('../utils');
const dialogs = require('../utils/dialogs');
const { addEllipses } = require('../utils/markdown');

class Markdown extends TextBase {
    insertImage() {
        dialogs.openImage(this.manager, (path) => {
            this.send('insert', `<img src="file://${path}" />`);
        });
    }

    insertVideo() {
        dialogs.openVideo(this.manager, (path) => {
            const ext = path.split('.')[1];
            // TODO make more robust --^
            this.send('insert', `
                <video controls>
                    <source src="file://${path}" type="video/${ext}">
                    Video format (${ext}) not supported :(
                </video>
            `);
        });
    }

    getExtraMenu() {
        return [
            {
                label: 'Insert...',
                icon: glyphIcon('square-plus'),
                submenu: [
                    {
                        label: 'Image',
                        click: () => this.insertImage(),
                        icon: glyphIcon('layout-4'),
                    },
                    {
                        label: 'Video',
                        click: () => this.insertVideo(),
                        icon: glyphIcon('layout-4'),
                    },
                ],
            },
        ];
    }

    renderText(text) {
        return marked(text);
    }

    static getPNGIconPath() {
        return glyphIcon('align-left');
    }

    static getIconicPreview(text) {
        return addEllipses(text);
    }
}

Markdown.verbose_name = 'Content';
Markdown.prototype.verbose_name = 'Content';

module.exports = Markdown;
