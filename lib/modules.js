module.exports = {
    types: {
        deck: {
            path: 'deck/deck',
            tagname: 'deck',
        },
        slide: {
            path: 'deck/slide',
            tagname: 'slide',
        },
        title: {
            path: 'text/title',
            tagname: 'titlepane',
        },
        markdown: {
            path: 'text/markdown',
            tagname: 'markdown',
        },
        html: {
            path: 'text/html',
            tagname: 'htmlpane',
        },
        terminal: {
            path: 'terminal/terminal',
            tagname: 'terminal',
        },
        editor: {
            path: 'editor/editor',
            tagname: 'editor',
        },
        whiteboard: {
            path: 'graphics/whiteboard',
            tagname: 'whiteboard',
        },
        browser: {
            path: 'browser/browser',
            tagname: 'browser',
        },
    },
};

const path = require('path');

module.exports = {
    deck: {
        module: require('./deck/Deck'),
        tagname: 'deck',
        edits: ['.whiteboard'],
        _include: {require: path.resolve(__dirname, 'deck/deck.tag')},
    },
    slide: {
        path: require('./deck/Slide'),
        tagname: 'slide',
        edits: ['!slide'],
        _include: {require: path.resolve(__dirname, 'slide/slide.tag')},
    },
    /*
    text: {
        module: require('./TextEditor'),
        tagname: 'text-editor',
        edits: ['.txt'],
        _include: {head: path.resolve(__dirname, 'text-editor.html')},
    },
    image: {
        module: require('./ImageEditor'),
        tagname: 'image-editor',
        edits: ['.png'],
        _include: {head: path.resolve(__dirname, 'image-editor.html')},
    },
    multiedit: {
        module: require('./MultiEditor'),
        tagname: 'multi-editor',
        edits: ['manifest.json'],
        _include: {head: path.resolve(__dirname, 'multi-editor.html')},
    },
    */
};

