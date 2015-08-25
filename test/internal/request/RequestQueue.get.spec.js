var sinon = require('sinon');
var expect = require('chai').expect;
var RequestQueue = require('./../../../lib/request/RequestQueueV2');
var ASAPScheduler = require('./../../../lib/schedulers/ASAPScheduler');
var ImmediateScheduler = require('./../../../lib/schedulers/ImmediateScheduler');
var Rx = require('rx');
var Model = require('./../../../lib').Model;
var LocalDataSource = require('./../../data/LocalDataSource');
var Cache = require('./../../data/Cache.js');
var noOp = function() {};
var zipSpy = require('./../../zipSpy');

describe('#get', function() {
    var videos1234 = ['videos', 1234, 'summary'];
    var videos553 = ['videos', 553, 'summary'];
    it('should make a simple get request.', function(done) {
        var scheduler = new ImmediateScheduler();
        var getSpy = sinon.spy();
        var source = new LocalDataSource(Cache());
        var model = new Model({source: source});
        var queue = new RequestQueue(model, scheduler);
        var callback = sinon.spy();
        var disposable = queue.get([videos1234], [videos1234], callback);

        expect(callback.calledOnce, 'callback should be called once.').to.be.ok;
        var onNext = sinon.spy();
        model.
            withoutDataSource().
            get(videos1234).
            doAction(onNext, noOp, function() {
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
        var disposable = queue.get([videos1234], [videos1234], zip);
        var disposable2 = queue.get([videos553], [videos553], zip);

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
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });
        var disposable = queue.get([videos1234], [videos1234], zip);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([videos1234], [videos1234], zip);
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
            model.
                withoutDataSource().
                get(videos1234, videos553).
                doAction(onNext, noOp, function() {
                    expect(zip.calledOnce, 'zip should be called once.').to.be.ok;
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
        }, 300);

        var disposable = queue.get([videos1234], [videos1234], zip);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([videos1234, videos553], [videos1234, videos553], zip);
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
        var disposable = queue.get([videos1234], [videos1234], zip);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([videos1234], [videos1234], zip);
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
            model.
                withoutDataSource().
                get(videos1234, videos553).
                doAction(onNext, noOp, function() {
                    expect(zip.callCount).to.equal(0);
                    expect(onNext.callCount).to.equal(0);
                }).
                subscribe(noOp, done, done);
        }, 300);
        var disposable = queue.get([videos1234], [videos1234], zip);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([videos1234], [videos1234], zip);
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
        var disposable = queue.get([videos1234], [videos1234], zip);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([videos1234, videos553], [videos1234, videos553], zip);
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
            model.
                withoutDataSource().
                get(videos1234, videos553).
                doAction(onNext, noOp, function() {
                    expect(zip.callCount).to.equal(0);
                    expect(onNext.callCount).to.equal(0);
                }).
                subscribe(noOp, done, done);
        }, 300);

        var disposable = queue.get([videos1234], [videos1234], zip);
        expect(queue._requests.length).to.equal(1);
        expect(queue._requests[0].sent).to.equal(true);
        expect(queue._requests[0].scheduled).to.equal(false);
        var disposable2 = queue.get([videos1234, videos553], [videos1234, videos553], zip);
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
