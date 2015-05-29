var jsong = require("../../../index");
var Model = jsong.Model;
var Rx = require("rx");
var LocalDataSource = require("../../data/LocalDataSource");
var Cache = require("../../data/Cache");
var Expected = require("../../data/expected");
var getTestRunner = require("../../getTestRunner");
var testRunner = require("../../testRunner");
var References = Expected.References;
var Complex = Expected.Complex;
var Values = Expected.Values;
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};
describe.only("BindSync", function() {
    it("bound to a path that short-circuits in a branch key position.", function() {
        var dataModel = new Model({cache: {
            genreList: {
                0: {
                    $type: "error",
                    message: "The humans are dead."
                }
            }
        }});

        var throwError = false;
        try {
            dataModel.bindSync(["genreList", 0, 0]);
        } catch (e) {
            throwError = true;
            // testRunner.compare({
            //     message: "The humans are dead."
            // }, e);
        }
        expect(throwError).to.be.ok;
    });

    it("bound to a path that short-circuits in a branch key position.", function() {
        var dataModel = new Model({ cache: {
            genreList: {
                0: "This is a value"
            }
        }});
        dataModel._root.unsafeMode = true;
        expect(dataModel.bindSync(["genreList", 0, 0]), "the bound model should be undefined").to.be.not.ok;
    });
});

