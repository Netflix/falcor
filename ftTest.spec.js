var recF = require('./bin2/Falcor2.js');
var Cache = require('./test/data/Cache');
var recModel = new recF(Cache());
var Expected = require('./test/data/expected');
var Values = Expected.Values;
var References = Expected.References;
var Complex = Expected.Complex;
var TestRunner = require('./test/testRunner');
var model = TestRunner.getModel(null, Cache());
var _ = require('lodash');


describe('Ready to Rumble.', function() {
    
    describe('Values', function() {
        Object.
            keys(Values()).
            forEach(function(k) {
                var expected = Values()[k];
                var query = expected.getPaths.query;
                if (k === 'genreListErrorNull' || k === 'errorBranchSummary') {
                    return;
                }

                it('should test ' + JSON.stringify(query) + ' ' + k + ' AsValues', function() {
                    var count = Array(expected.getPaths.count || 1).join(',').split(',').map(function() { return {}; });
                    var expectedOutput = model._getPathsAsValues(model, _.cloneDeep(query), count);
                    var actualOutput = recModel._getPathsAsValues(recModel, query);
                    TestRunner.validateOperation('_getPathsAsValues', expectedOutput, actualOutput);
                });

                it('should test ' + JSON.stringify(query) + ' ' + k + ' AsPathMap', function() {
                    var count = Array(expected.getPaths.count || 1).join(',').split(',').map(function() { return {}; });
                    var expectedOutput = model._getPathsAsPathMap(model, _.cloneDeep(query), count);
                    var out = [{}];
                    var actualOutput = recModel._getPathsAsPathMap(recModel, query, out);
                    TestRunner.validateOperation('_getPathsAsPathMap', expectedOutput, actualOutput);
                });

                if (expected.AsJSON) {
                    it('should test ' + JSON.stringify(query) + ' ' + k + ' AsJSON', function() {
                        var count = Array(expected.getPaths.count || 1).join(',').split(',').map(function() { return {}; });
                        var expectedOutput = model._getPathsAsJSON(model, _.cloneDeep(query), count);
                        var out = [{}];
                        var actualOutput = recModel._getPathsAsJSON(recModel, query, out);
                        TestRunner.validateOperation('_getPathsAsPathMap', expectedOutput, actualOutput);
                    });
                }
            });
    });

    describe('References', function() {
        Object.
            keys(References()).
            forEach(function(k) {
                var expected = References()[k];
                var query = expected.getPaths.query;
                if (k === 'futureExpiredReference' || k === 'toErrorReference' || k === 'errorReferenceInBranchKey' || k === 'errorReference') {
                    return;
                }
                it('should test ' + JSON.stringify(query) + ' ' + k, function() {
                    var count = Array(expected.getPaths.count || 1).join(',').split(',').map(function() { return {}; });
                    var expectedOutput = model._getPathsAsValues(model, _.cloneDeep(query), count);
                    var actualOutput = recModel._getPathsAsValues(recModel, query);
                    TestRunner.validateOperation('_getPathsAsValues', expectedOutput, actualOutput);
                });

                it('should test ' + JSON.stringify(query) + ' ' + k + ' AsPathMap', function() {
                    var count = Array(expected.getPaths.count || 1).join(',').split(',').map(function() { return {}; });
                    var expectedOutput = model._getPathsAsPathMap(model, _.cloneDeep(query), count);
                    var out = [{}];
                    var actualOutput = recModel._getPathsAsPathMap(recModel, query, out);
                    TestRunner.validateOperation('_getPathsAsPathMap', expectedOutput, actualOutput);
                });

                if (expected.AsJSON) {
                    it('should test ' + JSON.stringify(query) + ' ' + k + ' AsJSON', function() {
                        var count = Array(expected.getPaths.count || 1).join(',').split(',').map(function() { return {}; });
                        var expectedOutput = model._getPathsAsJSON(model, _.cloneDeep(query), count);
                        var out = [{}];
                        var actualOutput = recModel._getPathsAsJSON(recModel, query, out);
                        TestRunner.validateOperation('_getPathsAsPathMap', expectedOutput, actualOutput);
                    });
                }
            });
    });

    describe('References', function() {
        Object.
            keys(Complex()).
            forEach(function(k) {
                var expected = Complex()[k];
                var query = expected.getPaths.query;
                it('should test ' + JSON.stringify(query) + ' ' + k, function() {
                    var count = Array(expected.getPaths.count || 1).join(',').split(',').map(function() { return {}; });
                    var expectedOutput = model._getPathsAsValues(model, _.cloneDeep(query), count);
                    if (k === 'toErrorReference' || k === 'errorReferenceInBranchKey' || k === 'errorReference') {
                        expectedOutput.values = [];
                    }
                    var actualOutput = recModel._getPathsAsValues(recModel, query);
                    TestRunner.validateOperation('_getPathsAsValues', expectedOutput, actualOutput);
                });
                
                it('should test ' + JSON.stringify(query) + ' ' + k + ' AsPathMap', function() {
                    var count = [{}];
                    var expectedOutput = model._getPathsAsPathMap(model, _.cloneDeep(query), count);
                    var out = [{}];
                    var actualOutput = recModel._getPathsAsPathMap(recModel, query, out);
                    TestRunner.validateOperation('_getPathsAsPathMap', expectedOutput, actualOutput);
                });
                
                if (expected.AsJSON) {
                    it('should test ' + JSON.stringify(query) + ' ' + k + ' AsJSON', function() {
                        var count = Array(expected.getPaths.count || 1).join(',').split(',').map(function() { return {}; });
                        var expectedOutput = model._getPathsAsJSON(model, _.cloneDeep(query), count);
                        var out = [{}];
                        var actualOutput = recModel._getPathsAsJSON(recModel, query, out);
                        TestRunner.validateOperation('_getPathsAsPathMap', expectedOutput, actualOutput);
                    });
                }
            });
    });

    xit('should pass this test', function() {
        var expected = Values().direct;
        var query = expected.getPaths.query;
        var count = [{}];
        var expectedOutput = model._getPathsAsJSON(model, _.cloneDeep(query), count);
        var out = [{}];
        var actualOutput = recModel._getPathsAsJSON(recModel, query, out);
        TestRunner.validateOperation('_getPathsAsJSON', expectedOutput, actualOutput);
    });
});

