var testConfig = require('./testConfig')();
var testRunner = require('./testRunner');
var testReporter = require('./reporters/browserTestReporter');
var testSuiteGenerator = require('./testSuiteGenerator');
var CSVFormatter = require('./formatter/CSVFormatter');

var compose = function(f, g) {
    return function(v) {
        return f(g(v));
    };
};

var curry = function(fn, arg) {
    return fn.bind(null, arg);
};

var models = testConfig.models;
var formats = testConfig.formats;
var tests = testConfig.get;
var suite = testConfig.suite;

suite.tests = testSuiteGenerator({

    iterations: 1,

    models: {
        'model': models.model
    },

    formats: [
        'JSON'
    ],

    tests: {
        'sync-simple': tests.syncSimple,
        'sync-reference': tests.syncReference,
        'simple': tests.simple,
        'complex': tests.complex,
        'reference': tests.reference
    }

});

var env = navigator.userAgent;
var resultsReporter = compose(testReporter.resultsReporter, CSVFormatter.toTable);
var benchmarkReporter = compose(testReporter.benchmarkReporter, curry(CSVFormatter.toRow, env));

testRunner(suite, 2, env, benchmarkReporter, resultsReporter);