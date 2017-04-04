'use strict';
//const child_pty = require('child_pty');
const pty = require('node-pty');
const pathlib = require('path');
const fs = require('fs');
const tmp = require('tmp');

const WhiteboardModule = require('../../lib/WhiteboardModule');

const TERM_CHANNEL = 'term';

const BASH_SCRIPT_PREFIX = 'if [ -f ~/.bashrc ]; then . ~/.bashrc; fi';

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
        this.text = String(this.wbobj.text).trim();
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

    create_tmp_script(text) {
        this.clear_tmp_script();
        this.tmp_script = tmp.fileSync();
        const contents = new Buffer(`${BASH_SCRIPT_PREFIX}\n\n${text}`);
        fs.writeSync(this.tmp_script.fd, contents);
    }

    clear_tmp_script() {
        // Always clean up ahead of time
        if (this.tmp_script) {
            this.tmp_script.removeCallback();
            this.tmp_script === null;
        }
    }

    _get_args() {
        const result = [];
        if (this.text.includes('\n')) {
            // No initial dir, just initialization script, put this in a tmp
            // file and load via bash
            // TODO broken
            //this.create_tmp_script(this.text);
            //result.push('--rcfile');
            //result.push(this.tmp_script.name);
        }
        return result;
    }

    _get_wd() {
        if (this.text.includes('\n')) {
            // No initial dir, just initialization script
            return process.env.PWD;
        }
        // Ensure its a legit directory
        const path = pathlib.resolve(process.env.PWD, this.text);
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
        const term = pty.spawn(shell, this._get_args(), opts);
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
        const {cols, rows} = this.requested_size;
        this.term.resize(Math.max(cols, 10), Math.max(rows, 5));
    }

    get_opts() {
        return {
            pid: this.term && this.term.pid,
        };
    }
}

module.exports = Terminal;
