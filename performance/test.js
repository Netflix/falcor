var Rx = require('rx');
global.Rx = Rx;
var testConfig = require('./testConfig')();
var config = testConfig.config;
var models = testConfig.models;

testConfig.repeatInConfig('sentinel.Model simple', 1, testConfig.simple(models.sentinel, 'JSON'), config.tests);
testConfig.repeatInConfig('alternate.Model simple', 1, testConfig.simple(models.alt, 'JSON'), config.tests);
testConfig.repeatInConfig('sentinel.Model reference', 1, testConfig.reference(models.sentinel, 'JSON'), config.tests);
testConfig.repeatInConfig('alternate.Model reference', 1, testConfig.reference(models.alt, 'JSON'), config.tests);
testConfig.repeatInConfig('sentinel.Model complex', 1, testConfig.complex(models.sentinel, 'JSON'), config.tests);
testConfig.repeatInConfig('alternate.Model complex', 1, testConfig.complex(models.alt, 'JSON'), config.tests);
testConfig.repeatInConfig('sentinel.Model startup', 1, testConfig.startup(models.sentinel, 'JSON'), config.tests);
testConfig.repeatInConfig('alternate.Model startup', 1, testConfig.startup(models.alt, 'JSON'), config.tests);
testConfig.repeatInConfig('sentinel.Model scrollGallery', 1, testConfig.scrollGallery(models.sentinel, 'JSON'), config.tests);
testConfig.repeatInConfig('alternate.Model scrollGallery', 1, testConfig.scrollGallery(models.alt, 'JSON'), config.tests);

require('./test-header')(require('benchmark'), config, 5, function(totalResults) {
    var fs = require('fs');
    fs.writeFileSync('out.csv', totalResults.join('\n'))
});
