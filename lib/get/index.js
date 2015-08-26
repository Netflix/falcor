var get = require('./get');
var walkPath = require('./walkPath');
var walkJSON = require('./walkJSON');

var getWithPathsAsPathMap = get(walkPath, false);
var getWithPathsAsJSONGraph = get(walkPath, true);
var getWithJSONAsPathMap = get(walkJSON, false);
var getWithJSONAsJSONGraph = get(walkJSON, true);

module.exports = {
    getValueSync: require("./../get/getValueSync"),
    getBoundValue: require("./../get/getBoundValue"),
    getWithPathsAsPathMap: getWithPathsAsPathMap,
    getWithJSONAsPathMap: getWithJSONAsPathMap,
    getWithPathsAsJSONGraph: getWithPathsAsJSONGraph,
    getWithJSONAsJSONGraph: getWithJSONAsJSONGraph,
};
