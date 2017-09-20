/*
    Hacky prefs system that wraps electron-store, should be replaced when a
    more general configuration system is in place
*/

let _store = null;
function getStore() {
    if (_store === null) {
        /* eslint-disable global-require */
        const Store = require('electron-store');
        /* eslint-enable global-require */
        _store = new Store({
            defaults: {
                recent: [],
                background: 'Light',
                deckAutosave: true,
            },
        });
    }
    return _store;
}

module.exports = {
    getStore,
};
