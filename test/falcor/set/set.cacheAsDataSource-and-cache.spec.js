var falcor = require("./../../../lib/");
var Model = falcor.Model;
var Expected = require('../../data/expected');
var Values = Expected.Values;
var Complex = Expected.Complex;
var ReducedCache = require('../../data/ReducedCache');
var Cache = require('../../data/Cache');
var M = ReducedCache.MinimalCache;
var Rx = require('rx');
var getTestRunner = require('./../../getTestRunner');
var testRunner = require('./../../testRunner');
var noOp = function() {};
var LocalDataSource = require('../../data/LocalDataSource');
var ErrorDataSource = require('../../data/ErrorDataSource');
var $error = require('./../../../lib/types/error');
var expect = require('chai').expect;

describe('Cache as DataSource and Cache', function() {
    describe('Seeds', function() {
        it('should set a value from falcor.', function(done) {
            var model = new Model({cache: M(), source: new Model({
                source: new LocalDataSource(Cache())
            }).asDataSource() });
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
            var model = new Model({cache: M(), source: new Model({
                source: new LocalDataSource(Cache())
            }).asDataSource() });
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

    it('should ensure that the jsong sent to server is optimized.', function(done) {
        var model = new Model({
            cache: Cache(),
            source: new Model({
                source: new LocalDataSource(Cache(), {
                    onSet: function(source, tmp, jsongEnv) {
                        sourceCalled = true;
                        testRunner.compare({
                            jsonGraph: {
                                videos: {
                                    1234: {
                                        summary: 5
                                    }
                                }
                            },
                            paths: [['videos', 1234, 'summary']]
                        }, jsongEnv);
                        return jsongEnv;
                    }
                })
            }).asDataSource() });
        var called = false;
        var sourceCalled = false;
        model.
            set({path: ['genreList', 0, 0, 'summary'], value: 5}).
            doAction(function(x) {
                called = true;
            }, noOp, function() {
                testRunner.compare(true, called, 'Expected onNext to be called');
                testRunner.compare(true, sourceCalled, 'Expected source.set to be called.');
            }).
            subscribe(noOp, done, done);
    });
    it('should throw an error set and project it.', function(done) {
        var model = new Model({
            source: new Model({
                source: new ErrorDataSource(503, "Timeout"),
                errorSelector: function mapError(path, value) {
                    value.$foo = 'bar';
                    return value;
                }
            }).asDataSource() });
        var called = false;
        model.
            boxValues().
            set({path: ['genreList', 0, 0, 'summary'], value: 5}).
            doAction(function(x) {
                expect(false, 'onNext should not be called.').to.be.ok;
            }, function(e) {
                called = true;
                testRunner.compare([{
                    path: ['genreList', 0, 0, 'summary'],
                    value: {
                        $type: $error,
                        $foo: 'bar',
                        value: {
                            message: 'Timeout',
                            status: 503
                        }
                    }
                }], e, {strip: ['$size']});
            }, function() {
                expect(false, 'onNext should not be called.').to.be.ok;
            }).
            subscribe(noOp, function(e) {
                if (Array.isArray(e) && e[0].value.$foo === 'bar' && called) {
                    done();
                    return;
                }
                done(e);
            }, noOp);
    });
});
