var $ref = require("falcor-json-graph").ref;
var strip = require("../../set/support/strip");
var $atom = require("falcor-json-graph").atom;
var $path = require("falcor-path-syntax").fromPath;
var $pathValue = require("falcor-json-graph").pathValue;

var expect = require('chai').expect;
var getModel = require("../../set/support/getModel");
var setPathValues = require("../../../lib/set/setPathValues");
var invalidatePathSets = require("../../../lib/invalidate/invalidatePathSets");

describe("invalidatePathSets", function() {

    it("directly", function() {

        var lru = new Object();
        var cache = {};
        var version = 0;

        setPathValues(
            getModel({ lru: lru, cache: cache, version: version++ }), [
            $pathValue(["movies", 'pulp-fiction', 'title'])
        ]);

        invalidatePathSets(
            getModel({ lru: lru, cache: cache, version: version++ }), [
            $path(["movies", 'pulp-fiction', 'title'])
        ]);

        expect(strip(cache)).to.deep.equal(strip({}));
    });

    it("through a reference", function() {

        var lru = new Object();
        var cache = {};
        var version = 0;

        setPathValues(
            getModel({ lru: lru, cache: cache, version: version++ }), [
                $pathValue(["grid"], $ref(["grids", 'id'])),
                $pathValue(["grids", 'id', 0], $ref(["lists", 'id'])),
                $pathValue(["lists", 'id', 0], $ref(["movies", 'pulp-fiction'])),
                $pathValue(["movies", 'pulp-fiction'], "Pulp Fiction")
            ]
        );

        invalidatePathSets(
            getModel({ lru: lru, cache: cache, version: version++ }), [
                $path(["grid", 0, 0, 'title'])
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref(["grids", 'id']),
            grids: { id: { 0: $ref(["lists", 'id']) } },
            lists: { id: { 0: $ref(["movies", 'pulp-fiction']) } }
        }));
    });

    it("through a reference that lands on an atom", function() {

        var lru = new Object();
        var cache = {};
        var version = 0;

        setPathValues(
            getModel({ lru: lru, cache: cache, version: version++ }), [
                $pathValue(["grid"], $ref(["grids", 'id'])),
                $pathValue(["grids", 'id', 0], $ref(["lists", 'id'])),
                $pathValue(["lists", 'id', 1], $ref(["movies", 'kill-bill-1'])),
                $pathValue(["movies", 'kill-bill-1', 'title'], $atom())
            ]
        );

        invalidatePathSets(
            getModel({ lru: lru, cache: cache, version: version++ }), [
                $path(["grid", 0, 1, 'title'])
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref(["grids", 'id']),
            grids: { id: { 0: $ref(["lists", 'id']) } },
            lists: { id: { 1: $ref(["movies", 'kill-bill-1']) } }
        }));
    });


    it("short-circuits on a broken reference", function() {

        var lru = new Object();
        var cache = {};
        var version = 0;

        setPathValues(
            getModel({ lru: lru, cache: cache, version: version++ }), [
                $pathValue(["grid"], $ref(["grids", 'id'])),
                $pathValue(["grids", 'id', 0], $ref(["lists", 'id'])),
                $pathValue(["lists", 'id', 2], $ref(["movies", 'reservior-dogs']))
            ]
        );

        invalidatePathSets(
            getModel({ lru: lru, cache: cache, version: version++ }), [
                $path(["grid", 0, 2, 'title'])
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref(["grids", 'id']),
            grids: { id: { 0: $ref(["lists", 'id']) } },
            lists: { id: { 2: $ref(["movies", 'reservior-dogs']) } }
        }));
    });

    it("through a reference with a null last key", function() {

        var lru = new Object();
        var cache = {};
        var version = 0;

        setPathValues(
            getModel({ lru: lru, cache: cache, version: version++ }), [
                $pathValue(["grid"], $ref(["grids", 'id'])),
                $pathValue(["grids", 'id', 0], $ref(["lists", 'id'])),
                $pathValue(["lists", 'id', 2], $ref(["movies", 'reservior-dogs'])),
                $pathValue(["movies", 'reservior-dogs', 'title'], "Reservior Dogs")
            ]
        );

        invalidatePathSets(
            getModel({ lru: lru, cache: cache, version: version++ }), [
                $path(["grid", 0, 2, null])
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref(["grids", 'id']),
            grids: { id: { 0: $ref(["lists", 'id']) } },
            lists: { id: { 2: $ref(["movies", 'reservior-dogs']) } }
        }));
    });

    describe("in multiple places", function() {
        describe("via keyset", function() {
            it("directly", function() {

                var lru = new Object();
                var cache = {};
                var version = 0;

                setPathValues(
                    getModel({ lru: lru, cache: cache, version: version++ }), [
                        $pathValue(["movies", ['pulp-fiction', 'kill-bill-1', 'reservior-dogs'], 'director'], "Quentin Tarantino")
                    ]
                );

                invalidatePathSets(
                    getModel({ lru: lru, cache: cache, version: version++ }), [
                        $path(["movies", ['pulp-fiction', 'kill-bill-1', 'reservior-dogs'], 'director'])
                    ]
                );

                expect(strip(cache)).to.deep.equal(strip({}));
            });
            it("through successful, short-circuit, and broken references", function() {

                var lru = new Object();
                var cache = {};
                var version = 0;

                setPathValues(
                    getModel({ lru: lru, cache: cache, version: version++ }), [
                        $pathValue(["grid"], $ref(["grids", 'id'])),
                        $pathValue(["grids", 'id', 0], $ref(["lists", 'id'])),
                        $pathValue(["lists", 'id', 0], $ref(["movies", 'pulp-fiction'])),
                        $pathValue(["lists", 'id', 1], $ref(["movies", 'kill-bill-1'])),
                        $pathValue(["lists", 'id', 2], $ref(["movies", 'reservior-dogs'])),
                        $pathValue(["movies", 'kill-bill-1', 'director'], $atom())
                    ]
                );

                invalidatePathSets(
                    getModel({ lru: lru, cache: cache, version: version++ }), [
                        $path(["grid", 0, [0, 1, 2], 'director'])
                    ]
                );

                expect(strip(cache)).to.deep.equal(strip({
                    grid: $ref(["grids", 'id']),
                    grids: { id: { 0: $ref(["lists", 'id']) } },
                    lists: { id: {
                        0: $ref(["movies", 'pulp-fiction']),
                        1: $ref(["movies", 'kill-bill-1']),
                        2: $ref(["movies", 'reservior-dogs']) }
                    }
                }));
            });
        });
        describe("via range", function() {
            it("to:2", function() {

                var lru = new Object();
                var cache = {};
                var version = 0;

                setPathValues(
                    getModel({ lru: lru, cache: cache, version: version++ }), [
                        $pathValue(["grid"], $ref(["grids", 'id'])),
                        $pathValue(["grids", 'id', 0], $ref(["lists", 'id'])),
                        $pathValue(["lists", 'id', 0], $ref(["movies", 'pulp-fiction'])),
                        $pathValue(["lists", 'id', 1], $ref(["movies", 'kill-bill-1'])),
                        $pathValue(["lists", 'id', 2], $ref(["movies", 'reservior-dogs'])),
                        $pathValue(["movies", 'kill-bill-1', 'director'], $atom())
                    ]
                );

                invalidatePathSets(
                    getModel({ lru: lru, cache: cache, version: version++ }), [
                        $path(["grid", 0, {from: 0, to: 2}, 'director'])
                    ]
                );

                expect(strip(cache)).to.deep.equal(strip({
                    grid: $ref(["grids", 'id']),
                    grids: { id: { 0: $ref(["lists", 'id']) } },
                    lists: { id: {
                        0: $ref(["movies", 'pulp-fiction']),
                        1: $ref(["movies", 'kill-bill-1']),
                        2: $ref(["movies", 'reservior-dogs']) }
                    }
                }));
            });
            it("from:1, to:2", function() {

                var lru = new Object();
                var cache = {};
                var version = 0;

                setPathValues(
                    getModel({ lru: lru, cache: cache, version: version++ }), [
                        $pathValue(["grid"], $ref(["grids", 'id'])),
                        $pathValue(["grids", 'id', 0], $ref(["lists", 'id'])),
                        $pathValue(["lists", 'id', 1], $ref(["movies", 'kill-bill-1'])),
                        $pathValue(["lists", 'id', 2], $ref(["movies", 'reservior-dogs'])),
                        $pathValue(["movies", 'kill-bill-1', 'director'], $atom())
                    ]
                );

                invalidatePathSets(
                    getModel({ lru: lru, cache: cache, version: version++ }), [
                        $path(["grid", 0, {from: 1, to: 2}, 'director'])
                    ]
                );

                expect(strip(cache)).to.deep.equal(strip({
                    grid: $ref(["grids", 'id']),
                    grids: { id: { 0: $ref(["lists", 'id']) } },
                    lists: { id: {
                        1: $ref(["movies", 'kill-bill-1']),
                        2: $ref(["movies", 'reservior-dogs']) }
                    }
                }));
            });
            it("length:3", function() {

                var lru = new Object();
                var cache = {};
                var version = 0;

                setPathValues(
                    getModel({ lru: lru, cache: cache, version: version++ }), [
                        $pathValue(["grid"], $ref(["grids", 'id'])),
                        $pathValue(["grids", 'id', 0], $ref(["lists", 'id'])),
                        $pathValue(["lists", 'id', 0], $ref(["movies", 'pulp-fiction'])),
                        $pathValue(["lists", 'id', 1], $ref(["movies", 'kill-bill-1'])),
                        $pathValue(["lists", 'id', 2], $ref(["movies", 'reservior-dogs'])),
                        $pathValue(["movies", 'kill-bill-1', 'director'], $atom())
                    ]
                );

                invalidatePathSets(
                    getModel({ lru: lru, cache: cache, version: version++ }), [
                        $path(["grid", 0, {length: 3}, "director"])
                    ]
                );

                expect(strip(cache)).to.deep.equal(strip({
                    grid: $ref(["grids", 'id']),
                    grids: { id: { 0: $ref(["lists", 'id']) } },
                    lists: { id: {
                        0: $ref(["movies", 'pulp-fiction']),
                        1: $ref(["movies", 'kill-bill-1']),
                        2: $ref(["movies", 'reservior-dogs']) }
                    }
                }));
            });
            it("from:1, length:2", function() {

                var lru = new Object();
                var cache = {};
                var version = 0;

                setPathValues(
                    getModel({ lru: lru, cache: cache, version: version++ }), [
                        $pathValue(["grid"], $ref(["grids", 'id'])),
                        $pathValue(["grids", 'id', 0], $ref(["lists", 'id'])),
                        $pathValue(["lists", 'id', 1], $ref(["movies", 'kill-bill-1'])),
                        $pathValue(["lists", 'id', 2], $ref(["movies", 'reservior-dogs'])),
                        $pathValue(["movies", 'kill-bill-1', 'director'], $atom())
                    ]
                );

                invalidatePathSets(
                    getModel({ lru: lru, cache: cache, version: version++ }), [
                        $path(["grid", 0, {from: 1, length: 2}, "director"])
                    ]
                );

                expect(strip(cache)).to.deep.equal(strip({
                    grid: $ref(["grids", 'id']),
                    grids: { id: { 0: $ref(["lists", 'id']) } },
                    lists: { id: {
                        1: $ref(["movies", 'kill-bill-1']),
                        2: $ref(["movies", 'reservior-dogs']) }
                    }
                }));
            });
            it("[length:3]", function() {

                var lru = new Object();
                var cache = {};
                var version = 0;

                setPathValues(
                    getModel({ lru: lru, cache: cache, version: version++ }), [
                        $pathValue(["grid"], $ref(["grids", 'id'])),
                        $pathValue(["grids", 'id', 0], $ref(["lists", 'id'])),
                        $pathValue(["lists", 'id', 0], $ref(["movies", 'pulp-fiction'])),
                        $pathValue(["lists", 'id', 1], $ref(["movies", 'kill-bill-1'])),
                        $pathValue(["lists", 'id', 2], $ref(["movies", 'reservior-dogs'])),
                        $pathValue(["movies", 'kill-bill-1', 'director'], $atom())
                    ]
                );

                invalidatePathSets(
                    getModel({ lru: lru, cache: cache, version: version++ }), [
                        $path(["grid", 0, [{length: 3}], "director"])
                    ]
                );

                expect(strip(cache)).to.deep.equal(strip({
                    grid: $ref(["grids", 'id']),
                    grids: { id: { 0: $ref(["lists", 'id']) } },
                    lists: { id: {
                        0: $ref(["movies", 'pulp-fiction']),
                        1: $ref(["movies", 'kill-bill-1']),
                        2: $ref(["movies", 'reservior-dogs']) }
                    }
                }));
            });
        });
    });
});
