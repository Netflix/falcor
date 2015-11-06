var falcor = require("./../../../lib/");
var Model = falcor.Model;
var cacheGenerator = require('../../CacheGenerator');
var noOp = function() {};
var LocalDataSource = require('../../data/LocalDataSource');
var ErrorDataSource = require('../../data/ErrorDataSource');
var isPathValue = require("./../../../lib/support/isPathValue");
var sinon = require('sinon');
var expect = require('chai').expect;
var strip = require('../../cleanData').stripDerefAndVersionKeys;

function Cache() { return cacheGenerator(0, 2); }
function M() { return cacheGenerator(0, 1); }

describe('DataSource and Deref', function() {
    it('should perform multiple trips to a dataSource.', function(done) {
        var count = 0;
        var model = new Model({
            cache: M(),
            source: new LocalDataSource(Cache(), {
                onSet: function(source, tmp, jsongEnv) {
                    count++;
                    if (count === 1) {
                        // Don't do it this way, it will cause memory leaks.
                        model._root.cache.lists.A[1] = undefined;
                        return {
                            jsonGraph: jsongEnv.jsonGraph,
                            paths: [jsongEnv.paths[0]]
                        };
                    }

                    return jsongEnv;
                }
            })
        });
        var onNext = sinon.spy();
        toObservable(model.
            get(['lolomo', 0, 0, 'item', 'title'])).
            flatMap(function(x) {
                return model.
                    deref(x.json.lolomo[0]).
                    set(
                        {path: [0, 'item', 'title'], value: 1337},
                        {path: [1, 'item', 'title'], value: 7331});
            }).
            doAction(onNext).
            doAction(noOp, noOp, function() {
                expect(count).to.equals(2);
                expect(onNext.calledOnce).to.be.ok;
                expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                    json: {
                        0: {
                            item: {
                                title: 1337
                            }
                        },
                        1: {
                            item: {
                                title: 7331
                            }
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });
});

