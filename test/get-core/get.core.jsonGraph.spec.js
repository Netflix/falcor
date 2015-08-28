var coreRunner = require('./../coreRunner');
var cacheGenerator = require('./../CacheGenerator');
var toTree = require('falcor-path-utils').toTree;
describe.only('Get Core', function() {
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
        it: 'should get a simple value out of the cache with JSON',
        input: [toTree([['videos', 0, 'title']])],
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
        it: 'should get a value through a reference.',
        input: [toTree([['lolomo', 0, 0, 'item', 'title']])],
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
        it: 'should get a value through references with complex keys.',
        input: [toTree([['lolomo', {to: 3}, {to: 3}, 'item', 'title']])],
        output: {
            json: {
                lolomo: {
                    0: {
                        0: {
                            item: {
                                title: 'Video 0'
                            }
                        }
                    },
                    1: {
                        0: {
                            item: {
                                title: 'Video 0'
                            }
                        }
                    },
                    2: {
                        0: {
                            item: {
                                title: 'Video 0'
                            }
                        }
                    },
                    3: {
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
    }];

    coreRunner(tests);
});

