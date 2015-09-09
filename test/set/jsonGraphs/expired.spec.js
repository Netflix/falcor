var $ref = require("falcor-json-graph").ref;
var strip = require("../support/strip");
var $atom = require("falcor-json-graph").atom;
var $pathValue = require("falcor-json-graph").pathValue;
var $jsonGraph = require("../support/jsonGraph");
var $jsonGraphEnvelope = require("../support/jsonGraphEnvelope");

var expect = require('chai').expect;
var getModel = require("../support/getModel");
var setJSONGraphs = require("../../../lib/set/setJSONGraphs");

describe("an expired value", function() {

    it("converts a negative $expires value to an absolute time", function() {

        var cache = {};
        var version = 0;

        setJSONGraphs(
            getModel({ cache: cache, version: version++ }), [
            $jsonGraphEnvelope([
                $pathValue("grid", $ref("grids['id']")),
                $pathValue("grids['id'][0]", $ref("lists['id']", {
                    $expires: -1000
                }))
            ])]
        );

        var value = cache.grids.id[0];
        var expires = value.$expires;

        expect(expires > Date.now()).to.be.true;
        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref("grids['id']"),
            grids: { id: { 0: $ref("lists['id']") } }
        }));
    });

    it("sets through an immediately expired reference", function() {

        var cache = {};
        var version = 0;
        var expired = [];

        setJSONGraphs(
            getModel({ cache: cache, expired: expired, version: version++ }), [{
                paths: [["grid", 0, 0, "title"]],
                jsonGraph: $jsonGraph([
                    $pathValue("grid", $ref("grids['id']")),
                    $pathValue("grids['id'][0]", $ref("lists['id']", {
                        $expires: 0
                    })),
                    $pathValue("lists['id'][0]", $ref("movies['pulp-fiction']")),
                    $pathValue("movies['pulp-fiction'].title", "Pulp Fiction")
                ])
            }]
        );

        expect(expired.length).to.equal(1);
        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref("grids['id']"),
            grids: { id: { 0: $ref("lists['id']") } },
            lists: { id: { 0: $ref("movies['pulp-fiction']") } },
            movies: {
                "pulp-fiction": {
                    "title": $atom("Pulp Fiction")
                }
            }
        }));
    });

    it("short-circuits writing an already expired reference", function() {

        var startTime = Date.now();
        var cache = {};
        var version = 0;
        var expired = [];

        setJSONGraphs(
            getModel({ cache: cache, expired: expired, version: version++ }), [{
                paths: [["grid", 0, 0, "title"]],
                jsonGraph: $jsonGraph([
                    $pathValue("grid", $ref("grids['id']")),
                    $pathValue("grids['id'][0]", $ref("lists['id']", {
                        $expires: startTime - 10
                    })),
                    $pathValue("lists['id'][0]", $ref("movies['pulp-fiction']")),
                    $pathValue("movies['pulp-fiction'].title", "Pulp Fiction")
                ])
            }]
        );

        expect(expired.length).to.equal(1);
        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref("grids['id']"),
            grids: { id: { 0: $ref("lists['id']") } }
        }));
    });

    it("short-circuits writing past an expired reference", function() {

        var lru = new Object();
        var cache = {};
        var version = 0;
        var expired = [];
        var startTime = Date.now();

        setJSONGraphs(
            getModel({ lru: lru, cache: cache, expired: expired, version: version++ }), [{
                paths: [["grid", 0, 0, "title"]],
                jsonGraph: $jsonGraph([
                    $pathValue("grid", $ref("grids['id']")),
                    $pathValue("grids['id'][0]", $ref("lists['id']", {
                        $expires: -5
                    })),
                    $pathValue("lists['id'][0]", $ref("movies['pulp-fiction']")),
                    $pathValue("movies['pulp-fiction'].title", "Pulp Fiction")
                ])
            }]
        );

        do {} while (Date.now() - startTime < 10);

        var successfulPaths = setJSONGraphs(
            getModel({ lru: lru, cache: cache, expired: expired, version: version++ }), [{
                paths: [["grid", 0, 0, "director"]],
                jsonGraph: $jsonGraph([
                    $pathValue("movies['pulp-fiction'].director", "Quentin Tarantino")
                ])
            }]
        );

        expect(successfulPaths[1].length).to.equal(0);
        expect(strip(cache)).to.deep.equal(strip({
            grid: $ref("grids['id']"),
            grids: { id: { 0: $ref("lists['id']") } },
            lists: { id: { 0: $ref("movies['pulp-fiction']") } },
            movies: {
                "pulp-fiction": {
                    "title": $atom("Pulp Fiction")
                }
            }
        }));
    });
});
