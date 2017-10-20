// This file starts the server and exposes the Router at /model.json
var express = require('express');
var FalcorServer = require('falcor-express');
var falcor = require('./../../browser');
var expect = require('chai').expect;
var sinon = require('sinon');
var Router = require('falcor-router');
var strip = require('./../cleanData').stripDerefAndVersionKeys;
var MaxRetryExceededError = require('../../lib/errors/MaxRetryExceededError');
var noOp = function() {};

describe('Get Integration Tests', function() {
    var app, server, serverUrl;

    beforeEach(function(done) {
        app = express();
        server = app.listen(1337, done);
        serverUrl = 'http://localhost:1337';
    });

    it('should be able to return null from a router. #535', function(done) {
        var model = new falcor.Model({
            source: new falcor.HttpDataSource(serverUrl + '/model.json')
        });
        var onNext = sinon.spy();
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
                expect(onNext.calledOnce).to.be.ok;
                expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
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
            var model = new falcor.Model({
                source: new falcor.HttpDataSource(serverUrl + '/model.json')
            });
            var onNext = sinon.spy();
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
                expect(onNext.calledOnce).to.be.ok;
                expect(strip(onNext.getCall(0).args[0])).to.deep.equal({
                    json: { path: 'value' }
                });
                model.
                    withoutDataSource().
                    get('path').
                    subscribe(function(sameTickValue) {
                        expect(sameTickValue).to.deep.equal({
                            json: { path: 'value' }
                        });
                    }, done, function() {
                        setTimeout(function() {
                            model.
                                withoutDataSource().
                                get('path').
                                subscribe(function(nextTickValue) {
                                    expect(nextTickValue).to.deep.equal({ json: {} });
                                }, done, done);
                        }, 0);
                    });
            });
        });

        it('$expires = 1 should never expire (unless kicked out by LRU cache)', function(done) {
            var model = new falcor.Model({
                source: new falcor.HttpDataSource(serverUrl + '/model.json')
            });
            var onNext = sinon.spy();
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
                expect(strip(onNext.getCall(0).args[0])).to.deep.equal({
                    json: { path: 'value' }
                });
                setTimeout(function() {
                    model.
                        withoutDataSource().
                        get('path').
                        subscribe(function(nearFutureValue) {
                            expect(nearFutureValue).to.deep.equal({
                                json: { path: 'value' }
                            });
                        }, done, function() {
                            setTimeout(function() {
                                model.
                                    withoutDataSource().
                                    get('path').
                                    subscribe(function(farFutureValue) {
                                        expect(farFutureValue).to.deep.equal({
                                            json: { path: 'value' }
                                        });
                                    }, done, done);
                            }, 500);
                        });
                }, 20);
            });
        });

        it('$expires = -<timestamp> should expire in relative future', function(done) {
            var model = new falcor.Model({
                source: new falcor.HttpDataSource(serverUrl + '/model.json')
            });
            var onNext = sinon.spy();
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
                expect(strip(onNext.getCall(0).args[0])).to.deep.equal({
                    json: { path: 'value' }
                });
                setTimeout(function() {
                    model.
                        withoutDataSource().
                        get('path').
                        subscribe(function(nearFutureValue) {
                            expect(nearFutureValue).to.deep.equal({
                                json: { path: 'value' }
                            });
                        }, done, function() {
                            setTimeout(function() {
                                model.
                                    withoutDataSource().
                                    get('path').
                                    subscribe(function(farFutureValue) {
                                        expect(farFutureValue).to.deep.equal({});
                                    }, done, done);
                            }, 50);
                        });
                }, 50);
            });
        });

        it('$expires = <timestamp> should expire at absolute time', function(done) {
            var model = new falcor.Model({
                source: new falcor.HttpDataSource(serverUrl + '/model.json')
            });
            var onNext = sinon.spy();
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
                expect(strip(onNext.getCall(0).args[0])).to.deep.equal({
                    json: { path: 'value' }
                });
                setTimeout(function() {
                    model.
                        withoutDataSource().
                        get('path').
                        subscribe(function(nearFutureValue) {
                            expect(nearFutureValue).to.deep.equal({
                                json: { path: 'value' }
                            });
                        }, done, function() {
                            setTimeout(function() {
                                model.
                                    withoutDataSource().
                                    get('path').
                                    subscribe(function(farFutureValue) {
                                        expect(farFutureValue).to.deep.equal({});
                                    }, done, done);
                            }, 50);
                        });
                }, 50);
            });
        });

        it('$expires = <past timestamp> has already expired, causing retries', function(done) {
            var model = new falcor.Model({
                source: new falcor.HttpDataSource(serverUrl + '/model.json')
            });
            var onNext = sinon.spy();
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
                expect(MaxRetryExceededError.is(e)).to.be.ok;
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

