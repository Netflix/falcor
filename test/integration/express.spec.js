// This file starts the server and exposes the Router at /model.json
var express = require('express');
var bodyParser = require('body-parser');
var FalcorServer = require('falcor-express');
var FalcorRouter = require('falcor-router');
var falcor = require('./../../browser');
var Model = falcor.Model;
var HttpDataSource = falcor.HttpDataSource;
var expect = require('chai').expect;
var sinon = require('sinon');
var noOp = function() {};
var strip = require('./../cleanData').stripDerefAndVersionKeys;

describe('Express Integration', function() {
    var server;
    beforeEach(function(done) {
        var app = express();
        app.use(bodyParser.urlencoded({ extended: false }));

        // Simple middleware to handle get/post
        app.use('/model.json', FalcorServer.dataSourceRoute(function(req, res) {
            return new FalcorRouter([
                {
                    // match a request for the key "greeting"
                    route: "greeting",
                    // respond with a PathValue with the value of "Hello World."
                    get: function() {
                        return {path:["greeting"], value: "Hello World"};
                    }
                }
            ]);
        }));

        server = app.listen(1337, done);
    });

    it('should be able to perform the express demo.', function(done) {
        var model = new falcor.Model({
            source: new falcor.HttpDataSource('http://localhost:1337/model.json')
        });
        var onNext = sinon.spy();

        toObservable(model.
            get('greeting')).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                    json: {
                        greeting: 'Hello World'
                    }
                });
            }).
            subscribe(noOp, function(err) {
                done(err);
            }, done);
    });

    afterEach(function() {
        server.close();
    });
});
