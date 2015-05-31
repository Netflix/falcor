var express = require('express');
var app = express();
var FalcorServer = require('falcor-express');
var Cache = require('../../data/Cache');
var falcor = require('../../../index');
var Rx = require('rx');
var edgeCaseCache = require('./../../data/EdgeCase')();
var fullCacheModel = new falcor.Model({cache: Cache()}).materialize();
var edgeCaseModel = new falcor.Model({cache: edgeCaseCache}).materialize();

// Simple middleware to handle get/post
app.use('/falcor', FalcorServer.expressMiddleware(function() {
    return {
        get: function(paths) {
            return fullCacheModel.
                get.apply(fullCacheModel, paths).
                toJSONG();
        }
    };
}));
app.use('/falcor.edge', FalcorServer.expressMiddleware(function() {
    return {
        get: function(paths) {
            return edgeCaseModel.
                get.apply(edgeCaseModel, paths).
                toJSONG();
        }
    };
}));

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
