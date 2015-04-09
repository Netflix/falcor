var jsong = require('../../../index');
var Model = jsong.Model;
var Cache = require('../../data/Cache');
var M = require('../../data/ReducedCache').MinimalCache;
var Expected = require('../../data/expected');
var Rx = require('rx');
var Observable = Rx.Observable;
var getTestRunner = require('./../../getTestRunner');
var testRunner = require('./../../testRunner');
var noOp = function() {};
var LocalDataSource = require('../../data/LocalDataSource');
var ErrorDataSource = require('../../data/ErrorDataSource');
var isPathValue = function(x) {
    return x && x.hasOwnProperty('path') && x.hasOwnProperty('value');
};

describe('Progressive', function() {
    describe('Selector', function() {
        it('should get multiple arguments progressively.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = Expected.Complex().toOnly.AsJSON.values[0].json;
            var count = 0;
            model.
                get(['videos', 1234, 'summary'], ['videos', 766, 'summary'], function(v1234, v766) {
                    if (count === 0) {
                        testRunner.compare(expected[0], v1234);
                        testRunner.compare(undefined, v766,
                           'video 766 should be undefined when count === 0');
                    } else {
                        testRunner.compare(expected[0], v1234);
                        testRunner.compare(expected[1], v766);
                    }
                    count++;
                }).
                progressively().
                doAction(noOp, noOp, function() {
                    testRunner.compare(2, count, 'selector should be called 2x');
                }).
                subscribe(noOp, done, done);
        });
        it('should get a complex argument into a single arg.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = Expected.Complex().toOnly.AsJSON.values[0].json;
            var count = 0;
            model.
                get(['genreList', 0, {to: 1}, 'summary'], function(complexPath) {
                    if (count === 0) {
                        testRunner.compare({0: expected[0]}, complexPath);
                    } else {
                        testRunner.compare(expected, complexPath);
                    }
                    count++;
                }).
                progressively().
                doAction(noOp, noOp, function() {
                    testRunner.compare(2, count, 'selector should be called 2x');
                }).
                subscribe(noOp, done, done);
        });
        it('should get the values progressively when bound.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            model._root.unsafeMode = true;
            var expected = Expected.Complex().toOnly.AsJSON.values[0].json;
            var count = 0;
            model.
                bindSync(['genreList', 0]).
                get([{to: 1}, 'summary'], function(complexPath) {
                    if (count === 0) {
                        testRunner.compare({0: expected[0]}, complexPath);
                    } else {
                        testRunner.compare(expected, complexPath);
                    }
                    count++;
                }).
                progressively().
                doAction(noOp, noOp, function() {
                    testRunner.compare(2, count, 'selector should be called 2x');
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('toPathValues', function() {
        it('should be no different than if called without progressive mode.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var model2 = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = Expected.Complex().toOnly.AsJSON.values[0].json;
            var count = 0;
            var progressive = model.
                get(['videos', 1234, 'summary'], ['videos', 766, 'summary']).
                progressively().
                toPathValues();

            var standard = model2.
                get(['videos', 1234, 'summary'], ['videos', 766, 'summary']).
                toPathValues();

            var progressiveResult = false;
            var standardResult = false;
            // cannot zip, can hide results.
            progressive.
                toArray().
                flatMap(function(progressiveResults) {
                    progressiveResult = true;
                    return standard.
                        toArray().
                        doAction(function(standardRes) {
                            standardResult = true;
                            standardRes.forEach(function(res, i) {
                                testRunner.compare(res, progressiveResults[i]);
                            });
                        });
                }).
                doAction(noOp, noOp, function() {
                    testRunner.compare(true, progressiveResult, 'expected progressive result to fire');
                    testRunner.compare(true, standardResult, 'expected standart result to fire');
                }).
                subscribe(noOp, done, done);
        });
        it('should be no different than if called without progressive mode when bound.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var model2 = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = Expected.Complex().toOnly.AsJSON.values[0].json;
            var count = 0;
            model._root.unsafeMode = true;
            model2._root.unsafeMode = true;
            var progressive = model.
                bindSync(['genreList', 0]).
                get([{to: 1}, 'summary']).
                progressively().
                toPathValues();

            var standard = model2.
                bindSync(['genreList', 0]).
                get([{to: 1}, 'summary']).
                toPathValues();

            var progressiveResult = false;
            var standardResult = false;
            // cannot zip, can hide results.
            progressive.
                toArray().
                flatMap(function(progressiveResults) {
                    progressiveResult = true;
                    return standard.
                        toArray().
                        doAction(function(standardRes) {
                            standardResult = true;
                            standardRes.forEach(function(res, i) {
                                testRunner.compare(res, progressiveResults[i]);
                            });
                        });
                }).
                doAction(noOp, noOp, function() {
                    testRunner.compare(true, progressiveResult, 'expected progressive result to fire');
                    testRunner.compare(true, standardResult, 'expected standart result to fire');
                }).
                subscribe(noOp, done, done);
        });
    });
});

