var falcor = require('./../../lib/');
var Model = falcor.Model;
var Cache = require('../data/Cache');
var Expected = require('../data/expected');
var Rx = require('rx');
var getTestRunner = require('./../getTestRunner');
var testRunner = require('./../testRunner');
var model = testRunner.getModel(null, Cache());
var References = Expected.References;
var Complex = Expected.Complex;
var Values = Expected.Values;
var Bound = Expected.Bound;
var Materialized = Expected.Materialized;
var Boxed = Expected.Boxed;
var Errors = Expected.Errors;
var $atom = require("./../../lib/types/atom");
var $error = require("./../../lib/types/error");
var noOp = function() {};

describe('Specific Cases', function() {
    describe('Selector Missing PathSet Index', function() {
        it('should report the missing path indices.', function () {
            var model = new Model({cache: Cache()}).withoutDataSource();
            var results = model._getPathSetsAsJSON(model, [['missingPath1'], ['missingPath2'], ['missingPath3']], [{}, {}, {}]);
            var missingPaths = results.requestedMissingPaths;
            testRunner.compare(0, missingPaths[0].pathSetIndex);
            testRunner.compare(1, missingPaths[1].pathSetIndex);
            testRunner.compare(2, missingPaths[2].pathSetIndex);
        });
        it('should report the missing path indices on complex paths.', function () {
            var model = new Model({cache: Cache()}).withoutDataSource();
            var results = model._getPathSetsAsJSON(model, [['missingPath1'], ['genreList', 0, {from: 41, to: 50}, 'summary']], [{}, {}]);
            var missingPaths = results.requestedMissingPaths;
            testRunner.compare(0, missingPaths[0].pathSetIndex);
            testRunner.compare(['missingPath1'], missingPaths[0]);
            for (var i = 1; i < missingPaths.length; i++) {
                testRunner.compare(1, missingPaths[i].pathSetIndex);
                testRunner.compare(['genreList', 0, [40 + i], 'summary'], missingPaths[i]);
            }
        });
    });

    describe('Seed Filling', function() {
        it('should continue to populate the seed toJSON()', function () {
            var model = new Model({cache: Cache()}).withoutDataSource();
            var seed = [{}];
            model._getPathSetsAsPathMap(model, [['videos', 0, 'summary']], seed);
            model._getPathSetsAsPathMap(model, [['videos', 1, 'summary']], seed);

            testRunner.compare({
                "title": "Additional Title 0",
                "url": "/movies/0"
            }, seed[0].json.videos[0].summary);

            testRunner.compare({
                "title": "Additional Title 1",
                "url": "/movies/1"
            }, seed[0].json.videos[1].summary);
        });
        it('should continue to populate the seed toJSONG()', function () {
            var model = new Model({cache: Cache()}).withoutDataSource();
            var seed = [{}];
            model._getPathSetsAsJSONG(model, [['videos', 0, 'summary']], seed);
            model._getPathSetsAsJSONG(model, [['videos', 1, 'summary']], seed);

            testRunner.compare({
                $type: $atom,
                $size: 51,
                value: {
                    "title": "Additional Title 0",
                    "url": "/movies/0"
                }
            }, seed[0].jsonGraph.videos[0].summary);

            testRunner.compare({
                $type: $atom,
                $size: 51,
                value: {
                    "title": "Additional Title 1",
                    "url": "/movies/1"
                }
            }, seed[0].jsonGraph.videos[1].summary);
        });
        it('should continue to populate the seed selector.', function () {
            var model = new Model({cache: Cache()}).withoutDataSource();
            var seed = [{}];
            model._getPathSetsAsJSON(model, [['videos', [0], 'summary']], seed);
            model._getPathSetsAsJSON(model, [['videos', [1], 'summary']], seed);

            testRunner.compare({
                "title": "Additional Title 0",
                "url": "/movies/0"
            }, seed[0].json[0]);

            testRunner.compare({
                "title": "Additional Title 1",
                "url": "/movies/1"
            }, seed[0].json[1]);
        });
        it('should continue to populate multiple seeds in the selector.', function () {
            var model = new Model({cache: Cache()}).withoutDataSource();
            var seed = [{}, {}];
            model._getPathSetsAsJSON(model, [
                ['videos', [0], 'summary'],
                ['videos', [2], 'summary']
            ], seed);
            model._getPathSetsAsJSON(model, [
                ['videos', [1], 'summary'],
                ['videos', [3], 'summary']
            ], seed);

            testRunner.compare({
                "title": "Additional Title 0",
                "url": "/movies/0"
            }, seed[0].json[0]);

            testRunner.compare({
                "title": "Additional Title 1",
                "url": "/movies/1"
            }, seed[0].json[1]);

            testRunner.compare({
                "title": "Additional Title 2",
                "url": "/movies/2"
            }, seed[1].json[2]);

            testRunner.compare({
                "title": "Additional Title 3",
                "url": "/movies/3"
            }, seed[1].json[3]);
        });
        it('should fill double permute complex paths.', function () {
            var model = new Model({cache: Cache()}).withoutDataSource();
            var seed = [{}];
            model._getPathSetsAsJSON(model, [
                ['genreList', [0], [0], 'summary']
            ], seed);

            testRunner.compare({
                "title": "House of Cards",
                "url": "/movies/1234"
            }, seed[0].json[0][0]);
        });
        it('should fill double permute complex paths with partially filled seed.', function () {
            var model = new Model({cache: Cache()}).withoutDataSource();
            var seed = [{
                json: {
                    0: {
                        0: {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    }
                }
            }];
            model._getPathSetsAsJSON(model, [
                ['genreList', [0], [1], 'summary']
            ], seed);

            testRunner.compare({
                "title": "House of Cards",
                "url": "/movies/1234"
            }, seed[0].json[0][0]);
            testRunner.compare({
                "title": "Terminator 3",
                "url": "/movies/766"
            }, seed[0].json[0][1]);
        });
    });

    describe('Hardlink', function() {
        it('should follow hardlinks.', function() {
            var model = new Model({cache: Cache()});
            var seed = [{}];
            model._getPathSetsAsJSON(model, [['genreList', 0, 0, 'summary']]);
            model._getPathSetsAsJSON(model, [['genreList', 0, 0, 'summary']], seed);

            testRunner.compare({
                "title": "House of Cards",
                "url": "/movies/1234"
            }, seed[0].json);
        });
    });

    it('should be able to ask with non-nulls in the pathMap when missing.', function() {
        var model = new Model({cache: Cache()});
        var queries = [
            [{json: {videos: {1234: 'string'}}}],
            [{json: {videos: {1234: 5}}}],
            [{json: {videos: {1234: {
                $type: 'test'
            }}}}]
        ];
        queries.forEach(function(q) {
            var result = model._getPathMapsAsJSON(model, q, [{}]);

            testRunner.compare([['videos', 1234]], result.requestedMissingPaths);
        });
    });

    it('should be able to ask with non-nulls in the pathMap when missing in materialize.', function() {
        var model = new Model({cache: Cache()}).materialize();
        var queries = [
            [{json: {videos: {1234: 'string'}}}],
            [{json: {videos: {1234: ['arr']}}}],
            [{json: {videos: {1234: 5}}}]
        ];
        queries.forEach(function(q) {
            var result = model._getPathMapsAsJSON(model, q, [{}]);

            testRunner.compare([{json: {$type: $atom}}], result.values);
        });
    });

    it('should emit value when expired and materialized.', function() {
        var model = new Model({cache: Cache()}).materialize();
        var results = model._getPathSetsAsJSON(model, [['videos', 'expiredLeafByTimestamp', 'summary']], [{}]);
        testRunner.compare([{}], results.values);
    });

    it('should ensure that anything removed wont be unhardlinked 2x.  COVERAGE TEST', function() {
        var model = new Model({cache: Cache()}).materialize();

        // Removes the hardlink
        model._getPathSetsAsJSON(model, [['videos', 'expiredLeafByTimestamp', 'summary']], [{}]);
        var results = model._getPathSetsAsJSON(model, [['videos', 'expiredLeafByTimestamp', 'summary']], [{}]);
        testRunner.compare([{}], results.values);
    });

    it('should be able to have null in the middle of the path.', function() {
        var model = new Model({cache: Cache()});
        var queries = [
            [['videos', 1234, null, 'summary']],
            [{json:{'videos': {1234: {'__null':{ 'summary': null}}}}}]
        ];
        var expected = Values().direct.AsJSON.values;
        queries.forEach(function(q) {
            var seed = [{}];
            model._getPathMapsAsJSON(model, q, seed);

            testRunner.compare(expected, seed);
        });
    });

    it('should not report anything on empty paths.', function() {
        var model = new Model({cache: Cache()});
        var queries = [
            ['videos', {length: 0}, 'summary'],
            ['videos', {to: 0, from: 1}, 'summary'],
            ['videos', [], 'summary']
        ];
        var results = model._getPathSetsAsJSONG(model, queries, [{}]);
        testRunner.compare(0, results.requestedMissingPaths.length);
    });

    it('should return the ranged items when ranges in array.', function() {
        var JSONG = {
            jsonGraph: {
                foo: {
                    0: {
                        $type: $atom,
                        value: 0
                    },
                    1: {
                        $type: $atom,
                        value: 75
                    }
                }
            },
            paths: [
                ['foo', [{from: 0, to: 1}]]
            ]
        };
        var model = new Model({cache: JSONG.jsonGraph});
        var out = [{}];

        model._getPathSetsAsJSON(model, JSONG.paths, out);
        testRunner.compare({
            0: 0,
            1: 75
        }, out[0].json);
    });
    describe('Materialized', function() {
        it('should not report an atom with undefined in non-materialize mode.', function(done) {
            var model = new Model({cache: Cache(), source: {}});
            var called = false;
            model.
                get('misc.uatom').
                toPathValues().
                doAction(function(res) {
                    called = true;
                },
                noOp,
                function() {
                    testRunner.compare(false, called);
                }).
                subscribe(noOp, done, done);
        });
        it('should report an atom with undefined in non-materialize mode but with box mode.', function(done) {
            var model = new Model({cache: Cache(), source: {}}).boxValues();
            var called = false;
            model.
                get('misc.uatom').
                toPathValues().
                doAction(function(res) {
                    called = true;
                    testRunner.compare({
                        path: ['misc', 'uatom'],
                        value: {
                            $type: $atom,
                            $size: 51,
                            value: undefined
                        }
                    }, res);
                },
                noOp,
                function() {
                    testRunner.compare(true, called);
                }).
                subscribe(noOp, done, done);
        });
        it('should ensure that falsey values do not get removed.', function(done) {
            var model = new Model({cache: {
                misc: {
                    atomU: Model.atom(undefined),
                    atom0: Model.atom(0),
                    atomFalse: Model.atom(false),
                    atomEmpty: Model.atom('')
                }
            }});
            var called = 0;
            var expected = [{
                path: ['misc', 'atom0'],
                value: 0
            }, {
                path: ['misc', 'atomFalse'],
                value: false
            }, {
                path: ['misc', 'atomEmpty'],
                value: ''
            }];
            model.
                // since we are using cache, order is guarenteed
                get(['misc', ['atomU', 'atom0', 'atomFalse', 'atomEmpty']]).
                toPathValues().
                doAction(function(res) {
                    testRunner.compare(expected[called], res);
                    ++called;
                },
                noOp,
                function() {
                    testRunner.compare(3, called);
                }).
                subscribe(noOp, done, done);
        });
        it('should ensure that falsey values do not get removed in materialize.', function(done) {
            var model = new Model({cache: {
                misc: {
                    atomU: Model.atom(undefined),
                    atom0: Model.atom(0),
                    atomFalse: Model.atom(false),
                    atomEmpty: Model.atom('')
                }
            }}).materialize();
            var called = 0;
            var expected = [{
                path: ['misc', 'atomU'],
                value: {$type: $atom}
            }, {
                path: ['misc', 'atom0'],
                value: 0
            }, {
                path: ['misc', 'atomFalse'],
                value: false
            }, {
                path: ['misc', 'atomEmpty'],
                value: ''
            }];
            model.
                // since we are using cache, order is guarenteed
                get(['misc', ['atomU', 'atom0', 'atomFalse', 'atomEmpty']]).
                toPathValues().
                doAction(function(res) {
                    testRunner.compare(expected[called], res);
                    ++called;
                },
                noOp,
                function() {
                    testRunner.compare(4, called);
                }).
                subscribe(noOp, done, done);
        });
    });
});
