const lodash = require('lodash');
const { spectronLaunch, waitUntilMounted, strip, waitUntilBodyText } = require('elmoed').testutils;

const CI_E2E_DELAY = 1000; // one second

function delay(callback) {
    // Used to add pauses in e2e tests in certain steps for CI, to ensure
    // consistently successful e2e tests....
    // For testing locally, it's less important.
    let timeout = 10;
    if (process.env.TESTS_EXTRA_DELAY) {
        timeout = CI_E2E_DELAY;
    }
    return (...args) => {
        setTimeout(() => callback(...args), timeout);
    };
}

function openDrawer(app, done) {
    // Click on title to make sure nothing is focused
    app.client.leftClick('wb-title').then(delay(() => {
        app.client.keys('Control').keys('Enter').keys('NULL')
            .then(delay(done));
    }));
}

function nextSlide(app, done) {
    // Click on title to make sure nothing is focused
    app.client.leftClick('wb-title').then(delay(() => {
        app.client.keys('Control').keys('Space').keys('NULL')
            .then(delay(done));
    }));
}

function previousSlide(app, done) {
    // Click on title to make sure nothing is focused
    app.client.leftClick('wb-title').then(delay(() => {
        app.client.keys('Control').keys('Shift').keys('Space')
            .then(delay(done));
    }));
}

function clickAddSlideButton(app, done) {
    app.client.click('#slides_drawer .Deck--add-slide-button').then(() => {
        app.client.getText('#slides_drawer')
            .then(delay(done));
    });
}

function getBodyText(app, done) {
    app.client.getText('body').then(delay(done));
}

function runTerm(app, commands, done) {
    app.client.leftClick('.xterm').then(delay(() => {
        let client = app.client;
        for (const command of commands) {
            client = client.keys(command).keys('Enter');
        }
        client.keys('NULL').then(delay(done));
    }));
}

function checkFirstSlide(app, done) {
    getBodyText(app, delay((bodyText) => {
        const EXPECTED_START = strip(`
            Terminal and editor
            TEST1.JS TEST2.HTML
        `).toLowerCase();
        expect(strip(bodyText).toLowerCase()).toContain(EXPECTED_START);

        const checkDone = lodash.after(2, done);

        waitUntilBodyText(app, 'var', (bodyText2) => {
            expect(strip(bodyText2).toLowerCase())
                .toContain(strip('var example_js_file'));
            // .toContain(strip('var example_js_file = true'));
            checkDone();
        });

        waitUntilBodyText(app, '$', () => {
            // Lets try running some bash commands
            runTerm(app, ['cd /', 'ls'], () => {
                checkDone();
                /*
                // For some reason, these don't work :/
                app.client.getText('.xterm').then(bodyText2 => {
                    expect(scrub(bodyText2).toLowerCase())
                        .toContain(scrub('bin'));
                    expect(scrub(bodyText2).toLowerCase())
                        .toContain(scrub('lib'));
                    checkDone();
                });
                */
            });
        });
    }));
}

const optionalDescribe = process.env.TESTS_SKIP_UNRELIABLE ?
    xdescribe : describe;

describe('KitchenSink E2E smoke tests', () => {
    const ARGS = ['lib/main.js', 'spec/support/data/kitchen-sink/ks.whiteboard'];
    let app = null;
    beforeEach((done) => {
        spectronLaunch(...ARGS, (application) => {
            app = application;
            waitUntilMounted(app, done);
        });
    });


    it('shows a slide with a term and editor', (done) => {
        checkFirstSlide(app, done);
    });

    it('has a side-bar that appears with Ctrl+Enter and shows slides', (done) => {
        openDrawer(app, () => {
            app.client.getText('#slides_drawer').then((drawerText) => {
                // Show both slides
                expect(strip(drawerText)).toContain(strip(`
                    Terminal and editor
                    Second Slide With Markdown
                    Dabat decurrit memini
                `));
                done();
            });
        });
    });
});

optionalDescribe('Kitchen Sink E2E rigorous tests', () => {
    const ARGS = ['lib/main.js', 'spec/support/data/kitchen-sink/ks.whiteboard'];
    let app = null;
    beforeEach((done) => {
        spectronLaunch(...ARGS, (application) => {
            app = application;
            waitUntilMounted(app, done);
        });
    });

    it('clicking on add slide button creates new slides with appropriate names', (done) => {
        openDrawer(app, () => {
            clickAddSlideButton(app, (drawerText) => {
                // Show new slide
                expect(strip(drawerText)).toContain(strip(`
                    New Slide 1
                    Terminal and editor
                    Second Slide With Markdown
                    Dabat decurrit memini
                `));

                clickAddSlideButton(app, (drawerText2) => {
                    // Show new slide
                    expect(strip(drawerText2)).toContain(strip(`
                        New Slide 2
                        New Slide 1
                        Terminal and editor
                        Second Slide With Markdown
                        Dabat decurrit memini
                    `));
                    done();
                });
            });
        });
    });

    it('ctrl+space goes to next slide and ctrl+shift+space goes to previous', (done) => {
        function checkPrevious() {
            // goes back and checks previous slide to make sure it behaves as
            // before
            previousSlide(app, () => {
                checkFirstSlide(app, () => {
                    done();
                });
            });
        }

        nextSlide(app, () => {
            getBodyText(app, (bodyText) => {
                expect(strip(bodyText)).toContain(strip(`
                    Second Slide With Markdown
                `));
                expect(strip(bodyText)).toContain(strip(`
                    Fervida Minos tractoque adeundi et tenuere seque nostro.
                    Agri forte petitos est cum tangit virtute furtiva, prensis
                    et luce fovi. *Auras oscula* suberant et illuc.
                `));
                checkPrevious();
            });
        });
    });
});

