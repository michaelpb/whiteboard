const { mockWindowManager } = require('elmoed').testutils;
const { ModuleBase } = require('elmoed');
const Slide = require('../../lib/deck/Slide');

// Integrat-y unit tests for Slide

describe('Slide', () => {
    // Patch to always make slides with internal ID of 1
    Slide.getNextSlideID = () => 'slide-1';

    describe('when mounted', () => {
        let manager = null;
        let modules = null;

        function isCustomContext(item) {
            return item.label === 'TEXTTEST';
        }

        function withLabel(label) {
            return item => item.label === label;
        }

        beforeEach(() => {
            ({ manager, modules } = mockWindowManager('slide', Slide));

            modules.testpane = {
                module: class TestPane extends ModuleBase {},
                edits: ['!testpane'],
            };

            modules.title = {
                module: class TitleTest extends ModuleBase {},
                edits: ['!title'],
            };

            class TextTest extends ModuleBase {
                getContextMenu() {
                    return [{ label: 'TEXTTEST' }];
                }
            }

            modules.text = {
                module: TextTest,
                edits: ['!text'],
            };
        });

        it('is successful when empty', (done) => {
            manager.createWindow('slide', (slide) => {
                expect(slide.panes.length).toEqual(0);
                expect(slide.info).toBeTruthy();
                done();
            }, {});
        });

        it('is successfull with a test-pane', (done) => {
            manager.createWindow('slide', (slide) => {
                expect(slide.panes.length).toEqual(1);
                expect(slide.info).toBeTruthy();
                done();
            }, { testpane: 'test' });
        });

        it('can toggle maximized pane', (done) => {
            manager.createWindow('slide', (slide) => {
                expect(slide.getMaximizedPaneID()).not.toBeTruthy();
                expect(slide.getProps().maximizedPane).not.toBeTruthy();
                slide.toggleMaximize('testpane');
                expect(slide.getProps().maximizedPane).toBeTruthy();
                expect(slide.getProps().maximizedPane).toEqual('slide-1_pane_testpane');
                slide.toggleMaximize('testpane');
                expect(slide.maximizedPane).not.toBeTruthy();
                expect(slide.getProps().maximizedPane).not.toBeTruthy();
                done();
            }, { testpane: 'test' });
        });

        it('can add a pane to an existing slide with expected default value', (done) => {
            manager.createWindow('slide', (slide) => {
                slide.addPane('title');
                expect(slide.panes.length).toEqual(2);
                expect(slide.slideData.title).toBeTruthy();
                expect(slide.slideData.title).toEqual(' ');
                done();
            }, { testpane: 'test' });
        });

        describe('after adding a set of panes', () => {
            let slide = null;
            beforeEach((done) => {
                manager.createWindow('slide', (newSlide) => {
                    slide = newSlide;
                    slide.addPane('text');
                    slide.mountPanes(); // this should not be an issue
                    slide.addPane('title');
                    slide.mountPanes();
                    done();
                }, { testpane: 'test' });
            });

            it('has an expected default layout', () => {
                // Ensure layout is vertical
                expect(slide.layout).toEqual('vertical');
                slide.info.layout = 'horizontal';
                expect(slide.layout).toEqual('horizontal');
            });

            it('generates expected number of panes', () => {
                // ensure works multiple times
                expect(slide.panes.length).toEqual(3);
                expect(slide.slideData.text).toBeTruthy();
                expect(slide.slideData.text).toEqual('new text');
            });

            it('mounts expected number of editors with expected IDs', () => {
                // ensure works multiple times
                expect(Object.keys(slide.paneEditors).length).toEqual(3);
                expect(new Set(Object.keys(slide.paneEditors)))
                    .toEqual(new Set([
                        'slide-1_pane_testpane',
                        'slide-1_pane_title',
                        'slide-1_pane_text',
                    ]));
            });

            it('uses makePaneMenu to make focused menu of pane', () => {
                // ensure works multiple times
                const editor = slide.paneEditors['slide-1_pane_title'];
                let menu = slide.makePaneMenu(editor, true);
                expect(menu.length).toEqual(3);

                // unfocused
                menu = slide.makePaneMenu(editor, false);
                expect(menu.length).toEqual(2);
            });

            it('can delete panes with deletePane', () => {
                // ensure works multiple times
                expect(slide.panes.length).toEqual(3);
                slide.deletePane('text');
                expect(slide.panes.length).toEqual(2);
                expect(slide.slideData.text).not.toBeTruthy();
            });

            it('cannot delete last pane with deletePane', () => {
                // ensure works multiple times
                expect(slide.panes.length).toEqual(3);
                slide.deletePane('text');
                slide.deletePane('title');
                expect(() => slide.deletePane('testpane')).toThrow();
            });

            it('uses makePaneMenu to make custom menu of pane', () => {
                // ensure works multiple times
                const editor = slide.paneEditors['slide-1_pane_text'];
                const menu = slide.makePaneMenu(editor, false);
                expect(menu.length).toEqual(3);

                // check it includes the custom thing
                expect(menu.filter(withLabel('TEXTTEST')))
                    .toEqual([{ label: 'TEXTTEST' }]);
            });

            it('uses makeMenu to create full menus', () => {
                // ensure works multiple times
                const editor = slide.paneEditors['slide-1_pane_text'];
                const {
                    globalMenuTemplate,
                    contextMenuTemplate,
                } = slide.makeMenu(editor);

                // check it includes the custom thing
                expect(contextMenuTemplate.filter(isCustomContext))
                    .toEqual([{ label: 'TEXTTEST' }]);
                expect(globalMenuTemplate.filter(isCustomContext))
                    .toEqual([{ label: 'TEXTTEST' }]);
                expect(globalMenuTemplate.filter(withLabel('Layout')).length)
                    .toEqual(1);
                expect(globalMenuTemplate.filter(withLabel('Slide')).length)
                    .toEqual(1);
                expect(globalMenuTemplate.filter(withLabel('Text')).length)
                    .toEqual(1);
                expect(globalMenuTemplate.filter(withLabel('Testpane')).length)
                    .toEqual(1);
                expect(globalMenuTemplate.filter(withLabel('Add pane')).length)
                    .toEqual(1);
                expect(contextMenuTemplate.filter(withLabel('Testpane')).length)
                    .toEqual(0);
                expect(contextMenuTemplate.filter(withLabel('Text')).length)
                    .toEqual(1);
                expect(globalMenuTemplate.length).toBeGreaterThan(13);
            });
        });

        afterEach(() => {
            manager = null;
        });
    });

    describe('has a static function layoutRows which', () => {
        const { layoutRows } = Slide;
        // Dummy panes to layout
        const PANE_1 = { hint: {}, num: 1, typename: 'a' };
        const PANE_2 = { hint: {}, num: 2, typename: 'b' };
        const PANE_3 = { hint: {}, num: 3, typename: 'c' };
        const PANE_4 = { hint: {}, num: 4, typename: 'd' };
        const PANE_T1 = { hint: { prefer_top: true }, num: 5, typename: 'e' };
        const PANE_T2 = { hint: { prefer_top: true }, num: 6, typename: 'f' };
        it('lays out an empty list', () => {
            expect(layoutRows('grid', [])).toEqual([]);
            expect(layoutRows('vertical', [])).toEqual([]);
            expect(layoutRows('horizontal', [])).toEqual([]);
        });

        it('lays out a standard 3 pane vertical look', () => {
            expect(layoutRows('vertical', [PANE_1, PANE_2, PANE_T1])).toEqual([
                { width: 100, height: 10, rowPanes: [PANE_T1] },
                { width: 50, height: 90, rowPanes: [PANE_1, PANE_2] },
            ]);
        });

        it('lays out a standard 3 pane grid look', () => {
            expect(layoutRows('grid', [PANE_1, PANE_2, PANE_T1])).toEqual([
                { width: 100, height: 10, rowPanes: [PANE_T1] },
                { width: 50, height: 90, rowPanes: [PANE_1, PANE_2] },
            ]);
        });

        it('lays out a standard 3 pane horizontal look', () => {
            expect(layoutRows('horizontal', [PANE_1, PANE_2, PANE_T1])).toEqual([
                { width: 100, height: 10, rowPanes: [PANE_T1] },
                { width: 100, height: 45, rowPanes: [PANE_1] },
                { width: 100, height: 45, rowPanes: [PANE_2] },
            ]);
        });

        it('lays out a 6 pane horizontal look', () => {
            expect(layoutRows('horizontal', [
                PANE_1, PANE_2, PANE_3, PANE_4, PANE_T1, PANE_T2,
            ])).toEqual([
                { width: 100, height: 10, rowPanes: [PANE_T1] },
                { width: 100, height: 10, rowPanes: [PANE_T2] },
                { width: 100, height: 20, rowPanes: [PANE_1] },
                { width: 100, height: 20, rowPanes: [PANE_2] },
                { width: 100, height: 20, rowPanes: [PANE_3] },
                { width: 100, height: 20, rowPanes: [PANE_4] },
            ]);
        });

        it('lays out a 5 pane grid', () => {
            expect(layoutRows('grid', [
                PANE_1, PANE_2, PANE_3, PANE_4, PANE_T1,
            ])).toEqual([
                { width: 100, height: 10, rowPanes: [PANE_T1] },
                { width: 50, height: 45, rowPanes: [PANE_1, PANE_2] },
                { width: 50, height: 45, rowPanes: [PANE_3, PANE_4] },
            ]);
        });

        it('ignores fake panes', () => {
            const MAX_SIZE = { hint: {}, num: 99, typename: 'maximizedPane' };
            expect(layoutRows('horizontal', [PANE_T1, MAX_SIZE])).toEqual([
                { width: 100, height: 100, rowPanes: [PANE_T1] },
            ]);
        });

        it('lays out a single title', () => {
            expect(layoutRows('horizontal', [PANE_T1])).toEqual([
                { width: 100, height: 100, rowPanes: [PANE_T1] },
            ]);
        });
    });

    describe('has a static function layoutPanePreviews which', () => {
        const manager = {
            getEditorClass: typename => ({
                title: {
                    getIconicPreview: text => `::${text}::`,
                    layoutHint: { prefer_top: true },
                },
                terminal: { getIconicPreview: () => '><' },
                editor: { getIconicPreview: () => '--' },
                rawhtml: {},
            }[typename]),
        };

        const paneTitle = {
            hint: { prefer_top: true },
            preview: '::test-title::',
            typename: 'title',
        };
        const paneTerminal = { hint: {}, preview: '><', typename: 'terminal' };
        const paneEditor = { hint: {}, preview: '--', typename: 'editor' };
        const paneHtml = {
            hint: {},
            preview: Slide.getDefaultIconicPreview('lol'),
            typename: 'rawhtml',
        };

        const { layoutPanePreviews, sortPanes } = Slide;

        it('sorts panes', () => {
            expect(sortPanes([
                paneTerminal,
                paneTitle,
                paneHtml,
                paneEditor,
            ])).toEqual([
                paneTitle,
                paneHtml,
                paneEditor,
                paneTerminal,
            ]);
        });

        it('lays out a standard 3 pane vertical look', () => {
            expect(layoutPanePreviews(manager, {
                title: 'test-title',
                terminal: 'thing',
                editor: 'lol.js',
                layout: 'vertical',
            })).toEqual([
                { width: 100, height: 60, rowPanes: [paneTitle] },
                { width: 50, height: 40, rowPanes: [paneEditor, paneTerminal] },
            ]);
        });

        it('lays out a standard 3 pane horizontal (default) look', () => {
            expect(layoutPanePreviews(manager, {
                title: 'test-title',
                terminal: 'thing',
                rawhtml: 'lol',
            })).toEqual([
                { width: 100, height: 60, rowPanes: [paneTitle] },
                { width: 100, height: 20, rowPanes: [paneHtml] },
                { width: 100, height: 20, rowPanes: [paneTerminal] },
            ]);
        });

        it('lays out a single title', () => {
            expect(layoutPanePreviews(manager, { title: 'test-title' }))
                .toEqual([
                    { width: 100, height: 100, rowPanes: [paneTitle] },
                ]);
        });
    });
});

