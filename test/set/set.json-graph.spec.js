var Rx = require("rx");
var _ = require("lodash");
var jsong = require("../../index");
var Model = jsong.Model;
var expect = require('chai').expect;

var whole_cache = require("./support/whole-cache");
var partial_cache = require("./support/partial-cache");
var get_pathsets = require("./support/get-pathsets");
var set_envelopes = require("./support/set-envelopes");
var set_and_verify_json_graph = require("./support/set-and-verify-json-graph");

var slice = Array.prototype.slice;
var $path = require("../../lib/types/path");
var $sentinel = require("../../lib/types/sentinel");

var modes = [{
        
    }, {
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
modes.forEach(function(opts) {
    // Tests each output format.
    execute("JSON values", "Values");
    execute("dense JSON", "JSON");
    execute("sparse JSON", "PathMap");
    execute("JSON-Graph", "JSONG");
});

function execute(output, suffix, opts) {
    describe("Build " + output + " from JSON-Graph Envelopes", function() {
        // set new values
        describe("by setting", function() {
            // Michael TODO: make sure get is returning the same output as set
            xit("nothing, hopefully", function() {
                set_and_verify_json_graph(this.test, suffix, [{
                    paths: [[null, null, null, null], [null, null, null, null]],
                    jsong: {}
                }], opts);
            });
            // set a primitive value
            describe("a primitive value", function() {
                describe("in one place", function() {
                    it("directly", function() {
                        set_and_verify_json_graph(this.test, suffix, [{
                            paths: [["movies", "pulp-fiction", "title"]],
                            jsong: {
                                "movies": {
                                    "pulp-fiction": {
                                        "title": "Pulp Fiction"
                                    }
                                }
                            }
                        }], opts);
                    });
                    it("directly on a bound model", function() {
                        set_and_verify_json_graph(this.test, suffix, [{
                            paths: [["movies", "pulp-fiction", "title"]],
                            jsong: {
                                "movies": {
                                    "pulp-fiction": {
                                        "title": "Pulp Fiction"
                                    }
                                }
                            }
                        }], {
                            model: new Model(_.extend({
                                cache: partial_cache()
                            }, opts)).clone(["_path", ["movies"]])
                        });
                    });
                    it("through a reference", function() {
                        set_and_verify_json_graph(this.test, suffix, [{
                            paths: [["grid", 0, 0, "title"]],
                            value: {
                                "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                "grids": {
                                    "grid-1234": {
                                        "0": { $type: $path, value: ["rows", "row-0"] }
                                    }
                                },
                                "rows": {
                                    "row-0": {
                                        "0": { $type: $path, value: ["movies", "pulp-fiction"] }
                                    }
                                },
                                "movies": {
                                    "pulp-fiction": {
                                        "title": "Pulp Fiction"
                                    }
                                }
                            }
                        }], opts);
                    });
                    it("through a reference that lands on a sentinel", function() {
                        set_and_verify_json_graph(this.test, suffix, [{
                            paths: [["grid", 0, 1, "title"]],
                            values: {
                                "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                "grids": {
                                    "grid-1234": {
                                        "0": { $type: $path, value: ["rows", "row-0"] }
                                    }
                                },
                                "rows": {
                                    "row-0": {
                                        "1": { $type: $path, value: ["movies", "kill-bill-1"] }
                                    }
                                },
                                "movies": {
                                    "kill-bill-1": {
                                        "title": "Kill Bill: Vol. 1"
                                    }
                                }
                            }
                        }], opts);
                    });
                    it("through a broken reference", function() {
                        set_and_verify_json_graph(this.test, suffix, [{
                            paths: [["grid", 0, 2, "title"]],
                            jsong: {
                                "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                "grids": {
                                    "grid-1234": {
                                        "0": { $type: $path, value: ["rows", "row-0"] }
                                    }
                                },
                                "rows": {
                                    "row-0": {
                                        "2": { $type: $path, value: ["movies", "reservior-dogs"] }
                                    }
                                },
                                "movies": {
                                    "reservior-dogs": {
                                        "title": "Reservior Dogs"
                                    }
                                }
                            }
                        }], opts);
                    });
                    it("through a reference with a null last key", function() {
                        set_and_verify_json_graph(this.test, suffix, [{
                            paths: [["grid", 0, 2, null]],
                            jsong: {
                                "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                "grids": {
                                    "grid-1234": {
                                        "0": { $type: $path, value: ["rows", "row-0"] }
                                    }
                                },
                                "rows": {
                                    "row-0": {
                                        "2": { $type: $path, value: ["movies", "reservior-dogs"] }
                                    }
                                },
                                "movies": {
                                    "reservior-dogs": "Reservior Dogs"
                                }
                            }
                        }], opts);
                    });
                });
                describe("in multiple places", function() {
                    describe("via keyset", function() {
                        it("directly", function() {
                            set_and_verify_json_graph(this.test, suffix, [{
                                paths: [["movies", ["pulp-fiction", "kill-bill-1", "reservior-dogs"], "director"]],
                                jsong: {
                                    "movies": {
                                        "pulp-fiction": {
                                            "director": "Quentin Tarantino"
                                        },
                                        "kill-bill-1": {
                                            "director": "Quentin Tarantino"
                                        },
                                        "reservior-dogs": {
                                            "director": "Quentin Tarantino"
                                        }
                                    }
                                }
                            }], opts);
                        });
                        it("through successful, short-circuit, and broken references", function() {
                            set_and_verify_json_graph(this.test, suffix, [{
                                paths: [["grid", 0, [0, 1, 2], "director"]],
                                jsong: {
                                    "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                    "grids": {
                                        "grid-1234": {
                                            "0": { $type: $path, value: ["rows", "row-0"] }
                                        }
                                    },
                                    "rows": {
                                        "row-0": {
                                            "0": { $type: $path, value: ["movies", "pulp-fiction"] },
                                            "1": { $type: $path, value: ["movies", "kill-bill-1"] },
                                            "2": { $type: $path, value: ["movies", "reservior-dogs"] }
                                        }
                                    },
                                    "movies": {
                                        "pulp-fiction": {
                                            "director": "Quentin Tarantino"
                                        },
                                        "kill-bill-1": {
                                            "director": "Quentin Tarantino"
                                        },
                                        "reservior-dogs": {
                                            "director": "Quentin Tarantino"
                                        }
                                    }
                                }
                            }], opts);
                        });
                        it("through successful, short-circuit, and broken references on a bound model", function() {
                            set_and_verify_json_graph(this.test, suffix, [{
                                paths: [["grid", 0, [0, 1, 2], "director"]],
                                jsong: {
                                    "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                    "grids": {
                                        "grid-1234": {
                                            "0": { $type: $path, value: ["rows", "row-0"] }
                                        }
                                    },
                                    "rows": {
                                        "row-0": {
                                            "0": { $type: $path, value: ["movies", "pulp-fiction"] },
                                            "1": { $type: $path, value: ["movies", "kill-bill-1"] },
                                            "2": { $type: $path, value: ["movies", "reservior-dogs"] }
                                        }
                                    },
                                    "movies": {
                                        "pulp-fiction": {
                                            "director": "Quentin Tarantino"
                                        },
                                        "kill-bill-1": {
                                            "director": "Quentin Tarantino"
                                        },
                                        "reservior-dogs": {
                                            "director": "Quentin Tarantino"
                                        }
                                    }
                                }
                            }], {
                                model: new Model(_.extend({
                                    cache: partial_cache()
                                }, opts)).clone(["_path", ["grid", 0]])
                            });
                        });
                    });
                    describe("via range", function() {
                        it("to:2", function() {
                            set_and_verify_json_graph(this.test, suffix, [{
                                paths: [["grid", 0, {to:2}, "director"]],
                                jsong: {
                                    "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                    "grids": {
                                        "grid-1234": {
                                            "0": { $type: $path, value: ["rows", "row-0"] }
                                        }
                                    },
                                    "rows": {
                                        "row-0": {
                                            "0": { $type: $path, value: ["movies", "pulp-fiction"] },
                                            "1": { $type: $path, value: ["movies", "kill-bill-1"] },
                                            "2": { $type: $path, value: ["movies", "reservior-dogs"] }
                                        }
                                    },
                                    "movies": {
                                        "pulp-fiction": {
                                            "director": "Quentin Tarantino"
                                        },
                                        "kill-bill-1": {
                                            "director": "Quentin Tarantino"
                                        },
                                        "reservior-dogs": {
                                            "director": "Quentin Tarantino"
                                        }
                                    }
                                }
                            }], opts);
                        });
                        it("from:1, to:2", function() {
                            set_and_verify_json_graph(this.test, suffix, [{
                                paths: [["grid", 0, {from:1, to:2}, "director"]],
                                jsong: {
                                    "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                    "grids": {
                                        "grid-1234": {
                                            "0": { $type: $path, value: ["rows", "row-0"] }
                                        }
                                    },
                                    "rows": {
                                        "row-0": {
                                            "1": { $type: $path, value: ["movies", "kill-bill-1"] },
                                            "2": { $type: $path, value: ["movies", "reservior-dogs"] }
                                        }
                                    },
                                    "movies": {
                                        "kill-bill-1": {
                                            "director": "Quentin Tarantino"
                                        },
                                        "reservior-dogs": {
                                            "director": "Quentin Tarantino"
                                        }
                                    }
                                }
                            }], opts);
                        });
                        it("length:3", function() {
                            set_and_verify_json_graph(this.test, suffix, [{
                                paths: [["grid", 0, {length:3}, "director"]],
                                jsong: {
                                    "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                    "grids": {
                                        "grid-1234": {
                                            "0": { $type: $path, value: ["rows", "row-0"] }
                                        }
                                    },
                                    "rows": {
                                        "row-0": {
                                            "0": { $type: $path, value: ["movies", "pulp-fiction"] },
                                            "1": { $type: $path, value: ["movies", "kill-bill-1"] },
                                            "2": { $type: $path, value: ["movies", "reservior-dogs"] }
                                        }
                                    },
                                    "movies": {
                                        "pulp-fiction": {
                                            "director": "Quentin Tarantino"
                                        },
                                        "kill-bill-1": {
                                            "director": "Quentin Tarantino"
                                        },
                                        "reservior-dogs": {
                                            "director": "Quentin Tarantino"
                                        }
                                    }
                                }
                            }], opts);
                        });
                        it("from:1, length:2", function() {
                            set_and_verify_json_graph(this.test, suffix, [{
                                paths: [["grid", 0, {from:1, length:2}, "director"]],
                                jsong: {
                                    "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                    "grids": {
                                        "grid-1234": {
                                            "0": { $type: $path, value: ["rows", "row-0"] }
                                        }
                                    },
                                    "rows": {
                                        "row-0": {
                                            "1": { $type: $path, value: ["movies", "kill-bill-1"] },
                                            "2": { $type: $path, value: ["movies", "reservior-dogs"] }
                                        }
                                    },
                                    "movies": {
                                        "kill-bill-1": {
                                            "director": "Quentin Tarantino"
                                        },
                                        "reservior-dogs": {
                                            "director": "Quentin Tarantino"
                                        }
                                    }
                                }
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
                        set_and_verify_json_graph(this.test, suffix, [{
                            paths: [["movies", "pulp-fiction", "summary"]],
                            jsong: {
                                "movies": {
                                    "pulp-fiction": {
                                        "summary": {
                                            $type: $sentinel,
                                            value: {
                                                title: "Pulp Fiction",
                                                url: "/movies/id/pulp-fiction"
                                            }
                                        }
                                    }
                                }
                            }
                        }], opts);
                    });
                    it("through a reference", function() {
                        set_and_verify_json_graph(this.test, suffix, [{
                            paths: [["grid", 0, 0, "summary"]],
                            jsong: {
                                "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                "grids": {
                                    "grid-1234": {
                                        "0": { $type: $path, value: ["rows", "row-0"] }
                                    }
                                },
                                "rows": {
                                    "row-0": {
                                        "0": { $type: $path, value: ["movies", "pulp-fiction"] }
                                    }
                                },
                                "movies": {
                                    "pulp-fiction": {
                                        "summary": {
                                            $type: $sentinel,
                                            value: {
                                                title: "Pulp Fiction",
                                                url: "/movies/id/pulp-fiction"
                                            }
                                        }
                                    }
                                }
                            }
                        }], opts);
                    });
                    it("through a reference that lands on a sentinel", function() {
                        set_and_verify_json_graph(this.test, suffix, [{
                            paths: [["grid", 0, 1, "summary"]],
                            jsong: {
                                "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                "grids": {
                                    "grid-1234": {
                                        "0": { $type: $path, value: ["rows", "row-0"] }
                                    }
                                },
                                "rows": {
                                    "row-0": {
                                        "1": { $type: $path, value: ["movies", "kill-bill-1"] }
                                    }
                                },
                                "movies": {
                                    "kill-bill-1": {
                                        "summary": {
                                            $type: $sentinel,
                                            value: {
                                                title: "Kill Bill: Vol. 1",
                                                url: "/movies/id/kill-bill-1"
                                            }
                                        }
                                    }
                                }
                            }
                        }], opts);
                    });
                    it("through a broken reference", function() {
                        set_and_verify_json_graph(this.test, suffix, [{
                            paths: [["grid", 0, 2, "summary"]],
                            jsong: {
                                "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                "grids": {
                                    "grid-1234": {
                                        "0": { $type: $path, value: ["rows", "row-0"] }
                                    }
                                },
                                "rows": {
                                    "row-0": {
                                        "2": { $type: $path, value: ["movies", "reservior-dogs"] }
                                    }
                                },
                                "movies": {
                                    "reservior-dogs": {
                                        "summary": {
                                            $type: $sentinel,
                                            value: {
                                                title: "Reservior Dogs",
                                                url: "/movies/id/reservior-dogs"
                                            }
                                        }
                                    }
                                }
                            }
                        }], opts);
                    });
                    it("through a reference with a null last key", function() {
                        set_and_verify_json_graph(this.test, suffix, [{
                            paths: [["grid", 0, 2, null]],
                            jsong: {
                                "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                "grids": {
                                    "grid-1234": {
                                        "0": { $type: $path, value: ["rows", "row-0"] }
                                    }
                                },
                                "rows": {
                                    "row-0": {
                                        "2": { $type: $path, value: ["movies", "reservior-dogs"] }
                                    }
                                },
                                "movies": {
                                    "reservior-dogs": {
                                        $type: $sentinel,
                                        value: "Reservior Dogs"
                                    }
                                }
                            }
                        }], opts);
                    });
                });
                describe("in multiple places", function() {
                    describe("via keyset", function() {
                        it("directly", function() {
                            set_and_verify_json_graph(this.test, suffix, [{
                                paths: [["movies", ["pulp-fiction", "kill-bill-1", "reservior-dogs"], "genres"]],
                                jsong: {
                                    "movies": {
                                        "pulp-fiction": {
                                            "genres": {
                                                $type: $sentinel,
                                                value: ["Crime", "Drama", "Thriller"]
                                            }
                                        },
                                        "kill-bill-1": {
                                            "genres": {
                                                $type: $sentinel,
                                                value: ["Crime", "Drama", "Thriller"]
                                            }
                                        },
                                        "reservior-dogs": {
                                            "genres": {
                                                $type: $sentinel,
                                                value: ["Crime", "Drama", "Thriller"]
                                            }
                                        }
                                    }
                                }
                            }], opts);
                        });
                        it("through successful, short-circuit, and broken references", function() {
                            set_and_verify_json_graph(this.test, suffix, [{
                                paths: [["grid", 0, [0, 1, 2], "genres"]],
                                jsong: {
                                    "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                    "grids": {
                                        "grid-1234": {
                                            "0": { $type: $path, value: ["rows", "row-0"] }
                                        }
                                    },
                                    "rows": {
                                        "row-0": {
                                            "0": { $type: $path, value: ["movies", "pulp-fiction"] },
                                            "1": { $type: $path, value: ["movies", "kill-bill-1"] },
                                            "2": { $type: $path, value: ["movies", "reservior-dogs"] }
                                        }
                                    },
                                    "movies": {
                                        "pulp-fiction": {
                                            "genres": {
                                                $type: $sentinel,
                                                value: ["Crime", "Drama", "Thriller"]
                                            }
                                        },
                                        "kill-bill-1": {
                                            "genres": {
                                                $type: $sentinel,
                                                value: ["Crime", "Drama", "Thriller"]
                                            }
                                        },
                                        "reservior-dogs": {
                                            "genres": {
                                                $type: $sentinel,
                                                value: ["Crime", "Drama", "Thriller"]
                                            }
                                        }
                                    }
                                }
                            }], opts);
                        });
                    });
                    describe("via range", function() {
                        it("to:2", function() {
                            set_and_verify_json_graph(this.test, suffix, [{
                                paths: [["grid", 0, {to:2}, "genres"]],
                                jsong: {
                                    "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                    "grids": {
                                        "grid-1234": {
                                            "0": { $type: $path, value: ["rows", "row-0"] }
                                        }
                                    },
                                    "rows": {
                                        "row-0": {
                                            "0": { $type: $path, value: ["movies", "pulp-fiction"] },
                                            "1": { $type: $path, value: ["movies", "kill-bill-1"] },
                                            "2": { $type: $path, value: ["movies", "reservior-dogs"] }
                                        }
                                    },
                                    "movies": {
                                        "pulp-fiction": {
                                            "genres": {
                                                $type: $sentinel,
                                                value: ["Crime", "Drama", "Thriller"]
                                            }
                                        },
                                        "kill-bill-1": {
                                            "genres": {
                                                $type: $sentinel,
                                                value: ["Crime", "Drama", "Thriller"]
                                            }
                                        },
                                        "reservior-dogs": {
                                            "genres": {
                                                $type: $sentinel,
                                                value: ["Crime", "Drama", "Thriller"]
                                            }
                                        }
                                    }
                                }
                            }], opts);
                        });
                        it("from:1, to:2", function() {
                            set_and_verify_json_graph(this.test, suffix, [{
                                paths: [["grid", 0, {from:1, to:2}, "genres"]],
                                jsong: {
                                    "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                    "grids": {
                                        "grid-1234": {
                                            "0": { $type: $path, value: ["rows", "row-0"] }
                                        }
                                    },
                                    "rows": {
                                        "row-0": {
                                            "1": { $type: $path, value: ["movies", "kill-bill-1"] },
                                            "2": { $type: $path, value: ["movies", "reservior-dogs"] }
                                        }
                                    },
                                    "movies": {
                                        "kill-bill-1": {
                                            "genres": {
                                                $type: $sentinel,
                                                value: ["Crime", "Drama", "Thriller"]
                                            }
                                        },
                                        "reservior-dogs": {
                                            "genres": {
                                                $type: $sentinel,
                                                value: ["Crime", "Drama", "Thriller"]
                                            }
                                        }
                                    }
                                }
                            }], opts);
                        });
                        it("length:3", function() {
                            set_and_verify_json_graph(this.test, suffix, [{
                                paths: [["grid", 0, {length:3}, "genres"]],
                                jsong: {
                                    "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                    "grids": {
                                        "grid-1234": {
                                            "0": { $type: $path, value: ["rows", "row-0"] }
                                        }
                                    },
                                    "rows": {
                                        "row-0": {
                                            "0": { $type: $path, value: ["movies", "pulp-fiction"] },
                                            "1": { $type: $path, value: ["movies", "kill-bill-1"] },
                                            "2": { $type: $path, value: ["movies", "reservior-dogs"] }
                                        }
                                    },
                                    "movies": {
                                        "pulp-fiction": {
                                            "genres": {
                                                $type: $sentinel,
                                                value: ["Crime", "Drama", "Thriller"]
                                            }
                                        },
                                        "kill-bill-1": {
                                            "genres": {
                                                $type: $sentinel,
                                                value: ["Crime", "Drama", "Thriller"]
                                            }
                                        },
                                        "reservior-dogs": {
                                            "genres": {
                                                $type: $sentinel,
                                                value: ["Crime", "Drama", "Thriller"]
                                            }
                                        }
                                    }
                                }
                            }], opts);
                        });
                        it("from:1, length:2", function() {
                            set_and_verify_json_graph(this.test, suffix, [{
                                paths: [["grid", 0, {from:1, length:2}, "genres"]],
                                jsong: {
                                    "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                    "grids": {
                                        "grid-1234": {
                                            "0": { $type: $path, value: ["rows", "row-0"] }
                                        }
                                    },
                                    "rows": {
                                        "row-0": {
                                            "1": { $type: $path, value: ["movies", "kill-bill-1"] },
                                            "2": { $type: $path, value: ["movies", "reservior-dogs"] }
                                        }
                                    },
                                    "movies": {
                                        "kill-bill-1": {
                                            "genres": {
                                                $type: $sentinel,
                                                value: ["Crime", "Drama", "Thriller"]
                                            }
                                        },
                                        "reservior-dogs": {
                                            "genres": {
                                                $type: $sentinel,
                                                value: ["Crime", "Drama", "Thriller"]
                                            }
                                        }
                                    }
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
                        set_and_verify_json_graph(this.test, suffix, [{
                            paths: [["rows", "row-0", "3"]],
                            jsong: {
                                "rows": {
                                    "row-0": {
                                        "3": { $type: $path, value: ["movies", "django-unchained"] }
                                    }
                                }
                            }
                        }], opts);
                    });
                    it("through a reference", function() {
                        set_and_verify_json_graph(this.test, suffix, [{
                            paths: [["grid", 0, 3]],
                            jsong: {
                                "grid": { $type: $path, value: ["grids", "grid-1234"] },
                                "grids": {
                                    "grid-1234": {
                                        "0": { $type: $path, value: ["rows", "row-0"] }
                                    }
                                },
                                "rows": {
                                    "row-0": {
                                        "3": { $type: $path, value: ["movies", "django-unchained"] }
                                    }
                                }
                            }
                        }], opts);
                    });
                });
            });
            // end set path value

            // set multiple mixed-type json values
            describe("multiple mixed paths and values as", function() {
                it("directly", function() {
                    set_and_verify_json_graph(this.test, suffix, [{
                        paths: [
                            ["movies", "pulp-fiction", "title"],
                            ["movies", ["pulp-fiction", "kill-bill-1", "reservior-dogs"], "director"],
                            ["movies", "pulp-fiction", "summary"],
                            ["movies", ["pulp-fiction", "kill-bill-1", "reservior-dogs"], "genres"],
                            ["rows", "row-0", "3"]
                        ],
                        jsong: whole_cache()
                    }], opts);
                });
                it("through references", function() {
                    set_and_verify_json_graph(this.test, suffix, [{
                        paths: [
                            ["grid", 0, 0, "title"],
                            ["grid", 0, [0, 1, 2], "director"],
                            ["grid", 0, 0, "summary"],
                            ["grid", 0, [0, 1, 2], "genres"],
                            ["grid", 0, 3]
                        ],
                        jsong: whole_cache()
                    }], opts);
                });
            });
            // end set multiple mixed-type json values

            it("negative expires values to be relative to the current time", function() {

                var model = new Model(_.extend({ cache: partial_cache() }, opts));
                var options = {model: model};
                var start_time = Date.now();

                set_and_verify_json_graph(this.test, suffix, [{
                    paths: [["grid", 2]],
                    jsong: {
                        "grid": { $type: $path, value: ["grids", "grid-1234"] },
                        "grids": {
                            "grid-1234": {
                                "2": {
                                    $type: $path,
                                    value: ["rows", "row-0"],
                                    $expires: -1000
                                }
                            }
                        }
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

                var model = new Model(_.extend({ cache: partial_cache() }, opts));
                var options = {model: model};

                set_and_verify_json_graph(this.test, suffix, [{
                    paths: [["grid", 2]],
                    jsong: {
                        "grid": { $type: $path, value: ["grids", "grid-1234"] },
                        "grids": {
                            "grid-1234": {
                                "2": {
                                    $type: $path,
                                    value: ["rows", "row-0"],
                                    $expires: -50
                                }
                            }
                        }
                    }
                }], options);

                setTimeout(function() {

                    if(suffix === "JSONG") {
                        var results = model["_setJSONGsAs" + suffix](model, [{
                            paths: [["grid", 2, 0, "title"]],
                            jsong: {
                                "rows": {
                                    "row-0": {
                                        "0": { $type: $path, value: ["movies", "pulp-fiction"] }
                                    }
                                },
                                "movies": {
                                    "pulp-fiction": {
                                        "title": "Pulp Fiction"
                                    }
                                }
                            }
                        }], [{}], opts);
                        expect(results).to.deep.equals({
                            values: [{
                                jsong: {
                                    grid: { "$type": $path, value: ["grids", "grid-1234"], "$size": 52 },
                                    grids: {
                                        "grid-1234": {
                                            "2": {}
                                        }
                                    }
                                },
                                paths: []
                            }],
                            errors: [],
                            requestedPaths: [],
                            optimizedPaths: [],
                            requestedMissingPaths: [["grid", 2, 0, "title"]],
                            optimizedMissingPaths: [["grids", "grid-1234", 2, 0, "title"]]
                        });
                    } else {
                        set_and_verify_json_graph(this.test, suffix, [{
                            paths: [["grid", 2, 0, "title"]],
                            jsong: {
                                "rows": {
                                    "row-0": {
                                        "0": { $type: $path, value: ["movies", "pulp-fiction"] }
                                    }
                                },
                                "movies": {
                                    "pulp-fiction": {
                                        "title": "Pulp Fiction"
                                    }
                                }
                            }
                        }], options);
                    }

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

                set_and_verify_json_graph(this.test, suffix, [{
                    paths:  [["grid", "grid-1234", {length: count}]],
                    value: get_cache(0, count)
                }], {model: model});

                set_and_verify_json_graph(this.test, suffix, [{
                    paths:  [["grid", "grid-1234", {from: count, length: count}]],
                    value: get_cache(count, count + count)
                }], {model: model});

                var results = get_pathsets(model, [["grid", "grid-1234", {length: count}]], suffix);
                var requestedMissingPaths = results.requestedMissingPaths;

                expect(requestedMissingPaths.length === count);

                model._collectRatio = 0;

                set_envelopes([{
                    paths: [["grid", "grid-1234", {length: count}]],
                    jsong: get_cache(0, count)
                }], suffix);

                results = get_pathsets(model, [["grid", "grid-1234", {length: count * 2}]], suffix);
                requestedMissingPaths = results.requestedMissingPaths;

                expect(requestedMissingPaths.length === count * 2);

                function get_cache(from, to) {
                    return _.range(from, to).reduce(function(cache, i) {
                        return cache["grid"]["grid-1234"][i] = {
                            $type: $sentinel,
                            $size: $size,
                            value: undefined
                        } && cache;
                    }, {grid:{"grid-1234":{}}});
                }
            });

        });
        // end setting new values

        // replace existing values
        describe("by replacing", function() {
            // replace a sentinel with a primitive
            describe("a $sentinel with a primitive", function() {
                it("directly", function() {
                    set_and_verify_json_graph(this.test, suffix, [{
                        paths: [["movies", "pulp-fiction", "movie-id"]],
                        jsong: {
                            "movies": {
                                "pulp-fiction": {
                                    "movie-id": "pulp-fiction-2"
                                }
                            }
                        }
                    }], opts);
                });
                it("through a reference", function() {
                    set_and_verify_json_graph(this.test, suffix, [{
                        paths: [["grid", 0, 0, "movie-id"]],
                        jsong: {
                            "grid": { $type: $path, value: ["grids", "grid-1234"] },
                            "grids": {
                                "grid-1234": {
                                    "0": { $type: $path, value: ["rows", "row-0"] }
                                }
                            },
                            "rows": {
                                "row-0": {
                                    "0": { $type: $path, value: ["movies", "pulp-fiction"] }
                                }
                            },
                            "movies": {
                                "pulp-fiction": {
                                    "movie-id": "pulp-fiction-2"
                                }
                            }
                        }
                    }], opts);
                });
            });
            // end replacing sentinel with primitive

            // replace a $path with a different $path to make sure we compare
            // the path lengths and keys before overwriting the cache path.
            describe("a $path with a different $path", function() {
                it("directly", function() {
                    set_and_verify_json_graph(this.test, suffix, [{
                        paths: [["rows", "row-0", 0]],
                        jsong: {
                            "rows": {
                                "row-0": {
                                    "0": { $type: $path, value: ["movies", "pulp-fiction-2"] }
                                }
                            }
                        }
                    }], opts);
                });
                it("through a reference", function() {
                    set_and_verify_json_graph(this.test, suffix, [{
                        paths: [["grid", 0, 0]],
                        jsong: {
                            "grid": { $type: $path, value: ["grids", "grid-1234"] },
                            "grids": {
                                "grid-1234": {
                                    "0": { $type: $path, value: ["rows", "row-0"] }
                                }
                            },
                            "rows": {
                                "row-0": {
                                    "0": { $type: $path, value: ["movies", "pulp-fiction-2"] }
                                }
                            }
                        }
                    }], opts);
                });
            });

            // replace a branch with a primitive
            describe("a branch with a primitive", function() {
                it("directly", function() {
                    set_and_verify_json_graph(this.test, suffix, [{
                        paths: [["movies", "pulp-fiction"]],
                        jsong: {
                            "movies": {
                                "pulp-fiction": "oops"
                            }
                        }
                    }], opts);
                });
            });
            // end replacing branches with primitives

            // replace a branch with an error
            describe("a branch with an error", function() {
                it("directly", function() {
                    set_and_verify_json_graph(this.test, suffix, [{
                        paths: [["movies", "pulp-fiction"]],
                        jsong: {
                            "movies": {
                                "pulp-fiction": {
                                    "$type": "error",
                                    "value": { "message": "oops" }
                                }
                            }
                        }
                    }])
                });
            });
            // end replacing branches with errors
        });
        // end replacing things

        // merge new JSON-Graphs into empty or existing JSON-Graphs
        describe("by merging", function() {

            describe("a cache of partial $path values and build the correct missing paths as a JSON-Graph Envelope.", function() {
                it("JSON-Graph Envelope", function() {

                    var expected = [{
                        paths: [],
                        jsong: {
                            grid: { "$type": $path, value: ["grids", "grid-1234"], "$size": 52 },
                            grids: {
                                "grid-1234": {
                                    "1": { "$type": $path, value: ["rows", "row-1"], "$size": 52 }
                                }
                            },
                            rows: {
                                "row-1": {
                                    "0": { "$type": $path, value: ["movies", "django-unchained"], "$size": 52 }
                                }
                            },
                            movies: {
                                "django-unchained": {}
                            }
                        }
                    }];

                    var actual = set_envelopes([{
                        paths: [["grid", 1, 0, "movie-id"]],
                        jsong: {
                            "grid": { $type: $path, value: ["grids", "grid-1234"] },
                            "grids": {
                                "grid-1234": {
                                    "1": { $type: $path, value: ["rows", "row-1"] }
                                }
                            },
                            "rows": {
                                "row-1": {
                                    "0": { $type: $path, value: ["movies", "django-unchained"] }
                                }
                            }
                        }
                    }], "JSONG");

                    expect(actual[1].values).to.deep.equals(expected);
                });
            });

            describe("a complete cache into an existing partial cache with hard references", function() {
                it("directly", function() {

                    // Initialize a new model.
                    var model = new Model(_.extend({cache: partial_cache()}, opts));

                    // Get an initial path to build hard references.
                    model._getPathSetsAsJSON(model, [
                        ["grid", {to: 1}, 0, "movie-id"],
                        ["grid", {to: 1}, 1, null]
                    ], []);

                    // Set in a more complete cache with direct paths only.
                    set_and_verify_json_graph(this.test, suffix, [{
                        paths: [
                            ["rows", "row-0", "3"],
                            ["movies",
                                ["pulp-fiction", "kill-bill-1", "reservior-dogs"],
                                    ["title", "director", "genres", "summary"]
                            ]
                        ],
                        jsong: whole_cache()
                    }], {model: model});
                });

                it("through references", function() {

                    // Initialize a new model.
                    var model = new Model(_.extend({ cache: partial_cache() }, opts));

                    // Get an initial path to build hard references.
                    model._getPathSetsAsJSON(model, [
                        ["grid", {to: 1}, 0, "movie-id"],
                        ["grid", {to: 1}, 1, null]
                    ], []);

                    // Set in a more complete cache through references.
                    set_and_verify_json_graph(this.test, suffix, [{
                        paths: [["grid", {to:1}, {to:3}, ["title", "director", "genres", "summary"]]],
                        jsong: whole_cache()
                    }], {model: model});
                });
            });
        });
    });
}

