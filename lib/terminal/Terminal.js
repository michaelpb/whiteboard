const pathlib = require('path');
const fs = require('fs');
const os = require('os');
const { execSync } = require('child_process');

const pty = require('node-pty');
const { ModuleBase } = require('elmoed');

const TERM_CHANNEL = 'term';

// https://stackoverflow.com/questions/15939380/how-to-get-the-cwd-current-working-directory-from-a-nodejs-child-process-in-b
function getCwd(pid) {
    if (!pid) {
        return null;
    }

    const type = os.type();
    if (type === 'Windows') {
        return null;
    }

    // Gets last column in last line of lsof to get the CWD
    const data = execSync(`lsof -a -d cwd -p ${pid}`);
    const lines = String(data).trim().split('\n');
    const lastLine = lines[lines.length - 1];
    const lastLineColumns = lastLine.split(' ');
    return lastLineColumns[lastLineColumns.length - 1];
}

class Terminal extends ModuleBase {
    load(callback, text) {
        this.requested_size = {
            cols: 80,
            rows: 24,
        };
        this.text = String(text).trim();
        this.setupEvents();
        this.font_size = 18;
        callback();
    }

    setupEvents() {
        this.on('ready', () => {
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
            this.requested_size = { cols, rows };
            if (this.term) {
                this.doResize();
            }
        });
    }

    _getWd() {
        const cwd = process.cwd();
        if (this.text.includes('\n')) {
            // No initial dir, just initialization script
            return cwd;
        }
        // Ensure its a legit directory
        const path = pathlib.resolve(cwd, this.text);
        return fs.existsSync(path) ? path : cwd;
    }

    spawn() {
        this.stream = this.getIPCStream(TERM_CHANNEL);
        const { rows, cols } = this.requested_size;
        const opts = {
            cols,
            rows,
            name: 'xterm-color',
            cwd: this._getWd(),
            env: process.env,
        };
        const args = [];
        const shell = process.platform === 'win32' ? 'cmd.exe' : 'bash';
        const term = pty.spawn(shell, args, opts);
        this.term = term;

        console.log(`Created terminal with PID: ${term.pid}`);
        term.on('data', (data) => {
            // logs[term.pid] += data;
            this.stream.write(data);
        });

        // bi-directional
        this.stream.on('data', data => this.term.write(data));

        this.term.write('');
        this.doResize();
    }

    static getIconicPreview() {
        return '<img src="svg/si-glyph-fullscreen.svg"/>';
    }

    serialized() {
        const cwd = getCwd(this.term && this.term.pid);
        if (!cwd) {
            return this.text;
        }
        return cwd;
    }

    getContextMenu() {
        const fontSizeSubmenu = number => ({
            label: `${number} pt`,
            type: 'radio',
            click: () => {
                this.font_size = number;
                this.send('set_font_size', number);
            },
            checked: this.font_size === number,
        });
        return [
            {
                label: 'Font Size',
                submenu: [
                    fontSizeSubmenu(11),
                    fontSizeSubmenu(14),
                    fontSizeSubmenu(18),
                    fontSizeSubmenu(24),
                    fontSizeSubmenu(32),
                ],
            },
        ];
    }

    doResize() {
        const { cols, rows } = this.requested_size;
        this.term.resize(Math.max(cols, 10), Math.max(rows, 5));
    }

    getOpts() {
        return {
            pid: this.term && this.term.pid,
        };
    }
}

module.exports = Terminal;
