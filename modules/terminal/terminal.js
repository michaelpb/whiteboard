'use strict';
//const child_pty = require('child_pty');
const pty = require('node-pty');
const pathlib = require('path');
const fs = require('fs');

const WhiteboardModule = require('../../lib/WhiteboardModule');

const TERM_CHANNEL = 'term';

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
        this.requested_size = {
            cols: 80,
            rows: 24,
        };
        this.setup_events();
    }

    setup_events(match) {
        this.on('ready', (event, payload) => {
            if (this.term) {
                // Just getting switched to, already set up a terminal. Let's
                // send a formfeed \f character causing it to refresh.
                this.term.write('\f');
            } else {
                // First time mounted, spawn a pty
                this.spawn();
            }
        });

        this.on('resize', (event, cols, rows) => {
            this.requested_size = {cols, rows};
            if (this.term) {
                this.do_resize();
            }
        });
    }

    _get_wd() {
        // Ensure its a legit directory
        const path = pathlib.resolve(process.env.PWD, String(this.wbobj.text));
        return fs.existsSync(path) ? path : process.env.PWD;
    }

    spawn() {
        this.stream = this.editor.get_ipc_stream(null, this.wbobj, TERM_CHANNEL);
        const {rows, cols} = this.requested_size;
        const opts = {
            cols,
            rows,
            name: 'xterm-color',
            cwd: this._get_wd(),
            env: process.env,
        };
        const shell = process.platform === 'win32' ? 'cmd.exe' : 'bash';
        const term = pty.spawn(shell, [], opts);
        this.term = term;

        console.log('Created terminal with PID: ' + term.pid);
        term.on('data', data => {
            //logs[term.pid] += data;
            this.stream.write(data);
            //console.log('| DATA ', term.pid, ' | ', data);
        });

        // bi-directional
        this.stream.on('data', data => this.term.write(data));

        this.term.write('');
        this.do_resize();
    }

    do_resize() {
        const {rows, cols} = this.requested_size;
        console.log('Terminal: Resizing to', this.requested_size);
        this.term.resize(Math.max(rows, 5), Math.max(cols, 10));
    }

    get_opts() {
        return {
            pid: this.term && this.term.pid,
        };
    }
}

module.exports = Terminal;
