// Require elmoed
const elmoed = require('elmoed');
const path = require('path');

const modules = require('./modules');

const adaptorPath = path.resolve(__dirname, 'adaptor');
const newWindowTitle = 'Whiteboard';

elmoed.launch({modules, adaptorPath, newWindowTitle});

