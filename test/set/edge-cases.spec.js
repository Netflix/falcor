var jsong = require("../../index");
var Model = jsong.Model;
var expect = require('chai').expect;
var $path = require("../../lib/types/path");
var $atom = require("../../lib/types/atom");
var testRunner = require('../testRunner');

describe("Special Cases", function() {
    it('should set the cache in.', function() {
        var model = new Model({cache: {}});
        var edgeCaseCache = {
            jsong: {
                user: {
                    name: "Jim",
                    location: {$type: "error", value: "Something broke!"},
                    age: {$type: $atom}
                }
            },
            paths: [
                ['user', ['name', 'location', 'age']]
            ]
        };

        var pathMap = [{}];
        model._setJSONGsAsPathMap(model, [edgeCaseCache], pathMap);

        testRunner.compare({
            json: {
                user: {
                    name: 'Jim'
                }
            }
        }, pathMap[0]);

        var jsons = [{}];
        model._cache = {};
        model._setJSONGsAsJSON(model, [edgeCaseCache], jsons);
        testRunner.compare({ json: { name: 'Jim' } }, jsons[0]);
    });
    it("set blows away the cache.", function() {
        var model = new Model({});
        var get = [["genreList", 1, 0, "summary"]];

        // this mimicks the server setting cycle from the router.
        var set = [
            {
                jsong: {"genreList": {
                    "0": { "$type": $path, "value": ["lists", "abcd"] },
                    "1": { "$type": $path, "value": ["lists", "my-list"] }
                }},
                paths: [['genreList', {to:1}, 0, 'summary']]
            },
            {
                jsong: {"lists": {
                    "abcd": { "0": { "$type": $path, "value": ["videos", 1234] } },
                    "my-list": { "$type": $path, "value": ["lists", "1x5x"] }
                }},
                paths: [["genreList", 1, 0, "summary"]]
            },
            {
                jsong: {"lists": {"1x5x": {
                    "0": { "$type": $path, "value": ["videos", 553] }
                }}},
                paths: [["genreList", 1, 0, "summary"]]
            },
            {
                jsong: {"videos": {"553": {"summary": {
                    "$size": 10,
                    "$type": $atom,
                    "value": {
                        "title": "Running Man",
                        "url": "/movies/553"
                    }
                }}}},
                paths: [["genreList", 1, 0, "summary"]]
            }
        ];

        var seed = [{}];
        set.forEach(function(s, i) {
            model._setJSONGsAsPathMap(model, [s], seed);
            if (i === 2) {
                expect(model._cache.lists).to.be.ok;
            }
        });

        model._getPathSetsAsValues(model, get, function(x) {
            expect(x).to.deep.equals({
                value: {
                    "title": "Running Man",
                    "url": "/movies/553"
                },
                path: ["genreList", 1, 0, "summary"]
            });
        });
    });

    it('should return the ranged items when ranges in array.', function() {
        var JSONG = {
            jsong: {
                foo: {
                    0: {
                        $type: $atom,
                        value: 0
                    },
                    1: {
                        $type: $atom,
                        value: 75
                    }
                }
            },
            paths: [
                ['foo', [{from: 0, to: 1}]]
            ]
        };
        var model = new Model();
        var out = [{}];

        model._setJSONGsAsJSON(model, [JSONG], out);
        expect(out[0].json).to.deep.equals({
            0: 0,
            1: 75
        });
    });
});

