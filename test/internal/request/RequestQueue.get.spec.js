const RequestQueue = require("./../../../lib/request/RequestQueueV2");
const TimeoutScheduler = require("./../../../lib/schedulers/TimeoutScheduler");
const ImmediateScheduler = require("./../../../lib/schedulers/ImmediateScheduler");
const Model = require("./../../../lib").Model;
const LocalDataSource = require("./../../data/LocalDataSource");
const noOp = function () { };
const zipSpy = require("./../../zipSpy");

const cacheGenerator = require("./../../CacheGenerator");
const strip = require("./../../cleanData").stripDerefAndVersionKeys;
const toObservable = require("../../toObs");

const Cache = function () {
    return cacheGenerator(0, 2);
};

describe("RequestQueue#get", () => {
    const videos0 = ["videos", 0, "title"];
    const videos1 = ["videos", 1, "title"];
    const videos2 = ["videos", 2, "title"];

    it("makes a simple get request", done => {
        const scheduler = new ImmediateScheduler();
        const onGet = jest.fn();
        const source = new LocalDataSource(Cache(), { onGet });
        const model = new Model({ source });
        const queue = new RequestQueue(model, scheduler);
        const callback = jest.fn();
        queue.get([videos0], [videos0], { retryCount: 1 }, callback);

        expect(callback).toHaveBeenCalledTimes(1);
        const onNext = jest.fn();
        toObservable(model.withoutDataSource().get(videos0))
            .doAction(onNext, noOp, () => {
                expect(strip(onNext.mock.calls[0][0])).toEqual({
                    json: {
                        videos: {
                            0: {
                                title: "Video 0"
                            }
                        }
                    }
                });
                expect(onGet).toHaveBeenCalledWith(expect.anything(), [videos0], { retryCount: 1 });
            })
            .subscribe(noOp, done, done);
    });

    it("makes a couple requests and have them batched together", done => {
        const scheduler = new TimeoutScheduler(1); // To allow batching
        const source = new LocalDataSource(Cache());
        const model = new Model({ source });
        const queue = new RequestQueue(model, scheduler);

        const zip = zipSpy(2, callCount => {
            expect(callCount).toBe(2);
            expect(queue._requests.length).toBe(0);

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

        queue.get([videos0], [videos0], zip);
        queue.get([videos1], [videos1], zip);

        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(false);
        expect(queue._requests[0].scheduled).toBe(true);
    });

    it("makes a couple requests where the second argument is deduped", done => {
        const scheduler = new ImmediateScheduler();
        const source = new LocalDataSource(Cache(), { wait: 100 });
        const model = new Model({ source });
        const queue = new RequestQueue(model, scheduler);

        const zip = zipSpy(2, callCount => {
            expect(callCount).toBe(2);
            expect(queue._requests.length).toBe(0);

            const onNext = jest.fn();
            toObservable(model.withoutDataSource().get(videos0, videos1))
                .doAction(onNext, noOp, () => {
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

        queue.get([videos0], [videos0], zip);
        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(true);
        expect(queue._requests[0].scheduled).toBe(false);

        queue.get([videos0], [videos0], zip);
        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(true);
        expect(queue._requests[0].scheduled).toBe(false);
    });

    it("makes a couple requests where only part of the second request is deduped then first request is disposed", done => {
        const scheduler = new ImmediateScheduler();
        const source = new LocalDataSource(Cache(), { wait: 100 });
        const model = new Model({ source });
        const queue = new RequestQueue(model, scheduler);

        const zip = zipSpy(
            2,
            callCount => {
                expect(callCount).toBe(1);

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
            },
            300
        );

        const disposable = queue.get([videos0], [videos0], zip);
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

    it("makes a couple requests where the second request is deduped and the first is disposed", done => {
        const scheduler = new ImmediateScheduler();
        const source = new LocalDataSource(Cache(), { wait: 100 });
        const model = new Model({ source });
        const queue = new RequestQueue(model, scheduler);

        const zip = zipSpy(
            2,
            callCount => {
                expect(callCount).toBe(1);

                const onNext = jest.fn();
                toObservable(model.withoutDataSource().get(videos0, videos1))
                    .doAction(onNext, noOp, () => {
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

        const disposable = queue.get([videos0], [videos0], zip);
        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(true);
        expect(queue._requests[0].scheduled).toBe(false);

        queue.get([videos0], [videos0], zip);
        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(true);
        expect(queue._requests[0].scheduled).toBe(false);

        disposable();
    });

    it("makes a couple requests where the second argument is deduped and all the requests are disposed", done => {
        const scheduler = new ImmediateScheduler();
        const source = new LocalDataSource(Cache(), { wait: 100 });
        const model = new Model({ source });
        const queue = new RequestQueue(model, scheduler);

        const zip = zipSpy(
            2,
            callCount => {
                expect(callCount).toBe(0);

                const onNext = jest.fn();
                toObservable(model.withoutDataSource().get(videos0, videos1))
                    .doAction(onNext, noOp, () => {
                        expect(onNext).toHaveBeenCalledTimes(1);
                    })
                    .subscribe(noOp, done, done);
            },
            300
        );

        const disposable = queue.get([videos0], [videos0], zip);
        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(true);
        expect(queue._requests[0].scheduled).toBe(false);

        const disposable2 = queue.get([videos0], [videos0], zip);
        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(true);
        expect(queue._requests[0].scheduled).toBe(false);

        disposable();
        disposable2();
    });

    it("makes a couple requests where only part of the second request is deduped then disposed", done => {
        const scheduler = new ImmediateScheduler();
        const source = new LocalDataSource(Cache(), { wait: 100 });
        const model = new Model({ source });
        const queue = new RequestQueue(model, scheduler);

        const zip = zipSpy(
            2,
            callCount => {
                expect(callCount).toBe(1);

                const onNext = jest.fn();
                toObservable(model.withoutDataSource().get(videos0, videos1))
                    .doAction(onNext, noOp, () => {
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

        queue.get([videos0], [videos0], zip);
        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(true);
        expect(queue._requests[0].scheduled).toBe(false);

        const disposable2 = queue.get([videos0, videos1], [videos0, videos1], zip);
        expect(queue._requests.length).toBe(2);
        expect(queue._requests[1].sent).toBe(true);
        expect(queue._requests[1].scheduled).toBe(false);

        disposable2();
    });

    it("makes a couple requests where only part of the second request is deduped then both are disposed", done => {
        const scheduler = new ImmediateScheduler();
        const source = new LocalDataSource(Cache(), { wait: 100 });
        const model = new Model({ source });
        const queue = new RequestQueue(model, scheduler);

        const zip = zipSpy(
            2,
            callCount => {
                expect(callCount).toBe(0);

                const onNext = jest.fn();
                toObservable(model.withoutDataSource().get(videos0, videos1))
                    .doAction(onNext, noOp, () => {
                        expect(onNext).toHaveBeenCalledTimes(1);
                    })
                    .subscribe(noOp, done, done);
            },
            300
        );

        const disposable = queue.get([videos0], [videos0], zip);
        expect(queue._requests.length).toBe(1);
        expect(queue._requests[0].sent).toBe(true);
        expect(queue._requests[0].scheduled).toBe(false);

        const disposable2 = queue.get([videos0, videos1], [videos0, videos1], zip);
        expect(queue._requests.length).toBe(2);
        expect(queue._requests[1].sent).toBe(true);
        expect(queue._requests[1].scheduled).toBe(false);

        disposable();
        disposable2();
    });

    it("does not dedupe requests when request deduplication is disabled", done => {
        const scheduler = new ImmediateScheduler();
        const dsGetSpy = jest.fn();
        const source = new LocalDataSource(Cache(), { wait: 100, onGet: dsGetSpy });
        const model = new Model({ source, disableRequestDeduplication: true });
        const queue = new RequestQueue(model, scheduler);

        const zip = zipSpy(2, callCount => {
            expect(callCount).toBe(2);
            expect(queue._requests.length).toBe(0);

            expect(dsGetSpy).toHaveBeenCalledTimes(2);

            // Paths should still be collapsed
            expect(dsGetSpy).toHaveBeenNthCalledWith(1, expect.anything(), [["videos", { from: 0, to: 1 }, "title"]], undefined);
            expect(dsGetSpy).toHaveBeenNthCalledWith(2, expect.anything(), [["videos", { from: 1, to: 2 }, "title"]], undefined);

            done();
        });

        queue.get([videos0, videos1], [videos0, videos1], zip);
        queue.get([videos1, videos2], [videos1, videos2], zip);
    });

    it("does not collapse paths when path collapse is disabled", done => {
        const scheduler = new ImmediateScheduler();
        const dsGetSpy = jest.fn();
        const source = new LocalDataSource(Cache(), { wait: 100, onGet: dsGetSpy });
        const model = new Model({ source, disablePathCollapse: true });
        const queue = new RequestQueue(model, scheduler);

        const zip = zipSpy(2, callCount => {
            expect(callCount).toBe(2);
            expect(queue._requests.length).toBe(0);

            // Requests should still be deduplicated
            expect(dsGetSpy).toHaveBeenCalledTimes(2);
            expect(dsGetSpy).toHaveBeenNthCalledWith(1, expect.anything(), [videos0, videos1], undefined);
            expect(dsGetSpy).toHaveBeenNthCalledWith(2, expect.anything(), [videos2], undefined);

            done();
        });

        queue.get([videos0, videos1], [videos0, videos1], zip);
        queue.get([videos1, videos2], [videos1, videos2], zip);
    });

    describe("when path collapse and request deduplication are disabled", () => {
        it("does not collapse paths or dedupe requests", done => {
            const scheduler = new ImmediateScheduler();
            const dsGetSpy = jest.fn();
            const source = new LocalDataSource(Cache(), { wait: 100, onGet: dsGetSpy });
            const model = new Model({ source, disablePathCollapse: true, disableRequestDeduplication: true });
            const queue = new RequestQueue(model, scheduler);

            const zip = zipSpy(2, callCount => {
                expect(callCount).toBe(2);
                expect(queue._requests.length).toBe(0);

                // No path collapse, no request dedupe
                expect(dsGetSpy).toHaveBeenCalledTimes(2);
                expect(dsGetSpy).toHaveBeenNthCalledWith(1, expect.anything(), [videos0, videos1], undefined);
                expect(dsGetSpy).toHaveBeenNthCalledWith(2, expect.anything(), [videos1, videos2], undefined);

                done();
            });

            queue.get([videos0, videos1], [videos0, videos1], zip);
            queue.get([videos1, videos2], [videos1, videos2], zip);
        });

        it("combines batched paths without collapse", done => {
            const scheduler = new TimeoutScheduler(1); // To allow batching
            const dsGetSpy = jest.fn();
            const source = new LocalDataSource(Cache(), { wait: 100, onGet: dsGetSpy });
            const model = new Model({ source, disablePathCollapse: true, disableRequestDeduplication: true });
            const queue = new RequestQueue(model, scheduler);

            const zip = zipSpy(2, callCount => {
                expect(callCount).toBe(2);
                expect(queue._requests.length).toBe(0);

                expect(dsGetSpy).toHaveBeenCalledTimes(1);
                expect(dsGetSpy).toHaveBeenNthCalledWith(1, expect.anything(), [videos0, videos1, videos1, videos2], undefined);

                done();
            });

            queue.get([videos0, videos1], [videos0, videos1], zip);
            queue.get([videos1, videos2], [videos1, videos2], zip);
        });
    });
});
