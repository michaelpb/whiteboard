const path = require('path');

const _st = p => path.resolve(__dirname, '..', 'static', p);
const _npm = p => path.resolve(__dirname, '..', 'node_modules', p);
const _preload = p => path.resolve(__dirname, '..', 'node_modules', p);

const XEL_THEME = 'material'; // TODO: switch to macOS on mac

module.exports = {
    _preload: {
        html: [
            _npm('xel/xel.min.html'),
        ],
        require: [
            'riot',
            path.resolve(__dirname, 'components/base.tag'),
            _npm("javascript-detect-element-resize/detect-element-resize"),
        ],
        css: [
            _st('css/reset.css'),
            _npm(`xel/stylesheets/${XEL_THEME}.theme.css`),
            // TODO: material.theme.css messes up with xterm's CSS slightly, causing high line heights
            _st('css/xterm.css'),
            _st('css/global-whiteboard.css'),
        ],
        script: [
            _npm('xterm/dist/xterm.js'),
            _npm("xterm/dist/addons/fit/fit.js"),
            _npm("xterm/dist/addons/fullscreen/fullscreen.js"),
            _npm("mousetrap/mousetrap.js"),
            _npm("ace-builds/src-noconflict/ace.js"),
            _npm("ace-builds/src-noconflict/ext-modelist.js"),
        ],
    }, // ensure riot & co gets included right away

    deck: {
        module: require('./deck/Deck'),
        tagname: 'wb-deck',
        edits: ['.whiteboard'],
        _preload: {require: path.resolve(__dirname, 'deck/deck.tag')},
    },
    slide: {
        module: require('./deck/Slide'),
        tagname: 'wb-slide',
        edits: ['!slide'],
        _preload: {require: path.resolve(__dirname, 'deck/slide.tag')},
    },
    title: {
        module: require('./text/Title'),
        tagname: 'wb-title',
        edits: ['!title'],
        _preload: {require: path.resolve(__dirname, 'text/title.tag')},
    },
    editor: {
        module: require('./editor/Editor'),
        tagname: 'wb-editor',
        edits: ['!editor'],
        _preload: {require: path.resolve(__dirname, 'editor/editor.tag')},
    },
    terminal: {
        module: require('./terminal/Terminal'),
        tagname: 'wb-terminal',
        edits: ['!terminal'],
        _preload: {require: path.resolve(__dirname, 'terminal/terminal.tag')},
    },
    markdown: {
        module: require('./text/Markdown'),
        tagname: 'wb-markdown',
        edits: ['!markdown'],
        _preload: {require: path.resolve(__dirname, 'text/markdown.tag')},
    },
    rawhtml: {
        module: require('./text/RawHtml'),
        tagname: 'wb-rawhtml',
        edits: ['!html'],
        _preload: {require: path.resolve(__dirname, 'text/rawhtml.tag')},
    },
};

/*
whiteboard: {
    path: 'graphics/whiteboard',
    tagname: 'whiteboard',
},
browser: {
    path: 'browser/browser',
    tagname: 'browser',
},
*/