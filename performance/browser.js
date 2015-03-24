var Rx = require('rx');
global.Rx = Rx;
var testConfig = require('./testConfig')();
var testRunner = require('./testRunner');
var benchmark = require('benchmark');
var config = testConfig.config;
var models = testConfig.models;

var macroSimple = testConfig.set.simple(models.macro, 'PathMap');
var modelSimple = testConfig.set.simple(models.model, 'PathMap');
var macroReference = testConfig.set.reference(models.macro, 'PathMap');
var modelReference = testConfig.set.reference(models.model, 'PathMap');

testConfig.repeatInConfig('macro-simple', 1, macroSimple, config.tests);
testConfig.repeatInConfig('model-simple', 1, modelSimple, config.tests);
testConfig.repeatInConfig('macro-reference', 1, macroReference, config.tests);
testConfig.repeatInConfig('model-reference', 1, modelReference, config.tests);
testRunner(benchmark, config, 10, function(totalResults) {
    console.log(totalResults.join('\n'));
});


