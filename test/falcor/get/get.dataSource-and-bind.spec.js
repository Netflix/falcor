var falcor = require("./../../../lib/");
var Model = falcor.Model;
var noOp = function() {};
var LocalDataSource = require('../../data/LocalDataSource');
var sinon = require('sinon');
var expect = require('chai').expect;
var cacheGenerator = require('./../../CacheGenerator');
var strip = require('./../../cleanData').stripDerefAndVersionKeys;
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
        toObservable(model.
            get(['lolomo', 0, 0, 'item', 'title'])).
            flatMap(function(x) {
                return model.
                    deref(x.json.lolomo[0]).
                    get([1, 'item', 'title']);
            }).
            doAction(onNext).
            doAction(noOp, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
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

    it('should get a value from from dataSource after cache purge.', function(done) {
        var model = new Model({cache: M(), source: new LocalDataSource(Cache())});
        model._root.unsafeMode = true;
        var onNext = sinon.spy();
        toObservable(model.
            get(['lolomo', 0, 0, 'item', 'title'])).
            map(function(x) {
                return model.
                    deref(x.json.lolomo[0]);
            }).
            doAction(function() {
                model.setCache({});
            }).
            flatMap(function(rowModel) {
                return rowModel.
                    get([1, 'item', 'title']);
            }).
            doAction(onNext).
            doAction(noOp, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
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

