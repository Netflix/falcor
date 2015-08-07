var falcor = require("./../../../lib/");
var Model = falcor.Model;
var Cache = require('../../data/Cache');
var M = require('../../data/ReducedCache').MinimalCache;
var Expected = require('../../data/expected');
var Rx = require('rx');
var Observable = Rx.Observable;
var getTestRunner = require('./../../getTestRunner');
var testRunner = require('./../../testRunner');
var noOp = function() {};
var LocalDataSource = require('../../data/LocalDataSource');
var ErrorDataSource = require('../../data/ErrorDataSource');
var sinon = require('sinon');
var expect = require('chai').expect;

describe('Progressive', function() {
    describe('toPathValues', function() {
        it('should be no different than if called without progressive mode.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var model2 = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = Expected.Complex().toOnly.AsJSON.values[0].json;
            var count = 0;
            var progressive = model.
                get(['videos', 1234, 'summary'], ['videos', 766, 'summary']).
                progressively().
                toPathValues();

            var standard = model2.
                get(['videos', 1234, 'summary'], ['videos', 766, 'summary']).
                toPathValues();

            var progressiveResult = false;
            var standardResult = false;
            // cannot zip, can hide results.
            progressive.
                toArray().
                flatMap(function(progressiveResults) {
                    progressiveResult = true;
                    return standard.
                        toArray().
                        doAction(function(standardRes) {
                            standardResult = true;
                            standardRes.forEach(function(res, i) {
                                testRunner.compare(res, progressiveResults[i]);
                            });
                        });
                }).
                doAction(noOp, noOp, function() {
                    testRunner.compare(true, progressiveResult, 'expected progressive result to fire');
                    testRunner.compare(true, standardResult, 'expected standart result to fire');
                }).
                subscribe(noOp, done, done);
        });
        it('should be no different than if called without progressive mode when bound.', function(done) {
            var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var model2 = new Model({cache: M(), source: new LocalDataSource(Cache())});
            var expected = Expected.Complex().toOnly.AsJSON.values[0].json;
            var count = 0;
            model._root.unsafeMode = true;
            model2._root.unsafeMode = true;
            var progressive = model.
                deref(['genreList', 0], [{to: 1}, 'summary']).
                flatMap(function(m) {
                    return m.get([{to: 1}, 'summary']).
                        progressively().
                        toPathValues();
                });

            var standard = model2.
                deref(['genreList', 0], [{to: 1}, 'summary']).
                flatMap(function(m) {
                    return m.get([{to: 1}, 'summary']).
                        toPathValues();
                });

            var onNextStandard = sinon.spy();
            var onNextProg = sinon.spy(function(progressiveResult) {
                return standard.
                    toArray().
                    doAction(onNextStandard);
            });

            // cannot zip, can hide results.
            progressive.
                toArray().
                flatMap(onNextProg).
                doAction(noOp, noOp, function() {
                    expect(onNextProg.getCall(0).args[0]).to.deep.equals(onNextStandard.getCall(0).args[0]);
                }).
                subscribe(noOp, done, done);
        });
    });
});

