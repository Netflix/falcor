var $ref = require("falcor-json-graph").ref;
var strip = require("../support/strip");
var $atom = require("falcor-json-graph").atom;
var $pathValue = require("falcor-json-graph").pathValue;

var expect = require('chai').expect;
var getModel = require("../support/getModel");
var setPathValues = require("../../../lib/set/setPathValues");

describe("a primitive value", function() {

    it("throws with a `null` key in a branch position", function() {

        var lru = new Object();
        var cache = {};
        var version = 0;
        var errored = false;

        try {
            setPathValues(
                getModel({ lru: lru, cache: cache, version: version++ }), [
                $pathValue(["movies", null, "pulp-fiction", "title"], "Pulp Fiction")
            ]);
        } catch(e) {
            expect(e.message).to.equal("`null` is not allowed in branch key positions.");
        }

        errored = true;
        expect(errored).to.be.true;
    });

    it("directly", function() {

        var cache = {};
        var version = 0;
        setPathValues(
            getModel({ cache: cache, version: version++ }), [
            $pathValue("movies['pulp-fiction'].title", "Pulp Fiction")
        ]);

        expect(strip(cache)).to.deep.equal(strip({
            movies: {
                "pulp-fiction": {
                    "title": $atom("Pulp Fiction")
                }
            }
        }));
    });

    it("through a reference", function() {

        var lru = new Object();
        var cache = {};
        var version = 0;
        setPathValues(
            getModel({ lru: lru, cache: cache, version: version++ }), [
                $pathValue("grid", $ref("grids['id']")),
                $pathValue("grids['id'][0]", $ref("lists['id']")),
                $pathValue("lists['id'][0]", $ref("movies['pulp-fiction']")),
                $pathValue("movies['pulp-fiction']", "Pulp Fiction")
            ]
        );

        setPathValues(
            getModel({ lru: lru, cache: cache, version: version++ }), [
                $pathValue("grid[0][0].title", "Pulp Fiction")
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref("grids['id']"),
            grids: { id: { 0: $ref("lists['id']") } },
            lists: { id: { 0: $ref("movies['pulp-fiction']") } },
            movies: {
                "pulp-fiction": {
                    title: $atom("Pulp Fiction")
                }
            }
        }));
    });

    it("through a reference that lands on an atom", function() {

        var cache = {};
        var version = 0;
        setPathValues(
            getModel({ cache: cache, version: version++ }), [
                $pathValue("grid", $ref("grids['id']")),
                $pathValue("grids['id'][0]", $ref("lists['id']")),
                $pathValue("lists['id'][1]", $ref("movies['kill-bill-1']")),
                $pathValue("movies['kill-bill-1'].title", $atom()),
                $pathValue("grid[0][1].title", "Kill Bill Vol. 1")
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref("grids['id']"),
            grids: { id: { 0: $ref("lists['id']") } },
            lists: { id: { 1: $ref("movies['kill-bill-1']") } },
            movies: {
                "kill-bill-1": {
                    title: $atom("Kill Bill Vol. 1")
                }
            }
        }));
    });


    it("through a broken reference", function() {

        var cache = {};
        var version = 0;
        setPathValues(
            getModel({ cache: cache, version: version++ }), [
                $pathValue("grid", $ref("grids['id']")),
                $pathValue("grids['id'][0]", $ref("lists['id']")),
                $pathValue("lists['id'][2]", $ref("movies['reservior-dogs']")),
                $pathValue("grid[0][2].title", "Reservior Dogs")
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref("grids['id']"),
            grids: { id: { 0: $ref("lists['id']") } },
            lists: { id: { 2: $ref("movies['reservior-dogs']") } },
            movies: {
                "reservior-dogs": {
                    title: $atom("Reservior Dogs")
                }
            }
        }));
    });

    it("through a reference with a null last key", function() {

        var cache = {};
        var version = 0;
        setPathValues(
            getModel({ cache: cache, version: version++ }), [
                $pathValue("grid", $ref("grids['id']")),
                $pathValue("grids['id'][0]", $ref("lists['id']")),
                $pathValue("lists['id'][2]", $ref("movies['reservior-dogs']")),
                $pathValue(["grid", 0, 2, null], "Reservior Dogs")
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref("grids['id']"),
            grids: { id: { 0: $ref("lists['id']") } },
            lists: { id: { 2: $ref("movies['reservior-dogs']") } },
            movies: { "reservior-dogs": $atom("Reservior Dogs") }
        }));
    });

    describe("in multiple places", function() {
        describe("via keyset", function() {
            it("directly", function() {

                var cache = {};
                var version = 0;
                setPathValues(
                    getModel({ cache: cache, version: version++ }), [
                        $pathValue("movies['pulp-fiction', 'kill-bill-1', 'reservior-dogs'].director", "Quentin Tarantino")
                    ]
                );

                expect(strip(cache)).to.deep.equal(strip({
                    movies: {
                        "pulp-fiction": { "director": $atom("Quentin Tarantino") },
                        "kill-bill-1": { "director": $atom("Quentin Tarantino") },
                        "reservior-dogs": { "director": $atom("Quentin Tarantino") }
                    }
                }));
            });
            it("through successful, short-circuit, and broken references", function() {

                var cache = {};
                var version = 0;
                setPathValues(
                    getModel({ cache: cache, version: version++ }), [
                        $pathValue("grid", $ref("grids['id']")),
                        $pathValue("grids['id'][0]", $ref("lists['id']")),
                        $pathValue("lists['id'][0]", $ref("movies['pulp-fiction']")),
                        $pathValue("lists['id'][1]", $ref("movies['kill-bill-1']")),
                        $pathValue("lists['id'][2]", $ref("movies['reservior-dogs']")),
                        $pathValue("movies['kill-bill-1'].director", $atom()),
                        $pathValue("grid[0][0, 1, 2].director", "Quentin Tarantino")
                    ]
                );

                expect(strip(cache)).to.deep.equal(strip({
                    grid: $ref("grids['id']"),
                    grids: { id: { 0: $ref("lists['id']") } },
                    lists: { id: {
                        0: $ref("movies['pulp-fiction']"),
                        1: $ref("movies['kill-bill-1']"),
                        2: $ref("movies['reservior-dogs']") }
                    },
                    movies: {
                        "pulp-fiction": { "director": $atom("Quentin Tarantino") },
                        "kill-bill-1": { "director": $atom("Quentin Tarantino") },
                        "reservior-dogs": { "director": $atom("Quentin Tarantino") }
                    }
                }));
            });
        });
        describe("via range", function() {
            it("to:2", function() {

                var cache = {};
                var version = 0;
                setPathValues(
                    getModel({ cache: cache, version: version++ }), [
                        $pathValue("grid", $ref("grids['id']")),
                        $pathValue("grids['id'][0]", $ref("lists['id']")),
                        $pathValue("lists['id'][0]", $ref("movies['pulp-fiction']")),
                        $pathValue("lists['id'][1]", $ref("movies['kill-bill-1']")),
                        $pathValue("lists['id'][2]", $ref("movies['reservior-dogs']")),
                        $pathValue("movies['kill-bill-1'].director", $atom()),
                        $pathValue("grid[0][0..2].director", "Quentin Tarantino")
                    ]
                );

                expect(strip(cache)).to.deep.equal(strip({
                    grid: $ref("grids['id']"),
                    grids: { id: { 0: $ref("lists['id']") } },
                    lists: { id: {
                        0: $ref("movies['pulp-fiction']"),
                        1: $ref("movies['kill-bill-1']"),
                        2: $ref("movies['reservior-dogs']") }
                    },
                    movies: {
                        "pulp-fiction": { "director": $atom("Quentin Tarantino") },
                        "kill-bill-1": { "director": $atom("Quentin Tarantino") },
                        "reservior-dogs": { "director": $atom("Quentin Tarantino") }
                    }
                }));
            });
            it("from:1, to:2", function() {

                var cache = {};
                var version = 0;
                setPathValues(
                    getModel({ cache: cache, version: version++ }), [
                        $pathValue("grid", $ref("grids['id']")),
                        $pathValue("grids['id'][0]", $ref("lists['id']")),
                        $pathValue("lists['id'][1]", $ref("movies['kill-bill-1']")),
                        $pathValue("lists['id'][2]", $ref("movies['reservior-dogs']")),
                        $pathValue("movies['kill-bill-1'].director", $atom()),
                        $pathValue("grid[0][1..2].director", "Quentin Tarantino")
                    ]
                );

                expect(strip(cache)).to.deep.equal(strip({
                    grid: $ref("grids['id']"),
                    grids: { id: { 0: $ref("lists['id']") } },
                    lists: { id: {
                        1: $ref("movies['kill-bill-1']"),
                        2: $ref("movies['reservior-dogs']") }
                    },
                    movies: {
                        "kill-bill-1": { "director": $atom("Quentin Tarantino") },
                        "reservior-dogs": { "director": $atom("Quentin Tarantino") }
                    }
                }));
            });
            it("length:3", function() {

                var cache = {};
                var version = 0;
                setPathValues(
                    getModel({ cache: cache, version: version++ }), [
                        $pathValue("grid", $ref("grids['id']")),
                        $pathValue("grids['id'][0]", $ref("lists['id']")),
                        $pathValue("lists['id'][0]", $ref("movies['pulp-fiction']")),
                        $pathValue("lists['id'][1]", $ref("movies['kill-bill-1']")),
                        $pathValue("lists['id'][2]", $ref("movies['reservior-dogs']")),
                        $pathValue("movies['kill-bill-1'].director", $atom()),
                        $pathValue(["grid", 0, {length: 3}, "director"], "Quentin Tarantino")
                    ]
                );

                expect(strip(cache)).to.deep.equal(strip({
                    grid: $ref("grids['id']"),
                    grids: { id: { 0: $ref("lists['id']") } },
                    lists: { id: {
                        0: $ref("movies['pulp-fiction']"),
                        1: $ref("movies['kill-bill-1']"),
                        2: $ref("movies['reservior-dogs']") }
                    },
                    movies: {
                        "pulp-fiction": { "director": $atom("Quentin Tarantino") },
                        "kill-bill-1": { "director": $atom("Quentin Tarantino") },
                        "reservior-dogs": { "director": $atom("Quentin Tarantino") }
                    }
                }));
            });
            it("from:1, length:2", function() {

                var cache = {};
                var version = 0;
                setPathValues(
                    getModel({ cache: cache, version: version++ }), [
                        $pathValue("grid", $ref("grids['id']")),
                        $pathValue("grids['id'][0]", $ref("lists['id']")),
                        $pathValue("lists['id'][1]", $ref("movies['kill-bill-1']")),
                        $pathValue("lists['id'][2]", $ref("movies['reservior-dogs']")),
                        $pathValue("movies['kill-bill-1'].director", $atom()),
                        $pathValue(["grid", 0, {from: 1, length: 2}, "director"], "Quentin Tarantino")
                    ]
                );

                expect(strip(cache)).to.deep.equal(strip({
                    grid: $ref("grids['id']"),
                    grids: { id: { 0: $ref("lists['id']") } },
                    lists: { id: {
                        1: $ref("movies['kill-bill-1']"),
                        2: $ref("movies['reservior-dogs']") }
                    },
                    movies: {
                        "kill-bill-1": { "director": $atom("Quentin Tarantino") },
                        "reservior-dogs": { "director": $atom("Quentin Tarantino") }
                    }
                }));
            });
            it("[length:3]", function() {

                var cache = {};
                var version = 0;
                setPathValues(
                    getModel({ cache: cache, version: version++ }), [
                        $pathValue("grid", $ref("grids['id']")),
                        $pathValue("grids['id'][0]", $ref("lists['id']")),
                        $pathValue("lists['id'][0]", $ref("movies['pulp-fiction']")),
                        $pathValue("lists['id'][1]", $ref("movies['kill-bill-1']")),
                        $pathValue("lists['id'][2]", $ref("movies['reservior-dogs']")),
                        $pathValue("movies['kill-bill-1'].director", $atom()),
                        $pathValue(["grid", 0, [{length: 3}], "director"], "Quentin Tarantino")
                    ]
                );

                expect(strip(cache)).to.deep.equal(strip({
                    grid: $ref("grids['id']"),
                    grids: { id: { 0: $ref("lists['id']") } },
                    lists: { id: {
                        0: $ref("movies['pulp-fiction']"),
                        1: $ref("movies['kill-bill-1']"),
                        2: $ref("movies['reservior-dogs']") }
                    },
                    movies: {
                        "pulp-fiction": { "director": $atom("Quentin Tarantino") },
                        "kill-bill-1": { "director": $atom("Quentin Tarantino") },
                        "reservior-dogs": { "director": $atom("Quentin Tarantino") }
                    }
                }));
            });
        });
    });
});
