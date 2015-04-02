var Rx = require("rx");
var _ = require("lodash");
var jsong = require("../../index");
var Model = jsong.Model;
var expect = require('chai').expect;

var slice = Array.prototype.slice;
var $path = require("../../lib/types/$path");
var $sentinel = require("../../lib/types/$sentinel");

Array.prototype.flatMap = function(selector) {
    return this.reduce(function(xs, x, i, a){
        return xs.concat(selector(x, i, a));
    }, []);
};

// Tests each output format.
execute("json values", "Values");
execute("dense JSON", "JSON");
execute("sparse JSON", "PathMap");
execute("JSON-Graph", "JSONG");

function execute(output, suffix) {

    describe("Build " + output, function() {
        describe("by setting", function() {
            describe("a primitive", function() {
                
                describe("PathValue", function() {
                    describe("in one place", function() {
                        it("directly", function() {
                            set_and_verify_path_values(this.test, suffix, [{
                                path: ["movies", "pulp-fiction", "title"],
                                value: "Pulp Fiction"
                            }]);
                        });
                        it("through a reference", function() {
                            set_and_verify_path_values(this.test, suffix, [{
                                path: ["grid", 0, 0, "title"],
                                value: "Pulp Fiction"
                            }]);
                        });
                        it("through a reference that lands on a sentinel", function() {
                            set_and_verify_path_values(this.test, suffix, [{
                                path: ["grid", 0, 1, "title"],
                                value: "Kill Bill: Vol. 1"
                            }]);
                        });
                        it("through a broken reference", function() {
                            set_and_verify_path_values(this.test, suffix, [{
                                path: ["grid", 0, 2, "title"],
                                value: "Reservior Dogs"
                            }]);
                        });
                        it("through a reference with a null last key", function() {
                            set_and_verify_path_values(this.test, suffix, [{
                                path: ["grid", 0, 2, null],
                                value: "Reservior Dogs"
                            }]);
                        });
                    });
                    describe("in multiple places", function() {
                        describe("via keyset", function() {
                            it("directly", function() {
                                set_and_verify_path_values(this.test, suffix, [{
                                    path: ["movies", ["pulp-fiction", "kill-bill-1", "reservior-dogs"], "director"],
                                    value: "Quentin Tarantino"
                                }]);
                            });
                            it("through through successful, short-circuit, and broken references", function() {
                                set_and_verify_path_values(this.test, suffix, [{
                                    path: ["grid", 0, [0, 1, 2], "director"],
                                    value: "Quentin Tarantino"
                                }]);
                            });
                        });
                        describe("via range", function() {
                            it("to:2", function() {
                                set_and_verify_path_values(this.test, suffix, [{
                                    path: ["grid", 0, {to:2}, "director"],
                                    value: "Quentin Tarantino"
                                }]);
                            });
                            it("from:1, to:2", function() {
                                set_and_verify_path_values(this.test, suffix, [{
                                    path: ["grid", 0, {from:1, to:2}, "director"],
                                    value: "Quentin Tarantino"
                                }]);
                            });
                            it("length:3", function() {
                                set_and_verify_path_values(this.test, suffix, [{
                                    path: ["grid", 0, {length:3}, "director"],
                                    value: "Quentin Tarantino"
                                }]);
                            });
                            it("from:1, length:2", function() {
                                set_and_verify_path_values(this.test, suffix, [{
                                    path: ["grid", 0, {from:1, length:2}, "director"],
                                    value: "Quentin Tarantino"
                                }]);
                            });
                        });
                    });
                });
                
                describe("JSON-Graph Envelope", function() {
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
                
            });
            describe("a $sentinel", function() {
                
                describe("PathValue", function() {
                    describe("in one place", function() {
                        it("directly", function() {
                            set_and_verify_path_values(this.test, suffix, [{
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
                            set_and_verify_path_values(this.test, suffix, [{
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
                            set_and_verify_path_values(this.test, suffix, [{
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
                            set_and_verify_path_values(this.test, suffix, [{
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
                            set_and_verify_path_values(this.test, suffix, [{
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
                                set_and_verify_path_values(this.test, suffix, [{
                                    path: ["movies", ["pulp-fiction", "kill-bill-1", "reservior-dogs"], "genres"],
                                    value: {
                                        $type: $sentinel,
                                        value: ["Crime", "Drama", "Thriller"]
                                    }
                                }]);
                            });
                            it("through through successful, short-circuit, and broken references", function() {
                                set_and_verify_path_values(this.test, suffix, [{
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
                                set_and_verify_path_values(this.test, suffix, [{
                                    path: ["grid", 0, {to:2}, "genres"],
                                    value: {
                                        $type: $sentinel,
                                        value: ["Crime", "Drama", "Thriller"]
                                    }
                                }]);
                            });
                            it("from:1, to:2", function() {
                                set_and_verify_path_values(this.test, suffix, [{
                                    path: ["grid", 0, {from:1, to:2}, "genres"],
                                    value: {
                                        $type: $sentinel,
                                        value: ["Crime", "Drama", "Thriller"]
                                    }
                                }]);
                            });
                            it("length:3", function() {
                                set_and_verify_path_values(this.test, suffix, [{
                                    path: ["grid", 0, {length:3}, "genres"],
                                    value: {
                                        $type: $sentinel,
                                        value: ["Crime", "Drama", "Thriller"]
                                    }
                                }]);
                            });
                            it("from:1, length:2", function() {
                                set_and_verify_path_values(this.test, suffix, [{
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
                
                describe("JSON-Graph Envelope", function() {
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
                
            });
            
            describe("a $path", function() {
                describe("PathValue", function() {
                    describe("in one place", function() {
                        it("directly", function() {
                            set_and_verify_path_values(this.test, suffix, [{
                                path: ["rows", "row-0", "3"],
                                value: { $type: $path, value: ["movies", "django-unchained"] }
                            }]);
                        });
                        it("through a reference", function() {
                            set_and_verify_path_values(this.test, suffix, [{
                                path: ["grid", 0, 3],
                                value: { $type: $path, value: ["movies", "django-unchained"] }
                            }]);
                        });
                    });
                });
                
                describe("JSON-Graph Envelope", function() {
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
            });
            
            describe("multiple mixed paths and values as", function() {
                describe("PathValues", function() {
                    it("directly", function() {
                        set_and_verify_path_values(this.test, suffix, [{
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
                        set_and_verify_path_values(this.test, suffix, [{
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
                
                describe("JSON-Graph Envelope", function() {
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
            });
        });
        
        describe("by replacing", function() {
            describe("a $sentinel with a primitive", function() {
                
                describe("PathValue", function() {
                    it("directly", function() {
                        set_and_verify_path_values(this.test, suffix, [{
                            path: ["movies", "pulp-fiction", "movie-id"],
                            value: "pulp-fiction-2"
                        }]);
                    });
                    it("through a reference", function() {
                        set_and_verify_path_values(this.test, suffix, [{
                            path: ["grid", 0, 0, "movie-id"],
                            value: "pulp-fiction-2"
                        }]);
                    });
                });
                
                describe("JSON-Graph Envelope", function() {
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
            });
            
            describe("a $path with a different $path", function() {
                describe("JSON-Graph Envelope", function() {
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
            });
            
            describe("a branch with a primitive", function() {
                describe("PathValue", function() {
                    it("directly", function() {
                        set_and_verify_path_values(this.test, suffix, [{
                            path: ["movies", "pulp-fiction"],
                            value: "oops"
                        }])
                    });
                });
                describe("JSON-Graph Envelope", function() {
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
            });
            
            describe("a branch with an error", function() {
                describe("PathValue", function() {
                    it("directly", function() {
                        set_and_verify_path_values(this.test, suffix, [{
                            path: ["movies", "pulp-fiction"],
                            value: {
                                "$type": "error",
                                "value": { "message": "oops" }
                            }
                        }])
                    });
                });
                describe("JSON-Graph Envelope", function() {
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
                        }]);
                    });
                });
            });
        });
        
        // Michael TODO: get as dense JSON creating more branch nodes than it should
        // see: ./merge-expected-dense-json.js
        
        xdescribe("by merging", function() {
            describe("a complete cache into an existing partial cache with hard references", function() {
                describe("JSON-Graph Envelope", function() {
                    
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
    });
}

describe("Set a cache of partial $path values and build the correct missing paths as a JSON-Graph Envelope.", function() {
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

function whole_cache() {
    return {
        "grid": { $type: $path, value: ["grids", "grid-1234"] },
        "grids": {
            "grid-1234": {
                "0": { $type: $path, value: ["rows", "row-0"] },
                "1": { $type: $path, value: ["grids", "grid-1234", "0"] }
            }
        },
        "rows": {
            "row-0": {
                "0": { $type: $path, value: ["movies", "pulp-fiction"] },
                "1": { $type: $path, value: ["movies", "kill-bill-1"] },
                "2": { $type: $path, value: ["movies", "reservior-dogs"] },
                "3": { $type: $path, value: ["movies", "django-unchained"] }
            }
        },
        "movies": {
            "pulp-fiction": {
                "movie-id": { $type: $sentinel, value: "pulp-fiction" },
                "title": { $type: $sentinel, value: "Pulp Fiction" },
                "director": { $type: $sentinel, value: "Quentin Tarantino" },
                "genres": {
                    $type: $sentinel,
                    value: ["Crime", "Drama", "Thriller"]
                },
                "summary": {
                    $type: $sentinel,
                    value: {
                        title: "Pulp Fiction",
                        url: "/movies/id/pulp-fiction"
                    }
                }
            },
            "kill-bill-1": {
                "movie-id": { $type: $sentinel, value: "kill-bill-1" },
                "title": { $type: $sentinel, value: "Kill Bill: Vol. 1" },
                "director": { $type: $sentinel, value: "Quentin Tarantino" },
                "genres": {
                    $type: $sentinel,
                    value: ["Crime", "Drama", "Thriller"]
                },
                "summary": {
                    $type: $sentinel,
                    value: {
                        title: "Kill Bill: Vol. 1",
                        url: "/movies/id/kill-bill-1"
                    }
                }
            },
            "reservior-dogs": {
                "movie-id": { $type: $sentinel, value: "reservior-dogs" },
                "title": { $type: $sentinel, value: "Reservior Dogs" },
                "director": { $type: $sentinel, value: "Quentin Tarantino" },
                "genres": {
                    $type: $sentinel,
                    value: ["Crime", "Drama", "Thriller"]
                },
                "summary": {
                    $type: $sentinel,
                    value: {
                        title: "Reservior Dogs",
                        url: "/movies/id/reservior-dogs"
                    }
                }
            },
            "django-unchained": {
                "movie-id": { $type: $sentinel, value: "django-unchained" },
                "title": { $type: $sentinel, value: "Django Unchained" },
                "director": { $type: $sentinel, value: "Quentin Tarantino" },
                "genres": {
                    $type: $sentinel,
                    value: ["Western"]
                },
                "summary": {
                    $type: $sentinel,
                    value: {
                        title: "Django Unchained",
                        url: "/movies/id/django-unchained"
                    }
                }
            }
        }
    }
}

function partial_cache() {
    return {
        "grid": { $type: $path, value: ["grids", "grid-1234"] },
        "grids": {
            "grid-1234": {
                "0": { $type: $path, value: ["rows", "row-0"] },
                "1": { $type: $path, value: ["grids", "grid-1234", "0"] }
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
                "movie-id": { $type: $sentinel, value: "pulp-fiction" }
            },
            "kill-bill-1": { $type: $sentinel }
        }
    }
}

function apply(func, context) {
    return function(argslist) {
        return func.apply(context, argslist);
    }
}

function set_and_verify_path_values(test, suffix, pathvalues, options) {
    return verify(suffix).
        apply(test, set_path_values(pathvalues, suffix, options)).
        apply(test, get_paths(pathvalues));
}

function set_and_verify_json_graph(test, suffix, envelopes, options) {
    return verify(suffix).
        apply(test, set_envelopes(envelopes, suffix, options)).
        apply(test, envelopes.flatMap(get_paths));
}

function get_paths(valuesOrEnv) {
    if(valuesOrEnv.paths) {
        return valuesOrEnv.paths.map(function(path) {
            return JSON.parse(JSON.stringify(path));
        });
    }
    return valuesOrEnv.map(function(pv) {
        return JSON.parse(JSON.stringify(pv.path));
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

function set_path_values(pathvalues, suffix, options) {
    var model   = options && options.model || new Model(_.extend({ cache: partial_cache() }, options || {}));
    var seeds   = suffix == "JSON" ? get_seeds(pathvalues) : [{}];
    if(suffix == "Values") {
        var values = [];
        seeds = function(pv) { values.push(pv); }
    }
    var func = model["_setPathSetsAs" + suffix];
    var results = func(model, pathvalues, seeds);
    if(values) { results.values = values; }
    return [model, results];
}

function set_envelopes(envelopes, suffix, options) {
    var model   = options && options.model || new Model(_.extend({ cache: partial_cache() }, options || {}));
    var seeds   = suffix == "JSON" ? get_seeds(envelopes.flatMap(get_paths)) : [{}];
    if(suffix == "Values") {
        var values = [];
        seeds = function(pv) { values.push(pv); }
    }
    var func = model["_setJSONGsAs" + suffix];
    var results = func(model, envelopes, seeds);
    if(values) { results.values = values; }
    
    // console.log(require("util").inspect(results.values, {depth: null}));
    
    return [model, results];
}

function verify(suffix) {
    return function(model, input) {
        
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
            var seeds   = suffix == "JSON" ? get_seeds(paths) : [{}];
            if(suffix == "Values") {
                var values = [];
                seeds = function(pv) { values.push(pv); }
            }
            var func = model["_getPathSetsAs" + suffix];
            var output = func(model, paths, seeds);
            if(values) { output.values = values; }
            return checks.shift().call(this, output);
        };
        
        function check(name, prop) {
            var fn;
            return function(output) {
                expect(input[prop], message + " - " + name).to.deep.equals(output[prop]);
                if(fn = checks.shift()) {
                    return fn.call(this, output);
                } else {
                    return true;
                }
            };
        }
    };
}
