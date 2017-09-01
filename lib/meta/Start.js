const { ModuleBase } = require('elmoed');

const dialogs = require('../dialogs.js');
const Deck = require('../deck/Deck');

class Start extends ModuleBase {
    load(callback) {
        this.setupEvents();
        this.recent = dialogs.get_recent_list();
        callback();
    }

    close() {
        // Close the current window
        this.windowInfo.browserWindow.close();
    }

    setupEvents() {
        this.on('ready', () => {
        });

        this.on('menu_open', () => {
            dialogs.load_deck(this.manager, process.cwd(), () => {
                this.close();
            });
        });

        this.on('menu_import', () => {
            dialogs.import_directory(this.manager, process.cwd(), () => {
                this.close();
            });
        });

        this.on('menu_new', () => {
            dialogs.newDeck(this.manager, process.cwd(), () => {
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
                const slides = Deck.layoutDeckPreview(
                    this.manager,
                    data.slide.slice(0, 3),
                );
                return { path, slides };
            }).slice(0, 3),
        };
    }
}

module.exports = Start;
