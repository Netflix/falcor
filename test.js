var falcor = require('./bin/Falcor.js');
var recF = require('./bin2/Falcor2.js');
var Cache = require('./test/data/Cache');
var Expected = require('./test/data/expected');
var Values = Expected.Values;
var References = Expected.References;
var Complex = Expected.Complex;
var model = new falcor.Model({cache: Cache()});
var recModel = new recF(Cache());

model._root.allowSync = true;
module.exports = {
    name: 'Falcor',
    tests: {
//        'falcor.Model simple path': function () {
//            model._getPathsAsValues(model, [
//                ['videos', 1234, 'summary']
//            ]);
//        },
//
//        'FTester2.Model simple path': function () {
//            recModel._getPathsAsValues(recModel, [
//                ['videos', 1234, 'summary']
//            ]);
//        },
//        'falcor.Model reference in path': function () {
//            model._getPathsAsValues(model, [
//                ['genreList', 0, 0, 'summary']
//            ]);
//        },
//
//        'FTester2.Model reference in path': function () {
//            recModel._getPathsAsValues(recModel, [
//                ['genreList', 0, 0, 'summary']
//            ]);
//        },
//        'falcor.Model complex in path': function () {
//            model._getPathsAsValues(model, [
//                ['genreList', [0, 1], 0, 'summary']
//            ]);
//        },
//
//        'FTester2.Model complex in path': function () {
//            recModel._getPathsAsValues(recModel, [
//                ['genreList', [0, 1], 0, 'summary']
//            ]);
//        },
//        'falcor.Model two complex in path': function () {
//            model._getPathsAsValues(model, [
//                ['genreList', [0, 1], {to: 3}, 'summary']
//            ]);
//        },
//
//        'FTester2.Model two complex in path': function () {
//            recModel._getPathsAsValues(recModel, [
//                ['genreList', [0, 1], {to: 3}, 'summary']
//            ]);
//        },
//        'falcor.Model simple path AsPathMap': function () {
//            model._getPathsAsPathMap(model, [
//                ['videos', 1234, 'summary']
//            ], [{}]);
//        },
//
//        'FTester2.Model simple path AsPathMap': function () {
//            recModel._getPathsAsPathMap(recModel, [
//                ['videos', 1234, 'summary']
//            ], [{}]);
//        },
//        'falcor.Model reference in path AsPathMap': function () {
//            model._getPathsAsPathMap(model, [
//                ['genreList', 0, 0, 'summary']
//            ]);
//        },
//
//        'FTester2.Model reference in path AsPathMap': function () {
//            recModel._getPathsAsPathMap(recModel, [
//                ['genreList', 0, 0, 'summary']
//            ]);
//        },
//        'falcor.Model complex in path AsPathMap': function () {
//            model._getPathsAsPathMap(model, [
//                ['genreList', [0, 1], 0, 'summary']
//            ]);
//        },
//
//        'FTester2.Model complex in path AsPathMap': function () {
//            recModel._getPathsAsPathMap(recModel, [
//                ['genreList', [0, 1], 0, 'summary']
//            ]);
//        },
//        'falcor.Model two complex in path AsPathMap': function () {
//            model._getPathsAsPathMap(model, [
//                ['genreList', [0, 1], {to: 3}, 'summary']
//            ]);
//        },
//
//        'FTester2.Model two complex in path AsPathMap': function () {
//            recModel._getPathsAsPathMap(recModel, [
//                ['genreList', [0, 1], {to: 3}, 'summary']
//            ]);
//        },
//        'falcor.Model simple path AsJSON': function () {
//            model._getPathsAsJSON(model, [
//                ['videos', 1234, 'summary']
//            ]);
//        },
//
//        'FTester2.Model simple path AsJSON': function () {
//            recModel._getPathsAsJSON(recModel, [
//                ['videos', 1234, 'summary']
//            ]);
//        },
//        'falcor.Model reference in path AsJSON': function () {
//            model._getPathsAsJSON(model, [
//                ['genreList', 0, 0, 'summary']
//            ]);
//        },
//
//        'FTester2.Model reference in path AsJSON': function () {
//            recModel._getPathsAsJSON(recModel, [
//                ['genreList', 0, 0, 'summary']
//            ]);
//        },
//        'falcor.Model complex in path AsJSON': function () {
//            model._getPathsAsJSON(model, [
//                ['genreList', [0, 1], 0, 'summary']
//            ]);
//        },
//
//        'FTester2.Model complex in path AsJSON': function () {
//            recModel._getPathsAsJSON(recModel, [
//                ['genreList', [0, 1], 0, 'summary']
//            ]);
//        },
//        'falcor.Model two complex in path AsJSON': function () {
//            model._getPathsAsJSON(model, [
//                ['genreList', [0, 1], {to: 3}, 'summary']
//            ]);
//        },
//
//        'FTester2.Model two complex in path AsJSON': function () {
//            recModel._getPathsAsJSON(recModel, [
//                ['genreList', [0, 1], {to: 3}, 'summary']
//            ]);
//        },
//        'falcor.Model simple path AsJSON': function () {
//            model._getPathMapsAsJSON(model, [
//                {videos: {1234: {summary: null}}}
//            ], [{}]);
//        },
//
//        'FTester2.Model simple path AsJSON': function () {
//            recModel._getAsJSON(recModel, [
//                {videos: {1234: {summary: null}}}
//            ], [{}]);
//        },
//        'falcor.Model reference in path AsJSON': function () {
//            model._getPathMapsAsJSON(model, [
//                {genreList: {0: {0: {summary: null}}}}
//            ], [{}]);
//        },
//
//        'FTester2.Model reference in path AsJSON': function () {
//            recModel._getAsJSON(recModel, [
//                {genreList: {0: {0: {summary: null}}}}
//            ], [{}]);
//        },
//        'F2.Model full test Values': function() {
//            ValuesKeys.forEach(function(k) {
//                var expected = permValues[k];
//
//                ['getPaths', 'getPathMaps'].forEach(function(q) {
//                    var query = expected[q].query;
//                    recModel._getAsValues(recModel, query);
//                    recModel._getAsPathMap(recModel, query, [{}]);
//                    recModel._getAsJSON(recModel, query, [{}]);
//                });
//            });
//        },
//        'Falcor.Model full test Values': function() {
//            ValuesKeys.forEach(function(k) {
//                var expected = permValues[k];
//
//                ['getPaths', 'getPathMaps'].forEach(function(q) {
//                    var query = expected[q].query;
//                    model['_' + q + 'AsValues'](recModel, query);
//                    model['_' + q + 'AsPathMap'](recModel, query, [{}]);
//                    model['_' + q + 'AsJSON'](recModel, query, [{}]);
//                });
//            });
//        },
//        'F2.Model full test References': function() {
//            ReferencesKeys.forEach(function(k) {
//                var expected = permReferences[k];
//
//                ['getPaths', 'getPathMaps'].forEach(function(q) {
//                    var query = expected[q].query;
//                    recModel._getAsValues(recModel, query);
//                    recModel._getAsPathMap(recModel, query, [{}]);
//                    recModel._getAsJSON(recModel, query, [{}]);
//                });
//            });
//        },
//        'Falcor.Model full test References': function() {
//            ReferencesKeys.forEach(function(k) {
//                var expected = permReferences[k];
//
//                ['getPaths', 'getPathMaps'].forEach(function(q) {
//                    var query = expected[q].query;
//                    model['_' + q + 'AsValues'](recModel, query);
//                    model['_' + q + 'AsPathMap'](recModel, query, [{}]);
//                    model['_' + q + 'AsJSON'](recModel, query, [{}]);
//                });
//            });
//        },
//        'F2.Model full test Complex': function() {
//            ComplexKeys.forEach(function(k) {
//                var expected = permComplex[k];
//
//                ['getPaths', 'getPathMaps'].forEach(function(q) {
//                    var query = expected[q].query;
//                    recModel._getAsValues(recModel, query);
//                    recModel._getAsPathMap(recModel, query, [{}]);
//                    recModel._getAsJSON(recModel, query, [{}]);
//                });
//            });
//        },
//        'Falcor.Model full test Complex': function() {
//            ReferencesKeys.forEach(function(k) {
//                var expected = permReferences[k];
//
//                ['getPaths', 'getPathMaps'].forEach(function(q) {
//                    var query = expected[q].query;
//                    model['_' + q + 'AsValues'](recModel, query);
//                    model['_' + q + 'AsPathMap'](recModel, query, [{}]);
//                    model['_' + q + 'AsJSON'](recModel, query, [{}]);
//                });
//            });
//        }
//        'falcor.Model simple path AsJSON': function () {
//            model._getPathMapsAsJSON(model, [
//                {videos: {
//                    553: {summary: null}
//                }}
//            ], [{}]);
//        },
//
//        'FTester2.Model simple path AsJSON': function () {
//            recModel._getAsJSON(recModel, [
//                {videos: {
//                    553: {summary: null}
//                }}
//            ], [{}]);
//        },
//        'falcor.Model reference in path AsJSON': function () {
//            model._getPathMapsAsJSON(model, [
//                {genreList: {0: {0: {summary: null}}}}
//            ], [{}]);
//        },
//
//        'FTester2.Model reference in path AsJSON': function () {
//            recModel._getAsJSON(recModel, [
//                {genreList: {0: {0: {summary: null}}}}
//            ], [{}]);
//        },
//        'falcor.Model complex in path AsJSON': function () {
//            model._getPathMapsAsJSON(model, [
//                {
//                    genreList: {
//                        0: {0: {summary: null}},
//                        1: {0: {summary: null}}
//                    }
//                }
//            ], [{}]);
//        },
//        'FTester2.Model complex in path AsJSON': function () {
//            recModel._getAsJSON(recModel, [
//                {
//                    genreList: {
//                        0: {0: {summary: null}},
//                        1: {0: {summary: null}}
//                    }
//                }
//            ], [{}]);
//        },
//        'falcor.Model 2complex in path AsPathMap': function () {
//            model._getPathMapsAsJSON(model, [
//                ['genreList', {to:1}, {to:2}, 'summary']
//            ], [{}]);
//        },
//        'FTester2.Model 2complex in path AsPathMap': function () {
//            recModel._getAsJSON(recModel, [
//                ['genreList', {to:1}, {to:2}, 'summary']
//            ], [{}]);
//        },
//        'falcor.Model 2complex in path AsJSON': function () {
//            model._getPathMapsAsJSON(model, [
//                {
//                    genreList: {
//                        0: {
//                            0: {summary: null},
//                            1: {summary: null},
//                            2: {summary: null}
//                        },
//                        1: {
//                            0: {summary: null},
//                            1: {summary: null},
//                            2: {summary: null}
//                        }
//                    }
//                }
//            ], [{}]);
//        },
//        'FTester2.Model 2complex in path AsJSON': function () {
//            recModel._getAsJSON(recModel, [
//                {
//                    genreList: {
//                        0: {
//                            0: {summary: null},
//                            1: {summary: null},
//                            2: {summary: null}
//                        },
//                        1: {
//                            0: {summary: null},
//                            1: {summary: null},
//                            2: {summary: null}
//                        }
//                    }
//                }
//            ], [{}]);
//        }
//        'falcor.Model simple path': function () {
//            model._getPathsAsJSON(model, [
//                ['videos', 1234, 'summary']
//            ], [{}]);
//        },
//
//        'FTester2.Model simple path': function () {
//            recModel._getAsJSON(recModel, [
//                ['videos', 1234, 'summary']
//            ], [{}]);
//        },
//        'falcor.Model reference in path': function () {
//            model._getPathsAsJSON(model, [
//                ['genreList', 0, 0, 'summary']
//            ], [{}]);
//        },
//
//        'FTester2.Model reference in path': function () {
//            recModel._getAsJSON(recModel, [
//                ['genreList', 0, 0, 'summary']
//            ], [{}]);
//        },
//        'falcor.Model complex in path': function () {
//            model._getPathsAsJSON(model, [
//                ['genreList', [0, 1], 0, 'summary']
//            ], [{}]);
//        },
//
//        'FTester2.Model complex in path': function () {
//            recModel._getAsJSON(recModel, [
//                ['genreList', [0, 1], 0, 'summary']
//            ], [{}]);
//        },
//        'falcor.Model two complex in path': function () {
//            model._getPathsAsJSON(model, [
//                ['genreList', [0, 1], {to: 3}, 'summary']
//            ], [{}]);
//        },
//
//        'FTester2.Model two complex in path': function () {
//            recModel._getAsJSON(recModel, [
//                ['genreList', [0, 1], {to: 3}, 'summary']
//            ], [{}]);
//        }
        'falcor.Model getValueSync': function () {
            model.getValueSync(['videos', 1234, 'summary']);
        },

        'FTester2.Model simple path': function () {
            recModel._getAsValues(recModel, [
                ['videos', 1234, 'summary']
            ]);
        }
    }
};
if (require.main === module) {
//    var out = model._getPathsAsJSON(model, [
//        {
//            genreList: {
//                0: {
//                    0: {summary: null},
//                    1: {summary: null},
//                    2: {summary: null}
//                },
//                1: {
//                    0: {summary: null},
//                    1: {summary: null},
//                    2: {summary: null}
//                }
//            }
//        }
//    ], [{}]);
}
