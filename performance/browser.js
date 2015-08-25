var testRunner = require('./testRunner');
var testReporter = require('./reporters/nodeTestReporter');
var CSVFormatter = require('./formatter/CSVFormatter');

var compose = function(f, g) {
    return function(v) {
        return f(g(v));
    };
};

var suite = require('./tests/standard')('Browser Tests');

var gc = function() {
    if (typeof window !== 'undefined' && window && window.gc) {
        return function() {
            window.gc();
        }
    } else {
        return null;
    }
};

var env = navigator.userAgent;
var logger = console.log.bind(console);
var resultsReporter = compose(testReporter.resultsReporter, CSVFormatter.toTable);
var benchmarkReporter = compose(testReporter.benchmarkReporter, CSVFormatter.toRow.bind(null, env));

testRunner(suite, env, benchmarkReporter, resultsReporter, logger, gc());

