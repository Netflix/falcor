var RequestQueue = require('./../../../lib/request/RequestQueueV2');
var ASAPScheduler = require('./../../../lib/schedulers/ASAPScheduler');
var ImmediateScheduler = require('./../../../lib/schedulers/ImmediateScheduler');
var Model = require('./../../../lib').Model;
var LocalDataSource = require('./../../data/LocalDataSource');
var noOp = function() {};
var zipSpy = require('./../../zipSpy');

var cacheGenerator = require('./../../CacheGenerator');
var strip = require('./../../cleanData').stripDerefAndVersionKeys;
var toObservable = require('../../toObs');

var Cache = function() { return cacheGenerator(0, 2); };

describe('#get', function() {
    var videos0 = ['videos', 0, 'title'];
    var videos1 = ['videos', 1, 'title'];
    it('should make a simple get request.', function(done) {
        var scheduler = new ImmediateScheduler();
        var source = new LocalDataSource(Cache());
        var model = new Model({source: source});
        var queue = new RequestQueue(model, scheduler);
        var callback = jest.fn();
        queue.get([videos0], [videos0], callback);

        expect(callback).toHaveBeenCalledTimes(1);
        var onNext = jest.fn();
        toObservable(model.
            withoutDataSource().
            get(videos0)).
            doAction(onNext, noOp, function() {
                expect(strip(onNext.mock.calls[0][0])).toEqual({
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
        var source = new LocalDataSource(Cache());
        var model = new Model({source: source});
        var queue = new RequestQueue(model, scheduler);

        var zip = zipSpy(2, function() {
            expect(queue._requests.length).toBe(0);
            expect(zip).toHaveBeenCalledTimes(2);

            var onNext = jest.fn();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(strip(onNext.mock.calls[0][0])).toEqual({
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

        queue.get([videos0], [videos0], zip);
        queue.get([videos1], [videos1], zip);

        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(false);
        expect(queue._requests[0].scheduled).toBe(true);
    });

    it('should make a couple requests where the second argument is deduped.', function(done) {
        var scheduler = new ImmediateScheduler();
        var source = new LocalDataSource(Cache(), {wait: 100});
        var model = new Model({source: source});
        var queue = new RequestQueue(model, scheduler);

        var zip = zipSpy(2, function() {
            expect(queue._requests.length).toBe(0);
            expect(zip).toHaveBeenCalledTimes(2);

            var onNext = jest.fn();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(strip(onNext.mock.calls[0][0])).toEqual({
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

        queue.get([videos0], [videos0], zip);
        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(true);
        expect(queue._requests[0].scheduled).toBe(false);

        queue.get([videos0], [videos0], zip);
        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(true);
        expect(queue._requests[0].scheduled).toBe(false);
    });

    it('should make a couple requests where only part of the second request is deduped then first request is disposed.', function(done) {
        var scheduler = new ImmediateScheduler();
        var source = new LocalDataSource(Cache(), {wait: 100});
        var model = new Model({source: source});
        var queue = new RequestQueue(model, scheduler);

        var zip = zipSpy(2, function() {

            var onNext = jest.fn();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(zip).toHaveBeenCalledTimes(1);
                    expect(strip(onNext.mock.calls[0][0])).toEqual({
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

        var disposable = queue.get([videos0], [videos0], zip);
        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(true);
        expect(queue._requests[0].scheduled).toBe(false);

        queue.get([videos0, videos1], [videos0, videos1], zip);
        expect(queue._requests.length).toBe(2);
        expect(queue._requests[0].sent).toBe(true);
        expect(queue._requests[1].sent).toBe(true);
        expect(queue._requests[0].scheduled).toBe(false);
        expect(queue._requests[1].scheduled).toBe(false);

        disposable();
    });

    it('should make a couple requests where the second request is deduped and the first is disposed.', function(done) {
        var scheduler = new ImmediateScheduler();
        var source = new LocalDataSource(Cache(), {wait: 100});
        var model = new Model({source: source});
        var queue = new RequestQueue(model, scheduler);

        var zip = zipSpy(2, function() {

            var onNext = jest.fn();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(zip).toHaveBeenCalledTimes(1);
                    expect(strip(onNext.mock.calls[0][0])).toEqual({
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

        var disposable = queue.get([videos0], [videos0], zip);
        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(true);
        expect(queue._requests[0].scheduled).toBe(false);

        queue.get([videos0], [videos0], zip);
        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(true);
        expect(queue._requests[0].scheduled).toBe(false);

        disposable();
    });

    it('should make a couple requests where the second argument is deduped and all the requests are disposed.', function(done) {
        var scheduler = new ImmediateScheduler();
        var source = new LocalDataSource(Cache(), {wait: 100});
        var model = new Model({source: source});
        var queue = new RequestQueue(model, scheduler);

        var zip = zipSpy(2, function() {

            var onNext = jest.fn();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(zip).not.toHaveBeenCalled();
                    expect(onNext).toHaveBeenCalledTimes(1);
                }).
                subscribe(noOp, done, done);
        }, 300);

        var disposable = queue.get([videos0], [videos0], zip);
        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(true);
        expect(queue._requests[0].scheduled).toBe(false);

        var disposable2 = queue.get([videos0], [videos0], zip);
        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(true);
        expect(queue._requests[0].scheduled).toBe(false);

        disposable();
        disposable2();
    });

    it('should make a couple requests where only part of the second request is deduped then disposed.', function(done) {
        var scheduler = new ImmediateScheduler();
        var source = new LocalDataSource(Cache(), {wait: 100});
        var model = new Model({source: source});
        var queue = new RequestQueue(model, scheduler);

        var zip = zipSpy(2, function() {

            var onNext = jest.fn();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(zip).toHaveBeenCalledTimes(1);
                    expect(strip(onNext.mock.calls[0][0])).toEqual({
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

        queue.get([videos0], [videos0], zip);
        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(true);
        expect(queue._requests[0].scheduled).toBe(false);

        var disposable2 = queue.get([videos0, videos1], [videos0, videos1], zip);
        expect(queue._requests.length).toBe(2);
        expect(queue._requests[1].sent).toBe(true);
        expect(queue._requests[1].scheduled).toBe(false);

        disposable2();
    });

    it('should make a couple requests where only part of the second request is deduped then both are disposed.', function(done) {
        var scheduler = new ImmediateScheduler();
        var source = new LocalDataSource(Cache(), {wait: 100});
        var model = new Model({source: source});
        var queue = new RequestQueue(model, scheduler);

        var zip = zipSpy(2, function() {
            var onNext = jest.fn();
            toObservable(model.
                withoutDataSource().
                get(videos0, videos1)).
                doAction(onNext, noOp, function() {
                    expect(zip).not.toHaveBeenCalled();
                    expect(onNext).toHaveBeenCalledTimes(1);
                }).
                subscribe(noOp, done, done);
        }, 300);

        var disposable = queue.get([videos0], [videos0], zip);
        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(true);
        expect(queue._requests[0].scheduled).toBe(false);

        var disposable2 = queue.get([videos0, videos1], [videos0, videos1], zip);
        expect(queue._requests.length).toBe(2);
        expect(queue._requests[1].sent).toBe(true);
        expect(queue._requests[1].scheduled).toBe(false);

        disposable();
        disposable2();
    });
});
