var testRunner = require('./testRunner');
var testReporter = require('./reporters/nodeTestReporter');
var CSVFormatter = require('./formatter/CSVFormatter');

var compose = function(f, g) {
    return function(v) {
        return f(g(v));
    };
};

var gc = function() {
    if (typeof global !== 'undefined' && global && global.gc) {
        return function() {
            global.gc();
        };
    } else {
        return null;
    }
};

var env = 'node ' + process.version;
var logger = console.log.bind(console);
var resultsReporter = compose(testReporter.resultsReporter, CSVFormatter.toTable);
var benchmarkReporter = compose(testReporter.benchmarkReporter, CSVFormatter.toRow.bind(null, env));

var suite = require('./tests/standard')('Node Tests');
testRunner(suite, env, benchmarkReporter, resultsReporter, logger, gc());
