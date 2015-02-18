var jsong = require("../../bin/Falcor");
var Model = jsong.Model;
var Cache = require("../data/Cache");
var ReducedCache = require("../data/ReducedCache").ReducedCache;
var LocalDataSource = require("../data/LocalDataSource");
var Expected = require("../data/expected");
var Rx = require("rx");
var runGetTests = require("./../getTestRunner").run;
var testRunner = require("./../testRunner");
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
        var model = getDataModel(null, ReducedCache()),
            expected = Expected.Values().direct;
        
        debugger;
        model.setValueSync(["lists", "my-list", "add"], function(videoID) {
            var pbv  = this._getValueSync(this, ["lists", "my-list"]),
                path = pbv.path;
            return this.set({
                path: path.concat(0),
                value: ["videos", videoID]
            }).toJSONG();
        });
        
        model._dataSource = new LocalDataSource(Cache());
        
        model.
            call(["lists", "my-list", "add"], [1234], [["summary"]]).
            flatMap(function(video) {
                return model.get(["lists", "my-list", 0, "summary"]).map(function(video2) {
                    return [video, video2];
                });
            }).
            subscribe(function(videos) {
                testRunner.compare(videos[0], videos[1]);
                done();
            });
    });
});