var testConfig = require('./testConfig')();
var _ = require('lodash');

var models = testConfig.models;
var formats = testConfig.formats;
var tests = testConfig.get;

var DEFAULTS = {
    iterations: 2,
    tests: {
        'scrollGallery': tests.scrollGallery,
        'simple': tests.simple,
        'reference': tests.reference,
        'complex': tests.complex
    },
    formats: formats,
    models: {
        'modelWithoutSource' : models.model,
        'modelWithSource' : models.modelWithSource
    }
};

module.exports = function (config) {

    config = _.assign({}, DEFAULTS, config);

    var generatedTests = {};

    var tests = config.tests;
    var iterations = config.iterations || 1;
    var models = config.models;
    var formats = config.formats || [null];

    var testName;
    var modelName;
    var i;

    for (testName in tests) {
        for (i = 0; i < iterations; i++) {
            for (modelName in models) {

                formats.forEach(function(format) {

                    var testGenerator = tests[testName];
                    var testLongName = testName + ' (' + modelName + ':' + format + ') ' + i;
                    var model = models[modelName];

                    generatedTests[testLongName] = (format) ?
                        testGenerator(model, format) :
                        testGenerator(model);
                });
            }
        }
    }

    return generatedTests;
};
