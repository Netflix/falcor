var Model = require("./../../../lib").Model;
var simple = [[0, 0, 'item', 'title']];
var row = [[0, {from: 0, to: 9}, 'item', 'title']];
var complex = [[{from: 0, to: 4}, {from: 0, to: 9}, 'item', 'title']];
var noOp = function() {};
var ImmediateScheduler = require("./../../../lib/schedulers/ImmediateScheduler");
var CacheGenerator = require('./../../../test/CacheGenerator');
var cache = CacheGenerator(0, 50);
var model = new Model({
    cache: cache
});

model.deref(['lolomo'], [0, 0, 'item', 'title']).subscribe(function(m) {
    model = m;
});

model.get(complex[0]).subscribe(function(data) { });

var getAsPathMap = require('./../../../lib/get').getAsPathMap;

module.exports = {
    'Test simple get': function() {
        getAsPathMap(model, simple, [{}]);
    },
    'Test simple get again': function() {
        getAsPathMap(model, simple, [{}]);
    },
    'Test row get': function() {
        getAsPathMap(model, row, [{}]);
    },
    'Test row get again': function() {
        getAsPathMap(model, row, [{}]);
    },
    'Test complex get': function() {
        getAsPathMap(model, complex, [{}]);
    },
    'Test complex get again': function() {
        getAsPathMap(model, complex, [{}]);
    }
};
