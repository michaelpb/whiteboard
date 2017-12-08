/* eslint-disable no-param-reassign */

const { mockWindowManager, strip } = require('elmoed').testutils;
const Title = require('../../lib/text/Title');

const TITLE_EXAMPLE = `
This is a title!
`;

// Integrat-y unit tests for slide Title
describe('Title', () => {
    let manager = null;

    beforeEach(() => {
        ({ manager } = mockWindowManager('title', Title));
    });

    afterEach(() => {
        manager = null;
    });

    it('successfully generates empty title', (done) => {
        manager.createWindow('title', (title) => {
            expect(Object.keys(title.getProps())).toEqual(['html', 'locked']);
            const { html } = title.getProps();
            expect(strip(html)).toEqual('');
            done();
        }, '');
    });

    it('successfully generates typical title in props', (done) => {
        manager.createWindow('title', (title) => {
            expect(Object.keys(title.getProps())).toEqual(['html', 'locked']);
            const { html } = title.getProps();
            expect(strip(html)).toEqual(strip(`
                This is a title!
            `));
            done();
        }, TITLE_EXAMPLE);
    });

    it('renders basic markdown', (done) => {
        manager.createWindow('title', (title) => {
            expect(Object.keys(title.getProps())).toEqual(['html', 'locked']);
            const { html } = title.getProps();
            expect(strip(html)).toEqual(strip(`
                This <strong>is</strong> a title!
                <br />
                And another line!
            `));
            done();
        }, 'This *is* a title\nAnd another line!');
    });

    it('class successfully generates preview', (done) => {
        const result = Title.getIconicPreview('This is a title');
        expect(strip(result)).toContain('This is a title');
        done();
    });
});

