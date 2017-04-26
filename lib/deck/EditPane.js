'use strict';

const fs = require('fs');

const {ModuleBase} = require('elmoed');

class EditPane extends ModuleBase {
    constructor(...args) {
        super(...args);
    }

    load(callback, text) {
        this.typename = text.split('=')[0];
        this.val = text.split('=')[1];
        this.on('popup', (event, slide_id) => {
        });

        callback();
    }

    getProps() {
        const options = [
            {
                typename: 'terminal',
                val: '',
            },
            {
                typename: 'terminal',
                val: '',
            },
            {
                typename: 'terminal',
                val: '',
            },
        ];
        return {
            typename: this.typename,
            val: this.val,
            options,
        };
    }
}

module.exports = EditPane;
