var testRunner = require('./testRunner');
var testConfig = require('./testConfig')();
var testSuiteGenerator = require('./testSuiteGenerator');

var models = testConfig.models;
var formats = testConfig.formats;
var tests = testConfig.get;
var suite = testConfig.suite;

suite.tests = testSuiteGenerator({

    iterations: 1,

    models: {
        'model' : models.model,
        'macro' : models.macro
    },

    tests: {
        'simple': tests.syncSimple,
        'reference': tests.syncReference
    }

});

testRunner(suite, 10, function(totalResults) {
    console.log(totalResults.join('\n'));
});


/*
var testConfig = require('./testConfig');
var testRunner = require('./testRunner');

var config = testConfig.config;
var models = testConfig.models;

var macroSimple = testConfig.get.syncSimple(models.macro);
var modelSimple = testConfig.get.syncSimple(models.model);
var macroReference = testConfig.get.syncReference(models.macro);
var modelReference = testConfig.get.syncReference(models.model);

testConfig.repeatInConfig('macro-sync-simple', 1, macroSimple, config.tests);
testConfig.repeatInConfig('model-sync-simple', 1, modelSimple, config.tests);
testConfig.repeatInConfig('macro-sync-reference', 1, macroReference, config.tests);
testConfig.repeatInConfig('model-sync-reference', 1, modelReference, config.tests);

testRunner(config, 10, function(totalResults) {
    console.log(totalResults.join('\n'));
});
*/