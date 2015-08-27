var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var toTree = require('falcor-path-utils').toTree;
var jsonGraph = require('falcor-json-graph');
var atom = jsonGraph.atom;
var _ = require('lodash');
var error = jsonGraph.error;
var expect = require('chai').expect;
var jsonGraphDerefException = 'It is not legal to use the JSON Graph format from a bound Model. JSON Graph format can only be used from a root model.'
var Model = require('./../../lib').Model;

describe('Deref', function() {
    // PathMap ----------------------------------------
    var tests = [{
        it: 'should get a simple value out of the cache',
        input: [['title']],
        output: {
            json: {
                title: 'Video 0'
            }
        },
        deref: ['videos', 0],
        cache: cacheGenerator(0, 1)
    }];

    it('should throw an error when bound and calling jsonGraph.', function() {
        var threw = false;
        var model = new Model({
            cache: cacheGenerator(0, 1)
        })._derefSync(['videos', 0]);
        try {
            model._getPathValuesAsJSONG(model, [['summary']], [{}]);
        } catch(ex) {
            threw = true;
            expect(jsonGraphDerefException).to.equal(ex.message);
        }
        expect(threw).to.be.ok;
    });

    getCoreRunner(tests);
});

