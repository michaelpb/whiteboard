/* eslint-disable global-require */

const path = require('path');

const _static = p => path.resolve(__dirname, '..', 'static', p);
const _npm = p => path.resolve(__dirname, '..', 'node_modules', p);

const XEL_THEME = 'material';

module.exports = {
    _preload: {
        html: [
            _npm('xel/xel.min.html'),
        ],
        require: [
            _npm('riot'),
            path.resolve(__dirname, 'components/base.tag'),
            _npm('javascript-detect-element-resize/detect-element-resize'),
        ],
        css: [
            _static('css/reset.css'),
            _npm(`xel/stylesheets/${XEL_THEME}.theme.css`),
            _npm('medium-editor/dist/css/medium-editor.css'),
            _npm('medium-editor/dist/css/themes/beagle.css'),
            _static('css/xterm.css'),
            _static('css/global-whiteboard.css'),
            _static('css/markdown-prefixed.css'),
            _static('fonts/font.css'),
        ],
        script: [
            _npm('xterm/dist/xterm.js'),
            _npm('xterm/dist/addons/fit/fit.js'),
            _npm('xterm/dist/addons/fullscreen/fullscreen.js'),
            _npm('mousetrap/mousetrap.js'),
            _npm('ace-builds/src-noconflict/ace.js'),
            _npm('ace-builds/src-noconflict/ext-modelist.js'),
            _npm('medium-editor/dist/js/medium-editor.js'),
        ],
    },
    start: {
        module: require('./meta/Start'),
        tagname: 'wb-start',
        edits: ['--show-start'],
        _preload: { require: path.resolve(__dirname, 'meta/start.tag') },
    },

    help: {
        module: require('./meta/Start'),
        tagname: 'wb-help',
        edits: ['--graphical-help'],
        _preload: { require: path.resolve(__dirname, 'meta/help.tag') },
    },

    deck: {
        module: require('./deck/Deck'),
        tagname: 'wb-deck',
        edits: ['.whiteboard'],
        _preload: { require: path.resolve(__dirname, 'deck/deck.tag') },
    },
    slide: {
        module: require('./deck/Slide'),
        tagname: 'wb-slide',
        edits: ['!slide'],
        _preload: { require: path.resolve(__dirname, 'deck/slide.tag') },
    },
    title: {
        module: require('./text/Title'),
        tagname: 'wb-title',
        edits: ['!title'],
        _preload: { require: path.resolve(__dirname, 'text/title.tag') },
    },
    editor: {
        module: require('./editor/Editor'),
        tagname: 'wb-editor',
        edits: ['!editor'],
        _preload: { require: path.resolve(__dirname, 'editor/editor.tag') },
    },
    terminal: {
        module: require('./terminal/Terminal'),
        tagname: 'wb-terminal',
        edits: ['!terminal'],
        _preload: { require: path.resolve(__dirname, 'terminal/terminal.tag') },
    },
    markdown: {
        module: require('./text/Markdown'),
        tagname: 'wb-markdown',
        edits: ['!markdown'],
        _preload: { require: path.resolve(__dirname, 'text/markdown.tag') },
    },
    browser: {
        module: require('./browser/Browser'),
        tagname: 'wb-browser',
        edits: ['!browser'],
        _preload: { require: path.resolve(__dirname, 'browser/browser.tag') },
    },
};
