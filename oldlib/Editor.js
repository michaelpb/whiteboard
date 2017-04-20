'use strict';

/*
 * Global state management, of windows and of loaded decks
 */
const path = require('path');
const modules = require('../modules/modules');
const IPCStream = require('electron-ipc-stream');
const opn = require('opn');
const fs = require('fs');

const WINDOW_PREFS = {
    width: 500,
    height: 400,
    autoHideMenuBar: true,
    backgroundColor: '#FFFFFFFF',
    icon: 'static/img/icon.png',
    "min-width": 200,
    "min-height": 100,
    "web-preferences": {
        "text-areas-are-resizable": false,
    },
};

function exit_error(message) {
    console.error(message);
    process.exit(1);
}

class Editor {
    constructor(electron) {
        this.electron = electron;
        this.decks = {};
        this.windows = [];
        this.editor_cache = {};

    }

    load_window(browser_window, deck_path) {
        this.load_deck(deck_path, deck => {
            const window_info =
                this.windows.find(info => info.args[0] === deck_path);
            window_info.deck = deck; // attach deck object

            // Finally, mount the deck in the #main element
            this.mount(window_info, deck, '#main', () => {
                // Maximize the window
                browser_window.maximize();
            });
        });
    }

    get_editor_class(typename) {
        const type_info = modules.types[typename];
        if (!type_info) {
            return null;
        }
        const partial_path = type_info.path;
        const tagname = type_info.tagname;
        const editor_path = `../modules/${partial_path}`;
        return require(editor_path);
    }

    mount(window_info, wbobj, selector, callback = () => {}) {
        if (!window_info) {
            console.error("Need to specify window_info");
            // TODO: breaks with multi-window
            window_info = this.windows[0];
        }

        if (wbobj === null) {
            throw new Error('Cannot mount null obj');
        }

        const type_info = modules.types[wbobj.typename];
        if (!type_info) {
            throw new Error(`Cannot mount unknown type "${wbobj.typename}"`);
        }

        const EditorClass = this.get_editor_class(wbobj.typename);
        const tagname = type_info.tagname;
        const partial_path = type_info.path;
        //const editor_path = `../modules/${partial_path}`;
        const {browser_window} = window_info;

        const ipc_send = (subchannel, arg) => {
            browser_window.webContents.send(`${wbobj.path}:${subchannel}`, arg);
        };

        // Maintain a cache
        let editor_instance;
        let html_head;
        if (this.editor_cache[wbobj.path]) {
            editor_instance = this.editor_cache[wbobj.path];
        } else {
            editor_instance = new EditorClass(this, wbobj, ipc_send);
            this.editor_cache[wbobj.path] = editor_instance;
            if (editor_instance.get_css) {
                // has global css to insert
                browser_window.webContents.insertCSS(editor_instance.get_css());
            }

            if (editor_instance.get_head) {
                // might have global <head></head> contents to insert
                html_head = editor_instance.get_head();
            }
        }

        // window_info.editors[wbobj.typename] = editor_instance;

        const mount_payload = {
            path: `modules/${partial_path}.tag`,
            opts: JSON.stringify(editor_instance.get_opts()),
            prefix: `${wbobj.path}:`,
            html_head: html_head,
            tagname,
            selector,
        };

        browser_window.webContents.send('mount:editor', mount_payload);

        // Once its ready, call any relevant callback
        editor_instance.on('ready', callback);
        return editor_instance;
    }

    load_deck(target, done) {
        // Import required stuff
        const Deck = require('./libwhiteboard/Deck');

        // Check if target is actually a path, or else just use CWD
        /*let working_dir = (target.match(/\//) || target.match(/^./))
            ? path.resolve(target)
            : process.cwd();
            */

        // XXX XXX XXX XXX
        // working_dir = path.resolve(__dirname, '..', 'spec', 'data', 'basicws');

        // As a side-effect of loading something, change directory to its
        // containing folder, if we can
        const target_path = path.resolve(process.cwd(), target);
        const dir = path.dirname(target_path);
        if (fs.existsSync(dir)) {
            process.chdir(dir);
        }

        // Load deck:
        Deck.load_deck(target_path, deck => {
            this.deck = deck; // XXX
            done(deck);
        });
    }

    create_window(deck_path) {
        const browser_window = new this.electron.BrowserWindow(WINDOW_PREFS);
        const window_id = 1000 + this.windows.length;
        const window_info = {
            window_id,
            browser_window,
            editors: {},
            args: [deck_path],
        };
        this.windows.push(window_info);

        // Set up kick off event
        const ipc = this.electron.ipcMain;
        ipc.on('mount:ready', (event) => {
            this.load_window(browser_window, deck_path);
        });

        ipc.on('_log', (event, payload) => {
            console.log('----', payload);
        });

        // and load the index.html of the app.
        const main_path = path.resolve(__dirname, '..', 'static', 'index.html');
        browser_window.loadURL('file://' + main_path);

        // Open the DevTools.
        //browser_window.webContents.openDevTools();

        // Prevent all navigation
        browser_window.webContents.on('will-navigate', (ev, url) => {
            ev.preventDefault()
            opn(url); // open the URL in the preferred browser
        })

        // Emitted when the window is closed.
        browser_window.on('closed', () => {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            this.destroy_window(window_id);
        });
    }

    get_ipc_stream(window_info, wbobj, subchannel) {
        if (!window_info) {
            console.error("Need to specify window_info");
            // TODO: breaks with multi-window
            window_info = this.windows[0];
        }

        const {browser_window} = window_info;
        console.log(`ipc channel: ${wbobj.path}:${subchannel}`);
        return new IPCStream(`${wbobj.path}:${subchannel}`, browser_window);
    }

    destroy_window(window_id) {
        // destroys all for now
        this.windows = [];
    }
}

module.exports = Editor;
