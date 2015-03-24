var Rx = require('rx');
global.Rx = Rx;
var testConfig = require('./testConfig')();
var testRunner = require('./testRunner');
var benchmark = require('benchmark');
var config = testConfig.config;
var models = testConfig.models;

testConfig.repeatInConfig('legacy-simple', 1, testConfig.simple(models.legacy, 'Value'), config.tests);
testConfig.repeatInConfig('model-simple', 1, testConfig.simple(models.model, 'Value'), config.tests);
testConfig.repeatInConfig('legacy-reference', 1, testConfig.reference(models.legacy, 'Value'), config.tests);
testConfig.repeatInConfig('model-reference', 1, testConfig.reference(models.model, 'Value'), config.tests);
testConfig.repeatInConfig('legacy-complex', 1, testConfig.complex(models.legacy, 'Value'), config.tests);
testConfig.repeatInConfig('model-complex', 1, testConfig.complex(models.model, 'Value'), config.tests);
testConfig.repeatInConfig('legacy-scroll', 1, testConfig.scrollGallery(models.legacy, 'Value'), config.tests);
testConfig.repeatInConfig('model-scroll', 1, testConfig.scrollGallery(models.model, 'Value'), config.tests);
testRunner(benchmark, config, 10, function(totalResults) {
    console.log(totalResults.join('\n'));
});


