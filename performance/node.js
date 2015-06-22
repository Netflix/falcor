var testRunner = require('./testRunner');
var testSuiteGenerator = require('./testSuiteGenerator');
var testConfig = require('./testConfig')();

var models = testConfig.models;
var formats = testConfig.formats;
var tests = testConfig.get;
var suite = testConfig.suite;

suite.tests = testSuiteGenerator({

    iterations: 1,

    models: {
        'model' : models.model,
        'mock' : models.mock
    },

    formats: [
        'JSON',
        'Value',
        'PathMap',
        'JSONG'
    ],

    tests: {
        'gallery values': tests.scrollGallery
    }

});

testRunner(suite, 10, function(totalResults) {
    require('fs').writeFileSync('out.csv', totalResults.join('\n'));
});
