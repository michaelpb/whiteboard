const path = require('path');
const fs = require('fs');
const schemaconf = require('schemaconf');
const {autogenerate_deck_from_dir} = require('./utils');
const Store = require('electron-store');
const store = new Store({
    defaults: {
        recent: [],
    }
});

function save_to_file(filepath, data, callback) {
    const string = schemaconf.format.stringify(data);
    fs.writeFile(filepath, string, err => {
        if (err) {
            console.error("cannot write to path: ", filepath);
            throw err;
        }
        update_recent_list(filepath);
        callback();
    });
}

function update_recent_list(filepath) {
    const recent = store.get('recent');
    const index = recent.indexOf(filepath);
    if (index !== -1) {
        recent.splice(index, 1);
    }
    recent.unshift({path: filepath});
    store.set('recent', recent);
}

function capitalize(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
}

module.exports = {
    get_recent_list() {
        // TODO: clean this up, move it to Start, make it fault tolerant, and
        // async, and have it do it on ready
        const list = store.get('recent');
        return list.map(({path}) => {
            // otherwise read data from file
            try {
                const contents = fs.readFileSync(path, 'utf-8');
                const data = schemaconf.format.parse(contents);
                return {path, data};
            } catch (e) {
                return {path};
            }
        });
    },

    load_deck(manager, defaultPath, callback) {
        const {dialog} = manager.electron;
        dialog.showOpenDialog({
            defaultPath,
            properties: ['openFile'],
            filters: [
                {name: 'Whiteboard', extensions: ['whiteboard']},
            ],
        }, paths => {
            if (!paths) {
                return; // canceled
            }

            if (defaultPath === paths[0]) {
                return; // don't do anything if we are re-opening same file
            }

            update_recent_list(paths[0]);
            // Otherwise, create a new window opening this thing
            manager.createWindow(paths[0], callback);
        });
    },

    import_directory(manager, defaultPath, callback) {
        const {dialog} = manager.electron;
        dialog.showOpenDialog({
            defaultPath,
            properties: ['openDirectory'],
        }, paths => {
            if (!paths) {
                return; // canceled
            }

            // Otherwise, create a new window opening this thing
            const slides = autogenerate_deck_from_dir(paths[0])
            if (slides && slides.length > 0) {
                const filepath = path.resolve(paths[0], 'deck.whiteboard');
                const data = {slide: slides};
                save_to_file(filepath, data, () => {
                    console.log('SAVED TO ', filepath);
                    manager.createWindow(filepath, callback);
                });
            }
        });
    },

    new_deck(manager, defaultPath, callback) {
        const {dialog} = manager.electron;
        dialog.showSaveDialog({
            defaultPath,
            filters: [
                {name: 'Whiteboard', extensions: ['whiteboard']},
            ],
        }, filepath => {
            if (!filepath) {
                return; // canceled
            }

            // Otherwise, create a new window opening this thing
            const data = {
                slide: [
                    {title: 'New Whiteboard Deck'},
                ]
            };
            save_to_file(filepath, data, () => {
                console.log('SAVED TO ', filepath);
                manager.createWindow(filepath, callback);
            });
        });
    },
};
