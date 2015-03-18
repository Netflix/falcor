var Rx = require('rx');
global.Rx = Rx;
var nextFalcor = require('./next_falcor');
global.window = {falcor: nextFalcor};
var testConfig = require('./testConfig')();
var config = testConfig.config;

Object.keys(testConfig).filter(function(key) {
    return (
        -1 !== key.indexOf("startup")) || (
        -1 !== key.indexOf("gallery")) || (
        -1 !== key.indexOf("simple"))  || (
        -1 !== key.indexOf("reference"));
}).forEach(function(key) {
    testConfig.repeatInConfig('falcor.Model test ' + key, 8, testConfig[key], config.tests);
});

debugger;
require('./test-header')(require('benchmark'), config, 8, function(totalResults) {
    var fs = require('fs');
    fs.writeFileSync('out.csv', totalResults.join('\n'))
});
