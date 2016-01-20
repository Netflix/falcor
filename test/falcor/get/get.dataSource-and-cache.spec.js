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
var jsonGraph = require('falcor-json-graph');

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

        it('should ensure that a response where only materialized atoms come ' +
           'through still onNexts a value if one is present in cache.', function(done) {
            var model = new Model({
                cache: {
                    paths: {
                        0: 'test',
                        1: 'test'
                    }
                },
                source: new LocalDataSource({
                    paths: {
                        2: Model.atom(undefined),
                        3: Model.atom(undefined)
                    }
                })
            });

            var onNext = sinon.spy();
            model.
                get(['paths', {to:3}]).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce, 'onNext called').to.be.ok;
                    expect(onNext.getCall(0).args[0]).to.deep.equals({
                        json: {
                            paths: {
                                0: 'test',
                                1: 'test'
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
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
    describe('Error Selector (during merge)', function() {

        function generateErrorSelectorSpy(expectedPath) {
            return sinon.spy(function(path, atom) {

                // Needs to be asserted before mutation.
                expect(atom.$type).to.equal('error');
                expect(atom.value).to.deep.equals({message:'errormsg'});

                atom.$custom = 'custom';
                atom.value.customtype = 'customtype';

                return atom;
            });
        }

        function assertExpectedErrorPayload(e, expectedPath) {
            var path = e.path;
            var value = e.value;

            // To avoid hardcoding/scrubbing $size, and other internals
            expect(path).to.deep.equals(expectedPath);

            expect(value.$type).to.equal('error');
            expect(value.$custom).to.equal('custom');
            expect(value.value).to.deep.equals({
                message: 'errormsg',
                customtype: 'customtype'
            });
        }

        it('should get invoked with the right arguments for branches in cache', function(done) {

            // Cache has [lolomo,0,0,item]
            var testPath = ['lolomo',0,0,'item','errorPath'];

            var modelCache = M();
            var dataSourceCache = Cache();
            // [lolomo,0,0,item]->[videos,0]
            dataSourceCache.videos[0].errorPath = jsonGraph.error({message:'errormsg'});

            var onNextSpy = sinon.spy();
            var onErrorSpy = sinon.spy();
            var errorSelectorSpy = generateErrorSelectorSpy(testPath);

            var model = new Model({
                cache: modelCache,
                source: new LocalDataSource(dataSourceCache),
                errorSelector: errorSelectorSpy
            });

            model.
                boxValues().
                get(testPath).
                doAction(onNextSpy, onErrorSpy, noOp).
                subscribe(
                    noOp,
                    function(e) {
                        expect(errorSelectorSpy.callCount).to.equal(1);
                        expect(errorSelectorSpy.getCall(0).args[0]).to.deep.equals(testPath);

                        expect(onErrorSpy.callCount).to.equal(1);

                        expect(e.length).to.equal(1);
                        assertExpectedErrorPayload(e[0], testPath);

                        done();
                    },
                    function() {
                        expect(onNextSpy.callCount).to.equal(0);
                        expect(onErrorSpy.callCount).to.equal(1);
                        done();
                    });
        });

        it('should get invoked with the right arguments for branches not in cache', function(done) {

            // Cache doesn't have [lolomo,1,0,item]
            var testPath = ['lolomo',1,0,'item','errorPath'];

            var modelCache = M();
            var dataSourceCache = Cache();

            // [lolomo,1,0,item]->[videos,10]
            dataSourceCache.videos[10].errorPath = jsonGraph.error({message:'errormsg'});

            var onNextSpy = sinon.spy();
            var onErrorSpy = sinon.spy();
            var errorSelectorSpy = generateErrorSelectorSpy(testPath);

            var model = new Model({
                cache: modelCache,
                source: new LocalDataSource(dataSourceCache),
                errorSelector: errorSelectorSpy
            });

            model.
                boxValues().
                get(testPath).
                doAction(onNextSpy, onErrorSpy, noOp).
                subscribe(
                    noOp,
                    function(e) {
                        expect(errorSelectorSpy.callCount).to.equal(1);
                        expect(errorSelectorSpy.getCall(0).args[0]).to.deep.equals(testPath);

                        expect(onErrorSpy.callCount).to.equal(1);

                        expect(e.length).to.equal(1);
                        assertExpectedErrorPayload(e[0], testPath);

                        done();
                    },
                    function() {
                        expect(onNextSpy.callCount).to.equal(0);
                        expect(onErrorSpy.callCount).to.equal(1);
                        done();
                    });
        });

        it('should get invoked with the correct error paths for a keyset', function(done) {
            var testPath = ['lolomo',[0,1],0,'item','errorPath'];

            var modelCache = M();
            var dataSourceCache = Cache();

            dataSourceCache.videos[0].errorPath = jsonGraph.error({message:'errormsg'});
            dataSourceCache.videos[10].errorPath = jsonGraph.error({message:'errormsg'});

            var onNextSpy = sinon.spy();
            var onErrorSpy = sinon.spy();
            var errorSelectorSpy = generateErrorSelectorSpy(testPath);

            var model = new Model({
                cache: modelCache,
                source: new LocalDataSource(dataSourceCache),
                errorSelector: errorSelectorSpy
            });

            model.
                boxValues().
                get(testPath).
                doAction(onNextSpy, onErrorSpy, noOp).
                subscribe(
                    noOp,
                    function(e) {
                        expect(onErrorSpy.callCount).to.equal(1);

                        expect(errorSelectorSpy.callCount).to.equal(2);
                        expect(errorSelectorSpy.getCall(0).args[0]).to.deep.equals(['lolomo',0,0,'item','errorPath']);
                        expect(errorSelectorSpy.getCall(1).args[0]).to.deep.equals(['lolomo',1,0,'item','errorPath']);

                        expect(e.length).to.equal(2);
                        assertExpectedErrorPayload(e[0], ['lolomo',0,0,'item','errorPath']);
                        assertExpectedErrorPayload(e[1], ['lolomo',1,0,'item','errorPath']);

                        done();
                    },
                    function() {
                        expect(onNextSpy.callCount).to.equal(0);
                        expect(onErrorSpy.callCount).to.equal(1);
                        done();
                    });
        });
    });
});

