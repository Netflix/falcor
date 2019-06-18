var falcor = require("./../../../lib/");
var Model = falcor.Model;
var Rx = require('rx');
var noOp = function() {};
var Observable = Rx.Observable;
var CacheGenerator = require('./../../CacheGenerator');
var toObservable = require('./../../toObs');
var strip = require('./../../cleanData').stripDerefAndVersionKeys;

describe('Path Syntax', function() {
    var model;
    beforeEach(function() {
        model = new Model({cache: CacheGenerator(0, 2)});
        model._root.unsafeMode = true;
    });

    it('should accept strings for get.', function(done) {
        var onNext = jest.fn();
        toObservable(model.get('lolomo[0][0].item.title', 'lolomo[0][1].item.title')).
            doAction(onNext, noOp, function() {
                expect(strip(onNext.mock.calls[0][0])).toEqual({
                    json: {
                        lolomo: {
                            0: {
                                0: {
                                    item: { title: 'Video 0' }
                                },
                                1: {
                                    item: { title: 'Video 1' }
                                }
                            }
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });
    it('should accept strings for getValue', function(done) {
        var onNext = jest.fn();
        toObservable(model.getValue('videos[0].title')).
            doAction(onNext, noOp, function() {
                expect(onNext.mock.calls[0][0]).toEqual('Video 0');
            }).
            subscribe(noOp, done, done);
    });
});
