var Rx = require("rx");
var _ = require("lodash");
var jsong = require("../../index");
var Model = jsong.Model;
var expect = require('chai').expect;

var whole_cache = require("./support/whole-cache");
var partial_cache = require("./support/partial-cache");
var set_and_verify_json_values = require("./support/set-and-verify-json-values");

var slice = Array.prototype.slice;
var $path = require("../../lib/types/$path");
var $sentinel = require("../../lib/types/$sentinel");

// Tests each output format.
execute("JSON values", "Values");
execute("dense JSON", "JSON");
execute("sparse JSON", "PathMap");
execute("JSON-Graph", "JSONG");

function execute(output, suffix) {
    
    describe("Build " + output + " from JSON values", function() {
        // set new values
        describe("by setting", function() {
            // set a primitive value
            describe("a primitive value", function() {
                describe("in one place", function() {
                    it("directly", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["movies", "pulp-fiction", "title"],
                            value: "Pulp Fiction"
                        }]);
                    });
                    it("through a reference", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["grid", 0, 0, "title"],
                            value: "Pulp Fiction"
                        }]);
                    });
                    it("through a reference that lands on a sentinel", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["grid", 0, 1, "title"],
                            value: "Kill Bill: Vol. 1"
                        }]);
                    });
                    it("through a broken reference", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["grid", 0, 2, "title"],
                            value: "Reservior Dogs"
                        }]);
                    });
                    it("through a reference with a null last key", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["grid", 0, 2, null],
                            value: "Reservior Dogs"
                        }]);
                    });
                });
                describe("in multiple places", function() {
                    describe("via keyset", function() {
                        it("directly", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["movies", ["pulp-fiction", "kill-bill-1", "reservior-dogs"], "director"],
                                value: "Quentin Tarantino"
                            }]);
                        });
                        it("through through successful, short-circuit, and broken references", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["grid", 0, [0, 1, 2], "director"],
                                value: "Quentin Tarantino"
                            }]);
                        });
                    });
                    describe("via range", function() {
                        it("to:2", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["grid", 0, {to:2}, "director"],
                                value: "Quentin Tarantino"
                            }]);
                        });
                        it("from:1, to:2", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["grid", 0, {from:1, to:2}, "director"],
                                value: "Quentin Tarantino"
                            }]);
                        });
                        it("length:3", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["grid", 0, {length:3}, "director"],
                                value: "Quentin Tarantino"
                            }]);
                        });
                        it("from:1, length:2", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["grid", 0, {from:1, length:2}, "director"],
                                value: "Quentin Tarantino"
                            }]);
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
                        }]);
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
                        }]);
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
                        }]);
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
                        }]);
                    });
                    it("through a reference with a null last key", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["grid", 0, 2, null],
                            value: {
                                $type: $sentinel,
                                value: "Reservior Dogs"
                            }
                        }]);
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
                            }]);
                        });
                        it("through through successful, short-circuit, and broken references", function() {
                            set_and_verify_json_values(this.test, suffix, [{
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
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["grid", 0, {to:2}, "genres"],
                                value: {
                                    $type: $sentinel,
                                    value: ["Crime", "Drama", "Thriller"]
                                }
                            }]);
                        });
                        it("from:1, to:2", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["grid", 0, {from:1, to:2}, "genres"],
                                value: {
                                    $type: $sentinel,
                                    value: ["Crime", "Drama", "Thriller"]
                                }
                            }]);
                        });
                        it("length:3", function() {
                            set_and_verify_json_values(this.test, suffix, [{
                                path: ["grid", 0, {length:3}, "genres"],
                                value: {
                                    $type: $sentinel,
                                    value: ["Crime", "Drama", "Thriller"]
                                }
                            }]);
                        });
                        it("from:1, length:2", function() {
                            set_and_verify_json_values(this.test, suffix, [{
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
            // end set sentinel value
            
            // set a path value
            describe("a $path", function() {
                describe("in one place", function() {
                    it("directly", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["rows", "row-0", "3"],
                            value: { $type: $path, value: ["movies", "django-unchained"] }
                        }]);
                    });
                    it("through a reference", function() {
                        set_and_verify_json_values(this.test, suffix, [{
                            path: ["grid", 0, 3],
                            value: { $type: $path, value: ["movies", "django-unchained"] }
                        }]);
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
                    }]);
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
                    }]);
                });
            });
            // end set multiple mixed-type json values
            
            it("negative expires values to be relative to the current time", function() {
                
                var model = new Model({ cache: partial_cache() });
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
                
                var model = new Model({ cache: partial_cache() });
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
                    }]);
                });
                it("through a reference", function() {
                    set_and_verify_json_values(this.test, suffix, [{
                        path: ["grid", 0, 0, "movie-id"],
                        value: "pulp-fiction-2"
                    }]);
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
        });
    });
}

