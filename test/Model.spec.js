var Rx = require("rx");
var jsong = require("./../index");
var chai = require("chai");
var expect = chai.expect;

describe("Model", function() {

    it("should construct a new Model", function() {
        new jsong.Model();
    });

    //require('./integration');
    //require('./falcor');

    describe('JSON-Graph Specification', function() {
        //describe("#get", function() {
            //require("./get")();
        //});

        describe("#set", function() {
            require("./set")();
        });

        //describe("#invalidate", function() {
            //require("./invalidate")();
        //});
    });
});

