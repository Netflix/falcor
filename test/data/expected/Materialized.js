var $path = require('./../../../lib/types/path.js');
var $atom = require('./../../../lib/types/atom.js');
var $error = require('./../../../lib/types/error.js');

module.exports = function() {
    return {
        routerOrSourceMissing: {
            getPathSets: {
                query: [["videos", "missingBranch", "summary"]]
            },
            getPathMaps: {
                query: [{
                    json: {
                        videos: {
                            missingBranch: {
                                summary: null
                            }
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
                    json: {
                        videos: {
                            missingBranch: {
                                summary: null
                            }
                        }
                    }
                }]
            },
            AsValues: {
                values: [{
                    path: ["videos", "missingBranch"],
                    "value": { "$type": $atom }
                }]
            },
            AsJSON: {
                values: [{
                    json: { "$type": $atom }
                }]
            },
            AsPathMap: {
                values: [{
                    json: { videos: { missingBranch: { "$type": $atom } } }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["videos", "missingBranch"]],
                    jsong: { videos: { missingBranch: { "$type": $atom } } }
                }]
            }
        },
        missingLeaf: {
            getPathSets: {
                query: [["videos", "1234", "missingLeaf"]]
            },
            getPathMaps: {
                query: [{
                    json: {
                        videos: {
                            1234: {
                                missingLeaf: null
                            }
                        }
                    }
                }]
            },
            AsValues: {
                values: [{
                    path: ["videos", "1234", "missingLeaf"],
                    "value": { "$type": $atom }
                }]
            },
            AsJSON: {
                values: [{
                    json: { "$type": $atom }
                }]
            },
            AsPathMap: {
                values: [{
                    json: { videos: { 1234: { missingLeaf: { "$type": $atom } } } }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["videos", "1234", "missingLeaf"]],
                    jsong: { videos: { 1234: { missingLeaf: { "$type": $atom } } } }
                }]
            }
        },
        atomOfUndefined: {
            getPathSets: {
                query: [["misc", "uatom"]]
            },
            getPathMaps: {
                query: [{
                    json: {
                        misc: {
                            uatom: null
                        }
                    }
                }]
            },
            AsValues: {
                values: [{
                    path: ["misc", "uatom"],
                    "value": { "$type": $atom }
                }]
            },
            AsJSON: {
                values: [{
                    json: { "$type": $atom }
                }]
            },
            AsPathMap: {
                values: [{
                    json: { misc: { uatom: { "$type": $atom } } }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["misc", "uatom"]],
                    jsong: { misc: { uatom: { "$type": $atom } } }
                }]
            }
        }
    }
}
