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
                reference: ref(['too']),
                toValue: ref(['too', 'title']),
                title: 'Title'
            },
            too: {
                title: 'Title'
            },
            toShort: 'Short'
        };
    };

    it('should follow a reference to reference', function() {
        var toReference = {
            title: 'Title'
        };
        toReference.$__path = ['too'];

        // Should be the second references reference not
        // toReferences reference.
        getCoreRunner({
            input: [['toReference', 'title']],
            output: {
                json: {
                    toReference: toReference
                }
            },
            cache: referenceCache
        });
    });

    it('should follow a reference to value', function() {
        getCoreRunner({
            input: [['short', 'title']],
            output: {
                json: {
                    short: 'Short'
                }
            },
            cache: referenceCache
        });
    });

    it('should never follow inner references.', function() {
        getCoreRunner({
            input: [['circular', 'title']],
            output: {
                json: {
                    circular: ['circular', 'next']
                }
            },
            cache: referenceCache
        });
    });

    it('should ensure that values are followed correctly when through references and previous paths have longer lengths to litter the requested path.', function() {
        var to = {
            reference: {
                title: 'Title'
            },
            toValue: 'Title'
        };
        to.$__path = ['to'];
        to.reference.$__path = ['too'];

        getCoreRunner({
            input: [
                ['to', ['reference', 'toValue'], 'title'],
            ],
            output: {
                json: {
                    to: to
                }
            },
            cache: referenceCache
        });
    });


});

