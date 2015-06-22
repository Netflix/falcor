module.exports = function testGenerator(config) {

    var generatedTests = {};

    var tests = config.tests;
    var iterations = config.iterations || 1;
    var models = config.models;
    var formats = config.formats || [null];

    var test;
    var i;
    var model;

    for (test in tests) {
        for (i = 0; i < iterations; i++) {
            for (model in models) {

                formats.forEach(function(format) {
                    var testGenerator = tests[test];
                    var testName = test + ' (' + model + ', ' + format + ') ' + i;

                    generatedTests[testName] = (format) ?
                        testGenerator(model, format) :
                        testGenerator(model);
                });
            }
        }
    }

    return generatedTests;
};