var sinon = require('sinon');
var expect = require('chai').expect;
var GetRequest = require('./../../../lib/request/GetRequestV2');
var ASAPScheduler = require('./../../../lib/schedulers/ASAPScheduler');
var ImmediateScheduler = require('./../../../lib/schedulers/ImmediateScheduler');
var Rx = require('rx');

describe('#add', function() {
    it('should send a request and dedupe another.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy(function(paths) {
            return Rx.Observable.create(function(observer) {
                setTimeout(function() {
                    observer.onNext({
                        jsonGraph: {}
                    });
                    observer.onCompleted();
                }, 0);
            });
        });
        var removeSpy = sinon.spy(function() {});
        var request = new GetRequest(scheduler, {
            removeRequest: removeSpy,
            dataSource: {
                get: getSpy
            }
        });

        var callback1 = sinon.spy();
        var callback2 = sinon.spy();
        var disposable1 = request.batch([['one', 'two']], callback1);
        expect(request.sent, 'request should be sent').to.be.ok;

        var results = request.add([['one', 'two'], ['three', 'two']], callback2);

        setTimeout(function() {
            try {
                expect(callback1.calledOnce).to.be.ok;
                expect(callback1.getCall(0).args[0]).to.equals(null);
                expect(callback1.getCall(0).args[1]).to.deep.equals({jsonGraph: {}});
                expect(callback2.calledOnce).to.be.ok;
                expect(results[0]).to.be.ok;
                expect(results[1]).to.deep.equals([['three', 'two']]);
                expect(getSpy.calledOnce).to.be.ok;
                expect(getSpy.getCall(0).args[0]).to.deep.equals([['one', 'two']]);
            } catch(e) {
                return done(e);
            }
            return done();
        }, 200);
    });

    it('should send a request and dedupe another and dispose of original.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy(function(paths) {
            return Rx.Observable.create(function(observer) {
                setTimeout(function() {
                    observer.onNext({
                        jsonGraph: {}
                    });
                    observer.onCompleted();
                }, 0);
            });
        });
        var removeSpy = sinon.spy(function() {});
        var request = new GetRequest(scheduler, {
            removeRequest: removeSpy,
            dataSource: {
                get: getSpy
            }
        });

        var callback1 = sinon.spy();
        var callback2 = sinon.spy();
        var disposable = request.batch([['one', 'two']], callback1);
        expect(request.sent, 'request should be sent').to.be.ok;

        var results = request.add([['one', 'two'], ['three', 'two']], callback2);
        disposable();

        setTimeout(function() {
            try {
                expect(callback1.callCount).to.equal(0);
                expect(callback2.calledOnce).to.be.ok;
                expect(callback2.getCall(0).args[0]).to.equals(null);
                expect(callback2.getCall(0).args[1]).to.deep.equals({jsonGraph: {}});
                expect(results[0]).to.be.ok;
                expect(results[1]).to.deep.equals([['three', 'two']]);
                expect(getSpy.calledOnce).to.be.ok;
                expect(getSpy.getCall(0).args[0]).to.deep.equals([['one', 'two']]);
            } catch(e) {
                return done(e);
            }
            return done();
        }, 200);
    });

    it('should send a request and dedupe another and dispose of deduped.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy(function(paths) {
            return Rx.Observable.create(function(observer) {
                setTimeout(function() {
                    observer.onNext({
                        jsonGraph: {}
                    });
                    observer.onCompleted();
                }, 0);
            });
        });
        var removeSpy = sinon.spy(function() {});
        var request = new GetRequest(scheduler, {
            removeRequest: removeSpy,
            dataSource: {
                get: getSpy
            }
        });

        var callback1 = sinon.spy();
        var callback2 = sinon.spy();
        var disposable = request.batch([['one', 'two']], callback1);
        expect(request.sent, 'request should be sent').to.be.ok;

        var results = request.add([['one', 'two'], ['three', 'two']], callback2);
        results[2]();

        setTimeout(function() {
            try {
                expect(callback1.calledOnce).to.be.ok;
                expect(callback1.getCall(0).args[0]).to.equals(null);
                expect(callback1.getCall(0).args[1]).to.deep.equals({jsonGraph: {}});
                expect(callback2.callCount).to.equal(0);
                expect(results[0]).to.be.ok;
                expect(results[1]).to.deep.equals([['three', 'two']]);
                expect(getSpy.calledOnce).to.be.ok;
                expect(getSpy.getCall(0).args[0]).to.deep.equals([['one', 'two']]);
            } catch(e) {
                return done(e);
            }
            return done();
        }, 200);
    });
});
function throwExceptions(spy) {
    spy.exceptions.forEach(function(e) {
        if (e) {
            throw e;
        }
    });
}
