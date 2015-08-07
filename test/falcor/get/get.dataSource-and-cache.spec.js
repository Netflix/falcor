var falcor = require("./../../../lib/");
var Model = falcor.Model;
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
var sinon = require('sinon');
var expect = require('chai').expect;

describe('DataSource and Partial Cache', function() {
    describe('Preload Functions', function() {
        it('should get multiple arguments with multiple selector function args.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var onNext = sinon.spy();
            var secondOnNext = sinon.spy();
            model.
                preload(['videos', 1234, 'summary'], ['videos', 766, 'summary']).
                doAction(onNext).
                doAction(noOp, noOp, function() {
                    expect(onNext.callCount).to.equal(0);
                }).
                defaultIfEmpty({}).
                flatMap(function() {
                    return model.get(['videos', 1234, 'summary'], ['videos', 766, 'summary']);
                }).
                doAction(secondOnNext).
                doAction(noOp, noOp, function() {
                    expect(secondOnNext.calledOnce).to.be.ok;
                    testRunner.compare({
                        json: {
                            videos: {
                                1234: {
                                    summary: {
                                        title: "House of Cards",
                                        url: "/movies/1234"
                                    }
                                },
                                766: {
                                    summary: {
                                        title: "Terminator 3",
                                        url: "/movies/766"
                                    }
                                }
                            }
                        }
                    }, secondOnNext.getCall(0).args[0]);
                }).
                subscribe(noOp, done, done);
        });

        it('should get a complex argument into a single arg.', function(done) {
            var expected = Expected.Complex().toOnly.AsPathMap.values[0];
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var onNext = sinon.spy();
            var secondOnNext = sinon.spy();
            model.
                preload(['genreList', 0, {to: 1}, 'summary']).
                doAction(onNext).
                doAction(noOp, noOp, function() {
                    expect(onNext.callCount).to.equal(0);
                }).
                defaultIfEmpty({}).
                flatMap(function() {
                    return model.get(['genreList', 0, {to: 1}, 'summary']);
                }).
                doAction(secondOnNext).
                doAction(noOp, noOp, function() {
                    expect(secondOnNext.calledOnce).to.be.ok;
                    testRunner.compare(expected, secondOnNext.getCall(0).args[0]);
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
    xdescribe('Re-entrancy - NOT AN ISSUE UNTIL SYNC COMES BACK', function() {
        it('calling set/get/call operations that execute synchronously in a selector function should not decrement syncRefCount, thereby disabling subsequent getValueSyncs within the selector functions.', function(done) {
            var model = new falcor.Model({
                source: {
                    get: function() {
                        return Rx.Observable.of({
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
                // model.withoutDataSource().get({path:["user","name"], value: 23}).subscribe();
                model.withoutDataSource().get(["user","name"]).subscribe();

                // should work, but doesn't because syncRefCount was set to 0 by get
                try {
                    model.getValueSync(["user", "age"]);
                    done();
                } catch(e) {
                    done(new Error("Unable to run getValueSync because syncRefCount was set back to 0 when get method executed synchronously within a selector function."));
                }
            }).subscribe();
        });
    });
});

