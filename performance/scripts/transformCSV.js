var fs = require('fs');
var parse = require('csv-parse');
var minimist = require('minimist');
var argv = minimist(process.argv.slice(2));

if (argv._.length < 2) {
    console.log('node transformCSV.js <inputFile.csv> <outputFile.csv>');
    process.exit(9);
}

var input = fs.createReadStream(argv._[0]);
var output = fs.createWriteStream(argv._[1]);

function isNumber(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

var parser = parse({trim:true}, function(err, data) {

    var headers = 0;
    var rows = 0;

    var transformed = data.reduce(function(prev, current) {

        var header = prev[0];
        var avg = prev[1];

        var firstCell = current[0];

        if (!isNumber(firstCell)) {
            if (header) {
                prev[0] = header.map(function(headerValue, idx) {
                    return headerValue + ":" + current[idx];
                });
            } else {
                prev[0] = current.concat();
            }

            headers = headers + 1;

        } else {

            if (avg) {
                prev[1] = avg.map(function(value, idx) {
                    // Running Average
                    return ((value * rows) + parseFloat(current[idx]))/(rows + 1);
                });
            } else {
                prev[1] = current.map(function(v) { return parseFloat(v); });
            }

            rows = rows + 1;
        }

        return prev;

    }, []);

    output.write(transformed.reduce(function(prev, current) {
        return prev + '\n' + current.join(',');
    }, ''));
});

input.pipe(parser);