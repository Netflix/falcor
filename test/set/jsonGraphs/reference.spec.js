var $ref = require("falcor-json-graph").ref;
var strip = require("../support/strip");
var $atom = require("falcor-json-graph").atom;
var $error = require("falcor-json-graph").error;
var $pathValue = require("falcor-json-graph").pathValue;
var $jsonGraph = require("../support/jsonGraph");
var $jsonGraphEnvelope = require("../support/jsonGraphEnvelope");

var expect = require('chai').expect;
var getModel = require("../support/getModel");
var setJSONGraphs = require("../../../lib/set/setJSONGraphs");

describe("an old reference over a newer reference", function() {

    it("leaves the newer reference in place and short-circuit", function() {

        var startTime = Date.now();
        var lru = new Object();
        var cache = {};
        var version = 0;

        setJSONGraphs(
            getModel({ lru: lru, cache: cache, version: version++ }), [
            $jsonGraphEnvelope([
                $pathValue("grid", $ref("grids['id']")),
                $pathValue("grids['id'][0]", $ref("lists['id']")),
                $pathValue("lists['id'][0]", $ref("movies['pulp-fiction']", {
                    $timestamp: startTime
                })),
                $pathValue("movies['pulp-fiction'].title", "Pulp Fiction")
            ])]
        );

        setJSONGraphs(
            getModel({ lru: lru, cache: cache, version: version++ }), [{
                paths: [["grid", 0, 0, "title"]],
                jsonGraph: $jsonGraph([
                    $pathValue("lists['id'][0]", $ref("movies['kill-bill-1']", {
                        $timestamp: startTime - 10
                    })),
                    $pathValue("movies['kill-bill-1'].title", "Kill Bill")
                ])
            }]
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

    it("should correctly assign ツabsolutePath after setting past references", function() {

        var cache = {};
        var version = 0;

        setJSONGraphs(
            getModel({ cache: cache, version: version++ }), [{
                paths: [["genrelist", [0, 1], "titles", 0, "name"]],
                jsonGraph: {
                    genrelist: {
                        0: { titles: { 0: $ref("titlesById[32]") } },
                        1: { titles: { 0: $ref("titlesById[87]") } }
                    }
                },
                titlesById: {
                    32: { name: "Die Hard" },
                    87: { name: "How to Lose a Guy in Ten Days" }
                }
            }]
        );

        expect(cache.genrelist[0].ツabsolutePath).to.deep.equal(["genrelist", 0]);
        expect(cache.genrelist[1].ツabsolutePath).to.deep.equal(["genrelist", 1]);
    });
});
