
const { mockWindowManager } = require('elmoed').testutils;
const { ModuleBase } = require('elmoed');
const Slide = require('../../lib/deck/Slide');

// Mostly just a stub of integrat-y unit tests for Slide

describe('Slide', () => {
    describe('when mounted', () => {
        let manager = null;
        let modules = null;

        beforeEach(() => {
            ({ manager, modules } = mockWindowManager('slide', Slide));

            modules.testpane = {
                module: class TestPane extends ModuleBase {},
                edits: ['!testpane'],
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
                expect(slide.getProps().maximizedPane).toEqual('pane_2');
                slide.toggleMaximize('testpane');
                expect(slide.maximizedPane).not.toBeTruthy();
                expect(slide.getProps().maximizedPane).not.toBeTruthy();
                done();
            }, { testpane: 'test' });
        });

        afterEach(() => {
            manager = null;
        });
    });

    describe('has a static function layoutRows which', () => {
        const { layoutRows } = Slide;
        // Dummy panes to layout
        const PANE_1 = { hint: {}, num: 1 };
        const PANE_2 = { hint: {}, num: 2 };
        const PANE_3 = { hint: {}, num: 3 };
        const PANE_4 = { hint: {}, num: 4 };
        const PANE_T1 = { hint: { prefer_top: true }, num: 5 };
        const PANE_T2 = { hint: { prefer_top: true }, num: 6 };
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
                    layout_hint: { prefer_top: true },
                },
                terminal: { getIconicPreview: () => '><' },
                editor: { getIconicPreview: () => '--' },
                html: {},
            }[typename]),
        };

        const paneTitle = {
            hint: { prefer_top: true },
            preview: '::test-title::',
        };
        const paneTerminal = { hint: {}, preview: '><' };
        const paneEditor = { hint: {}, preview: '--' };
        const paneHtml = {
            hint: {},
            preview: Slide.getDefaultIconicPreview('lol'),
        };

        const { layoutPanePreviews } = Slide;

        it('lays out a standard 3 pane vertical look', () => {
            expect(layoutPanePreviews(manager, {
                title: 'test-title',
                terminal: 'thing',
                editor: 'lol.js',
                layout: 'vertical',
            })).toEqual([
                { width: 100, height: 60, rowPanes: [paneTitle] },
                { width: 50, height: 40, rowPanes: [paneTerminal, paneEditor] },
            ]);
        });

        it('lays out a standard 3 pane horizontal (default) look', () => {
            expect(layoutPanePreviews(manager, {
                title: 'test-title',
                terminal: 'thing',
                html: 'lol',
            })).toEqual([
                { width: 100, height: 60, rowPanes: [paneTitle] },
                { width: 100, height: 20, rowPanes: [paneTerminal] },
                { width: 100, height: 20, rowPanes: [paneHtml] },
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

