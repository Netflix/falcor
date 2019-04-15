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
                    circular: {}
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

    it('should validate that _fromWhenceYouCame does correctly pluck the paths for references.', function() {
        getCoreRunner({
            input: [
                ['lolomo', 0, 0, 'item', 'title'],
            ],
            fromWhenceYouCame: true,
            output: {
                json: {
                    lolomo: {
                        $__path: ['lolomos', 1234],
                        $__refPath: ['lolomos', 1234],
                        $__toReference: ['lolomo'],
                        0: {
                            $__path: ['lists', 'A'],
                            $__refPath: ['lists', 'A'],
                            $__toReference: ['lolomos', 1234, 0],
                            0: {
                                $__path: ['lists', 'A', 0],
                                $__refPath: ['lists', 'A'],
                                $__toReference: ['lolomos', 1234, 0],
                                item: {
                                    $__path: ['videos', 0],
                                    $__refPath: ['videos', 0],
                                    $__toReference: ['lists', 'A', 0, 'item'],
                                    title: 'Video 0'
                                }
                            }
                        }
                    }
                }
            },
            cache: cacheGenerator(0, 1)
        });
    });
});

