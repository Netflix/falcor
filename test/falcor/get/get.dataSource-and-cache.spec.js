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
    describe('PathMap', function() {
        it('should get multiple arguments into a single toJSON response.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = Expected.Complex().toOnly.AsPathMap.values[0];
            var next = false;
            model.
                get(['genreList', 0, 0, 'summary'], ['genreList', 0, 1, 'summary']).
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
                doAction(function(x) {
                    next = true;
                    testRunner.compare(expected, x);
                }, noOp, function() {
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('_toJSONG', function() {
        it('should get multiple arguments into a single _toJSONG response.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = Expected.Complex().toOnly.AsJSONG.values[0];
            var next = false;
            model.
                get(['genreList', 0, 0, 'summary'], ['genreList', 0, 1, 'summary']).
                _toJSONG().
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
                _toJSONG().
                doAction(function(x) {
                    next = true;
                    testRunner.compare(expected, x);
                }, noOp, function() {
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
    });
});

