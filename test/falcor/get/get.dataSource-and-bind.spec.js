var falcor = require("./../../../lib/");
var Model = falcor.Model;
var noOp = function() {};
var LocalDataSource = require('../../data/LocalDataSource');
var sinon = require('sinon');
var expect = require('chai').expect;
var cacheGenerator = require('./../../CacheGenerator');
function Cache() {
    return cacheGenerator(0, 50);
}
function M() {
    return cacheGenerator(0, 1);
}

describe('DataSource and Deref', function() {
    it('should get a value from from dataSource when bound.', function(done) {
        var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
        model._root.unsafeMode = true;
        var onNext = sinon.spy();
        var secondOnNext = sinon.spy();
        model.
            deref(['lolomo', 0], [0, 'item', 'title']).
            flatMap(function(boundModel) {
                model = boundModel;
                return model.preload([1, 'item', 'title']);
            }).
            doAction(onNext).
            doAction(noOp, noOp, function() {
                expect(onNext.callCount).to.equal(0);
            }).
            defaultIfEmpty({}).
            flatMap(function() {
                return model.get([1, 'item', 'title']);
            }).
            doAction(secondOnNext).
            doAction(noOp, noOp, function() {
                expect(secondOnNext.calledOnce).to.be.ok;
                expect(secondOnNext.getCall(0).args[0]).to.deep.equals({
                    json: {
                        1: {
                            item: {
                                title: 'Video 1'
                            }
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });
});

