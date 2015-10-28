var falcor = require("./../../../lib/");
var Model = falcor.Model;
var Rx = require('rx');
var noOp = function() {};
var LocalDataSource = require('../../data/LocalDataSource');
var Observable = Rx.Observable;
var sinon = require('sinon');
var expect = require('chai').expect;
var clean = require('./../../cleanData').clean;
var cacheGenerator = require('./../../CacheGenerator');

var M = function() {
    return cacheGenerator(0, 1);
};
var Cache = function() {
    return cacheGenerator(0, 40);
};

describe('DataSource and Partial Cache', function() {
    describe('Preload Functions', function() {
        it('should get multiple arguments with multiple selector function args.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var onNext = sinon.spy();
            var secondOnNext = sinon.spy();
            model.
                preload(['videos', 0, 'title'], ['videos', 1, 'title']).
                doAction(onNext, noOp, function() {
                    expect(onNext.callCount).to.equal(0);
                }).
                defaultIfEmpty({}).
                flatMap(function() {
                    return model.get(['videos', 0, 'title'], ['videos', 1, 'title']);
                }).
                doAction(secondOnNext, noOp, function() {
                    expect(secondOnNext.calledOnce).to.be.ok;
                    expect(secondOnNext.getCall(0).args[0]).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'Video 0'
                                },
                                1: {
                                    title: 'Video 1'
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });

        it('should get a complex argument into a single arg.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var onNext = sinon.spy();
            var secondOnNext = sinon.spy();
            model.
                preload(['lolomo', 0, {to: 1}, 'item', 'title']).
                doAction(onNext).
                doAction(noOp, noOp, function() {
                    expect(onNext.callCount).to.equal(0);
                }).
                defaultIfEmpty({}).
                flatMap(function() {
                    return model.get(['lolomo', 0, {to: 1}, 'item', 'title']);
                }).
                doAction(secondOnNext, noOp, function() {
                    expect(secondOnNext.calledOnce).to.be.ok;
                    expect(secondOnNext.getCall(0).args[0]).to.deep.equals({
                        json: {
                            lolomo: {
                                0: {
                                    0: {
                                        item: {
                                            title: 'Video 0'
                                        }
                                    },
                                    1: {
                                        item: {
                                            title: 'Video 1'
                                        }
                                    }
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('PathMap', function() {
        it('should get multiple arguments into a single toJSON response.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var onNext = sinon.spy();
            model.
                get(['lolomo', 0, 0, 'item', 'title'], ['lolomo', 0, 1, 'item', 'title']).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(onNext.getCall(0).args[0]).to.deep.equals({
                        json: {
                            lolomo: {
                                0: {
                                    0: {
                                        item: {
                                            title: 'Video 0'
                                        }
                                    },
                                    1: {
                                        item: {
                                            title: 'Video 1'
                                        }
                                    }
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });

        it('should get a complex argument into a single arg.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var onNext = sinon.spy();
            model.
                get(['lolomo', 0, {to: 1}, 'item', 'title']).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(onNext.getCall(0).args[0]).to.deep.equals({
                        json: {
                            lolomo: {
                                0: {
                                    0: {
                                        item: {
                                            title: 'Video 0'
                                        }
                                    },
                                    1: {
                                        item: {
                                            title: 'Video 1'
                                        }
                                    }
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });

        it('should get a complex argument into a single arg and collect to max cache size.', function(done) {
            var model = new Model({
                cache: M(),
                source: new LocalDataSource(Cache()),
                maxSize: 0
            });
            var cache = model._root.cache;
            var onNext = sinon.spy();
            model.
                get(['lolomo', 0, {to: 1}, 'item', 'title']).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(onNext.getCall(0).args[0]).to.deep.equals({
                        json: {
                            lolomo: {
                                0: {
                                    0: {
                                        item: {
                                            title: 'Video 0'
                                        }
                                    },
                                    1: {
                                        item: {
                                            title: 'Video 1'
                                        }
                                    }
                                }
                            }
                        }
                    });
                }).
                finally(function() {
                    expect(cache['$size']).to.equal(0);
                    done();
                }).
                subscribe(noOp, done, noOp);
        });
    });
    describe('_toJSONG', function() {
        it('should get multiple arguments into a single _toJSONG response.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var onNext = sinon.spy();
            model.
                get(['lolomo', 0, 0, 'item', 'title'], ['lolomo', 0, 1, 'item', 'title']).
                _toJSONG().
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    var out = clean(onNext.getCall(0).args[0]);
                    var expected = clean({
                        jsonGraph: cacheGenerator(0, 2),
                        paths: [['lolomo', 0, 0, 'item', 'title'],
                            ['lolomo', 0, 1, 'item', 'title']]
                    });
                    expect(out).to.deep.equals(expected);
                }).
                subscribe(noOp, done, done);
        });

        it('should get a complex argument into a single arg.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var onNext = sinon.spy();
            model.
                get(['lolomo', 0, {to: 1}, 'item', 'title']).
                _toJSONG().
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    var out = clean(onNext.getCall(0).args[0]);
                    var expected = clean({
                        jsonGraph: cacheGenerator(0, 2),
                        paths: [['lolomo', 0, 0, 'item', 'title'],
                            ['lolomo', 0, 1, 'item', 'title']]
                    });
                    expect(out).to.deep.equals(expected);
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('Progressively', function() {
        it('should get multiple arguments with multiple trips to the dataSource into a single toJSON response.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var count = 0;
            model.
                get(['lolomo', 0, 0, 'item', 'title'], ['lolomo', 0, 1, 'item', 'title']).
                progressively().
                doAction(function(x) {
                    count++;
                    if (count === 1) {
                        expect(x).to.deep.equals({
                            json: {
                                lolomo: {
                                    0: {
                                        0: {
                                            item: {
                                                title: 'Video 0'
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        expect(x).to.deep.equals({
                            json: {
                                lolomo: {
                                    0: {
                                        0: {
                                            item: {
                                                title: 'Video 0'
                                            }
                                        },
                                        1: {
                                            item: {
                                                title: 'Video 1'
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }, noOp, function() {
                    expect(count).to.equals(2);
                }).
                subscribe(noOp, done, done);
        });

        it('should get complex path with multiple trips to the dataSource into a single toJSON response.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var count = 0;
            model.
                get(['lolomo', 0, {to: 1}, 'item', 'title']).
                progressively().
                doAction(function(x) {
                    count++;
                    if (count === 1) {
                        expect(x).to.deep.equals({
                            json: {
                                lolomo: {
                                    0: {
                                        0: {
                                            item: {
                                                title: 'Video 0'
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    } else {
                        expect(x).to.deep.equals({
                            json: {
                                lolomo: {
                                    0: {
                                        0: {
                                            item: {
                                                title: 'Video 0'
                                            }
                                        },
                                        1: {
                                            item: {
                                                title: 'Video 1'
                                            }
                                        }
                                    }
                                }
                            }
                        });
                    }
                }, noOp, function() {
                    expect(count).to.equals(2);
                }).
                subscribe(noOp, done, done);
        });
    });
});

