'use strict';
const lodash = require('lodash');
const {spectronLaunch, waitUntilMounted, strip, waitUntilBodyText} = require('elmoed').testutils;

function _scrub(s) {
    return s.replace(/\W+/g, ''); // scrub non word chars
}

xdescribe('Kitchen Sink test slideshow example', () => {
    const ARGS = ['lib/main.js', 'spec/support/data/kitchen-sink/ks.whiteboard'];
    let app = null;
    beforeEach(function(done) {
        spectronLaunch(...ARGS, application => {
            app = application;
            done();
        });
    });

    const EXPECTED_START = strip('Terminal and editor TEST1.JS TEST2.HTML').toLowerCase();
    it('shows a slide with a term and editor', done => {
        waitUntilMounted(app, () => {
            app.client.getText('body').then(text => {
                expect(strip(text).toLowerCase()).toContain(EXPECTED_START);
                // done();

                const checkDone = lodash.after(2, done);

                waitUntilBodyText(app, 'var', bodyText => {
                    expect(strip(bodyText).toLowerCase())
                        .toContain(strip('var example_js_file = true'));
                    checkDone();
                });

                waitUntilBodyText(app, '$', bodyText => {
                    // the PS1 prompt should contain this
                    expect(_scrub(bodyText).toLowerCase())
                        .toContain(_scrub('spec/support/data/kitchen-sink'));
                    checkDone();
                });
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

