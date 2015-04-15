var Router = require('./router');
var titleService = require('./titleService');
var ratingService = require('./ratingService');
var genreListService = require('./genreListsService');
var Model = require('./../Falcor').Model;
var Promise = require('promise');

function NetflixRouter(req, res) {
    this.req = req;
    this.res = res;
}

module.exports = NetflixRouter;

NetflixRouter.prototype = new Router([
    {
        route: 'titleById[{integers}].rating',
        get: function(pathSet) {
            var titleIds = pathSet[1];

            return ratingService.
                get(titleIds, this.req.userId).
                then(function(titles) {
                    var titlesById = {};

                    titles.forEach(function(title) {
                        titlesById[title.id] = {rating: title.rating};
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
                then(function(titles) {
                    var titlesById = {};

                    titles.forEach(function(title) {
                        titlesById[title.id] = {};
                        requestedProps.forEach(function(requestedProp) {
                            titlesById[title.id][requestedProp] = title[requestedProp];
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
        route: 'genreLists[{ranges}].name',
        get: function(pathSet) {
            var rows = pathSet[1];

            return genreListService.
                get(rows, this.req.userId).
                then(function(genreListMap) {
                    var genreLists = {};

                    genreListMap.rows.forEach(function(row) {
                        genreLists[row.index] = {
                            name: row.name
                        };
                    });

                    return {
                        jsong: {
                            genreLists: genreLists
                        }
                    };
                });
        }
    },
    {
        route: 'genreLists[{ranges}].titles[{ranges}]',
        get: function(pathSet) {
            var rows = pathSet[1];
            var cols = pathSet[3];

            return genreListService.
                get(rows, cols, this.req.userId).
                then(function(genreListMap) {
                    var genreLists = {};

                    genreListMap.rows.forEach(function(row) {
                        var genreListRow = genreLists[row.index] = {};
                        var genreListTitles = genreListRow.titles = {};
                        row.columns.forEach(function(col) {
                            genreListTitles[col.index] =
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
