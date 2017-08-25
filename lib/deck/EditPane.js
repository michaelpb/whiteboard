'use strict';

const fs = require('fs');
const lodash = require('lodash');

const Slide = require('./Slide');

const {ModuleBase} = require('elmoed');

// TODO: Add more complete modular registration listing to Elmoed manager
const MODS = new Set([
    'terminal',
    'editor',
    'title',
    'rawhtml',
    'markdown',
]);

class EditPane extends ModuleBase {
    constructor(...args) {
        super(...args);
    }

    getProps() {
        const acceptable = MODS.has.bind(MODS);
        const mods = Object.keys(this.manager.modules).filter(acceptable);
        const types = mods.map(typename => {
            const editor_class = this.manager.getEditorClass(typename);
            const preview = Slide.get_preview(editor_class, 'Slide title');
            const label = lodash.startCase(typename);
            return {typename, preview, label}
        });
        return {types};
    }
}

module.exports = EditPane;
