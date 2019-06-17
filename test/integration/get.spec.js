// This file starts the server and exposes the Router at /model.json
var express = require('express');
var FalcorServer = require('falcor-express');
var falcor = require('./../../browser');
var Router = require('falcor-router');
var strip = require('./../cleanData').stripDerefAndVersionKeys;
var MaxRetryExceededError = require('../../lib/errors/MaxRetryExceededError');
var noOp = function() {};
var toObservable = require('../toObs');

describe('Get Integration Tests', function() {
    var app, server, serverUrl, model, onNext;

    beforeEach(function(done) {
        app = express();
        server = app.listen(60002, done);
        serverUrl = 'http://localhost:60002';
        model = new falcor.Model({
            source: new falcor.HttpDataSource(serverUrl + '/model.json')
        });
        onNext = jest.fn();
    });

    it('should be able to return null from a router. #535', function(done) {
        setRoutes([
            {
                route: ['thing', 'prop'],
                get: function (path) {
                    return {
                        path: ['thing', 'prop'],
                        value: null
                    };
                }
            }
        ]);

        toObservable(model.
            get(['thing', 'prop'])).
            doAction(onNext, noOp, function() {
                expect(onNext).toHaveBeenCalledTimes(1);
                expect(strip(onNext.mock.calls[0][0])).toEqual({
                    json: {
                        thing: {
                            prop: null
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });

    describe('expiry', function() {
        it('$expires = 0 should expire immediately after current tick of event loop', function(done) {
            setRoutes([{
                route: ['path'],
                get: function() {
                    return {
                        path: ['path'],
                        value: { $type: 'atom', $expires: 0, value: 'value' }
                    };
                }
            }]);

            model.get('path').subscribe(onNext, done, function() {
                expect(onNext).toHaveBeenCalledTimes(1);
                expect(strip(onNext.mock.calls[0][0])).toEqual({
                    json: { path: 'value' }
                });
                model.
                    withoutDataSource().
                    get('path').
                    subscribe(function(sameTickValue) {
                        expect(sameTickValue).toEqual({
                            json: { path: 'value' }
                        });
                    }, done, function() {
                        setTimeout(function() {
                            model.
                                withoutDataSource().
                                get('path').
                                subscribe(function(nextTickValue) {
                                    expect(nextTickValue).toEqual({ json: {} });
                                }, done, done);
                        }, 0);
                    });
            });
        });

        it('$expires = 1 should never expire (unless kicked out by LRU cache)', function(done) {
            setRoutes([{
                route: ['path'],
                get: function() {
                    return {
                        path: ['path'],
                        value: { $type: 'atom', $expires: 1, value: 'value' }
                    };
                }
            }]);

            model.get('path').subscribe(onNext, done, function() {
                expect(onNext).toHaveBeenCalledTimes(1);
                expect(strip(onNext.mock.calls[0][0])).toEqual({
                    json: { path: 'value' }
                });
                setTimeout(function() {
                    model.
                        withoutDataSource().
                        get('path').
                        subscribe(function(nearFutureValue) {
                            expect(nearFutureValue).toEqual({
                                json: { path: 'value' }
                            });
                        }, done, function() {
                            setTimeout(function() {
                                model.
                                    withoutDataSource().
                                    get('path').
                                    subscribe(function(farFutureValue) {
                                        expect(farFutureValue).toEqual({
                                            json: { path: 'value' }
                                        });
                                    }, done, done);
                            }, 500);
                        });
                }, 20);
            });
        });

        it('$expires = -<timestamp> should expire in relative future', function(done) {
            setRoutes([{
                route: ['path'],
                get: function() {
                    return {
                        path: ['path'],
                        value: { $type: 'atom', $expires: -100, value: 'value' }
                    };
                }
            }]);

            model.get('path').subscribe(onNext, done, function() {
                expect(onNext).toHaveBeenCalledTimes(1);
                expect(strip(onNext.mock.calls[0][0])).toEqual({
                    json: { path: 'value' }
                });
                setTimeout(function() {
                    model.
                        withoutDataSource().
                        get('path').
                        subscribe(function(nearFutureValue) {
                            expect(nearFutureValue).toEqual({
                                json: { path: 'value' }
                            });
                        }, done, function() {
                            setTimeout(function() {
                                model.
                                    withoutDataSource().
                                    get('path').
                                    subscribe(function(farFutureValue) {
                                        expect(farFutureValue).toEqual({});
                                    }, done, done);
                            }, 50);
                        });
                }, 50);
            });
        });

        it('$expires = <timestamp> should expire at absolute time', function(done) {
            setRoutes([{
                route: ['path'],
                get: function() {
                    return {
                        path: ['path'],
                        value: { $type: 'atom', $expires: Date.now() + 100, value: 'value' }
                    };
                }
            }]);

            model.get('path').subscribe(onNext, done, function() {
                expect(onNext).toHaveBeenCalledTimes(1);
                expect(strip(onNext.mock.calls[0][0])).toEqual({
                    json: { path: 'value' }
                });
                setTimeout(function() {
                    model.
                        withoutDataSource().
                        get('path').
                        subscribe(function(nearFutureValue) {
                            expect(nearFutureValue).toEqual({
                                json: { path: 'value' }
                            });
                        }, done, function() {
                            setTimeout(function() {
                                model.
                                    withoutDataSource().
                                    get('path').
                                    subscribe(function(farFutureValue) {
                                        expect(farFutureValue).toEqual({});
                                    }, done, done);
                            }, 50);
                        });
                }, 50);
            });
        });

        it('$expires = <past timestamp> has already expired, causing retries', function(done) {
            setRoutes([{
                route: ['path'],
                get: function() {
                    return {
                        path: ['path'],
                        value: { $type: 'atom', $expires: Date.now() - 100, value: 'value' }
                    };
                }
            }]);

            model.get('path').subscribe(noOp, function(e) {
                expect(MaxRetryExceededError.is(e)).toBe(true);
                done();
            }, done.bind(null, new Error('should not complete')));
        });
    });

    afterEach(function(done) {
        server.close(done);
    });

    function setRoutes(routes) {
      app.use('/model.json', FalcorServer.dataSourceRoute(function() {
          return new Router(routes);
      }));
    }
});

