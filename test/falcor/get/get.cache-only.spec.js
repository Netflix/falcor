var falcor = require("./../../../lib");
var Model = falcor.Model;
var Cache = require('../../data/Cache');
var Expected = require('../../data/expected');
var Rx = require('rx');
var getTestRunner = require('./../../getTestRunner');
var testRunner = require('./../../testRunner');
var noOp = function() {};
var Observable = Rx.Observable;
var sinon = require('sinon');
var expect = require('chai').expect;

describe('Cache Only', function() {
    describe('Relative Expiration', function() {
        it('should retrieve a value from the cache that has a relative expiration that has not expired yet', function() {

            var value,
                model = new falcor.Model({
                    cache: {
                        user: {
                            name: {
                                // Metadata that indicates this object is a Sentinel
                                $type: "atom",
                                // The value property contains the value box by the Sentinel
                                value: "Jim Parsons",
                                // Metadata that dictates that this value should be purged from the {@link Model}'s cache after two minutes. Negative numbers imply that expiration occurs relative to the current time.
                                $expires: -(1000 * 60 * 2)
                            }
                        }
                    }
                });

            model.
                get(["user", "name"]).
                subscribe(function(out) {
                    value = pathValue;
                });

            if (value === undefined) {
                throw new Error("Value not retrieved from cache, despite the fact that it has not expired");
            }
        });
    });
    describe('PathMap', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({cache: Cache()});
            var expected = Expected.Values().direct.AsJSONG.values[0];
            var next = false;
            model.
                get(['videos', 1234, 'summary']).
                _toJSONG().
                doAction(function(x) {
                    testRunner.compare(expected, x);
                    next = true;
                }, noOp, function() {
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
    });

    describe('_toJSONG', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({cache: Cache()});
            var expected = Expected.Values().direct.AsJSONG.values[0];
            var next = false;
            model.
                get(['videos', 1234, 'summary']).
                _toJSONG().
                doAction(function(x) {
                    testRunner.compare(expected, x);
                    next = true;
                }, noOp, function() {
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
    });
});
