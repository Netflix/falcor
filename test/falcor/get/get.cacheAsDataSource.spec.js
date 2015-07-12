var falcor = require("./../../../lib/");
var Model = falcor.Model;
var Cache = require('../../data/Cache');
var Expected = require('../../data/expected');
var Rx = require('rx');
var getTestRunner = require('./../../getTestRunner');
var testRunner = require('./../../testRunner');
var noOp = function() {};
var LocalDataSource = require('../../data/LocalDataSource');
var ErrorDataSource = require('../../data/ErrorDataSource');
var isPathValue = require("./../../../lib/support/is-path-value");
var expect = require("chai").expect;

describe('DataSource Only', function() {
    describe('Selector Functions', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({ source: new Model({ source: new LocalDataSource(Cache()) }).asDataSource() });
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
                source: new Model({ source: new LocalDataSource(Cache(), {
                    onGet: function(source, paths) {
                        if (count === 0) {
                            paths.pop();
                        }
                        count++;
                    }
                })}).asDataSource()
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
            var model = new Model({ source: new Model({ source: new LocalDataSource(Cache()) }).asDataSource() });
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
            var model = new Model({ source: new Model({ source: new LocalDataSource(Cache()) }).asDataSource() });
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
            var model = new Model({ source: new Model({ source: new LocalDataSource(Cache()) }).asDataSource() });
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
            source: new Model({
                source: new ErrorDataSource(500, 'Oops!')
            }).asDataSource()
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
                done('On Completed was called. ' +
                     'OnError should have been called.');
            });
    });
    it("should get all missing paths in a single request", function(done) {
        var model = new Model({ source: new Model({ source: {
            get: function(paths) {
                try {
                    var path = paths[0];
                    var range = path[1];
                    expect(range).to.be.ok;
                    expect(range.from).to.equals(0);
                    expect(range.to).to.equals(2);
                    return Rx.Observable.return({
                        paths: paths,
                        jsonGraph: {
                            lolomo: {
                                summary: {
                                    $type: "atom",
                                    value: "hello"
                                },
                                0: {
                                    summary: {
                                        $type: "atom",
                                        value: "hello-0"
                                    }
                                },
                                1: {
                                    summary: {
                                        $type: "atom",
                                        value: "hello-1"
                                    }
                                },
                                2: {
                                    summary: {
                                        $type: "atom",
                                        value: "hello-2"
                                    }
                                }
                            }
                        }
                    });
                } catch(e) {
                    return Rx.Observable.throw(e);
                }
            }
        }}).asDataSource() });
        
        model.get("lolomo.summary", "lolomo[0..2].summary").subscribe(function(data) {
            var json = data.json;
            var lolomo = json.lolomo;
            expect(lolomo.summary).to.be.ok;
            expect(lolomo[0].summary).to.be.ok;
            expect(lolomo[1].summary).to.be.ok;
            expect(lolomo[2].summary).to.be.ok;
            done();
        }, done);
    });
});

