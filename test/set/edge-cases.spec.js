var falcor = require("./../../lib/");
var Model = falcor.Model;
var expect = require('chai').expect;
var $path = require("./../../lib/types/ref");
var $atom = require("./../../lib/types/atom");
var testRunner = require('../testRunner');
var sinon = require('sinon');
var noOp = function() {};
var Rx = require('rx');
var Observable = Rx.Observable;

var strip = require("./support/strip");
var $ref = require("falcor-json-graph").ref;
var $atom = require("falcor-json-graph").atom;
var $error = require("falcor-json-graph").error;

describe("Special Cases", function() {
    it('should set in an array and the length should be set in.', function(done) {
        var model = new Model();
        var onNext = sinon.spy();
        model.
            set({
                json: {
                    foo: ['bar']
                }
            }).
            flatMap(function() {
                return model.get('foo.length');
            }).
            doAction(onNext).
            doAction(noOp, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onNext.getCall(0).args[0]).to.deep.equals({
                    json: {foo: { length: 1 } }
                });
            }).
            subscribe(noOp, done, done);
    });
    it('should set the cache in.', function() {
        var model = new Model();
        var cache = model._root.cache;
        var edgeCaseCache = {
            jsonGraph: {
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

        model._setJSONGsAsPathMap(model, [edgeCaseCache]);
        expect(strip(cache)).to.deep.equal(strip(edgeCaseCache.jsonGraph));
    });
    it("set blows away the cache.", function() {
        var model = new Model({});
        var get = [["genreList", 1, 0, "summary"]];

        // this mimicks the server setting cycle from the router.
        var set = [
            {
                jsonGraph: {"genreList": {
                    "0": { "$type": $path, "value": ["lists", "abcd"] },
                    "1": { "$type": $path, "value": ["lists", "my-list"] }
                }},
                paths: [['genreList', {to:1}, 0, 'summary']]
            },
            {
                jsonGraph: {"lists": {
                    "abcd": { "0": { "$type": $path, "value": ["videos", 1234] } },
                    "my-list": { "$type": $path, "value": ["lists", "1x5x"] }
                }},
                paths: [["genreList", 1, 0, "summary"]]
            },
            {
                jsonGraph: {"lists": {"1x5x": {
                    "0": { "$type": $path, "value": ["videos", 553] }
                }}},
                paths: [["genreList", 1, 0, "summary"]]
            },
            {
                jsonGraph: {"videos": {"553": {"summary": {
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
                expect(model._root.cache.lists).to.be.ok;
            }
        });

        model._getPathValuesAsPathMap(model, get, function(x) {
            expect(x).to.deep.equals({ json: { genreList: { 1: { 0: { summary: {
                    "title": "Running Man",
                    "url": "/movies/553"
                } } } } }
            });
        });
    });
});

