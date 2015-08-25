var sinon = require('sinon');
var expect = require('chai').expect;
var GetRequest = require('./../../../lib/request/GetRequestV2');
var ASAPScheduler = require('./../../../lib/schedulers/ASAPScheduler');
var ImmediateScheduler = require('./../../../lib/schedulers/ImmediateScheduler');
var Rx = require('rx');
var Model = require('./../../../lib').Model;
var LocalDataSource = require('./../../data/LocalDataSource');
var Cache = require('./../../data/Cache.js');
var noOp = function() {};

describe('#add', function() {
    var videos1234 = ['videos', 1234, 'summary'];
    var videos553 = ['videos', 553, 'summary'];
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
            model.
                withoutDataSource().
                get(videos1234, videos553).
                doAction(onNext, noOp, function() {
                    expect(getSpy.calledOnce).to.be.ok;
                    expect(getSpy.getCall(0).args[1]).to.deep.equals([videos1234]);
                    expect(onNext.calledOnce).to.be.ok;
                    expect(onNext.getCall(0).args[0]).to.deep.equals({
                        json: {
                            videos: {
                                1234: {
                                    summary: {
                                        title: 'House of Cards',
                                        url: '/movies/1234'
                                    }
                                }
                            }
                        }
                    });

                    expect(results[0]).to.be.ok;
                    expect(results[1]).to.deep.equals([videos553]);
                    expect(results[2]).to.deep.equals([videos553]);
                }).
                subscribe(noOp, done, done);
        });

        var disposable1 = request.batch([videos1234], [videos1234], zip);
        expect(request.sent, 'request should be sent').to.be.ok;

        var results = request.add([videos1234, videos553], [videos1234, videos553], zip);
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
            model.
                withoutDataSource().
                get(videos1234, videos553).
                doAction(onNext, noOp, function() {
                    expect(getSpy.calledOnce).to.be.ok;
                    expect(getSpy.getCall(0).args[1]).to.deep.equals([videos1234]);
                    expect(onNext.calledOnce).to.be.ok;
                    expect(onNext.getCall(0).args[0]).to.deep.equals({
                        json: {
                            videos: {
                                1234: {
                                    summary: {
                                        title: 'House of Cards',
                                        url: '/movies/1234'
                                    }
                                }
                            }
                        }
                    });

                    expect(results[0]).to.be.ok;
                    expect(results[1], 'the requested complement should be 553').to.deep.equals([videos553]);
                    expect(results[2], 'the optimized complement should be 553').to.deep.equals([videos553]);
                }).
                subscribe(noOp, done, done);
        });

        var disposable1 = request.batch([videos1234], [videos1234], zip);
        expect(request.sent, 'request should be sent').to.be.ok;

        var results = request.add([videos553, videos1234], [videos553, videos1234], zip);
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
            model.
                withoutDataSource().
                get(videos1234, videos553).
                doAction(onNext, noOp, function() {
                    expect(getSpy.calledOnce, 'dataSource get').to.be.ok;
                    expect(getSpy.getCall(0).args[1]).to.deep.equals([videos1234]);
                    expect(onNext.calledOnce, 'onNext get').to.be.ok;
                    expect(onNext.getCall(0).args[0]).to.deep.equals({
                        json: {
                            videos: {
                                1234: {
                                    summary: {
                                        title: 'House of Cards',
                                        url: '/movies/1234'
                                    }
                                }
                            }
                        }
                    });

                    expect(results[0]).to.be.ok;
                    expect(results[1]).to.deep.equals([videos553]);
                    expect(results[2]).to.deep.equals([videos553]);
                }).
                subscribe(noOp, done, done);
        });
        var disposable1 = request.batch([videos1234], [videos1234], zip);
        expect(request.sent, 'request should be sent').to.be.ok;

        var results = request.add([videos1234, videos553], [videos1234, videos553], zip);
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
            model.
                withoutDataSource().
                get(videos1234, videos553).
                doAction(onNext, noOp, function() {
                    expect(getSpy.calledOnce, 'dataSource get').to.be.ok;
                    expect(getSpy.getCall(0).args[1]).to.deep.equals([videos1234]);
                    expect(onNext.calledOnce, 'onNext get').to.be.ok;
                    expect(onNext.getCall(0).args[0]).to.deep.equals({
                        json: {
                            videos: {
                                1234: {
                                    summary: {
                                        title: 'House of Cards',
                                        url: '/movies/1234'
                                    }
                                }
                            }
                        }
                    });

                    expect(results[0]).to.be.ok;
                    expect(results[1]).to.deep.equals([videos553]);
                    expect(results[2]).to.deep.equals([videos553]);
                }).
                subscribe(noOp, done, done);
        });
        var disposable1 = request.batch([videos1234], [videos1234], zip);
        expect(request.sent, 'request should be sent').to.be.ok;

        var results = request.add([videos1234, videos553], [videos1234, videos553], zip);
        results[3]();
        zip();
    });
});
function zipSpy(count, cb) {
    return sinon.spy(function() {
        --count;
        if (count === 0) {
            cb();
        }
    });
}
