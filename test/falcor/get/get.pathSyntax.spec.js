var falcor = require("./../../../lib/");
var Model = falcor.Model;
var Rx = require('rx');
var noOp = function() {};
var Observable = Rx.Observable;
var CacheGenerator = require('./../../CacheGenerator');
var sinon = require('sinon');
var expect = require('chai').expect;

describe('Path Syntax', function() {
    var model = new Model({cache: CacheGenerator(0, 2)});
    model._root.unsafeMode = true;
    it('should accept strings for get.', function(done) {
        var onNext = sinon.spy();
        model.
            get('lolomo[0][0].item.title', 'lolomo[0][1].item.title').
            doAction(onNext, noOp, function() {
                expect(onNext.getCall(0).args[0]).to.deep.equals({
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
        var onNext = sinon.spy();
        model.
            getValue('videos[0].title').
            doAction(onNext, noOp, function() {
                expect(onNext.getCall(0).args[0]).to.deep.equals('Video 0');
            }).
            subscribe(noOp, done, done);
    });
});
