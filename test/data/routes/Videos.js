var Observable = require('Rx').Observable;
var R = require('falcor-router');
var Cache = require('./../Cache');

module.exports = function() {
    return {
        Integers: {
            Summary: [{
                route: ['videos', R.integers, 'summary'],
                get: function (pathSet) {
                    return Observable.
                        from(pathSet[1]).
                        flatMap(function (id) {
                            var video = {};
                            var cacheVideo = Cache().videos[id];
                            if (cacheVideo) {
                                var jsong = {
                                    jsonGraph: { videos: video },
                                    paths: [
                                        ['videos', id, 'summary']
                                    ]
                                };
                                video[id] = {};
                                video[id].summary = cacheVideo.summary;
                                return Observable.return(jsong);
                            }
                            return Observable.empty();
                        });
                }
            }]
        }
    }
};