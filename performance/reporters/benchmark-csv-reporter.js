var BenchCSVReporter = function(baseReporterDecorator) {

    baseReporterDecorator(this);

    /*
       RESULTS STRUCTURE:

            <browserName>: {
                <suiteName>: [{
                    id,
                    description,
                    ...
                    benchmark: {
                        name,
                        hz,
                        suite,
                        stats
                    }
                }]
            }
       }

    */

    var results = {};

    this.onRunComplete = function(browsers, resultInfo) {

        var browser;
        var suites;
        var suite;
        var benchmark;
        var reporter = this;

        for (browser in results) {
            reporter.write(browser + '\n');

            suites = results[browser];

            for (suite in suites) {
                suites[suite].forEach(function(test) {
                    benchmark = test.benchmark;
                    reporter.write(benchmark.suite + ', ' + benchmark.name + ', ' + benchmark.hz + '\n');
                });
            }
        }
    };

    this.specSuccess = function(browser, result) {

        var browser = browser.name;
        var suite = result.benchmark.suite;
        var name = result.benchmark.name;
        var tests = results[browser] = results[browser] || {};

        tests[suite] = tests[suite] || [];
        tests[suite].push(result);

        this.write(browser + '  ' + suite + ': ' + name + ' at ' + Math.floor(result.benchmark.hz) + ' ops/sec\n');
    };
};

BenchCSVReporter.$inject = ['baseReporterDecorator'];

module.exports = {
  'reporter:benchmarkcsv': ['type', BenchCSVReporter]
};
