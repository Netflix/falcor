var Benchmark = require('benchmark');
var CSVFormatter = require('./formatter/CSVFormatter');

var KARMA = global.__karma__;

function createSuite(testCfg, log, gc) {

    var tests = testCfg.tests;
    var testName;
    var suite;
    var suiteName = testCfg.name;

    var gcRunner = function() {
        if (gc) {
            gc();
            log("Ran GC between cycles");
        }
    };

    if (KARMA) {
        suite = global.suite(suiteName, function() {});
    } else {
        suite = Benchmark.Suite(suiteName);
    }

    suite.on('cycle', gcRunner);

    for (testName in tests) {
        if (KARMA) {
            global.benchmark(testName, tests[testName], {defer: false});
        } else {
            suite.add(testName, tests[testName], {defer: false});
        }
    }

    return suite;
}

function runner(testCfg, env, onBenchmarkComplete, onComplete, log, gc) {

    var suites = [createSuite(testCfg, log, gc)];

    if (!KARMA) {
        run(suites, env, onBenchmarkComplete, onComplete, log);
    } else {
        // KARMA will run the global "suites"
    }
}

function run(suites, env, onBenchmarkComplete, onComplete, log) {

    var results = {};

    log('Running Perf Tests');

    var _run = function() {

        suites.shift().
            on('cycle', function (event) {

                var benchmark = event.target;
                var suite = benchmark.suite = this.name;

                var tests = results[env] = results[env] || {};

                tests[suite] = tests[suite] || [];
                tests[suite].push(benchmark);

                if (onBenchmarkComplete) {
                    onBenchmarkComplete(benchmark);
                }
            }).
            on('error', function(e) {
                var error = e.target.error;
                debugger

                log(error);
                log(error.stack);
            }).
            on('complete', function() {
                log('Perf Tests Complete');
                if (suites.length === 0) {
                    if (onComplete) {
                        onComplete(results);
                    }
                } else {
                    _run();
                }
            }).
            run({defer: false});
    };

    _run();
}

module.exports = runner;
