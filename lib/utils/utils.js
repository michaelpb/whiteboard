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

module.exports = {
    menuTemplateToShortcutArray,
    getStaticAssetPath,
    glyphIcon,
    bindShortcuts,
};
