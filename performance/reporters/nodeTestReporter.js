var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var transformCSVResults = require('./transformCSVResults');
var dirPath = path.resolve(__dirname, '../out');
var DEFAULT_NAME = 'node-benchmark.csv';
var COMMAND_OPTION = '-n';

module.exports = function(results) {
    debugger
    var filePath = path.resolve(dirPath, getFileName());
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

function getFileName() {
    debugger
    if (typeof process !== 'undefined') {
        var name = DEFAULT_NAME;
        var foundName = false;
        process.argv.forEach(function(x) {
            if (x === COMMAND_OPTION) {
                foundName = true;
            }

            else if (foundName) {
                name = x;
            }
        });
        return name;
    }
    return DEFAULT_NAME;
};
