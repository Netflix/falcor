var express = require('express');
var app = express();
var FalcorServer = require('falcor-server');
var Cache = require('../../data/Cache');
var falcor = require('../../../index');
var Rx = require('rx');

var serverModel = new falcor.Model({cache: Cache()});
var server = new FalcorServer(serverModel);

// Simple middleware to handle get/post
app.use('/falcor', function(req, res, next) {
    server.fromHttpRequest(req, function(err, jsongString) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).send(jsongString);
        }
        next();
    });
});

module.exports = function(port) {
    
    // Note: Will never complete
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
