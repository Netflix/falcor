var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var jsonGraph = require('falcor-json-graph');
var atom = jsonGraph.atom;
var _ = require('lodash');
var error = jsonGraph.error;
var expect = require('chai').expect;
var Model = require('./../../lib').Model;
var BoundJSONGraphModelError = require('./../../lib/errors/BoundJSONGraphModelError');
var sinon = require('sinon');
var noOp = function() {};

describe('Deref', function() {
    // PathMap ----------------------------------------
    it('should get a simple value out of the cache', function() {
        getCoreRunner({
            input: [['title']],
            output: {
                json: {
                    title: 'Video 0'
                }
            },
            deref: ['videos', 0],
            cache: cacheGenerator(0, 1)
        });
    });
    it('should get multiple arguments out of the cache.', function() {
        getCoreRunner({
            input: [
                [0, 'item', 'title'],
                [1, 'item', 'title']
            ],
            output: {
                json: {
                    0: {
                        __key: 0,
                        item: {
                            __path: ['videos', 0],
                            title: 'Video 0'
                        }
                    },
                    1: {
                        __key: 1,
                        item: {
                            __path: ['videos', 1],
                            title: 'Video 1'
                        }
                    }
                }
            },
            deref: ['lists', 'A'],
            cache: cacheGenerator(0, 2)
        });
    });
    it('should get multiple arguments as missing paths from the cache.', function() {
        getCoreRunner({
            input: [
                ['b', 'c'],
                ['b', 'd']
            ],
            output: { },
            deref: ['a'],
            optimizedMissingPaths: [
                ['a', 'b', 'c'],
                ['a', 'b', 'd']
            ],
            cache: {
                a: {
                    b: {
                        e: '&'
                    }
                }
            }
        });
    });

    it('should throw an error when bound and calling jsonGraph.', function() {
        var model = new Model({
            cache: cacheGenerator(0, 1)
        })._derefSync(['videos', 0]);

        var res = model._getPathValuesAsJSONG(model, [['summary']], [{}]);
        expect(res.criticalError.name).to.equals(BoundJSONGraphModelError.name);
        expect(res.criticalError.message).to.equals(BoundJSONGraphModelError.message);
    });

    it('should ensure that correct parents are produced for non-paths.', function(done) {
        var model = new Model({
            cache: {
                a: {
                    b: {
                        e: '&'
                    }
                }
            }
        });

        var onNext = sinon.spy();
        model.
            get(['a', 'b', 'e']).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                var json = onNext.getCall(0).args[0].json;

                // Top level
                expect(json.__parent).to.be.not.ok;
                expect(json.__path).to.be.not.ok;
                expect(json.__key).to.be.not.ok;

                // a
                var a = json.a;
                expect(a.__parent).to.equals(null);
                expect(a.__path).to.be.not.ok;
                expect(a.__key).to.equals('a');

                // b
                var b = a.b;
                expect(b.__parent.__key).to.equals('a');
                expect(b.__path).to.be.not.ok;
                expect(b.__key).to.equals('b');

                // e
                var e = b.e;
                expect(e.__parent).to.be.not.ok;
                expect(e.__path).to.be.not.ok;
                expect(e.__key).to.be.not.ok;
                expect(e).to.equals('&');
            }).
            subscribe(noOp, done, done);
    });
});

