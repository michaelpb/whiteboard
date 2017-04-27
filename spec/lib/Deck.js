'use strict';
const {strip, mockElectron, mockWindowManager} = require('elmoed').testutils;
const mockery = require('mockery');

// Mostly just a stub of integrat-y unit tests for Slide

describe('Deck', () => {
    let electron = null;
    let Deck = null;
    let manager = null;
    let modules = null;
    beforeEach(() => {
        electron = mockElectron();
        mockery.enable();
        mockery.registerMock('electron', electron);
        mockery.warnOnUnregistered(false);

        // Now actually pull in Deck
        Deck = require('../../lib/deck/Deck');
        //const Slide = require('../../lib/deck/Slide');
        ({manager, modules} = mockWindowManager('deck', Deck));

        // Mock up a couple editors
        const {ModuleBase} = require('elmoed');
        modules.slide = {
            module: class TestSlide extends ModuleBase {},
            edits: ['!slide'],
        };
        modules.title = {
            module: class TestTitle extends ModuleBase {},
            edits: ['!title'],
        };
    });

    describe('when opening an empty file', () => {
        it('sets up a menu', (done) => {
            manager.createWindow('deck', deck => {
                const menu = electron._getMockedMenu();
                expect(menu).toBeTruthy();
                done();
            }, {creating: true});
        });

        it('sets up a single slide placeholder', (done) => {
            manager.createWindow('deck', deck => {
                expect(deck.slide_ids.length).toEqual(1);
                expect(deck.active_slide_id).toBeTruthy();
                expect(Object.keys(deck.slide_data).length).toEqual(1);
                expect(Object.keys(deck.slide_editors).length).toEqual(1);
                done();
            }, {creating: true});
        });
    });

    afterEach(() => {
        manager = null;
        electron = null;
        Deck = null;
        mockery.deregisterAll();
        mockery.disable();
    });
});

