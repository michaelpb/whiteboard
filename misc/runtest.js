var webPage = require('webpage');
var system = require('system');
var page = webPage.create();

page.onConsoleMessage = function(msg, lineNum, sourceId) {
    //console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
    console.log(msg);
};

address = system.args[1];
page.open(address, function(status) {
if (status !== 'success') {
console.log('FAIL to load the address');
} else {
t = Date.now() - t;
console.log('Loading ' + system.args[1]);
console.log('Loading time ' + t + ' msec');
}
phantom.exit();
});

