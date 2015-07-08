var Benchmark = require('benchmark');
var CSVFormatter = require('./formatter/CSVFormatter');

var KARMA = global.__karma__;

function createSuite(testCfg, iteration) {

    var tests = testCfg.tests;
    var testName;

    var suite = ((KARMA) ? global.suite : Benchmark.Suite)(testCfg.name + ':' + iteration, function() {});

    for (testName in tests) {
        if (KARMA) {
            global.benchmark(testName, tests[testName], {defer: false});
        } else {
            suite.add(testName, tests[testName], {defer: false});
        }
    }

    return suite;
}

function createSuites(testCfg, iterations) {
    var suites = [];

    for (var i = 0; i < iterations; i++) {
        suites.push(createSuite(testCfg, i));
    }

    return suites;
}

function runner(testCfg, env, onBenchmarkComplete, onComplete, log) {

    var suites = createSuites(testCfg, 1);

    if (!KARMA) {
        run(suites, env, onBenchmarkComplete, onComplete, log);
    } else {
        // KARMA will run the global "suites"
    }
}

function runGC() {
    var jscontext;

    if (typeof global !== 'undefined' && global && global.gc) {
        jscontext = global;
    } else if (typeof window !== 'undefined' && window && window.gc) {
        jscontext = window;
    }

    if (jscontext) {
        jscontext.gc();
        return true;
    }

    return false;
}

function run(suites, env, onBenchmarkComplete, onComplete, log) {

    var results = {};

    log('Running Perf Tests');

    var _run = function() {

        suites.shift().
            on('cycle', function (event) {

                if(runGC()) {
                    log('Ran GC between benchmarks');
                }

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
            run({
                async: true
            });
    };

    _run();
}

module.exports = runner;
