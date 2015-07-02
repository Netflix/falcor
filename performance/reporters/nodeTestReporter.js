var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var transformCSVResults = require('./transformCSVResults');
var filepath = path.resolve(__dirname, '../out/node-benchmark.csv');

module.exports = function(results) {
    debugger
    results = transformCSVResults(results);
    mkdirp(path.dirname(filepath), function (err) {
        if (err) {
            console.error('\nError writing file: ' + filepath);
        } else {
            fs.writeFileSync(filepath, results);
            console.info('\nCreated output file: ' + filepath);
        }
    });
};
