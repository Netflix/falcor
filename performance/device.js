var testConfig = require('./testConfig')();
var testRunner = require('./testRunner');
var testSuiteGenerator = require('./testSuiteGenerator');
var CSVFormatter = require('./formatter/CSVFormatter');

var device;

var models = testConfig.models;
var formats = testConfig.formats;
var tests = testConfig.get;
var suite = testConfig.suite;

try {
   device = require('nf-falcor-device-perf');

   suite.tests = testSuiteGenerator({
        iterations: 1,
        models: {
            'model': models.modelWithSource
        },
        formats: ['PathMap', 'JSON']
    });

   device.runTests(suite, testRunner, testSuiteGenerator, CSVFormatter);
} catch (e) {
   // Ignore
}