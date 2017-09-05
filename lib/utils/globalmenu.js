const dialogs = require('./dialogs');
const { glyphIcon } = require('./utils.js');

const NOOP = () => {};

function makeGlobalMenuTemplate(
    windowInfo,
    manager,
    defaultPath,
    topLevelExtras = [],
    fileMenuExtras = [],
    helpExtras = [],
) {
    if (fileMenuExtras.length > 0) {
        // Add a separator after
        fileMenuExtras.unshift({ type: 'separator' });
    }

    return [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New...',
                    icon: glyphIcon('document-plus'),
                    click: () => {
                        dialogs.newDeck(manager, defaultPath, NOOP);
                    },
                },
                {
                    label: 'Import from directory...',
                    icon: glyphIcon('folder-search'),
                    click: () => {
                        dialogs.importDirectory(manager, defaultPath, NOOP);
                    },
                },
                {
                    label: 'Open...',
                    icon: glyphIcon('folder-open'),
                    click: () => {
                        dialogs.loadDeck(manager, defaultPath, NOOP);
                    },
                },
                ...fileMenuExtras,
                { type: 'separator' },
                {
                    label: 'Quit',
                    icon: glyphIcon('door'),
                    click: () => {
                        const { browserWindow } = windowInfo;
                        browserWindow.close();
                    },
                },
            ],
        },
        ...topLevelExtras,
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Debugging tools',
                    submenu: [
                        {
                            role: 'toggledevtools',
                        },
                    ],
                },
                { type: 'separator' },
                ...helpExtras,
                {
                    label: 'About',
                    icon: glyphIcon('circle-help'),
                    click: () => {
                        dialogs.showAboutWindow(manager, windowInfo);
                    },
                },
            ],
        },
    ];
}

module.exports = {
    makeGlobalMenuTemplate,
};
