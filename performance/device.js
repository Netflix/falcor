var testConfig = window.testConfig();
var config = testConfig.config;
var models = testConfig.models;
testConfig.repeatInConfig('paulcor-complex', 15, testConfig.complex(models.paulcor, 'JSON'), config.tests);

onTestsLoaded(config);
