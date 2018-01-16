/* eslint-disable no-param-reassign */
/* eslint-disable no-undef */

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
            unwrapTags: ['div'],
        },
    });

    // Initialize medium-editor-insert-plugin with ugly jQuery wrapper
    // NOTE: Disabled because electron incompatibility
    // TODO: Remove this once confirmed that its too difficult to add
    // $(wrapperNode).mediumInsert({
    //    editor: component.editor,
    // });

    // If its empty, ensure focused
    if (html.trim() === '') {
        // window.log('trying to select elements');
        component.editor.selectElement(wrapperNode.childNodes[0]);
    }
    // window.log(['html is' , html]);

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
