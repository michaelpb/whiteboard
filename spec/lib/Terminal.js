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

    const LSOF_OUTPUT = [
        'COMMAND  PID     USER   FD   TYPE DEVICE SIZE/OFF   NODE NAME\n',
        'bash    3907 michaelb  cwd    DIR  179,5     4096 523326 /bin\n',
    ].join('');

    let execSyncReturn;

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
        execSyncReturn = LSOF_OUTPUT;
        const childProcess = { execSync: () => execSyncReturn };
        mockery.registerMock('child_process', childProcess);
        mockery.registerMock('os', {
            type: mockMethod({ returnValue: 'linux' }),
        });
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
            mockery.registerMock('child_process', mockObject());
            expect(Object.keys(terminal.getProps())).toEqual(['pid']);
            expect(terminal.getProps().pid).toEqual(123);
            done();
        }, '');
    });

    describe('has a feature to determine cwd', () => {
        it('correctly parses lsof output when trying to determine cwd', (done) => {
            manager.createWindow('terminal', (terminal) => {
                // simulate being at root, and check for /bin
                terminal.path = '/test.whiteboard!thing';
                expect(terminal.serialized()).toEqual('bin');
                done();
            }, '/initial');
        });

        it('successfully handles errors when trying to determine cwd', (done) => {
            // mashed keys here to ensure no dir has this
            execSyncReturn = 'INVALID STRING THING b]x,vnjf093jf0aaoij3r0j';
            manager.createWindow('terminal', (terminal) => {
                terminal.path = '/test.whiteboard!thing';
                expect(terminal.serialized()).toEqual('initial');
                done();
            }, '/initial');
        });

        it('correctly relativizes paths in all cases', (done) => {
            // mashed keys here to ensure no dir has this
            execSyncReturn = 'INVALID STRING THING b]x,vnjf093jf0aaoij3r0j';
            manager.createWindow('terminal', (terminal) => {
                terminal.path = '/a/different/path/wb.whiteboard!slide!term';
                expect(terminal.serialized()).toEqual('../../path/initial');
                done();
            }, '/a/path/initial');
        });
    });
});
