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
    it('should report a missing path.', function() {
        getCoreRunner({
            input: [['missing', 'title']],
            output: {
                json: {}
            },
            requestedMissingPaths: [['missing', 'title']],
            optimizedMissingPaths: [['toMissing', 'title']],
            cache: missingCache
        });
    });
    it('should report missing paths.', function() {
        getCoreRunner({
            input: [['multi', {to: 1}, 0, 'title']],
            output: {
                json: {
                    multi: {
                        1: {}
                    }
                }
            },
            requestedMissingPaths: [
                ['multi', 0, 0, 'title'],
                ['multi', 1, 0, 'title']
            ],
            optimizedMissingPaths: [
                ['toMissing0', 0, 'title'],
                ['toMissing1', 'title']
            ],
            cache: missingCache
        });
    });
    it('should report a value when materialized.', function() {
        getCoreRunner({
            input: [['missing', 'title']],
            materialize: true,
            output: {
                json: {
                    missing: { $type: 'atom' }
                }
            },
            cache: missingCache
        });
    });
    it('should report missing paths through many complex keys.', function() {
        getCoreRunner({
            input: [[{to:1}, {to:1}, {to:1}, 'summary']],
            output: {
                json: {
                    0: {
                        0: {
                            0: {},
                            1: {}
                        },
                        1: {}
                    },
                    1: {}
                }
            },
            optimizedMissingPaths: [
                [0, 0, 0, 'summary'],
                [0, 0, 1, 'summary'],
                [0, 1, 0, 'summary'],
                [0, 1, 1, 'summary'],
                [1, 0, {to: 1}, 'summary'],
                [1, 1, {to: 1}, 'summary'],
            ],
            cache: {
                0: {
                    0: {
                        // Missing Leaf
                        0: {
                            title: '0',
                        },
                        1: {
                            title: '1',
                        }
                    },
                    1: {
                        // Missing Branch
                        3: {
                            title: '2',
                        },
                        4: {
                            title: '3',
                        }
                    }
                },
                // Missing complex key.
                1: {
                    length: 1
                }
            }
        });
    });
    it('should report a missing path ending with null', function() {
        getCoreRunner({
            input: [['refMissing', null]],
            output: {
                json: {}
            },
            requestedMissingPaths: [['refMissing', null]],
            optimizedMissingPaths: [['refMissing', null]],
            cache: { }
        });
    });

});

