<wb-terminal>
    <style scoped>
        .terminaljs {
            text-align: left;
            font-size: 28pt;
            height: 100%;
            width: 100%;
            min-height: 100%;
            min-width: 100%;
        }

        .terminal-wrapper {
            height: 100%;
            background: black;
            box-sizing: border-box;
            padding: 3px;
            line-height: 28pt;
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

        function triggerWindowScroll() {
            window.dispatchEvent(new Event('scroll'));
        }

        this.on('mount', () => {
            const stream = opts.getIPCStream('term');
            const {term} = this.refs;
            const fontSize = `${this.opts.font_size}pt`;
            term.style['font-size'] = `${fontSize}pt`;
            term.style['line-height'] = `${fontSize}pt`;
            create_term(term, stream, opts.send);

            opts.on('set_font_size', (ev, new_font_size) => {
                term.style['font-size'] = `${new_font_size}pt`;
                term.style['line-height'] = `${new_font_size}pt`;
                triggerWindowScroll();
            });
        });
    </script>
</wb-terminal>
