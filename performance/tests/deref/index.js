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
var getWithPathsAsPathMap = require('./../../../lib/get').getWithPathsAsPathMap;

module.exports = function getRowTests(out, count, allowEnum) {
    model._allowEnumerableMetadata = allowEnum;
    count = count || 5;
    out = out || {};

    for (var i = 0; i < count; ++i) {
        out['deref.row' + i] = rowTest;
    }

    return out;
};

rowTest();

function rowTest() {
    var seed = [{}];
    getWithPathsAsPathMap(model, row, seed);

    var json = seed[0].json;
    var lolomoModel = model.deref(json.lolomo);
    var listsModel = model.deref(json.lolomo[0]);
    var videoModel = model.deref(json.lolomo[0][0].item);
}
