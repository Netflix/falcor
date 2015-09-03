// This file starts the server and exposes the Router at /model.json
var express = require('express');
var bodyParser = require('body-parser');
var FalcorServer = require('falcor-express');
var falcorRouterDemoFactory = require('falcor-router-demo');
var falcor = require('./../../browser');
var Model = falcor.Model;
var HttpDataSource = falcor.HttpDataSource;
var expect = require('chai').expect;

describe.only('Express Integration', function() {
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

         model.
             get('genrelist[0..5].titles[0..5].name').
             subscribe(function (data) {
                // TODO: Intentially failing so that we cannot miss this.
                expect('VALIDATE DATA HERE', 'We need to have a test here.').to.be.not.ok;
             }, done, done);
    });

    afterEach(function() {
        server.close();
    });
});
