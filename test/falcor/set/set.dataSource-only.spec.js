var falcor = require("./../../../lib/");
var Model = falcor.Model;
var noOp = function() {};
var expect = require('chai').expect;
var sinon = require('sinon');
var LocalDataSource = require('./../../data/LocalDataSource');
var Cache = require('./../../data/Cache');

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

        model.
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
        model.
            setValue('videos[1234].another_prop', '').
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
        model.
            set({
                json: {
                    videos: {
                        1234: {
                            another_prop: undefined
                        }
                    }
                }
            }).
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
});
