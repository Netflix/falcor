var Rx = require('rx');
global.Rx = Rx;
var testConfig = require('./testConfig')();
var config = testConfig.config;
var models = testConfig.models;

testConfig.repeatInConfig('paulcor-simple', 1, testConfig.simple(models.paulcor, 'JSON'), config.tests);
testConfig.repeatInConfig('sentinel-simple', 1, testConfig.simple(models.sentinel, 'JSON'), config.tests);
testConfig.repeatInConfig('paulcor-reference', 1, testConfig.reference(models.paulcor, 'JSON'), config.tests);
testConfig.repeatInConfig('sentinel-reference', 1, testConfig.reference(models.sentinel, 'JSON'), config.tests);
testConfig.repeatInConfig('paulcor-complex', 1, testConfig.complex(models.paulcor, 'JSON'), config.tests);
testConfig.repeatInConfig('sentinel-complex', 1, testConfig.complex(models.sentinel, 'JSON'), config.tests);
testConfig.repeatInConfig('paulcor-scroll', 1, testConfig.scrollGallery(models.paulcor, 'JSON'), config.tests);
testConfig.repeatInConfig('sentinel-scroll', 1, testConfig.scrollGallery(models.sentinel, 'JSON'), config.tests);

require('./testRunner')(require('benchmark'), config, 10, function(totalResults) {
    var fs = require('fs');
    fs.writeFileSync('out.csv', totalResults.join('\n'))
});
