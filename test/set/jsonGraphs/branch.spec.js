var $ref = require("falcor-json-graph").ref;
var strip = require("../support/strip");
var $atom = require("falcor-json-graph").atom;
var $ref = require("falcor-json-graph").ref;
var $error = require("falcor-json-graph").error;
var $pathValue = require("falcor-json-graph").pathValue;
var $jsonGraph = require("../support/jsonGraph");
var $jsonGraphEnvelope = require("../support/jsonGraphEnvelope");

var expect = require('chai').expect;
var getModel = require("../support/getModel");
var setJSONGraphs = require("../../../lib/set/setJSONGraphs");
var NullInPathError = require('./../../../lib/errors/NullInPathError');
var Model = require('./../../../lib');

describe("a primitive over a branch", function() {
    it('should allow null at end of path.', function() {
        var model = new Model();
        var error;
        try {
            setJSONGraphs(
                model,
                [{
                    jsonGraph: {
                        a: $ref(['b']),
                        b: 'title'
                    },
                    paths: [
                        ['a', null]
                    ]
                }]
            );
        }
        catch (e) {
            error = e;
        }
        finally {
            expect(error).to.not.be.ok;
        }
    });

    it('should throw an error if null is in middle of path.', function() {
        var model = new Model();
        var error;
        try {
            setJSONGraphs(
                model,
                [{
                    jsonGraph: {
                        a: $ref(['b']),
                        b: {
                            c: 'title'
                        }
                    },
                    paths: [
                        ['a', null, 'c']
                    ]
                }]
            );
        }
        catch (e) {
            error = e;
        }
        finally {
            expect(error instanceof NullInPathError).to.be.ok;
        }
    });

    it("directly", function() {

        var lru = new Object();
        var cache = {};
        var version = 0;

        setJSONGraphs(
            getModel({ lru: lru, cache: cache, version: version++ }), [
            $jsonGraphEnvelope([
                $pathValue("movies['pulp-fiction'].title", "Pulp Fiction")
            ])]
        );

        setJSONGraphs(
            getModel({ lru: lru, cache: cache, version: version++ }), [
            $jsonGraphEnvelope([
                $pathValue("movies['pulp-fiction']", "Pulp Fiction")
            ])]
        )

        expect(strip(cache)).to.deep.equal(strip({
            movies: { "pulp-fiction": $atom("Pulp Fiction") }
        }));
    });

    it("through a reference with a null last key", function() {

        var lru = new Object();
        var cache = {};
        var version = 0;

        setJSONGraphs(
            getModel({ lru: lru, cache: cache, version: version++ }), [
            $jsonGraphEnvelope([
                $pathValue("grid", $ref("grids['id']")),
                $pathValue("grids['id'][0]", $ref("lists['id']")),
                $pathValue("lists['id'][0]", $ref("movies['pulp-fiction']")),
                $pathValue("movies['pulp-fiction'].title", "Pulp Fiction")
            ])]
        );

        setJSONGraphs(
            getModel({ lru: lru, cache: cache, version: version++ }), [{
                paths: [["grid", 0, 0, null]],
                jsonGraph: $jsonGraph([
                    $pathValue("movies['pulp-fiction']", "Pulp Fiction")
                ])
            }]
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

        var lru = new Object();
        var cache = {};
        var version = 0;

        setJSONGraphs(
            getModel({ cache: cache, version: version++ }), [
            $jsonGraphEnvelope([
                $pathValue("movies['pulp-fiction'].title", "Pulp Fiction"),
            ])]
        );

        setJSONGraphs(
            getModel({ lru: lru, cache: cache, version: version++ }), [
            $jsonGraphEnvelope([
                $pathValue("movies['pulp-fiction']", $error("oops"))
            ])]
        )

        expect(strip(cache)).to.deep.equal(strip({
            movies: { "pulp-fiction": $error("oops") }
        }));
    });

    it("through a reference with a null last key", function() {

        var lru = new Object();
        var cache = {};
        var version = 0;

        setJSONGraphs(
            getModel({ lru: lru, cache: cache, version: version++ }), [
            $jsonGraphEnvelope([
                $pathValue("grid", $ref("grids['id']")),
                $pathValue("grids['id'][0]", $ref("lists['id']")),
                $pathValue("lists['id'][0]", $ref("movies['pulp-fiction']")),
                $pathValue("movies['pulp-fiction'].title", "Pulp Fiction")
            ])]
        );

        setJSONGraphs(
            getModel({ lru: lru, cache: cache, version: version++ }), [{
                paths: [["grid", 0, 0, null]],
                jsonGraph: $jsonGraph([
                    $pathValue("movies['pulp-fiction']", $error("oops"))
                ])
            }]
        );

        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref("grids['id']"),
            grids: { id: { 0: $ref("lists['id']") } },
            lists: { id: { 0: $ref("movies['pulp-fiction']") } },
            movies: { "pulp-fiction": $error("oops") }
        }));
    });
});
