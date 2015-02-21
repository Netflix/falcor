var jsong = require("../../../bin/Falcor");
var R = require('falcor-router');
var Routes = require('../../data/routes');
var Rx = require("rx");
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};

var Expected = require('../../data/expected');
var Values = Expected.Values;
var References = Expected.References;
var RouterTestRunner = require('../../routerTestRunner');

describe("PathValues", function() {
    it('should match a simple route in the virtual path.', function(done) {
        var r = new R(Routes().Videos.Integers.Summary);
        var model = new jsong.Model({router: r});

        var expected = Values().direct.AsValues.values;
        var obs = model.
            get(['videos', 1234, 'summary']).
            toPathValues();

        RouterTestRunner.run(obs, expected).
            subscribe(noOp, done, done);
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

        var obs = model.
            get(['genreList', 0, 0, 'summary']);
        var expected = References().simpleReference0.AsPathMap.values;

        RouterTestRunner.run(obs, expected).
            subscribe(noOp, done, done);
    });

    it('should match some values, but not other missing values.', function(done) {
        var routes = [].
            concat(
            Routes().Videos.Integers.Summary).
            concat(
            Routes().Lists.byIdx).
            concat(
            Routes().GenreList.Ranges);
        var r = new R(routes);
        var model = new jsong.Model({router: r});

        var obs = model.
            get(['genreList', 0, 0, 'summary'], ['videos', 123123, 'summary']);
        var expected = References().simpleReference0.AsPathMap.values;

        RouterTestRunner.run(obs, expected).
            subscribe(noOp, done, done);
    });
    
    it.only('should match a complex pathSet', function(done) {
        var routes = [].
            concat(
            Routes().Videos.Integers.Summary).
            concat(
            Routes().Lists.byIdx).
            concat(
            Routes().GenreList.Ranges);
        debugger;
        var r = new R(routes);
        var model = new jsong.Model({router: r});
        var count = 0;
        var r0 = References().simpleReference0.AsValues.values[0];
        var r1 = References().simpleReference1.AsValues.values[0];
        var expected = [r0, r1];
        model.
            get(['genreList', {to:1}, 0, 'summary']).
            toPathValues().
            doOnCompleted(function() {
                expect(count, 'expect the selector function to be called two times.').to.equal(2);
            }).
            subscribe(function(x) {
                RouterTestRunner.partialCompare([expected[count]], x);
                count++;
            }, done, done);
    });
});

