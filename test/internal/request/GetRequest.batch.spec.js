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
var zipSpy = require('./../../zipSpy');

describe('#batch', function() {
    var videos1234 = ['videos', 1234, 'summary'];
    var videos553 = ['videos', 553, 'summary'];
    it('should make a request to the dataSource with an immediate scheduler', function(done) {
        var inlineBoolean = true;
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy
        });
        var model = new Model({source: source});
        var request = new GetRequest(scheduler, {
            removeRequest: function() { },
            model: model
        });

        var disposable = request.batch([videos1234], [videos1234], function(err, data) {
            var onNext = sinon.spy();
            model.
                withoutDataSource().
                get(videos1234).
                doAction(onNext, noOp, function() {
                    expect(inlineBoolean).to.be.ok;
                    expect(getSpy.calledOnce).to.be.ok;
                    expect(getSpy.getCall(0).args[1]).to.deep.equals([['videos', 1234, 'summary']]);
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
                }).
                subscribe(noOp, done, done);
        });
        inlineBoolean = false;
    });

    it('should make a request to the dataSource with an async scheduler.', function(done) {
        var inlineBoolean = true;
        var scheduler = new ASAPScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy
        });
        var model = new Model({source: source});
        var request = new GetRequest(scheduler, {
            removeRequest: function() { },
            model: model
        });
        var callback = sinon.spy(function(err, data) {
            var onNext = sinon.spy();
            model.
                withoutDataSource().
                get(videos1234).
                doAction(onNext, noOp, function() {
                    expect(inlineBoolean).to.not.be.ok;
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
                }).
                subscribe(noOp, done, done);
        });

        var disposable = request.batch([videos1234], [videos1234], callback);
        inlineBoolean = false;
    });

    it('should batch some requests together.', function(done) {
        var scheduler = new ASAPScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy
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
                    expect(onNext.getCall(0).args[0]).to.deep.equals({
                        json: {
                            videos: {
                                1234: {
                                    summary: {
                                        title: 'House of Cards',
                                        url: '/movies/1234'
                                    }
                                },
                                553: {
                                    summary: {
                                        title: 'Running Man',
                                        url: '/movies/553'
                                    }
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });
        var disposable1 = request.batch([videos1234], [videos1234], zip);
        var disposable2 = request.batch([videos553], [videos553], zip);
    });

    it('should batch some requests together and dispose the first one.', function(done) {
        var scheduler = new ASAPScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy
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
                    expect(zip.calledOnce).to.be.ok;
                    expect(onNext.getCall(0).args[0]).to.deep.equals({
                        json: {
                            videos: {
                                553: {
                                    summary: {
                                        title: 'Running Man',
                                        url: '/movies/553'
                                    }
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        }, 300);
        var disposable1 = request.batch([videos1234], [videos1234], zip);
        var disposable2 = request.batch([videos553], [videos553], zip);

        disposable1();
    });

    it('should batch some requests together and dispose the second one.', function(done) {
        var scheduler = new ASAPScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy
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
                    expect(zip.calledOnce).to.be.ok;
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
                }).
                subscribe(noOp, done, done);
        }, 300);
        var disposable1 = request.batch([videos1234], [videos1234], zip);
        var disposable2 = request.batch([videos553], [videos553], zip);

        disposable2();
    });
});
