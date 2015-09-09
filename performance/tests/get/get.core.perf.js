var Model = require("./../../../lib").Model;
var simple = [['lolomo', 0, 0, 'item', 'title']];
var row = [['lolomo', 0, {from: 0, to: 9}, 'item', 'title']];
var complex = [['lolomo', {from: 0, to: 4}, {from: 0, to: 9}, 'item', 'title']];
var noOp = function() {};
var ImmediateScheduler = require("./../../../lib/schedulers/ImmediateScheduler");
var cacheGenerator = require('./../../../test/CacheGenerator');
var cache = cacheGenerator(0, 50);
var model = new Model({
    cache: cache
});

model.get(complex[0]).subscribe(function(data) { });

var getWithPathsAsPathMap = require('./../../../lib/get').getWithPathsAsPathMap;
var out = {};
for (var i = 0; i < 5; ++i) {
    out['rowTest ' + i] = rowTest;
}

function rowTest() {
    getWithPathsAsPathMap(model, row, [{}]);
}

module.exports = out;
