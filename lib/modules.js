const path = require('path');

const _st = p => path.resolve(__dirname, '..', 'static', p);
const _npm = p => path.resolve(__dirname, '..', 'node_modules', p);
const _preload = p => path.resolve(__dirname, '..', 'node_modules', p);

module.exports = {
    _preload: {
        html: [
            // _npm('xel/xel.min.html'),
        ],
        require: [
            'riot',
            path.resolve(__dirname, 'components/base.tag'),
            _npm("javascript-detect-element-resize/detect-element-resize"),
        ],
        css: [
            _st('css/reset.css'),
            _st('css/animate.css'),
            _st('css/materialize.custom.css'),
            _st('css/xterm.css'),
            _st('css/riot-mui.min.8801f89.css'),
            _st('css/workspace.css'),
            _st('css/linebar.css'),
            _st('css/darkroom.css'),
            _st('css/drawingboard.css'),
            // _npm('xel/stylesheets/macos.theme.css'),
        ],
        script: [
            _st('js/jquery-2.1.3.js.tweaked.js'),
            _st('js/materialize.js.tweaked.js'),
            _st('js/drawingboard.tweaked.js'),
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
