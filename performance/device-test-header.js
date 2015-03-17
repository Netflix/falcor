var testConfig = window.testConfig();
var config = testConfig.config;
for (var i = 0; i < 5; i++) {
    testConfig.repeatInConfig(i + 'current', 2, testConfig.referenceJSONRec, config.tests);
    testConfig.repeatInConfig(i + 'next', 2, testConfig.referenceJSON, config.tests);
}
onTestsLoaded(config);
