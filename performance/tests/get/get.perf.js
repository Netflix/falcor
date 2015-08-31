var falcor = require("./../../../lib");
var Model = falcor.Model;
var simple = ['lolomo', 0, 0, 'item', 'title'];
var row = ['lolomo', 0, {from: 0, to: 9}, 'item', 'title'];
var complex = ['lolomo', {from: 0, to: 4}, {from: 0, to: 9}, 'item', 'title'];
var noOp = function() {};
var ImmediateScheduler = require("./../../../lib/schedulers/ImmediateScheduler");
var CacheGenerator = require('./../../../test/CacheGenerator');
var cache = CacheGenerator(0, 50);
var model = new Model({
    cache: cache
});

var TriggerDataSource = require("./../../TriggerDataSource");
var triggerSource = new TriggerDataSource({
    jsonGraph: CacheGenerator(0, 10)
});
var triggerModel = new Model({
    cache: {},
    source: triggerSource,
    scheduler: new ImmediateScheduler()
});
var head = require('./../../../lib/internal/head');
var tail = require('./../../../lib/internal/tail');
var next = require('./../../../lib/internal/next');
var prev = require('./../../../lib/internal/prev');
falcor.config.DEBUG = false;
falcor.config.GET_WITH_PATHS_ONLY = true;


module.exports = {
    'Tests getting primed cache results': function() {
        model.
            get(row).
            subscribe(noOp, noOp, noOp);
    },
    'Tests getting primed cache results again': function() {
        model.
            get(row).
            subscribe(noOp, noOp, noOp);
    },
    'Tests getting empty cache to dataSource results': function() {
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
    },
    'Tests getting empty cache to dataSource results again': function() {
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
};
