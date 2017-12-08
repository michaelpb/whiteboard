function setupMediumEditor(component) {
    const { locked, html, send } = component.opts;
    const { wrapperNode } = component.refs;

    if (component.editor) {
        component.editor.removeElements();
        component.editor.destroy();
        component.editor = null;
    }

    wrapperNode.innerHTML = html;

    if (locked) {
        return; // Locked, don't start editor
    }

    // Otherwise, create initial editor

    // TODO: have graphical difference via a class or something when the editor
    // is unlocked (e.g. maybe a blue drop shadow)
    component.editor = new MediumEditor(wrapperNode, {
        toolbar: {
            buttons: ['bold', 'italic', 'underline', 'anchor', 'pre', 'unorderedlist', 'h1', 'h2', 'h3', 'removeFormatting'],
        },
    });

    component.editor.subscribe('editableInput', () => {
        if (!component.editor) {
            console.error('Warning: Trying to change destroyed editor');
        }
        send('changedHtml', wrapperNode.innerHTML);
    });
}

module.exports = {
    setupMediumEditor,
};
