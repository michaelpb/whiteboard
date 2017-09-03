const path = require('path');
const { mockObject, mockMethod } = require('magicmock');

const DATA_DIR = path.resolve(__dirname, '..', 'support', 'data', 'input-dir');

const {
    autogenerateDeckFromDir,
    pathToTitle,
    knownCodeFileExtensions,
    isCodeFile,
    menuTemplateToShortcutArray,
    bindShortcuts,
    stripMenuTemplate,
    flattenMenuTemplate
} = require('../../lib/utils');

describe('utils module', () => {
    describe('has a menuTemplateToShortcutArray function that', () => {
        function save() {}
        function open() {}
        function help() {}

        const simpleMenu = [
            {
                label: 'Save',
                accelerator: 'CommandOrControl+S',
                click: save,
            },
            {
                label: 'Help',
                accelerator: 'F1',
                click: help,
            },
            { type: 'seperator' },
            {
                label: 'Open...',
                accelerator: 'CommandOrControl+O',
                click: open,
            },
        ];

        const subMenu = [
            {
                label: 'File...',
                accelerator: 'CommandOrControl+F',
                submenu: simpleMenu,
            },
        ];

        const expected = [
            ['ctrl+s', save],
            ['f1', help],
            ['ctrl+o', open],
        ];

        it('exists', () => {
            expect(menuTemplateToShortcutArray).toBeTruthy();
        });

        it('works with empty case', () => {
            expect(menuTemplateToShortcutArray([])).toEqual([]);
        });

        it('extracts accelerators from a simple menu template ', () => {
            expect(menuTemplateToShortcutArray(simpleMenu)).toEqual(expected);
        });

        it('extracts accelerators from a sub menu template ', () => {
            expect(menuTemplateToShortcutArray(subMenu)).toEqual(expected);
        });
    });

    describe('has a bindShortcuts function that', () => {
        function mockEditorAndMousetrap() {
            const mousetrap = mockObject();
            const editor = mockObject();
            editor.manager = mockObject();
            editor.manager.electron = mockObject();
            editor.manager.electron.globalShortcut = mockObject();
            return { mousetrap, editor };
        }

        it('exists', () => {
            expect(bindShortcuts).toBeTruthy();
        });

        it('binds empty shortcuts as expected using mousetrap', () => {
            const { mousetrap, editor } = mockEditorAndMousetrap();
            bindShortcuts([], editor, mousetrap);
            expect(mousetrap.reset.called()).toBeTruthy();
            const { globalShortcut } = editor.manager.electron;
            expect(globalShortcut.unregisterAll.called()).toBeTruthy();
            expect(mousetrap.bind.called()).not.toBeTruthy();
        });

        it('binds a list of shortcuts', () => {
            const { mousetrap, editor } = mockEditorAndMousetrap();
            bindShortcuts([
                ['ctrl+i', mockMethod()],
                ['f2', mockMethod()],
            ], editor, mousetrap);
            expect(mousetrap.reset.called()).toBeTruthy();
            const { globalShortcut } = editor.manager.electron;
            expect(globalShortcut.unregisterAll.called()).toBeTruthy();
            expect(mousetrap.bind.callCount()).toEqual(2);
            expect(mousetrap.bind.getInvocationHistory()[0][0])
                .toEqual(['ctrl+i', 'command+i']);
            expect(mousetrap.bind.getInvocationHistory()[1][0])
                .toEqual(['f2']);
        });
    });

    describe('has a pathToTitle function that', () => {
        it('exists', () => {
            expect(pathToTitle).toBeTruthy();
        });

        it('converts simple paths to a title', () => {
            expect(pathToTitle('this/is/some/path'))
                .toEqual('this - is - some - path');
            expect(pathToTitle('05-Demo/Start'))
                .toEqual('Demo - Start');
        });

        it('splits camel case', () => {
            expect(pathToTitle('5-DemoStart'))
                .toEqual('Demo Start');
            expect(pathToTitle('5-DemoStart/Another_CamelCase____Thing'))
                .toEqual('Demo Start - Another Camel Case Thing');
        });
    });

    describe('has a list of known code files that', () => {
        it('exists', () => {
            expect(knownCodeFileExtensions).toBeTruthy();
            expect(knownCodeFileExtensions.length > 10).toBeTruthy();
        });

        it('contains some well known ones', () => {
            expect(knownCodeFileExtensions.includes('js')).toBeTruthy();
            expect(knownCodeFileExtensions.includes('html')).toBeTruthy();
            expect(knownCodeFileExtensions.includes('py')).toBeTruthy();
            expect(knownCodeFileExtensions.includes('^dockerfile')).toBeTruthy();
        });
    });

    describe('has a function for guessing if a file is a code file that', () => {
        it('exists', () => {
            expect(isCodeFile).toBeTruthy();
        });

        it('checks a few common file types', () => {
            expect(isCodeFile('my/file/path.md')).toBeTruthy();
            expect(isCodeFile('my/file/path.JS')).toBeTruthy();
        });

        it('checks extensionless files', () => {
            expect(isCodeFile('asdfaasd')).not.toBeTruthy();
            expect(isCodeFile('Dockerfile')).toBeTruthy();
            expect(isCodeFile('some/path/to/makefile')).toBeTruthy();
        });
    });

    describe('has a function for stripping items from menu templates', () => {
        it('exists', () => {
            expect(stripMenuTemplate).toBeTruthy();
        });

        it('works with empty array', () => {
            expect(stripMenuTemplate([])).toEqual([]);
        });

        it('works with un-nested array', () => {
            expect(stripMenuTemplate([
                    { key: 'a', accelerator: 'thing' },
                    { key: 'b', accelerator: 'thing2' },
                ], 'accelerator'))
                .toEqual([ { key: 'a' }, { key: 'b' } ]);
        });

        it('works with nested array', () => {
            expect(stripMenuTemplate([
                    {
                        key: 'a',
                        submenu: [ { key: 'lol', accelerator: 'lol' } ],
                    },
                    {
                        key: 'b',
                        accelerator: 'thing2',
                    },
                ], 'accelerator'))
                .toEqual([
                    {
                        key: 'a',
                        submenu: [
                            { key: 'lol' },
                        ],
                    },
                    { key: 'b' },
                ]);
        });
    });

    describe('has a function flattenMenuTemplate which', () => {
        const input = {
            label: 'Next',
            accelerator: 'CommandOrControl+Right',
            icon: 'test/icon.png',
            otherStuff: 'lol',
        };
        const inputArray = [
            Object.assign({}, input),
            Object.assign({}, input),
            Object.assign({
                submenu: [
                    Object.assign({}, input),
                    Object.assign({}, input),
                ],
            }, input),
        ];

        const output = Object.assign({}, input);
        delete output['otherStuff']
        delete output['accelerator']
        const outputArray = [
            Object.assign({}, output),
            Object.assign({}, output),
            Object.assign({}, output),
            Object.assign({}, output),
        ];

        it('exists', () => {
            expect(flattenMenuTemplate).toBeTruthy();
        });

        it('can handle an empty array', () => {
            expect(flattenMenuTemplate([])).toEqual([]);
        });

        it('can handle a nested array while plucking values', () => {
            const flat = flattenMenuTemplate(inputArray, 'label', 'icon');
            expect(flat).toEqual(outputArray);
        });
    });

    describe('has a function for generating decks from a dir that', () => {
        it('exists', () => {
            expect(autogenerateDeckFromDir).toBeTruthy();
        });

        it('generates an expected deck from a simple input dir', () => {
            const deckList = autogenerateDeckFromDir(`${DATA_DIR}/simple/`);
            expect(deckList.length).toEqual(1);
            const slide = deckList[0];
            expect(slide.editor).toContain('02-AnotherExample.html');
            expect(slide.editor).toContain('test.html');
            expect(slide.browser).toBeTruthy();
            expect(slide.browser).toContain('.html');
            expect(slide.browser).toContain('file:///');
            expect(slide.terminal).not.toBeTruthy();
            expect(slide.title).toEqual('simple');
        });

        it('generates an expected deck from a complex input dir', () => {
            const deckList = autogenerateDeckFromDir(`${DATA_DIR}/complex/`);
            expect(deckList.length).toEqual(5);
            let slide = deckList[0];
            expect(slide.title).toEqual('First');
            expect(slide.editor).toContain('outer.js');
            expect(slide.browser).not.toBeTruthy();
            expect(slide.terminal).toContain('01-First');
            expect(slide.markdown).toBeTruthy();
            expect(slide.markdown).toContain('i am markdown');
            slide = deckList[1];
            expect(slide.title).toEqual('Second Thing');
            expect(slide.editor).toContain('outer-second.js');
            expect(slide.browser).not.toBeTruthy();
            expect(slide.terminal).toContain('02-SecondThing');
            slide = deckList[2];
            expect(slide.title).toEqual('Third thing');
            expect(slide.editor).toContain('outer.js');
            expect(slide.browser).not.toBeTruthy();
            expect(slide.terminal).toContain('03-Third_thing');
            slide = deckList[3];
            expect(slide.title).toEqual('Third thing - Demo');
            expect(slide.editor).toContain('test-solved.html');
            expect(slide.browser).toBeTruthy();
            slide = deckList[4];
            expect(slide.title).toEqual('Third thing - Example');
            expect(slide.editor).toContain('test-unsolved.html');
            expect(slide.browser).toBeTruthy();
        });
    });
});
