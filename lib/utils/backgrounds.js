/*
    Hacky file that handles backgrounds, should be replaced when a more general
    configuration system is in place
*/

const { getStore } = require('./prefs.js');

const backgrounds = [
    {
        label: 'Light',
        color: 'black',
        css: `
            background:
                linear-gradient(45deg, hsla(177, 100%, 82%, 1) 0%, hsla(177, 100%, 82%, 0) 70%),
                linear-gradient(135deg, hsla(319, 98%, 87%, 1) 10%, hsla(319, 98%, 87%, 0) 80%),
                linear-gradient(225deg, hsla(77, 93%, 80%, 1) 10%, hsla(77, 93%, 80%, 0) 80%),
                linear-gradient(315deg, hsla(13, 98%, 80%, 1) 100%, hsla(13, 98%, 80%, 0) 70%);
        `,
    },

    {
        label: 'Dark',
        color: 'white',
        css: `
            background:
                linear-gradient(45deg, hsla(177, 100%, 2%, 1) 0%, hsla(177, 100%, 2%, 0) 70%),
                linear-gradient(135deg, hsla(319, 98%, 7%, 1) 10%, hsla(319, 98%, 7%, 0) 80%),
                linear-gradient(225deg, hsla(77, 93%, 5%, 1) 10%, hsla(77, 93%, 5%, 0) 80%),
                linear-gradient(315deg, hsla(13, 98%, 5%, 1) 100%, hsla(13, 98%, 5%, 0) 70%);
        `,
    },
    {
        label: 'White',
        color: 'black',
        css: `
            background: white;
        `,
    },

    {
        label: 'Black',
        color: 'white',
        css: `
            background: black;
        `,
    },

    {
        label: 'Abstract',
        color: 'black',
        css: `
            background: url("img/texture-1457346.jpg") center center fixed;
            background-size: cover;
        `,
    },

    {
        label: 'Vivid 1',
        color: 'white',
        css: `
            background:
                linear-gradient(45deg, hsla(148, 98%, 46%, 1) 0%, hsla(148, 98%, 46%, 0) 70%),
                linear-gradient(135deg, hsla(16, 98%, 42%, 1) 10%, hsla(16, 98%, 42%, 0) 80%),
                linear-gradient(225deg, hsla(91, 91%, 47%, 1) 10%, hsla(91, 91%, 47%, 0) 80%),
                linear-gradient(315deg, hsla(121, 92%, 47%, 1) 100%, hsla(121, 92%, 47%, 0) 70%);
        `,
    },


    {
        label: 'Vivid 2',
        color: 'white',
        css: `
            background:
                linear-gradient(45deg, hsla(311, 91%, 48%, 1) 0%, hsla(311, 91%, 48%, 0) 70%),
                linear-gradient(135deg, hsla(58, 100%, 45%, 1) 10%, hsla(58, 100%, 45%, 0) 80%),
                linear-gradient(225deg, hsla(306, 100%, 42%, 1) 10%, hsla(306, 100%, 42%, 0) 80%),
                linear-gradient(315deg, hsla(322, 100%, 45%, 1) 100%, hsla(322, 100%, 45%, 0) 70%);
        `,
    },

    {
        label: 'Vivid 3',
        color: 'white',
        css: `
            background:
                linear-gradient(45deg, hsla(227, 92%, 43%, 1) 0%, hsla(227, 92%, 43%, 0) 70%),
                linear-gradient(135deg, hsla(204, 97%, 46%, 1) 10%, hsla(204, 97%, 46%, 0) 80%),
                linear-gradient(225deg, hsla(257, 95%, 46%, 1) 10%, hsla(257, 95%, 46%, 0) 80%),
                linear-gradient(315deg, hsla(167, 92%, 50%, 1) 100%, hsla(167, 92%, 50%, 0) 70%);
        `,
    },

    {
        label: 'Vivid 4',
        color: 'white',
        css: `
            background:
                linear-gradient(45deg, hsla(33, 91%, 48%, 1) 0%, hsla(33, 91%, 48%, 0) 70%),
                linear-gradient(135deg, hsla(281, 92%, 44%, 1) 10%, hsla(281, 92%, 44%, 0) 80%),
                linear-gradient(225deg, hsla(70, 97%, 48%, 1) 10%, hsla(70, 97%, 48%, 0) 80%),
                linear-gradient(315deg, hsla(113, 92%, 49%, 1) 100%, hsla(113, 92%, 49%, 0) 70%);
        `,
    },
];

let currentBackground = null;
const SELECTORS = [
    'body',
    '.pane-fullscreen',
    'wb-slide-preview',
];

const SELECTORS_FG_ONLY = [
    'wb-markdown',
    'wb-markdown h1',
    'wb-markdown h2',
    'wb-markdown h3',
    'wb-markdown h4',
    'wb-markdown h5',
    'wb-markdown h6',
    'wb-markdown p',
    'wb-markdown blockquote',
];

const SELECTORS_PLAIN = [
    'wb-markdown code',
    'wb-markdown pre',
];

function getCSS(bgLabel) {
    const { css, color } = backgrounds
        .filter(({ label }) => label === bgLabel)[0];
    const bgProps = css.replace(/;/g, ' !important;');

    const reverseColor = color === 'black' ? 'white' : 'black';

    const colorProps = `
        color: ${color} !important;
    `;

    const plainProps = `
        color: ${color} !important;
        background: ${reverseColor} !important;
    `;

    const colorAndBGProps = `
        ${colorProps}
        ${bgProps}
    `;
    const both = `${SELECTORS.join(' , ')} { ${colorAndBGProps} }`;
    const colorOnly = `${SELECTORS_FG_ONLY.join(' , ')} { ${colorProps} }`;
    const plain = `${SELECTORS_PLAIN.join(' , ')} { ${plainProps} }`;

    return [both, colorOnly, plain].join('\n');
}

function refreshBackground(browserWindow) {
    if (currentBackground === null) {
        const store = getStore();
        currentBackground = store.get('background');
    }
    const css = getCSS(currentBackground);
    browserWindow.webContents.insertCSS(css);
}

function setBackground(browserWindow, bgLabel) {
    const store = getStore();
    store.set('background', bgLabel);
    currentBackground = bgLabel;
    refreshBackground(browserWindow);
}

function isCurrentBackground(label) {
    return currentBackground === label;
}

module.exports = {
    setBackground,
    isCurrentBackground,
    refreshBackground,
    backgroundLabels: backgrounds.map(({ label }) => label),
};
