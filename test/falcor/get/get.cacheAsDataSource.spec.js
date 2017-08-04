var falcor = require("./../../../lib/");
var Model = falcor.Model;
var noOp = function() {};
var LocalDataSource = require('../../data/LocalDataSource');
var ErrorDataSource = require('../../data/ErrorDataSource');
var isPathValue = require("./../../../lib/support/isPathValue");
var expect = require("chai").expect;
var sinon = require('sinon');
var clean = require('./../../cleanData').stripDerefAndVersionKeys;
var cacheGenerator = require('./../../CacheGenerator');
var atom = Model.atom;

describe('Cache as DataSource', function() {
    it('should return the correct empty envelope.', function(done) {
        var model = new Model({
            cache: {foo: 1}
        }).asDataSource();
        var onNext = sinon.spy();
        toObservable(model.
            get([]).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(clean(onNext.getCall(0).args[0])).to.deep.equals({
                    jsonGraph: {},
                    paths: []
                });
            }).
            subscribe(noOp, done, done));
    });
    describe('toJSON', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({
                source: new Model({
                    source: new LocalDataSource(cacheGenerator(0, 1))
                }).asDataSource()
            });
            var onNext = sinon.spy();
            toObservable(model.
                get(['videos', 0, 'title'])).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(clean(onNext.getCall(0).args[0])).to.deep.equals({
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
    });
    describe('_toJSONG', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({
                source: new Model({
                    source: new LocalDataSource(cacheGenerator(0, 1))
                }).asDataSource()
            });
            var onNext = sinon.spy();
            toObservable(model.
                get(['videos', 0, 'title']).
                _toJSONG()).
                doAction(onNext, noOp, function() {
                    expect(onNext.calledOnce).to.be.ok;
                    expect(clean(onNext.getCall(0).args[0])).to.deep.equals({
                        jsonGraph: {
                            videos: {
                                0: {
                                    title: atom('Video 0')
                                }
                            }
                        },
                        paths: [
                            ['videos', 0, 'title']
                        ]
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
    it('should report errors from a dataSource with _treatDataSourceErrorsAsJSONGraphErrors.', function(done) {
        var model = new Model({
            _treatDataSourceErrorsAsJSONGraphErrors: true,
            source: new Model({
                source: new ErrorDataSource(500, 'Oops!')
            }).asDataSource()
        });
        toObservable(model.
            get(['videos', 1234, 'summary'])).
            doAction(noOp, function(err) {
                expect(err).to.deep.equals([{
                    path: ['videos', 1234, 'summary'],
                    value: {
                        message: 'Oops!',
                        status: 500
                    }
                }]);
            }).
            subscribe(noOp, function(err) {
                // ensure its the same error
                if (Array.isArray(err) && isPathValue(err[0])) {
                    done();
                } else {
                    done(err);
                }
            }, function() {
                done('On Completed was called. ' +
                     'OnError should have been called.');
            });
    });
    it('should report errors from a dataSource.', function(done) {
        var outputError;
        var model = new Model({
            source: new Model({
                source: new ErrorDataSource(500, 'Oops!')
            }).asDataSource()
        });
        toObservable(model.
            get(['videos', 1234, 'summary'])).
            doAction(noOp, function(err) {
                outputError = err;
                expect(err).to.deep.equals({
                    $type: "error",
                    value: {
                        message: 'Oops!',
                        status: 500
                    }
                });
            }).
            subscribe(noOp, function(err) {
                // ensure its the same error
                if (outputError === err) {
                    done();
                } else {
                    done(err);
                }
            }, function() {
                done('On Completed was called. ' +
                     'OnError should have been called.');
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
        toObservable(model.
            get("lolomo.summary", "lolomo[0..2].summary")).
            doAction(onNext).
            doAction(noOp, noOp, function() {
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
