var getCoreRunner = require('./../getCoreRunner');
var cacheGenerator = require('./../CacheGenerator');
var toTree = require('falcor-path-utils').toTree;
var jsonGraph = require('falcor-json-graph');
var atom = jsonGraph.atom;
var ref = jsonGraph.ref;
var $ref = require('./../../lib/types/ref');
var $atom = require('./../../lib/types/atom');
var _ = require('lodash');
var Model = require('./../../lib').Model;

describe('Edges', function() {
    // PathMap ----------------------------------------
    it('should report nothing on empty path.', function() {
        getCoreRunner({
            input: [['videos', [], 'title']],
            output: {
                json: {
                    videos: {}
                }
            },
            cache: cacheGenerator(0, 1)
        });
    });
    it('should report an atom of undefined in non-progressive mode.', function() {
        getCoreRunner({
            input: [['videos']],
            output: {
                json: {}
            },
            cache: {
                videos: atom(undefined)
            }
        });
    });
    it('should not report an atom of undefined in non-materialize mode.', function() {
        getCoreRunner({
            input: [['user'], ['gen']],
            output: {
                jsonGraph: {
                    user: {
                        $type: $atom,
                        $hello: 'world',
                        value: 5
                    },
                    gen: 5
                },
                paths: [['user'], ['gen']]
            },
            isJSONG: true,
            cache: {
                user: {
                    $type: $atom,
                    $hello: 'world',
                    value: 5
                },
                gen: 5
            }
        });
    });
    it('should get out a relative expired item.', function() {
        var output = {
            videos: {
                1234: {
                    title: 'Running Man'
                }
            }
        };
        output.videos.$__path = ['videos']
        output.videos[1234].$__path = ['videos', 1234];

        getCoreRunner({
            input: [['videos', 1234, 'title']],
            output: {
                json: output
            },
            cache: {
                videos: {
                    1234: {
                        title: {
                            $type: $atom,
                            $expires: -60000,
                            value: 'Running Man'
                        }
                    }
                }
            }
        });
    });
    it('should not get out an expired item.', function() {
        getCoreRunner({
            input: [['videos', 1234, 'title']],
            output: { },
            requestedMissingPaths: [['videos', 1234, 'title']],
            cache: {
                videos: {
                    1234: {
                        title: {
                            $type: $atom,
                            $expires: Date.now() - 1000,
                            value: 'Running Man'
                        }
                    }
                }
            }
        });
    });
    it('should not get out an expired item through references.', function() {
        getCoreRunner({
            input: [['videos', 1234, 'title']],
            output: {
                json: {
                    videos: {}
                }
            },
            requestedMissingPaths: [['videos', 1234, 'title']],
            cache: {
                to: {
                    $type: $ref,
                    $expires: Date.now() - 1000,
                    value: ['videos']
                },
                videos: {
                    title: 'Running Man'
                }
            }
        });
    });
});
