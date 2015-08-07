var $path = require('./../../../lib/types/ref');
var $atom = require('./../../../lib/types/atom');
var $error = require('./../../../lib/types/error');

module.exports = function() {
    return {
        routerOrSourceMissing: {
            getPathValues: {
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
            getPathValues: {
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
                    jsonGraph: { videos: { missingBranch: { "$type": $atom } } }
                }]
            }
        },
        missingLeaf: {
            getPathValues: {
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
                    jsonGraph: { videos: { 1234: { missingLeaf: { "$type": $atom } } } }
                }]
            }
        },
        atomOfUndefined: {
            getPathValues: {
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
                    jsonGraph: { misc: { uatom: { "$type": $atom } } }
                }]
            }
        }
    }
}
