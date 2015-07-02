var path = require('path');
var fs = require('fs');
var CSVFormatter = require('../formatter/CSVFormatter');

var BenchCSVReporter = function(baseReporterDecorator, config, logger, helper) {

    var log = logger.create('reporter.csv');

    baseReporterDecorator(this);

    /*
       RESULTS STRUCTURE:

            <env>: {
                <suiteName>: [
                    {
                    suite: <suiteName>,
                    name: <benchName>,
                    hz: ...,
                    stats: {...}
                }]
            }
       }
    */

    var results = {};

    this.onRunComplete = function() {

        var reporter = this;
        var csvConfig = config.benchmarkCSVReporter;
        var csvOutputFilename = csvConfig && csvConfig.outputFile;

        csvOutputFilename = helper.normalizeWinPath(path.resolve(config.basePath, csvOutputFilename || 'benchmark.csv'));

        csv = CSVFormatter.toTable(results);

        helper.mkdirIfNotExists(path.dirname(csvOutputFilename), function() {
            fs.writeFile(csvOutputFilename, csv, function(err) {
                if (err) {
                    log.warn('Could not create output file: ' + csvOutputFilename);
                } else {
                    log.info('');
                    log.info('Created output file: ' + csvOutputFilename);
                }
            });
        });
    };

    this.specSuccess = function(browser, result) {

        var env = browser.name;
        var benchmark = result.benchmark;
        var suite = benchmark.suite;

        var tests = results[env] = results[env] || {};

        tests[suite] = tests[suite] || [];
        tests[suite].push(benchmark);

        log.info(CSVFormatter.toRow(env, benchmark));
    };
};

BenchCSVReporter.$inject = ['baseReporterDecorator', 'config', 'logger', 'helper'];

module.exports = {
  'reporter:benchmarkcsv': ['type', BenchCSVReporter]
};
