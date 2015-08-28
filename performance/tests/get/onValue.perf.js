var Model = require("./../../../lib").Model;
var path = ['lolomo', 0, 0, 'item', 'title'];
var oPath = ['videos', 0, 'title'];
var cacheGenerator = require('./../../../test/CacheGenerator');
var model = new Model({
    cache: cacheGenerator(0, 1)
});

var onValue = require('./../../../lib/get/onValue');
var node = {
    $type: 'atom',
    value: 5
};
var results = {
    optimizedPaths: [],
    requestedPaths: []
};
var seed = {};
onValue(model, node, seed, results, path, oPath, [], 'PathMap', false);

module.exports = {
    'onValue': function() {
        onValue(model, node, {}, results, path, oPath, [], 'PathMap', false);
    },
    'onValue same': function() {
        onValue(model, node, {}, results, path, oPath, [], 'PathMap', false);
    },
    'onValue same again': function() {
        onValue(model, node, {}, results, path, oPath, [], 'PathMap', false);
    },
    'onValue for the peeps': function() {
        onValue(model, node, {}, results, path, oPath, [], 'PathMap', false);
    }
};
