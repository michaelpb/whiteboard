/*
Very basic smoke test for terminal module
*/

/* eslint-disable no-param-reassign */

const { mockWindowManager } = require('elmoed').testutils;
const Terminal = require('../../lib/terminal/Terminal');

// Integrat-y unit tests for Terminal viewer
xdescribe('Terminal', () => {
    let manager = null;

    beforeEach(() => {
        ({ manager } = mockWindowManager('terminal', Terminal));
    });

    afterEach(() => {
        manager = null;
    });

    it('successfully returns a PID', (done) => {
        manager.createWindow('terminal', (terminal) => {
            expect(Object.keys(terminal.getProps())).toEqual(['pid']);
            done();
        }, '');
    });
});
