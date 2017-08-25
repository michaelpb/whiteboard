const elmoed = require('elmoed');
const path = require('path');
const fs = require('fs');

const argv = Array.from(process.argv);

if (!argv[argv.length - 1].endsWith('.whiteboard')) {
    argv.push('--show-start');
}

elmoed.launch({
    modules: require('./modules'),
    adaptorPath: elmoed.adaptorPaths.riotjs,
    newWindowTitle: 'Whiteboard',
    htmlRoot: path.resolve(__dirname, '..', 'static'),
    rememberWindowState: true,
    autoMaximize: false,
    argv,
});

