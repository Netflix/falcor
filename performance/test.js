var Rx = require('rx');
global.Rx = Rx;
var testConfig = require('./testConfig')();
var config = testConfig.config;
testConfig.repeatInConfig('falcor.Model test', 8, testConfig.simpleJSON, config.tests);

require('./test-header')(require('benchmark'), config, 3, function(totalResults) {
    var fs = require('fs');
    fs.writeFileSync('out.csv', totalResults.join('\n'))
});
