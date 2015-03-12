var jsong = require("../../bin/Falcor");
var Model = jsong.Model;
var expect = require('chai').expect;

describe("Special Cases", function() {
    it("set blows away the cache.", function() {
        var model = new Model({});
        var get = [["genreList", 1, 0, "summary"]];

        // this mimicks the server setting cycle from the router.
        var set = [
            {
                jsong: {"genreList": {"0": ["lists", "abcd"], "1": ["lists", "my-list"]}},
                paths: [['genreList', {to:1}, 0, 'summary']]
            },
            {
                jsong: {"lists": {"abcd": {"0": ["videos", 1234]}, "my-list": ["lists", "1x5x"]}},
                paths: [["genreList", 1, 0, "summary"]]
            },
            
            // TODO: Paul, this is the one the makes _cache.lists = undefined
            {
                jsong: {"lists": {"1x5x": {"0": ["videos", 553]}}},
                paths: [["genreList", 1, 0, "summary"]]
            },
            {
                jsong: {"videos": {"553": {"summary": {"$size": 10, "$type": "leaf", "title": "Running Man", "url": "/movies/553"}}}},
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
});

