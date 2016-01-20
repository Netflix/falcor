var sinon = require('sinon');
var expect = require('chai').expect;
var ASAPScheduler = require('./../../../lib/schedulers/ASAPScheduler');
var Rx = require('rx');
var Model = require('./../../../lib').Model;

describe('GetRequest', function() {
    require('./GetRequest.batch.spec');
    require('./GetRequest.add.spec');

    it('unsubscribing should cancel DataSource request (sync scheduler).', function() {
        var unsubscribeSpy;
        var subscribeSpy = sinon.spy(function(observerOrOnNext, onError, onCompleted) {
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

            unsubscribeSpy = sinon.spy(function() {
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

        var onNext = sinon.spy();
        var onError = sinon.spy();
        var onCompleted = sinon.spy();

        var subscription = model.get("list[0,1].name").
            subscribe(onNext, onError, onCompleted);

        subscription.dispose();

        if (!subscribeSpy.calledOnce) {
            throw new Error("subscribe not called.");
        }
        if (!unsubscribeSpy.calledOnce) {
            throw new Error("DataSource unsubscribe not called.");
        }

        if (onNext.callCount + onError.callCount + onCompleted.callCount !== 0) {
            throw new Error("onNext, onError, or onCompleted was called.");
        }
    });

    it('unsubscribing should cancel DataSource request (async scheduler, unsubscribed immediate).', function() {
        var subscribeSpy = sinon.spy(function(observerOrOnNext, onError, onCompleted) {
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

        var onNext = sinon.spy();
        var onError = sinon.spy();
        var onCompleted = sinon.spy();

        var subscription = model.get("list[0,1].name").
            subscribe(onNext, onError, onCompleted);

        subscription.dispose();

        if (subscribeSpy.callCount !== 0) {
            throw new Error("subscribe called at least once.");
        }

        if (onNext.callCount + onError.callCount + onCompleted.callCount !== 0) {
            throw new Error("onNext, onError, or onCompleted was called.");
        }
    });

    it('unsubscribing should cancel DataSource request (async scheduler, unsubscribed after subscribe).', function(done) {
        var unsubscribeSpy;
        var subscribeSpy = sinon.spy(function(observerOrOnNext, onError, onCompleted) {
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

            unsubscribeSpy = sinon.spy(function() {
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

        var onNext = sinon.spy();
        var onError = sinon.spy();
        var onCompleted = sinon.spy();

        var subscription = model.get("list[0,1].name").
            subscribe(onNext, onError, onCompleted);

        function waitOrExpect() {
            if (!unsubscribeSpy) {
                setTimeout(waitOrExpect, 0);
                return;
            }
            subscription.dispose();

            if (!subscribeSpy.calledOnce) {
                return done(new Error("subscribe not called."));
            }
            if (!unsubscribeSpy.calledOnce) {
                return done(new Error("DataSource unsubscribe not called."));
            }

            if (onNext.callCount + onError.callCount + onCompleted.callCount !== 0) {
                return done(new Error("onNext, onError, or onCompleted was called."));
            }
            return done();
        }
        waitOrExpect();

    });
});
