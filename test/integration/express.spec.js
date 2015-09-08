// This file starts the server and exposes the Router at /model.json
var express = require('express');
var bodyParser = require('body-parser');
var FalcorServer = require('falcor-express');
var falcorRouterDemoFactory = require('falcor-router-demo');
var falcor = require('./../../browser');
var Model = falcor.Model;
var HttpDataSource = falcor.HttpDataSource;
var expect = require('chai').expect;
var sinon = require('sinon');
var noOp = function() {};

describe('Express Integration', function() {
    var server;
    beforeEach(function(done) {
        var app = express();
        app.use(bodyParser.urlencoded({ extended: false }));

        // Simple middleware to handle get/post
        app.use('/model.json', FalcorServer.dataSourceRoute(function(req, res) {
            // Passing in the user ID, this should be retrieved via some auth system
            return falcorRouterDemoFactory("1");
        }));

        server = app.listen(1337, function(err) {
            if (err) {
                done(err);
                return;
            }
            done();
        });

    });

    it('should be able to perform the express demo.', function(done) {
        var model = new falcor.Model({
            source: new falcor.HttpDataSource('http://localhost:1337/model.json')
        });
        var onNext = sinon.spy();

        model.
            get('genrelist[0].titles[0].name').
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onNext.getCall(0).args[0]).to.deep.equals({
                    json: {
                        genrelist: {
                            0: {
                                titles: {
                                    0: {
                                        name: 'Curious George'
                                    }
                                }
                            }
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
