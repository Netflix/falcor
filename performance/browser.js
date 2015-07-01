var testConfig = require('./testConfig')();
var testRunner = require('./testRunner');
var testReporter = require('./reporters/browserTestReporter');
var testSuiteGenerator = require('./testSuiteGenerator');
var CSVFormatter = require('./formatter/CSVFormatter');

var models = testConfig.models;
var formats = testConfig.formats;
var tests = testConfig.get;
var suite = testConfig.suite;

suite.tests = testSuiteGenerator({

    iterations: 1,

    models: {
        'model': models.model
    },

    formats: formats,

    tests: {
        'scrollGallery': tests.scrollGallery,
        'simple': tests.simple,
        'reference': tests.reference,
        'complex': tests.complex
    }

});

testRunner(suite, 2, navigator.userAgent, CSVFormatter.pipe(CSVFormatter.toTable, testReporter));
