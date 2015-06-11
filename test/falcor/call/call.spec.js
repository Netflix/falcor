var falcor = require("falcor");
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

/**
 * @param newModel
 * @returns {Model}
 */
function getModel(newModel, cache) {
    return newModel ? testRunner.getModel(null, cache || {}) : model;
}

describe("Call", function() {
    it("executes a local function with the call args", function(done) {

        var model = getDataModel(new LocalDataSource(Cache()), ReducedCache());

        model.withoutDataSource().setValueSync(["lists", "my-list", "add"], function(videoID) {
            return Rx.Observable.return({
                path: [0],
                value: $ref(["videos", videoID])
            });
        });

        model.
            call(["lists", "my-list", "add"], [1234], [["summary"]]).
            concat(model.get(["lists", "my-list", 0, "summary"])).
            toArray().
            subscribe(function(videos) {
                testRunner.compare(videos[0], videos[1]);
                done();
            }, done);
    });

    it("executes a local function with call args on a bound Model", function(done) {
        
        var model = getDataModel(new LocalDataSource(Cache()), ReducedCache());

        model
            .bind(["lists", "my-list"], ["0"])
            .flatMap(function(model) {
                return model.withoutDataSource().set({
                    path: ["add"],
                    value: function(videoID) {
                        return Rx.Observable.return({
                            path: [0],
                            value: $ref(["videos", videoID])
                        });
                    }
                }, function() { return model; });
            }).
            flatMap(function(model) {
                return model.
                    call(["add"], [1234], [["summary"]]).
                    concat(model.get([0, "summary"])).
                    toArray();
            }).
            subscribe(function(videos) {
                testRunner.compare(videos[0], videos[1]);
                done();
            }, done);
    });

    it("executes a local function with call args and maps the result paths through a selector", function(done) {

        var model = getDataModel(new LocalDataSource(Cache()), ReducedCache());

        model.withoutDataSource().setValueSync(["lists", "my-list", "add"], function(videoID) {
            return Rx.Observable.return({
                path: [0],
                value: $ref(["videos", videoID])
            });
        });

        model.
            call(["lists", "my-list", "add"], [1234], [["summary"]], function(paths) {
                return this.getValueSync(paths[0]);
            }).
            concat(model.getValue(["lists", "my-list", 0, "summary"])).
            toArray().
            subscribe(function(videos) {
                testRunner.compare(videos[0], videos[1]);
                done();
            }, done);
    });

    it("executes a local function with call args on a bound Model and maps the result paths through a selector", function(done) {

        var model = getDataModel(new LocalDataSource(Cache()), ReducedCache());

        model
            .bind(["lists", "my-list"], ["0"])
            .flatMap(function(model) {
                return model.withoutDataSource().set({
                    path: ["add"],
                    value: function(videoID) {
                        return Rx.Observable.return({
                            path: [0],
                            value: $ref(["videos", videoID])
                        });
                    }
                }, function() { return model; });
            })
            .flatMap(function(model) {
                return model.
                    call(["add"], [1234], [["summary"]], function(paths) {
                        return this.getValueSync(paths[0]);
                    }).
                    concat(model.getValue([0, "summary"])).
                    toArray();
            })
            .subscribe(function(videos) {
                testRunner.compare(videos[0], videos[1]);
                done();
            }, done);
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
                            .flatMap(this.set({ path: [7], value: listRef }).toPathValues())
                            .concat(Rx.Observable["return"]({ path: [], invalidated: true }));
                    }
                }
            },
            listsById: { 29: { name: "Horror" } }
        }});

        model.
            call("lolomo.add", [{ $type: "ref", value: ["listsById", 29] }], ["name"], ["length"]).
            toJSONG().
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
                jsong: {
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
