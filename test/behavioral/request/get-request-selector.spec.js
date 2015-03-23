var jsong = require("../../../index");
var Model = jsong.Model;
var Rx = require("rx");
var LocalDataSource = require("../../data/LocalDataSource");
var UnoDataSource = require("../../data/UnoDataSource");
var Cache = require("../../data/Cache");
var RCache = require("../../data/ReducedCache");
var Expected = require("../../data/expected");
var getTestRunner = require("../../getTestRunner");
var testRunner = require("../../testRunner");
var References = Expected.References;
var Complex = Expected.Complex;
var Values = Expected.Values;
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};

function getDataModel(cache) {
    return testRunner.getModel(new LocalDataSource(Cache()), cache || {});
}

describe("Selector", function() {
    it("should get a value from the dataSource", function(done) {
        debugger;
        var expected = References().simpleReference0;
        var dataModel = getDataModel();
        var obs = dataModel.
            get(["genreList", 0, 0, "summary"], function(vid) {
                expect(vid).to.deep.equals(expected.AsJSON.values[0].json);
            });
        getTestRunner.
            async(obs, dataModel, expected).
            subscribe(noOp, done, done);
    });

    it("should get a complex value from the dataSource", function(done) {
        var expected = Complex().toOnly;
        var dataModel = getDataModel();
        var obs = dataModel.
            get(["genreList", 0, {to:1}, "summary"], function(vids) {
                expect(vids).to.deep.equals(expected.AsJSON.values[0].json);
            });
        getTestRunner.
            async(obs, dataModel, expected).
            subscribe(noOp, done, done);
    });

    it("should get a complex value from the cache and the dataSource", function(done) {
        var expected = Complex().toOnly;
        var dataModel = getDataModel(RCache.MinimalCache());
        var obs = dataModel.
            get(["genreList", 0, {to:1}, "summary"], function(genreList) {
                expect(genreList).to.deep.equals(expected.AsJSON.values[0].json);
            });
        getTestRunner.
            async(obs, dataModel, expected).
            subscribe(noOp, done, done);
    });

    it("should have a multi-argument failure without partially filled results and singular selector arg.", function(done) {
        var expected = References().simpleReference0;
        var dataModel = getDataModel(RCache.MinimalCache(), new UnoDataSource(Cache()));
        var paths = [
            ["genreList", 0, 0, "summary"],
            ["genreList", 1, 0, "summary"],
            ["genreList", 4, 0, "summary"]
        ];
        var obs = dataModel.
            get.apply(dataModel, paths.concat(function(genreList) {
                expect(genreList).to.deep.equals(expected.AsJSON.values[0].json);
            }));
        getTestRunner.
            async(obs, dataModel, expected).
            subscribe(noOp, done, done);
    });

    it("should have a multi-argument failure with fully missing results and 2 selector arguments", function(done) {
        var expected = References().simpleReference0;
        var expected2 = References().simpleReference1;
        var dataModel = getDataModel(RCache.MinimalCache());
        var paths = [
            ["genreList", 0, 0, "summary"],
            ["genreList", 0, 1, "summary"],
            ["genreList", 4, 0, "summary"]
        ];
        var obs = dataModel.
            get.apply(dataModel, paths.concat(function(genreList0, genreList1) {
                expect(genreList0).to.deep.equals(expected.AsJSON.values[0].json);
                expect(genreList1).to.deep.equals(expected2.AsJSON.values[0].json);
            }));
        getTestRunner.
            async(obs, dataModel, expected).
            subscribe(noOp, done, done);
    });

    it("should have a multi-argument failure with partially filled results and 2 selector arguments", function(done) {
        var expected = Complex().toOnly;
        var expected2 = Complex().toOnlyMyList;
        var dataModel = getDataModel(RCache.ReducedCache());
        var paths = [
            ["genreList", 0, {to:1}, "summary"],
            ["genreList", 1, {to:1}, "summary"],
            ["genreList", 4, 0, "summary"]
        ];
        var obs = dataModel.
            get.apply(dataModel, paths.concat(function(genreList0, genreList1) {
                expect(genreList0).to.deep.equals(expected.AsJSON.values[0].json);
                expect(genreList1).to.deep.equals(expected2.AsJSON.values[0].json);
            }));
        getTestRunner.
            async(obs, dataModel, expected).
            subscribe(noOp, done, done);
    });

    it("should have a partially fulfilled json multi-type selector.", function(done) {
        var expected = Complex().toOnly;
        var expected2 = Complex().toOnlyMyList;
        var dataModel = getDataModel(RCache.ReducedCache());
        var paths = [
            {
                genreList: {
                    0: {
                        0: {summary:null},
                        1: {summary:null}
                    }
                }
            },
            ["genreList", 1, {to:1}, "summary"],
            ["genreList", 4, 0, "summary"]
        ];
        var obs = dataModel.
            get.apply(dataModel, paths.concat(function(genreList0, genreList1) {
                expect(genreList0).to.deep.equals(expected.AsJSON.values[0].json);
                expect(genreList1).to.deep.equals(expected2.AsJSON.values[0].json);
            }));
        getTestRunner.
            async(obs, dataModel, expected).
            subscribe(noOp, done, done);
    });
});
