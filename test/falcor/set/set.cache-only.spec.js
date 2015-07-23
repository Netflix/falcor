var falcor = require("./../../../lib/");
var Model = falcor.Model;
var Cache = require('../../data/Cache');
var Expected = require('../../data/expected');
var Rx = require('rx');
var getTestRunner = require('./../../getTestRunner');
var testRunner = require('./../../testRunner');
var noOp = function() {};
var expect = require('chai').expect;
var sinon = require('sinon');
var toValue = function(x) { return {value: x}; };

describe('Cache Only', function() {
    describe('Selector Functions', function() {
        it('should set a value from falcor.', function(done) {
            var model = new Model({cache: Cache()});
            var expected = {
                hello: 'world'
            };
            var selector = false;
            var next = false;
            model.
                set({path: ['videos', 1234, 'summary'], value: expected}, function(x) {
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

        it('should set a value from falcor with jsonGraph.', function(done) {
            var model = new Model({cache: Cache()});
            var jsong = {
                jsonGraph: {
                    videos: {
                        1234: {
                            summary: 'hello world'
                        }
                    }
                },
                paths: [['videos', 1234, 'summary']]
            };
            var expected = 'hello world';
            var selector = sinon.spy(toValue);
            var onNext = sinon.spy();
            model.
                set(jsong, selector).
                doAction(onNext).
                doAction(noOp, noOp, function() {
                    expect(selector.calledOnce).to.be.ok;
                    expect(onNext.calledOnce).to.be.ok;
                    expect(selector.getCall(0).args[0]).to.deep.equals(expected);
                    expect(onNext.getCall(0).args[0]).to.deep.equals({value: expected});
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('toJSON', function() {
        it('should set a value from falcor.', function(done) {
            var model = new Model({cache: Cache()});
            var value = {hello: 'world'};
            var expected = {
                json: {
                    videos: {
                        1234: {
                            summary: {
                                hello: 'world'
                            }
                        }
                    }
                }
            };
            var next = false;
            model.
                set({path: ['videos', 1234, 'summary'], value: value}).
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
            var model = new Model({cache: Cache()});
            var value = {hello: 'world'};
            var expected = {
                jsonGraph: {
                    videos: {
                        1234: {
                            summary: {
                                $type: 'atom',
                                $size: 51,
                                value: {
                                    hello: 'world'
                                }
                            }
                        }
                    }
                },
                paths: [['videos', 1234, 'summary']]
            };
            var next = false;
            model.
                set({path: ['videos', 1234, 'summary'], value: value}).
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
            var model = new Model({cache: Cache()});
            var value = {hello: 'world'};
            var next = false;
            model.
                set({path: ['videos', 1234, 'summary'], value: value}).
                toPathValues().
                doAction(function(x) {
                    testRunner.compare({
                        path: ['videos', 1234, 'summary'],
                        value: value
                    }, x);
                    ++next;
                }, noOp, function() {
                    testRunner.compare(true, next > 0, 'Expect to be onNext to be called at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
        it('should dedupe values with a comparator', function(done) {
            var model = new Model({
                cache: Cache(),
                comparator: function compare(path, a, b) {
                    var aRef = a.value;
                    var bRef = b.value;
                    if(aRef.length !== bRef.length) {
                        return false;
                    }
                    var count = aRef.length;
                    while(--count >= 0) {
                        if(aRef[count] !== bRef[count]) {
                            return false;
                        }
                    }
                    return true;
                }
            });
            model.
                set({ path: ["genreList", 0], value: Model.ref(["lists", "abcd"]) }).
                toPathValues().
                count().
                subscribe(function(total) {
                    expect(total === 0, "Total should be zero.");
                }, noOp, done)
        });
    });
});
