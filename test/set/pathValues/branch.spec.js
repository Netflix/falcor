var $ref = require("falcor-json-graph").ref;
var strip = require("../support/strip");
var $atom = require("falcor-json-graph").atom;
var $error = require("falcor-json-graph").error;
var $pathValue = require("falcor-json-graph").pathValue;

var expect = require('chai').expect;
var getModel = require("../support/getModel");
var setPathValues = require("../../../lib/set/setPathValues");
var NullInPathError = require('./../../../lib/errors/NullInPathError');
var Model = require('./../../../lib');

describe("a primitive over a branch", function() {
    it('should allow null at end of path.', function() {
        var cache = {
            a: $ref(['b']),
            b: 'title'
        };
        var model = new Model({
            cache: cache
        });
        var error;
        try {
            setPathValues(
                model,
                [{
                    path: ['a', null],
                    value: 'summary'
                }]
            );
        }
        catch (e) {
            error = e;
        }
        finally {
            expect(error).to.not.be.ok;
            expect(strip(model._root.cache)).to.deep.equal(strip({
                a: $ref(['b']),
                b: $atom('summary')
            }));
        }
    });

    it('should throw an error if null is in middle of path.', function() {
        var model = new Model();
        var error;
        try {
            setPathValues(
                model,
                [{
                    path: ['a', null, 'c'],
                    value: 'summary'
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

        var cache = {};
        var version = 0;
        setPathValues(
            getModel({ cache: cache, version: version++ }), [
                $pathValue("movies['pulp-fiction'].title", "Pulp Fiction"),
                $pathValue("movies['pulp-fiction']", "Pulp Fiction")
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            movies: { "pulp-fiction": $atom("Pulp Fiction") }
        }));
    });

    it("through a reference with a null last key", function() {

        var cache = {};
        var version = 0;
        setPathValues(
            getModel({ cache: cache, version: version++ }), [
                $pathValue("grid", $ref("grids['id']")),
                $pathValue("grids['id'][0]", $ref("lists['id']")),
                $pathValue("lists['id'][0]", $ref("movies['pulp-fiction']")),
                $pathValue("movies['pulp-fiction'].title", "Pulp Fiction")
            ]
        );

        setPathValues(
            getModel({ cache: cache, version: version++ }), [
                $pathValue(["grid", 0, 0, null], "Pulp Fiction")
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
        setPathValues(
            getModel({ cache: cache, version: version++ }), [
                $pathValue("movies['pulp-fiction'].title", "Pulp Fiction"),
                $pathValue("movies['pulp-fiction']", $error("oops"))
            ]
        );

        expect(strip(cache)).to.deep.equal(strip({
            movies: { "pulp-fiction": $error("oops") }
        }));
    });

    it("through a reference with a null last key", function() {

        var cache = {};
        var version = 0;
        setPathValues(
            getModel({ cache: cache, version: version++ }), [
                $pathValue("grid", $ref("grids['id']")),
                $pathValue("grids['id'][0]", $ref("lists['id']")),
                $pathValue("lists['id'][0]", $ref("movies['pulp-fiction']")),
                $pathValue("movies['pulp-fiction'].title", "Pulp Fiction")
            ]
        );

        setPathValues(
            getModel({ cache: cache, version: version++ }), [
                $pathValue(["grid", 0, 0, null], $error("oops"))
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
