var Rx = require("rx");
var _ = require("lodash");
var jsong = require("../../../index");
var Model = jsong.Model;
var expect = require('chai').expect;

var slice = Array.prototype.slice;
var $path = require("../../../lib/values/$path");
var $sentinel = require("../../../lib/values/$sentinel");

function cache() {
    return {
        "grid": { $type: $path, value: ["grids", "grid-1234"] },
        "grids": {
            "grid-1234": {
                "0": { $type: $path, value: ["rows", "row-0"] },
                "1": { $type: $path, value: ["rows", "row-1"] },
            }
        },
        "rows": {
            "row-0": {
                "0": { $type: $path, value: ["movies", "pulp-fiction"] },
                "1": { $type: $path, value: ["movies", "kill-bill-1"] },
                "2": { $type: $path, value: ["movies", "reservior-dogs"] },
            }
        },
        "movies": {
            "pulp-fiction": {
                "movie-id": { $type: $sentinel, value: "pulp-fiction" },
            },
            "kill-bill-1": { $type: $sentinel }
        }
    }
}

describe("Build dense JSON", function() {
    // describe("by getting", function() {
    // });
    describe("by setting", function() {
        describe("a primitive", function() {
            describe("PathValue", function() {
                describe("in one place", function() {
                    it("directly", function() {
                        set_and_verify_path_values(this.test, [{
                            path: ["movies", "pulp-fiction", "title"],
                            value: "Pulp Fiction"
                        }]);
                    });
                    it("through a reference", function() {
                        set_and_verify_path_values(this.test, [{
                            path: ["grid", 0, 0, "title"],
                            value: "Pulp Fiction"
                        }]);
                    });
                    it("through a reference that lands on a sentinel", function() {
                        set_and_verify_path_values(this.test, [{
                            path: ["grid", 0, 1, "title"],
                            value: "Kill Bill: Vol. 1"
                        }]);
                    });
                    it("through a broken reference", function() {
                        set_and_verify_path_values(this.test, [{
                            path: ["grid", 0, 2, "title"],
                            value: "Reservior Dogs"
                        }]);
                    });
                });
                describe("in multiple places", function() {
                    describe("via keyset", function() {
                        it("directly", function() {
                            set_and_verify_path_values(this.test, [{
                                path: ["movies", ["pulp-fiction", "kill-bill-1", "reservior-dogs"], "director"],
                                value: "Quentin Tarantino"
                            }]);
                        });
                        it("through through successful, short-circuit, and broken references", function() {
                            set_and_verify_path_values(this.test, [{
                                path: ["grid", 0, [0, 1, 2], "director"],
                                value: "Quentin Tarantino"
                            }]);
                        });
                    });
                    describe("via range", function() {
                        it("to:2", function() {
                            set_and_verify_path_values(this.test, [{
                                path: ["grid", 0, {to:2}, "director"],
                                value: "Quentin Tarantino"
                            }]);
                        });
                        it("from:1, to:2", function() {
                            set_and_verify_path_values(this.test, [{
                                path: ["grid", 0, {from:1, to:2}, "director"],
                                value: "Quentin Tarantino"
                            }]);
                        });
                        it("length:3", function() {
                            set_and_verify_path_values(this.test, [{
                                path: ["grid", 0, {length:3}, "director"],
                                value: "Quentin Tarantino"
                            }]);
                        });
                        it("from:1, length:2", function() {
                            set_and_verify_path_values(this.test, [{
                                path: ["grid", 0, {from:1, length:2}, "director"],
                                value: "Quentin Tarantino"
                            }]);
                        });
                    });
                });
            });
        });
        describe("a $sentinel", function() {
            describe("PathValue", function() {
                describe("in one place", function() {
                    it("directly", function() {
                        set_and_verify_path_values(this.test, [{
                            path: ["movies", "pulp-fiction", "summary"],
                            value: {
                                $type: $sentinel,
                                value: {
                                    title: "Pulp Fiction",
                                    url: "/movies/id/pulp-fiction"
                                }
                            }
                        }]);
                    });
                    it("through a reference", function() {
                        set_and_verify_path_values(this.test, [{
                            path: ["grid", 0, 0, "summary"],
                            value: {
                                $type: $sentinel,
                                value: {
                                    title: "Pulp Fiction",
                                    url: "/movies/id/pulp-fiction"
                                }
                            }
                        }]);
                    });
                    it("through a reference that lands on a sentinel", function() {
                        set_and_verify_path_values(this.test, [{
                            path: ["grid", 0, 1, "summary"],
                            value: {
                                $type: $sentinel,
                                value: {
                                    title: "Kill Bill: Vol. 1",
                                    url: "/movies/id/kill-bill-1"
                                }
                            }
                        }]);
                    });
                    it("through a broken reference", function() {
                        set_and_verify_path_values(this.test, [{
                            path: ["grid", 0, 2, "summary"],
                            value: {
                                $type: $sentinel,
                                value: {
                                    title: "Reservior Dogs",
                                    url: "/movies/id/reservior-dogs"
                                }
                            }
                        }]);
                    });
                });
                describe("in multiple places", function() {
                    describe("via keyset", function() {
                        it("directly", function() {
                            set_and_verify_path_values(this.test, [{
                                path: ["movies", ["pulp-fiction", "kill-bill-1", "reservior-dogs"], "genres"],
                                value: {
                                    $type: $sentinel,
                                    value: ["Crime", "Drama", "Thriller"]
                                }
                            }]);
                        });
                        it("through through successful, short-circuit, and broken references", function() {
                            set_and_verify_path_values(this.test, [{
                                path: ["grid", 0, [0, 1, 2], "genres"],
                                value: {
                                    $type: $sentinel,
                                    value: ["Crime", "Drama", "Thriller"]
                                }
                            }]);
                        });
                    });
                    describe("via range", function() {
                        it("to:2", function() {
                            set_and_verify_path_values(this.test, [{
                                path: ["grid", 0, {to:2}, "genres"],
                                value: {
                                    $type: $sentinel,
                                    value: ["Crime", "Drama", "Thriller"]
                                }
                            }]);
                        });
                        it("from:1, to:2", function() {
                            set_and_verify_path_values(this.test, [{
                                path: ["grid", 0, {from:1, to:2}, "genres"],
                                value: {
                                    $type: $sentinel,
                                    value: ["Crime", "Drama", "Thriller"]
                                }
                            }]);
                        });
                        it("length:3", function() {
                            set_and_verify_path_values(this.test, [{
                                path: ["grid", 0, {length:3}, "genres"],
                                value: {
                                    $type: $sentinel,
                                    value: ["Crime", "Drama", "Thriller"]
                                }
                            }]);
                        });
                        it("from:1, length:2", function() {
                            set_and_verify_path_values(this.test, [{
                                path: ["grid", 0, {from:1, length:2}, "genres"],
                                value: {
                                    $type: $sentinel,
                                    value: ["Crime", "Drama", "Thriller"]
                                }
                            }]);
                        });
                    });
                });
            });
        });
        describe("a $path", function() {
            describe("PathValue", function() {
                describe("in one place", function() {
                    it("directly", function() {
                        set_and_verify_path_values(this.test, [{
                            path: ["rows", "row-0", "3"],
                            value: {
                                $type: $path,
                                value: ["movies", "django-unchained"]
                            }
                        }]);
                    });
                    it("through a reference", function() {
                        set_and_verify_path_values(this.test, [{
                            path: ["grid", 0, 3],
                            value: {
                                $type: $path,
                                value: ["movies", "django-unchained"]
                            }
                        }]);
                    });
                });
            });
        });
    });
});

