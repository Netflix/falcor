var Rx = require("rx");
var jsong = require("falcor");
var Model = jsong.Model;
var testRunner = require('./testRunner');
var chai = require("chai");
var expect = chai.expect;
var $ref = require('falcor/types/path');
var $error = require('falcor/types/error');
var $atom = require('falcor/types/atom');

describe("Model", function() {

    it("should construct a new Model", function() {
        new Model();
    });

    it('should have access to static helper methods.', function() {
        var ref = ['a', 'b', 'c'];
        var err = {ohhh: 'no!'};

        var out = Model.ref(ref);
        testRunner.compare({$type: $ref, value: ref}, out);

        out = Model.ref('a.b.c');
        testRunner.compare({$type: $ref, value: ref}, out);

        out = Model.error(err);
        testRunner.compare({$type: $error, value: err}, out);

        out = Model.atom(1337);
        testRunner.compare({$type: $atom, value: 1337}, out);
    });

    require('./lru');
    require('./integration');
    require('./hardlink');
    require('./falcor');

    describe('JSON-Graph Specification', function() {
        describe("#get", function() {
            require("./get")();
        });

        describe("#set", function() {
            require("./set")();
        });

        describe("#invalidate", function() {
            require("./invalidate")();
        });
    });
});

