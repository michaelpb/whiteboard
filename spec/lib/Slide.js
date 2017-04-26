'use strict';
const {strip, mockWindowManager, deregister} = require('elmoed').testutils;
const {ModuleBase} = require('elmoed');
const Slide = require('../../lib/deck/Slide');

// Mostly just a stub of integrat-y unit tests for Slide

describe('Slide', () => {
    describe('when mounted', () => {
        let manager = null;
        let modules = null;

        beforeEach(() => {
            ({manager, modules} = mockWindowManager('slide', Slide));

            modules.testpane = {
                module: class TestPane extends ModuleBase {},
                edits: ['!testpane'],
            };
        });


        it('is successful when empty', (done) => {
            manager.createWindow('slide', slide => {
                expect(slide.panes.length).toEqual(0);
                expect(slide.info).toBeTruthy();
                done();
            }, {});
        });

        it('is successfull with a test-pane', (done) => {
            manager.createWindow('slide', slide => {
                expect(slide.panes.length).toEqual(1);
                expect(slide.info).toBeTruthy();
                done();
            }, {testpane: 'test'});
        });

        afterEach(() => {
            manager = null;
        });
    });

    describe('has a static function layout_rows which', () => {
        const {layout_rows} = Slide;
        // Dummy panes to layout
        const PANE_1 = {hint: {}, num: 1};
        const PANE_2 = {hint: {}, num: 2};
        const PANE_3 = {hint: {}, num: 3};
        const PANE_4 = {hint: {}, num: 4};
        const PANE_T1 = {hint: {prefer_top: true}, num: 5};
        const PANE_T2 = {hint: {prefer_top: true}, num: 6};
        it('lays out an empty list', () => {
            expect(layout_rows('grid', [])).toEqual([]);
            expect(layout_rows('vertical', [])).toEqual([]);
            expect(layout_rows('horizontal', [])).toEqual([]);
        });

        it('lays out a standard 3 pane vertical look', () => {
            expect(layout_rows('vertical', [ PANE_1, PANE_2, PANE_T1, ])).toEqual([
                { width: 100, height: 10, row_panes: [PANE_T1], },
                { width: 50, height: 90, row_panes: [PANE_1, PANE_2], },
            ]);
        });

        it('lays out a standard 3 pane grid look', () => {
            expect(layout_rows('grid', [ PANE_1, PANE_2, PANE_T1, ])).toEqual([
                { width: 100, height: 10, row_panes: [PANE_T1], },
                { width: 50, height: 90, row_panes: [PANE_1, PANE_2], },
            ]);
        });

        it('lays out a standard 3 pane horizontal look', () => {
            expect(layout_rows('horizontal', [ PANE_1, PANE_2, PANE_T1, ])).toEqual([
                { width: 100, height: 10, row_panes: [PANE_T1], },
                { width: 100, height: 45, row_panes: [PANE_1], },
                { width: 100, height: 45, row_panes: [PANE_2], },
            ]);
        });

        it('lays out a 6 pane horizontal look', () => {
            expect(layout_rows('horizontal', [
                PANE_1, PANE_2, PANE_3, PANE_4, PANE_T1, PANE_T2,
            ])).toEqual([
                { width: 100, height: 10, row_panes: [PANE_T1], },
                { width: 100, height: 10, row_panes: [PANE_T2], },
                { width: 100, height: 20, row_panes: [PANE_1], },
                { width: 100, height: 20, row_panes: [PANE_2], },
                { width: 100, height: 20, row_panes: [PANE_3], },
                { width: 100, height: 20, row_panes: [PANE_4], },
            ]);
        });

        it('lays out a 5 pane grid', () => {
            expect(layout_rows('grid', [
                PANE_1, PANE_2, PANE_3, PANE_4, PANE_T1,
            ])).toEqual([
                { width: 100, height: 10, row_panes: [PANE_T1], },
                { width: 50, height: 45, row_panes: [PANE_1, PANE_2], },
                { width: 50, height: 45, row_panes: [PANE_3, PANE_4], },
            ]);
        });
    });

    describe('has a static function layout_pane_previews which', () => {
        const manager = {
            getEditorClass: typename => ({
                title: {
                    get_iconic_preview: text => `::${text}::`,
                    layout_hint: {prefer_top: true},
                },
                terminal: {get_iconic_preview: text => '><'},
                editor: {get_iconic_preview: text => '--'},
                html: {},
            }[typename]),
        };

        const pane_title = {
            hint: {prefer_top: true},
            preview: '::test-title::',
        };
        const pane_terminal = {hint: {}, preview: '><'};
        const pane_editor = {hint: {}, preview: '--'};
        const pane_html = {
            hint: {},
            preview: Slide.get_default_iconic_preview('html'),
        };

        const {layout_pane_previews} = Slide;

        it('lays out a standard 3 pane vertical look', () => {
            expect(layout_pane_previews(manager, {
                title: 'test-title',
                terminal: 'thing',
                editor: 'lol.js',
                layout: 'vertical',
            })).toEqual([
                { width: 100, height: 60, row_panes: [pane_title]},
                { width: 50, height: 40, row_panes: [pane_terminal, pane_editor]},
            ]);
        });

        it('lays out a standard 3 pane horizontal (default) look', () => {
            expect(layout_pane_previews(manager, {
                title: 'test-title',
                terminal: 'thing',
                html: 'lol',
            })).toEqual([
                { width: 100, height: 60, row_panes: [pane_title]},
                { width: 100, height: 20, row_panes: [pane_terminal]},
                { width: 100, height: 20, row_panes: [pane_html]},
            ]);
        });
    });
});

