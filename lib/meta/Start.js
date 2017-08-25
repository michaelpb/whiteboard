

const fs = require('fs');
const path = require('path');

const { Menu } = require('electron');
const { ModuleBase } = require('elmoed');
const schemaconf = require('schemaconf');

const dialogs = require('../dialogs');
const Deck = require('../deck/Deck');

const NOOP = () => {};

let _uid = 0;
const uid = str => (str ? `${str}-` : '') + _uid++;

class Start extends ModuleBase {
    load(callback, options) {
        this.setup_events();
        this.recent = dialogs.get_recent_list();
        callback();
    }

    close() {
        // Close the current window
        this.windowInfo.browserWindow.close();
    }

    setup_events(match) {
        this.on('ready', (event, payload) => {
        });

        this.on('menu_open', (event, payload) => {
            dialogs.load_deck(this.manager, process.cwd(), () => {
                this.close();
            });
        });

        this.on('menu_import', (event, payload) => {
            dialogs.import_directory(this.manager, process.cwd(), () => {
                this.close();
            });
        });

        this.on('menu_new', (event, payload) => {
            dialogs.new_deck(this.manager, process.cwd(), () => {
                this.close();
            });
        });

        this.on('open_recent', (ev, filepath) => {
            this.manager.createWindow(filepath, () => {
                this.close();
            });
        });
    }

    getProps() {
        return {
            recentDecks: this.recent.map(({ path, data }) => {
                const slides = Deck.layout_deck_preview(
                    this.manager,
                    data.slide.slice(0, 3),
                );
                return { path, slides };
            }).slice(0, 3),
        };
    }
}

module.exports = Start;
