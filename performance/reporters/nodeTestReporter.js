var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

var filepath = path.resolve(__dirname, '../out/node-benchmark.csv');

module.exports = {

    resultsReporter: function(results) {
        mkdirp(path.dirname(filepath), function (err) {
            if (err) {
                console.error('\nError writing file: ' + filepath);
            } else {
                fs.writeFileSync(filepath, results);
                console.info('\nCreated output file: ' + filepath);
            }
        });
    },

    benchmarkReporter: function(benchmark) {
        console.info(benchmark);
    }
};