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
        fit('lays out an empty list', () => {
            expect(layout_rows('grid', [])).toEqual([]);
            expect(layout_rows('vertical', [])).toEqual([]);
            expect(layout_rows('horizontal', [])).toEqual([]);
        });

        fit('lays out a standard 3 pane vertical look', () => {
            expect(layout_rows('vertical', [
                PANE_1,
                PANE_2,
                PANE_T1,
            ])).toEqual([
                {
                    width: 100,
                    height: 10,
                    row_panes: [PANE_T1],
                },
                {
                    width: 50,
                    height: 90,
                    row_panes: [PANE_1, PANE_2],
                },
            ]);
        });

        fit('lays out a standard 3 pane grid look', () => {
            expect(layout_rows('grid', [
                PANE_1,
                PANE_2,
                PANE_T1,
            ])).toEqual([
                {
                    width: 100,
                    height: 10,
                    row_panes: [PANE_T1],
                },
                {
                    width: 50,
                    height: 90,
                    row_panes: [PANE_1, PANE_2],
                },
            ]);
        });

        fit('lays out a standard 3 pane horizontal look', () => {
            expect(layout_rows('horizontal', [
                PANE_1,
                PANE_2,
                PANE_T1,
            ])).toEqual([
                {
                    width: 100,
                    height: 10,
                    row_panes: [PANE_T1],
                },
                {
                    width: 100,
                    height: 45,
                    row_panes: [PANE_1],
                },
                {
                    width: 100,
                    height: 45,
                    row_panes: [PANE_2],
                },
            ]);
        });

        fit('lays out a 6 pane horizontal look', () => {
            expect(layout_rows('horizontal', [
                PANE_1,
                PANE_2,
                PANE_3,
                PANE_4,
                PANE_T1,
                PANE_T2,
            ])).toEqual([
                {
                    width: 100,
                    height: 10,
                    row_panes: [PANE_T1],
                },
                {
                    width: 100,
                    height: 10,
                    row_panes: [PANE_T2],
                },
                {
                    width: 100,
                    height: 20,
                    row_panes: [PANE_1],
                },
                {
                    width: 100,
                    height: 20,
                    row_panes: [PANE_2],
                },
                {
                    width: 100,
                    height: 20,
                    row_panes: [PANE_3],
                },
                {
                    width: 100,
                    height: 20,
                    row_panes: [PANE_4],
                },
            ]);
        });

        fit('lays out a 5 pane grid', () => {
            expect(layout_rows('grid', [
                PANE_1,
                PANE_2,
                PANE_3,
                PANE_4,
                PANE_T1,
            ])).toEqual([
                {
                    width: 100,
                    height: 10,
                    row_panes: [PANE_T1],
                },
                {
                    width: 50,
                    height: 45,
                    row_panes: [PANE_1, PANE_2],
                },
                {
                    width: 50,
                    height: 45,
                    row_panes: [PANE_3, PANE_4],
                },
            ]);
        });
    });
});

