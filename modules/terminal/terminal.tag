<terminal>
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
        }

        .terminal-wrapper .card-content {
            height: 100%;
        }
    </style>


    <div class="terminal-wrapper card grey darken-4 z-depth-4">
        <div class="card-content white-text">
            <div name="term" class="terminaljs"></div>
        </div>
    </div>

    <script>
        const {create_term} = require('./TerminalFE');

        // Essential: prevent default in terminal
        //this.on('update', ev => ev.preventUpdate = true);

        this.on('mount', () => {
            const stream = opts.get_ipc_stream('term');
            // XXX Riot 3 vvvv (switch to refs)
            create_term(this.term, stream, opts.send);
        });
    </script>
</terminal>
