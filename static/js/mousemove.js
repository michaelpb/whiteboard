'use strict';
const limit = require('./limit');

const DELAY = 2 * 1000;

module.exports.activate =  function () {
    $(document).bind('mousemove', limit.debounce(function(e) {
        //$("#debounce").children().last().text(debounceCalls++);
        $('body').removeClass('mouse-is-moving');
    }, DELAY)); // debounce with a 5 second delay

    $(document).bind('mousemove', limit.throttle(function(e) {
        //$("#throttle").children().last().text(throttleCalls++);
        $('body').addClass('mouse-is-moving');
    }, 200)); // throttle with a 100 ms
}
