var Rx = require("rx");
var _ = require("lodash");
var jsong = require("../../index");
var Model = jsong.Model;
var expect = require('chai').expect;

var whole_cache = require("./support/whole-cache");
var partial_cache = require("./support/partial-cache");

var set_pathvalues = require("./support/set-pathvalues");
var get_pathsets = require("./support/get-pathsets");

var set_and_verify_json_values = require("./support/set-and-verify-json-values");

var slice = Array.prototype.slice;
var $path = require("../../lib/types/path");
var $sentinel = require("../../lib/types/sentinel");

var modes = [{
        boxed: true
    }, {
        boxed: true,
        materialized: true
    }, {
        boxed: true,
        treatErrorsAsValues: true
    }, {
        boxed: true,
        materialized: true,
        treatErrorsAsValues: true
    }, {
        materialized: true,
        treatErrorsAsValues: true
    }, {
        materialized: true
    }, {
        treatErrorsAsValues: true
    }];

// Tests for each mode
modes.forEach(function(opts, i) {
    // Tests each output format.
    execute("JSON values", "Values", opts);
    execute("dense JSON", "JSON", opts);
    execute("sparse JSON", "PathMap", opts);
    execute("JSON-Graph", "JSONG", opts);
});

function execute(output, suffix, opts) {

    describe("Build " + output + " from JSON values", function() {
        // set new values
        describe("by setting", function() {
            // Michael TODO: make sure get is returning the same output as set
            xit("nothing, hopefully", function() {
                set_and_verify_json_values(this.test, suffix, [{
                    path: [null, null, null, null],
                    value: "Shouldn't be in the cache."
                }, {
                    path: [null, null, null, null],
                    value: "Shouldn't be in the cache."
                }], opts);
            });
            // set a primitive value
            describe("a primitive value", function() {
                describe("in one place", function() {
                    it("directly", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["movies", "pulp-fiction", "title"],
                            value: "Pulp Fiction"
                        }], opts);
                    });
                    it("through a reference", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["grid", 0, 0, "title"],
                            value: "Pulp Fiction"
                        }], opts);
                    });
                    it("through a reference that lands on a sentinel", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["grid", 0, 1, "title"],
                            value: "Kill Bill: Vol. 1"
                        }], opts);
                    });
                    it("through a broken reference", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["grid", 0, 2, "title"],
                            value: "Reservior Dogs"
                        }], opts);
                    });
                    it("through a reference with a null last key", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["grid", 0, 2, null],
                            value: "Reservior Dogs"
                        }], opts);
                    });
                });
                describe("in multiple places", function() {
                    describe("via keyset", function() {
                        it("directly", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["movies", ["pulp-fiction", "kill-bill-1", "reservior-dogs"], "director"],
                                value: "Quentin Tarantino"
                            }], opts);
                        });
                        it("through through successful, short-circuit, and broken references", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["grid", 0, [0, 1, 2], "director"],
                                value: "Quentin Tarantino"
                            }], opts);
                        });
                    });
                    describe("via range", function() {
                        it("to:2", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["grid", 0, {to:2}, "director"],
                                value: "Quentin Tarantino"
                            }], opts);
                        });
                        it("from:1, to:2", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["grid", 0, {from:1, to:2}, "director"],
                                value: "Quentin Tarantino"
                            }], opts);
                        });
                        it("length:3", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["grid", 0, {length:3}, "director"],
                                value: "Quentin Tarantino"
                            }], opts);
                        });
                        it("from:1, length:2", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["grid", 0, {from:1, length:2}, "director"],
                                value: "Quentin Tarantino"
                            }], opts);
                        });
                    });
                });
            });
            // end set primitive value

            // set a sentinel value
            describe("a $sentinel", function() {
                describe("in one place", function() {
                    it("directly", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["movies", "pulp-fiction", "summary"],
                            value: {
                                $type: $sentinel,
                                value: {
                                    title: "Pulp Fiction",
                                    url: "/movies/id/pulp-fiction"
                                }
                            }
                        }], opts);
                    });
                    it("through a reference", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["grid", 0, 0, "summary"],
                            value: {
                                $type: $sentinel,
                                value: {
                                    title: "Pulp Fiction",
                                    url: "/movies/id/pulp-fiction"
                                }
                            }
                        }], opts);
                    });
                    it("through a reference that lands on a sentinel", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["grid", 0, 1, "summary"],
                            value: {
                                $type: $sentinel,
                                value: {
                                    title: "Kill Bill: Vol. 1",
                                    url: "/movies/id/kill-bill-1"
                                }
                            }
                        }], opts);
                    });
                    it("through a broken reference", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["grid", 0, 2, "summary"],
                            value: {
                                $type: $sentinel,
                                value: {
                                    title: "Reservior Dogs",
                                    url: "/movies/id/reservior-dogs"
                                }
                            }
                        }], opts);
                    });
                    it("through a reference with a null last key", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["grid", 0, 2, null],
                            value: {
                                $type: $sentinel,
                                value: "Reservior Dogs"
                            }
                        }], opts);
                    });
                });
                describe("in multiple places", function() {
                    describe("via keyset", function() {
                        it("directly", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["movies", ["pulp-fiction", "kill-bill-1", "reservior-dogs"], "genres"],
                                value: {
                                    $type: $sentinel,
                                    value: ["Crime", "Drama", "Thriller"]
                                }
                            }], opts);
                        });
                        it("through through successful, short-circuit, and broken references", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["grid", 0, [0, 1, 2], "genres"],
                                value: {
                                    $type: $sentinel,
                                    value: ["Crime", "Drama", "Thriller"]
                                }
                            }], opts);
                        });
                    });
                    describe("via range", function() {
                        it("to:2", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["grid", 0, {to:2}, "genres"],
                                value: {
                                    $type: $sentinel,
                                    value: ["Crime", "Drama", "Thriller"]
                                }
                            }], opts);
                        });
                        it("from:1, to:2", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["grid", 0, {from:1, to:2}, "genres"],
                                value: {
                                    $type: $sentinel,
                                    value: ["Crime", "Drama", "Thriller"]
                                }
                            }], opts);
                        });
                        it("length:3", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["grid", 0, {length:3}, "genres"],
                                value: {
                                    $type: $sentinel,
                                    value: ["Crime", "Drama", "Thriller"]
                                }
                            }], opts);
                        });
                        it("from:1, length:2", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["grid", 0, {from:1, length:2}, "genres"],
                                value: {
                                    $type: $sentinel,
                                    value: ["Crime", "Drama", "Thriller"]
                                }
                            }], opts);
                        });
                    });
                });
            });
            // end set sentinel value

            // set a path value
            describe("a $path", function() {
                describe("in one place", function() {
                    it("directly", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["rows", "row-0", "3"],
                            value: { $type: $path, value: ["movies", "django-unchained"] }
                        }], opts);
                    });
                    it("through a reference", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["grid", 0, 3],
                            value: { $type: $path, value: ["movies", "django-unchained"] }
                        }], opts);
                    });
                });
            });
            // end set path value

            // set multiple mixed-type json values
            describe("multiple mixed paths and values as", function() {
                it("directly", function() {
                    set_and_verify_json_values(this.test, suffix, [{
                        path: ["movies", "pulp-fiction", "title"],
                        value: "Pulp Fiction"
                    }, {
                        path: ["movies", ["pulp-fiction", "kill-bill-1", "reservior-dogs"], "director"],
                        value: "Quentin Tarantino"
                    }, {
                        path: ["movies", "pulp-fiction", "summary"],
                        value: {
                            $type: $sentinel,
                            value: {
                                title: "Pulp Fiction",
                                url: "/movies/id/pulp-fiction"
                            }
                        }
                    }, {
                        path: ["movies", ["pulp-fiction", "kill-bill-1", "reservior-dogs"], "genres"],
                        value: {
                            $type: $sentinel,
                            value: ["Crime", "Drama", "Thriller"]
                        }
                    }, {
                        path: ["rows", "row-0", "3"],
                        value: { $type: $path, value: ["movies", "django-unchained"] }
                    }], opts);
                });

                it("through references", function() {
                    set_and_verify_json_values(this.test, suffix, [{
                        path: ["grid", 0, 0, "title"],
                        value: "Pulp Fiction"
                    }, {
                        path: ["grid", 0, [0, 1, 2], "director"],
                        value: "Quentin Tarantino"
                    }, {
                        path: ["grid", 0, 0, "summary"],
                        value: {
                            $type: $sentinel,
                            value: {
                                title: "Pulp Fiction",
                                url: "/movies/id/pulp-fiction"
                            }
                        }
                    }, {
                        path: ["grid", 0, [0, 1, 2], "genres"],
                        value: {
                            $type: $sentinel,
                            value: ["Crime", "Drama", "Thriller"]
                        }
                    }, {
                        path: ["grid", 0, 3],
                        value: { $type: $path, value: ["movies", "django-unchained"] }
                    }], opts);
                });
            });
            // end set multiple mixed-type json values

            it("negative expires values to be relative to the current time", function() {

                var model = new Model(_.extend({cache: partial_cache()}, opts));
                var options = {model: model};
                var start_time = Date.now();

                set_and_verify_json_values(this.test, suffix, [{
                    path: ["grid", 2],
                    value: {
                        $type: $path,
                        value: ["rows", "row-0"],
                        $expires: -1000
                    }
                }], options);

                model.boxValues()
                    .get(["grid", 2])
                    .toPathValues()
                    .subscribe(function(pv) {
                        var box = pv.value;
                        var now = Date.now();
                        var elapsed_time = now - start_time;
                        var future_expire_time = box.$expires;
                        var future_time = future_expire_time - now;
                        expect(future_time > elapsed_time);
                    });
            });

            it("past an expired reference", function(done) {

                var model = new Model(_.extend({cache: partial_cache()}, opts));
                var options = {model: model};

                set_and_verify_json_values(this.test, suffix, [{
                    path: ["grid", 2],
                    value: {
                        $type: $path,
                        value: ["rows", "row-0"],
                        $expires: -50
                    }
                }], options);

                setTimeout(function() {

                    set_and_verify_json_values(this.test, suffix, [{
                        path: ["grid", 2, 0, "title"],
                        value: "Pulp Fiction"
                    }], options);

                    done();

                }.bind(this), 100);
            });

            it("enough values to activate cache pruning", function() {

                var count = 25;
                var $size = 50;
                var model = new Model(_.extend({
                    maxSize: (count * $size) + 1,
                    collectRatio: 1
                }, opts)).materialize();

                set_and_verify_json_values(this.test, suffix, [{
                    path:  ["grid", "grid-1234", {length: count}],
                    value: {
                        $type: $sentinel,
                        $size: $size,
                        value: undefined
                    }
                }], {model: model});

                set_and_verify_json_values(this.test, suffix, [{
                    path:  ["grid", "grid-1234", {from: count, length: count}],
                    value: {
                        $type: $sentinel,
                        $size: $size,
                        value: undefined
                    }
                }], {model: model});

                var results = get_pathsets(model, [["grid", "grid-1234", {length: count}]], suffix);
                var requestedMissingPaths = results.requestedMissingPaths;

                expect(requestedMissingPaths.length === count);

                model._collectRatio = 0;

                set_pathvalues([{
                    path:  ["grid", "grid-1234", {length: count}],
                    value: {
                        $type: $sentinel,
                        $size: $size,
                        value: undefined
                    }
                }], suffix, {model: model});

                results = get_pathsets(model, [["grid", "grid-1234", {length: count * 2}]], suffix);
                requestedMissingPaths = results.requestedMissingPaths;

                expect(requestedMissingPaths.length === count * 2);
            });
        });
        // end setting new values

        // replace existing values
        describe("by replacing", function() {
            // replace a sentinel with a primitive
            describe("a $sentinel with a primitive", function() {
                it("directly", function() {
                    set_and_verify_json_values(this.test, suffix, [{
                        path: ["movies", "pulp-fiction", "movie-id"],
                        value: "pulp-fiction-2"
                    }], opts);
                });
                it("through a reference", function() {
                    set_and_verify_json_values(this.test, suffix, [{
                        path: ["grid", 0, 0, "movie-id"],
                        value: "pulp-fiction-2"
                    }], opts);
                });
            });
            // end replacing sentinel with primitive

            // replace a branch with a primitive
            describe("a branch with a primitive", function() {
                it("directly", function() {
                    set_and_verify_json_values(this.test, suffix, [{
                        path: ["movies", "pulp-fiction"],
                        value: "oops"
                    }])
                });
            });
            // end replacing branches with primitives

            // replace a branch with an error
            describe("a branch with an error", function() {
                it("directly", function() {
                    set_and_verify_json_values(this.test, suffix, [{
                        path: ["movies", "pulp-fiction"],
                        value: {
                            "$type": "error",
                            "value": { "message": "oops" }
                        }
                    }])
                });
            });
            // end replacing branches with errors

            describe("a hard-linked path", function() {
                it("directly", function() {
                    var model = new Model(_.extend({cache: whole_cache()}, opts));
                    get_pathsets(model,[["grid", {to:1}, {to:3}, ["movie-id", "title", "director", "genres", "summary"]]], suffix);
                    set_and_verify_json_values(this.test, suffix, [{
                        path: ["rows", "row-0", "3"],
                        value: {
                            $type: $path,
                            value: ["rows", "row-0", "2"]
                        }
                    }], {model: model});
                });
                it("through references", function() {
                    var model = new Model(_.extend({cache: whole_cache()}, opts));
                    get_pathsets(model,[["grid", {to:1}, {to:3}, ["movie-id", "title", "director", "genres", "summary"]]], suffix);
                    set_and_verify_json_values(this.test, suffix, [{
                        path: ["grid", {to:1}, "3"],
                        value: {
                            $type: $path,
                            value: ["rows", "row-0", "2"]
                        }
                    }], {model: model});
                });
            })
        });
    });
}

