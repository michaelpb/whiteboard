const { spectronLaunch, waitUntilMounted, strip } = require('elmoed').testutils;

describe('Start screen e2e', () => {
    const ARGS = ['lib/main.js', '--show-start'];
    let app = null;
    let text = null;
    beforeEach((done) => {
        spectronLaunch(...ARGS, (application) => {
            app = application;
            waitUntilMounted(app, () => {
                app.client.getText('body').then((bodyText) => {
                    text = bodyText;
                    done();
                });
            });
        });
    });

    it('shows a start menu', (done) => {
        const EXPECTED_START = strip(`
            Whiteboard
            Open deck...
            New deck...
            Import from directory...
        `).toLowerCase();
        // About
        expect(strip(text).toLowerCase()).toContain(EXPECTED_START);
        done();
    });
});

