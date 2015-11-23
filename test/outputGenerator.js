var jsonGraph = require('falcor-json-graph');
var ref = jsonGraph.ref;
var atom = jsonGraph.atom;
var VIDEO_COUNT_PER_LIST = 10;

module.exports = {
    videoGenerator: function(ids, fields, refPaths, toReferences) {
        fields = fields || ['title'];
        var videos = {};
        videos.$__path = ['videos'];
        var json = {
            json: {
                videos: videos
            }
        };

        ids.forEach(function(id, i) {
            var video = {};
            var refPath = refPaths && refPaths[i];
            var toReference = toReferences && toReferences[i];
            video.$__path = ['videos', id];

            if (refPath && toReference) {
                video.$__refPath = refPath;
                video.$__toReference = toReference;
            }

            fields.forEach(function(field) {
                video[field] = 'Video ' + id;
            });

            videos[id] = video;
        });

        return json;
    },
    lolomoGenerator: function(lists, items, fields) {
        fields = fields || ['title'];
        var lolomo = {
            $__path: ['lolomos', 1234],
            $__toReference: ['lolomo'],
            $__refPath: ['lolomos', 1234]
        };
        var json = {
            json: {
                lolomo: lolomo
            }
        };

        lists.forEach(function(listIndex) {
            var list = {
                $__path: getListRef(listIndex),
                $__toReference: ['lolomos', 1234, listIndex],
                $__refPath: getListRef(listIndex)
            };

            lolomo[listIndex] = list;

            items.forEach(function(itemIndex) {
                var ro = list[itemIndex] = {
                    $__path: getListRef(listIndex).concat(itemIndex),
                    $__toReference: ['lolomos', 1234, listIndex],
                    $__refPath: getListRef(listIndex)
                };
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
    var refPath = ['videos', videoIdx];
    var toReference = getListRef(listIndex).concat([itemIndex, 'item']);
    var item = {
        $__path: ['videos', videoIdx],
        $__refPath: refPath,
        $__toReference: toReference
    };

    fields.forEach(function(f) {
        item[f] = 'Video ' + videoIdx;
    });

    return item;
}