function apply(func, context) {
    return function(argslist) {
        return func.apply(context, argslist);
    }
}

function get_paths(pathvalues) {
    return pathvalues.map(function(pv) {
        return pv.path.concat();
    });
}

function get_values(pathvalues) {
    return pathvalues.map(function(pv) {
        return pv.value;
    });
}

function get_seeds(pathvalues) {
    return pathvalues.map(function() {
        return {};
    });
}

function set_and_verify_path_values(test, pathvalues, options) {
    return verify.
        apply(test, set_path_values(pathvalues, options)).
        apply(test, get_paths(pathvalues));
}

function set_path_values(pathvalues, options) {
    var model   = new Model(_.extend({ cache: cache() }, options || {}));
    var seeds   = get_seeds(pathvalues);
    var results = model._setPathSetsAsJSON(model, pathvalues, seeds);
    return [model, results];
}

function verify(model, input) {
    
    var message = this.fullTitle();
    var checks  = [
        check("Values", "values"),
        check("Errors", "errors"),
        check("Requested Paths", "requestedPaths"),
        check("Optimized Paths", "optimizedPaths"),
        check("Requested Missing Paths", "requestedMissingPaths"),
        check("Optimized Missing Paths", "optimizedMissingPaths")
    ];
    
    return function() {
        var paths  = slice.call(arguments);
        var seeds  = get_seeds(paths);
        var output = model._getPathSetsAsJSON(model, paths, seeds);
        return checks.shift().call(this, output);
    };
    
    function check(name, prop) {
        var fn;
        return function(output) {
            debugger;
            expect(input[prop], message + " - " + name).to.deep.equals(output[prop]);
            if(fn = checks.shift()) {
                return fn.call(this, output);
            } else {
                return true;
            }
        };
    }
}
