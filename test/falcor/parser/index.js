var falcor = require('./../../../index.js');
var testRunner = require('../../testRunner');
var Model = falcor.Model;
var Cache = require('./../../data/Cache');
var Expected = require('./../../data/expected');
var noOp = function() {};

describe('Parser - ensures interface', function() {
    var model = new Model({cache: Cache()});
    var expectedValue = Expected.Values().direct.AsJSON.values[0];
    var complexValue = Expected.Complex().toOnlyLists.AsPathMap.values[0];
    model._root.unsafeMode = true;

    describe('Set', function() {
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
                    }, x);
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
        it('should accept strings for setValueSync', function() {
            var out = model.setValueSync('test[0]', 7);
            testRunner.compare(7, out);
        });
    });

    describe('Bind', function() {
        it('should allow bind', function(done) {
            var called = false;
            model.
                bind('genreList[0][0]', 'summary').
                doAction(function(nextModel) {
                    called = true;
                    testRunner.compare(['videos', 1234], nextModel._path);
                }, noOp, function() {
                    testRunner.compare(true, called,
                       'Expected onNext to be called once.');
                }).
                subscribe(noOp, done, done);
        });

        it('should allow bindSync.', function() {
            var path = model.bindSync('genreList[0][0]')._path;
            testRunner.compare(['videos', 1234], path);
        });
    });
});
