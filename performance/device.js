var testConfig = window.testConfig();
var config = testConfig.config;
var models = testConfig.models;

var mdpSimple = testConfig.get.simple(models.mdp, 'Value');
var modelSimple = testConfig.get.simple(models.model, 'Value');
var mdpReference = testConfig.get.reference(models.mdp, 'Value');
var modelReference = testConfig.get.reference(models.model, 'Value');
var mdpComplex = testConfig.get.complex(models.mdp, 'Value');
var modelComplex = testConfig.get.complex(models.model, 'Value');
var mdpScrollGallery = testConfig.get.scrollGallery(models.mdp, 'Value');
var modelScrollGallery = testConfig.get.scrollGallery(models.model, 'Value');

testConfig.repeatInConfig('mdp-sync-simple', 15, mdpSimple, config.tests);
testConfig.repeatInConfig('model-sync-simple', 15, modelSimple, config.tests);
testConfig.repeatInConfig('mdp-sync-reference', 15, mdpReference, config.tests);
testConfig.repeatInConfig('model-sync-reference', 15, modelReference, config.tests);
testConfig.repeatInConfig('mdp-sync-complex', 15, mdpComplex, config.tests);
testConfig.repeatInConfig('model-sync-complex', 15, modelComplex, config.tests);
testConfig.repeatInConfig('mdp-sync-gallery', 15, mdpScrollGallery, config.tests);
testConfig.repeatInConfig('model-sync-gallery', 15, modelScrollGallery, config.tests);

onTestsLoaded(config);
