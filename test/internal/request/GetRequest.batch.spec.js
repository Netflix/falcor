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

describe('#batch', function() {
    it.only('should make a request to the dataSource with an immediate scheduler', function(done) {
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

        var disposable = request.batch([['videos', 1234, 'summary']], [['videos', 1234, 'summary']], function(err, data) {
            var onNext = sinon.spy();
            model.
                withoutDataSource().
                get(['videos', 1234, 'summary']).
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

    it('should make a request to the dataSource with an ASAPScheduler', function(done) {
        var inlineBoolean = true;
        var scheduler = new ASAPScheduler();
        var getSpy = sinon.spy(function(paths) {
            return Rx.Observable.create(function(observer) {
                observer.onNext({
                    jsonGraph: {}
                });
                observer.onCompleted();
            });
        });
        var request = new GetRequest(scheduler, {
            removeRequest: function() { },
            model: {
                dataSource: {
                    get: getSpy
                }
            }
        });
        var callback = sinon.spy(function(err, data) {
            expect(inlineBoolean).to.not.be.ok;
            expect(data).to.deep.equals({jsonGraph: {}});
            expect(getSpy.calledOnce).to.be.ok;
            expect(getSpy.getCall(0).args[0]).to.deep.equals([['one', 'two']]);
        });

        var disposable = request.batch([['one', 'two']], callback);
        setTimeout(function() {
            try {
                throwExceptions(callback);
                expect(callback.calledOnce);
            } catch(e) {
                return done(e);
            }
            return done();
        }, 100);
        inlineBoolean = false;
    });

    it('should batch some requests together.', function(done) {
        var scheduler = new ASAPScheduler();
        var getSpy = sinon.spy(function(paths) {
            return Rx.Observable.create(function(observer) {
                observer.onNext({
                    jsonGraph: {}
                });
                observer.onCompleted();
            });
        });
        var request = new GetRequest(scheduler, {
            removeRequest: function() { },
            model: {
                dataSource: {
                    get: getSpy
                }
            }
        });

        var callback1 = sinon.spy(function(err, data) {
            expect(data).to.deep.equals({jsonGraph: {}});
            expect(getSpy.calledOnce).to.be.ok;
            expect(getSpy.getCall(0).args[0]).to.deep.equals([[['one', 'three'], 'two']]);
        });
        var callback2 = sinon.spy(function(err, data) {
            expect(data).to.deep.equals({jsonGraph: {}});
        });

        var disposable1 = request.batch([['one', 'two']], callback1);
        var disposable2 = request.batch([['three', 'two']], callback2);

        setTimeout(function() {
            try {
                throwExceptions(callback1);
                throwExceptions(callback2);
                expect(callback1.calledOnce);
                expect(callback2.calledOnce);
            } catch(e) {
                return done(e);
            }
            return done();
        }, 100);
    });

    it('should batch some requests together and dispose one of them.', function(done) {
        var scheduler = new ASAPScheduler();
        var getSpy = sinon.spy(function(paths) {
            return Rx.Observable.create(function(observer) {
                observer.onNext({
                    jsonGraph: {}
                });
                observer.onCompleted();
            });
        });
        var removeSpy = sinon.spy(function() {});
        var request = new GetRequest(scheduler, {
            removeRequest: removeSpy,
            model: {
                dataSource: {
                    get: getSpy
                }
            }
        });

        var callback1 = sinon.spy(function(err, data) {
            throw new Error('This should of never been called.');
        });
        var callback2 = sinon.spy(function(err, data) {
            expect(data).to.deep.equals({jsonGraph: {}});
            expect(getSpy.calledOnce).to.be.ok;
            expect(getSpy.getCall(0).args[0]).to.deep.equals([['three', 'two']]);
        });

        var disposable1 = request.batch([['one', 'two']], callback1);
        var disposable2 = request.batch([['three', 'two']], callback2);

        disposable1();

        setTimeout(function() {
            try {
                throwExceptions(callback1);
                throwExceptions(callback2);
                expect(callback1.callCount).to.equals(0);
                expect(callback2.calledOnce).to.be.ok;
            } catch(e) {
                return done(e);
            }
            return done();
        }, 100);
    });
});

function throwExceptions(spy) {
    spy.exceptions.forEach(function(e) {
        if (e) {
            throw e;
        }
    });
}
