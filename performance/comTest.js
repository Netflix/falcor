var model = new falcor.Model({cache: Cache()});
var recModel = new FModel(Cache());
E_model = new falcor.Model();
E_recModel = new FModel();
model._root.allowSync = true;
recModel._root.allowSync = true;
E_model._root.allowSync = true;
E_recModel._root.allowSync = true;

function runner(testCfg, count, done) {
    var testSuiteCount = 0;
    var names = Object.keys(testCfg.tests);
    var testLabel;
    var totalResults = names.
        reduce(function(acc, n) {
            acc[n] = [];
            return acc;
        }, {});

    function recurse() {
        _runner(testCfg, function(results) {
            testSuiteCount++;
            results.forEach(function(r) {
                totalResults[r.name].push(r);
            });
            console.error(testSuiteCount + ' out of ' + count + ' completed');
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
}

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

var config = startTesting(model, recModel, E_model, E_recModel);

onTestsLoaded(config);

//runner(config, 30, function(totalResults) {
//    console.error(totalResults.join('\n'));
//});

var v = Object.keys(Values());
var v1 = Values();
var v2 = Values();
var v3 = Values();
var v4 = Values();
