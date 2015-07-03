var Benchmark = require('benchmark');
var CSVFormatter = require('./formatter/CSVFormatter');

var KARMA = global.__karma__;

function createSuite(testCfg, iteration) {

    var tests = testCfg.tests;
    var testName;

    var suite = ((KARMA) ? global.suite : Benchmark.Suite)(testCfg.name + ':' + iteration, function(){});

    for (testName in tests) {
        if (KARMA) {
            global.benchmark(testName, tests[testName]);
        } else {
            suite.add(testName, tests[testName]);
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

function runner(testCfg, iterations, env, onBenchmarkComplete, onComplete) {

    var suites = createSuites(testCfg, iterations);

    if (!KARMA) {
        run(suites, env, onBenchmarkComplete, onComplete);
    } else {
        // KARMA will run the global "suites"
    }
}

function run(suites, env, onBenchmarkComplete, onComplete) {

    var results = {};

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
            /*
            on('error', function(e) {
                console.log(e.target.error);
            }).
            */
            on('complete', function() {
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