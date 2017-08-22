const elmoed = require('elmoed');
const path = require('path');
const fs = require('fs');

const argv = Array.from(process.argv);

const DEFAULT_FILE = `
# Auto generated file
[slide]
title=New Whiteboard Deck
`;

if (!argv[argv.length - 1].endsWith('.whiteboard')) {
    // Not opening with correct type, default to a tmp file
    const tmp = require('tmp');
    const tmpPath = tmp.tmpNameSync({
        postfix: '.whiteboard',
    });
    fs.writeFileSync(tmpPath, DEFAULT_FILE);
    argv.push(tmpPath);
}

elmoed.launch({
    modules: require('./modules'),
    adaptorPath: elmoed.adaptorPaths.riotjs,
    newWindowTitle: 'Whiteboard',
    htmlRoot: path.resolve(__dirname, '..', 'static'),
    argv,
});

