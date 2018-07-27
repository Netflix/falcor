var falcor = require('./../../../lib/');
var Model = falcor.Model;
var Rx = require('rx');
var noOp = function() {};
var LocalDataSource = require('../../data/LocalDataSource');
var ErrorDataSource = require('../../data/ErrorDataSource');
var asyncifyDataSource = require('../../data/asyncifyDataSource')
var isPathValue = require('./../../../lib/support/isPathValue');
var expect = require('chai').expect;
var sinon = require('sinon');
var cacheGenerator = require('./../../CacheGenerator');
var atom = require('falcor-json-graph').atom;
var MaxRetryExceededError = require('./../../../lib/errors/MaxRetryExceededError');
var strip = require('./../../cleanData').stripDerefAndVersionKeys;
var isAssertionError = require('./../../isAssertionError');


describe('DataSource Only', function() {
    var dataSource;
    before(function() {
        dataSource = new LocalDataSource(cacheGenerator(0, 2, ['title', 'art'], false));
    });

    describe('Preload Functions', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({source: dataSource});
            var onNext = sinon.spy();
            var secondOnNext = sinon.spy();
            toObservable(model.
                preload(['videos', 0, 'title'])).
                doAction(onNext, noOp, function() {
                    expect(onNext.callCount).to.equal(0);
                }).
                defaultIfEmpty({}).
                flatMap(function() {
                    return model.get(['videos', 0, 'title']);
                }).
                doAction(secondOnNext, noOp, function() {
                    expect(secondOnNext.calledOnce).to.be.ok;
                    expect(strip(secondOnNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {0: {title: 'Video 0'}}}
                    });
                }).
                subscribe(noOp, done, done);
        });

        it('should perform multiple trips to a dataSource.', function(done) {
            var get = sinon.spy(function(source, paths) {
                if (paths.length === 0) {
                    paths.pop();
                }
            });
            var model = new Model({
                source: new LocalDataSource(cacheGenerator(0, 2, ['title', 'art']), {onGet: get})

            });
            var onNext = sinon.spy();
            var secondOnNext = sinon.spy();
            toObservable(model.
                preload(['videos', 0, 'title'],
                    ['videos', 1, 'art'])).
                doAction(onNext).
                doAction(noOp, noOp, function() {
                    expect(onNext.callCount).to.equal(0);
                }).
                defaultIfEmpty({}).
                flatMap(function() {
                    return model.get(['videos', 0, 'title']);
                }).
                doAction(secondOnNext).
                doAction(noOp, noOp, function() {
                    expect(secondOnNext.calledOnce).to.be.ok;
                    expect(strip(secondOnNext.getCall(0).args[0])).to.deep.equals({
                        json: {videos: {0: {title: 'Video 0'}}}
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('PathMap', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({source: dataSource});
            var onNext = sinon.spy();
            toObservable(model.
                get(['videos', 0, 'title'])).
                doAction(onNext, noOp, function() {
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {videos: {0: {title: 'Video 0'}}}
                    });
                }).
                subscribe(noOp, done, done);
        });
        it('should get a directly referenced value from falcor.', function(done) {
            var cache = {
                reference: {
                    $type: 'ref',
                    value: ['foo', 'bar']
                },
                foo: {
                    bar: {
                        $type: 'atom',
                        value: 'value'
                    }
                }
            };
            var model = new Model({source: new LocalDataSource(cache)});
            var onNext = sinon.spy();
            toObservable(model.
                get(['reference', null])).
                doAction(onNext, noOp, function() {
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {reference: 'value'}
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('_toJSONG', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({source: dataSource});
            var onNext = sinon.spy();
            toObservable(model.
                get(['videos', 0, 'title']).
                _toJSONG()).
                doAction(onNext, noOp, function() {
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        jsonGraph: {
                            videos: {
                                0: {
                                    title: atom('Video 0')
                                }
                            }
                        },
                        paths: [['videos', 0, 'title']]
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
    it('should report errors from a dataSource with _treatDataSourceErrorsAsJSONGraphErrors.', function(done) {
        var model = new Model({
            _treatDataSourceErrorsAsJSONGraphErrors: true,
            source: new ErrorDataSource(500, 'Oops!')
        });
        toObservable(model.
            get(['videos', 0, 'title'])).
            doAction(noOp, function(err) {
                expect(err).to.deep.equals([{
                    path: ['videos', 0, 'title'],
                    value: {
                        message: 'Oops!',
                        status: 500
                    }
                }]);
            }, function() {
                throw new Error('On Completed was called. ' +
                     'OnError should have been called.');
            }).
            subscribe(noOp, function(err) {
                // ensure its the same error
                if (Array.isArray(err) && isPathValue(err[0])) {
                    return done();
                }
                return done(err);
            });
    });
    it('should report errors from a dataSource.', function(done) {
        var outputError = null;
        var model = new Model({
            source: new ErrorDataSource(500, 'Oops!')
        });
        toObservable(model.
            get(['videos', 0, 'title'])).
            doAction(noOp, function(err) {
                outputError = err;
                expect(err).to.deep.equals({
                    $type: 'error',
                    value: {
                        message: 'Oops!',
                        status: 500
                    }
                });
            }, function() {
                throw new Error('On Completed was called. ' +
                     'OnError should have been called.');
            }).
            subscribe(noOp, function(err) {
                if (err === outputError) {
                    return done();
                }
                else {
                    return done(err);
                }
            });
    });
    it('should get all missing paths in a single request', function(done) {
        var serviceCalls = 0;
        var cacheModel = new Model({
            cache: {
                lolomo: {
                    summary: {
                        $type: 'atom',
                        value: 'hello'
                    },
                    0: {
                        summary: {
                            $type: 'atom',
                            value: 'hello-0'
                        }
                    },
                    1: {
                        summary: {
                            $type: 'atom',
                            value: 'hello-1'
                        }
                    },
                    2: {
                        summary: {
                            $type: 'atom',
                            value: 'hello-2'
                        }
                    }
                }
            }
        });
        var model = new Model({ source: {
            get: function(paths) {
                serviceCalls++;
                return cacheModel.get.apply(cacheModel, paths)._toJSONG();
            }
        }});


        var onNext = sinon.spy();
        toObservable(model.
            get('lolomo.summary', 'lolomo[0..2].summary')).
            doAction(onNext, noOp, function() {
                var data = onNext.getCall(0).args[0];
                var json = data.json;
                var lolomo = json.lolomo;
                expect(lolomo.summary).to.be.ok;
                expect(lolomo[0].summary).to.be.ok;
                expect(lolomo[1].summary).to.be.ok;
                expect(lolomo[2].summary).to.be.ok;
                expect(serviceCalls).to.equal(1);
            }).
            subscribe(noOp, done, done);
    });

    it('should be able to dispose of getRequests.', function(done) {
        var onGet = sinon.spy();
        var source = new LocalDataSource(cacheGenerator(0, 2), {
            onGet: onGet
        });
        var model = new Model({source: source}).batch();
        var onNext = sinon.spy();
        var disposable = toObservable(model.
            get(['videos', 0, 'title'])).
            doAction(onNext, noOp, function() {
                throw new Error('Should not of completed.  It was disposed.');
            }).
            subscribe(noOp, done);


        disposable.dispose();
        setTimeout(function() {
            try {
                expect(onNext.callCount).to.equal(0);
                expect(onGet.callCount).to.equal(0);
            } catch(e) {
                return done(e);
            }
            return done();
        }, 200);
    });

    it('should ignore response-stuffed paths.', function(done) {
        var onGet = sinon.spy();
        var source = new LocalDataSource(cacheGenerator(0, 2), {
            onGet: onGet,
            wait: 100
        });
        var model = new Model({source: source}).batch(1);
        var onNext = sinon.spy();
        var disposable1 = toObservable(model.
            get(['videos', 0, 'title'])).
            doAction(onNext, noOp, function() {
                throw new Error('Should not of completed.  It was disposed.');
            }).
            subscribe(noOp, done);

        toObservable(model.
            get(['videos', 1, 'title'])).
            subscribe(noOp, done);

        setTimeout(function() {
            disposable1.dispose();
        }, 30);

        setTimeout(function() {
            try {
                expect(model._root.cache.videos[0]).to.be.undefined;
            } catch(e) {
                return done(e);
            }
            return done();
        }, 200);
    });

    it('should honor response-stuffed paths with _useServerPaths == true.', function(done) {
        var onGet = sinon.spy();
        var source = new LocalDataSource(cacheGenerator(0, 2), {
            onGet: onGet,
            wait: 100,
            onResults: function(data) {
                data.paths = [
                    ['videos', 0, 'title'],
                    ['videos', 1, 'title']
                ];
            }
        });
        var model = new Model({source: source, _useServerPaths: true}).batch(1);
        var onNext = sinon.spy();
        var disposable1 = toObservable(model.
            get(['videos', 0, 'title'])).
            doAction(onNext, noOp, function() {
                throw new Error('Should not of completed.  It was disposed.');
            }).
            subscribe(noOp, done);

        toObservable(model.
            get(['videos', 1, 'title'])).
            subscribe(noOp, done);

        setTimeout(function() {
            disposable1.dispose();
        }, 30);

        setTimeout(function() {
            try {
                expect(model._root.cache.videos[0].$_absolutePath).to.deep.equal(['videos', 0]);
            } catch(e) {
                return done(e);
            }
            return done();
        }, 200);
    });

    it('should throw when server paths are missing and _useServerPaths == true.', function(done) {
        var source = new LocalDataSource(cacheGenerator(0, 2));
        var model = new Model({source: source, _useServerPaths: true}).batch(1);
        toObservable(model.
            get(['videos', 0, 'title'])).
            subscribe(noOp, function(err) {
                expect(err.message).to.equal("Server responses must include a 'paths' field when Model._useServerPaths === true");
                done();
            });
    });

    it('should be able to dispose one of two get requests..', function(done) {
        var onGet = sinon.spy();
        var source = new LocalDataSource(cacheGenerator(0, 2), {
            onGet: onGet
        });
        var model = new Model({source: source}).batch();
        var onNext = sinon.spy();
        var disposable = toObservable(model.
            get(['videos', 0, 'title'])).
            doAction(onNext, noOp, function() {
                throw new Error('Should not of completed.  It was disposed.');
            }).
            subscribe(noOp, done);
        var onNext2 = sinon.spy();
        toObservable(model.
            get(['videos', 0, 'title'])).
            doAction(onNext2).
            subscribe(noOp, done);


        disposable.dispose();
        setTimeout(function() {
            try {
                expect(onNext.callCount).to.equal(0);
                expect(onGet.callCount).to.equal(1);
                expect(onNext2.calledOnce).to.be.ok;
                expect(strip(onNext2.getCall(0).args[0])).to.deep.equals({
                    json: {
                        videos: {
                            0: {
                                title: 'Video 0'
                            }
                        }
                    }
                });
            } catch(e) {
                return done(e);
            }
            return done();
        }, 200);
    });
    it('should onError a MaxRetryExceededError when data source is sync.', function(done) {
        var model = new Model({ source: new LocalDataSource({}) });
        toObservable(model.
            get(['videos', 0, 'title'])).
            doAction(noOp, function(e) {
                expect(MaxRetryExceededError.is(e), 'MaxRetryExceededError expected.').to.be.ok;
            }).
            subscribe(noOp, function(e) {
                if (isAssertionError(e)) {
                    return done(e);
                }
                return done();
            }, done.bind(null, new Error('should not complete')));
    });

    it('should onError a MaxRetryExceededError when data source is async.', function(done) {
        var model = new Model({ source: asyncifyDataSource(new LocalDataSource({})) });
        toObservable(model.
            get(['videos', 0, 'title'])).
            doAction(noOp, function(e) {
                expect(MaxRetryExceededError.is(e), 'MaxRetryExceededError expected.').to.be.ok;
            }).
            subscribe(noOp, function(e) {
                if (isAssertionError(e)) {
                    return done(e);
                }
                return done();
            }, done.bind(null, new Error('should not complete')));
    });

    it('should return missing optimized paths with MaxRetryExceededError', function(done) {
        var model = new Model({
            source: asyncifyDataSource(new LocalDataSource({})),
            cache: {
                lolomo: {
                    0: {
                        $type: 'ref',
                        value: ['videos', 1]
                    }
                },
                videos: {
                    0: {
                        title: 'Revolutionary Road'
                    }
                }
            }
        });
        toObservable(model.
            get(['lolomo', 0, 'title'], 'videos[0].title', 'hall[0].ween')).
            doAction(noOp, function(e) {
                expect(MaxRetryExceededError.is(e), 'MaxRetryExceededError expected.').to.be.ok;
                expect(e.missingOptimizedPaths).to.deep.equals([
                    ['videos', 1, 'title'],
                    ['hall', 0, 'ween']
                ]);
            }).
            subscribe(noOp, function(e) {
                if (isAssertionError(e)) {
                    return done(e);
                }
                return done();
            }, done.bind(null, new Error('should not complete')));
    });

    it('should throw MaxRetryExceededError after retrying said times', function(done) {
        var onGet = sinon.spy();
        var model = new Model({
            maxRetries: 5,
            source: asyncifyDataSource(new LocalDataSource({}, {
                onGet: onGet
            }))
        });
        toObservable(model.
            get('some.path')).
            doAction(noOp, function(e) {
                expect(MaxRetryExceededError.is(e), 'MaxRetryExceededError expected').to.be.ok;
                expect(onGet.callCount).to.equal(5);
            }).
            subscribe(noOp, function(e) {
                if (isAssertionError(e)) { return done(e); }
                return done();
            }, done.bind(null, new Error('should not complete')));
    });
});

