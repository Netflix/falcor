const falcor = require("./../../../lib/");
const Model = falcor.Model;
const noOp = function() { };
const LocalDataSource = require("../../data/LocalDataSource");
const ErrorDataSource = require("../../data/ErrorDataSource");
const asyncifyDataSource = require("../../data/asyncifyDataSource");
const isPathValue = require("./../../../lib/support/isPathValue");
const cacheGenerator = require("./../../CacheGenerator");
const atom = require("falcor-json-graph").atom;
const MaxRetryExceededError = require("./../../../lib/errors/MaxRetryExceededError");
const strip = require("./../../cleanData").stripDerefAndVersionKeys;
const isAssertionError = require("./../../isAssertionError");
const toObservable = require("../../toObs");

describe("DataSource Only", () => {
    let dataSource;
    beforeEach(() => {
        dataSource = new LocalDataSource(cacheGenerator(0, 2, ["title", "art"], false));
    });

    describe("Preload Functions", () => {
        it("should get a value from falcor.", done => {
            const model = new Model({ source: dataSource });
            const onNext = jest.fn();
            const secondOnNext = jest.fn();
            toObservable(model.
                preload(["videos", 0, "title"])).
                doAction(onNext, noOp, () => {
                    expect(onNext).not.toHaveBeenCalled();
                }).
                defaultIfEmpty({}).
                flatMap(() => {
                    return model.get(["videos", 0, "title"]);
                }).
                doAction(secondOnNext, noOp, () => {
                    expect(secondOnNext).toHaveBeenCalledTimes(1);
                    expect(strip(secondOnNext.mock.calls[0][0])).toEqual({
                        json: {
                            videos: { 0: { title: "Video 0" } }
                        }
                    });
                }).
                subscribe(noOp, done, done);
        });

        it("should perform multiple trips to a dataSource.", done => {
            const get = jest.fn((source, paths) => {
                if (paths.length === 0) {
                    paths.pop();
                }
            });
            const model = new Model({
                source: new LocalDataSource(cacheGenerator(0, 2, ["title", "art"]), { onGet: get })

            });
            const onNext = jest.fn();
            const secondOnNext = jest.fn();
            toObservable(model.
                preload(["videos", 0, "title"],
                    ["videos", 1, "art"])).
                doAction(onNext).
                doAction(noOp, noOp, () => {
                    expect(onNext).not.toHaveBeenCalled();
                }).
                defaultIfEmpty({}).
                flatMap(() => {
                    return model.get(["videos", 0, "title"]);
                }).
                doAction(secondOnNext).
                doAction(noOp, noOp, () => {
                    expect(secondOnNext).toHaveBeenCalledTimes(1);
                    expect(strip(secondOnNext.mock.calls[0][0])).toEqual({
                        json: { videos: { 0: { title: "Video 0" } } }
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
    describe("PathMap", () => {
        it("should get a value from falcor.", done => {
            const model = new Model({ source: dataSource });
            const onNext = jest.fn();
            toObservable(model.
                get(["videos", 0, "title"])).
                doAction(onNext, noOp, () => {
                    expect(strip(onNext.mock.calls[0][0])).toEqual({
                        json: { videos: { 0: { title: "Video 0" } } }
                    });
                }).
                subscribe(noOp, done, done);
        });
        it("should get a directly referenced value from falcor.", done => {
            const cache = {
                reference: {
                    $type: "ref",
                    value: ["foo", "bar"]
                },
                foo: {
                    bar: {
                        $type: "atom",
                        value: "value"
                    }
                }
            };
            const model = new Model({ source: new LocalDataSource(cache) });
            const onNext = jest.fn();
            toObservable(model.
                get(["reference", null])).
                doAction(onNext, noOp, () => {
                    expect(strip(onNext.mock.calls[0][0])).toEqual({
                        json: { reference: "value" }
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
    describe("_toJSONG", () => {
        it("should get a value from falcor.", done => {
            const model = new Model({ source: dataSource });
            const onNext = jest.fn();
            toObservable(model.
                get(["videos", 0, "title"]).
                _toJSONG()).
                doAction(onNext, noOp, () => {
                    expect(strip(onNext.mock.calls[0][0])).toEqual({
                        jsonGraph: {
                            videos: {
                                0: {
                                    title: atom("Video 0")
                                }
                            }
                        },
                        paths: [["videos", 0, "title"]]
                    });
                }).
                subscribe(noOp, done, done);
        });
    });
    it("should report errors from a dataSource with _treatDataSourceErrorsAsJSONGraphErrors.", done => {
        const model = new Model({
            _treatDataSourceErrorsAsJSONGraphErrors: true,
            source: new ErrorDataSource(500, "Oops!")
        });
        toObservable(model.
            get(["videos", 0, "title"])).
            doAction(noOp, err => {
                expect(err).toEqual([{
                    path: ["videos", 0, "title"],
                    value: {
                        message: "Oops!",
                        status: 500
                    }
                }]);
            }, () => {
                throw new Error("On Completed was called. " +
                    "OnError should have been called.");
            }).
            subscribe(noOp, err => {
                // ensure its the same error
                if (Array.isArray(err) && isPathValue(err[0])) {
                    return done();
                }
                return done(err);
            });
    });
    it("should report errors from a dataSource.", done => {
        let outputError = null;
        const model = new Model({
            source: new ErrorDataSource(500, "Oops!")
        });
        toObservable(model.
            get(["videos", 0, "title"])).
            doAction(noOp, err => {
                outputError = err;
                expect(err).toEqual({
                    $type: "error",
                    value: {
                        message: "Oops!",
                        status: 500
                    }
                });
            }, () => {
                throw new Error("On Completed was called. " +
                    "OnError should have been called.");
            }).
            subscribe(noOp, err => {
                if (err === outputError) {
                    return done();
                }
                else {
                    return done(err);
                }
            });
    });
    it("should get all missing paths in a single request", done => {
        let serviceCalls = 0;
        const cacheModel = new Model({
            cache: {
                lolomo: {
                    summary: {
                        $type: "atom",
                        value: "hello"
                    },
                    0: {
                        summary: {
                            $type: "atom",
                            value: "hello-0"
                        }
                    },
                    1: {
                        summary: {
                            $type: "atom",
                            value: "hello-1"
                        }
                    },
                    2: {
                        summary: {
                            $type: "atom",
                            value: "hello-2"
                        }
                    }
                }
            }
        });
        const model = new Model({
            source: {
                get(paths) {
                    serviceCalls++;
                    return cacheModel.get.apply(cacheModel, paths)._toJSONG();
                }
            }
        });


        const onNext = jest.fn();
        toObservable(model.
            get("lolomo.summary", "lolomo[0..2].summary")).
            doAction(onNext, noOp, () => {
                const data = onNext.mock.calls[0][0];
                const json = data.json;
                const lolomo = json.lolomo;
                expect(lolomo.summary).toBeDefined();
                expect(lolomo[0].summary).toBeDefined();
                expect(lolomo[1].summary).toBeDefined();
                expect(lolomo[2].summary).toBeDefined();
                expect(serviceCalls).toBe(1);
            }).
            subscribe(noOp, done, done);
    });

    it("should be able to dispose of getRequests.", done => {
        const onGet = jest.fn();
        const source = new LocalDataSource(cacheGenerator(0, 2), {
            onGet
        });
        const model = new Model({ source }).batch();
        const onNext = jest.fn();
        const disposable = toObservable(model.
            get(["videos", 0, "title"])).
            doAction(onNext, noOp, () => {
                throw new Error("Should not of completed.  It was disposed.");
            }).
            subscribe(noOp, done);


        disposable.dispose();
        setTimeout(() => {
            try {
                expect(onNext).not.toHaveBeenCalled();
                expect(onGet).not.toHaveBeenCalled();
            } catch (e) {
                return done(e);
            }
            return done();
        }, 200);
    });

    it("should ignore response-stuffed paths.", done => {
        const onGet = jest.fn();
        const source = new LocalDataSource(cacheGenerator(0, 2), {
            onGet,
            wait: 100
        });
        const model = new Model({ source }).batch(1);
        const onNext = jest.fn();
        const disposable1 = toObservable(model.
            get(["videos", 0, "title"])).
            doAction(onNext, noOp, () => {
                throw new Error("Should not of completed.  It was disposed.");
            }).
            subscribe(noOp, done);

        toObservable(model.
            get(["videos", 1, "title"])).
            subscribe(noOp, done);

        setTimeout(() => {
            disposable1.dispose();
        }, 30);

        setTimeout(() => {
            try {
                expect(model._root.cache.videos[0]).toBeUndefined();
            } catch (e) {
                return done(e);
            }
            return done();
        }, 200);
    });

    it("should honor response-stuffed paths with _useServerPaths == true.", done => {
        const onGet = jest.fn();
        const source = new LocalDataSource(cacheGenerator(0, 2), {
            onGet,
            wait: 100,
            onResults(data) {
                data.paths = [
                    ["videos", 0, "title"],
                    ["videos", 1, "title"]
                ];
            }
        });
        const model = new Model({ source, _useServerPaths: true }).batch(1);
        const onNext = jest.fn();
        const disposable1 = toObservable(model.
            get(["videos", 0, "title"])).
            doAction(onNext, noOp, () => {
                throw new Error("Should not of completed.  It was disposed.");
            }).
            subscribe(noOp, done);

        toObservable(model.
            get(["videos", 1, "title"])).
            subscribe(noOp, done);

        setTimeout(() => {
            disposable1.dispose();
        }, 30);

        setTimeout(() => {
            try {
                expect(model._root.cache.videos[0].$_absolutePath).toEqual(["videos", 0]);
            } catch (e) {
                return done(e);
            }
            return done();
        }, 200);
    });

    it("should throw when server paths are missing and _useServerPaths == true.", done => {
        const source = new LocalDataSource(cacheGenerator(0, 2));
        const model = new Model({ source, _useServerPaths: true }).batch(1);
        toObservable(model.
            get(["videos", 0, "title"])).
            subscribe(noOp, err => {
                expect(err.message).toBe("Server responses must include a 'paths' field when Model._useServerPaths === true");
                done();
            });
    });

    it("should be able to dispose one of two get requests..", done => {
        const onGet = jest.fn();
        const source = new LocalDataSource(cacheGenerator(0, 2), {
            onGet
        });
        const model = new Model({ source }).batch();
        const onNext = jest.fn();
        const disposable = toObservable(model.
            get(["videos", 0, "title"])).
            doAction(onNext, noOp, () => {
                throw new Error("Should not of completed.  It was disposed.");
            }).
            subscribe(noOp, done);
        const onNext2 = jest.fn();
        toObservable(model.
            get(["videos", 0, "title"])).
            doAction(onNext2).
            subscribe(noOp, done);

        disposable.dispose();
        setTimeout(() => {
            try {
                expect(onNext).not.toHaveBeenCalled();
                expect(onGet).toHaveBeenCalledTimes(1);
                expect(onNext2).toHaveBeenCalledTimes(1);
                expect(strip(onNext2.mock.calls[0][0])).toEqual({
                    json: {
                        videos: {
                            0: {
                                title: "Video 0"
                            }
                        }
                    }
                });
            } catch (e) {
                return done(e);
            }
            return done();
        }, 200);
    });
    it("should onError a MaxRetryExceededError when data source is sync.", done => {
        const model = new Model({ source: new LocalDataSource({}) });
        toObservable(model.
            get(["videos", 0, "title"])).
            doAction(noOp, e => {
                expect(MaxRetryExceededError.is(e), "MaxRetryExceededError expected.").toBe(true);
            }).
            subscribe(noOp, e => {
                if (isAssertionError(e)) {
                    return done(e);
                }
                return done();
            }, done.bind(null, new Error("should not complete")));
    });

    it("should onError a MaxRetryExceededError when data source is async.", done => {
        const model = new Model({ source: asyncifyDataSource(new LocalDataSource({})) });
        toObservable(model.
            get(["videos", 0, "title"])).
            doAction(noOp, e => {
                expect(MaxRetryExceededError.is(e), "MaxRetryExceededError expected.").toBe(true);
            }).
            subscribe(noOp, e => {
                if (isAssertionError(e)) {
                    return done(e);
                }
                return done();
            }, done.bind(null, new Error("should not complete")));
    });

    it("should return missing optimized paths with MaxRetryExceededError", done => {
        const model = new Model({
            source: asyncifyDataSource(new LocalDataSource({})),
            cache: {
                lolomo: {
                    0: {
                        $type: "ref",
                        value: ["videos", 1]
                    }
                },
                videos: {
                    0: {
                        title: "Revolutionary Road"
                    }
                }
            }
        });
        toObservable(model.
            get(["lolomo", 0, "title"], "videos[0].title", "hall[0].ween")).
            doAction(noOp, e => {
                expect(MaxRetryExceededError.is(e), "MaxRetryExceededError expected.").toBe(true);
                expect(e.missingOptimizedPaths).toEqual([
                    ["videos", 1, "title"],
                    ["hall", 0, "ween"]
                ]);
            }).
            subscribe(noOp, e => {
                if (isAssertionError(e)) {
                    return done(e);
                }
                return done();
            }, done.bind(null, new Error("should not complete")));
    });

    it("should throw MaxRetryExceededError after retrying said times", done => {
        const onGet = jest.fn();
        const model = new Model({
            maxRetries: 5,
            source: asyncifyDataSource(new LocalDataSource({}, {
                onGet
            }))
        });
        toObservable(model.
            get("some.path")).
            doAction(noOp, e => {
                expect(MaxRetryExceededError.is(e), "MaxRetryExceededError expected").toBe(true);
                expect(onGet).toHaveBeenCalledTimes(5);
            }).
            subscribe(noOp, e => {
                if (isAssertionError(e)) { return done(e); }
                return done();
            }, done.bind(null, new Error("should not complete")));
    });

    it("passes the attempt count to the DataSource", () => {
        const onGet = jest.fn();
        const model = new Model({
            source: asyncifyDataSource(new LocalDataSource({}, { onGet }))
        });
        const path = ["some", "path"];

        return model.
            get(path).
            then(() => {
                throw new Error("should have rejected with MaxRetryExceededError");
            }, e => {
                expect(e).toBeInstanceOf(MaxRetryExceededError);
                expect(onGet).toHaveBeenCalledTimes(3);
                expect(onGet).toHaveBeenNthCalledWith(1, expect.anything(), [path], 1);
                expect(onGet).toHaveBeenNthCalledWith(2, expect.anything(), [path], 2);
                expect(onGet).toHaveBeenNthCalledWith(3, expect.anything(), [path], 3);
            });
    });
});

