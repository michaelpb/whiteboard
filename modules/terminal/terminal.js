'use strict';
//const child_pty = require('child_pty');

// TODO: rename file
const WhiteboardModule = require('../../lib/ScrollObjectEditor');

function capitalize(str) {
    return str.slice(0, 1).toUpperCase() + str.slice(1);
}

class Terminal extends WhiteboardModule {
    get tagname() {
        // Name of the .tag and channel this should use
        return 'terminal';
    }

    constructor(...args) {
        super(...args);
        this.setup_events();
    }

    setup_events(match) {
        this.on('ready', (event, payload) => {
            this.spawn();
        });
    }

    spawn() {
        this.stream = this.editor.get_ipc_stream(null, this.wbobj, 'term');
        const options = {
            columns:80,
            rows:24,
        };
        return;
        this.pty = child_pty.spawn('/bin/bash', ['-c', 'echo "welcome"'], options);
        this.pty.stdout.pipe(this.stream).pipe(pty.stdin);

        /*
        socket.on('disconnect', () => {
            console.log("end");
            this.pty.kill('SIGHUP');
            delete this.pty;
        });
        */
    }

    get_opts() {
        return {
        };
    }
}

module.exports = Terminal;
