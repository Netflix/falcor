var Benchmark = require('benchmark');
function runner(testCfg, count, done) {
    var testSuiteCount = 0;
    var names = Object.keys(testCfg.tests);
    var totalResults = names.
        reduce(function(acc, n) {
            acc[n] = [];
            return acc;
        }, {});
    
    function recurse() {
        _runner(testCfg, function(results) {
            testSuiteCount++;
            console.warn('Test Count ' + testSuiteCount);
            results.forEach(function(r) {
                totalResults[r.name].push(r);
            });
            if (testSuiteCount === count) {
                var transform = Object.
                    keys(totalResults).
                    reduce(function(acc, name) {
                        var results = totalResults[name];
                        var row = [name];
                        results.forEach(function(r) {
                            row.push(r.hz);
                        });
                        acc.push(row);
                        return acc;
                    }, []);
                var csv = [];
                
                for (var i = 0; i < count + 1; i++) {
                    var csvRow = [];
                    for (var j = 0; j < transform.length; j++) {
                        csvRow[j] = transform[j][i];
                    }
                    csv[i] = csvRow;
                }
                done(csv);
            } else {
                recurse();
            }
        });
    }
    
    recurse();
};

function _runner(testCfg, done) {
    var countDone = 0;
    var suite = new Benchmark.Suite(testCfg.name);
    var results = [];
    var tests = testCfg.tests,
        testCount = 0;
    for (var testName in tests) {
        var testFn = tests[testName];
        if (typeof testFn === 'function') {
            suite.add(testName, testFn);
            testCount++;
        }
    }

    suite.
        on('cycle', function (event) {
            countDone++;
            var str = countDone + ' out of ' + suite.length + ' completed';
            console.warn(str);
            results.push({
                name: event.target.name,
                hz: event.target.hz,
                deviation: event.target.stats.deviation
            });
        }).
        on('complete', function () {
            done(results);
        });

    setTimeout(function () {
        // Note: run in timeout so that
        // script runner doesn't log an invalid error that it timed out
        suite.run({
            async: !!testCfg.async
        });
    }, 50);
}

module.exports = runner;

