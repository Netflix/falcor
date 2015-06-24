module.exports = function formatResultsAsCSV(totalResults, count) {

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

    return csv;
}
