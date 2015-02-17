var jsong = require("../../../bin/Falcor");
var Model = jsong.Model;
var Rx = require("rx");
var LocalDataSource = require("../../data/LocalDataSource");
var Cache = require("../../data/Cache");
var ReducedCache = require("../../data/ReducedCache");
var Expected = require("../../data/expected");
var getTestRunner = require("../../getTestRunner");
var testRunner = require("../../testRunner");
var Values = Expected.Values;
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};
var getDataModel = testRunner.getModel;

describe('#getValue', function() {
    it('should perform a getValue.', function(done) {
        var model = getDataModel();
        model.
            getValue(['videos', 1234, 'summary']).
            subscribe(function(denseJSON) {
                testRunner.compare(Values().direct.AsJSON.values[0].json, denseJSON);
                // testRunner.compare(Cache().videos[1234].summary, denseJSON);
            }, done, done);
    });

    it('should perform a getValue to an error.', function(done) {
        var model = getDataModel(null, Cache());
        model.
            getValue(['genreList', 2, 0, 'summary']).
            toJSONG().
            subscribe(function() {
                done('onNext was called when encountering an error.');
            }, function(err) {
                testRunner.compare(Cache().lists['error-list'], err[0]);
            }, function() {
                done('onCompleted was called when encountering an error.');
            });
    });

    it('should perform a getValue to an error with treatErrorsAsValues.', function(done) {
        var model = getDataModel(null, Cache());
        model.
            treatErrorsAsValues().
            getValue(['genreList', 2, 0, 'summary']).
            toJSONG().
            subscribe(function(err) {
                testRunner.compare(Cache().lists['error-list'], err);
            }, done, done);
    });
    
    describe('Sync', function() {
        it('should perform a getValueSync.', function(done) {
            var model = getDataModel();
            model.
                get(['videos', 1234, 'summary'], function() {
                    return this.getValueSync(['videos', 1234, 'summary']);
                }).
                subscribe(function(denseJSON) {
                    testRunner.compare(Values().direct.AsJSON.values[0].json, denseJSON);
                }, done, done);
        });
        
        it('should perform a getValueSync on an error.', function(done) {
            var model = getDataModel(null, Cache());
            model.
                get(['genreList', {to: 2}, 0, 'summary'], function() {
                    var threw = false;
                    try {
                        this.getValueSync(['genreList', 2, 0, 'summary']);
                    } catch (e) {
                        testRunner.compare({
                            "$type": "error",
                            "message": "Red is the new Black"
                        }, e);
                        threw = true;
                    }

                    testRunner.compare(true, threw, 'Expecting the call to getValueSync(pathToErrorObject) to throw');
                    return null;
                }).
                subscribe(noOp, done, done);
        });
    });
});

