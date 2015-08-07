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
    var expectedValue = Expected.Values().direct.AsJSON.values[0].json;
    var complexValue = Expected.Complex().toOnlyLists.AsPathMap.values[0];
    model._root.unsafeMode = true;
    it('should accept strings for get.', function(done) {
        var called = false;
        model.
            get(
                'genreList[0][0].summary',
                {path: 'genreList[1][0].summary'}).
            doAction(function(x) {
                called = true;
                testRunner.compare(complexValue, x);
            }, noOp, function() {
                testRunner.compare(true, called,
                   'The onNext function was expected to be called at least once.');
            }).
            subscribe(noOp, done, done);
    });
    it('should accept strings for getValue', function(done) {
        var called = false;
        model.
            getValue('videos[1234].summary').
            doAction(function(x) {
                called = true;
                testRunner.compare(expectedValue, x);
            }, noOp, function() {
                testRunner.compare(true, called,
                   'The onNext function was expected to be called at least once.');
            }).
            subscribe(noOp, done, done);
    });
});
