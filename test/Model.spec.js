var Rx = require("rx");
var jsong = require("./../index");
var chai = require("chai");
var expect = chai.expect;

describe("Model", function() {
    it("should construct a new Model", function() {
        new jsong.Model();
    });

    require('./falcor');

    describe('Core', function() {
        describe("#get", function() {
            require("./get");
        });

        describe("#set", function() {
            require("./set");
        });
    });

//    describe("#call", function() {
//        require("./call/call.spec");
//    });

//    describe("#invalidate", function() {
//        require("./invalidate/invalidate.spec");
//    });

//    describe("--behavioral", function() {
//         require("./behavioral")
//    });
});

