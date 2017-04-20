/*
Array that has a few extra capabilities, used by Deck to contain top level
objects.  Most notably, this includes Slide.
*/
'use strict';

class ObjectContainer extends Array {
    constructor(objects) {
        super();

        for (const object of objects) {
            this.push(object);
            if (!(object.typename in this)) {
               this[object.typename] = [];
            }
            this[object.typename].push(object);
        }
    }

    /*
     * Replaces old object with new object
     */
    swap(old_object, new_object) {
        const index = this.findIndex(object => object === old_object);
        this[index] = new_object;
        this[old_object.typename] = this[old_object.typename].filter(object => object !== old_object);
        this[new_object.typename].push(new_object);
    }

    /*
     * Finds a object with the given matching string
    get(matching_string) {
        const matcher = new ObjectMatcher(matching_string);
        const result = this.find(object => matcher.match(object));
        if (!result) {
            return null;
        }
        return result;
    }

    get_all(matching_string) {
        const matcher = new ObjectMatcher(matching_string);
        return this.filter(object => matcher.match(object));
    }
     */
}

module.exports = ObjectContainer;

