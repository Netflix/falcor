var jsonGraph = require('falcor-json-graph');
var ref = jsonGraph.ref;
var atom = jsonGraph.atom;
var VIDEO_COUNT_PER_LIST = 10;
var __key = require('./../lib/internal/key');
var __path = require('./../lib/internal/path');
var __parent = require('./../lib/internal/parent');

module.exports = {
    videoGenerator: function(ids, fields) {
        fields = fields || ['title'];
        var videos = {};
        videos[__key] = 'videos';
        videos[__parent] = null;
        var json = {
            json: {
                videos: videos
            }
        };

        ids.forEach(function(id) {
            var video = {};
            video[__key] = id;
            video[__parent] = videos;

            fields.forEach(function(field) {
                video[field] = 'Video ' + id;
            });

            videos[id] = video;
        });

        return json;
    },
    lolomoGenerator: function(lists, items, fields) {
        fields = fields || ['title'];
        var lolomo = {};
        lolomo[__path] = ['lolomos', 1234];
        var json = {
            json: {
                lolomo: lolomo
            }
        };

        lists.forEach(function(listIndex) {
            var list = {};
            list[__path] = getListRef(listIndex);
            lolomo[listIndex] = list;

            items.forEach(function(itemIndex) {
                var ro = list[itemIndex] = {};
                ro[__key] = itemIndex;
                ro[__parent] = list;
                ro.item = getItemObject(listIndex, itemIndex, fields);
            });
        });

        return json;
    }
};

var listIds = {
    0: 'A',
    1: 'B',
    2: 'C',
    3: 'D',
    4: 'E'
};
function getListRef(listIndex) {
    return ['lists', listIds[listIndex]];
}

function getItemObject(listIndex, itemIndex, fields) {
    var videoIdx = listIndex * VIDEO_COUNT_PER_LIST + itemIndex;
    var item = {};
    item[__path] = ['videos', videoIdx];

    fields.forEach(function(f) {
        item[f] = 'Video ' + videoIdx;
    });

    return item;
}
