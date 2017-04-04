'use strict';

const schemaconf = require('schemaconf');
const fs = require('fs');
const ObjectContainer = require('./ObjectContainer');

let id = 0;
function _uid() {
    return id++;
}

// Given a path and the parsed info from a slide deck, return an flat of
// array of objects in the expected format (e.g. with 'typename' for
// each one)
function _munge_info(path, info) {
    const objects = [];
    let i = 0;
    for (const slide of info.slide) {
        i++;
        const slide_path = `${path}!${i}`;
        const uid = _uid();
        const title = slide.title || `Slide ${i}`;
        const slide_obj = {
            title,
            typename: 'slide',
            path: slide_path,
            info: slide,
            mount_id: 'slide_' + uid,
        };
        objects.push(slide_obj);
    }
    return objects;
}

class Deck {
    get typename() {
        return 'deck';
    }

    constructor(path, parsed_file) {
        this._info = parsed_file;
        this.path = path;
        const objects = _munge_info(path, this._info);
        this.objects = new ObjectContainer(objects);
    }

    static load_deck(path, callback) {
        fs.readFile(path, 'utf-8', (err, contents) => {
            if (err) {
                console.error("cannot read path: ", path);
                throw err;
            }
            const parsed = schemaconf.format.parse(contents);
            const deck = new Deck(path, parsed);
            callback(deck);
        });
    }
}

module.exports = Deck;
