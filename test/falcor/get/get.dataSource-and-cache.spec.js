var jsong = require('../../../index');
var Model = jsong.Model;
var Expected = require('../../data/expected');
var ReducedCache = require('../../data/ReducedCache');
var Cache = require('../../data/Cache');
var M = ReducedCache.MinimalCache;
var Rx = require('rx');
var getTestRunner = require('./../../getTestRunner');
var testRunner = require('./../../testRunner');
var noOp = function() {};
var LocalDataSource = require('../../data/LocalDataSource');
var Observable = Rx.Observable;
var falcor = { Model: Model, Observable: Observable };

describe('DataSource and Partial Cache', function() {
    describe('Selector Functions', function() {
        it('should get multiple arguments with multiple selector function args.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = Expected.Complex().toOnly.AsJSON.values[0].json;
            var selector = false;
            var next = false;
            model.
                get(['videos', 1234, 'summary'], ['videos', 766, 'summary'], function(v1234, v766) {
                    testRunner.compare(expected[0], v1234);
                    testRunner.compare(expected[1], v766);
                    selector = true;

                    return {value: v766};
                }).
                doAction(function(x) {
                    next = true;
                    testRunner.compare(expected[1], x.value);
                }, noOp, function() {
                    testRunner.compare(true, selector, 'Expect to be onNext at least 1 time.');;
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });

        it('should get a complex argument into a single arg.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = Expected.Complex().toOnly.AsJSON.values[0].json;
            var selector = false;
            var next = false;
            model.
                get(['genreList', 0, {to: 1}, 'summary'], function(complexPath) {
                    debugger
                    testRunner.compare(expected, complexPath);
                    selector = true;

                    return {value: complexPath};
                }).
                doAction(function(x) {
                    next = true;
                    testRunner.compare(expected, x.value);
                }, noOp, function() {
                    testRunner.compare(true, selector, 'Expect to be onNext at least 1 time.');;
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('toJSON', function() {
        it('should get multiple arguments into a single toJSON response.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = Expected.Complex().toOnly.AsPathMap.values[0];
            var next = false;
            model.
                get(['genreList', 0, 0, 'summary'], ['genreList', 0, 1, 'summary']).
                toJSON().
                doAction(function(x) {
                    next = true;
                    testRunner.compare(expected, x);
                }, noOp, function() {
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });

        it('should get a complex argument into a single arg.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = Expected.Complex().toOnly.AsPathMap.values[0];
            var next = false;
            model.
                get(['genreList', 0, {to: 1}, 'summary']).
                toJSON().
                doAction(function(x) {
                    next = true;
                    testRunner.compare(expected, x);
                }, noOp, function() {
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('toJSONG', function() {
        it('should get multiple arguments into a single toJSONG response.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = Expected.Complex().toOnly.AsJSONG.values[0];
            var next = false;
            model.
                get(['genreList', 0, 0, 'summary'], ['genreList', 0, 1, 'summary']).
                toJSONG().
                doAction(function(x) {
                    next = true;
                    testRunner.compare(expected, x);
                }, noOp, function() {
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });

        it('should get a complex argument into a single arg.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = Expected.Complex().toOnly.AsJSONG.values[0];
            var next = false;
            model.
                get(['genreList', 0, {to: 1}, 'summary']).
                toJSONG().
                doAction(function(x) {
                    next = true;
                    testRunner.compare(expected, x);
                }, noOp, function() {
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
    });

    describe('toPathValues', function() {
        it('should get multiple arguments into a single toJSON response.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = Expected.Complex().toOnly.AsValues.values;
            var count = 0;

            model.
                get(['genreList', 0, 0, 'summary'], ['genreList', 0, 1, 'summary']).
                toPathValues().
                doAction(function(x) {
                    testRunner.compare(expected[count++], x);
                }, noOp, function() {
                    testRunner.compare(2, count, 'Expect to be onNext two times.');
                }).
                subscribe(noOp, done, done);
        });

        it('should get a complex argument into a single arg.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = Expected.Complex().toOnly.AsValues.values;
            var count = 0;

            model.
                get(['genreList', 0, {to: 1}, 'summary']).
                toPathValues().
                doAction(function(x) {
                    testRunner.compare(expected[count++], x);
                }, noOp, function() {
                    testRunner.compare(2, count, 'Expect to be onNext two times.');
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('Re-entrancy', function() {
        it('calling set/get/call operations that execute synchronously in a selector function should not reset allowSync, thereby disabling subsequent getValueSyncs within the selector functions.', function(done) {
            var model = new falcor.Model({
                source: {
                    get: function() {
                        return falcor.Observable.of({
                            paths: [["user", "age"]],
                            value: {
                                user: {
                                    age: 44
                                }
                            }
                        });
                    }
                },
                cache:{
                    user: {
                        name: "Jim"
                    }
                }
            });
            model._root.unsafeMode = false;

            model.get(["user","age"], function(age) {                
                model.withoutDataSource().get({path:["user","name"], value: 23}).subscribe();
                
                // should work, but doesn't because allowSync was set to false by get
                try {
                    model.getValueSync(["user", "age"]);
                } catch(e) {
                    throw "Unable to run getValueSync because allowSync was set back to false by when get method executed synchronously within a selector function.";
                }
            }).subscribe();
        });
    });
});

