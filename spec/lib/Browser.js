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
            expect(url).toEqual('');
            done();
        }, '');
    });

    it('successfully loads a populated URL', (done) => {
        manager.createWindow('browser', (browser) => {
            expect(Object.keys(browser.getProps())).toEqual(['url']);
            const { url } = browser.getProps();
            expect(url).toEqual('http://lol.com/');
            done();
        }, 'http://lol.com/');
    });
});
