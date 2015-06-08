var jsong = require('../../../index');
var Model = jsong.Model;
var Cache = require('../../set/support/whole-cache');
var Rx = require('rx');
var getTestRunner = require('./../../getTestRunner');
var testRunner = require('./../../testRunner');
var noOp = function() {};
var Observable = Rx.Observable;
var falcor = {Model: Model, Observable:Observable};
var _ = require('lodash');
var expect = require('chai').expect;
var $ref = falcor.Model.ref;
var $atom = falcor.Model.atom;
var $error = falcor.Model.error;

describe('getCache', function() {
    it("should serialize the cache", function(done) {
        var model = new Model({ cache: Cache() });
        model.
            get(["genreList", {from: -1, to: 12}], function() {})
            // catchException(Rx.Observable.return(model)).
            ['catch'](Rx.Observable.return(model)).
            defaultIfEmpty(null).
            map(function() { return model.getCache(); }).
            subscribe(function(serializedCache) {
                try {
                    testRunner.compare(
                        Cache(), serializedCache,
                        "Serialized cache should be value equal to the original.",
                        {strip: ["$size"]}
                    );
                    done();
                } catch(e) {
                    done(e);
                }
            });
    });

    it("should serialize part of the cache", function(done) {
        var model = new Model({ cache: {
            "list": {
                "0": "foo",
                "1": "bar",
                "2": Model.ref("lists.baz")
            },
            "lists": {
                "baz": {
                    "bam": "bam"
                }
            }
        }});

        var partial = model.getCache(["list", [0, 1]], ["list", 2, "bam"]);
        testRunner.compare({
            "list": {
                "0": Model.atom("foo"),
                "1": Model.atom("bar"),
                "2": Model.ref("lists.baz")
            },
            "lists": {
                "baz": {
                    "bam": Model.atom("bam")
                }
            } },
            partial,
            "Serialized cache should be value equal to the original.",
            {strip: ["$size"]}
        );
        done();
    });

    it('should test the cache again against the example by jafar.', function() {
         var $ref = falcor.Model.ref;
         var $atom = falcor.Model.atom;
         var cache = {
             // list of user's genres, modeled as a map with ordinal keys
             "genreLists": {
                 "0": $ref('genresById[123]'),
                 "length": 1
             },
             // map of all genres, organized by ID
             "genresById": {
                 // genre list modeled as map with ordinal keys
                 "123": {
                     "name": "Drama",
                     "0": $ref('titlesById[23]'),
                     "1": $ref('titlesById[99]'),
                     "length": 2
                 }
             },
             "titlesById": {
                 "23": {
                     "name": "Orange is the New Black",
                     "rating": 5
                 }
             }
         };
         var outCache = {
             // list of user's genres, modeled as a map with ordinal keys
             "genreLists": {
                 "0": $ref('genresById[123]'),
                 "length": $atom(1)
             },
             // map of all genres, organized by ID
             "genresById": {
                 // genre list modeled as map with ordinal keys
                 "123": {
                     "name": $atom('Drama'),
                     "0": $ref('titlesById[23]'),
                     "1": $ref('titlesById[99]'),
                     "length": $atom(2)
                 }
             },
             "titlesById": {
                 "23": {
                     "name": $atom("Orange is the New Black"),
                     "rating": $atom(5)
                 }
             }
         };

        var model = new falcor.Model({cache: _.cloneDeep(cache)});
        var jsonGraph = model.getCache();

        // Who cares about sizes, they are not needed.
        testRunner.compare(outCache, jsonGraph, {
            strip: ['$size']
        });
    });

    it('should pass Professor Kims cache errors.', function() {
        var model = new falcor.Model();
        model.setCache({
            foo: {
                foo: $error("Error message"),
                bar: 5,
                baz: $ref(["foo", "bar"])
            }
        });

        var allCache = model.getCache();
        var specific = model.getCache(['foo', 'bar']);

        var allCacheExpected = {
            foo: {
                foo: $error("Error message"),
                bar: $atom(5),
                baz: $ref(["foo", "bar"])
            }
        };
        allCacheExpected.foo.foo.$size = 63;
        allCacheExpected.foo.bar.$size = 51;
        allCacheExpected.foo.baz.$size = 52;

        var specificExpected = {
            foo: {
                bar: $atom(5)
            }
        };
        specificExpected.foo.bar.$size = 51;

        expect(allCache).to.deep.equals(allCacheExpected);
        expect(specific).to.deep.equals(specificExpected);
    });
});

