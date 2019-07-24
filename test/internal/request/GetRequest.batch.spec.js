const GetRequest = require("./../../../lib/request/GetRequestV2");
const ASAPScheduler = require("./../../../lib/schedulers/ASAPScheduler");
const ImmediateScheduler = require("./../../../lib/schedulers/ImmediateScheduler");
const Model = require("./../../../lib").Model;
const LocalDataSource = require("./../../data/LocalDataSource");
const zipSpy = require("./../../zipSpy");
const toObservable = require("../../toObs");

const cacheGenerator = require("./../../CacheGenerator");
const strip = require("./../../cleanData").stripDerefAndVersionKeys;
const noOp = function() {};
const Cache = function() {
    return cacheGenerator(0, 2);
};

describe("#batch", () => {
    const videos0 = ["videos", 0, "title"];
    const videos1 = ["videos", 1, "title"];

    it("should make a request to the dataSource with an immediate scheduler", done => {
        let inlineBoolean = true;
        const scheduler = new ImmediateScheduler();
        const getSpy = jest.fn();
        const source = new LocalDataSource(Cache(), {
            onGet: getSpy
        });
        const model = new Model({ source });
        const request = new GetRequest(scheduler, {
            removeRequest() {},
            model
        });

        request.batch([videos0], [videos0], (err, data) => {
            if (err) {
                done(err);
            }

            const onNext = jest.fn();
            toObservable(model.withoutDataSource().get(videos0))
                .doAction(onNext, noOp, () => {
                    expect(inlineBoolean).toBe(true);
                    expect(getSpy).toHaveBeenCalledTimes(1);
                    expect(getSpy.mock.calls[0][1]).toEqual([videos0]);
                    expect(onNext).toHaveBeenCalledTimes(1);
                    expect(strip(onNext.mock.calls[0][0])).toEqual({
                        json: {
                            videos: {
                                0: {
                                    title: "Video 0"
                                }
                            }
                        }
                    });
                })
                .subscribe(noOp, done, done);
        });
        inlineBoolean = false;
    });

    it("should make a request to the dataSource with an async scheduler.", done => {
        let inlineBoolean = true;
        const scheduler = new ASAPScheduler();
        const getSpy = jest.fn();
        const source = new LocalDataSource(Cache(), {
            onGet: getSpy
        });
        const model = new Model({ source });
        const request = new GetRequest(scheduler, {
            removeRequest() {},
            model
        });
        const callback = jest.fn((err, data) => {
            if (err) {
                done(err);
            }

            const onNext = jest.fn();
            toObservable(model.withoutDataSource().get(videos0))
                .doAction(onNext, noOp, () => {
                    expect(inlineBoolean).toBe(false);
                    expect(getSpy).toHaveBeenCalledTimes(1);
                    expect(getSpy.mock.calls[0][1]).toEqual([videos0]);
                    expect(onNext).toHaveBeenCalledTimes(1);
                    expect(strip(onNext.mock.calls[0][0])).toEqual({
                        json: {
                            videos: {
                                0: {
                                    title: "Video 0"
                                }
                            }
                        }
                    });
                })
                .subscribe(noOp, done, done);
        });

        request.batch([videos0], [videos0], callback);
        inlineBoolean = false;
    });

    it("should batch some requests together.", done => {
        const scheduler = new ASAPScheduler();
        const getSpy = jest.fn();
        const source = new LocalDataSource(Cache(), {
            onGet: getSpy
        });
        const model = new Model({ source });
        const request = new GetRequest(scheduler, {
            removeRequest() {},
            model
        });

        const zip = zipSpy(2, callCount => {
            expect(callCount).toBe(2);
            const onNext = jest.fn();
            toObservable(model.withoutDataSource().get(videos0, videos1))
                .doAction(onNext, noOp, () => {
                    expect(strip(onNext.mock.calls[0][0])).toEqual({
                        json: {
                            videos: {
                                0: {
                                    title: "Video 0"
                                },
                                1: {
                                    title: "Video 1"
                                }
                            }
                        }
                    });
                })
                .subscribe(noOp, done, done);
        });

        request.batch([videos0], [videos0], zip);
        request.batch([videos1], [videos1], zip);
    });

    it("should batch some requests together and dispose the first one.", done => {
        const scheduler = new ASAPScheduler();
        const getSpy = jest.fn();
        const source = new LocalDataSource(Cache(), {
            onGet: getSpy
        });
        const model = new Model({ source });
        const request = new GetRequest(scheduler, {
            removeRequest() {},
            model
        });

        const zip = zipSpy(
            2,
            callCount => {
                const onNext = jest.fn();
                toObservable(model.withoutDataSource().get(videos0, videos1))
                    .doAction(onNext, noOp, () => {
                        expect(callCount).toBe(1);
                        expect(strip(onNext.mock.calls[0][0])).toEqual({
                            json: {
                                videos: {
                                    1: {
                                        title: "Video 1"
                                    }
                                }
                            }
                        });
                    })
                    .subscribe(noOp, done, done);
            },
            300
        );
        const disposable = request.batch([videos0], [videos0], zip);
        request.batch([videos1], [videos1], zip);

        disposable();
    });

    it("should batch some requests together and dispose the second one.", done => {
        const scheduler = new ASAPScheduler();
        const getSpy = jest.fn();
        const source = new LocalDataSource(Cache(), {
            onGet: getSpy
        });
        const model = new Model({ source });
        const request = new GetRequest(scheduler, {
            removeRequest() {},
            model
        });

        const zip = zipSpy(
            2,
            callCount => {
                const onNext = jest.fn();
                toObservable(model.withoutDataSource().get(videos0, videos1))
                    .doAction(onNext, noOp, () => {
                        expect(callCount).toBe(1);
                        expect(strip(onNext.mock.calls[0][0])).toEqual({
                            json: {
                                videos: {
                                    0: {
                                        title: "Video 0"
                                    }
                                }
                            }
                        });
                    })
                    .subscribe(noOp, done, done);
            },
            300
        );

        request.batch([videos0], [videos0], zip);
        const disposable = request.batch([videos1], [videos1], zip);

        disposable();
    });
});
