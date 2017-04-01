// Modified copy of https://github.com/m-gagne/limit.js/blob/master/limit.js
// MIT licensed https://github.com/m-gagne/limit.js/blob/master/MIT-LICENSE.txt
// Original copyright: Copyright (c) 2012 Marc Gagné

/**
 * debounce
 * @param {integer} milliseconds This param indicates the number of milliseconds
 *     to wait after the last call before calling the original function.
 * @param {object} What "this" refers to in the returned function.
 * @return {function} This returns a function that when called will wait the
 *     indicated number of milliseconds after the last call before
 *     calling the original function.
 */
module.exports.debounce = function (baseFunction, milliseconds, context) {
    var timer = null,
        wait = milliseconds;

    return function () {
        var self = context || this,
            args = arguments;

        function complete() {
            baseFunction.apply(self, args);
            timer = null;
        }

        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(complete, wait);
    };
};

/**
* throttle
* @param {integer} milliseconds This param indicates the number of milliseconds
*     to wait between calls before calling the original function.
* @param {object} What "this" refers to in the returned function.
* @return {function} This returns a function that when called will wait the
*     indicated number of milliseconds between calls before
*     calling the original function.
*/
module.exports.throttle = function (baseFunction, milliseconds, context) {
    var lastEventTimestamp = null,
        limit = milliseconds;

    return function () {
        var self = context || this,
            args = arguments,
            now = Date.now();

        if (!lastEventTimestamp || now - lastEventTimestamp >= limit) {
            lastEventTimestamp = now;
            baseFunction.apply(self, args);
        }
    };
};
