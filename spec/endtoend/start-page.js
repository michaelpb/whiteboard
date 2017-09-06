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
        expect(strip(text).toLowerCase()).toContain('open deck');
        expect(strip(text).toLowerCase()).toContain('new deck');
        expect(strip(text).toLowerCase()).toContain('whiteboard');
        done();
    });
});

