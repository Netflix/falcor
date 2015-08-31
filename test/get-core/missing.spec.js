var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var jsonGraph = require('falcor-json-graph');
var atom = jsonGraph.atom;
var ref = jsonGraph.ref;
var _ = require('lodash');

describe('Missing', function() {

    var missingCache = function() {
        return {
            missing: ref(['toMissing']),
            multi: {
                0: ref(['toMissing0']),
                1: {
                    0: ref(['toMissing1'])
                }
            }
        };
    };
    var tests = [{
        it: 'should report a missing path.',
        input: [['missing', 'title']],
        output: { },
        requestedMissingPaths: [['missing', 'title']],
        optimizedMissingPaths: [['toMissing', 'title']],
        cache: missingCache
    }, {
        it: 'should report a missing path.',
        input: [['multi', {to: 1}, 0, 'title']],
        output: { },
        requestedMissingPaths: [
            ['multi', 0, 0, 'title'],
            ['multi', 1, 0, 'title']
        ],
        optimizedMissingPaths: [
            ['toMissing0', 0, 'title'],
            ['toMissing1', 'title']
        ],
        cache: missingCache
    }, {
        it: 'should report a value when materialized.',
        input: [['missing', 'title']],
        materialize: true,
        output: {
            json: {
                missing: { $type: 'atom' }
            }
        },
        cache: missingCache
    }];

    getCoreRunner(tests);
});

