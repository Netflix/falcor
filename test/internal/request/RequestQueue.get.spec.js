var sinon = require('sinon');
var expect = require('chai').expect;
var RequestQueue = require('./../../../lib/request/RequestQueueV2');
var ASAPScheduler = require('./../../../lib/schedulers/ASAPScheduler');
var ImmediateScheduler = require('./../../../lib/schedulers/ImmediateScheduler');
var Rx = require('rx');
var Model = require('./../../../lib').Model;
var LocalDataSource = require('./../../data/LocalDataSource');
var noOp = function() {};
var zipSpy = require('./../../zipSpy');

var cacheGenerator = require('./../../CacheGenerator');
var strip = require('./../../cleanData').stripDerefAndVersionKeys;
var noOp = function() {};
var Cache = function() { return cacheGenerator(0, 2); };

describe('#get', function() {
    var videos0 = ['videos', 0, 'title'];
    var videos1 = ['videos', 1, 'title'];
    it('should make a simple get request.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache());
        var model = new Model({source: source});
        var queue = new RequestQueue(model, scheduler);
        var callback = sinon.spy();
        var disposable = queue.get([videos0], [videos0], [0, 0], callback);

        expect(callback.calledOnce, 'callback should be called once.').to.be.ok;
        var onNext = sinon.spy();
        toObservable(model.
            withoutDataSource().
            get(videos0)).
            doAction(onNext, noOp, function() {
                expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
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

    it('should make a couple requests and have them batched together.', function(done) {
        var scheduler = new ASAPScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache());
        var model = new Model({source: source});
        var queue = new RequestQueue(model, scheduler);

        var zip = zipSpy(2, function() {
            expect(queue._requests.length).to.equal(0);
            expect(zip.callCount).to.equal(2);

            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'Video 0'
                                },
                                1: {
                                    title: 'Video 1'
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });
        var disposable = queue.get([videos0], [videos0], [0, 0], zip);
        var disposable2 = queue.get([videos1], [videos1], [0, 0], zip);

        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(false);
        expect(queue._requests[0].scheduled).to.equal(true);
    });

    it('should make a couple requests where the second argument is deduped.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {wait: 100});
        var model = new Model({source: source});
        var queue = new RequestQueue(model, scheduler);

        var zip = zipSpy(2, function() {
            expect(queue._requests.length).to.equal(0);
            expect(zip.callCount).to.equal(2);

            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
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
        var disposable = queue.get([videos0], [videos0], [0, 0], zip);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([videos0], [videos0], [0, 0], zip);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
    });

    it('should make a couple requests where only part of the second request is deduped then first request is disposed.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {wait: 100});
        var model = new Model({source: source});
        var queue = new RequestQueue(model, scheduler);

        var zip = zipSpy(2, function() {

            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(zip.calledOnce, 'zip should be called once.').to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                        json: {
                            videos: {
                                0: {
                                    title: 'Video 0'
                                },
                                1: {
                                    title: 'Video 1'
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        }, 300);

        var disposable = queue.get([videos0], [videos0], [0, 0], zip);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([videos0, videos1], [videos0, videos1], [0, 0], zip);
        expect(queue._requests.length).to.equal(2);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[1].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        expect(queue._requests[1].scheduled).to.equal(false);

        disposable();
    });

    it('should make a couple requests where the second request is deduped and the first is disposed.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {wait: 100});
        var model = new Model({source: source});
        var queue = new RequestQueue(model, scheduler);

        var zip = zipSpy(2, function() {

            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(zip.calledOnce).to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
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
        }, 300);
        var disposable = queue.get([videos0], [videos0], [0, 0], zip);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([videos0], [videos0], [0, 0], zip);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);

        disposable();
    });

    it('should make a couple requests where the second argument is deduped and all the requests are disposed.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {wait: 100});
        var model = new Model({source: source});
        var queue = new RequestQueue(model, scheduler);

        var zip = zipSpy(2, function() {

            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(zip.callCount).to.equal(0);
                    expect(onNext.callCount).to.equal(1);
                }).
                subscribe(noOp, done, done);
        }, 300);
        var disposable = queue.get([videos0], [videos0], [0, 0], zip);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([videos0], [videos0], [0, 0], zip);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);

        disposable();
        disposable2();
    });

    it('should make a couple requests where only part of the second request is deduped then disposed.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {wait: 100});
        var model = new Model({source: source});
        var queue = new RequestQueue(model, scheduler);

        var zip = zipSpy(2, function() {

            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(zip.calledOnce).to.be.ok;
                    expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
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
        }, 300);
        var disposable = queue.get([videos0], [videos0], [0, 0], zip);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([videos0, videos1], [videos0, videos1], [0, 0], zip);
        expect(queue._requests.length).to.equal(2);
        expect(queue._requests[1].sent).to.equal(true);
        expect(queue._requests[1].scheduled).to.equal(false);

        disposable2();
    });

    it('should make a couple requests where only part of the second request is deduped then both are disposed.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache(), {wait: 100});
        var model = new Model({source: source});
        var queue = new RequestQueue(model, scheduler);

        var zip = zipSpy(2, function() {
            var onNext = sinon.spy();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(zip.callCount).to.equal(0);
                    expect(onNext.callCount).to.equal(1);
                }).
                subscribe(noOp, done, done);
        }, 300);

        var disposable = queue.get([videos0], [videos0], [0, 0], zip);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([videos0, videos1], [videos0, videos1], [0, 0], zip);
        expect(queue._requests.length).to.equal(2);
        expect(queue._requests[1].sent).to.equal(true);
        expect(queue._requests[1].scheduled).to.equal(false);

        disposable();
        disposable2();
    });
});

function throwExceptions(spy) {
    spy.exceptions.forEach(function(e) {
        if (e) {
            throw e;
        }
    });
}
