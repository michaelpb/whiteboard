const pathlib = require('path');
const globalMousetrap = require('mousetrap');

function menuTemplateToShortcutArray(menuTemplate, array = []) {
    for (const { submenu, accelerator, click } of menuTemplate) {
        if (submenu) {
            menuTemplateToShortcutArray(submenu, array);
            continue;
        }

        if (!accelerator || !click) {
            continue;
        }

        array.push([
            accelerator.replace('CommandOrControl', 'ctrl').toLowerCase(),
            click,
        ]);
    }
    return array;
}

/*
Wraps around MouseTrap to bind the global keyboard shortcuts, first resetting
everything

Optional mousetrap argument for mocking
*/
function bindShortcuts(shortcuts, editor, mousetrap = globalMousetrap) {
    const { globalShortcut } = editor.manager.electron;
    globalShortcut.unregisterAll();
    if (!mousetrap.reset) {
        console.error('WARNING: Mousetrap not finding window object');
        return;
    }
    mousetrap.reset();
    for (let [combos, func] of shortcuts) {
        if (!Array.isArray(combos)) {
            combos = [combos];
        }

        for (const combo of combos) {
            // Make mac friendly
            if (combo.startsWith('ctrl')) {
                combos.push(combo.replace('ctrl', 'command'));
            }
        }
        func = func.bind(editor);
        mousetrap.bind(combos, func);
    }
}

function getStaticAssetPath(...args) {
    return pathlib.resolve(__dirname, '..', '..', 'static', ...args);
}

const glyphIcon = name => getStaticAssetPath('png', `si-glyph-${name}.png`);


const currentCounts = {};
function uniqueCount(str = '') {
    if (!(str in currentCounts)) {
        currentCounts[str] = 0;
    }
    currentCounts[str] += 1;
    if (str !== '') {
        return `${str}-${currentCounts[str]}`;
    }
    return currentCounts[str];
}

const END_TO_END_FILE = 'whiteboard/spec/support/data/kitchen-sink/ks.whiteboard';
function checkIfDeckIsTestDeck(deck) {
    return deck.path.endsWith(END_TO_END_FILE);
}

module.exports = {
    menuTemplateToShortcutArray,
    getStaticAssetPath,
    glyphIcon,
    bindShortcuts,
    uniqueCount,
    checkIfDeckIsTestDeck,
};
