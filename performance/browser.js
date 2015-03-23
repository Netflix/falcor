var Rx = require('rx');
global.Rx = Rx;
var testConfig = require('./testConfig')();
var testRunner = require('./testRunner');
var benchmark = require('benchmark');
var config = testConfig.config;
var models = testConfig.models;

testConfig.repeatInConfig('sentinel-scroll', 10, testConfig.scrollGallery(models.sentinel, 'JSON'), config.tests);

console.log('Starting test');
testRunner(benchmark, config, 1, function(totalResults) {
    console.log(totalResults.join('\n'));
});


