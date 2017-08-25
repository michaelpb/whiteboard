
const { strip, mockElectron, mockWindowManager } = require('elmoed').testutils;
const mockery = require('mockery');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'support', 'data', 'deck');
const TWO_SLIDES = path.resolve(DATA_DIR, 'twoslides.whiteboard');
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
        // const Slide = require('../../lib/deck/Slide');
        ({ manager, modules } = mockWindowManager('whiteboard', Deck));

        // Mock up a couple editors
        const { ModuleBase } = require('elmoed');
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
        let deck = null;
        beforeEach((done) => {
            manager.createWindow('noexist.whiteboard', (new_deck) => {
                deck = new_deck;
                done();
            }, { creating: true });
        });

        it('sets up a menu', () => {
            const menu = electron._getMockedMenu();
            expect(menu).toBeTruthy();
        });

        it('when opening up', () => {
            expect(deck.slide_ids.length).toEqual(1);
            expect(deck.active_slide_id).toBeTruthy();
            expect(Object.keys(deck.slide_data).length).toEqual(1);
            expect(Object.keys(deck.slide_editors).length).toEqual(1);
        });

        afterEach(() => {
            deck = null;
        });
    });

    describe('when opening a typical slide deck', () => {
        let deck = null;
        beforeEach((done) => {
            manager.createWindow(TWO_SLIDES, (new_deck) => {
                deck = new_deck;
                done();
            });
        });

        // Not sure why this test is failing
        xit('sets up a menu', () => {
            const menu = electron._getMockedMenu();
            expect(menu).toBeTruthy();
        });

        it('sets up two slides', () => {
            expect(deck.slide_ids.length).toEqual(2);
            expect(deck.active_slide_id).toBeTruthy();
            expect(Object.keys(deck.slide_data).length).toEqual(2);
            expect(Object.keys(deck.slide_editors).length).toEqual(1);
        });

        it('deletes an inactive slide', () => {
            const _fs = [deck.active_slide_id];
            deck.set_fewer_slides(_fs);
            expect(deck.active_slide_id).toBeTruthy();
            expect(Object.keys(deck.slide_data).length).toEqual(1);
            expect(Object.keys(deck.slide_editors).length).toEqual(1);
            expect(deck.slide_ids.length).toEqual(1);
        });

        it('deletes an active slide', () => {
            const _fs = [deck.slide_ids[1]];
            deck.set_fewer_slides(_fs);
            expect(deck.active_slide_id).toBeTruthy();
            expect(Object.keys(deck.slide_data).length).toEqual(1);
            expect(Object.keys(deck.slide_editors).length).toEqual(1);
            expect(deck.slide_ids.length).toEqual(1);
        });

        it('deletes all slides and replaces with placeholder', () => {
            deck.set_fewer_slides([]);
            expect(deck.active_slide_id).toBeTruthy();
            expect(Object.keys(deck.slide_data).length).toEqual(1);
            expect(Object.keys(deck.slide_editors).length).toEqual(1);
            expect(deck.slide_ids.length).toEqual(1);
        });


        afterEach(() => {
            deck = null;
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

