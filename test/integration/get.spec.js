// This file starts the server and exposes the Router at /model.json
var express = require('express');
var FalcorServer = require('falcor-express');
var falcor = require('./../../browser');
var expect = require('chai').expect;
var sinon = require('sinon');
var Router = require('falcor-router');
var strip = require('./../cleanData').stripDerefAndVersionKeys;
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

    afterEach(function(done) {
        server.close(done);
    });

    function setRoutes(routes) {
      app.use('/model.json', FalcorServer.dataSourceRoute(function() {
          return new Router(routes);
      }));
    }

    function setServerCache(cache) {
        var serverModel = new falcor.Model({ cache: cache });
        app.use('/model.json', FalcorServer.dataSourceRoute(function() {
            return serverModel.asDataSource();
        }));
    }
});

