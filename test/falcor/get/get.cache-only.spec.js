const falcor = require("./../../../lib");
const Model = falcor.Model;
const cacheGenerator = require("./../../CacheGenerator");
const noOp = function() {};
const clean = require("./../../cleanData").stripDerefAndVersionKeys;
const toObservable = require("../../toObs");

describe("Cache Only", () => {
    describe("PathMap", () => {
        it("should get a value from falcor.", done => {
            const model = new Model({
                cache: cacheGenerator(0, 1),
            });
            const onNext = jest.fn();
            toObservable(model.get(["videos", 0, "title"]))
                .doAction(onNext, noOp, () => {
                    expect(onNext).toHaveBeenCalledTimes(1);
                    expect(clean(onNext.mock.calls[0][0])).toEqual({
                        json: {
                            videos: {
                                0: {
                                    title: "Video 0",
                                },
                            },
                        },
                    });
                })
                .subscribe(noOp, done, done);
        });
        it("should onNext, then complete on empty paths.", done => {
            const model = new Model({
                cache: cacheGenerator(0, 1),
            });
            const onNext = jest.fn();
            toObservable(model.get(["videos", [], "title"]))
                .doAction(onNext, noOp, () => {
                    expect(clean(onNext.mock.calls[0][0])).toEqual({
                        json: {
                            videos: {},
                        },
                    });
                    expect(onNext).toHaveBeenCalledTimes(1);
                })
                .subscribe(noOp, done, done);
        });

        it("should use a promise to get request.", done => {
            const model = new Model({
                cache: cacheGenerator(0, 1),
            });
            const onNext = jest.fn();
            const onError = jest.fn();
            model
                .get(["videos", 0, "title"])
                .then(onNext, onError)
                .then(() => {
                    if (onError.mock.calls[0]) {
                        throw onError.mock.calls[0][0];
                    }

                    expect(onNext).toHaveBeenCalledTimes(1);
                    expect(clean(onNext.mock.calls[0][0])).toEqual({
                        json: {
                            videos: {
                                0: {
                                    title: "Video 0",
                                },
                            },
                        },
                    });
                })
                .then(() => {
                    done();
                }, done);
        });
    });

    describe("_toJSONG", () => {
        it("should get a value from falcor.", done => {
            const model = new Model({
                cache: cacheGenerator(0, 30),
            });
            const onNext = jest.fn();
            toObservable(
                model.get(["lolomo", 0, 0, "item", "title"])._toJSONG()
            )
                .doAction(onNext, noOp, () => {
                    const out = clean(onNext.mock.calls[0][0]);
                    const expected = clean({
                        jsonGraph: cacheGenerator(0, 1),
                        paths: [["lolomo", 0, 0, "item", "title"]],
                    });
                    expect(out).toEqual(expected);
                })
                .subscribe(noOp, done, done);
        });
    });
});
