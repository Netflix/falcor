var $path = require('./../../../lib/types/path.js');
var $sentinel = require('./../../../lib/types/sentinel.js');
var $error = require('./../../../lib/types/error.js');

module.exports = function() {
    return {
        routerOrSourceMissing: {
            getPathSets: {
                query: [["videos", "missingBranch", "summary"]]
            },
            getPathMaps: {
                query: [{
                    videos: {
                        missingBranch: {
                            summary: null
                        }
                    }
                }]
            },
            AsValues: {
                values: []
            },
            AsJSON: {
                values: [{}]
            },
            AsPathMap: {
                values: [{}]
            },
            AsJSONG: {
                values: [{}]
            }
        },
        missingBranch: {
            getPathSets: {
                query: [["videos", "missingBranch", "summary"]]
            },
            getPathMaps: {
                query: [{
                    videos: {
                        missingBranch: {
                            summary: null
                        }
                    }
                }]
            },
            AsValues: {
                values: [{
                    path: ["videos", "missingBranch"],
                    "value": { "$type": $sentinel }
                }]
            },
            AsJSON: {
                values: [{
                    json: { "$type": $sentinel }
                }]
            },
            AsPathMap: {
                values: [{
                    json: { videos: { missingBranch: { "$type": $sentinel } } }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["videos", "missingBranch"]],
                    jsong: { videos: { missingBranch: { "$type": $sentinel } } }
                }]
            }
        },
        missingLeaf: {
            getPathSets: {
                query: [["videos", "1234", "missingLeaf"]]
            },
            getPathMaps: {
                query: [{
                    videos: {
                        1234: {
                            missingLeaf: null
                        }
                    }
                }]
            },
            AsValues: {
                values: [{
                    path: ["videos", "1234", "missingLeaf"],
                    "value": { "$type": $sentinel }
                }]
            },
            AsJSON: {
                values: [{
                    json: { "$type": $sentinel }
                }]
            },
            AsPathMap: {
                values: [{
                    json: { videos: { 1234: { missingLeaf: { "$type": $sentinel } } } }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["videos", "1234", "missingLeaf"]],
                    jsong: { videos: { 1234: { missingLeaf: { "$type": $sentinel } } } }
                }]
            }
        },
        sentinelOfUndefined: {
            getPathSets: {
                query: [["misc", "usentinel"]]
            },
            getPathMaps: {
                query: [{
                    misc: {
                        usentinel: null
                    }
                }]
            },
            AsValues: {
                values: [{
                    path: ["misc", "usentinel"],
                    "value": { "$type": $sentinel }
                }]
            },
            AsJSON: {
                values: [{
                    json: { "$type": $sentinel }
                }]
            },
            AsPathMap: {
                values: [{
                    json: { misc: { usentinel: { "$type": $sentinel } } }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["misc", "usentinel"]],
                    jsong: { misc: { usentinel: { "$type": $sentinel } } }
                }]
            }
        }
    }
}
