const falcor = require("./../../../lib/");
const Model = falcor.Model;
const noOp = function() { };
const LocalDataSource = require("./../../data/LocalDataSource");
const Cache = require("./../../data/Cache");
const strip = require("./../../cleanData").stripDerefAndVersionKeys;
const MaxRetryExceededError = require("./../../../lib/errors/MaxRetryExceededError");
const toObservable = require("../../toObs");

describe("DataSource.", () => {
    it("should validate args are sent to the dataSource collapsed.", done => {
        const onSet = jest.fn((source, tmpGraph, jsonGraphFromSet, dsRequestOpts) => {
            return jsonGraphFromSet;
        });
        const dataSource = new LocalDataSource(Cache(), { onSet });
        const model = new Model({
            source: dataSource
        });

        toObservable(model.
            set({
                json: {
                    videos: {
                        1234: {
                            rating: 5
                        },
                        444: {
                            rating: 3
                        }
                    }
                }
            })).
            doAction(noOp, noOp, () => {
                expect(onSet).toHaveBeenCalledTimes(1);
                expect(onSet).toHaveBeenCalledWith(expect.anything(), expect.anything(), expect.anything(), 1);

                const cleaned = onSet.mock.calls[0][2];
                cleaned.paths[0][1] = cleaned.paths[0][1].concat();
                expect(cleaned).toEqual({
                    jsonGraph: {
                        videos: {
                            1234: {
                                rating: 5
                            },
                            444: {
                                rating: 3
                            }
                        }
                    },
                    paths: [
                        ["videos", [444, 1234], "rating"]
                    ]
                });
            }).
            subscribe(noOp, done, done);
    });

    it("should send off an empty string on a set to the server.", done => {
        const onSet = jest.fn((source, tmpGraph, jsonGraphFromSet) => {
            return jsonGraphFromSet;
        });
        const dataSource = new LocalDataSource(Cache(), {
            onSet
        });
        const model = new Model({
            source: dataSource
        });
        toObservable(model.
            setValue("videos[1234].another_prop", "")).
            doAction(noOp, noOp, () => {
                expect(onSet).toHaveBeenCalledTimes(1);

                const cleaned = onSet.mock.calls[0][2];
                expect(cleaned).toEqual({
                    jsonGraph: {
                        videos: {
                            1234: {
                                another_prop: ""
                            }
                        }
                    },
                    paths: [
                        ["videos", 1234, "another_prop"]
                    ]
                });
            }).
            subscribe(noOp, done, done);
    });

    it("should send off undefined on a set to the server.", done => {
        const onSet = jest.fn((source, tmpGraph, jsonGraphFromSet) => {
            return jsonGraphFromSet;
        });
        const dataSource = new LocalDataSource(Cache(), {
            onSet
        });
        const model = new Model({
            source: dataSource
        });
        toObservable(model.
            set({
                json: {
                    videos: {
                        1234: {
                            another_prop: undefined
                        }
                    }
                }
            })).
            doAction(noOp, noOp, () => {
                expect(onSet).toHaveBeenCalledTimes(1);

                const cleaned = onSet.mock.calls[0][2];
                expect(cleaned).toEqual({
                    jsonGraph: {
                        videos: {
                            1234: {
                                another_prop: {
                                    $type: "atom"
                                }
                            }
                        }
                    },
                    paths: [
                        ["videos", 1234, "another_prop"]
                    ]
                });
            }).
            subscribe(noOp, done, done);
    });

    it("should report paths progressively.", done => {
        const onSet = function(source, tmpGraph, jsonGraphFromSet) {
            jsonGraphFromSet.jsonGraph.videos[444].rating = 5;
            return jsonGraphFromSet;
        };
        const dataSource = new LocalDataSource(Cache(), {
            onSet
        });
        const model = new Model({
            source: dataSource
        });

        let count = 0;
        toObservable(model.
            set({
                json: {
                    videos: {
                        1234: {
                            rating: 5
                        },
                        444: {
                            rating: 3
                        }
                    }
                }
            }).
            progressively()).
            doAction(x => {
                if (count === 0) {
                    expect(strip(x)).toEqual({
                        json: {
                            videos: {
                                1234: {
                                    rating: 5
                                },
                                444: {
                                    rating: 3
                                }
                            }
                        }
                    });
                }

                else {
                    expect(strip(x)).toEqual({
                        json: {
                            videos: {
                                1234: {
                                    rating: 5
                                },
                                444: {
                                    rating: 5
                                }
                            }
                        }
                    });
                }

                count++;
            }, noOp, () => {
                expect(count === 2).toBe(true);
            }).
            subscribe(noOp, done, done);
    });

    it("should return missing optimized paths with a MaxRetryExceededError.", () => {
        const onSet = jest.fn((source, tmpGraph, jsonGraphFromSet, dsRequestOpts) => {
            // eslint-disable-next-line no-use-before-define
            model.invalidate("videos[1234].title");
            return {
                jsonGraph: {
                    videos: {
                        1234: {}
                    }
                },
                paths: []
            };
        });
        const dataSource = new LocalDataSource(Cache(), { onSet });
        const model = new Model({
            source: dataSource
        });

        return model.set({
            json: {
                videos: {
                    1234: {
                        title: "Nowhere to be found"
                    }
                }
            }
        }).then(() => {
            throw new Error("should have rejected with MaxRetryExceededError");
        }, e => {
            expect(e).toBeInstanceOf(MaxRetryExceededError);
            expect(e.missingOptimizedPaths).toEqual([["videos", "1234", "title"]]);

            expect(onSet).toHaveBeenCalledTimes(3);
            expect(onSet).toHaveBeenNthCalledWith(1, expect.anything(), expect.anything(), expect.anything(), 1 );
            expect(onSet).toHaveBeenNthCalledWith(2, expect.anything(), expect.anything(), expect.anything(), 2 );
            expect(onSet).toHaveBeenNthCalledWith(3, expect.anything(), expect.anything(), expect.anything(), 3 );
        });
    });
});

