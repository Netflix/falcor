var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var outputGenerator = require('./../outputGenerator');
var jsonGraph = require('falcor-json-graph');
var atom = jsonGraph.atom;
var _ = require('lodash');
var error = jsonGraph.error;
var Model = require('./../../lib').Model;
var BoundJSONGraphModelError = require('./../../lib/errors/BoundJSONGraphModelError');
var toObservable = require('../toObs');
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
        expect(res.criticalError.name).toBe("BoundJSONGraphModelError");
        expect(res.criticalError.message).toBe(
            "It is not legal to use the JSON Graph " +
            "format from a bound Model. JSON Graph format" +
            " can only be used from a root model."
        );
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

        var onNext = jest.fn();
        toObservable(model.
            get(['a', 'b', 'e'])).
            doAction(onNext, noOp, function() {
                expect(onNext).toHaveBeenCalledTimes(1);
                var json = onNext.mock.calls[0][0].json;

                // Top level
                expect(json.$__path).toBeUndefined();

                // a
                var a = json.a;
                expect(a.$__path).toEqual(['a']);

                // b
                var b = a.b;
                expect(b.$__path).toEqual(['a', 'b']);

                // e
                var e = b.e;
                expect(e).toBe('&');
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

        var onNext = jest.fn();
        toObservable(model.
            get(['e'])).
            doAction(onNext, noOp, function() {
                expect(onNext).toHaveBeenCalledTimes(1);
                expect(onNext.mock.calls[0][0]).toEqual({
                    json: {
                        e: '&'
                    }
                });
            }).
            subscribe(noOp, done, done);
    });
});

