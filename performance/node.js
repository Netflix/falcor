var testRunner = require('./testRunner');
var testReporter = require('./reporters/nodeTestReporter');
var testConfig = require('./testConfig')();
var testSuiteGenerator = require('./testSuiteGenerator');
var CSVFormatter = require('./formatter/CSVFormatter');

var models = testConfig.models;
var formats = testConfig.formats;
var tests = testConfig.get;
var suite = testConfig.suite;

var TESTS = {
    'scrollGallery': tests.scrollGallery,
    'complex': tests.complex
};
suite.tests = testSuiteGenerator({
    iterations: 10,
    models: {
        'model': models.modelWithSource
    },
    formats: ['PathMap']
});
testRunner(suite, 'node ' + process.version, CSVFormatter.pipe(CSVFormatter.toTable, testReporter));
