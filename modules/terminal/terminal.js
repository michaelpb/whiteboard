'use strict';
//const child_pty = require('child_pty');
const pty = require('node-pty');

// TODO: rename file
const WhiteboardModule = require('../../lib/ScrollObjectEditor');

function capitalize(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
}

class Terminal extends WhiteboardModule {
    get tagname() {
        // Name of the .tag and channel this should use
        return 'terminal';
    }

    constructor(...args) {
        super(...args);
        this.setup_events();
    }

    setup_events(match) {
        this.on('ready', (event, payload) => {
            this.spawn();
        });
    }

    spawn() {
        this.stream = this.editor.get_ipc_stream(null, this.wbobj, 'term');
        const options = {
            columns:80,
            rows:24,
        };
        const term = pty.spawn(process.platform === 'win32' ? 'cmd.exe' : 'bash', [], {
            name: 'xterm-color',
            cols: 80,
            rows: 24,
            cwd: process.env.PWD,
            env: process.env,
        });
        this.term = term;

        console.log('Created terminal with PID: ' + term.pid);
        term.on('data', data => {
            //logs[term.pid] += data;
            this.stream.write(data);
            //console.log('| DATA ', term.pid, ' | ', data);
        });

        // bi-directional
        this.stream.on('data', data => this.term.write(data));
    }

    get_opts() {
        return {
        };
    }
}

module.exports = Terminal;
