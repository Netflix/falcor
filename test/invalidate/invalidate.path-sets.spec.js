var Rx = require("rx");
var _ = require("lodash");
var falcor = require("./../../lib/");
var Model = falcor.Model;
var expect = require('chai').expect;

var whole_cache = require("../set/support/whole-cache");
var partial_cache = require("../set/support/partial-cache");
var invalidate_and_verify_path_sets = require("./support/invalidate-and-verify-path-sets");

var slice = Array.prototype.slice;
var $path = require("./../../lib/types/ref");
var $atom = require("./../../lib/types/atom");

// Tests each output format.
// execute("JSON values", "Values");
execute("dense JSON", "JSON");
// execute("sparse JSON", "PathMap");
// execute("JSON-Graph", "JSONG");

function execute(output, suffix) {

    describe("Build " + output + " from path sets", function() {
        // set new values
        describe("by invalidating", function() {
            // set a primitive value
            describe("a primitive value", function() {
                describe("in one place", function() {
                    it("directly", function() {
                        invalidate_and_verify_path_sets(this.test, suffix, [["movies", "pulp-fiction", "title"]]);
                    });
                    it("through a reference", function() {
                        invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, 0, "title"]]);
                    });
                    it("through a reference that lands on a atom", function() {
                        invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, 1, "title"]]);
                    });
                    it("through a broken reference", function() {
                        invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, 2, "title"]]);
                    });
                    it("through a reference with a null last key", function() {
                        invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, 2, null]]);
                    });
                });
                describe("in multiple places", function() {
                    describe("via keyset", function() {
                        it("directly", function() {
                            invalidate_and_verify_path_sets(this.test, suffix, [["movies", ["pulp-fiction", "kill-bill-1", "reservior-dogs"], "director"]]);
                        });
                        it("through successful, short-circuit, and broken references", function() {
                            invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, [0, 1, 2], "director"]]);
                        });
                    });
                    describe("via range", function() {
                        it("to:2", function() {
                            invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, {to:2}, "director"]]);
                        });
                        it("from:1, to:2", function() {
                            invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, {from:1, to:2}, "director"]]);
                        });
                        it("length:3", function() {
                            invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, {length:3}, "director"]]);
                        });
                        it("from:1, length:2", function() {
                            invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, {from:1, length:2}, "director"]]);
                        });
                    });
                });
            });
            // end set primitive value

            // set a atom value
            describe("a $atom", function() {
                describe("in one place", function() {
                    it("directly", function() {
                        invalidate_and_verify_path_sets(this.test, suffix, [["movies", "pulp-fiction", "summary"]]);
                    });
                    it("through a reference", function() {
                        invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, 0, "summary"]]);
                    });
                    it("through a reference that lands on a atom", function() {
                        invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, 1, "summary"]]);
                    });
                    it("through a broken reference", function() {
                        invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, 2, "summary"]]);
                    });
                    it("through a reference with a null last key", function() {
                        invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, 2, null]]);
                    });
                });
                describe("in multiple places", function() {
                    describe("via keyset", function() {
                        it("directly", function() {
                            invalidate_and_verify_path_sets(this.test, suffix, [["movies", ["pulp-fiction", "kill-bill-1", "reservior-dogs"], "genres"]]);
                        });
                        it("through successful, short-circuit, and broken references", function() {
                            invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, [0, 1, 2], "genres"]]);
                        });
                    });
                    describe("via range", function() {
                        it("to:2", function() {
                            invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, {to:2}, "genres"]]);
                        });
                        it("from:1, to:2", function() {
                            invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, {from:1, to:2}, "genres"]]);
                        });
                        it("length:3", function() {
                            invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, {length:3}, "genres"]]);
                        });
                        it("from:1, length:2", function() {
                            invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, {from:1, length:2}, "genres"]]);
                        });
                    });
                });
            });
            // end set atom value

            // set a path value
            describe("a $path", function() {
                describe("in one place", function() {
                    it("directly", function() {
                        invalidate_and_verify_path_sets(this.test, suffix, [["rows", "row-0", "3"]]);
                    });
                    it("through a reference", function() {
                        invalidate_and_verify_path_sets(this.test, suffix, [["grid", 0, 3]]);
                    });
                });
            });
            // end set path value

            // set multiple mixed-type json values
            describe("multiple mixed paths and values as", function() {
                it("directly", function() {
                    invalidate_and_verify_path_sets(this.test, suffix, [
                        ["movies", "pulp-fiction", "title"],
                        ["movies", ["pulp-fiction", "kill-bill-1", "reservior-dogs"], "director"],
                        ["movies", "pulp-fiction", "summary"],
                        ["movies", ["pulp-fiction", "kill-bill-1", "reservior-dogs"], "genres"],
                        ["rows", "row-0", "3"]
                    ]);
                });

                it("through references", function() {
                    invalidate_and_verify_path_sets(this.test, suffix, [
                        ["grid", 0, 0, "title"],
                        ["grid", 0, [0, 1, 2], "director"],
                        ["grid", 0, 0, "summary"],
                        ["grid", 0, [0, 1, 2], "genres"],
                        ["grid", 0, 3]
                    ]);
                });
            });
            // end set multiple mixed-type json values

            // ridiculous, but everything should be good if you try to invalidate with nothing but nulls...
            it("nothing, hopefully", function() {
                var model  = new Model({ cache: whole_cache() });
                var seeds  = [{}];
                var seeds2 = [{json: { $type: "atom" }}];
                var seeds3;
                if(suffix == "Values") {
                    seeds2 = [];
                    seeds3 = [];
                    seeds  = function(pv) { seeds3.push(pv); }
                } else if(suffix == "JSONG") {
                    seeds2 = [{jsong: {}, paths: [[null, null, null, null]]}];
                }
                var results = model["_invalidatePathSetsAs" + suffix](model, [[null, null, null, null]], seeds);
                expect(seeds3 || seeds).to.deep.equal(seeds2);
                expect(model._cache).to.be.ok;
            });
        });
        // end invalidating path sets
    });
}

