var Rx = require('rx');
global.Rx = Rx;
var nextFalcor = require('./next_falcor');
global.window = {falcor: nextFalcor};
var testConfig = require('./testConfig')();
var config = testConfig.config;
testConfig.repeatInConfig('next.Model test', 1, testConfig.simpleJSON, config.tests);
testConfig.repeatInConfig('rec.Model test', 1, testConfig.simpleJSON, config.tests);

debugger;
require('./test-header')(require('benchmark'), config, 8, function(totalResults) {
    var fs = require('fs');
    fs.writeFileSync('out.csv', totalResults.join('\n'))
});
