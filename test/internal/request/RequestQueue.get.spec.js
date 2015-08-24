var sinon = require('sinon');
var expect = require('chai').expect;
var RequestQueue = require('./../../../lib/request/RequestQueueV2');
var ASAPScheduler = require('./../../../lib/schedulers/ASAPScheduler');
var ImmediateScheduler = require('./../../../lib/schedulers/ImmediateScheduler');
var Rx = require('rx');

describe('#get', function() {
    it('should make a simple get request.', function() {
        var onGet = sinon.spy(function() {
            return Rx.Observable.create(function(observer) {
                observer.onNext({
                    jsonGraph: {}
                });
                observer.onCompleted();
            });
        });
        var dataSource = {get: onGet};
        var queue = new RequestQueue({
            dataSource: dataSource
        }, new ImmediateScheduler());
        var callback = sinon.spy();
        var disposable = queue.get([], [['one', 'two']], callback);

        expect(callback.calledOnce, 'callback should be called once.').to.be.ok;
    });

    it('should make a couple requests and have them batched together.', function(done) {
        var onGet = sinon.spy(function() {
            return Rx.Observable.create(function(observer) {
                observer.onNext({
                    jsonGraph: {}
                });
                observer.onCompleted();
            });
        });
        var dataSource = {get: onGet};
        var queue = new RequestQueue({
            dataSource: dataSource
        }, new ASAPScheduler());
        var callback = sinon.spy();
        var callback2 = sinon.spy();
        var disposable = queue.get([], [['one', 'two']], callback);
        var disposable2 = queue.get([], [['one', 'three']], callback2);

        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(false);
        expect(queue._requests[0].scheduled).to.equal(true);
        setTimeout(function() {
            try {
                expect(queue._requests.length).to.equal(0);
                expect(callback.calledOnce, 'callback1 should be called').to.be.ok;
                expect(callback2.calledOnce, 'callback2 should be called').to.be.ok;
            } catch (e) {
                return done(e);
            }
            return done();
        }, 100);
    });

    it('should make a couple requests where the second argument is deduped.', function(done) {
        var onGet = sinon.spy(function() {
            return Rx.Observable.create(function(observer) {
                setTimeout(function() {
                    observer.onNext({
                        jsonGraph: {}
                    });
                    observer.onCompleted();
                }, 100);
            });
        });
        var dataSource = {get: onGet};
        var queue = new RequestQueue({
            dataSource: dataSource
        }, new ImmediateScheduler());
        var callback = sinon.spy();
        var callback2 = sinon.spy();
        var disposable = queue.get([], [['one', 'two']], callback);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([], [['one', 'two']], callback2);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);


        setTimeout(function() {
            try {
                expect(queue._requests.length).to.equal(0);
                expect(callback.calledOnce, 'callback1 should be called').to.be.ok;
                expect(callback2.calledOnce, 'callback2 should be called').to.be.ok;
            } catch (e) {
                return done(e);
            }
            return done();
        }, 150);
    });

    it('should make a couple requests where the second argument is deduped and the first is disposed.', function(done) {
        var onGet = sinon.spy(function() {
            return Rx.Observable.create(function(observer) {
                setTimeout(function() {
                    observer.onNext({
                        jsonGraph: {}
                    });
                    observer.onCompleted();
                }, 50);
            });
        });
        var dataSource = {get: onGet};
        var queue = new RequestQueue({
            dataSource: dataSource
        }, new ImmediateScheduler());
        var callback = sinon.spy();
        var callback2 = sinon.spy();
        var disposable = queue.get([], [['one', 'two']], callback);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([], [['one', 'two']], callback2);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);

        disposable();
        setTimeout(function() {
            try {
                expect(queue._requests.length).to.equal(0);
                expect(callback.callCount, 'callback1 should be called 0 times.').to.equal(0);
                expect(callback2.calledOnce, 'callback2 should be called').to.be.ok;
            } catch (e) {
                return done(e);
            }
            return done();
        }, 150);
    });

    it('should make a couple requests where the second argument is deduped and all the requests are disposed.', function(done) {
        var onGet = sinon.spy(function() {
            return Rx.Observable.create(function(observer) {
                setTimeout(function() {
                    observer.onNext({
                        jsonGraph: {}
                    });
                    observer.onCompleted();
                }, 50);
            });
        });
        var dataSource = {get: onGet};
        var queue = new RequestQueue({
            dataSource: dataSource
        }, new ImmediateScheduler());
        var callback = sinon.spy();
        var callback2 = sinon.spy();
        var disposable = queue.get([], [['one', 'two']], callback);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([], [['one', 'two']], callback2);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);

        disposable();
        disposable2();
        setTimeout(function() {
            try {
                expect(queue._requests.length).to.equal(0);
                expect(callback.callCount, 'callback1 should be called 0 times.').to.equal(0);
                expect(callback2.callCount, 'callback2 should be called 0 times.').to.equal(0);
            } catch (e) {
                return done(e);
            }
            return done();
        }, 150);
    });

    it('should make a couple requests where only part of the second request is deduped.', function(done) {
        var onGet = sinon.spy(function() {
            return Rx.Observable.create(function(observer) {
                setTimeout(function() {
                    observer.onNext({
                        jsonGraph: {}
                    });
                    observer.onCompleted();
                }, 50);
            });
        });
        var dataSource = {get: onGet};
        var queue = new RequestQueue({
            dataSource: dataSource
        }, new ImmediateScheduler());
        var callback = sinon.spy();
        var callback2 = sinon.spy();
        var disposable = queue.get([], [['one', 'two']], callback);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([], [['one', 'two'], ['three', 'two']], callback2);
        expect(queue._requests.length).to.equal(2);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[1].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        expect(queue._requests[1].scheduled).to.equal(false);

        setTimeout(function() {
            try {
                expect(queue._requests.length).to.equal(0);
                expect(callback.calledOnce, 'callback1 should be called 0 times.').to.be.ok;
                expect(callback2.calledOnce, 'callback2 should be called').to.be.ok;
            } catch (e) {
                return done(e);
            }
            return done();
        }, 150);
    });

    it('should make a couple requests where only part of the second request is deduped then disposed.', function(done) {
        var onGet = sinon.spy(function() {
            return Rx.Observable.create(function(observer) {
                setTimeout(function() {
                    observer.onNext({
                        jsonGraph: {}
                    });
                    observer.onCompleted();
                }, 50);
            });
        });
        var dataSource = {get: onGet};
        var queue = new RequestQueue({
            dataSource: dataSource
        }, new ImmediateScheduler());
        var callback = sinon.spy();
        var callback2 = sinon.spy();
        var disposable = queue.get([], [['one', 'two']], callback);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([], [['one', 'two'], ['three', 'two']], callback2);
        expect(queue._requests.length).to.equal(2);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[1].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        expect(queue._requests[1].scheduled).to.equal(false);

        disposable2();
        setTimeout(function() {
            try {
                expect(queue._requests.length).to.equal(0);
                expect(callback.calledOnce, 'callback1 should be called 1 times.').to.be.ok;
                expect(callback2.callCount, 'callback2 should not be called').to.equal(0);
            } catch (e) {
                return done(e);
            }
            return done();
        }, 150);
    });

    it('should make a couple requests where only part of the second request is deduped then first request is disposed.', function(done) {
        var onGet = sinon.spy(function() {
            return Rx.Observable.create(function(observer) {
                setTimeout(function() {
                    observer.onNext({
                        jsonGraph: {}
                    });
                    observer.onCompleted();
                }, 50);
            });
        });
        var dataSource = {get: onGet};
        var queue = new RequestQueue({
            dataSource: dataSource
        }, new ImmediateScheduler());
        var callback = sinon.spy();
        var callback2 = sinon.spy();
        var disposable = queue.get([], [['one', 'two']], callback);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([], [['one', 'two'], ['three', 'two']], callback2);
        expect(queue._requests.length).to.equal(2);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[1].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        expect(queue._requests[1].scheduled).to.equal(false);

        disposable();
        setTimeout(function() {
            try {
                expect(queue._requests.length).to.equal(0);
                expect(callback.callCount, 'callback1 should not be called').to.equal(0);
                expect(callback2.calledOnce, 'callback2 should be called 1 times.').to.be.ok;
            } catch (e) {
                return done(e);
            }
            return done();
        }, 150);
    });

    it('should make a couple requests where only part of the second request is deduped then both are disposed.', function(done) {
        var onGet = sinon.spy(function() {
            return Rx.Observable.create(function(observer) {
                setTimeout(function() {
                    observer.onNext({
                        jsonGraph: {}
                    });
                    observer.onCompleted();
                }, 50);
            });
        });
        var dataSource = {get: onGet};
        var queue = new RequestQueue({
            dataSource: dataSource
        }, new ImmediateScheduler());
        var callback = sinon.spy();
        var callback2 = sinon.spy();
        var disposable = queue.get([], [['one', 'two']], callback);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([], [['one', 'two'], ['three', 'two']], callback2);
        expect(queue._requests.length).to.equal(2);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[1].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        expect(queue._requests[1].scheduled).to.equal(false);

        disposable();
        disposable2();
        setTimeout(function() {
            try {
                expect(queue._requests.length).to.equal(0);
                expect(callback.callCount, 'callback1 should not be called').to.equal(0);
                expect(callback2.callCount, 'callback2 should not be called').to.equal(0);
            } catch (e) {
                return done(e);
            }
            return done();
        }, 150);
    });
});

function throwExceptions(spy) {
    spy.exceptions.forEach(function(e) {
        if (e) {
            throw e;
        }
    });
}
