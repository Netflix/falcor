var csvTransform = require('./CSVTransform');

var benchmarkToRow = function(env, benchmark) {

    if (!env) {
        env = "ENV";
    }

    return [
        env,
        benchmark.suite,
        benchmark.name,
        benchmark.hz,
        benchmark.stats.deviation
    ].join(', ');
};

var resultsToTable = function(results) {

    var table =[];
    var suites;
    var suite;
    var env;

    for (env in results) {
        suites = results[env];
        for (suite in suites) {
            suites[suite].forEach(function(benchmark) {
                table.push(benchmarkToRow(env, benchmark));
            });
        }
    }

    return table.join('\n');
};

module.exports = {
    toRow: benchmarkToRow,
    toTable: resultsToTable
};