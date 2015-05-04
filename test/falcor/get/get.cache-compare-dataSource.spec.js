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
var LocalDataSource = require('../../data/LocalDataSource');

describe.only('DataSource compare to Cache', function() {
    describe('toJSONG', function() {
        it('should get a set of values including a materialized node.', function(done) {
            test(
                ['misc', 'uatom'],
                'toJSONG'
            ).subscribe(noOp, done, done);
        });
    });
});

function getCacheModel() {
    return new falcor.Model({cache: Cache()});
}
function getSourceModel() {
    return new falcor.Model({source: new LocalDataSource(Cache(), {materialize: true})});
}
function test(query, format) {
    var modelCache = getCacheModel();
    var modelSource = getSourceModel();
    var called = false;

    return Observable.
        zip(
            testRunner.
                get(modelCache, query, format),
            testRunner.
                get(modelSource, query, format),
            function(cache, source) {
                return [cache, source];
            }).
        doAction(
            a(function(cache, source) {
                testRunner.compare(cache, source);
            }),
            noOp,
            function() {
                testRunner.compare(true, called, 'onNext expected');
            });
}

function a(fn) {
    return function() {
        fn.apply(null, arguments[0]);
    };
}
