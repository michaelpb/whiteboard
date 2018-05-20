/* eslint-disable global-require */
const { mockElectron, mockWindowManager } = require('elmoed').testutils;
const mockery = require('mockery');
const { mockObject, mockMethod } = require('magicmock');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '..', 'support', 'data', 'deck');
const TWO_SLIDES = path.resolve(DATA_DIR, 'twoslides.whiteboard');
const DECK_PROPS = path.resolve(DATA_DIR, 'deck_properties.whiteboard');
const DECK_PROPS_BROKEN = path.resolve(DATA_DIR, 'deck_properties_broken.whiteboard');
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
        mockery.registerMock('mousetrap', mockObject());
        mockery.registerMock('electron-store', function FauxStore() {
            this.get = (key) => {
                if (key === 'recent') {
                    return [{ path: 'recent/Example.whiteboard' }];
                } else if (key === 'background') {
                    return 'Dark';
                }
                return null;
            };
            this.set = () => {};
        });
        mockery.warnOnUnregistered(false);

        // Now actually pull in Deck
        Deck = require('../../lib/deck/Deck');
        // const Slide = require('../../lib/deck/Slide');
        ({ electron, manager, modules } = mockWindowManager('whiteboard', Deck));
        mockery.registerMock('electron', electron);

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
            manager.createWindow('noexist.whiteboard', (newDeck) => {
                deck = newDeck;
                done();
            }, { creating: true });
        });

        it('sets up a menu', () => {
            const menu = electron._getMockedMenu();
            expect(menu).toBeTruthy();
        });

        it('sets up a menu with recent deck list', () => {
            const menu = electron._getMockedMenu();
            expect(menu).toBeTruthy();
            const fileMenu = menu.filter(i => i.label === 'File')[0];
            expect(fileMenu).toBeTruthy();

            // Check for "Save" menu item
            const save = fileMenu.submenu.filter(i => i.label === 'Save');
            expect(save.length).toEqual(1);

            const recentMenu = fileMenu.submenu.filter(i => i.label === 'Recent')[0];
            expect(recentMenu).toBeTruthy();
            const { submenu } = recentMenu;
            expect(submenu).toBeTruthy();
            expect(submenu.length).toEqual(1);
            expect(submenu[0].label).toEqual('Example');
        });

        it('generates reasonable top-level menu template', () => {
            expect(deck.makeTopLevelMenu([])).toBeTruthy();
            expect(deck.makeTopLevelMenu([]).map(item => item.label))
                .toContain('Slide');
            expect(deck.makeTopLevelMenu([]).map(item => item.label))
                .toContain('Navigation');
        });

        it('generates reasonable navigation menu template', () => {
            const navItems = deck.makeTopLevelMenu([])
                .filter(item => item.label === 'Navigation');
            expect(navItems.length).toEqual(1);
            const nav = navItems[0].submenu;
            expect(nav.map(item => item.label)).toContain('Next');
            expect(nav.map(item => item.label)).toContain('Previous');
            expect(nav.map(item => item.label)).toContain('All slides');
            expect(nav.map(item => item.label)).toContain('Fullscreen Presentation');
        });

        it('generates reasonable file menu templates', () => {
            expect(deck.makeFileMenu()).toBeTruthy();
            expect(deck.makeFileMenu().map(item => item.label))
                .toContain('Save');
        });

        it('opens up expected slides', () => {
            expect(deck.slideIDs.length).toEqual(1);
            expect(deck.activeSlideID).toBeTruthy();
            expect(Object.keys(deck.slideData).length).toEqual(1);
            expect(Object.keys(deck.slideEditors).length).toEqual(1);
        });

        afterEach(() => {
            deck = null;
        });
    });

    describe('when opening a slide deck with CSS file', () => {
        it('fails gracefully', (done) => {
            manager.createWindow(DECK_PROPS_BROKEN, (newDeck) => {
                expect(newDeck.globalCss).not.toBeTruthy();
                done();
            });
        });
    });

    describe('when opening a slide deck with global properties', () => {
        let deck = null;
        beforeEach((done) => {
            manager.createWindow(DECK_PROPS, (newDeck) => {
                deck = newDeck;
                done();
            });
        });

        afterEach(() => {
            deck = null;
        });

        it('read css from file and top property', () => {
            expect(deck.globalCss).toBeTruthy();
            expect(deck.globalCss)
                .toEqual('.some-test-css { }\n.extra-css { }');
        });


        it('set to be readonly', () => {
            expect(deck.readonly).toBeTruthy();
            // ensure its only a "nope" item here
            expect(deck.makeFileMenu().length).toEqual(1);
        });

        it('opens up expected slides', () => {
            expect(deck.slideIDs.length).toEqual(1);
            expect(deck.activeSlideID).toBeTruthy();
            expect(Object.keys(deck.slideData).length).toEqual(1);
            expect(Object.keys(deck.slideEditors).length).toEqual(1);
        });
    });

    xdescribe('when opening a typical slide deck', () => {
        let deck = null;
        beforeEach((done) => {
            manager.createWindow(TWO_SLIDES, (newDeck) => {
                deck = newDeck;
                done();
            });
        });

        afterEach(() => {
            deck = null;
        });

        it('sets up a menu', () => {
            const menu = electron._getMockedMenu();
            expect(menu).toBeTruthy();
        });

        it('has an autosave functionality', () => {
            // Ensure setAutosave toggles the existence of the interval
            deck.setAutosave(true, true);
            expect(deck._autosaveInterval).toBeTruthy();
            deck.setAutosave(false, true);
            expect(deck._autosaveInterval).not.toBeTruthy();

            // Now make sure that this interval calls saving
            spyOn(deck, 'save');
            expect(deck.save).not.toHaveBeenCalled();
            deck.setAutosave(true, true);
            deck._autosaveInterval._onTimeout();
            expect(deck.save).toHaveBeenCalled();
            deck.setAutosave(false, true);
            expect(deck._autosaveInterval).not.toBeTruthy();
        });

        it('sets up two slides', () => {
            expect(deck.slideIDs.length).toEqual(2);
            expect(deck.activeSlideID).toBeTruthy();
            expect(Object.keys(deck.slideData).length).toEqual(2);
            expect(Object.keys(deck.slideEditors).length).toEqual(1);
        });

        it('deletes an inactive slide', () => {
            const _fewerSlides = [deck.activeSlideID];
            deck.setFewerSlides(_fewerSlides);
            expect(deck.activeSlideID).toBeTruthy();
            expect(Object.keys(deck.slideData).length).toEqual(1);
            expect(Object.keys(deck.slideEditors).length).toEqual(1);
            expect(deck.slideIDs.length).toEqual(1);
        });

        it('deletes an active slide', () => {
            // const editor = deck.slideEditors[deck.slideIDs[0]];
            // editor.onWindowClosed = mockMethod();
            const _fewerSlides = [deck.slideIDs[1]];
            console.error(deck.slideIDs, deck.activeSlideID);
            deck.setFewerSlides(_fewerSlides);
            expect(deck.activeSlideID).toBeTruthy();
            expect(Object.keys(deck.slideData).length).toEqual(1);
            expect(Object.keys(deck.slideEditors).length).toEqual(1);
            expect(deck.slideIDs.length).toEqual(1);
            // expect(editor.onWindowClosed.called()).toEqual(true);
        });

        it('deletes all slides and replaces with placeholder', () => {
            deck.setFewerSlides([]);
            expect(deck.activeSlideID).toBeTruthy();
            expect(Object.keys(deck.slideData).length).toEqual(1);
            expect(Object.keys(deck.slideEditors).length).toEqual(1);
            expect(deck.slideIDs.length).toEqual(1);
        });

        xit('correctly calls onWindowClosed of subeditors', () => {
            const editors = Object.values(deck.slideEditors);
            for (const editor of editors) {
                editor.onWindowClosed = mockMethod();
            }
            deck.onWindowClosed();
            for (const editor of editors) {
                expect(editor.onWindowClosed.called()).toEqual(true);
            }
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

