'use strict';
const lodash = require('lodash');
const {spectronLaunch, waitUntilMounted, strip, waitUntilBodyText} = require('elmoed').testutils;

function _scrub(s) {
    return s.replace(/\W+/g, ''); // scrub non word chars
}

describe('Kitchen Sink test slideshow example', () => {
    const ARGS = ['lib/main.js', 'spec/support/data/kitchen-sink/ks.whiteboard'];
    let app = null;
    let text = null;
    beforeEach((done) => {
        spectronLaunch(...ARGS, application => {
            app = application;
            waitUntilMounted(app, () => {
                app.client.getText('body').then(bodyText => {
                    text = bodyText;
                    done();
                });
            });
        });
    });

    it('shows a slide with a term and editor', done => {
        const EXPECTED_START = strip(`
            Terminal and editor
            TEST1.JS TEST2.HTML
        `).toLowerCase();
        expect(strip(text).toLowerCase()).toContain(EXPECTED_START);

        const checkDone = lodash.after(2, done);

        waitUntilBodyText(app, 'var', bodyText => {
            expect(strip(bodyText).toLowerCase())
                .toContain(strip('var example_js_file = true'));
            checkDone();
        });

        waitUntilBodyText(app, '$', bodyText => {
            /*
            // Can't guarantee the PS1 is configured like this
            expect(_scrub(bodyText).toLowerCase())
                .toContain(_scrub('spec/support/data/kitchen-sink'));
            */
            checkDone();
        });
    });

    /*
    // Have to disable, shadow dom too hard for now
    xit('has a side-bar that appears with F2 and shows slides', done => {
        app.client.getText('#slides_drawer /deep/').then(drawerText => {
            // Should be closed by default
            expect(strip(drawerText)).toEqual('');

            // Lets now open it by sending an F2 keystroke
            app.client.keys('F2').then(() => {
                app.client.getText('#slides_drawer ::shadow').then(drawerText => {
                    // Show first slide
                    expect(strip(drawerText)).toContain(strip(`
                        Terminal and editor
                    `));

                    // Show second slide
                    expect(strip(drawerText)).toContain(strip(`
                        Second Slide With Markdown
                        Dabat decurrit memini
                    `));

                    done();
                });
            });

        });
    });

    // grrr webdriver.io is terrible code, they deprecate functions WITHOUT
    // replacements, and the reply is "don't take the warning seriously"...
    // wtf?
    // fit('can go to markdown slide with Ctrl+Right', done => {
    fit('can go to markdown slide with Right Click and Down', done => {
        // Ensure it is first slide
        expect(strip(text)).toContain('Terminal and editor');
        app.client.rightClick().then(() => {
            setTimeout(() => {
                app.client.keys('ArrowDown').keys('Enter').then(() => {
                    app.client.getText('body').then(bText => {
                        expect(strip(bText)).toContain('Second Slide With Markdown');
                        expect(strip(bText)).toContain('Dabat decurrit memini');
                        done();
                    });
                });
            }, 1000);
        });
    });
    */

    /*
    fit('can go to markdown slide with Ctrl+Right', done => {
        expect(strip(text)).toContain('Terminal and editor');
        app.client.leftClick('wb-title').then(() => {
            app.client.keys('Control').keys('ArrowRight').keys('NULL').then(() => {
                app.client.getText('body').then(bText => {
                    expect(strip(bText)).toContain('Second Slide With Markdown');
                    expect(strip(bText)).toContain('Dabat decurrit memini');
                    done();
                });
            });
        });
    });
    */
});

