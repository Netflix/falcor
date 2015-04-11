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
            var e1 = {
                newValue: '1'
            };
            var e2 = {
                newValue: '2'
            };
            model.
                set(
                    {path: ['videos', 1234, 'summary'], value: e1},
                    {path: ['videos', 766, 'summary'], value: e2},
                    function(v1234, v766) {
                        testRunner.compare(e1, v1234);
                        testRunner.compare(e2, v766);
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
            var count = 0;
            var e1 = {
                newValue: '1'
            };
            model.
                set(
                    {path: ['genreList', 0, {to:1}, 'summary'], value: e1},
                    function(list) {
                        testRunner.compare({0: e1, 1: e1}, list);
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
            var e1 = {
                newValue: '1'
            };
            model.
                bindSync(['genreList', 0]).
                set(
                    {path: [{to:1}, 'summary'], value: e1},
                    function(list) {
                        testRunner.compare({0: e1, 1: e1}, list);
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
            var e1 = {
                newValue: '1'
            };
            var e2 = {
                newValue: '2'
            };
            var progressive = model.
                set(
                    {path: ['videos', 1234, 'summary'], value: e1},
                    {path: ['videos', 766, 'summary'], value: e2}).
                progressively().
                toPathValues();

            var standard = model2.
                set(
                    {path: ['videos', 1234, 'summary'], value: e1},
                    {path: ['videos', 766, 'summary'], value: e2}).
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
            var e1 = {
                newValue: '1'
            };
            model._root.unsafeMode = true;
            model2._root.unsafeMode = true;
            var progressive = model.
                bindSync(['genreList', 0]).
                set({path: [{to:1}, 'summary'], value: e1}).
                progressively().
                toPathValues();

            var standard = model2.
                bindSync(['genreList', 0]).
                set({path: [{to:1}, 'summary'], value: e1}).
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

