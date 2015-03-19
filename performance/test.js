var Rx = require('rx');
global.Rx = Rx;
var testConfig = require('./testConfig')();
var config = testConfig.config;
var models = testConfig.models;

testConfig.repeatInConfig('sentinel.Model simple', 1, testConfig.simple(models.sentinel, 'JSON'), config.tests);
testConfig.repeatInConfig('alternate.Model simple', 1, testConfig.simple(models.alt, 'JSON'), config.tests);

require('./test-header')(require('benchmark'), config, 5, function(totalResults) {
    var fs = require('fs');
    fs.writeFileSync('out.csv', totalResults.join('\n'))
});
