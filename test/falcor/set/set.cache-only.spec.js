var falcor = require("./../../../lib/");
var Model = falcor.Model;
var noOp = function() {};
var expect = require('chai').expect;
var sinon = require('sinon');
var strip = require('./../../cleanData').stripDerefAndVersionKeys;
var cacheGenerator = require('./../../CacheGenerator');

describe('Cache Only', function() {
    describe('toJSON', function() {
        it('should set a value from falcor.', function(done) {
            var model = new Model({
                cache: cacheGenerator(0, 1)
            });
            var onNext = sinon.spy();
            toObservable(model.
                set({path: ['videos', 0, 'title'], value: 'V0'})).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'V0'
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });

        it('should correctly output with many different input types.', function(done) {
            var model = new Model({
                cache: cacheGenerator(0, 3)
            });
            var onNext = sinon.spy();
            toObservable(model.
                set({
                    path: ['videos', 0, 'title'],
                    value: 'V0'
                }, {
                    jsonGraph: {
                        videos: {
                            1: {
                                title: 'V1'
                            }
                        }
                    },
                    paths: [['videos', 1, 'title']]
                }, {
                    json: {
                        videos: {
                            2: {
                                title: 'V2'
                            }
                        }
                    }
                })).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'V0'
                                },
                                1: {
                                    title: 'V1'
                                },
                                2: {
                                    title: 'V2'
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('_toJSONG', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({
                cache: cacheGenerator(0, 1)
            });
            var onNext = sinon.spy();
            toObservable(model.
                set({path: ['videos', 0, 'title'], value: 'V0'}).
                _toJSONG()).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        jsonGraph: {
                            videos: {
                                0: {
                                    title: 'V0'
                                }
                            }
                        },
                        paths: [['videos', 0, 'title']]
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
});
