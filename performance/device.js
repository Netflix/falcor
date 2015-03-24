var testConfig = window.testConfig();
var config = testConfig.config;
var models = testConfig.models;
var macroSimple = testConfig.set.simple(models.macro, 'JSON');
var modelSimple = testConfig.set.simple(models.model, 'JSON');
var macroReference = testConfig.set.reference(models.macro, 'JSON');
var modelReference = testConfig.set.reference(models.model, 'JSON');

testConfig.repeatInConfig('macro-simple', 15, macroSimple, config.tests);
testConfig.repeatInConfig('model-simple', 15, modelSimple, config.tests);
testConfig.repeatInConfig('macro-reference', 15, macroReference, config.tests);
testConfig.repeatInConfig('model-reference', 15, modelReference, config.tests);

onTestsLoaded(config);
