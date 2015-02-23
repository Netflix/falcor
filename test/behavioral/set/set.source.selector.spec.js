var jsong = require("../../../bin/Falcor");
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

describe('Selector', function() {
    it('should set a value.', function(done) {
        var source = new LocalDataSource(Cache(), {
            onSet: function(source, jsongEnv) {

                // NOTE: Intentionally set the rating to 5 to ensure that the servers response wins
                jsongEnv.jsong.videos[1234].rating = 5;
            }
        });
        var model = new Model({
            dataSource: source,
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
            set({path: ['videos', 1234, 'rating'], value: 3.5}, function(video) {
                count++;
                testRunner.compare(5, video);
            }).
            doOnCompleted(function() {
                expect(count, 'expect onNext to be called one time.').to.equal(1);
            }).
            subscribe(noOp, done, done);
    });

    it('should set poly-input througth the modelSource.', function(done) {
        var source = new LocalDataSource(Cache(), { });
        var model = new Model({
            dataSource: source
        });
        var count = 0;
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
                }, 
                function(videoRating, videoDesc) {
                    count++;
                    testRunner.compare(3.5, videoRating);
                    testRunner.compare('This is the description of a life-time.', videoDesc);
                }).
            doOnCompleted(function() {
                expect(count, 'expect onNext to be called one time.').to.equal(1);
            }).
            subscribe(noOp, done, done);
    });
});

