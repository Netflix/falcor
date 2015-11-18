var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var outputGenerator = require('./../outputGenerator');
var jsonGraph = require('falcor-json-graph');
var atom = jsonGraph.atom;
var _ = require('lodash');
var __key = require('./../../lib/internal/key');
var __parent = require('./../../lib/internal/parent');

describe('Values', function() {
    // PathMap ----------------------------------------
    it('should get a simple value out of the cache', function() {
        getCoreRunner({
            input: [['videos', 0, 'title']],
            output: outputGenerator.videoGenerator([0]),
            cache: cacheGenerator(0, 1)
        });
    });
    it('should get a value through a reference.', function() {
        getCoreRunner({
            input: [['lolomo', 0, 0, 'item', 'title']],
            output: outputGenerator.lolomoGenerator([0], [0]),
            cache: cacheGenerator(0, 1)
        });
    });
    it('should get a value through references with complex pathSet.', function() {
        getCoreRunner({
            input: [['lolomo', {to: 1}, {to: 1}, 'item', 'title']],
            output: outputGenerator.lolomoGenerator([0, 1], [0, 1]),
            cache: cacheGenerator(0, 30)
        });
    });
    it('should allow for multiple arguments with different length paths.', function() {
        var lolomo0 = {
            length: 1337
        };
        lolomo0[__key] = 0;
        var lolomo = {
            length: 1,
            0: lolomo0
        };
        lolomo0[__parent] = lolomo;
        lolomo[__key] = 'lolomo';
        lolomo[__parent] = null;
        var output = {
            json: {
                lolomo: lolomo
            }
        };

        getCoreRunner({
            input: [
                ['lolomo', 0, 'length'],
                ['lolomo', 'length']
            ],
            output: output,
            cache: {
                lolomo: {
                    length: 1,
                    0: {
                        length: 1337
                    }
                }
            }
        });
    });
    it('should allow for a null at the end to get a value behind a reference.', function() {
        getCoreRunner({
            input: [['lolomo', null]],
            output: {
                json: {
                    lolomo: 'value'
                }
            },
            cache: {
                lolomo: jsonGraph.ref(['test', 'value']),
                test: {
                    value: atom('value')
                }
            }
        });
    });
    it('should not get the value after the reference.', function() {
        getCoreRunner({
            input: [['lolomo']],
            output: {
                json: {
                    lolomo: ['test', 'value']
                }
            },
            cache: {
                lolomo: jsonGraph.ref(['test', 'value']),
                test: {
                    value: atom('value')
                }
            }
        });
    });
    it('should have no output for empty paths.', function() {
        getCoreRunner({
            input: [['lolomo', 0, [], 'item', 'title']],
            output: {},
            cache: cacheGenerator(0, 1)
        });
    });

    // JSONGraph ----------------------------------------
    it('should get JSONGraph for a single value out', function() {
        getCoreRunner({
            input: [['videos', 0, 'title']],
            isJSONG: true,
            output: {
                jsonGraph: {
                    videos: {
                        0: {
                            title: atom('Video 0')
                        }
                    }
                },
                paths: [['videos', 0, 'title']]
            },
            cache: cacheGenerator(0, 1)
        });
    });
    it('should allow for multiple arguments with different length paths as JSONGraph.', function() {
        getCoreRunner({
            input: [
                ['lolomo', 0, 'length'],
                ['lolomo', 'length']
            ],
            output: {
                jsonGraph: {
                    lolomo: {
                        length: 1,
                        0: {
                            length: 1337
                        }
                    }
                },
                paths: [
                    ['lolomo', 0, 'length'],
                    ['lolomo', 'length']
                ]
            },
            isJSONG: true,
            cache: {
                lolomo: {
                    length: 1,
                    0: {
                        length: 1337
                    }
                }
            }
        });
    });
    it('should get JSONGraph through references.', function() {
        getCoreRunner({
            input: [['lolomo', 0, 0, 'item', 'title']],
            isJSONG: true,
            output: {
                jsonGraph: cacheGenerator(0, 1),
                paths: [['lolomo', 0, 0, 'item', 'title']]
            },
            cache: cacheGenerator(0, 10)
        });
    });
    it('should get JSONGraph through references with complex pathSet.', function() {
        getCoreRunner({
            input: [['lolomo', {to: 1}, {to: 1}, 'item', 'title']],
            isJSONG: true,
            output: {
                jsonGraph: _.merge(cacheGenerator(0, 2), cacheGenerator(10, 2)),
                paths: [
                    ['lolomo', 0, 0, 'item', 'title'],
                    ['lolomo', 0, 1, 'item', 'title'],
                    ['lolomo', 1, 0, 'item', 'title'],
                    ['lolomo', 1, 1, 'item', 'title']
                ]
            },
            cache: cacheGenerator(0, 30)
        });
    });
});

