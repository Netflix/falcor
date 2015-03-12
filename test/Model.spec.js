var Rx = require("rx");
var jsong = require("../bin/Falcor");
var chai = require("chai");
var expect = chai.expect;

describe("Model", function() {
    it("should construct a new Model", function() {
        new jsong.Model();
    });
    // require("./request/RequestQueue.spec");
    // require("./schedulers/schedulers.spec");

    describe("#get", function() {
        require("./get/get.spec");
    });
    
    describe("#set", function() {
        require("./set/set.spec");
        // require('./set/edge-cases.spec');
    });

    // describe("#call", function() {
    //     require("./call/call.spec");
    // });

    describe("--behavioral", function() {
        require("./behavioral")
    });
});

