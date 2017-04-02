<terminal>
    <style scoped>
        .terminaljs {
            text-align: left;
            font-size: 18pt;
        }
    </style>
    <pre class="terminaljs"></pre>
    <script>
        function _attach(term, stream) {
            stream.on('data', chunk => term.write(chunk));
            term.on('data', data => stream.write(data));
            stream.on('close', () => _detatch(term, stream));
            stream.on('error', (err) => _detatch(term, stream, err));
        }

        function _detach(term, stream, err) {
            //term.off('data', term._sendData);
            term.off('data');
            if (err) {
                console.error('Error: ', err);
            }
            if (stream) {
                stream.off('data');
            }
        }

        //const Terminal = require('xterm/dist/xterm'); // Get Terminal dependencies
        function create_term(terminalContainer, stream) {
            // Clean terminal
            while (terminalContainer.children.length) {
                terminalContainer.removeChild(terminalContainer.children[0]);
            }
            term = new Terminal({
                cursorBlink: true,
                scrollback: 1000,
                tabStopWidth: 8,
            });
            term.on('resize', function (size) {
                // if (!pid) { return; }
                // fetch(url, {method: 'POST'});
            });

            term.open(terminalContainer);
            console.log('this is term', term);
            _attach(term, stream);
            //term.fit();
            /*
            var initialGeometry = term.proposeGeometry(),
                cols = initialGeometry.cols,
                rows = initialGeometry.rows;
            colsElement.value = cols;
            rowsElement.value = rows;
            */
        }


        this.on('mount', () => {
            // add uuid --v
            const container = document.getElementsByClassName('terminaljs')[0];

            // setting tabindex makes the element focusable
            container.tabindex = 0;

            const stream = opts.get_ipc_stream('term');
            create_term(container, stream)
        });
    </script>
</terminal>
