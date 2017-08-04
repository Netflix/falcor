var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var outputGenerator = require('./../outputGenerator');
var jsonGraph = require('falcor-json-graph');
var atom = jsonGraph.atom;
var ref = jsonGraph.ref;
var _ = require('lodash');

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
    it('should get a value of type atom when in materialized mode.', function() {
        getCoreRunner({
            input: [['videos', {to:1}, 'title']],
            materialize: true,
            output: {
                json: {
                    videos: {
                        $__path: ['videos'],
                        0: {
                            $__path: ['videos', 0],
                            title: {$type: 'atom'}
                        },
                        1: {
                            $__path: ['videos', 1],
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
            output: outputGenerator.lolomoGenerator([0, 1], [0, 1]),
            cache: cacheGenerator(0, 30)
        });
    });
    it('should allow for multiple arguments with different length paths.', function() {
        var lolomo0 = {
            length: 1337
        };
        lolomo0.$__path = ['lolomo', '0'];
        var lolomo = {
            length: 1,
            0: lolomo0
        };
        lolomo.$__path = ['lolomo'];
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
                json: {}
            },
            cache: {
                lolomo: jsonGraph.ref(['test', 'value']),
                test: {
                    value: atom('value')
                }
            }
        });
    });
    it('should not get references.', function() {
        getCoreRunner({
            input: [["lists", 2343, "0"]],
            output: {
                json: {
                    lists: {
                        2343: {
                        }
                    }
                }
            },
            cache: {
                lists: {
                    2343: {
                        0: jsonGraph.ref(["videos", 123])
                    }
                },
                videos: {
                    123: {
                        name: atom("House of cards")
                    }
                }
            }
        });
    });

    function intersectingTest(paths) {
        return function() {
            getCoreRunner({
                input: paths,
                output: {
                    json: {
                        lists: {
                            2343: {
                                0: {
                                    name: 'House of cards'
                                }
                            }
                        }
                    }
                },
                cache: {
                    lists: {
                        2343: {
                            0: jsonGraph.ref(["videos", 123])
                        }
                    },
                    videos: {
                        123: {
                            name: atom("House of cards")
                        }
                    }
                }
            });
        };
    }

    it('should not clobber values with intersecting paths.', intersectingTest([['lists', 2343, '0', 'name'], ['lists', 2343, '0']]));
    it('should not clobber values with intersecting paths reversed.', intersectingTest([['lists', 2343, '0'], ['lists', 2343, '0', 'name']]));

    it('should have identical behavior when fetching a missing value or atom of undefined.', function() {
        getCoreRunner({
            input: [["lists", 2343, "0", "name"], ["lists", 2343, "1", "rating"]],
            output: {
                json: {
                    lists: {
                        2343: {
                            0: {},
                            1: {}
                        }
                    }
                }
            },
            cache: {
                lists: {
                    2343: {
                        0: jsonGraph.ref(["videos", 123]),
                        1: jsonGraph.ref(["videos", 123])
                    }
                },
                videos: {
                    123: {
                        name: atom()
                    }
                }
            }
        });
    });

    it('should emit branch structure for empty paths.', function() {
        getCoreRunner({
            input: [['lolomo', 0, [], 'item', 'title']],
            output: {
                json: {
                    lolomo: {
                        0: {

                        }
                    }
                }
            },
            cache: cacheGenerator(0, 1)
        });
    });

    it('should emit branch structure for empty get.', function() {
        getCoreRunner({
            input: [],
            output: {
                json: {}
            },
            cache: cacheGenerator(0, 1)
        });
    });

    // JSONGraph ----------------------------------------
    it('should get JSONGraph for a single value out, modelCreated', function() {
        getCoreRunner({
            input: [['videos', 0, 'title']],
            isJSONG: true,
            output: {
                jsonGraph: {
                    videos: {
                        0: {
                            title: 'Video 0'
                        }
                    }
                },
                paths: [['videos', 0, 'title']]
            },
            cache: cacheGenerator(0, 1, undefined, true)
        });
    });
    it('should get JSONGraph for a single value out, !modelCreated', function() {
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
            cache: cacheGenerator(0, 1, undefined, false)
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
                jsonGraph: _.merge(cacheGenerator(0, 2), cacheGenerator(10, 2, undefined, false)),
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
    it('should get JSONGraph allow for a null at the end to get a value behind a reference.', function() {
        getCoreRunner({
            input: [['reference', null]],
            isJSONG: true,
            output: {
                jsonGraph: {
                    "reference": {
                        "$type": "ref",
                        "value": ["foo", "bar"]
                    },
                    "foo": {
                        "bar": {
                            "$type": "atom",
                            "value": "value"
                        }
                    }
                },
                paths: [
                    ["reference", null]
                ]
            },
            cache: {
                reference: jsonGraph.ref(['foo', 'bar']),
                foo: {
                    bar: atom('value')
                }
            }
        });
    });
    it('should get JSONGraph to get a reference.', function() {
        getCoreRunner({
            input: [['reference']],
            isJSONG: true,
            output: {
                jsonGraph: {
                    "reference": {
                        "$type": "ref",
                        "value": ["foo", "bar"]
                    }
                },
                paths: [
                    ["reference"]
                ]
            },
            cache: {
                reference: jsonGraph.ref(['foo', 'bar']),
                foo: {
                    bar: atom('value')
                }
            }
        });
    });

});

