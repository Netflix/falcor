var falcor = require("./../../../lib");
var Model = falcor.Model;
var Rx = require('rx');
var clean = require('./../../cleanData').clean;
var cacheGenerator = require('./../../CacheGenerator');
var noOp = function() {};
var Observable = Rx.Observable;
var clean = require('./../../cleanData').stripDerefAndVersionKeys;
var toObservable = require('../../toObs');

describe('Cache Only', function() {
    describe('PathMap', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({
                cache: cacheGenerator(0, 1)
            });
            var onNext = jest.fn();
            toObservable(model.
                get(['videos', 0, 'title'])).
                doAction(onNext, noOp, function() {
                    expect(onNext).toHaveBeenCalledTimes(1);
                    expect(clean(onNext.mock.calls[0][0])).toEqual({
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
        it('should onNext, then complete on empty paths.', function(done) {
            var model = new Model({
                cache: cacheGenerator(0, 1)
            });
            var onNext = jest.fn();
            toObservable(model.
                get(['videos', [], 'title'])).
                doAction(onNext, noOp, function() {
                    expect(clean(onNext.mock.calls[0][0])).toEqual({
                        json: {
                            videos: {}
                        }
                    });
                    expect(onNext).toHaveBeenCalledTimes(1);
                }).
                subscribe(noOp, done, done);
        });

        it('should use a promise to get request.', function(done) {
            var model = new Model({
                cache: cacheGenerator(0, 1)
            });
            var onNext = jest.fn();
            var onError = jest.fn();
            model.
                get(['videos', 0, 'title']).
                then(onNext, onError).
                then(function() {
                    if (onError.mock.calls[0]) {
                        throw onError.mock.calls[0][0];
                    }

                    expect(onNext).toHaveBeenCalledTimes(1);
                    expect(clean(onNext.mock.calls[0][0])).toEqual({
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
            var onNext = jest.fn();
            toObservable(model.
                get(['lolomo', 0, 0, 'item', 'title']).
                _toJSONG()).
                doAction(onNext, noOp, function() {
                    var out = clean(onNext.mock.calls[0][0]);
                    var expected = clean({
                        jsonGraph: cacheGenerator(0, 1),
                        paths: [['lolomo', 0, 0, 'item', 'title']]
                    });
                    expect(out).toEqual(expected);
                }).
                subscribe(noOp, done, done);
        });
    });
});
