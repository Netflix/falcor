var testConfig = window.testConfig();
var config = testConfig.config;
testConfig.repeatInConfig('rec.Model AsJSON Reference', 8, testConfig.referenceJSONRec, config.tests);
onTestsLoaded(config);
