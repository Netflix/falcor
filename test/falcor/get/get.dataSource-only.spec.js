var falcor = require("./../../../lib/");
var Model = falcor.Model;
var Rx = require('rx');
var noOp = function() {};
var LocalDataSource = require('../../data/LocalDataSource');
var ErrorDataSource = require('../../data/ErrorDataSource');
var isPathValue = require("./../../../lib/support/is-path-value");
var expect = require("chai").expect;
var sinon = require('sinon');
var cacheGenerator = require('./../../CacheGenerator');
var clean = require('./../../cleanData').clean;
var atom = require('falcor-json-graph').atom;

describe('DataSource Only', function() {
    var dataSource = new LocalDataSource(cacheGenerator(0, 2, ['title', 'art']));
    describe('Preload Functions', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({source: dataSource});
            var onNext = sinon.spy();
            var secondOnNext = sinon.spy();
            model.
                preload(['videos', 0, 'title']).
                doAction(onNext, noOp, function() {
                    expect(onNext.callCount).to.equal(0);
                }).
                defaultIfEmpty({}).
                flatMap(function() {
                    return model.get(['videos', 0, 'title']);
                }).
                doAction(secondOnNext, noOp, function() {
                    expect(secondOnNext.calledOnce).to.be.ok;
                    expect(secondOnNext.getCall(0).args[0]).to.deep.equals({
                        json: {videos: {0: {title: 'Video 0'}}}
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
            model.
                preload(['videos', 0, 'title'],
                    ['videos', 1, 'art']).
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
                    expect(secondOnNext.getCall(0).args[0]).to.deep.equals({
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
            model.
                get(['videos', 0, 'title']).
                doAction(onNext, noOp, function() {
                    expect(onNext.getCall(0).args[0]).to.deep.equals({
                        json: {videos: {0: {title: 'Video 0'}}}
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('_toJSONG', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({source: dataSource});
            var onNext = sinon.spy();
            model.
                get(['videos', 0, 'title']).
                _toJSONG().
                doAction(onNext, noOp, function() {
                    expect(clean(onNext.getCall(0).args[0])).to.deep.equals({
                        jsonGraph: {
                            videos: {
                                0: {
                                    title: atom('Video 0')
                                }
                            }
                        },
                        paths: clean([['videos', 0, 'title']])
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
    it('should report errors from a dataSource.', function(done) {
        var model = new Model({
            source: new ErrorDataSource(500, 'Oops!')
        });
        model.
            get(['videos', 0, 'title']).
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
    it("should get all missing paths in a single request", function(done) {
        var serviceCalls = 0;
        var cacheModel = new Model({
            cache: {
                lolomo: {
                    summary: {
                        $type: "atom",
                        value: "hello"
                    },
                    0: {
                        summary: {
                            $type: "atom",
                            value: "hello-0"
                        }
                    },
                    1: {
                        summary: {
                            $type: "atom",
                            value: "hello-1"
                        }
                    },
                    2: {
                        summary: {
                            $type: "atom",
                            value: "hello-2"
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
        model.
            get("lolomo.summary", "lolomo[0..2].summary").
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
});

