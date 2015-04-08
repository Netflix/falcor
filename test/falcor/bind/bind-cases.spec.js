var jsong = require("../../../index");
var Model = jsong.Model;
var Rx = require("rx");
var Cache = require("../../data/Cache");
var LocalDataSource = require("../../data/LocalDataSource");
var testRunner = require("../../testRunner");
var Expected = require("../../data/expected");
var Bound = Expected.Bound;
var noOp = function() {};
describe('Bind', function() {
    it('should bind to a branch node.', function(done) {
        var model = new Model({source: new LocalDataSource(Cache())});
        var count = 0;
        var expected = Bound().directValue.AsPathMap.values[0];
        model = model.
            bind(["genreList", 0, 0], ['summary']).
            flatMap(function(model) {
                return model.get(['summary']);
            }).
            doAction(function(x) {
                testRunner.compare(expected, x);
                count++;
            }, noOp, function() {
                testRunner.compare(1, count, 'onNext should be called 1 time.');
            }).
            subscribe(noOp, done, done);
    });
});
