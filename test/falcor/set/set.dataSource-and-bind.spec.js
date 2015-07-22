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
var isPathValue = require("./../../../lib/support/is-path-value");

describe('DataSource and Deref', function() {
    it('should get a value from from dataSource when bound.', function(done) {
        var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
        model._root.unsafeMode = true;
        model = model.derefSync(['genreList', 0]);
        var expected = {
            "title": "The Next Terminator",
            "url": "/movies/766"
        };
        var selector = false;
        var next = false;
        model.
            set({path: [1, 'summary'], value: expected}, function(x) {
                testRunner.compare(expected, x);
                selector = true;

                return {value: x};
            }).
            doAction(function(x) {
                next = true;
                testRunner.compare({value: expected}, x);
            }, noOp, function() {
                testRunner.compare(true, selector, 'Expect to be onNext at least 1 time.');;
                testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
            }).
            subscribe(noOp, done, done);
    });

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
        model._root.unsafeMode = true;
        model = model.derefSync(['genreList', 0]);
        model.
            set(
                {path: [0, 'summary'], value: 1337},
                {path: [1, 'summary'], value: 7331}
            ).
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
            }, noOp, function() {
                testRunner.compare(2, count);
            }).
            subscribe(noOp, done, done);
    });
});

