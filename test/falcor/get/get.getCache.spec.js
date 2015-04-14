var jsong = require('../../../index');
var Model = jsong.Model;
var Cache = require('../../set/support/whole-cache');
var Rx = require('rx');
var getTestRunner = require('./../../getTestRunner');
var testRunner = require('./../../testRunner');
var noOp = function() {};
var Observable = Rx.Observable;
var falcor = {Model: Model, Observable:Observable};

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