const pathlib = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const pty = require('node-pty');
const { ModuleBase } = require('elmoed');
const { glyphIcon } = require('../utils');

const TERM_CHANNEL = 'term';

const isWindows = /^win/.test(process.platform);
const DEFAULT_FONT_SIZE = 28;

// https://stackoverflow.com/questions/15939380/how-to-get-the-cwd-current-working-directory-from-a-nodejs-child-process-in-b
function getCwd(pid) {
    if (!pid) {
        return null;
    }

    if (isWindows) {
        return null;
    }

    // Gets last column in last line of lsof to get the CWD
    let data;
    try {
        data = execSync(`lsof -a -d cwd -p ${pid}`);
    } catch (e) {
        console.error(`Terminal: error with lsof: ${e}`);
        return null;
    }

    // Make this extremely fault-tolerant, to ensure stuff at least sort-of
    // works on systems that may have a different lsof
    try {
        const lines = String(data).trim().split('\n');
        const lastLine = lines[lines.length - 1];
        const lastLineColumns = lastLine.split(' ');
        const path = lastLineColumns[lastLineColumns.length - 1];
        if (!fs.existsSync(path)) {
            console.error(`Terminal: error does not exist: ${path}`);
            return null;
        }
        return path;
    } catch (e) {
        console.error(`Terminal: error in parsing lsof: ${e}`);
        return null;
    }
}

class Terminal extends ModuleBase {
    load(callback, text) {
        this.requested_size = {
            cols: 80,
            rows: 24,
        };
        this.text = String(text).trim();
        this.setupEvents();
        this.font_size = DEFAULT_FONT_SIZE;
        callback();
    }

    setupEvents() {
        this.on('ready', () => {
            if (this._isDefunct) {
                return; // TODO Remove once elmoed supports event cleanup
            }

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
            if (this._isDefunct) {
                return; // TODO Remove once elmoed supports event cleanup
            }

            this.requested_size = { cols, rows };
            if (this.term) {
                this.doResize();
            }
        });
    }

    _getWd() {
        // ////////////////////
        // TODO: For some reason, this is buggy on macOS, and I can't test it,
        // so I'm just adding extra chdir here to try to fix it
        const basepath = pathlib.dirname(this.getRealPath());
        process.chdir(basepath);
        // Hack, DELETEME when properly fixed
        // ////////////////////

        const path = pathlib.resolve(this.text);

        if (fs.existsSync(path)) {
            // Ensure its a legit directory
            return path;
        }

        const cwd = process.env.PWD || process.cwd();
        if (fs.existsSync(cwd)) {
            return cwd;
        }

        console.error(`Could not get valid shell cwd: ${path}, ${cwd}`);
        return null;
    }

    getBinary() {
        return process.env[isWindows ? 'COMSPEC' : 'SHELL'];
    }

    spawn() {
        this.stream = this.getIPCStream(TERM_CHANNEL);
        const { rows, cols } = this.requested_size;
        const opts = {
            cols,
            rows,
            name: 'xterm-color',
            env: process.env,
        };

        // Defensive programming around a finicky part: there are a lot of
        // things that can cause a starting working directory to be broken, so
        // we just avoid specifying if it is broken.
        const cwd = this._getWd();
        if (cwd !== null) {
            opts.cwd = cwd;
        }

        const binary = this.getBinary();
        const args = [];
        const term = pty.spawn(binary, args, opts);
        this.term = term;

        // console.log(`Created terminal with PID: ${term.pid}`);
        term.on('data', (data) => {
            // logs[term.pid] += data;
            if (this._isDefunct) {
                return; // TODO Remove once elmoed supports stream cleanup
            }
            this.stream.write(data);
        });

        // bi-directional
        this.stream.on('data', (data) => {
            if (this._isDefunct) {
                return; // TODO Remove once elmoed supports stream cleanup
            }
            this.term.write(data);
        });

        // Standardize PS1 to be a $, and ensure it ends up in the correct
        // directory by doing a CD right off the bat
        this.term.write('PS1=\'$ \'\n');
        if (cwd !== null) {
            this.term.write(`cd '${cwd}'\n`);
        }
        this.term.write('clear\n\f');
        this.doResize();
    }

    onWindowClosed() {
        // NOTE: as of Elmoed 0.0.20 there is no guarantee that it will only be
        // run once -- this will be fixed once the "sub-editor" even system
        // gets fleshed out.
        if (this.term) {
            this.term.kill();
            this.term = null;
            this._isDefunct = true;
        }
    }

    static getPNGIconPath() {
        return glyphIcon('fullscreen');
    }

    static getIconicPreview() {
        return '<img src="svg/si-glyph-fullscreen.svg"/>';
    }

    serialized() {
        const cwd = getCwd(this.term && this.term.pid);
        if (!cwd) {
            return this.getRelativePath(this.text);
        }
        return this.getRelativePath(cwd);
    }

    getRelativePath(path) {
        const basepath = pathlib.dirname(this.getRealPath());
        return pathlib.relative(basepath, path);
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
                icon: glyphIcon('zoom-in'),
                submenu: [
                    fontSizeSubmenu(11),
                    fontSizeSubmenu(14),
                    fontSizeSubmenu(18),
                    fontSizeSubmenu(24),
                    fontSizeSubmenu(28),
                    fontSizeSubmenu(32),
                ],
            },
        ];
    }

    doResize() {
        const { cols, rows } = this.requested_size;
        try {
            this.term.resize(Math.max(cols, 10), Math.max(rows, 5));
        } catch (e) {
            console.error(`Terminal resize error: ${e}`);
        }
    }

    getProps() {
        return {
            pid: this.term && this.term.pid,
        };
    }
}

module.exports = Terminal;
