// Generate syntax errors for invalid versions of node
const requires_node_5 = () => {};
const {requires_harmony_destructuring} = {};
const requires_harmony_default_parameters = (param = true) => {};

// Configure and run test runner
const Jasmine = require('jasmine');
const SpecReporter = require('jasmine-spec-reporter');
const noop = () => {};
const jrunner = new Jasmine();
jrunner.configureDefaultReporter({print: noop});    // remove default reporter logs
//jrunner.configureDefaultReporter({print: console.log});    // include for traceback
jasmine.getEnv().addReporter(new SpecReporter());   // add jasmine-spec-reporter
jrunner.loadConfigFile();                           // load jasmine.json configuration
jrunner.execute();
