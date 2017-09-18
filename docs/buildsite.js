/*
Very simple static site generator thrown together in a few minutes to replace
an even simpler cat-based one in the Makefile
*/
const fs = require('fs');
const path = require('path');
const globSync = require('glob').sync;
const TinyTiny = require('tinytiny');
const context = require('./src/context.json');
context.packageJson = require('../package.json');

for (const filename of globSync(path.resolve(__dirname, 'src', 'includes', '*.html'))) {
    const bname = path.basename(filename);
    const contents = fs.readFileSync(filename).toString();
    const template = TinyTiny(contents);
    const result = new String(template(context));
    result.safe = true;
    context['includes_' + bname.split('.')[0]] = result;
}

for (const filename of globSync(path.resolve(__dirname, 'src', '*.html'))) {
    const contents = fs.readFileSync(filename).toString();
    const template = TinyTiny(contents);
    const result = template(context);
    const bname = path.basename(filename);
    const outputPath = path.resolve(__dirname, bname);
    fs.writeFileSync(outputPath, result);
}
