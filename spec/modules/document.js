'use strict';

/*
const Document = require('../../modules/document/document');
const libscroll_fixtures = require('libscroll/spec/support/fixtures');

describe('Document editor', () => {
    let doc;
    let hooked = [];
    let mock_on = (hook) => {hooked.push(hook)};

    const mock_editor = {
        electron: {
            ipcMain: { on: mock_on }
        }
    };

    beforeEach(() => {
        hooked = [];
        const workspace = libscroll_fixtures.make_workspace()
        const so_doc = workspace.objects.document[0];
        doc = new Document(mock_editor, so_doc, () => {});
    });

    it('instantiates and hooks expected events', () => {
        expect(doc).toBeTruthy();
        expect(doc.editing).toEqual(null);
        expect(hooked).toContain('document/document.md:edit');
        expect(hooked).toContain('document/document.md:normal');
        expect(hooked).toContain('document/document.md:insert');
        expect(hooked).toContain('document/document.md:edit_to_edit');
        expect(hooked).toContain('document/document.md:split');
    });

    it('produces editable blocks for frontend', () => {
        const opts = doc.get_opts();
        expect(opts.blocks).toBeTruthy();
        expect(opts.blocks.length).toEqual(4);
        for (const block of opts.blocks) {
            expect(block.id).toBeTruthy();
            expect(block.source).toBeTruthy();
            expect(block.preview).toBeTruthy();
            expect(block.editing).toEqual(false);
        }
    });
});
*/
