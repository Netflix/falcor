var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var toTree = require('falcor-path-utils').toTree;
var jsonGraph = require('falcor-json-graph');
var ref = jsonGraph.ref;
var error = jsonGraph.error;
var _ = require('lodash');

describe('Errors', function() {
    var errorCache = function() {
        return {
            reference: ref(['to', 'error']),
            to: {
                error: error('Oops!')
            }
        };
    };

    var tests = [{
        it: 'should report error with path.',
        input: [['to', 'error']],
        output: { },
        errors: [{
            path: ['to', 'error'],
            value: 'Oops!'
        }],
        cache: errorCache
    }, {
        it: 'should report error path with null from reference.',
        input: [['reference', 'title']],
        output: { },
        errors: [{
            path: ['reference', null],
            value: 'Oops!'
        }],
        cache: errorCache
    }, {
        it: 'should report error with path in treateErrorsAsValues.',
        input: [['to', 'error']],
        output: {
            json: {
                to: {
                    error: 'Oops!'
                }
            }
        },
        treatErrorsAsValues: true,
        cache: errorCache
    }, {
        it: 'should report error with path in treateErrorsAsValues and boxValues.',
        input: [['to', 'error']],
        output: {
            json: {
                to: {
                    error: error('Oops!')
                }
            }
        },
        treatErrorsAsValues: true,
        boxValues: true,
        cache: errorCache
    }];

    getCoreRunner(tests);
});

