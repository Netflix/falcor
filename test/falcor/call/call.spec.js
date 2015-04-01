var jsong = require("../../../index");
var Model = jsong.Model;
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
                value: ["videos", videoID]
            });
        });

        model.
            call(["lists", "my-list", "add"], [1234], [["summary"]]).
            concat(model.get(["lists", "my-list", 0, "summary"])).
            toArray().
            subscribe(function(videos) {
                testRunner.compare(videos[0], videos[1]);
                done();
            });
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
                            value: ["videos", videoID]
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
            });
    });

    it("executes a local function with call args and maps the result paths through a selector", function(done) {

        var model = getDataModel(new LocalDataSource(Cache()), ReducedCache());

        model.withoutDataSource().setValueSync(["lists", "my-list", "add"], function(videoID) {
            return Rx.Observable.return({
                path: [0],
                value: ["videos", videoID]
            });
        });

        model.
            call(["lists", "my-list", "add"], [1234], [["summary"]], function(paths) {
                return this.getValueSync(paths[0]);
            }).
            concat(model.get(["lists", "my-list", 0, "summary"], function(x) { return x; })).
            toArray().
            subscribe(function(videos) {
                testRunner.compare(videos[0], videos[1]);
                done();
            });
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
                            value: ["videos", videoID]
                        });
                    }
                }, function() { return model; });
            }).
            flatMap(function(model) {
                return model.
                    call(["add"], [1234], [["summary"]], function(paths) {
                        return this.getValueSync(paths[0]);
                    }).
                    concat(model.get([0, "summary"], function(x) { return x; })).
                    toArray();
            }).
            subscribe(function(videos) {
                testRunner.compare(videos[0], videos[1]);
                done();
            });
    });
});
