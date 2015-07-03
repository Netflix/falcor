module.exports = function (config) {

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