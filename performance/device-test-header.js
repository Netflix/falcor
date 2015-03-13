var testConfig = window.testConfig();
var config = testConfig.config;
testConfig.repeatInConfig('falcor.Model test', 8, testConfig.simpleJSON, config.tests);
onTestsLoaded(config);
