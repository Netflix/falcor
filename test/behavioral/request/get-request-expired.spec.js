var jsong = require("../../../bin/Falcor");
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
var getDataModel = testRunner.getModel;


describe("Expired", function() {
    var ExpiredCache = function() {
        return {
            lolomo: ["lolomos", 1234],
            lolomos: {
                1234: {
                    $type: "error",
                    expired: true
                }
            }
        };
    };
    var NewCache = function() {
        return {
            lolomo: ["lolomos", 5678],
            lolomos: {
                5678: {
                    0: ["lists", "abc"]
                }
            },
            lists: {
                abc: {
                    0: {
                        name: "Running Man"
                    }
                }
            }
        };
    };
    it("should verify that the server response is retried to the dataSource.", function(done) {
        var calls = -1;
        var dataSource = new LocalDataSource(ExpiredCache(), {
            onGet: function(source, paths) {
                calls++;
                if (calls) {
                    source.setModel(NewCache());
                    testRunner.compare(["lolomo", 0, 0, "name"], paths[0]);
                } else {
                    testRunner.compare(["lolomos", 1234, 0, 0, "name"], paths[0]);
                }
            }
        });
        
        // starts with empty cache.
        var model = getDataModel(dataSource, {
            lolomo: ["lolomos", 1234]
        });

        model.
            get(["lolomo", 0, 0, "name"]).
            toPathValues().
            subscribe(function(x) {
                expect(x).to.deep.equals({
                    path: ["lolomo", 0, 0, "name"],
                    value: "Running Man"
                });
            }, done, function() {
                expect(calls).to.equal(1);
                done();
            });
    });
});

