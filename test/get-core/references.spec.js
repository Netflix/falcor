var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var jsonGraph = require('falcor-json-graph');
var atom = jsonGraph.atom;
var ref = jsonGraph.ref;
var _ = require('lodash');

describe('References', function() {
    var referenceCache = function() {
        return {
            toReference: ref(['to', 'reference']),
            short: ref(['toShort', 'next']),
            circular: ref(['circular', 'next']),
            to: {
                reference: ref(['to']),
                title: 'Title'
            },
            toShort: 'Short'
        };
    };

    var tests = [{
        it: 'should follow a reference to reference',
        input: [['toReference', 'title']],
        output: {
            json: {
                toReference: {
                    title: 'Title'
                }
            }
        },
        cache: referenceCache
    }, {
        it: 'should follow a reference to value',
        input: [['short', 'title']],
        output: {
            json: {
                short: 'Short'
            }
        },
        cache: referenceCache
    }, {
        it: 'should never follow inner references.',
        input: [['circular', 'title']],
        output: {
            json: {
                circular: ['circular', 'next']
            }
        },
        cache: referenceCache
    }];

    getCoreRunner(tests);
});

