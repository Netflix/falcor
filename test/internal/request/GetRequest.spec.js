var sinon = require('sinon');
var expect = require('chai').expect;
var GetRequest = require('./../../../lib/request/GetRequestV2');
var ASAPScheduler = require('./../../../lib/schedulers/ASAPScheduler');
var ImmediateScheduler = require('./../../../lib/schedulers/ImmediateScheduler');
var Rx = require('rx');

describe.only('GetRequest', function() {
    it('should make a request to the dataSource with an immediate scheduler', function(done) {
        var inlineBoolean = true;
        var scheduler = new ImmediateScheduler();
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
            dataSource: {
                get: getSpy
            }
        });

        var disposable = request.batch([['one', 'two']], function(err, data) {
            expect(inlineBoolean).to.be.ok;
            expect(data).to.deep.equals({jsonGraph: {}});
            expect(getSpy.calledOnce).to.be.ok;
            expect(getSpy.getCall(0).args[0]).to.deep.equals([['one', 'two']]);
            done();
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
            dataSource: {
                get: getSpy
            }
        });

        var disposable = request.batch([['one', 'two']], function(err, data) {
            expect(inlineBoolean).to.not.be.ok;
            expect(data).to.deep.equals({jsonGraph: {}});
            expect(getSpy.calledOnce).to.be.ok;
            expect(getSpy.getCall(0).args[0]).to.deep.equals([['one', 'two']]);
            done();
        });
        inlineBoolean = false;
    });

    it('should batch some requests together.', function(done) {
        var scheduler = new ASAPScheduler();
        var done1 = false;
        var done2 = false;
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
            dataSource: {
                get: getSpy
            }
        });

        var disposable1 = request.batch([['one', 'two']], function(err, data) {
            done1 = true;
            expect(data).to.deep.equals({jsonGraph: {}});
            expect(getSpy.calledOnce).to.be.ok;
            expect(getSpy.getCall(0).args[0]).to.deep.equals([[['one', 'three'], 'two']]);
            if (done2) {
                done();
            }
        });
        var disposable2 = request.batch([['three', 'two']], function(err, data) {
            done2 = true;
            expect(data).to.deep.equals({jsonGraph: {}});
            if (done1) {
                done();
            }
        });
    });

    it('should batch some requests together and dispose one of them.', function(done) {
        var scheduler = new ASAPScheduler();
        var done2 = false;
        var err = false;
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
            dataSource: {
                get: getSpy
            }
        });

        var disposable1 = request.batch([['one', 'two']], function(err, data) {
            try {
                throw new Error('This should of never been called.');
            } catch (e) {
                err = e;
            }
        });
        var disposable2 = request.batch([['three', 'two']], function(err, data) {
            try {
                done2 = true;
                expect(data).to.deep.equals({jsonGraph: {}});
                expect(getSpy.calledOnce).to.be.ok;
                expect(getSpy.getCall(0).args[0]).to.deep.equals([['three', 'two']]);
            } catch (e) {
                err = e;
            }
        });

        disposable1();

        setTimeout(function() {
            if (err) {
                return done(err);
            }
            try {
                expect(done2).to.be.ok;
            } catch (e) {
                return done(e);
            }
            return done();
        }, 200);
    });
});
