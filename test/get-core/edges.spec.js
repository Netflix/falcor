var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var toTree = require('falcor-path-utils').toTree;
var jsonGraph = require('falcor-json-graph');
var atom = jsonGraph.atom;
var _ = require('lodash');

describe('Edges', function() {
    // PathMap ----------------------------------------
    var tests = [{
        it: 'should report nothing on empty path.',
        input: [['videos', [], 'title']],
        output: { },
        cache: cacheGenerator(0, 1)
    }, {
        it: 'should not report an atom of undefined in non-materialize mode.',
        input: [['videos']],
        output: { },
        cache: {
            videos: atom(undefined)
        }
    }, {
        it: 'should not report an atom of undefined in non-materialize mode.',
        input: [['user'], ['gen']],
        output: {
            jsonGraph: {
                user: {
                    $type: 'atom',
                    $hello: 'world',
                    value: 5
                },
                gen: 5
            },
            paths: [['user'], ['gen']]
        },
        isJSONG: true,
        cache: {
            user: {
                $type: 'atom',
                $hello: 'world',
                value: 5
            },
            gen: 5
        }
    }];

    getCoreRunner(tests);
});

