const Rx = require("rx");
const testRunner = require("./testRunner");
const $ref = require("./../lib/types/ref");
const $error = require("./../lib/types/error");
const $atom = require("./../lib/types/atom");
const rxjs = require("rxjs");

const falcor = require("./../lib/");
const Model = falcor.Model;

function ResponseObservable(response) {
    this.response = response;
}

ResponseObservable.prototype = Object.create(Rx.Observable.prototype);

ResponseObservable.prototype._subscribe = function(observer) {
    return this.response.subscribe(observer);
};

ResponseObservable.prototype._toJSONG = function() {
    return new ResponseObservable(this.response._toJSONG.apply(this.response, arguments));
};

ResponseObservable.prototype.progressively = function() {
    return new ResponseObservable(this.response.progressively.apply(this.response, arguments));
};

ResponseObservable.prototype.then = function() {
    return this.response.then.apply(this.response, arguments);
};

ResponseObservable.prototype[Symbol.observable] = function() {
    return this.response[Symbol.observable].apply(this.response, arguments);
};

const modelGet = Model.prototype.get;
const modelSet = Model.prototype.set;
const modelCall = Model.prototype.call;
const modelPreload = Model.prototype.preload;

Model.prototype.get = function() {
    return new ResponseObservable(modelGet.apply(this, arguments));
};

Model.prototype.set = function() {
    return new ResponseObservable(modelSet.apply(this, arguments));
};

Model.prototype.preload = function() {
    return new ResponseObservable(modelPreload.apply(this, arguments));
};

Model.prototype.call = function() {
    return new ResponseObservable(modelCall.apply(this, arguments));
};

