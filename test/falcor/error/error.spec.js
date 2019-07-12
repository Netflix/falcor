var ErrorDataSource = require("../../data/ErrorDataSource");
var LocalDataSource = require("../../data/ErrorDataSource");
var clean = require("../../cleanData").clean;
var falcor = require("../../../lib");
var Model = falcor.Model;
var noOp = function() {};
var InvalidSourceError = require('../../../lib/errors/InvalidSourceError');
var toObservable = require('../../toObs');
var isAssertionError = require('./../../isAssertionError');

function errorOnCompleted(done) {
    return function() {
        done(new Error('should not onCompleted'));
    };
};

function doneOnError(done) {
    return function(e) {
        if (isAssertionError(e)) {
            return done(e);
        }
        return done();
    };
};

describe("Error", function() {
    it("should get a hard error from the DataSource with _treatDataSourceErrorsAsJSONGraphErrors.", function(done) {
        var model = new Model({
            source: new ErrorDataSource(503, "Timeout"),
            _treatDataSourceErrorsAsJSONGraphErrors: true
        });
        var onNext = jest.fn();
        toObservable(model.
            get(["test", {to: 5}, "summary"])).
            doAction(onNext, function(err) {
                expect(onNext).toHaveBeenCalledTimes(1);
                expect(clean(onNext.mock.calls[0][0])).toEqual({
                    json: {
                        test: {
                            0: {},
                            1: {},
                            2: {},
                            3: {},
                            4: {},
                            5: {}
                        }
                    }
                });
                expect(err.length).toBe(6);
                // not in boxValue mode
                var expected = {
                    path: [],
                    value: {
                        status: 503,
                        message: "Timeout"
                    }
                };
                err.forEach(function(e, i) {
                    expected.path = ["test", i, "summary"];
                    expect(e).toEqual(expected);
                });
            }).
            subscribe(noOp,
            function(e) {
                if (isAssertionError(e)) {
                    done(e);
                } else {
                    done();
                }
            },
            function() {
                done('Should not onComplete');
            });
    });

    it("should get a hard error from the DataSource.", function(done) {
        var model = new Model({
            source: new ErrorDataSource(503, "Timeout")
        });
        toObservable(model.
            get(["test", {to: 5}, "summary"])).
            doAction(noOp, function(err) {
                // not in boxValue mode
                var expected = {
                    $type: "error",
                    value: {
                        status: 503,
                        message: "Timeout"
                    }
                };

                expect(err).toEqual(expected);
            }).
            subscribe(noOp,
            function(e) {
                if (isAssertionError(e)) {
                    done(e);
                } else {
                    done();
                }
            },
            function() {
                done('Should not onComplete');
            });
    });

    it("should get a hard error from the DataSource with some data found in the cache with _treatDataSourceErrorsAsJSONGraphErrors.", function(done) {
        var model = new Model({
            _treatDataSourceErrorsAsJSONGraphErrors: true,
            source: new ErrorDataSource(503, "Timeout"),
            cache: {
                test: {
                    0: {
                        summary: "in cache"
                    },
                    5: {
                        summary: "in cache"
                    }
                }
            }
        });
        var onNext = jest.fn();
        toObservable(model.
            get(["test", {to: 5}, "summary"])).
            doAction(onNext, function(err) {

                // Ensure onNext is called correctly
                expect(onNext).toHaveBeenCalledTimes(1);
                expect(err.length).toBe(4);
                // not in boxValue mode
                var expected = {
                    path: [],
                    value: {
                        status: 503,
                        message: "Timeout"
                    }
                };
                err.forEach(function(e, i) {
                    expected.path = ["test", i + 1, "summary"];
                    expect(e).toEqual(expected);
                });
            }).
            subscribe(noOp, doneOnError(done), errorOnCompleted(done));
    });

    it("should get a hard error from the DataSource with some data found in the cache.", function(done) {
        var model = new Model({
            source: new ErrorDataSource(503, "Timeout"),
            cache: {
                test: {
                    0: {
                        summary: "in cache"
                    },
                    5: {
                        summary: "in cache"
                    }
                }
            }
        });
        var onNext = jest.fn();
        toObservable(model.
            get(["test", {to: 5}, "summary"])).
            doAction(onNext, function(err) {

                expect(onNext).toHaveBeenCalledTimes(1);
                expect(clean(onNext.mock.calls[0][0])).toEqual({
                    json: {
                        test: {
                            0: {
                                summary: 'in cache'
                            },
                            5: {
                                summary: 'in cache'
                            }
                        }
                    }
                });

                // not in boxValue mode
                var expected = {
                    $type: "error",
                    value: {
                        status: 503,
                        message: "Timeout"
                    }
                };
                expect(err).toEqual(expected);
            }).
            subscribe(noOp, doneOnError(done), errorOnCompleted(done));
    });

    it("should onNext when only receiving errors.", function(done) {
        var model = new Model({
            source: new Model({
                cache: {
                    test: {
                        0: {
                            summary: {
                                $type: 'error',
                                value: {
                                    message: 'Oops!',
                                    status: 500
                                }
                            }
                        },
                        1: {
                            summary: {
                                $type: 'error',
                                value: {
                                    message: 'Oops!',
                                    status: 500
                                }
                            }
                        }
                    }
                }
            }).asDataSource()
        });
        var onNext = jest.fn();
        toObservable(model.
            get(["test", {to: 1}, "summary"])).
            doAction(onNext, function(err) {

                expect(onNext).toHaveBeenCalledTimes(1);
                expect(clean(onNext.mock.calls[0][0])).toEqual({
                    json: {
                        test: {
                            0: {},
                            1: {}
                        }
                    }
                });

                // not in boxValue mode
                var expected = [
                    {"path":["test",0,"summary"],"value":{"message":"Oops!","status":500}},
                    {"path":["test",1,"summary"],"value":{"message":"Oops!","status":500}}
                ];
                expect(err).toEqual(expected);
            }).
            subscribe(noOp, doneOnError(done), errorOnCompleted(done));
    });

    it("should onNext when receiving errors and missing paths.", function(done) {
        var model = new Model({
            source: new Model({
                cache: {
                    test: {
                        0: {
                            summary: {
                                $type: 'error',
                                value: {
                                    message: 'Oops!',
                                    status: 500
                                }
                            }
                        },
                        5: {
                            summary: {
                                $type: 'error',
                                value: {
                                    message: 'Oops!',
                                    status: 500
                                }
                            }
                        }
                    }
                }
            }).asDataSource()
        });
        var onNext = jest.fn();
        toObservable(model.
            get(["test", {to: 5}, "summary"])).
            doAction(onNext, function(err) {

                expect(onNext).toHaveBeenCalledTimes(1);
                expect(clean(onNext.mock.calls[0][0]), 'json from onNext').toEqual({
                    json: {
                        test: {
                            0: {},
                            5: {}
                        }
                    }
                });

                // not in boxValue mode
                var expected = [
                    {"path":["test",0,"summary"],"value":{"message":"Oops!","status":500}},
                    {"path":["test",5,"summary"],"value":{"message":"Oops!","status":500}}
                ];
                expect(err).toEqual(expected);
            }).
            subscribe(noOp, doneOnError(done), errorOnCompleted(done));
    });

    it('should allow for dataSources to immediately throw an error (set)', function(done) {
        var routes = {
            set: function() {
                return thisVarDoesNotExistAndThatsAFact;
            }
        };
        var model = new falcor.Model({ source: routes });
        var onNext = jest.fn();
        var onError = jest.fn();
        toObservable(model.
            set({
                paths: [['titlesById', 242, 'rating']],
                jsonGraph: {
                    titlesById: {
                        242: {
                            rating: 5
                        }
                    }
                }
            })).
            doAction(onNext, onError).
            doAction(noOp, function() {
                expect(onNext).not.toHaveBeenCalled();
                expect(onError).toHaveBeenCalledTimes(1);
                expect(onError.mock.calls[0][0].name).toBe(InvalidSourceError.name);
            }).
            subscribe(noOp, function(e) {
                if (isAssertionError(e)) {
                    return done(e);
                }
                return done();
            }, done.bind(null, new Error('should not complete')));
    });

    it('should allow for dataSources to immediately throw an error (get)', function(done) {
        var routes = {
            get: function() {
                return thisVarDoesNotExistAndThatsAFact;
            }
        };
        var model = new falcor.Model({ source: routes });
        var onNext = jest.fn();
        var onError = jest.fn();
        toObservable(model.
            get(['path', 'to', 'value'])).
            doAction(onNext, function(e) {
                expect(onNext).toHaveBeenCalledTimes(1);
                expect(clean(onNext.mock.calls[0][0])).toEqual({
                    json: {

                    }
                })
                expect(e.name).toBe(InvalidSourceError.name);
            }).
            subscribe(noOp, function(e) {
                if (isAssertionError(e)) {
                    return done(e);
                }
                return done();
            }, done.bind(null, new Error('should not complete')));
    });

    it('should allow for dataSources to immediately throw an error (call)', function(done) {
        var routes = {
            call: function() {
                return thisVarDoesNotExistAndThatsAFact;
            }
        };
        var model = new falcor.Model({ source: routes });
        var onNext = jest.fn();
        toObservable(model.
            call(['videos', 1234, 'rating'], 5)).
            doAction(onNext).
            doAction(noOp, function(err) {
                expect(onNext).not.toHaveBeenCalled();
                expect(err.name).toBe(InvalidSourceError.name);
            }).
            subscribe(noOp, function(e) {
                if (isAssertionError(e)) {
                    return done(e);
                }
                return done();
            }, done.bind(null, new Error('should not complete')));
    });
});
