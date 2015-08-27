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
var sinon = require('sinon');
var expect = require('chai').expect;

describe('DataSource and Deref', function() {
    it('should get a value from from dataSource when bound.', function(done) {
        var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
        model._root.unsafeMode = true;
        var onNext = sinon.spy();
        var secondOnNext = sinon.spy();
        model.
            deref(['genreList', 0], [0, 'summary']).
            flatMap(function(boundModel) {
                model = boundModel;
                return model.preload([1, 'summary']);
            }).
            doAction(onNext).
            doAction(noOp, noOp, function() {
                expect(onNext.callCount).to.equal(0);
            }).
            defaultIfEmpty({}).
            flatMap(function() {
                return model.get([1, 'summary']);
            }).
            doAction(secondOnNext).
            doAction(noOp, noOp, function() {
                expect(secondOnNext.calledOnce).to.be.ok;
                testRunner.compare({
                    1: {
                        summary: {
                            title: "Terminator 3",
                            url: "/movies/766"
                        }
                    }
                }, secondOnNext.getCall(0).args[0].json);
            }).
            subscribe(noOp, done, done);
    });
});

