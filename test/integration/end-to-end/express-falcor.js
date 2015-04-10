var express = require('express');
var app = express();
var FalcorServer = require('falcor-server');
var Cache = require('../../data/Cache');
var falcor = require('../../../index');
var Rx = require('rx');
var edgeCaseCache = require('./data/EdgeCase')();
var fullCacheModel = new falcor.Model({cache: Cache()}).materialize();
var fullCacheServer = new FalcorServer(fullCacheModel);
var edgeCaseModel = new falcor.Model({cache: edgeCaseCache}).materialize();
var edgeCaseServer = new FalcorServer(edgeCaseModel);

// Simple middleware to handle get/post
app.use('/falcor', function(req, res, next) {
    fullCacheServer.fromHttpRequest(req, function(err, jsongString) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(jsongString);
        }
        next();
    });
});
app.use('/falcor.edge', function(req, res, next) {
    edgeCaseServer.fromHttpRequest(req, function(err, jsongString) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(jsongString);
        }
        next();
    });
});

module.exports = function(port) {
    // Note: Will never complete unless explicitly closed.
    return Rx.Observable.create(function(observer) {
        var server = app.listen(port, function(err) {
            if (err) {
                observer.onError(err);
                return;
            }

            observer.onNext();
        });

        return function() {
            server.close();
        };
    });
};
