var Model = require("./../../../lib").Model;
var simple = ['lolomo', 0, 0, 'item', 'title'];
var row = ['lolomo', 0, {from: 0, to: 9}, 'item', 'title'];
var rows = [['lolomo', 0, {from: 0, to: 9}, 'item', 'title']];
var complex = ['lolomo', {from: 0, to: 4}, {from: 0, to: 9}, 'item', 'title'];
var noOp = function() {};
var ImmediateScheduler = require("./../../../lib/schedulers/ImmediateScheduler");
var CacheGenerator = require('./../../../test/CacheGenerator');
var cache = CacheGenerator(0, 50);
var inMemoryCache = require('./../inMemoryCache');
var model = new Model({
    cache: cache
});

var TriggerDataSource = require("./../../TriggerDataSource");
var triggerSource = new TriggerDataSource(inMemoryCache);
var triggerModel = new Model({
    cache: {},
    source: triggerSource,
    scheduler: new ImmediateScheduler()
});
var head = require('./../../../lib/internal/head');
var tail = require('./../../../lib/internal/tail');
var next = require('./../../../lib/internal/next');
var prev = require('./../../../lib/internal/prev');

function primedCache() {
    model.
        get(row).
        subscribe(noOp, noOp, noOp);
}

function primedCacheWithPaths() {
    model.
        getPaths(rows).
        subscribe(noOp, noOp, noOp);
}

function toDataSource() {
    triggerModel.
        get(row).
        subscribe(noOp, noOp, function() {
            triggerModel._root.cache = {};
            triggerModel._root[head] = null;
            triggerModel._root[tail] = null;
            triggerModel._root[prev] = null;
            triggerModel._root[next] = null;
            triggerModel._root.expired = [];
        });
        triggerSource.trigger();
}

function batchingRequests() {
    triggerModel.
        get(row).
        subscribe(noOp, noOp, noOp);

    triggerModel.
        get(row).
        subscribe(function() {
        }, noOp, function() {
            triggerModel._root.cache = {};
            triggerModel._root[head] = null;
            triggerModel._root[tail] = null;
            triggerModel._root[prev] = null;
            triggerModel._root[next] = null;
            triggerModel._root.expired = [];
        });
        triggerSource.trigger();
}

module.exports = function get(out, count) {
    count = count || 5;
    out = out || {};

    for (var i = 0; i < count; ++i) {
        out['get.toDataSource' + i] = toDataSource;
    }

    return out;
};

