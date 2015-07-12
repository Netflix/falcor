var falcor = require("./../../../lib/");
var Model = falcor.Model;
var Cache = require('../../data/Cache');
var M = require('../../data/ReducedCache').MinimalCache;
var Expected = require('../../data/expected');
var Rx = require('rx');
var getTestRunner = require('./../../getTestRunner');
var testRunner = require('./../../testRunner');
var noOp = function() {};
var LocalDataSource = require('../../data/LocalDataSource');
var ErrorDataSource = require('../../data/ErrorDataSource');

describe('DataSource and Bind', function() {
    it('should get a value from from dataSource when bound.', function(done) {
        var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
        model._root.unsafeMode = true;
        model = model.bindSync(['genreList', 0]);
        var expected = {
            "title": "Terminator 3",
            "url": "/movies/766"
        };
        var selector = false;
        var next = false;
        model.
            get([1, 'summary'], function(x) {
                testRunner.compare(expected, x);
                selector = true;

                return {value: x};
            }).
            doAction(function(x) {
                next = true;
                testRunner.compare({value: expected}, x);
            }, noOp, function() {
                testRunner.compare(true, selector, 'Expect to be onNext at least 1 time.');;
                testRunner.compare(true, next, 'Expect to be onNext at least 1 time.');
            }).
            subscribe(noOp, done, done);
    });
});

