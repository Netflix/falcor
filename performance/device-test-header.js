var testConfig = window.testConfig();
var config = testConfig.config;
testConfig.repeatInConfig('Next', 5, testConfig.scrollGallery(testConfig.sentinel, 'JSON'), config.tests);

onTestsLoaded(config);
