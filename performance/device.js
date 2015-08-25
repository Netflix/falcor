var testConfig = require('./testConfig')();
var testRunner = require('./testRunner');
var testSuiteGenerator = require('./testSuiteGenerator');
var CSVFormatter = require('./formatter/CSVFormatter');

var device;

var models = testConfig.models;
var formats = testConfig.formats;
var tests = testConfig.get;
var suite = require('./tests/get/request-queue');

try {
    // Needs explicit 'npm install nf-falcor-device-perf'. Not part of package.json
    device = require('nf-falcor-device-perf');

    device.runTests(suite, testRunner, testSuiteGenerator, CSVFormatter);

} catch (e) {
    console.log('Not running device tests. Need to npm install "nf-falcor-device-perf"');
}
