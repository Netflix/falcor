var jsong = require("../../../index");
var Model = jsong.Model;
var expect = require('chai').expect;
var Cache = require("../../data/Cache");
var ReducedCache = require("../../data/ReducedCache");
var Expected = require("../../data/expected");
var LocalDataSource = require("../../data/LocalDataSource");
var Rx = require("rx");
var testRunner = require("../../testRunner");
var References = Expected.References;
var Complex = Expected.Complex;
var Values = Expected.Values;
var Bound = Expected.Bound;
var noOp = function() {};

describe('AsPathValues', function() {
    it('should set a value.', function(done) {
        var source = new LocalDataSource(Cache(), {
            onSet: function(source, jsongEnv) {

                // NOTE: Intentionally set the rating to 5 to ensure that the servers response wins
                jsongEnv.jsong.videos[1234].rating = 5;
            }
        });
        var model = new Model({
            source: source,
            cache: {
                videos: {
                    1234: {
                        rating: 1
                    }
                }
            }
        });
        var count = 0;
        source.setModel(model);
        
        model.
            set({path: ['videos', 1234, 'rating'], value: 3.5}).
            toPathValues().
            flatMap(function(setResponse) {
                count++;
                testRunner.compare({
                    path: ['videos', 1234, 'rating'],
                    value: 5
                }, setResponse);
                return model.get(['videos', 1234, 'rating']).toPathValues();
            }).
            doAction(function(x) {
                testRunner.compare({
                    path: ['videos', 1234, 'rating'],
                    value: 5
                }, x);
            }, undefined, function() {
                expect(count, 'expect onNext to be called one time.').to.equal(1);
            }).
            subscribe(noOp, done, done);
    });

    it('should set poly-input througth the modelSource.', function(done) {
        var source = new LocalDataSource(Cache(), { });
        var model = new Model({
            source: source
        });
        var count = 0;
        var expects = [{
            path: ['videos', 1234, 'rating'],
            value: 3.5
        }, {
            path: ['videos', 1234, 'description'],
            value: 'This is the description of a life-time.'
        }];
        source.setModel(model);
        model.
            set(
                {path: ['videos', 1234, 'rating'], value: 3.5},
                {
                    videos: {
                        1234: {
                            description: 'This is the description of a life-time.'
                        }
                    }
                }
            ).
            toPathValues().
            doOnNext(function(setResponse) {
                testRunner.compare(expects[count], setResponse);
                count++;
            }).
            doOnCompleted(function() {
                expect(count, 'expect onNext to be called two times.').to.equal(2);
            }).
            subscribe(noOp, done, done);
    });
});
