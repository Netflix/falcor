var Rx = require('rx');
global.Rx = Rx;
var testConfig = require('./testConfig')();
var config = testConfig.config;
var models = testConfig.models;
var macroSimple = testConfig.set.simple(models.macro, 'JSON');

testConfig.repeatInConfig('macro-simple', 1, macroSimple, config.tests);
//testConfig.repeatInConfig('model-simple', 1, testConfig.simple(models.model, 'Value'), config.tests);
//testConfig.repeatInConfig('macro-reference', 1, testConfig.reference(models.macro, 'Value'), config.tests);
//testConfig.repeatInConfig('model-reference', 1, testConfig.reference(models.model, 'Value'), config.tests);
//testConfig.repeatInConfig('macro-complex', 1, testConfig.complex(models.macro, 'Value'), config.tests);
//testConfig.repeatInConfig('model-complex', 1, testConfig.complex(models.model, 'Value'), config.tests);
//testConfig.repeatInConfig('macro-scroll', 1, testConfig.scrollGallery(models.macro, 'Value'), config.tests);
//testConfig.repeatInConfig('model-scroll', 1, testConfig.scrollGallery(models.model, 'Value'), config.tests);

debugger;
require('./testRunner')(require('benchmark'), config, 10, function(totalResults) {
    var fs = require('fs');
    fs.writeFileSync('out.csv', totalResults.join('\n'))
});
