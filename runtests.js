// Generate syntax errors for invalid versions of node
const requires_node_8 = () => {};
const {requires_destructuring} = {};
const requires_default_parameters = (param = true) => {};

// Configure and run test runner
const Jasmine = require('jasmine');
const {SpecReporter} = require('jasmine-spec-reporter');
const noop = () => {};
const jrunner = new Jasmine();
jrunner.configureDefaultReporter({print: noop});    // remove default reporter logs
if (process.argv.indexOf('--verbose') !== -1) {
    jrunner.configureDefaultReporter({print: console.log});    // include for traceback
}
jasmine.getEnv().addReporter(new SpecReporter());   // add jasmine-spec-reporter
jasmine.DEFAULT_TIMEOUT_INTERVAL = 15 * 1000;
if (process.env.SKIP_E2E && process.env.SKIP_E2E === 'true') {
    jrunner.loadConfigFile('./spec/support/jasmine_skip_e2e.json');
} else {
    jrunner.loadConfigFile('./spec/support/jasmine.json');
}
jrunner.execute();
