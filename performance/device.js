var testRunner = require('./testRunner');
var testReporter = require('./reporters/nodeTestReporter');
var CSVFormatter = require('./formatter/CSVFormatter');

var device;

// Creates the test suites
var suite = require('./tests/standard')('Device Tests');

try {
    // Needs explicit 'npm install nf-falcor-device-perf'. Not part of package.json
    device = require('nf-falcor-device-perf');
    device.runTests(suite, testRunner, {}, CSVFormatter);

} catch (e) {
    console.log('Not running device tests. Need to npm install "nf-falcor-device-perf"');
}
