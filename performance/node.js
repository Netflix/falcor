var testRunner = require('./testRunner');
var testReporter = require('./reporters/nodeTestReporter');
var testConfig = require('./testConfig')();
var testSuiteGenerator = require('./testSuiteGenerator');
var CSVFormatter = require('./formatter/CSVFormatter');

var models = testConfig.models;
var formats = testConfig.formats;
var tests = testConfig.get;
var suite = testConfig.suite;

suite.tests = testSuiteGenerator({

    iterations: 1,

    models: {
        //'modelWithoutSource' : models.model,
        'modelWithSource' : models.modelWithSource
    },

    formats: formats,

    tests: {
        'scrollGallery': tests.scrollGallery,
        'simple': tests.simple,
        'reference': tests.reference,
        'complex': tests.complex
    }

});

testRunner(suite, 10, 'node ' + process.version, CSVFormatter.pipe(CSVFormatter.toTable, testReporter));
