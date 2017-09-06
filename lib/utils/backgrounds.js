/*
Hacky file that handles backgrounds, should be replaced when a more general
configuration system is in place
*/


const backgrounds = [
    {
        label: 'Light colors',
        css: `
            color: black;
            background:
                linear-gradient(45deg, hsla(177, 100%, 82%, 1) 0%, hsla(177, 100%, 82%, 0) 70%),
                linear-gradient(135deg, hsla(319, 98%, 87%, 1) 10%, hsla(319, 98%, 87%, 0) 80%),
                linear-gradient(225deg, hsla(77, 93%, 80%, 1) 10%, hsla(77, 93%, 80%, 0) 80%),
                linear-gradient(315deg, hsla(13, 98%, 80%, 1) 100%, hsla(13, 98%, 80%, 0) 70%);
        `,
    },

    {
        label: 'Dark colors',
        css: `
            color: white;
            background:
                linear-gradient(45deg, hsla(177, 100%, 2%, 1) 0%, hsla(177, 100%, 2%, 0) 70%),
                linear-gradient(135deg, hsla(319, 98%, 7%, 1) 10%, hsla(319, 98%, 7%, 0) 80%),
                linear-gradient(225deg, hsla(77, 93%, 5%, 1) 10%, hsla(77, 93%, 5%, 0) 80%),
                linear-gradient(315deg, hsla(13, 98%, 5%, 1) 100%, hsla(13, 98%, 5%, 0) 70%);
        `,
    },
    {
        label: 'White',
        css: `
            color: black;
            background: white;
        `,
    },

    {
        label: 'Black',
        css: `
            color: white;
            background: black;
        `,
    },

    {
        label: 'Abstract',
        css: `
            color: black;
            background: url("img/texture-1457346.jpg") center center fixed;
            background-size: cover;
        `,
    },

    {
        label: 'Vivid 1',
        css: `
            color: white;
            background:
                linear-gradient(45deg, hsla(148, 98%, 46%, 1) 0%, hsla(148, 98%, 46%, 0) 70%),
                linear-gradient(135deg, hsla(16, 98%, 42%, 1) 10%, hsla(16, 98%, 42%, 0) 80%),
                linear-gradient(225deg, hsla(91, 91%, 47%, 1) 10%, hsla(91, 91%, 47%, 0) 80%),
                linear-gradient(315deg, hsla(121, 92%, 47%, 1) 100%, hsla(121, 92%, 47%, 0) 70%);
        `,
    },


    {
        label: 'Vivid 2',
        css: `
            color: white;
            background:
                linear-gradient(45deg, hsla(311, 91%, 48%, 1) 0%, hsla(311, 91%, 48%, 0) 70%),
                linear-gradient(135deg, hsla(58, 100%, 45%, 1) 10%, hsla(58, 100%, 45%, 0) 80%),
                linear-gradient(225deg, hsla(306, 100%, 42%, 1) 10%, hsla(306, 100%, 42%, 0) 80%),
                linear-gradient(315deg, hsla(322, 100%, 45%, 1) 100%, hsla(322, 100%, 45%, 0) 70%);
        `,
    },

    {
        label: 'Vivid 3',
        css: `
            color: white;
            background:
                linear-gradient(45deg, hsla(227, 92%, 43%, 1) 0%, hsla(227, 92%, 43%, 0) 70%),
                linear-gradient(135deg, hsla(204, 97%, 46%, 1) 10%, hsla(204, 97%, 46%, 0) 80%),
                linear-gradient(225deg, hsla(257, 95%, 46%, 1) 10%, hsla(257, 95%, 46%, 0) 80%),
                linear-gradient(315deg, hsla(167, 92%, 50%, 1) 100%, hsla(167, 92%, 50%, 0) 70%);
        `,
    },

    {
        label: 'Vivid 4',
        css: `
            color: white;
            background:
                linear-gradient(45deg, hsla(33, 91%, 48%, 1) 0%, hsla(33, 91%, 48%, 0) 70%),
                linear-gradient(135deg, hsla(281, 92%, 44%, 1) 10%, hsla(281, 92%, 44%, 0) 80%),
                linear-gradient(225deg, hsla(70, 97%, 48%, 1) 10%, hsla(70, 97%, 48%, 0) 80%),
                linear-gradient(315deg, hsla(113, 92%, 49%, 1) 100%, hsla(113, 92%, 49%, 0) 70%);
        `,
    },


];

let currentBackground = 'Light colors';
const SELECTORS = [
    'body',
    '.pane-fullscreen',
    'wb-slide-preview',
    /* 'wb-markdown', */
];

function getCSS(bgLabel) {
    const { css } = backgrounds.filter(({ label }) => label === bgLabel)[0];
    const importantProps = css.replace(/;/g, ' !important;');
    return `${SELECTORS.join(' , ')} { ${importantProps} }`;
}

function refreshBackground(browserWindow) {
    const css = getCSS(currentBackground);
    browserWindow.webContents.insertCSS(css);
}

function setBackground(browserWindow, bgLabel) {
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
