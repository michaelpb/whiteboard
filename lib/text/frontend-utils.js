/*const mediumEditorInsertPlugin = require('medium-editor-insert-plugin');
mediumEditorInsertPlugin(jQuery);*/
/*const MediumEditor = require('medium-editor');
window.log(['this is mediumeditor', MediumEditor]);*/

const buttonSets = {
    full: [
        'bold',
        'italic',
        'underline',
        'anchor',
        'pre',
        'unorderedlist',
        'h1',
        'h2',
        'h3',
        'removeFormatting',
    ],
    limited: [
        'bold',
        'italic',
        'underline',
    ],
};

function setupMediumEditor(component, buttonSet = 'full') {
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
    const buttons = buttonSets[buttonSet];
    component.editor = new MediumEditor(wrapperNode, {
        toolbar: { buttons },
        paste: {
            forcePlainText: false,
            cleanPastedHTML: true,
            cleanAttrs: ['class', 'style', 'dir'],
            cleanTags: ['meta'],
            unwrapTags: ['div']
        },
    });

    // Initialize medium-editor-insert-plugin with ugly jQuery wrapper
    // NOTE: Disabled because electron incompatibility
    // TODO: Remove this once confirmed that its too difficult to add
    // $(wrapperNode).mediumInsert({
    //    editor: component.editor,
    // });

    component.editor.subscribe('editableInput', () => {
        if (!component.editor) {
            console.error('Warning: Trying to change destroyed editor');
        }
        send('changedHtml', wrapperNode.innerHTML);
    });
}


function handleInsert(editor, text) {
    // Toggling on current focus
    // window.log(['this is text', text]);
    editor.checkSelection();
    editor.pasteHTML(text);
}
module.exports = {
    setupMediumEditor,
    handleInsert,
};
