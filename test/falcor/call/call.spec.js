var falcor = require("./../../../lib/");
var Model = falcor.Model;
var $ref = Model.ref;
var Cache = require("../../data/Cache");
var ReducedCache = require("../../data/ReducedCache").ReducedCache;
var LocalDataSource = require("../../data/LocalDataSource");
var Expected = require("../../data/expected");
var Rx = require("rx");
var runGetTests = require("./../../getTestRunner").run;
var testRunner = require("./../../testRunner");
var getDataModel = testRunner.getModel;
var chai = require("chai");
var expect = chai.expect;
var sinon = require('sinon');
var noOp = function() {};
var clean = require('./../../cleanData').clean;
var cacheGenerator = require('./../../CacheGenerator');

/**
 * @param newModel
 * @returns {Model}
 */
function getModel(newModel, cache) {
    return newModel ? testRunner.getModel(null, cache || {}) : model;
}

describe("Call", function() {

    it("executes a remote call on a bound Model and sends the call and extra paths relative to the root", function(done) {
        var model = getDataModel({
            call: function(callPath, args, suffixes, extraPaths) {
                expect(callPath).to.deep.equal(["lists", "add"]);
                expect(extraPaths).to.deep.equal([[0, "summary"]]);
                done();
            }
        }, Cache());
        model
            ._clone({ _path: ["lists"] })
            .call(["add"], [], [], [[0, "summary"]])
            .subscribe(noOp, noOp, noOp);
    })

    it("executes a local function with the call args", function(done) {

        var model = getDataModel(new LocalDataSource(Cache()), ReducedCache());

        model.withoutDataSource()._setValueSync(["lists", "my-list", "add"], function(videoID) {
            return Rx.Observable.return({
                path: [0],
                value: $ref(["videos", videoID])
            });
        });

        model.
            call(["lists", "my-list", "add"], [1234], [["summary"]]).
            subscribe(function(videos) {
                testRunner.compare(videos[0], videos[1]);
                done();
            }, done);
    });

    it("executes a local function with call args on a bound Model", function(done) {

        var model = getDataModel(new LocalDataSource(Cache()), ReducedCache());

        model.
            deref(["lists", "my-list"], ["0"]).
            flatMap(function(model) {
                return model.
                    withoutDataSource().
                    set({
                        path: ["add"],
                        value: function(videoID) {
                            return Rx.Observable.return({
                                path: [0],
                                value: $ref(["videos", videoID])
                            });
                        }
                    }).
                    map(function() { return model; });
            }).
            flatMap(function(model) {
                return model.
                    call(["add"], [1234], [["summary"]]).
                    concat(model.get([0, "summary"])).
                    toArray();
            }).
            doAction(function(videos) {
                testRunner.compare(videos[0], videos[1]);
            }).
            subscribe(noOp, done, done);
    });

    it("executes a local function with call args and maps the result paths through a selector", function(done) {

        var model = getDataModel(new LocalDataSource(Cache()), ReducedCache());
        var onNext = sinon.spy();
        model.withoutDataSource()._setValueSync(["lists", "my-list", "add"], function(videoID) {
            return Rx.Observable.return({
                path: [0],
                value: $ref(["videos", videoID])
            });
        });

        model.
            call(["lists", "my-list", "add"], [1234], [["summary"]]).
            concat(model.getValue(["lists", "my-list", 0, "summary"])).
            last().
            doAction(onNext).
            doAction(noOp, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                testRunner.compare({
                    title: "House of Cards",
                    url: "/movies/1234"
                }, onNext.getCall(0).args[0]);
            }).
            subscribe(noOp, done, done);
    });

    it("executes a local function with call args on a bound Model and maps the result paths through a selector", function(done) {

        var model = getDataModel(new LocalDataSource(Cache()), ReducedCache());
        var onNext = sinon.spy();
        model.
            deref(["lists", "my-list"], ["0"]).
            flatMap(function(model) {
                return model.
                    withoutDataSource().
                    set({
                        path: ["add"],
                        value: function(videoID) {
                            return Rx.Observable.return({
                                path: [0],
                                value: $ref(["videos", videoID])
                            });
                        }
                    }).
                    map(function() { return model; });
            }).
            flatMap(function(model) {
                return model.
                    call(["add"], [1234], [["summary"]]).
                    concat(model.getValue([0, "summary"]))
            }).
            last().
            doAction(onNext).
            doAction(noOp, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                testRunner.compare({
                    title: "House of Cards",
                    url: "/movies/1234"
                }, onNext.getCall(0).args[0]);
            }).
            subscribe(noOp, done, done);
    });

    it("executes a local function with call args on a bound model and emits invalidations relative to the optimized bound path", function(done) {

        // callPath, args, suffix, paths

        // The route info
        var model = new Model({ cache: {
            lolomo: { $type: "ref", value: ["lolomos", 123] },
            lolomos: {
                123: {
                    add: function(listRef) {
                        return this
                            .setValue({ path: ["length"], value: 8})
                            .flatMap(
                                this.set({ path: [7], value: listRef }).
                                    map(function(data) {
                                        return {
                                            path: [7],
                                            value: data.json[7]
                                        };
                                    }))
                            .concat(Rx.Observable["return"]({ path: [], invalidated: true }));
                    }
                }
            },
            listsById: { 29: { name: "Horror" } }
        }});

        model.
            call("lolomo.add", [{ $type: "ref", value: ["listsById", 29] }], ["name"], ["length"]).
            _toJSONG().
            subscribe(function(envelope) {
                var err;
                try {
                    testRunner.compare(getExpectedJSONG(), envelope);
                } catch(e) {
                    err = e;
                } finally {
                    done(err);
                }
            }, done);

        function getExpectedJSONG() {
            // The output json
            return {
                jsonGraph: {
                    lolomo: { $size: "52", $type: "ref", value: ["lolomos", 123] },
                    lolomos: {
                        123: {
                            7: { $size: "52", $type: "ref", value: ["listsById", 29] },
                            "length": 8
                        },
                    },
                    listsById: {
                        29: {
                            "name": "Horror",
                        }
                    }
                },
                paths: [
                    ["lolomo", 7, "name"],
                    ["lolomo", "length"]
                ],
                invalidated: [
                    ["lolomos", 123]
                ]
            };
        }
    });
});
