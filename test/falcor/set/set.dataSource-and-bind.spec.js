var falcor = require("./../../../lib/");
var Model = falcor.Model;
var Cache = require('../../data/Cache');
var M = require('../../data/ReducedCache').MinimalCache;
var Expected = require('../../data/expected');
var Rx = require('rx');
var getTestRunner = require('./../../getTestRunner');
var testRunner = require('./../../testRunner');
var noOp = function() {};
var LocalDataSource = require('../../data/LocalDataSource');
var ErrorDataSource = require('../../data/ErrorDataSource');
var isPathValue = require("./../../../lib/support/isPathValue");

describe('DataSource and Deref', function() {
    it('should perform multiple trips to a dataSource.', function(done) {
        var count = 0;
        var model = new Model({
            cache: M(),
            source: new LocalDataSource(Cache(), {
                onSet: function(source, tmp, jsongEnv) {
                    count++;
                    if (count === 1) {
                        // Don't do it this way, it will cause memory leaks.
                        model._root.cache.lists.abcd[1] = undefined;
                        return {
                            jsonGraph: jsongEnv.jsonGraph,
                            paths: [jsongEnv.paths[0]]
                        };
                    }

                    return jsongEnv;
                }
            })
        });
        model.
            deref(['genreList', 0], [0, 'summary']).
            flatMap(function(m) {
                return m.
                    set(
                        {path: [0, 'summary'], value: 1337},
                        {path: [1, 'summary'], value: 7331});
            }).
            doAction(function(x) {
                testRunner.compare({
                    json: {
                        0: {
                            summary: 1337
                        },
                        1: {
                            summary: 7331
                        }
                    }
                }, x);
            }, function(e) {
            }, function() {
                testRunner.compare(2, count);
            }).
            subscribe(noOp, done, done);
    });
});

