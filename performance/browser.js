var Rx = require('rx');
global.Rx = Rx;
var testConfig = require('./testConfig')();
var testRunner = require('./testRunner');
var benchmark = require('benchmark');
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
testRunner(benchmark, config, 10, function(totalResults) {
    console.log(totalResults.join('\n'));
});


