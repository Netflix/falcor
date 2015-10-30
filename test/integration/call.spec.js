var falcor = require('../../lib');
var Rx = require('rx');
var R = require('falcor-router');
var noOp = function() {};
var chai = require('chai');
var expect = chai.expect;
var sinon = require('sinon');
var LocalDataSource = require('./../data/LocalDataSource');
var Cache = require('./../data/Cache');
var ReducedCache = require('./../data/ReducedCache').ReducedCache;
var $ref = falcor.Model.ref;

describe('call', function() {
    it('#339 should use the router as a data source and make a call to the router.', function(done) {
        var router = new R([{
            route: 'genreList[{integers:titles}].titles.push',
            call: function(callPath, args) {
                return {
                    path: ['genreList', 0, 'titles', 2],
                    value: {
                        $type: 'ref',
                        value: ['titlesById', 1]
                    }
                };
            }
        }, {
            route: 'titlesById[{integers:ids}].name',
            get: function(aliasMap) {
                var id = aliasMap.ids[0];
                return {
                    path: ['titlesById', id, 'name'],
                    value: 'House of Cards'
                };
            }
        }]);

        var model = new falcor.Model({
            source: router
        });
        var args = [falcor.Model.ref('titlesById[1]')];
        var onNext = sinon.spy();
        model.
            call("genreList[0].titles.push", args, ['name']).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onNext.getCall(0).args[0]).to.deep.equals({
                    json: {
                        genreList: {
                            0: {
                                titles: {
                                    2: {
                                        name: 'House of Cards'
                                    }
                                },
                            }
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });

    it('#339 should ensure that an empty call does not explode.', function(done) {
        var router = new R([{
            route: 'genreList[{integers:titles}].titles.push',
            call: function(callPath, args) {
                return {
                    path: ['genreList', 0, 'titles', 2],
                    value: {
                        $type: 'ref',
                        value: ['titlesById', 1]
                    }
                };
            }
        }]);

        var model = new falcor.Model({
            source: router
        });
        var args = [falcor.Model.ref('titlesById[1]')];
        var onNext = sinon.spy();
        model.
            call("genreList[0].titles.push", args, ['name']).
            doAction(onNext, noOp, function() {
                expect(onNext.callCount).to.equal(0);
            }).
            subscribe(noOp, done, done);
    });

    it('Response with invalidations and no paths should not explode.', function(done) {
        var router = new R([{
            route: 'genreList[{integers:titles}].titles.push',
            call: function(callPath, args) {

                var invalidatedPath = callPath.slice(0, callPath.length-1);
                // [genreList, [0], titles, length]
                invalidatedPath.push('length');

                return {
                    path: invalidatedPath,
                    invalidated: true
                };
            }
        }]);

        var model = new falcor.Model({
            source: router
        });

        var args = [falcor.Model.ref('titlesById[1]')];

        var onNext = sinon.spy();

        model.
            call("genreList[0].titles.push", args).
            doAction(onNext, noOp, noOp).
            subscribe(noOp, done, function() {
                expect(onNext.callCount).to.equal(0);
                done();
            });
    });
});

