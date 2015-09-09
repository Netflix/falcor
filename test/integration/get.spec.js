// This file starts the server and exposes the Router at /model.json
var express = require('express');
var FalcorServer = require('falcor-express');
var falcor = require('./../../browser');
var Model = falcor.Model;
var HttpDataSource = falcor.HttpDataSource;
var expect = require('chai').expect;
var sinon = require('sinon');
var noOp = function() {};
var Router = require('falcor-router');

describe('Get Integration Tests', function() {
    var server;
    beforeEach(function(done) {
        var app = express();

        // Simple middleware to handle get/post
        app.use('/model.json', FalcorServer.dataSourceRoute(function(req, res) {
            return new Router([
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
        }));

        server = app.listen(1337, function(err) {
            if (err) {
                done(err);
                return;
            }
            done();
        });

    });

    it('should be able to return null from a router. #535', function(done) {
        var model = new falcor.Model({
            source: new falcor.HttpDataSource('http://localhost:1337/model.json')
        });
        var onNext = sinon.spy();

        model.
            get(['thing', 'prop']).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onNext.getCall(0).args[0]).to.deep.equals({
                    json: {
                        thing: {
                            prop: null
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });

    afterEach(function() {
        server.close();
    });
});