describe("Model", () => {
    it("should construct a new Model", () => {
        new Model();
    });

    it("should construct a new Model when calling the falcor module function", () => {
        expect(falcor() instanceof falcor.Model).toBe(true);
    });

    it("should have access to static helper methods.", () => {
        const ref = ["a", "b", "c"];
        const err = { ohhh: "no!" };

        let out = Model.ref(ref);
        testRunner.compare({ $type: $ref, value: ref }, out);

        out = Model.ref("a.b.c");
        testRunner.compare({ $type: $ref, value: ref }, out);

        out = Model.error(err);
        testRunner.compare({ $type: $error, value: err }, out);

        out = Model.atom(1337);
        testRunner.compare({ $type: $atom, value: 1337 }, out);
    });

    it("unsubscribing should cancel DataSource request.", done => {
        let onNextCalled = 0,
            onErrorCalled = 0,
            onCompletedCalled = 0,
            unusubscribeCalled = 0,
            dataSourceGetCalled = 0;

        const model = new Model({
            cache: {
                list: {
                    0: { name: "test" }
                }
            },
            source: {
                get() {
                    return {
                        subscribe(observerOrOnNext, onError, onCompleted) {
                            dataSourceGetCalled++;
                            const handle = setTimeout(() => {
                                const response = {
                                    jsonGraph: {
                                        list: {
                                            1: { name: "another test" }
                                        }
                                    },
                                    paths: ["list", 1, "name"]
                                };

                                if (typeof observerOrOnNext === "function") {
                                    observerOrOnNext(response);
                                    onCompleted();
                                } else {
                                    observerOrOnNext.onNext(response);
                                    observerOrOnNext.onCompleted();
                                }
                            });

                            return {
                                dispose() {
                                    unusubscribeCalled++;
                                    clearTimeout(handle);
                                }
                            };
                        }
                    };
                }
            }
        });

        const subscription = model.get("list[0,1].name").subscribe(
            value => {
                onNextCalled++;
            },
            error => {
                onErrorCalled++;
            },
            () => {
                onCompletedCalled++;
            }
        );

        subscription.dispose();

        if (
            dataSourceGetCalled === 1 &&
            !onNextCalled &&
            unusubscribeCalled === 1 &&
            !onErrorCalled &&
            !onCompletedCalled
        ) {
            done();
        } else {
            done(new Error("DataSource unsubscribe not called."));
        }
    });

    it("unsubscribing should dispose batched DataSource request.", done => {
        let onNextCalled = 0,
            onErrorCalled = 0,
            onCompletedCalled = 0,
            unusubscribeCalled = 0,
            dataSourceGetCalled = 0;
        let onDataSourceGet, onDisposedOrCompleted;

        let model = new Model({
            cache: {
                list: {
                    0: { name: "test" }
                }
            },
            source: {
                get() {
                    return {
                        subscribe(observerOrOnNext, onError, onCompleted) {
                            dataSourceGetCalled++;
                            const handle = setTimeout(() => {
                                const response = {
                                    jsonGraph: {
                                        list: {
                                            1: { name: "another test" }
                                        }
                                    },
                                    paths: ["list", 1, "name"]
                                };

                                onDataSourceGet && onDataSourceGet();
                                if (typeof observerOrOnNext === "function") {
                                    observerOrOnNext(response);
                                    onCompleted();
                                } else {
                                    observerOrOnNext.onNext(response);
                                    observerOrOnNext.onCompleted();
                                }

                                onDisposedOrCompleted && onDisposedOrCompleted();
                            });

                            return {
                                dispose() {
                                    unusubscribeCalled++;
                                    clearTimeout(handle);
                                }
                            };
                        }
                    };
                }
            }
        });
        model = model.batch();

        const subscription = model.get("list[0,1].name").subscribe(
            value => {
                onNextCalled++;
            },
            error => {
                onErrorCalled++;
            },
            () => {
                onCompletedCalled++;
            }
        );

        onDataSourceGet = function() {
            subscription.dispose();
        };

        onDisposedOrCompleted = function() {
            if (
                dataSourceGetCalled === 1 &&
                !onNextCalled &&
                unusubscribeCalled === 1 &&
                !onErrorCalled &&
                !onCompletedCalled
            ) {
                done();
            } else {
                done(new Error("DataSource dispose not called."));
            }
        };
    });

    it('unsubscribing should "unsubscribe" batched DataSource request, if applicable.', done => {
        let onNextCalled = 0,
            onErrorCalled = 0,
            onCompletedCalled = 0,
            unusubscribeCalled = 0,
            dataSourceGetCalled = 0;
        let onDataSourceGet, onDisposedOrCompleted;

        let model = new Model({
            cache: {
                list: {
                    0: { name: "test" }
                }
            },
            source: {
                get() {
                    return {
                        subscribe(observerOrOnNext, onError, onCompleted) {
                            dataSourceGetCalled++;
                            const handle = setTimeout(() => {
                                const response = {
                                    jsonGraph: {
                                        list: {
                                            1: { name: "another test" }
                                        }
                                    },
                                    paths: ["list", 1, "name"]
                                };

                                onDataSourceGet && onDataSourceGet();
                                if (typeof observerOrOnNext === "function") {
                                    observerOrOnNext(response);
                                    onCompleted();
                                } else {
                                    observerOrOnNext.onNext(response);
                                    observerOrOnNext.onCompleted();
                                }

                                onDisposedOrCompleted && onDisposedOrCompleted();
                            });

                            return {
                                unsubscribe() {
                                    unusubscribeCalled++;
                                    clearTimeout(handle);
                                }
                            };
                        }
                    };
                }
            }
        });
        model = model.batch();

        const subscription = model.get("list[0,1].name").subscribe(
            value => {
                onNextCalled++;
            },
            error => {
                onErrorCalled++;
            },
            () => {
                onCompletedCalled++;
            }
        );

        onDataSourceGet = function() {
            subscription.dispose();
        };

        onDisposedOrCompleted = function() {
            if (
                dataSourceGetCalled === 1 &&
                !onNextCalled &&
                unusubscribeCalled === 1 &&
                !onErrorCalled &&
                !onCompletedCalled
            ) {
                done();
            } else {
                done(new Error("DataSource unsubscribe not called."));
            }
        };
    });

    it("Supports RxJS 5.", done => {
        let onNextCalled = 0,
            onErrorCalled = 0,
            onCompletedCalled = 0,
            unusubscribeCalled = 0,
            dataSourceGetCalled = 0;

        const model = new Model({
            cache: {
                list: {
                    0: { name: "test" }
                }
            },
            source: {
                get() {
                    return {
                        subscribe(observerOrOnNext, onError, onCompleted) {
                            dataSourceGetCalled++;
                            const handle = setTimeout(() => {
                                const response = {
                                    jsonGraph: {
                                        list: {
                                            1: { name: "another test" }
                                        }
                                    },
                                    paths: ["list", 1, "name"]
                                };

                                if (typeof observerOrOnNext === "function") {
                                    observerOrOnNext(response);
                                    onCompleted();
                                } else {
                                    observerOrOnNext.onNext(response);
                                    observerOrOnNext.onCompleted();
                                }
                            });

                            return {
                                dispose() {
                                    unusubscribeCalled++;
                                    clearTimeout(handle);
                                }
                            };
                        }
                    };
                }
            }
        });

        const subscription = rxjs.Observable.from(model.get("list[0,1].name")).subscribe(
            value => {
                onNextCalled++;
            },
            error => {
                onErrorCalled++;
            },
            () => {
                onCompletedCalled++;
            }
        );

        subscription.unsubscribe();

        if (
            dataSourceGetCalled === 1 &&
            !onNextCalled &&
            unusubscribeCalled === 1 &&
            !onErrorCalled &&
            !onCompletedCalled
        ) {
            done();
        } else {
            done(new Error("DataSource unsubscribe not called."));
        }
    });

    it("setMaxSize to a lower value forces a collect", () => {
        const model = new Model({
            cache: {
                list: {
                    0: { name: "test" }
                }
            }
        });
        const cache = model._root.cache;
        expect(cache.$size).toBeGreaterThan(0);
        model._setMaxSize(0);
        expect(cache.$size).toBe(0);
    });

    // https://github.com/Netflix/falcor/issues/915
    it("maxRetries option is carried over to cloned Model instance", () => {
        const model = new Model({
            maxRetries: 10
        });
        expect(model._maxRetries).toBe(10);
        const batchingModel = model.batch(100);
        expect(batchingModel._maxRetries).toBe(10);
    });

    it("cloned instance should retain custom type", () => {
        function MyModel() {
            Model.call(this);
        }
        MyModel.prototype = new Model();
        MyModel.prototype.constructor = MyModel;
        const model = new MyModel();
        expect(model).toBeInstanceOf(MyModel);
        const clonedModel = model.batch(100);
        expect(clonedModel).toBeInstanceOf(MyModel);
    });

    describe("algorithm options", () => {
        it("accepts boolean to disable algorithms", () => {
            let model = new Model({ disablePathCollapse: true });
            expect(model._enablePathCollapse).toBe(false);

            model = new Model({ disableRequestDeduplication: true });
            expect(model._enableRequestDeduplication).toBe(false);

            const values = [false, 0, -1, 1, "no", ""];
            for (let index = 0; index < values.length; index++) {
                model = new Model({ disablePathCollapse: values[index], disableRequestDeduplication: values[index] });
                expect(model._enablePathCollapse).toBe(true);
                expect(model._enableRequestDeduplication).toBe(true);
            }
        });

        it("is enabled by default", () => {
            let model = new Model();
            expect(model._enablePathCollapse).toBe(true);
            expect(model._enableRequestDeduplication).toBe(true);

            model = new Model({});
            expect(model._enablePathCollapse).toBe(true);
            expect(model._enableRequestDeduplication).toBe(true);
        });

        it("is copied on clone", () => {
            const model = new Model({ disablePathCollapse: true, disableRequestDeduplication: true });
            const clone = model._clone();

            expect(clone._enablePathCollapse).toBe(model._enablePathCollapse);
            expect(clone._enableRequestDeduplication).toBe(model._enableRequestDeduplication);
        });
    });
});
