'use strict';

const fs = require('fs');
const path = require('path');

const {Menu} = require('electron');
const {ModuleBase} = require('elmoed');
const schemaconf = require('schemaconf');

const {autogenerate_deck_from_dir} = require('../utils');

const NOOP = () => {};
const SLIDE_MOUNT_POINT = '#current_slide';

let _uid = 0;
const uid = str => (str ? str + '-' : '') + _uid++;

function capitalize(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
}

function save_to_file(filepath, data, callback) {
    const string = schemaconf.format.stringify(data);
    fs.writeFile(filepath, string, err => {
        if (err) {
            console.error("cannot write to path: ", this.path);
            throw err;
        }
        callback();
    });
}

class Start extends ModuleBase {
    load(callback, options) {
        this.setup_events();
        callback();

        /*
        fs.open(this.path, 'r', (err, fd) => {
        });
        */
    }

    setup_events(match) {
        this.on('ready', (event, payload) => {
        });
    }

    getProps() {
        return {
            recentDecks: [
                {
                    path: '/home/michaelb/projects/whiteboard',
                },
                {
                    path: '/home/michaelb/projects/whiteboard',
                },
                {
                    path: '/home/michaelb/projects/whiteboard',
                }
            ],
        };
    }
}

module.exports = Start;
