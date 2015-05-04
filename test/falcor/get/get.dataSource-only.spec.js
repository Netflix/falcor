var jsong = require('../../../index');
var Model = jsong.Model;
var Cache = require('../../data/Cache');
var Expected = require('../../data/expected');
var Rx = require('rx');
var getTestRunner = require('./../../getTestRunner');
var testRunner = require('./../../testRunner');
var noOp = function() {};
var LocalDataSource = require('../../data/LocalDataSource');
var ErrorDataSource = require('../../data/ErrorDataSource');
var isPathValue = function(x) {
    return x && x.hasOwnProperty('path') && x.hasOwnProperty('value');
};

describe('DataSource Only', function() {
    describe('Selector Functions', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({source: new LocalDataSource(Cache())});
            var expected = Expected.Values().direct.AsJSON.values[0].json;
            var selector = false;
            var next = false;
            model.
                get(['videos', 1234, 'summary'], function(x) {
                    testRunner.compare(expected, x);
                    selector = true;

                    return {value: x};
                }).
                doAction(function(x) {
                    next = true;
                    testRunner.compare({value: expected}, x);
                }, noOp, function() {
                    testRunner.compare(true, selector, 'Expect to be onNext at least 1 time.');
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });

        it('should perform multiple trips to a dataSource.', function(done) {
            var count = 0;
            var model = new Model({
                source: new LocalDataSource(Cache(), {
                    onGet: function(source, paths) {
                        if (count === 0) {
                            paths.pop();
                        }
                        count++;
                    }
                })
            });
            var expected = Expected.Values().direct.AsJSON.values[0].json;
            model.
                get(
                    ['videos', 1234, 'summary'],
                    ['videos', 3355, 'art'],
                    function(v1234, v3355) {
                        testRunner.compare(expected, v1234);
                        testRunner.compare({
                            "box-shot": "www.cdn.com/3355"
                        }, v3355);

                        return {value: v1234};
                    }).
                doAction(function(x) {
                    testRunner.compare({value: expected}, x);
                }, noOp, function() {

                }).
                subscribe(noOp, done, done);
        });
    });
    describe('toJSON', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({source: new LocalDataSource(Cache())});
            var expected = Expected.Values().direct.AsPathMap.values[0];
            var next = false;
            model.
                get(['videos', 1234, 'summary']).
                toJSON().
                doAction(function(x) {
                    testRunner.compare(expected, x);
                    next = true;
                }, noOp, function() {
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('toJSONG', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({source: new LocalDataSource(Cache())});
            var expected = Expected.Values().direct.AsJSONG.values[0];
            var next = false;
            model.
                get(['videos', 1234, 'summary']).
                toJSONG().
                doAction(function(x) {
                    testRunner.compare(expected, x);
                    next = true;
                }, noOp, function() {
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('toPathValues', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({source: new LocalDataSource(Cache())});
            var expected = Expected.Values().direct.AsValues.values[0];
            var next = 0;
            model.
                get(['videos', 1234, 'summary']).
                toPathValues().
                doAction(function(x) {
                    testRunner.compare(expected, x);
                    ++next;
                }, noOp, function() {
                    testRunner.compare(1, next, 'Expect to be onNext 1 time.');
                }).
                subscribe(noOp, done, done);
        });
    });
    it('should report errors from a dataSource.', function(done) {
        var model = new Model({
            source: new ErrorDataSource(500, 'Oops!')
        });
        model.
            get(['videos', 1234, 'summary']).
            doAction(noOp, function(err) {
                testRunner.compare([{
                    path: ['videos', 1234, 'summary'],
                    value: {
                        message: 'Oops!',
                        status: 500
                    }
                }], err);
            }).
            subscribe(noOp, function(err) {
                // ensure its the same error
                if (Array.isArray(err) && isPathValue(err[0])) {
                    done();
                } else {
                    done(err);
                }
            }, function() {
                done('On Completed was called.  ' +
                     'OnError should of been called.');
            });
    });
    it('should get sentinels of undefined out of the cache.', function(done) {
        var counter = 0;
        var datasource = {
            get: function (pathSets) {
                if (counter === 0) {
                    counter++;
                    return Observable.of({
                        "jsong": {
                            "ProffersList": {
                                "-1": {
                                    "$type": "atom"
                                },
                                "0": {
                                    "$type": "ref",
                                    "value": ["ProffersById", 1],
                                    "$size": 52
                                },
                                "1": {"$type": "ref", "value": ["ProffersById", 2], "$size": 52}
                            }
                        },
                        "paths":[["ProffersList", -1], ["ProffersList", 0], ["ProffersList", 1]]
                    });
                } else {
                    return Observable.of({
                        "jsong": {
                            "ProffersById": {
                                "1": {"Title": "New For You"},
                                "2": {"Title": "More Top Picks For You"}
                            }
                        },
                        "paths":[["ProffersById", 1, "Title"], ["ProffersById", 2, "Title"]]
                    });
                }
            }
        };

        var model = new falcor.Model({source: datasource});

        model.
            get(["ProffersList", {from: -1, to: 1}, "Title"]).
            toJSONG().
            subscribe(
                function (jsong) {
                    console.log(JSON.stringify(jsong, null, 4));
                },
                function () {
                },
                function () {
                    var m = model;
                    console.log("Cache  ", JSON.stringify(model.getCache(), null, 4));
                });
    });
});

