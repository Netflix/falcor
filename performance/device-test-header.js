var testConfig = window.testConfig();
var config = testConfig.config;

//falcor.Model.prototype._getPathsAsJSON = falcorNext.getPathSetsAsJSON;
//falcor.Model.prototype._getPathsAsJSONG = falcorNext.getPathSetsAsJSONG;
//falcor.Model.prototype._getPathsAsPathMap = falcorNext.getPathSetsAsPathMap;
//falcor.Model.prototype._getPathsAsValues = falcorNext.getPathSetsAsValues;
//for (var i = 0; i < 3; i++) {
//}
//testConfig.repeatInConfig('Recursive', 10, testConfig.referenceJSONRec, config.tests);
testConfig.repeatInConfig('Next', 5, testConfig.galleryJSONRec, config.tests);

onTestsLoaded(config);
