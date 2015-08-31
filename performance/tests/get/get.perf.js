var Model = require("./../../../lib").Model;
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
var triggerSource = new TriggerDataSource(function() {
    return {
        jsonGraph: {
            lolomo: {$type: 'ref', value: ['lolomos', 123]},
            lolomos: {
                123: {
                    0: {$type: 'ref', value: ['lists', 'A']}
                }
            },
            lists: {
                A: {
                    0: { item: {$type: 'ref', value: ['videos', 0]} },
                    1: { item: {$type: 'ref', value: ['videos', 1]} },
                    2: { item: {$type: 'ref', value: ['videos', 2]} },
                    3: { item: {$type: 'ref', value: ['videos', 3]} },
                    4: { item: {$type: 'ref', value: ['videos', 4]} },
                    5: { item: {$type: 'ref', value: ['videos', 5]} },
                    6: { item: {$type: 'ref', value: ['videos', 6]} },
                    7: { item: {$type: 'ref', value: ['videos', 7]} },
                    8: { item: {$type: 'ref', value: ['videos', 8]} },
                    9: { item: {$type: 'ref', value: ['videos', 9]} }
                }
            },
            videos: {
                0: { title: 'Video 0' },
                1: { title: 'Video 1' },
                2: { title: 'Video 2' },
                3: { title: 'Video 3' },
                4: { title: 'Video 4' },
                5: { title: 'Video 5' },
                6: { title: 'Video 6' },
                7: { title: 'Video 7' },
                8: { title: 'Video 8' },
                9: { title: 'Video 9' },
            }
        }
    };
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
