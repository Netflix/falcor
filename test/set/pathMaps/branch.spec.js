var $ref = require("falcor-json-graph").ref;
var strip = require("../support/strip");
var $atom = require("falcor-json-graph").atom;
var $error = require("falcor-json-graph").error;
var $pathMapEnvelope = require("../support/pathMapEnvelope");

var expect = require('chai').expect;
var getModel = require("../support/getModel");
var setPathMaps = require("../../../lib/set/setPathMaps");

describe("a primitive over a branch", function() {

    it("directly", function() {

        var cache = {};
        var version = 0;
        setPathMaps(
            getModel({ cache: cache, version: version++ }), [
                $pathMapEnvelope("movies['pulp-fiction'].title", "Pulp Fiction"),
                $pathMapEnvelope("movies['pulp-fiction']", "Pulp Fiction")
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            movies: { "pulp-fiction": $atom("Pulp Fiction") }
        }));
    });

    xit("through a reference with a null last key", function() {

        var cache = {};
        var version = 0;
        setPathMaps(
            getModel({ cache: cache, version: version++ }), [
                $pathMapEnvelope("grid", $ref("grids['id']")),
                $pathMapEnvelope("grids['id'][0]", $ref("lists['id']")),
                $pathMapEnvelope("lists['id'][0]", $ref("movies['pulp-fiction']")),
                $pathMapEnvelope("movies['pulp-fiction'].title", "Pulp Fiction")
            ]
        );

        setPathMaps(
            getModel({ cache: cache, version: version++ }), [
                $pathMapEnvelope(["grid", 0, 0, null], "Pulp Fiction")
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref("grids['id']"),
            grids: { id: { 0: $ref("lists['id']") } },
            lists: { id: { 0: $ref("movies['pulp-fiction']") } },
            movies: { "pulp-fiction": $atom("Pulp Fiction") }
        }));
    });
});

describe("set an error over a branch", function() {

    it("directly", function() {

        var cache = {};
        var version = 0;
        setPathMaps(
            getModel({ cache: cache, version: version++ }), [
                $pathMapEnvelope("movies['pulp-fiction'].title", "Pulp Fiction"),
                $pathMapEnvelope("movies['pulp-fiction']", $error("oops"))
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            movies: { "pulp-fiction": $error("oops") }
        }));
    });

    xit("through a reference with a null last key", function() {

        var cache = {};
        var version = 0;
        setPathMaps(
            getModel({ cache: cache, version: version++ }), [
                $pathMapEnvelope("grid", $ref("grids['id']")),
                $pathMapEnvelope("grids['id'][0]", $ref("lists['id']")),
                $pathMapEnvelope("lists['id'][0]", $ref("movies['pulp-fiction']")),
                $pathMapEnvelope("movies['pulp-fiction'].title", "Pulp Fiction")
            ]
        );

        setPathMaps(
            getModel({ cache: cache, version: version++ }), [
                $pathMapEnvelope(["grid", 0, 0, null], $error("oops"))
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref("grids['id']"),
            grids: { id: { 0: $ref("lists['id']") } },
            lists: { id: { 0: $ref("movies['pulp-fiction']") } },
            movies: { "pulp-fiction": $error("oops") }
        }));
    });
});
