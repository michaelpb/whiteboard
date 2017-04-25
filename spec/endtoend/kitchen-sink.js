'use strict';
const {spectronLaunch, waitUntilMounted, strip} = require('elmoed').testutils;

describe('Kitchen Sink test slideshow example', () => {
    const ARGS = ['lib/main.js', 'spec/support/data/kitchen-sink/ks.whiteboard'];
    let app = null;
    beforeEach(function(done) {
        spectronLaunch(...ARGS, application => {
            app = application;
            done();
        });
    });

    const EXPECTED_START = strip('Terminal and editor TEST1.JS TEST2.HTML').toLowerCase();
    it('shows an editor and terminal with expected text', done => {
        waitUntilMounted(app, () => {
            app.client.getText('body').then(text => {
                expect(strip(text).toLowerCase()).toContain(EXPECTED_START);
                done();
            });
        });
    });

    afterEach(function (done) {
        done();
        return;

        // TODO: Fix this, I think it has to do with node-pty lingering alive
        if (app === null || !app.isRunning()) {
            return done();
        }

        return app.stop().then(() => {
            console.log('should be done');
            app = null;
            done();
        });
    });
});

