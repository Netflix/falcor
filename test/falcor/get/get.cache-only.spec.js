var jsong = require('../../../index');
var Model = jsong.Model;
var Cache = require('../../data/Cache');
var Expected = require('../../data/expected');
var Rx = require('rx');
var getTestRunner = require('./../../getTestRunner');
var testRunner = require('./../../testRunner');
var noOp = function() {};
var Observable = Rx.Observable;
var falcor = {Model: Model, Observable:Observable};

describe('Cache Only', function() {
    describe('Selector Functions', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({cache: Cache()});
            var expected = Expected.Values().direct.AsJSON.values[0].json;
            var selector = false;
            var next = false;
            model.
                get(['videos', 1234, 'summary'], function(x) {
                    testRunner.compare(expected, x);
                    selector = true;
                    return {value: x};
                }).
                doAction(function(x) {
                    next = true;
                    testRunner.compare({value: expected}, x);
                }, noOp, function() {
                    testRunner.compare(true, selector, 'Expect to be onNext at least 1 time.');
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
    });

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

            model.get(["user", "name"]).toPathValues().subscribe(function(pathValue) {
                value = pathValue;
            });

            if (value === undefined) {
                throw new Error("Value not retrieved from cache, despite the fact that it has not expired");
            }
        });
    });

    describe('Allow Arrays in JSON Graph branch position', function() {
        it('get should go right through arrays in branch position', function() {
            var model = new falcor.Model({
                cache: {
                    users: [
                        {
                            name: "Jim",
                            age: 23
                        },
                        {
                            name: "John",
                            age: 44
                        },
                        {
                            name: "Derek",
                            age: 22
                        }
                    ]
                }
            });

            model.get(["users", {length:3}, ["name","age"]]).toPathValues().toArray().subscribe(function(vals) {
                // console.log(JSON.stringify(vals));
                testRunner.compare(
                    JSON.stringify(vals),
                    '[{"path":["users",0,"name"],"value":"Jim"},{"path":["users",0,"age"],"value":23},{"path":["users",1,"name"],"value":"John"},{"path":["users",1,"age"],"value":44},{"path":["users",2,"name"],"value":"Derek"},{"path":["users",2,"age"],"value":22}]',
                    'JSON Graphs That contain arrays in the bridge deposition return the same thing as those that contain maps in the branch position when given the same query');
            });
        });
    });

    describe('toJSON', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({cache: Cache()});
            var expected = Expected.Values().direct.AsPathMap.values[0];
            var next = false;
            model.
                get(['videos', 1234, 'summary']).
                toJSON().
                doAction(function(x) {
                    testRunner.compare(expected, x);
                    next = true;
                }, noOp, function() {
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('toJSONG', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({cache: Cache()});
            var expected = Expected.Values().direct.AsJSONG.values[0];
            var next = false;
            model.
                get(['videos', 1234, 'summary']).
                toJSONG().
                doAction(function(x) {
                    testRunner.compare(expected, x);
                    next = true;
                }, noOp, function() {
                    testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
                }).
                subscribe(noOp, done, done);
        });
    });
    describe('toPathValues', function() {
        it('should get a value from falcor.', function(done) {
            var model = new Model({cache: Cache()});
            var expected = Expected.Values().direct.AsValues.values[0];
            var next = 0;
            model.
                get(['videos', 1234, 'summary']).
                toPathValues().
                doAction(function(x) {
                    testRunner.compare(expected, x);
                    ++next;
                }, noOp, function() {
                    testRunner.compare(1, next, 'Expect to be onNext 1 time.');
                }).
                subscribe(noOp, done, done);
        });
    });
});
