/* eslint-disable no-param-reassign */

const { mockWindowManager, strip } = require('elmoed').testutils;
const Markdown = require('../../lib/text/Markdown');

const MARKDOWN_EXAMPLE = `
# this is a test

- and i am a

- list
`;

const LONG_MARKDOWN_EXAMPLE = `
# this is a test - and i am a - list
# this is a test - and i am a - list
# this is a test - and i am a - list
# this is a test - and i am a - list
`;

const MARKDOWN_EXAMPLE_WITH_LINK = `
And [here](/path) is a link
`;

// Integrat-y unit tests for Markdown viewer
describe('Markdown', () => {
    let manager = null;

    beforeEach(() => {
        ({ manager } = mockWindowManager('markdown', Markdown));
    });

    afterEach(() => {
        manager = null;
    });

    it('successfully generates empty markdown', (done) => {
        manager.createWindow('markdown', (markdown) => {
            expect(Object.keys(markdown.getProps())).toEqual(['html', 'locked']);
            const { html } = markdown.getProps();
            expect(strip(html)).toEqual('');
            done();
        }, '');
    });

    it('successfully generates typical markdown in props', (done) => {
        manager.createWindow('markdown', (markdown) => {
            const { html } = markdown.getProps();
            expect(strip(html)).toEqual(strip(`
                h1 id this is a test this is a test h1 ul li p and i am a p li
                li p list p li ul
            `));
            done();
        }, MARKDOWN_EXAMPLE);
    });

    it('relativizes file paths correctly', (done) => {
        const IMAGE_EXAMPLE = '![alttext](file://./some/image.jpg)';

        manager.createWindow('markdown', (markdown) => {
            markdown.path = '/fake/path.whiteboard!slide1!markdown';
            const { html } = markdown.getProps();
            expect(strip(html)).toEqual(strip(`
                p img src file fake some image jpg alt alttext p
            `));
            done();
        }, IMAGE_EXAMPLE);
    });

    it('class successfully generates preview', (done) => {
        const result = Markdown.getIconicPreview(MARKDOWN_EXAMPLE);
        expect(strip(result)).toEqual(strip(`
            this is a test and i am a list
        `));
        done();
    });

    it('class successfully generates preview avoiding links', (done) => {
        const result = Markdown.getIconicPreview(MARKDOWN_EXAMPLE_WITH_LINK);
        expect(strip(result)).toEqual(strip(`
            And here is a link
        `));
        done();
    });

    it('class successfully generates abbreviated preview', (done) => {
        const result = Markdown.getIconicPreview(LONG_MARKDOWN_EXAMPLE);
        expect(strip(result)).toEqual(strip(`
            this is a test and i am a list this is a tes 8230
        `));
        done();
    });
});

