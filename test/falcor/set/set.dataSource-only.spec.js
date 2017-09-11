var falcor = require("./../../../lib/");
var Model = falcor.Model;
var noOp = function() {};
var expect = require('chai').expect;
var sinon = require('sinon');
var LocalDataSource = require('./../../data/LocalDataSource');
var Cache = require('./../../data/Cache');
var strip = require('./../../cleanData').stripDerefAndVersionKeys;
var MaxRetryExceededError = require('./../../../lib/errors/MaxRetryExceededError');
var isAssertionError = require('./../../isAssertionError');

describe('DataSource.', function() {
    it('should validate args are sent to the dataSource collapsed.', function(done) {
        var onSet = sinon.spy(function(source, tmpGraph, jsonGraphFromSet) {
            return jsonGraphFromSet;
        });
        var dataSource = new LocalDataSource(Cache(), {
            onSet: onSet
        });
        var model = new Model({
            source: dataSource
        });

        toObservable(model.
            set({
                json: {
                    videos: {
                        1234: {
                            rating: 5
                        },
                        444: {
                            rating: 3
                        }
                    }
                }
            })).
            doAction(noOp, noOp, function() {
                expect(onSet.calledOnce).to.be.ok;

                var cleaned = onSet.getCall(0).args[2];
                cleaned.paths[0][1] = cleaned.paths[0][1].concat();
                expect(cleaned).to.deep.equals({
                    jsonGraph: {
                        videos: {
                            1234: {
                                rating: 5
                            },
                            444: {
                                rating: 3
                            }
                        }
                    },
                    paths: [
                        ['videos', [444, 1234], 'rating']
                    ]
                });
            }).
            subscribe(noOp, done, done);
    });

    it('should send off an empty string on a set to the server.', function(done) {
        var onSet = sinon.spy(function(source, tmpGraph, jsonGraphFromSet) {
            return jsonGraphFromSet;
        });
        var dataSource = new LocalDataSource(Cache(), {
            onSet: onSet
        });
        var model = new Model({
            source: dataSource
        });
        toObservable(model.
            setValue('videos[1234].another_prop', '')).
            doAction(noOp, noOp, function() {
                expect(onSet.calledOnce).to.be.ok;

                var cleaned = onSet.getCall(0).args[2];
                expect(cleaned).to.deep.equals({
                    jsonGraph: {
                        videos: {
                            1234: {
                                another_prop: ''
                            }
                        }
                    },
                    paths: [
                        ['videos', 1234, 'another_prop']
                    ]
                });
            }).
            subscribe(noOp, done, done);
    });

    it('should send off undefined on a set to the server.', function(done) {
        var onSet = sinon.spy(function(source, tmpGraph, jsonGraphFromSet) {
            return jsonGraphFromSet;
        });
        var dataSource = new LocalDataSource(Cache(), {
            onSet: onSet
        });
        var model = new Model({
            source: dataSource
        });
        toObservable(model.
            set({
                json: {
                    videos: {
                        1234: {
                            another_prop: undefined
                        }
                    }
                }
            })).
            doAction(noOp, noOp, function() {
                expect(onSet.calledOnce).to.be.ok;

                var cleaned = onSet.getCall(0).args[2];
                expect(cleaned).to.deep.equals({
                    jsonGraph: {
                        videos: {
                            1234: {
                                another_prop: {
                                    $type: 'atom'
                                }
                            }
                        }
                    },
                    paths: [
                        ['videos', 1234, 'another_prop']
                    ]
                });
            }).
            subscribe(noOp, done, done);
    });

    it('should report paths progressively.', function(done) {
        var onSet = function(source, tmpGraph, jsonGraphFromSet) {
            jsonGraphFromSet.jsonGraph.videos[444].rating = 5;
            return jsonGraphFromSet;
        };
        var dataSource = new LocalDataSource(Cache(), {
            onSet: onSet
        });
        var model = new Model({
            source: dataSource
        });

        var count = 0;
        toObservable(model.
            set({
                json: {
                    videos: {
                        1234: {
                            rating: 5
                        },
                        444: {
                            rating: 3
                        }
                    }
                }
            }).
            progressively()).
            doAction(function(x) {
                if (count === 0) {
                    expect(strip(x)).to.deep.equals({
                        json: {
                            videos: {
                                1234: {
                                    rating: 5
                                },
                                444: {
                                    rating: 3
                                }
                            }
                        }
                    });
                }

                else {
                    expect(strip(x)).to.deep.equals({
                        json: {
                            videos: {
                                1234: {
                                    rating: 5
                                },
                                444: {
                                    rating: 5
                                }
                            }
                        }
                    });
                }

                count++;
            }, noOp, function() {
                expect(count === 2, 'onNext to be called 2x').to.be.ok;
            }).
            subscribe(noOp, done, done);
    });

    it('should return missing optimized paths with a MaxRetryExceededError.', function(done) {
        var onSet = function(source, tmpGraph, jsonGraphFromSet) {
            model.invalidate('videos[1234].title');
            return {
              jsonGraph: {
                videos: {
                  1234: {}
                }
              },
              paths: []
            };
        };
        var dataSource = new LocalDataSource(Cache(), {
            onSet: onSet
        });
        var model = new Model({
            source: dataSource
        });

        toObservable(model.
            set({
                json: {
                    videos: {
                        1234: {
                            title: 'Nowhere to be found'
                        }
                    }
                }
            })).
            doAction(noOp, function(e) {
              expect(MaxRetryExceededError.is(err), 'MaxRetryExceededError expected').to.be.ok;
              expect(err.missingOptimizedPaths).to.deep.equal([['videos', '1234', 'title']]);
            }).
            subscribe(noOp, function(e) {
              if (isAssertionError(e)) {
                return done(e);
              }
              return done();
            }, done.bind(null, new Error('should not complete')));
    });
});

