var jsong = require("../../../bin/Falcor");
var R = require('falcor-router');
var Routes = require('../../data/routes');
var Rx = require("rx");
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};

var Expected = require('../../data/expected');
var Values = Expected.Values;
var RouterTestRunner = require('../../routerTestRunner');

describe("Selector", function() {
    it('should match a simple route in the virtual path.', function(done) {
        var r = new R(Routes().Videos.Integers.Summary);
        var model = new jsong.Model({router: r});
        var count = 0;
        var expected = Values().direct.AsJSON.values;
        debugger;
        model.
            get(['videos', 1234, 'summary'], function(video) {
                count++;
                RouterTestRunner.partialCompare(video, expected);
            }).
            subscribe(noOp, done, function() {
                expect(count, 'expect the selector function to be called one time.').to.equal(1);
            });
    });

    it('should match a value and follow references.', function(done) {
        var routes = [].
            concat(
            Routes().Videos.Integers.Summary).
            concat(
            Routes().Lists.byIdx).
            concat(
            Routes().GenreList.Ranges);
        var r = new R(routes);
        var model = new jsong.Model({router: r});

        model.
            get(['genreList', 0, 0, 'summary']).
            subscribe(function(x) {
                debugger;
            }, done, done);
    });
});

