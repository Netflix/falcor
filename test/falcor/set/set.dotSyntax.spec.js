
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

describe('Dot Syntax', function() {
    it('should be able to do a dotSyntax query', function(done) {
        var model = new Model({cache: Cache()});
        var expected = {
            hello: 'world'
        };
        var next = false;
        model.
            set({path: 'videos[1234].summary', value: expected}).
            toPathValues().
            doAction(function(x) {
                next = true;
                testRunner.compare({
                    path: ['videos', 1234, 'summary'],
                    value: expected
                }, x);
            }, noOp, function() {
                testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
            }).
            subscribe(noOp, done, done);
    });
});
