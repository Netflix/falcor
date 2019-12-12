const TimeoutScheduler = require("./../../../lib/schedulers/TimeoutScheduler");
const Model = require("./../../../lib").Model;

describe("GetRequest", () => {
    require("./GetRequest.batch.spec");
    require("./GetRequest.add.spec");

    it("unsubscribing should cancel DataSource request (sync scheduler).", () => {
        let unsubscribeSpy;
        const subscribeSpy = jest.fn((observerOrOnNext, onError, onCompleted) => {
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

            unsubscribeSpy = jest.fn(() => {
                clearTimeout(handle);
            });

            return {
                dispose: unsubscribeSpy
            };
        });

        const model = new Model({
            cache: {
                list: {
                    0: { name: "test" }
                }
            },
            source: {
                get() {
                    return {
                        subscribe: subscribeSpy
                    };
                }
            }
        });

        const onNext = jest.fn();
        const onError = jest.fn();
        const onCompleted = jest.fn();

        const subscription = model.get("list[0,1].name").subscribe(onNext, onError, onCompleted);

        subscription.dispose();

        expect(subscribeSpy).toHaveBeenCalledTimes(1);
        expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
        expect(onNext).not.toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
        expect(onCompleted).not.toHaveBeenCalled();
    });

    it("unsubscribing should cancel DataSource request (async scheduler, unsubscribed immediate).", () => {
        const subscribeSpy = jest.fn((observerOrOnNext, onError, onCompleted) => {
            setTimeout(() => {
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

            // No need to have a spy, if subscribe is called, we fail.
            return {
                dispose() {}
            };
        });

        const model = new Model({
            scheduler: new TimeoutScheduler(1),
            cache: {
                list: {
                    0: { name: "test" }
                }
            },
            source: {
                get() {
                    return {
                        subscribe: subscribeSpy
                    };
                }
            }
        });

        const onNext = jest.fn();
        const onError = jest.fn();
        const onCompleted = jest.fn();

        const subscription = model.get("list[0,1].name").subscribe(onNext, onError, onCompleted);

        subscription.dispose();

        expect(subscribeSpy).not.toHaveBeenCalled();
        expect(onNext).not.toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
        expect(onCompleted).not.toHaveBeenCalled();
    });

    it("unsubscribing should cancel DataSource request (async scheduler, unsubscribed after subscribe).", done => {
        let unsubscribeSpy;
        const subscribeSpy = jest.fn((observerOrOnNext, onError, onCompleted) => {
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
            }, 100000);

            unsubscribeSpy = jest.fn(() => {
                clearTimeout(handle);
            });

            return {
                dispose: unsubscribeSpy
            };
        });

        const model = new Model({
            cache: {
                list: {
                    0: { name: "test" }
                }
            },
            source: {
                get() {
                    return {
                        subscribe: subscribeSpy
                    };
                }
            }
        });

        const onNext = jest.fn();
        const onError = jest.fn();
        const onCompleted = jest.fn();

        const subscription = model.get("list[0,1].name").subscribe(onNext, onError, onCompleted);

        function waitOrExpect() {
            if (!unsubscribeSpy) {
                setTimeout(waitOrExpect, 0);
                return;
            }
            subscription.dispose();

            expect(subscribeSpy).toHaveBeenCalledTimes(1);
            expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
            expect(onNext).not.toHaveBeenCalled();
            expect(onError).not.toHaveBeenCalled();
            expect(onCompleted).not.toHaveBeenCalled();

            done();
        }

        waitOrExpect();
    });
});
