<wb-terminal>
    <style scoped>
        .terminaljs {
            text-align: left;
            font-size: 18pt;
            height: 100%;
            width: 100%;
            min-height: 100%;
            min-width: 100%;
        }

        .terminal-wrapper {
            height: 100%;
            background: black;
            box-sizing: border-box;
            padding: 5px;
            line-height: 18pt;
        }
    </style>

    <div class="terminal-wrapper xterm-theme-dark">
        <div ref="term" class="terminaljs"></div>
    </div>

    <script>
        'use strict';
        const {create_term} = require('./TerminalFE');

        // Essential: prevent default in terminal
        //this.on('update', ev => ev.preventUpdate = true);

        this.on('mount', () => {
            const stream = opts.getIPCStream('term');
            console.log('ready to do terminal');
            const {term} = this.refs;
            console.log('creating term', term);
            // XXX Riot 3 vvvv (switch to refs)
            create_term(term, stream, opts.send);
        });
    </script>
</wb-terminal>
