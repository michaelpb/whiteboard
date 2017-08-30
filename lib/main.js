const elmoed = require('elmoed');
const path = require('path');
const modules = require('./modules');

const argv = Array.from(process.argv);

if (!argv[argv.length - 1].endsWith('.whiteboard')) {
    argv.push('--show-start');
}

const _npm = p => path.resolve(__dirname, '..', 'node_modules', p);

elmoed.launch({
    argv,
    modules,
    // NOTE: cannot use 
    // adaptorPath: elmoed.adaptorPaths.riotjs,
    adaptorPath: _npm('elmoed/lib/adaptors/riotjs.js'),
    newWindowTitle: 'Whiteboard',
    htmlRoot: path.resolve(__dirname, '..', 'static'),
});

