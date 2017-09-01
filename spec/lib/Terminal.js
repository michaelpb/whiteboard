/*
Very basic smoke test for terminal module
*/

/* eslint-disable no-param-reassign */
/* eslint-disable global-require */

const { mockWindowManager } = require('elmoed').testutils;
const mockery = require('mockery');
const { mockObject, mockMethod } = require('magicmock');


// Integrat-y unit tests for Terminal viewer
describe('Terminal', () => {
    let manager = null;
    let Terminal = null;
    let pty = null;

    beforeEach(() => {
        mockery.enable();
        pty = { spawn: mockMethod() };
        pty.spawn.returnValue = {
            pid: 123,
            on: mockMethod(),
            write: mockMethod(),
            resize: mockMethod(),
        };
        mockery.registerMock('node-pty', pty);
        mockery.registerMock('electron-ipc-stream', mockObject());
        mockery.registerMock('child_process', mockObject());
        mockery.warnOnUnregistered(false);
        Terminal = require('../../lib/terminal/Terminal');
        ({ manager } = mockWindowManager('terminal', Terminal));
        manager.getIPCStream = () => mockObject();
    });

    afterEach(() => {
        manager = null;
        pty = null;
        Terminal = null;
        mockery.deregisterAll();
        mockery.disable();
    });

    it('successfully returns a PID', (done) => {
        manager.createWindow('terminal', (terminal) => {
            expect(Object.keys(terminal.getProps())).toEqual(['pid']);
            expect(terminal.getProps().pid).toEqual(123);
            done();
        }, '');
    });
});
