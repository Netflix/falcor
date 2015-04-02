var Rx = require("rx");
var _ = require("lodash");
var jsong = require("../../index");
var Model = jsong.Model;
var expect = require('chai').expect;

var whole_cache = require("./support/whole-cache");
var partial_cache = require("./support/partial-cache");
var set_envelopes = require("./support/set-envelopes");
var set_and_verify_json_graph = require("./support/set-and-verify-json-graph");

var slice = Array.prototype.slice;
var $path = require("../../lib/types/$path");
var $sentinel = require("../../lib/types/$sentinel");

// Tests each output format.
execute("json values", "Values");
execute("dense JSON", "JSON");
execute("sparse JSON", "PathMap");
execute("JSON-Graph", "JSONG");

function execute(output, suffix) {
    describe("Build " + output + " from JSON-Graph Envelopes", function() {
        // set new values
        describe("by setting", function() {
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
                        }]);
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
                        }]);
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
                        }]);
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
                        }]);
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
                        }]);
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
                            }]);
                        });
                        it("through through successful, short-circuit, and broken references", function() {
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
                            }]);
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
                            }]);
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
                            }]);
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
                            }]);
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
                        }]);
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
                        }]);
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
                        }]);
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
                        }]);
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
                        }]);
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
                            }]);
                        });
                        it("through through successful, short-circuit, and broken references", function() {
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
                            }]);
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
                            }]);
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
                            }]);
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
                            }]);
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
                        set_and_verify_json_graph(this.test, suffix, [{
                            paths: [["rows", "row-0", "3"]],
                            jsong: {
                                "rows": {
                                    "row-0": {
                                        "3": { $type: $path, value: ["movies", "django-unchained"] }
                                    }
                                }
                            }
                        }]);
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
                        }]);
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
                    }]);
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
                    }]);
                });
            });
            // end set multiple mixed-type json values
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
                    }]);
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
                    }]);
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
                    }]);
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
                    }]);
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
                    }]);
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
                            grid: { "$type": "path", value: ["grids", "grid-1234"], "$size": 52 },
                            grids: {
                                "grid-1234": {
                                    "1": { "$type": "path", value: ["rows", "row-1"], "$size": 52 }
                                }
                            },
                            rows: {
                                "row-1": {
                                    "0": { "$type": "path", value: ["movies", "django-unchained"], "$size": 52 }
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
            
            // Michael TODO: get as dense JSON creating more branch nodes than it should
            // see: ./merge-expected-dense-json.js
            xdescribe("a complete cache into an existing partial cache with hard references", function() {
                it("directly", function() {
                    
                    // Initialize a new model.
                    var model = new Model({ cache: partial_cache() });
                    
                    // Get an initial path to build hard references.
                    model._getPathSetsAsJSON(model, [
                        ["grid", {to: 1}, 0, "movie-id"],
                        ["grid", {to: 1}, 1, null]
                    ], []);
                    
                    // debugger;
                    
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
                    var model = new Model({ cache: partial_cache() });
                    
                    // Get an initial path to build hard references.
                    model._getPathSetsAsJSON(model, [
                        ["grid", {to: 1}, 0, "movie-id"],
                        ["grid", {to: 1}, 1, null]
                    ], []);
                    
                    // debugger;
                    
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

