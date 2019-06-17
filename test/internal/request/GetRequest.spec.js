var ASAPScheduler = require('./../../../lib/schedulers/ASAPScheduler');
var Rx = require('rx');
var Model = require('./../../../lib').Model;

describe('GetRequest', function() {
    require('./GetRequest.batch.spec');
    require('./GetRequest.add.spec');

    it('unsubscribing should cancel DataSource request (sync scheduler).', function() {
        var unsubscribeSpy;
        var subscribeSpy = jest.fn(function(observerOrOnNext, onError, onCompleted) {
            var handle = setTimeout(function() {
                var response = {
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
                }
                else {
                    observerOrOnNext.onNext(response);
                    observerOrOnNext.onCompleted();
                }
            });

            unsubscribeSpy = jest.fn(function() {
                clearTimeout(handle);
            });

            return {
                dispose: unsubscribeSpy
            };
        });

        var model = new Model({
            cache: {
                list: {
                    0: { name: "test" }
                }
            },
            source: {
                get: function() {
                    return {
                        subscribe: subscribeSpy
                    }
                }
            }
        });

        var onNext = jest.fn();
        var onError = jest.fn();
        var onCompleted = jest.fn();

        var subscription = model.get("list[0,1].name").
            subscribe(onNext, onError, onCompleted);

        subscription.dispose();

        expect(subscribeSpy).toHaveBeenCalledTimes(1);
        expect(unsubscribeSpy).toHaveBeenCalledTimes(1);
        expect(onNext).not.toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
        expect(onCompleted).not.toHaveBeenCalled();
    });

    it('unsubscribing should cancel DataSource request (async scheduler, unsubscribed immediate).', function() {
        var subscribeSpy = jest.fn(function(observerOrOnNext, onError, onCompleted) {
            var handle = setTimeout(function() {
                var response = {
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
                }
                else {
                    observerOrOnNext.onNext(response);
                    observerOrOnNext.onCompleted();
                }
            });

            // No need to have a spy, if subscribe is called, we fail.
            return {
                dispose: function() {}
            };
        });

        var model = new Model({
            scheduler: new ASAPScheduler(),
            cache: {
                list: {
                    0: { name: "test" }
                }
            },
            source: {
                get: function() {
                    return {
                        subscribe: subscribeSpy
                    }
                }
            }
        });

        var onNext = jest.fn();
        var onError = jest.fn();
        var onCompleted = jest.fn();

        var subscription = model.get("list[0,1].name").
            subscribe(onNext, onError, onCompleted);

        subscription.dispose();

        expect(subscribeSpy).not.toHaveBeenCalled();
        expect(onNext).not.toHaveBeenCalled();
        expect(onError).not.toHaveBeenCalled();
        expect(onCompleted).not.toHaveBeenCalled();
    });

    it('unsubscribing should cancel DataSource request (async scheduler, unsubscribed after subscribe).', function(done) {
        var unsubscribeSpy;
        var subscribeSpy = jest.fn(function(observerOrOnNext, onError, onCompleted) {
            var handle = setTimeout(function() {
                var response = {
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
                }
                else {
                    observerOrOnNext.onNext(response);
                    observerOrOnNext.onCompleted();
                }
            }, 100000);

            unsubscribeSpy = jest.fn(function() {
                clearTimeout(handle);
            });

            return {
                dispose: unsubscribeSpy
            };
        });

        var model = new Model({
            cache: {
                list: {
                    0: { name: "test" }
                }
            },
            source: {
                get: function() {
                    return {
                        subscribe: subscribeSpy
                    }
                }
            }
        });

        var onNext = jest.fn();
        var onError = jest.fn();
        var onCompleted = jest.fn();

        var subscription = model.get("list[0,1].name").
            subscribe(onNext, onError, onCompleted);

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
    
            return done();
        }
        waitOrExpect();

    });
});
