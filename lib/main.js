const { doMarkdownExport } = require('./utils/exportmd');
const FLAG_EXPORTMD = '--exportmd';
const argv = Array.from(process.argv);

function main() {
    // Elmoed -- "Electron Modular Editor" -- handles lots of setup of electron
    const elmoed = require('elmoed');
    const path = require('path');
    const modules = require('./modules');
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
        defaultPath: '--show-start',
        windowPrefs: {
            autoHideMenuBar: false,
        },
    });
}

if (argv[argv.length - 2] && argv[argv.length - 2] === FLAG_EXPORTMD) {
    doMarkdownExport(argv);
    process.exit(0);
} else {
    main();
}
