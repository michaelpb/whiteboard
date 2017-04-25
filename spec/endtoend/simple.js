'use strict';
const {spectronLaunch, waitUntilMounted, strip} = require('../../lib/testutils');

describe('Simple editor example', () => {
    const ARGS = ['examples/simple/main.js', 'examples/simple/data/manifest.json'];
    let app = null;
    beforeEach(function(done) {
        spectronLaunch(...ARGS, application => {
            app = application;
            done();
        });
    });

    it('shows the mounted window with expected text', done => {
        waitUntilMounted(app, () => {
            app.client.getText('body').then(text => {
                const EXP = `Save Load from save example text Elmoed Paint
                             Save Load from save example text Elmoed Paint`;
                expect(strip(text)).toEqual(strip(EXP));
                done();
            });
        });
    });

    /*
    it('changing textarea and saving changes both', done => {
        const TEXT = 'test text';
        waitUntilMounted(app, () => {
            // Edit text area
            console.log(' editing backend');
            app.client.setValue('#mount_1 textarea', TEXT)
                .then(() => {
                    console.log(' saving to bg');
                    // "Save" to backend
                    app.client.click('#mount_1 button:first_child')
                        .then(() => {
                            done();
                        });
                });
        });
    });
    */

    afterEach(function (done) {
        if (app === null) {
            return done();
        }

        return app.stop().then(() => {
            // console.log('should be done');
            app = null;
            done();
        });
    });
});

