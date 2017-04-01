<terminal>
    <style scoped>
        .terminaljs {
            background: black;
            color: white;
            font-family: Courier, monospace;
            display:inline-block;
        }
    </style>
    <pre class="terminaljs" data-columns="80" data-rows="24">
        .
    </pre>
    <script>
        const Terminal = require('terminal.js/dist/terminal'); // Get Terminal dependencies
        this.on('mount', () => {
            // add uuid --v
            const container = document.getElementsByClassName('terminaljs')[0];

            // setting tabindex makes the element focusable
            container.tabindex = 0;

            // use data-* attributes to configure terminal and child_pty

            const stream = opts.get_ipc_stream('term');
            const term = new Terminal(container.dataset);
            stream.pipe(term).dom(container).pipe(stream);

            /*
            // Create bidirectional stream
            stream = ss.createStream({decodeStrings: false, encoding: 'utf-8'});

            // Send stream and options to the server
            ss(socket).emit('new', stream, container.dataset);
            
            if(containers[i].dataset.exec) {
                stream.write(containers[i].dataset.exec + "\n");
            }

            // Connect everything up
            stream.pipe(term).dom(containers[i]).pipe(stream);
            */
        });
    </script>
</terminal>
