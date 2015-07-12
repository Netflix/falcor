var Observable = require('Rx').Observable;
var R = require('falcor-router');
var Cache = require('./../Cache');

module.exports = function() {
    return {
        Ranges: [{
            route: ['genreList', R.ranges],
            get: function (pathSet) {
                return Observable.
                    from(R.rangeToArray(pathSet[1])).
                    flatMap(function(idx) {
                        var genreList = {};
                        var cacheGenreList = Cache().genreList[idx];
                        if (cacheGenreList) {
                            var jsong = {
                                jsonGraph: { genreList: genreList },
                                paths: [
                                    ['genreList', idx]
                                ]
                            };
                            genreList[idx] = cacheGenreList;
                            return Observable.return(jsong);
                        }
                        return Observable.empty();
                    });
            }
        }]
    }
};

