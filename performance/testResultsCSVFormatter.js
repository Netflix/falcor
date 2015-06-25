module.exports = function (writer) {

    return function(results) {
        var table = [];
        var row;
        var test;

        for (test in results) {
            row = [test].concat(JSON.stringify(results[test]));
            table.push(row.join(','));
        }

        writer(table.join('\n'));
    };
};
