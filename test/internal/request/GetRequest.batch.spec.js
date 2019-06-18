var GetRequest = require('./../../../lib/request/GetRequestV2');
var ASAPScheduler = require('./../../../lib/schedulers/ASAPScheduler');
var ImmediateScheduler = require('./../../../lib/schedulers/ImmediateScheduler');
var Rx = require('rx');
var Model = require('./../../../lib').Model;
var LocalDataSource = require('./../../data/LocalDataSource');
var zipSpy = require('./../../zipSpy');
var toObservable = require('../../toObs');

var cacheGenerator = require('./../../CacheGenerator');
var strip = require('./../../cleanData').stripDerefAndVersionKeys;
var noOp = function() {};
var Cache = function() { return cacheGenerator(0, 2); };

describe('#batch', function() {
    var videos0 = ['videos', 0, 'title'];
    var videos1 = ['videos', 1, 'title'];

    it('should make a request to the dataSource with an immediate scheduler', function(done) {
        var inlineBoolean = true;
        var scheduler = new ImmediateScheduler();
        var getSpy = jest.fn();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy
        });
        var model = new Model({source: source});
        var request = new GetRequest(scheduler, {
            removeRequest: function() { },
            model: model
        });

        var disposable = request.batch([videos0], [videos0], function(err, data) {
            var onNext = jest.fn();
            toObservable(model.
                withoutDataSource().
                get(videos0)).
                doAction(onNext, noOp, function() {
                    expect(inlineBoolean).toBe(true);
                    expect(getSpy).toHaveBeenCalledTimes(1);
                    expect(getSpy.mock.calls[0][1]).toEqual([videos0]);
                    expect(onNext).toHaveBeenCalledTimes(1);
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
        inlineBoolean = false;
    });

    it('should make a request to the dataSource with an async scheduler.', function(done) {
        var inlineBoolean = true;
        var scheduler = new ASAPScheduler();
        var getSpy = jest.fn();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy
        });
        var model = new Model({source: source});
        var request = new GetRequest(scheduler, {
            removeRequest: function() { },
            model: model
        });
        var callback = jest.fn(function(err, data) {
            var onNext = jest.fn();
            toObservable(model.
                withoutDataSource().
                get(videos0)).
                doAction(onNext, noOp, function() {
                    expect(inlineBoolean).toBe(false);
                    expect(getSpy).toHaveBeenCalledTimes(1);
                    expect(getSpy.mock.calls[0][1]).toEqual([videos0]);
                    expect(onNext).toHaveBeenCalledTimes(1);
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

        var disposable = request.batch([videos0], [videos0], callback);
        inlineBoolean = false;
    });

    it('should batch some requests together.', function(done) {
        var scheduler = new ASAPScheduler();
        var getSpy = jest.fn();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy
        });
        var model = new Model({source: source});
        var request = new GetRequest(scheduler, {
            removeRequest: function() { },
            model: model
        });

        var zip = zipSpy(2, function() {
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
        var disposable1 = request.batch([videos0], [videos0], zip);
        var disposable2 = request.batch([videos1], [videos1], zip);
    });

    it('should batch some requests together and dispose the first one.', function(done) {
        var scheduler = new ASAPScheduler();
        var getSpy = jest.fn();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy
        });
        var model = new Model({source: source});
        var request = new GetRequest(scheduler, {
            removeRequest: function() { },
            model: model
        });

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
                                1: {
                                    title: 'Video 1'
                                }
                            }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        }, 300);
        var disposable1 = request.batch([videos0], [videos0], zip);
        var disposable2 = request.batch([videos1], [videos1], zip);

        disposable1();
    });

    it('should batch some requests together and dispose the second one.', function(done) {
        var scheduler = new ASAPScheduler();
        var getSpy = jest.fn();
        var source = new LocalDataSource(Cache(), {
            onGet: getSpy
        });
        var model = new Model({source: source});
        var request = new GetRequest(scheduler, {
            removeRequest: function() { },
            model: model
        });

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
        var disposable1 = request.batch([videos0], [videos0], zip);
        var disposable2 = request.batch([videos1], [videos1], zip);

        disposable2();
    });
});
