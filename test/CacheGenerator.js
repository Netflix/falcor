var jsonGraph = require('falcor-json-graph');
var ref = jsonGraph.ref;
var atom = jsonGraph.atom;
var VIDEO_COUNT_PER_LIST = 10;
var AthroughZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

module.exports = function cacheGenerator(videoStartIdx, videoCount, fields) {
    fields = fields || ['title'];
    var listStartIndex = Math.floor(videoStartIdx / VIDEO_COUNT_PER_LIST);
    var startIdx = videoStartIdx % VIDEO_COUNT_PER_LIST;
    return {
        lolomo: ref(['lolomos', '1234']),
        lolomos: {
            1234: makeLolomos(listStartIndex, videoCount)
        },
        lists: makeLists(listStartIndex, startIdx, videoCount),
        videos: makeVideos(videoStartIdx, videoCount, fields)
    };
};

function makeLolomos(startIdx, count) {
    var listCount = Math.ceil(count / VIDEO_COUNT_PER_LIST);
    var lists = {};
    for (var i = startIdx; i < startIdx + listCount; ++i) {
        var listId = AthroughZ[i];
        lists[i] = ref(['lists', listId]);
    }
    return lists;
}

function makeVideos(startIdx, count, fields) {
    var videos = {};
    for (var i = startIdx; i < startIdx + count; ++i) {
        videos[i] = {};

        fields.forEach(function(f) {
            videos[i][f] = atom('Video ' + i);
        });
    }
    return videos;
}

function makeLists(listStartIdx, videoStartIdx, count) {
    var lists = {};
    var videoIdx = listStartIdx * VIDEO_COUNT_PER_LIST + videoStartIdx;
    var end = videoIdx + count;
    var listIdx = listStartIdx;
    var first = true;
    var list;

    for (;videoIdx < end; ++videoIdx) {
        if (!first && videoIdx % VIDEO_COUNT_PER_LIST === 0) {
            listIdx++;
        }
        var listId = AthroughZ[listIdx];

        if (!lists[listId]) {
            list = {};
            lists[listId] = list;
        }

        var listItemIdx = videoIdx % VIDEO_COUNT_PER_LIST;
        list[listItemIdx] = makeItem(videoIdx);

        first = false;
    }

    return lists;
}

function makeItem(idx) {
    return {
        item: ref(['videos', '' + idx])
    };
}
