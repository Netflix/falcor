var falcor = require("./../../../lib/");
var Model = falcor.Model;
var Cache = require('../../data/Cache');
var Expected = require('../../data/expected');
var Rx = require('rx');
var getTestRunner = require('./../../getTestRunner');
var testRunner = require('./../../testRunner');
var noOp = function() {};
var Observable = Rx.Observable;

describe('Path Syntax', function() {
    var model = new Model({cache: Cache()});
    var expectedValue = Expected.Values().direct.AsJSON.values[0];
    var complexValue = Expected.Complex().toOnlyLists.AsPathMap.values[0];
    model._root.unsafeMode = true;
    it('should accept strings for set in the path argument of a pathValue.', function(done) {
        var called = false;
        model.
            set({path: 'test[0]', value: 5}).
            doAction(function(x) {
                called = true;
                testRunner.compare({
                    test: {
                        0: 5
                    }
                }, x.json);
            }, noOp, function() {
                testRunner.compare(true, called,
                   'The onNext function was expected to be called at least once.');
            }).
            subscribe(noOp, done, done);
    });
    it('should accept strings for setValue', function(done) {
        var called = false;
        model.
            setValue('test[0]', 6).
            doAction(function(x) {
                called = true;
                testRunner.compare(6, x);
            }, noOp, function() {
                testRunner.compare(true, called,
                   'The onNext function was expected to be called at least once.');
            }).
            subscribe(noOp, done, done);
    });
});
