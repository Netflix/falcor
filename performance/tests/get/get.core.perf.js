var Model = require("./../../../lib").Model;
var simple = [['lolomo', 0, 0, 'item', 'title']];
var row = [['lolomo', 0, {from: 0, to: 9}, 'item', 'title']];
var complex = [['lolomo', {from: 0, to: 4}, {from: 0, to: 9}, 'item', 'title']];
var noOp = function() {};
var ImmediateScheduler = require("./../../../lib/schedulers/ImmediateScheduler");
var CacheGenerator = require('./../../../test/CacheGenerator');
var cache = CacheGenerator(0, 50);
var model = new Model({
    cache: cache
});

var getWithPathsAsPathMap = require('./../../../lib/get').getWithPathsAsPathMap;

module.exports = {
    'Test simple get': function() {
        getWithPathsAsPathMap(model, simple, [{}]);
    },
    'Test simple get again': function() {
        getWithPathsAsPathMap(model, simple, [{}]);
    },
    'Test row get': function() {
        getWithPathsAsPathMap(model, row, [{}]);
    },
    'Test row get again': function() {
        getWithPathsAsPathMap(model, row, [{}]);
    },
    'Test complex get': function() {
        getWithPathsAsPathMap(model, complex, [{}]);
    },
    'Test complex get again': function() {
        getWithPathsAsPathMap(model, complex, [{}]);
    }
};
