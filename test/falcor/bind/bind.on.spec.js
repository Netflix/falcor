var falcor = require("falcor");
var Model = falcor.Model;
var Rx = require("rx");
var LocalDataSource = require("../../data/LocalDataSource");
var Cache = require("../../data/Cache");
var Expected = require("../../data/expected");
var getTestRunner = require("../../getTestRunner");
var testRunner = require("../../testRunner");
var References = Expected.References;
var Complex = Expected.Complex;
var Values = Expected.Values;
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};
var InvalidModelError = require('falcor/errors/InvalidModelError');
var $atom = require('falcor/types/atom');
var $error = require('falcor/types/error');

describe("Bind-On", function() {
    describe('Sync', function() {
        it("bound to a path that lands on an error.", function() {

            var dataModel = new Model({cache: {
                genreList: {
                    0: {
                        $type: $error,
                        value: {
                            message: "The humans are dead."
                        }
                    }
                }
            }});

            var throwError = false;
            try {
                dataModel.bindSync(["genreList", 0]);
            } catch (e) {
                throwError = true;
                testRunner.compare({
                    path: ['genreList', 0],
                    value: {
                        message: 'The humans are dead.'
                    }
                }, e);
            }
            expect(throwError).to.be.ok;
        });

        it("bound to a path that lands on a value.", function(done) {
            var dataModel = new Model({cache: {
                genreList: {
                    0: {
                        $type: $atom,
                        value: "The humans are dead."
                    }
                }
            }});

            var nextModel = dataModel.bindSync(["genreList", 0]);
            var count = 0;
            nextModel.
                get([0, 'summary']).
                toPathValues().
                doAction(function(x) {
                    testRunner.compare({
                        path: [],
                        value: 'The humans are dead.'
                    }, x);
                    count++;
                }, noOp, function() {
                    expect(count).to.equals(1);
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('Async', function() {
        it("bound to a path that lands on an error.", function(done) {
            var dataModel = new Model({cache: {
                genreList: {
                    0: {
                        $type: $error,
                        value: {
                            message: "The humans are dead."
                        }
                    }
                }
            }});

            var throwError = false;
            dataModel.
                bind(["genreList", 0], ['summary']).
                doAction(
                    function() { throw 'onNext should not happen.'; },
                    function(e) {
                        testRunner.compare([{
                            path: ['genreList', 0],
                            value: {
                                // $type: $error,
                                // $size: 51,
                                // value: {
                                    message: 'The humans are dead.'
                                // }
                            }
                        }], e);
                        throwError = true;
                    },
                    function() { throw 'onCompleted should not happen.'; }).
                subscribe(noOp, function(e) {
                    if (throwError) {
                        return done();
                    }
                    done(e);
                }, done);
        });

        it("bound to a path that lands on a value.", function(done) {
            var dataModel = new Model({cache: {
                genreList: {
                    0: {
                        $type: $atom,
                        value: "The humans are dead."
                    }
                }
            }});

            var count = 0;
            dataModel.
                bind(["genreList", 0], ['summary']).
                flatMap(function(boundModel) {
                    return boundModel.get(['summarieses']).toPathValues();
                }).
                doAction(function(x) {
                    testRunner.compare({
                        path: [],
                        value: 'The humans are dead.'
                    }, x);
                    count++;
                }, noOp, function() {
                    expect(count).to.equals(1);
                }).
                subscribe(noOp, done, done);
        });
    });
});

