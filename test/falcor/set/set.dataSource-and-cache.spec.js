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

describe('DataSource and Cache', function() {
    describe('Selector Functions', function() {
        it('should set a value from falcor.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var e1 = {
                newValue: '1'
            };
            var e2 = {
                newValue: '2'
            };
            var selector = false;
            var next = false;
            model.
                set(
                    {path: ['videos', 1234, 'summary'], value: e1},
                    {path: ['videos', 766, 'summary'], value: e2},
                    function(x1, x2) {
                        testRunner.compare(e1, x1);
                        testRunner.compare(e2, x2);
                        selector = true;
                        return {value: [x1, x2]};
                    }).
                doAction(function(x) {
                    next = true;
                    testRunner.compare({value: [e1, e2]}, x);
                }, noOp, function() {
                    testRunner.compare(true, selector, 'Expect to be onNext at least 1 time.');
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
        it('should get a complex argument into a single arg.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = {
                newValue: '1'
            };
            var selector = false;
            var next = false;
            model.
                set(
                    {path: ['genreList', 0, {to: 1}, 'summary'], value: expected},
                    function(x) {
                        testRunner.compare({0: expected, 1: expected}, x);
                        selector = true;
                        return {value: x};
                    }).
                doAction(function(x) {
                    next = true;
                    testRunner.compare({value: {0: expected, 1: expected}}, x);
                }, noOp, function() {
                    testRunner.compare(true, selector, 'Expect to be onNext at least 1 time.');
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
    });

    describe('Seeds', function() {
        it('should set a value from falcor.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var e1 = {
                newValue: '1'
            };
            var e2 = {
                newValue: '2'
            };
            var next = false;
            model.
                set(
                    {path: ['videos', 1234, 'summary'], value: e1},
                    {path: ['videos', 766, 'summary'], value: e2}).
                doAction(function(x) {
                    next = true;
                    testRunner.compare({ json: {
                        videos: {
                            1234: {
                                summary: {
                                    newValue: '1'
                                }
                            },
                            766: {
                                summary: {
                                    newValue: '2'
                                }
                            }
                        }
                    }}, x);
                }, noOp, function() {
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
        it('should get a complex argument into a single arg.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = {
                newValue: '1'
            };
            var next = false;
            model.
                set({path: ['genreList', 0, {to: 1}, 'summary'], value: expected}).
                doAction(function(x) {
                    next = true;
                    testRunner.compare({ json: {
                        genreList: {
                            0: {
                                0: {
                                    summary: {
                                        newValue: '1'
                                    }
                                },
                                1: {
                                    summary: {
                                        newValue: '1'
                                    }
                                }
                            }
                        }
                    }}, x);
                }, noOp, function() {
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
    });

    describe('toPathValues', function() {
        it('should set a value from falcor.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var e1 = {
                newValue: '1'
            };
            var e2 = {
                newValue: '2'
            };
            var count = 0;
            model.
                set(
                    {path: ['videos', 1234, 'summary'], value: e1},
                    {path: ['videos', 766, 'summary'], value: e2}).
                toPathValues().
                doAction(function(x) {
                    if (count % 2 === 0) {
                        testRunner.compare(
                            {path: ['videos', 1234, 'summary'], value: e1},
                            x);
                    } else {
                        testRunner.compare(
                            {path: ['videos', 766, 'summary'], value: e2},
                            x);
                    }
                    count++;
                }, noOp, function() {
                    testRunner.compare(4, count, 'Expected count to be called 4 times');
                }).
                subscribe(noOp, done, done);
        });
        it('should get a complex argument into a single arg.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = {
                newValue: '1'
            };
            var count = 0;
            // TODO: not sure if this works
            model.
                set({path: ['genreList', 0, {to: 1}, 'summary'], value: expected}).
                toPathValues().
                doAction(function(x) {
                    next = true;
                    if (count % 2 === 0) {
                        testRunner.compare(
                            {path: ['genreList', 0, 0, 'summary'], value: expected},
                            x);
                    } else {
                        testRunner.compare(
                            {path: ['genreList', 0, 1, 'summary'], value: expected},
                            x);
                    }
                    count++;
                }, noOp, function() {
                    testRunner.compare(4, count, 'Expected count to be called 4 times');
                }).
                subscribe(noOp, done, done);
        });
    });
});
