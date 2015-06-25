var testConfig = window.testConfig();
var testRunner = require('./testRunner');
var testSuiteGenerator = require('./testSuiteGenerator');
var CSVFormatter = require('./formatter/CSVFormatter');

var models = testConfig.models;
var formats = testConfig.formats;
var tests = testConfig.get;
var suite = testConfig.suite;

suite.tests = testSuiteGenerator({

    iterations: 15,

    models: {
        'model' : models.model,
        'mdp' : models.mdp
    },

    formats: testConfig.formats,

    tests: {
        'simple': tests.simple,
        'reference': tests.reference,
        'complex': tests.complex,
        'scrollGallery': tests.scrollGallery
    }
});

onTestsLoaded(suite);

// Gibbon Runner
// nrdp.tvuitest.message
// nrdp.tvuitest.finish