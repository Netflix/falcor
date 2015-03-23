var testConfig = window.testConfig();
var config = testConfig.config;
var models = testConfig.models;

testConfig.repeatInConfig('paulcor-simple', 15, testConfig.simple(models.paulcor, 'JSON'), config.tests);

onTestsLoaded(config);
