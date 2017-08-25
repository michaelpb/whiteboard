const elmoed = require('elmoed');
const path = require('path');
const modules = require('./modules');

const argv = Array.from(process.argv);

if (!argv[argv.length - 1].endsWith('.whiteboard')) {
    argv.push('--show-start');
}

elmoed.launch({
    argv,
    modules,
    adaptorPath: elmoed.adaptorPaths.riotjs,
    newWindowTitle: 'Whiteboard',
    htmlRoot: path.resolve(__dirname, '..', 'static'),
    rememberWindowState: true,
    autoMaximize: false,
});

