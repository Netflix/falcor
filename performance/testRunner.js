var Benchmark = require('benchmark');
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

function runner(testCfg, iterations, onComplete) {

    var suites = createSuites(testCfg, iterations);
    if (!KARMA) {
        run(suites, onComplete);
    } else {
        // KARMA will run the global "suites"
    }
}

function run(suites, onComplete) {

    var results = {};

    var _run = function() {

        suites.shift().
            on('start', function() {
                console.log(this.name);
            }).
            on('cycle', function (event) {
                var benchmarkName = event.target.name;

                console.log(benchmarkName + ":::" + JSON.stringify(event.target.hz));

                results[benchmarkName] = results[benchmarkName] || [];
                results[benchmarkName].push({
                    hz: event.target.hz,
                    deviation: event.target.stats.deviation
                });
            }).
            on('error', function(e) {
                console.log(e.target.error);
            }).
            on('complete', function() {
                if (suites.length === 0) {
                    onComplete(results);
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