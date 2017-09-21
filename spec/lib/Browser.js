/*
Very basic smoke test for browser module
*/

/* eslint-disable no-param-reassign */

const { mockWindowManager } = require('elmoed').testutils;
const Browser = require('../../lib/browser/Browser');

// Integrat-y unit tests for Browser viewer
describe('Browser', () => {
    let manager = null;

    beforeEach(() => {
        ({ manager } = mockWindowManager('browser', Browser));
    });

    afterEach(() => {
        manager = null;
    });

    it('successfully loads a blank URL', (done) => {
        manager.createWindow('browser', (browser) => {
            expect(Object.keys(browser.getProps())).toEqual(['url']);
            const { url } = browser.getProps();
            expect(url).toEqual('new browser');
            done();
        }, 'new browser');
    });

    it('successfully loads a populated URL', (done) => {
        manager.createWindow('browser', (browser) => {
            expect(Object.keys(browser.getProps())).toEqual(['url']);
            const { url } = browser.getProps();
            expect(url).toEqual('http://lol.com/');
            done();
        }, 'http://lol.com/');
    });

    describe('has methods for manipulating URLs', () => {
        it('doesnt change remote URL', (done) => {
            manager.createWindow('browser', (browser) => {
                expect(browser.getRelativeURL()).toEqual('http://lol.com/');
                expect(browser.serialized()).toEqual('http://lol.com/');
                done();
            }, 'http://lol.com/');
        });

        it('relativizes local file URL', (done) => {
            manager.createWindow('browser', (browser) => {
                browser.path = '/some/path/file.whiteboard';
                expect(browser.getRelativeURL()).toEqual('subdir/thing.html');
                expect(browser.serialized()).toEqual('subdir/thing.html');
                done();
            }, 'file:///some/path/subdir/thing.html');
        });

        it('correctly keeps remote URL', (done) => {
            const URL = 'https:///localhost:8080/thing.html';
            manager.createWindow('browser', (browser) => {
                expect(browser.getFullURL()).toEqual(URL);
                expect(browser.getProps().url).toEqual(URL);
                done();
            }, URL);
        });

        it('correctly transforms remote URL', (done) => {
            manager.createWindow('browser', (browser) => {
                browser.path = '/some/path/file.whiteboard';
                expect(browser.getFullURL())
                    .toEqual('file:///some/path/subdir/thing.html');
                expect(browser.getProps().url)
                    .toEqual('file:///some/path/subdir/thing.html');
                done();
            }, 'subdir/thing.html');
        });
    });
});
