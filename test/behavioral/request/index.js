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

describe("RequestQueue", function() {
    require("./get-request-selector.spec");
    require("./get-request-AsValues.spec");
    require("./get-request-AsJSONG.spec");
    require("./get-request-AsPathMap.spec");
    require("./get-request-expired.spec");

    describe("Bound", function() {
        it("should get a value from the dataSource when bound to a path and request is leaf node only.", function(done) {
            var expected = References().simpleReference0;
            var dataModel = testRunner.getModel(new LocalDataSource(Cache(), {miss:2}));
            var obs = dataModel.
                bind(["genreList", 0, 0], ["summary"]).
                flatMap(function(dataModel) {
                    return dataModel.get(["summary"]);
                });
            getTestRunner.
                async(obs, dataModel, expected, {
                    onNextExpected: {
                        values: [{
                            json: {
                                summary: expected.AsPathMap.values[0].json.genreList[0][0].summary
                            }
                        }]
                    }
                }).
                subscribe(noOp, done, done);
        });

        it("should get a value from the dataSource when bound to a path.", function(done) {
            var expected = References().simpleReference0;
            var dataModel = testRunner.getModel(new LocalDataSource(Cache(), {miss:2}));
            var obs = dataModel.
                bind(["genreList", 0], [1, "summary"]).
                flatMap(function(dataModel) {
                    return dataModel.get([0, "summary"]);
                });
            getTestRunner.
                async(obs, dataModel, expected, {
                    onNextExpected: {
                        values: [{
                            json: {
                                0: expected.AsPathMap.values[0].json.genreList[0][0]
                            }
                        }]
                    }
                }).
                subscribe(noOp, done, done);
        });
    });
});
