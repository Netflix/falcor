var testConfig = window.testConfig();
var config = testConfig.config;
var models = testConfig.models;

//testConfig.repeatInConfig('macro-simple', 12, testConfig.simple(models.macro, 'JSON'), config.tests);
//testConfig.repeatInConfig('macro-reference', 12, testConfig.reference(models.macro, 'JSON'), config.tests);
//testConfig.repeatInConfig('macro-complex', 12, testConfig.complex(models.macro, 'JSON'), config.tests);
testConfig.repeatInConfig('macro-scroll', 12, testConfig.scrollGallery(models.macro, 'JSON'), config.tests);

onTestsLoaded(config);
