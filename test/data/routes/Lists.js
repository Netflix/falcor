var Observable = require('Rx').Observable;
var R = require('falcor-router');
var Cache = require('./../Cache');
module.exports = function() {
    return {
        byIdx: [{
            route: ['lists', R.keys, R.integers],
            get: function (pathSet) {
                return Observable.
                    from(pathSet[1]).
                    flatMap(function (listId) {
                        return Observable.
                            from(pathSet[2]).
                            flatMap(function (idx) {
                                var list = {};
                                var cachedList = Cache().lists[listId];
                                if (cachedList && cachedList[idx]) {
                                    var jsong = {
                                        jsong: { lists: list },
                                        paths: [
                                            ['lists', listId, idx]
                                        ]
                                    };
                                    list[listId] = {};
                                    list[listId][idx] = cachedList[idx];
                                    return Observable.return(jsong);
                                }
                                return Observable.empty();
                            });
                    });
            }
        }]
    }
};

