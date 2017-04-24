// Require elmoed
const elmoed = require('elmoed');
const path = require('path');

const modules = require('./modules');

const adaptorPath = elmoed.adaptorPaths.riotjs;
const newWindowTitle = 'Whiteboard';

elmoed.launch({
    modules: require('./modules'),
    adaptorPath: elmoed.adaptorPaths.riotjs,
    newWindowTitle,
});

