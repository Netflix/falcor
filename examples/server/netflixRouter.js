var Router = require('./router');
var titleService = require('./titleService');
var ratingService = require('./ratingService');
var genreListService = require('./genreListsService');
var Model = require('./../Falcor').Model;

module.exports = new Router([
    {
        route: 'titleById[{integers}].rating',
        get: function(pathSet) {
            var titleIds = pathSet[1];

            return ratingService.
                get(titleIds, this.req.userId).
                then(function(titlesMap) {
                    var titlesById = {};

                    titleIds.forEach(function(id) {
                        var rating = titlesMap[id];
                        titlesById[id] = {rating: rating};
                    });

                    return {
                        jsong: {
                            titlesById: titlesById
                        }
                    };
                });
        }
    },
    {
        route: 'titleById[{integers}]["name", "boxshot"]',
        get: function(pathSet) {
            var titleIds = pathSet[1];
            var requestedProps = pathSet[2];

            return titleService.
                get(titleIds).
                then(function(titlesMap) {
                    var titlesById = {};

                    titleIds.forEach(function(id) {
                        var title = titlesMap[id];
                        titlesById[id] = {};
                        requestedProps.forEach(function(requestedProp) {
                            titlesById[id][requestedProp] = title[requestedProp];
                        });
                    });

                    return {
                        jsong: {
                            titlesById: titlesById
                        }
                    };
                });
        }
    },
    {
        route: 'genreLists[{ranges}][{ranges}]',
        get: function(pathSet) {
            var rows = pathSet[1];
            var columns = pathSet[2];

            return genreListService.
                get(rows, columns, this.req.userId).
                then(function(genreListMap) {
                    var genreLists = {};

                    genreListMap.rows.forEach(function(row) {
                        var genreRow = genreLists[row.index] = {};

                        row.columns.forEach(function(col) {
                            genreRow[col.index] =
                                Model.ref('titlesById[' + col.titleId + ']');
                        });
                    });

                    return {
                        jsong: {
                            genreLists: genreLists
                        }
                    };
                });
        }
    }
]);
