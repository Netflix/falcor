var sinon = require('sinon');
var expect = require('chai').expect;
var GetRequest = require('./../../../lib/request/GetRequestV2');
var ASAPScheduler = require('./../../../lib/schedulers/ASAPScheduler');
var ImmediateScheduler = require('./../../../lib/schedulers/ImmediateScheduler');
var Rx = require('rx');
var Model = require('./../../../lib').Model;
var LocalDataSource = require('./../../data/LocalDataSource');
var cacheGenerator = require('./../../CacheGenerator');
var strip = require('./../../cleanData').stripDerefAndVersionKeys;
var noOp = function() {};

var Cache = function() { return cacheGenerator(0, 2); };
describe('#add', function() {
    var videos0 = ['videos', 0, 'title'];
    var videos1 = ['videos', 1, 'title'];

    it('should send a request and dedupe another.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy,
            wait: 100
        });
        var model = new Model({source: source});
        var request = new GetRequest(scheduler, {
            removeRequest: function() { },
            model: model
        });

        var zip = zipSpy(2, function() {
            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(getSpy.calledOnce).to.be.ok;
                    expect(getSpy.getCall(0).args[1]).to.deep.equals([videos0]);
                    expect(onNext.calledOnce).to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'Video 0',
                                }
                            }
                        }
                    });

                    expect(results[0]).to.be.ok;
                    expect(results[1]).to.deep.equals([videos1]);
                    expect(results[2]).to.deep.equals([videos1]);
                }).
                subscribe(noOp, done, done);
        });

        var disposable1 = request.batch([videos0], [videos0], zip);
        expect(request.sent, 'request should be sent').to.be.ok;

        var results = request.add([videos0, videos1], [videos0, videos1], [0, 0], zip);
    });

    it('should send a request and dedupe another when dedupe is in second position.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy,
            wait: 100
        });
        var model = new Model({source: source});
        var request = new GetRequest(scheduler, {
            removeRequest: function() { },
            model: model
        });

        var zip = zipSpy(2, function() {
            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(getSpy.calledOnce).to.be.ok;
                    expect(getSpy.getCall(0).args[1]).to.deep.equals([videos0]);
                    expect(onNext.calledOnce).to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'Video 0',
                                }
                            }
                        }
                    });

                    expect(results[0]).to.be.ok;
                    expect(results[1], 'the requested complement should be 553').to.deep.equals([videos1]);
                    expect(results[2], 'the optimized complement should be 553').to.deep.equals([videos1]);
                }).
                subscribe(noOp, done, done);
        });

        var disposable1 = request.batch([videos0], [videos0], zip);
        expect(request.sent, 'request should be sent').to.be.ok;

        var results = request.add([videos1, videos0], [videos1, videos0], [0, 0], zip);
    });


    it('should send a request and dedupe another and dispose of original.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy,
            wait: 100
        });
        var model = new Model({source: source});
        var request = new GetRequest(scheduler, {
            removeRequest: function() { },
            model: model
        });

        var zip = zipSpy(2, function() {
            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(getSpy.calledOnce, 'dataSource get').to.be.ok;
                    expect(getSpy.getCall(0).args[1]).to.deep.equals([videos0]);
                    expect(onNext.calledOnce, 'onNext get').to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'Video 0',
                                }
                            }
                        }
                    });

                    expect(results[0]).to.be.ok;
                    expect(results[1]).to.deep.equals([videos1]);
                    expect(results[2]).to.deep.equals([videos1]);
                }).
                subscribe(noOp, done, done);
        });
        var disposable1 = request.batch([videos0], [videos0], zip);
        expect(request.sent, 'request should be sent').to.be.ok;

        var results = request.add([videos0, videos1], [videos0, videos1], [0, 0], zip);
        zip();
    });

    it('should send a request and dedupe another and dispose of deduped.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy,
            wait: 100
        });
        var model = new Model({source: source});
        var request = new GetRequest(scheduler, {
            removeRequest: function() { },
            model: model
        });


        var zip = zipSpy(2, function() {
            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(getSpy.calledOnce, 'dataSource get').to.be.ok;
                    expect(getSpy.getCall(0).args[1]).to.deep.equals([videos0]);
                    expect(onNext.calledOnce, 'onNext get').to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'Video 0',
                                }
                            }
                        }
                    });

                    expect(results[0]).to.be.ok;
                    expect(results[1]).to.deep.equals([videos1]);
                    expect(results[2]).to.deep.equals([videos1]);
                }).
                subscribe(noOp, done, done);
        });
        var disposable1 = request.batch([videos0], [videos0], zip);
        expect(request.sent, 'request should be sent').to.be.ok;

        var results = request.add([videos0, videos1], [videos0, videos1], [0, 0], zip);
        results[3]();
        zip();
    });


    // Tests for partial deduping (https://github.com/Netflix/falcor/issues/779)
    // are in test/integration/get.spec.js
});
function zipSpy(count, cb) {
    return sinon.spy(function() {
        --count;
        if (count === 0) {
            cb();
        }
    });
}
