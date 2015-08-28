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
        it: 'should get a value through references with complex JSON.',
        input: [toTree([['lolomo', {to: 1}, {to: 1}, 'item', 'title']])],
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
    }];

    coreRunner(tests);
});

