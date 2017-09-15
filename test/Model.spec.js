var Rx = require("rx");
var rxjs = require("rxjs");

var falcor = require("./../lib/");
var Model = falcor.Model;

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

var modelGet = Model.prototype.get;
var modelSet = Model.prototype.set;
var modelCall = Model.prototype.call;
var modelPreload = Model.prototype.preload;

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

var testRunner = require('./testRunner');
var chai = require("chai");
var expect = chai.expect;
var $ref = require('./../lib/types/ref');
var $error = require('./../lib/types/error');
var $atom = require('./../lib/types/atom');
global.toObservable = require('./toObs');
var rxjs = require('rxjs');

describe("Model", function() {

    it("should construct a new Model", function() {
        new Model();
    });

    it("should construct a new Model when calling the falcor module function", function() {
        expect(falcor() instanceof falcor.Model).to.equal(true);
    });

    it('should have access to static helper methods.', function() {
        var ref = ['a', 'b', 'c'];
        var err = {ohhh: 'no!'};

        var out = Model.ref(ref);
        testRunner.compare({$type: $ref, value: ref}, out);

        out = Model.ref('a.b.c');
        testRunner.compare({$type: $ref, value: ref}, out);

        out = Model.error(err);
        testRunner.compare({$type: $error, value: err}, out);

        out = Model.atom(1337);
        testRunner.compare({$type: $atom, value: 1337}, out);
    });

    it('unsubscribing should cancel DataSource request.', function(done) {
        var onNextCalled = 0,
            onErrorCalled = 0,
            onCompletedCalled = 0,
            unusubscribeCalled = 0,
            dataSourceGetCalled = 0;

        var model = new Model({
            cache: {
                list: {
                    0: { name: "test" }
                }
            },
            source: {
                get: function() {
                    return {
                        subscribe: function(observerOrOnNext, onError, onCompleted) {
                            dataSourceGetCalled++;
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

                            return {
                                dispose: function() {
                                    unusubscribeCalled++;
                                    clearTimeout(handle);
                                }
                            }
                        }
                    }
                }
            }
        });

        var subscription = model.get("list[0,1].name").
            subscribe(
                function(value) {
                    onNextCalled++;
                },
                function(error) {
                    onErrorCalled++;
                },
                function() {
                    onCompletedCalled++;
                });

        subscription.dispose();

        if (dataSourceGetCalled === 1 && !onNextCalled && unusubscribeCalled === 1 && !onErrorCalled && !onCompletedCalled) {
            done()
        }
        else {
            done(new Error("DataSource unsubscribe not called."));
        }
    });

    it('Supports RxJS 5.', function(done) {
        var onNextCalled = 0,
            onErrorCalled = 0,
            onCompletedCalled = 0,
            unusubscribeCalled = 0,
            dataSourceGetCalled = 0;

        var model = new Model({
            cache: {
                list: {
                    0: { name: "test" }
                }
            },
            source: {
                get: function() {
                    return {
                        subscribe: function(observerOrOnNext, onError, onCompleted) {
                            dataSourceGetCalled++;
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

                            return {
                                dispose: function() {
                                    unusubscribeCalled++;
                                    clearTimeout(handle);
                                }
                            }
                        }
                    }
                }
            }
        });

        var subscription = rxjs.Observable.from(model.get("list[0,1].name")).
            subscribe(
                function(value) {
                    onNextCalled++;
                },
                function(error) {
                    onErrorCalled++;
                },
                function() {
                    onCompletedCalled++;
                });

        subscription.unsubscribe();

        if (dataSourceGetCalled === 1 && !onNextCalled && unusubscribeCalled === 1 && !onErrorCalled && !onCompletedCalled) {
            done()
        }
        else {
            done(new Error("DataSource unsubscribe not called."));
        }
    });

    it('setMaxSize to a lower value forces a collect', function(done) {
        var model = new Model({
            cache: {
                list: {
                    0: { name: "test" }
                }
            }
        });
        var cache = model._root.cache;
        expect(cache['$size']).to.be.greaterThan(0);
        model._setMaxSize(0);
        expect(cache['$size']).to.equal(0);
        done();
    });

    describe('JSON-Graph Specification', function() {
        require('./get-core');

        describe("#set", function() {
            require("./set")();
        });

        describe("#invalidate", function() {
            require("./invalidate")();
        });
    });

    require('./lru');
    require('./hardlink');
    require('./falcor');
    require('./internal');
    require('./response');

});
