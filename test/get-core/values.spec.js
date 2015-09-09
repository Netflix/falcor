var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var jsonGraph = require('falcor-json-graph');
var atom = jsonGraph.atom;
var _ = require('lodash');

describe('Values', function() {
    // PathMap ----------------------------------------
    var tests = [{
        it: 'should get a simple value out of the cache',
        input: [['videos', 0, 'title']],
        output: {
            json: {
                videos: {
                    0: {
                        title: 'Video 0'
                    }
                }
            }
        },
        cache: cacheGenerator(0, 1)
    }, {
        it: 'should get a value through a reference.',
        input: [['lolomo', 0, 0, 'item', 'title']],
        output: {
            json: {
                lolomo: {
                    0: {
                        0: {
                            item: {
                                title: 'Video 0'
                            }
                        }
                    }
                }
            }
        },
        cache: cacheGenerator(0, 1)
    }, {
        it: 'should get a value through references with complex pathSet.',
        input: [['lolomo', {to: 1}, {to: 1}, 'item', 'title']],
        output: {
            json: {
                lolomo: {
                    0: {
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
                    },
                    1: {
                        0: {
                            item: {
                                title: 'Video 10'
                            }
                        },
                        1: {
                            item: {
                                title: 'Video 11'
                            }
                        }
                    }
                }
            }
        },
        cache: cacheGenerator(0, 30)
    }, {
        it: 'should allow for a null at the end to get a value behind a reference.',
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
    }, {
        it: 'should not get the value after the reference.',
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
    }, {
        it: 'should have no output for empty paths.',
        input: [['lolomo', 0, [], 'item', 'title']],
        output: {},
        cache: cacheGenerator(0, 1)
    }, {

    // JSONGraph ----------------------------------------
        it: 'should get JSONGraph for a single value out',
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
    }, {
        it: 'should get JSONGraph through references.',
        input: [['lolomo', 0, 0, 'item', 'title']],
        isJSONG: true,
        output: {
            jsonGraph: cacheGenerator(0, 1),
            paths: [['lolomo', 0, 0, 'item', 'title']]
        },
        cache: cacheGenerator(0, 10)
    }, {
        it: 'should get JSONGraph through references with complex pathSet.',
        input: [['lolomo', {to: 1}, {to: 1}, 'item', 'title']],
        only: true,
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
    }];

    getCoreRunner(tests);
});

