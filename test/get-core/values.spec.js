var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var jsonGraph = require('falcor-json-graph');
var atom = jsonGraph.atom;
var ref = jsonGraph.ref;
var _ = require('lodash');

describe('Values', function() {
    // PathMap ----------------------------------------
    it('should get a simple value out of the cache', function() {
        getCoreRunner({
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
        });
    });
    it('should get a value through a reference.', function() {
        getCoreRunner({
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
        });
    });
    it('should get a value of type atom when in materialized mode.', function() {
        getCoreRunner({
            input: [['videos', {to:1}, 'title']],
            materialize: true,
            output: {
                json: {
                    videos: {
                        0: {
                            title: {$type: 'atom'}
                        },
                        1: {
                            title: {$type: 'atom'}
                        }
                    }
                }
            },
            cache: {
                jsonGraph: {
                    videos: {
                        0: {
                            title: {$type: 'atom'}
                        },
                        1: {
                            title: {$type: 'atom'}
                        }
                    }
                },
                paths: [
                    ['videos', {to: 1}, 'title']
                ]
            }
        });
    });
    it('should get a value through references with complex pathSet.', function() {
        getCoreRunner({
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
        });
    });
    it('should allow for multiple arguments with different length paths.', function() {
        getCoreRunner({
            input: [
                ['lolomo', 0, 'length'],
                ['lolomo', 'length']
            ],
            output: {
                json: {
                    lolomo: {
                        length: 1,
                        0: {
                            length: 1337
                        }
                    }
                }
            },
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

