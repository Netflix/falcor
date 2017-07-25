var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var outputGenerator = require('./../outputGenerator');
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
            referenceContainer: ['lists', 'A', 0, 'item'],
            cache: cacheGenerator(0, 1)
        });
    });
    it('should get multiple arguments out of the cache.', function() {
        var output = outputGenerator.lolomoGenerator([0], [0, 1]).json.lolomo[0];

        // Cheating in how we are creating the output.  'path' key should not exist
        // at the top level of output.
        delete output.$__path;
        delete output.$__refPath;
        delete output.$__toReference;

        getCoreRunner({
            input: [
                [0, 'item', 'title'],
                [1, 'item', 'title']
            ],
            output: {
                json: output
            },
            deref: ['lists', 'A'],
            referenceContainer: ['lolomos', 1234, 0],
            cache: cacheGenerator(0, 2)
        });
    });
    it('should get multiple arguments as missing paths from the cache.', function() {
        getCoreRunner({
            input: [
                ['b', 'c'],
                ['b', 'd']
            ],
            output: {
                json: {
                    b: {}
                }
            },
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
        toObservable(model.
            get(['a', 'b', 'e'])).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                var json = onNext.getCall(0).args[0].json;

                // Top level
                expect(json.$__path).to.be.not.ok;

                // a
                var a = json.a;
                expect(a.$__path).to.deep.equals(['a']);

                // b
                var b = a.b;
                expect(b.$__path).to.deep.equals(['a', 'b']);

                // e
                var e = b.e;
                expect(e).to.equals('&');
            }).
            subscribe(noOp, done, done);
    });

    it('ensures that the sequencial get / deref works correctly.', function(done) {
        var model = new Model({
            cache: {
                a: {
                    b: {
                        e: '&'
                    }
                }
            }
        });

        model.get(['a', 'b', 'e']).subscribe(function(json) {
            model = model.deref(json.json.a);
        });

        model.get(['b', 'e']).subscribe(function(json) {
            model = model.deref(json.json.b);
        });

        var onNext = sinon.spy();
        toObservable(model.
            get(['e'])).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onNext.getCall(0).args[0]).to.deep.equals({
                    json: {
                        e: '&'
                    }
                });
            }).
            subscribe(noOp, done, done);
    });
});

