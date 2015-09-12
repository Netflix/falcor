var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var toTree = require('falcor-path-utils').toTree;
var jsonGraph = require('falcor-json-graph');
var atom = jsonGraph.atom;
var _ = require('lodash');
var error = jsonGraph.error;
var expect = require('chai').expect;
var Model = require('./../../lib').Model;
var BoundJSONGraphModelError = require('./../../lib/errors/BoundJSONGraphModelError');

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
                        item: {
                            title: 'Video 0'
                        }
                    },
                    1: {
                        item: {
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

});

