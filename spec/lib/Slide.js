'use strict';
const {strip, mockWindowManager, deregister} = require('elmoed').testutils;
const {ModuleBase} = require('elmoed');
const Slide = require('../../lib/deck/Slide');

// Mostly just a stub of integrat-y unit tests for Slide

describe('Slide', () => {
    let manager = null;
    let modules = null;

    beforeEach(() => {
        ({manager, modules} = mockWindowManager('slide', Slide));

        modules.testpane = {
            module: class TestPane extends ModuleBase {},
            edits: ['!testpane'],
        };
    });


    it('can be successfully mounted completely empty', (done) => {
        manager.createWindow('slide', slide => {
            expect(slide.panes.length).toEqual(0);
            expect(slide.info).toBeTruthy();
            done();
        }, {});
    });

    it('can be successfully mounted with a test-pane', (done) => {
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

