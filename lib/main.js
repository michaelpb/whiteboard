// Require elmoed
const elmoed = require('elmoed');
const path = require('path');

elmoed.launch({
    modules: require('./modules'),
    adaptorPath: elmoed.adaptorPaths.riotjs,
    newWindowTitle: 'Whiteboard',
});

