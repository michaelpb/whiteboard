const dialogs = require('./dialogs');
const { glyphIcon } = require('./utils.js');
const { backgroundLabels, setBackground, isCurrentBackground } = require('./backgrounds.js');

const NOOP = () => {};

let _recentSubmenu = null;

function makeBackgroundsSubmenu(windowInfo) {
    const { browserWindow } = windowInfo;
    const submenu = [];
    for (const label of backgroundLabels) {
        submenu.push({
            label,
            checked: isCurrentBackground(label),
            type: 'radio',
            click: () => {
                setBackground(browserWindow, label);
            },
        });
    }
    return submenu;
}

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


    // First time generating recent menu list
    if (_recentSubmenu === null) {
        _recentSubmenu = [];
        for (const { path, name } of dialogs.getRecentList()) {
            _recentSubmenu.push({
                label: name,
                click: () => {
                    manager.createWindow(path, NOOP);
                },
            });
        }
    }

    const unstableFeatures = [];

    if (process.env.WHITEBOARD_ENABLE_FOLDER_IMPORT) {
        unstableFeatures.push({
            label: 'Experimental import...',
            icon: glyphIcon('folder-open'),
            click: () => {
                dialogs.importDirectory(manager, defaultPath, NOOP);
            },
        });
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
                ...unstableFeatures,
                {
                    label: 'Open...',
                    icon: glyphIcon('folder-open'),
                    click: () => {
                        dialogs.loadDeck(manager, defaultPath, NOOP);
                    },
                },
                {
                    label: 'Recent',
                    submenu: _recentSubmenu,
                    enabled: _recentSubmenu.length > 1,
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
            label: 'View',
            submenu: [
                {
                    label: 'Theme',
                    submenu: makeBackgroundsSubmenu(windowInfo),
                },
                { type: 'separator' },
                {
                    icon: glyphIcon('zoom-in'),
                    role: 'zoomin',
                },
                {
                    icon: glyphIcon('zoom-out'),
                    role: 'zoomout',
                },
                {
                    role: 'resetzoom',
                },
            ],
        },
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
                    label: 'Help',
                    icon: glyphIcon('circle-help'),
                    click: () => {
                        manager.createWindow('--graphical-help', NOOP);
                    },
                },
                /*
                // Disabling because showing about window had bugs
                {
                    label: 'About',
                    click: () => {
                        dialogs.showAboutWindow(manager, windowInfo);
                    },
                },
                */
            ],
        },
    ];
}

module.exports = {
    makeGlobalMenuTemplate,
};
