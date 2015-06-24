var Benchmark = require('benchmark');
var csvFormatter = require('./testResultsCSVFormatter');

function createSuite(testCfg) {

    var tests = testCfg.tests;
    var testName;

    var suite = new Benchmark.Suite(testCfg.name);

    for (testName in tests) {
        suite.add(testName, tests[testName]);
    }

    return suite;
}

function runner(testCfg, iterations, onTestComplete) {

    var suite = createSuite(testCfg);
    var iteration = 0;
    var async = Boolean(testCfg.async);

    var totalResults = Object.
        keys(testCfg.tests).
        reduce(function(results, testName) {
            results[testName] = [];
            return results;
        }, {});

    var onIterationComplete = function(results) {

        iteration++;

        console.warn('Iteration ' + iteration);

        results.forEach(function(r) {
            totalResults[r.name].push(r);
        });

        if (iteration === iterations) {
            onTestComplete(csvFormatter(totalResults, iterations));
        } else {
            run(suite, Boolean(testCfg.async), onIterationComplete);
        }
    };

    run(suite, async, onIterationComplete);
}

function run(suite, async, onIterationComplete) {

    var testsRun = 0;
    var results = [];

    suite.off();
    suite.reset();

    suite.
        on('cycle', function (event) {

            testsRun++;

            console.warn(testsRun + ' out of ' + event.currentTarget.length + ' completed');

            results.push({
                name: event.target.name,
                hz: event.target.hz,
                deviation: event.target.stats.deviation
            });
        }).
        on('complete', function() {
            onIterationComplete(results);
        }).
        run({
            async: async,
            delay: 0.01   // secs
        });
}

module.exports = runner;