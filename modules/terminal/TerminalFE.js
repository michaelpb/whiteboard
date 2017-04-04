require('../../node_modules/javascript-detect-element-resize/detect-element-resize');

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
function create_term(container, stream, ipc_send) {
    // Clean terminal
    while (container.children.length) {
        container.removeChild(container.children[0]);
    }
    term = new Terminal({
        cursorBlink: true,
        scrollback: 1000,
        tabStopWidth: 8,
    });

    term.open(container);
    _attach(term, stream);

    // On local resize events, send the event to the backing pty
    term.on('resize', size => {
        const {cols, rows} = size;
        ipc_send('resize', cols, rows);
    });
    term.fit();

    // Whenever the container resizes, make the term fit
    window.addResizeListener(container, () => {
        term.emit('scroll', term.ydisp); // hack i found in VSCode src
        term.fit();
        const proposal = term.proposeGeometry();
    });
}

module.exports.create_term = create_term;
