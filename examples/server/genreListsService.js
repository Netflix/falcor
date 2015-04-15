var helper = require('./helper');
var Promise = require('promise');
module.exports = {
    get: function(rows) {
        var argsLen = arguments.length;
        var retVal = {rows: []};
        var retRows = retVal.rows;
        var cols;
        if (argsLen === 3) {
            cols = helper.toArray(arguments[1]);
        }
        rows = helper.toArray(rows);
        filterOnIdxs(rows, data).
            forEach(function(row) {
                var columns = [];
                retRows[row] = {index: +row, columns: columns, name: data[row].name};
                if (argsLen === 3) {
                    filterOnIdxs(cols, data[row]).
                        forEach(function(col) {
                            columns.push({
                                index: +col,
                                titleId: data[row][col].titleId
                            });
                        });
                }
            });

        return new Promise(function(res) {
            res(retVal);
        });
    }
};

var titles = {
    dareDevil: 956,
    houseOfCards: 1234,
    kimmy: 333
};

var data = {
    0: {
        index: 0,
        name: 'Recently Watched',
        0: {
            index: 0,
            titleId: titles.dareDevil
        },
        1: {
            index: 1,
            titleId: titles.houseOfCards
        }
    },
    1: {
        index: 1,
        name: 'New Releases',
        0: {
            index: 0,
            titleId: titles.houseOfCards
        },
        1: {
            index: 1,
            titleId: titles.kimmy
        }
    }
};

function filterOnIdxs(idxs, data) {
    return Object.
        keys(data).
        filter(function(row) {
            // == for strings
            return idxs.filter(function(r) { return +r === +row; }).length;
        });
}

