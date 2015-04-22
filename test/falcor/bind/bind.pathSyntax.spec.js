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

describe('Path Syntax', function() {
    var model = new Model({cache: Cache()});
    model._root.unsafeMode = true;
    it('should bindSync to a path syntax.', function() {
        var tmp = model.bindSync('videos[1234]');
        testRunner.compare(['videos', 1234], tmp._path);
    });
    it('should bind to a path syntax.', function(done) {
        var called = false;
        model.
            bind('videos[1234]', 'summary').
            doAction(function(x) {
                called = true;
                testRunner.compare(['videos', 1234], x._path);
            }, noOp, function() {
                testRunner.compare(true, called, 'expect onNext to be called once.');
            }).
            subscribe(noOp, done, done);
    });
});

