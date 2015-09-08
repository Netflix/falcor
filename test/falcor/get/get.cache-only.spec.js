var falcor = require("./../../../lib");
var Model = falcor.Model;
var Rx = require('rx');
var clean = require('./../../cleanData').clean;
var cacheGenerator = require('./../../CacheGenerator');
var noOp = function() {};
var Observable = Rx.Observable;
var sinon = require('sinon');
var expect = require('chai').expect;

describe('Cache Only', function() {
    describe('PathMap', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({
                cache: cacheGenerator(0, 1)
            });
            var onNext = sinon.spy();
            model.
                get(['videos', 0, 'title']).
                doAction(onNext, noOp, function() {
                    expect(onNext.callCount).to.equal(1);
                    expect(onNext.getCall(0).args[0]).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'Video 0'
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });
        it('should just complete on empty paths.', function(done) {
            var model = new Model({
                cache: cacheGenerator(0, 1)
            });
            var onNext = sinon.spy();
            model.
                get(['videos', [], 'title']).
                doAction(onNext, noOp, function() {
                    expect(onNext.callCount).to.equal(0);
                }).
                subscribe(noOp, done, done);
        });

        it('should use a promise to get request.', function(done) {
            var model = new Model({
                cache: cacheGenerator(0, 1)
            });
            var onNext = sinon.spy();
            var onError = sinon.spy();
            model.
                get(['videos', 0, 'title']).
                then(onNext, onError).
                then(function() {
                    if (onError.callCount) {
                        return done(onError.getCall(0).args[0]);
                    }

                    expect(onNext.callCount).to.equal(1);
                    expect(onNext.getCall(0).args[0]).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'Video 0'
                                }
                            }
                        }
                    });
                }).
                then(function() { done(); }, done);
        });
    });

    describe('_toJSONG', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({
                cache: cacheGenerator(0, 30)
            });
            var onNext = sinon.spy();
            model.
                get(['lolomo', 0, 0, 'item', 'title']).
                _toJSONG().
                doAction(onNext, noOp, function() {
                    var out = clean(onNext.getCall(0).args[0]);
                    var expected = clean({
                        jsonGraph: cacheGenerator(0, 1),
                        paths: [['lolomo', 0, 0, 'item', 'title']]
                    });
                    expect(out).to.deep.equals(expected);
                }).
                subscribe(noOp, done, done);
        });
    });
});
