var $ref = require("falcor-json-graph").ref;
var strip = require("../support/strip");
var $atom = require("falcor-json-graph").atom;
var $pathMapEnvelope = require("../support/pathMapEnvelope");

var expect = require('chai').expect;
var getModel = require("../support/getModel");
var setPathMaps = require("../../../lib/set/setPathMaps");

describe("an atom", function() {

    it("directly", function() {

        var cache = {};
        var version = 0;

        setPathMaps(
            getModel({ cache: cache, version: version++ }), [
                $pathMapEnvelope("movies['pulp-fiction'].summary", $atom({
                    title: "Pulp Fiction",
                    url: "/movies/id/pulp-fiction"
                }))
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            movies: {
                "pulp-fiction": {
                    "summary": $atom({
                        title: "Pulp Fiction",
                        url: "/movies/id/pulp-fiction"
                    })
                }
            }
        }));
    });

    it("through a reference", function() {

        var lru = new Object();
        var cache = {};
        var version = 0;

        setPathMaps(
            getModel({ lru: lru, cache: cache, version: version++ }), [
                $pathMapEnvelope("grid", $ref("grids['id']")),
                $pathMapEnvelope("grids['id'][0]", $ref("lists['id']")),
                $pathMapEnvelope("lists['id'][0]", $ref("movies['pulp-fiction']")),
                $pathMapEnvelope("movies['pulp-fiction']", "Pulp Fiction")
            ]
        );

        setPathMaps(
            getModel({ lru: lru, cache: cache, version: version++ }), [
                $pathMapEnvelope("grid[0][0].summary", $atom({
                    title: "Pulp Fiction",
                    url: "/movies/id/pulp-fiction"
                }))
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref("grids['id']"),
            grids: { id: { 0: $ref("lists['id']") } },
            lists: { id: { 0: $ref("movies['pulp-fiction']") } },
            movies: {
                "pulp-fiction": {
                    summary: $atom({
                        title: "Pulp Fiction",
                        url: "/movies/id/pulp-fiction"
                    })
                }
            }
        }));
    });

    it("through a reference that lands on an atom", function() {

        var cache = {};
        var version = 0;

        setPathMaps(
            getModel({ cache: cache, version: version++ }), [
                $pathMapEnvelope("grid", $ref("grids['id']")),
                $pathMapEnvelope("grids['id'][0]", $ref("lists['id']")),
                $pathMapEnvelope("lists['id'][1]", $ref("movies['kill-bill-1']")),
                $pathMapEnvelope("movies['kill-bill-1'].summary", $atom()),
                $pathMapEnvelope("grid[0][1].summary", $atom({
                    title: "Kill Bill: Vol. 1",
                    url: "/movies/id/kill-bill-1"
                }))
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref("grids['id']"),
            grids: { id: { 0: $ref("lists['id']") } },
            lists: { id: { 1: $ref("movies['kill-bill-1']") } },
            movies: {
                "kill-bill-1": {
                    summary: $atom({
                        title: "Kill Bill: Vol. 1",
                        url: "/movies/id/kill-bill-1"
                    })
                }
            }
        }));
    });

    it("through a broken reference", function() {

        var cache = {};
        var version = 0;

        setPathMaps(
            getModel({ cache: cache, version: version++ }), [
                $pathMapEnvelope("grid", $ref("grids['id']")),
                $pathMapEnvelope("grids['id'][0]", $ref("lists['id']")),
                $pathMapEnvelope("lists['id'][2]", $ref("movies['reservior-dogs']")),
                $pathMapEnvelope("grid[0][2].summary", $atom({
                    title: "Reservior Dogs",
                    url: "/movies/id/reservior-dogs"
                }))
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref("grids['id']"),
            grids: { id: { 0: $ref("lists['id']") } },
            lists: { id: { 2: $ref("movies['reservior-dogs']") } },
            movies: {
                "reservior-dogs": {
                    summary: $atom({
                        title: "Reservior Dogs",
                        url: "/movies/id/reservior-dogs"
                    })
                }
            }
        }));
    });

    xit("through a reference with a null last key", function() {

        var cache = {};
        var version = 0;

        setPathMaps(
            getModel({ cache: cache, version: version++ }), [
                $pathMapEnvelope("grid", $ref("grids['id']")),
                $pathMapEnvelope("grids['id'][0]", $ref("lists['id']")),
                $pathMapEnvelope("lists['id'][2]", $ref("movies['reservior-dogs']")),
                $pathMapEnvelope(["grid", 0, 2, null], $atom({
                    title: "Reservior Dogs",
                    url: "/movies/id/reservior-dogs"
                }))
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref("grids['id']"),
            grids: { id: { 0: $ref("lists['id']") } },
            lists: { id: { 2: $ref("movies['reservior-dogs']") } },
            movies: { "reservior-dogs": $atom({
                title: "Reservior Dogs",
                url: "/movies/id/reservior-dogs"
            }) }
        }));
    });

    it("with an older timestamp", function() {

        var startTime = Date.now();
        var lru = new Object();
        var cache = {};
        var version = 0;

        setPathMaps(
            getModel({ lru: lru, cache: cache, version: version++ }), [
                $pathMapEnvelope("movies['pulp-fiction'].summary", $atom({
                    title: "Pulp Fiction",
                    url: "/movies/id/pulp-fiction"
                }, { $timestamp: startTime }))
            ]
        );

        setPathMaps(
            getModel({ lru: lru, cache: cache, version: version++ }), [
                $pathMapEnvelope("movies['pulp-fiction'].summary", $atom({
                    title: "Kill Bill",
                    url: "/movies/id/kill-bill-1"
                }, { $timestamp: startTime - 10 }))
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            movies: {
                "pulp-fiction": {
                    "summary": $atom({
                        title: "Pulp Fiction",
                        url: "/movies/id/pulp-fiction"
                    })
                }
            }
        }));
    });

    describe("in multiple places", function() {
        describe("via keyset", function() {
            it("directly", function() {

                var cache = {};
                var version = 0;
                setPathMaps(
                    getModel({ cache: cache, version: version++ }), [
                        $pathMapEnvelope("movies['pulp-fiction', 'kill-bill-1', 'reservior-dogs'].genres", $atom(["Crime", "Drama", "Thriller"]))
                    ]
                );

                expect(strip(cache)).to.deep.equal(strip({
                    movies: {
                        "pulp-fiction": { "genres": $atom(["Crime", "Drama", "Thriller"]) },
                        "kill-bill-1": { "genres": $atom(["Crime", "Drama", "Thriller"]) },
                        "reservior-dogs": { "genres": $atom(["Crime", "Drama", "Thriller"]) }
                    }
                }));
            });
            it("through successful, short-circuit, and broken references", function() {

                var cache = {};
                var version = 0;
                setPathMaps(
                    getModel({ cache: cache, version: version++ }), [
                        $pathMapEnvelope("grid", $ref("grids['id']")),
                        $pathMapEnvelope("grids['id'][0]", $ref("lists['id']")),
                        $pathMapEnvelope("lists['id'][0]", $ref("movies['pulp-fiction']")),
                        $pathMapEnvelope("lists['id'][1]", $ref("movies['kill-bill-1']")),
                        $pathMapEnvelope("lists['id'][2]", $ref("movies['reservior-dogs']")),
                        $pathMapEnvelope("movies['kill-bill-1'].genres", $atom()),
                        $pathMapEnvelope("grid[0][0, 1, 2].genres", $atom(["Crime", "Drama", "Thriller"]))
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
                        "pulp-fiction": { "genres": $atom(["Crime", "Drama", "Thriller"]) },
                        "kill-bill-1": { "genres": $atom(["Crime", "Drama", "Thriller"]) },
                        "reservior-dogs": { "genres": $atom(["Crime", "Drama", "Thriller"]) }
                    }
                }));
            });
        });
        describe("via range", function() {
            it("to:2", function() {

                var cache = {};
                var version = 0;
                setPathMaps(
                    getModel({ cache: cache, version: version++ }), [
                        $pathMapEnvelope("grid", $ref("grids['id']")),
                        $pathMapEnvelope("grids['id'][0]", $ref("lists['id']")),
                        $pathMapEnvelope("lists['id'][0]", $ref("movies['pulp-fiction']")),
                        $pathMapEnvelope("lists['id'][1]", $ref("movies['kill-bill-1']")),
                        $pathMapEnvelope("lists['id'][2]", $ref("movies['reservior-dogs']")),
                        $pathMapEnvelope("movies['kill-bill-1'].genres", $atom()),
                        $pathMapEnvelope("grid[0][0..2].genres", $atom(["Crime", "Drama", "Thriller"]))
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
                        "pulp-fiction": { "genres": $atom(["Crime", "Drama", "Thriller"]) },
                        "kill-bill-1": { "genres": $atom(["Crime", "Drama", "Thriller"]) },
                        "reservior-dogs": { "genres": $atom(["Crime", "Drama", "Thriller"]) }
                    }
                }));
            });
            it("from:1, to:2", function() {

                var cache = {};
                var version = 0;
                setPathMaps(
                    getModel({ cache: cache, version: version++ }), [
                        $pathMapEnvelope("grid", $ref("grids['id']")),
                        $pathMapEnvelope("grids['id'][0]", $ref("lists['id']")),
                        $pathMapEnvelope("lists['id'][1]", $ref("movies['kill-bill-1']")),
                        $pathMapEnvelope("lists['id'][2]", $ref("movies['reservior-dogs']")),
                        $pathMapEnvelope("movies['kill-bill-1'].genres", $atom()),
                        $pathMapEnvelope("grid[0][1..2].genres", $atom(["Crime", "Drama", "Thriller"]))
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
                        "kill-bill-1": { "genres": $atom(["Crime", "Drama", "Thriller"]) },
                        "reservior-dogs": { "genres": $atom(["Crime", "Drama", "Thriller"]) }
                    }
                }));
            });
            it("length:3", function() {

                var cache = {};
                var version = 0;
                setPathMaps(
                    getModel({ cache: cache, version: version++ }), [
                        $pathMapEnvelope("grid", $ref("grids['id']")),
                        $pathMapEnvelope("grids['id'][0]", $ref("lists['id']")),
                        $pathMapEnvelope("lists['id'][0]", $ref("movies['pulp-fiction']")),
                        $pathMapEnvelope("lists['id'][1]", $ref("movies['kill-bill-1']")),
                        $pathMapEnvelope("lists['id'][2]", $ref("movies['reservior-dogs']")),
                        $pathMapEnvelope("movies['kill-bill-1'].genres", $atom()),
                        $pathMapEnvelope(["grid", 0, {length: 3}, "genres"], $atom(["Crime", "Drama", "Thriller"]))
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
                        "pulp-fiction": { "genres": $atom(["Crime", "Drama", "Thriller"]) },
                        "kill-bill-1": { "genres": $atom(["Crime", "Drama", "Thriller"]) },
                        "reservior-dogs": { "genres": $atom(["Crime", "Drama", "Thriller"]) }
                    }
                }));
            });
            it("from:1, length:2", function() {

                var cache = {};
                var version = 0;
                setPathMaps(
                    getModel({ cache: cache, version: version++ }), [
                        $pathMapEnvelope("grid", $ref("grids['id']")),
                        $pathMapEnvelope("grids['id'][0]", $ref("lists['id']")),
                        $pathMapEnvelope("lists['id'][1]", $ref("movies['kill-bill-1']")),
                        $pathMapEnvelope("lists['id'][2]", $ref("movies['reservior-dogs']")),
                        $pathMapEnvelope("movies['kill-bill-1'].genres", $atom()),
                        $pathMapEnvelope(["grid", 0, {from: 1, length: 2}, "genres"], $atom(["Crime", "Drama", "Thriller"]))
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
                        "kill-bill-1": { "genres": $atom(["Crime", "Drama", "Thriller"]) },
                        "reservior-dogs": { "genres": $atom(["Crime", "Drama", "Thriller"]) }
                    }
                }));
            });
            it("[length:3]", function() {

                var cache = {};
                var version = 0;
                setPathMaps(
                    getModel({ cache: cache, version: version++ }), [
                        $pathMapEnvelope("grid", $ref("grids['id']")),
                        $pathMapEnvelope("grids['id'][0]", $ref("lists['id']")),
                        $pathMapEnvelope("lists['id'][0]", $ref("movies['pulp-fiction']")),
                        $pathMapEnvelope("lists['id'][1]", $ref("movies['kill-bill-1']")),
                        $pathMapEnvelope("lists['id'][2]", $ref("movies['reservior-dogs']")),
                        $pathMapEnvelope("movies['kill-bill-1'].genres", $atom()),
                        $pathMapEnvelope(["grid", 0, [{length: 3}], "genres"], $atom(["Crime", "Drama", "Thriller"]))
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
                        "pulp-fiction": { "genres": $atom(["Crime", "Drama", "Thriller"]) },
                        "kill-bill-1": { "genres": $atom(["Crime", "Drama", "Thriller"]) },
                        "reservior-dogs": { "genres": $atom(["Crime", "Drama", "Thriller"]) }
                    }
                }));
            });
        });
    });
});
