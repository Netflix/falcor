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
    models: {
        'model': models.modelWithSource
    },
    formats: ['PathMap', 'JSON']
});
testRunner(suite, 'node ' + process.version, CSVFormatter.pipe(CSVFormatter.toTable, testReporter));
