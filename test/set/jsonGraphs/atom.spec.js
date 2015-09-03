var $ref = require("falcor-json-graph").ref;
var strip = require("../support/strip");
var $atom = require("falcor-json-graph").atom;
var $pathValue = require("falcor-json-graph").pathValue;
var $jsonGraph = require("../support/jsonGraph");
var $jsonGraphEnvelope = require("../support/jsonGraphEnvelope");

var expect = require('chai').expect;
var getModel = require("../support/getModel");
var setJSONGraphs = require("../../../lib/set/setJSONGraphs");

describe("an atom", function() {

    it("directly", function() {

        var cache = {};
        var version = 0;

        setJSONGraphs(
            getModel({ cache: cache, version: version++ }), [
            $jsonGraphEnvelope([
                $pathValue("movies['pulp-fiction'].summary", $atom({
                    title: "Pulp Fiction",
                    url: "/movies/id/pulp-fiction"
                }))
            ])]
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

        setJSONGraphs(
            getModel({ lru: lru, cache: cache, version: version++ }), [
            $jsonGraphEnvelope([
                $pathValue("grid", $ref("grids['id']")),
                $pathValue("grids['id'][0]", $ref("lists['id']")),
                $pathValue("lists['id'][0]", $ref("movies['pulp-fiction']")),
                $pathValue("movies['pulp-fiction']", "Pulp Fiction")
            ])]
        );

        setJSONGraphs(
            getModel({ lru: lru, cache: cache, version: version++ }), [{
                paths: [["grid", 0, 0, "summary"]],
                jsonGraph: $jsonGraph([
                    $pathValue("movies['pulp-fiction'].summary", $atom({
                        title: "Pulp Fiction",
                        url: "/movies/id/pulp-fiction"
                    }))
                ])
            }]
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

        setJSONGraphs(
            getModel({ cache: cache, version: version++ }), [
            $jsonGraphEnvelope([
                $pathValue("grid", $ref("grids['id']")),
                $pathValue("grids['id'][0]", $ref("lists['id']")),
                $pathValue("lists['id'][1]", $ref("movies['kill-bill-1']")),
                $pathValue("movies['kill-bill-1'].summary", $atom()),
                $pathValue("grid[0][1].summary", $atom({
                    title: "Kill Bill: Vol. 1",
                    url: "/movies/id/kill-bill-1"
                }))
            ])]
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

        setJSONGraphs(
            getModel({ cache: cache, version: version++ }), [
            $jsonGraphEnvelope([
                $pathValue("grid", $ref("grids['id']")),
                $pathValue("grids['id'][0]", $ref("lists['id']")),
                $pathValue("lists['id'][2]", $ref("movies['reservior-dogs']")),
                $pathValue("grid[0][2].summary", $atom({
                    title: "Reservior Dogs",
                    url: "/movies/id/reservior-dogs"
                }))
            ])]
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

    it("through a reference with a null last key", function() {

        var cache = {};
        var version = 0;

        setJSONGraphs(
            getModel({ cache: cache, version: version++ }), [
            $jsonGraphEnvelope([
                $pathValue("grid", $ref("grids['id']")),
                $pathValue("grids['id'][0]", $ref("lists['id']")),
                $pathValue("lists['id'][2]", $ref("movies['reservior-dogs']")),
                $pathValue(["grid", 0, 2, null], $atom({
                    title: "Reservior Dogs",
                    url: "/movies/id/reservior-dogs"
                }))
            ])]
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

        setJSONGraphs(
            getModel({ lru: lru, cache: cache, version: version++ }), [
            $jsonGraphEnvelope([
                $pathValue("movies['pulp-fiction'].summary", $atom({
                    title: "Pulp Fiction",
                    url: "/movies/id/pulp-fiction"
                }, { $timestamp: startTime }))
            ])]
        );

        setJSONGraphs(
            getModel({ lru: lru, cache: cache, version: version++ }), [
            $jsonGraphEnvelope([
                $pathValue("movies['pulp-fiction'].summary", $atom({
                    title: "Kill Bill",
                    url: "/movies/id/kill-bill-1"
                }, { $timestamp: startTime - 10 }))
            ])]
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

                setJSONGraphs(
                    getModel({ cache: cache, version: version++ }), [
                    $jsonGraphEnvelope([
                        $pathValue("movies['pulp-fiction', 'kill-bill-1', 'reservior-dogs'].genres", ["Crime", "Drama", "Thriller"])
                    ])]
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

                setJSONGraphs(
                    getModel({ cache: cache, version: version++ }), [
                    $jsonGraphEnvelope([
                        $pathValue("grid", $ref("grids['id']")),
                        $pathValue("grids['id'][0]", $ref("lists['id']")),
                        $pathValue("lists['id'][0]", $ref("movies['pulp-fiction']")),
                        $pathValue("lists['id'][1]", $ref("movies['kill-bill-1']")),
                        $pathValue("lists['id'][2]", $ref("movies['reservior-dogs']")),
                        $pathValue("movies['kill-bill-1'].genres", $atom()),
                        $pathValue("grid[0][0, 1, 2].genres", $atom(["Crime", "Drama", "Thriller"]))
                    ])]
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

                setJSONGraphs(
                    getModel({ cache: cache, version: version++ }), [
                    $jsonGraphEnvelope([
                        $pathValue("grid", $ref("grids['id']")),
                        $pathValue("grids['id'][0]", $ref("lists['id']")),
                        $pathValue("lists['id'][0]", $ref("movies['pulp-fiction']")),
                        $pathValue("lists['id'][1]", $ref("movies['kill-bill-1']")),
                        $pathValue("lists['id'][2]", $ref("movies['reservior-dogs']")),
                        $pathValue("movies['kill-bill-1'].genres", $atom()),
                        $pathValue("grid[0][0..2].genres", $atom(["Crime", "Drama", "Thriller"]))
                    ])]
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

                setJSONGraphs(
                    getModel({ cache: cache, version: version++ }), [
                    $jsonGraphEnvelope([
                        $pathValue("grid", $ref("grids['id']")),
                        $pathValue("grids['id'][0]", $ref("lists['id']")),
                        $pathValue("lists['id'][1]", $ref("movies['kill-bill-1']")),
                        $pathValue("lists['id'][2]", $ref("movies['reservior-dogs']")),
                        $pathValue("movies['kill-bill-1'].genres", $atom()),
                        $pathValue("grid[0][1..2].genres", $atom(["Crime", "Drama", "Thriller"]))
                    ])]
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

                setJSONGraphs(
                    getModel({ cache: cache, version: version++ }), [
                    $jsonGraphEnvelope([
                        $pathValue("grid", $ref("grids['id']")),
                        $pathValue("grids['id'][0]", $ref("lists['id']")),
                        $pathValue("lists['id'][0]", $ref("movies['pulp-fiction']")),
                        $pathValue("lists['id'][1]", $ref("movies['kill-bill-1']")),
                        $pathValue("lists['id'][2]", $ref("movies['reservior-dogs']")),
                        $pathValue("movies['kill-bill-1'].genres", $atom()),
                        $pathValue(["grid", 0, {length: 3}, "genres"], $atom(["Crime", "Drama", "Thriller"]))
                    ])]
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

                setJSONGraphs(
                    getModel({ cache: cache, version: version++ }), [
                    $jsonGraphEnvelope([
                        $pathValue("grid", $ref("grids['id']")),
                        $pathValue("grids['id'][0]", $ref("lists['id']")),
                        $pathValue("lists['id'][1]", $ref("movies['kill-bill-1']")),
                        $pathValue("lists['id'][2]", $ref("movies['reservior-dogs']")),
                        $pathValue("movies['kill-bill-1'].genres", $atom()),
                        $pathValue(["grid", 0, {from: 1, length: 2}, "genres"], $atom(["Crime", "Drama", "Thriller"]))
                    ])]
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

                setJSONGraphs(
                    getModel({ cache: cache, version: version++ }), [
                    $jsonGraphEnvelope([
                        $pathValue("grid", $ref("grids['id']")),
                        $pathValue("grids['id'][0]", $ref("lists['id']")),
                        $pathValue("lists['id'][0]", $ref("movies['pulp-fiction']")),
                        $pathValue("lists['id'][1]", $ref("movies['kill-bill-1']")),
                        $pathValue("lists['id'][2]", $ref("movies['reservior-dogs']")),
                        $pathValue("movies['kill-bill-1'].genres", $atom()),
                        $pathValue(["grid", 0, [{length: 3}], "genres"], $atom(["Crime", "Drama", "Thriller"]))
                    ])]
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
