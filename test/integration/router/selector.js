var jsong = require("../../../index");
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

describe("Selector", function() {
    it('should match a simple route in the virtual path.', function(done) {
        var r = new R(Routes().Videos.Integers.Summary);
        var model = new jsong.Model({router: r});
        var count = 0;
        var expected = Values().direct.AsJSON.values;
        model.
            get(['videos', 1234, 'summary'], function(video) {
                count++;
                RouterTestRunner.partialCompare(expected.map(function(x) { return x.json; }), video);
            }).
            subscribe(noOp, done, function() {
                expect(count, 'expect the selector function to be called one time.').to.equal(1);
                done();
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
        var count = 0;
        var expected = References().simpleReference0.AsJSON.values;
        model.
            get(['genreList', 0, 0, 'summary'], function(genreList) {
                count++;
                RouterTestRunner.partialCompare(expected.map(function(x) { return x.json; }), genreList);
            }).
            subscribe(noOp, done, function() {
                expect(count, 'expect the selector function to be called one time.').to.equal(1);
                done();
            });
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
        var count = 0;
        var expected = References().simpleReference0.AsJSON.values;
        model.
            get(['genreList', 0, 0, 'summary'], ['videos', 123123, 'summary'], function(genreList, video) {
                count++;
                RouterTestRunner.partialCompare(expected.map(function(x) { return x.json; }), genreList);
                expect(video).to.not.be.ok;
            }).
            subscribe(noOp, done, function() {
                expect(count, 'expect the selector function to be called one time.').to.equal(1);
                done();
            });
    });

    it('should match a complex pathSet', function(done) {
        var routes = [].
            concat(
                Routes().Videos.Integers.Summary).
            concat(
                Routes().Lists.byIdx).
            concat(
                Routes().GenreList.Ranges);
        var r = new R(routes);
        var model = new jsong.Model({router: r});
        var count = 0;
        var r0 = {0: References().simpleReference0.AsJSON.values[0].json};
        var r1 = {1: References().simpleReference1.AsJSON.values[0].json};
        var expected = [r0, r1];
        model.
            get(['genreList', {to:1}, 0, 'summary'], function(genreList) {
                count++;
                RouterTestRunner.partialCompare(expected, genreList);
            }).
            subscribe(noOp, done, function() {
                expect(count, 'expect the selector function to be called one time.').to.equal(1);
                done();
            });
    });
});

