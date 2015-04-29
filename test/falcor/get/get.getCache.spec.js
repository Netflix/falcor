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

describe('getCache', function() {
    it("should serialize the cache", function(done) {
        debugger;
        var model = new Model({ cache: Cache() });
        model.
            get(["genreList", {from: -1, to: 12}], function() {}).
            catchException(Rx.Observable.return(model)).
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

    it.only('should test the cache again against the example by jafar.', function() {
         var $ref = falcor.Model.ref;
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

        var model = new falcor.Model({cache: _.cloneDeep(cache)});
        var jsonGraph = model.getCache();

        expect(jsonGraph).to.deep.equals(cache);
    });
});

