var testRunner = require('./testRunner');
var testReporter = require('./reporters/browserTestReporter');
var testConfig = require('./testConfig')();
var testSuiteGenerator = require('./testSuiteGenerator');
var csvFormatter = require('./testResultsCSVFormatter');

var models = testConfig.models;
var formats = testConfig.formats;
var tests = testConfig.get;
var suite = testConfig.suite;

suite.tests = testSuiteGenerator({

    iterations: 1,

    models: {
        'model': models.model,
        'macro': models.macro
    },

    tests: {
        'sync-simple': tests.syncSimple,
        'sync-reference': tests.syncReference
    }

});

testRunner(suite, 2, csvFormatter(testReporter));