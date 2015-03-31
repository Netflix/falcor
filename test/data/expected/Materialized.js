
module.exports = function() {
    return {
        missingBranch: {
            getPathSets: {
                query: [["videos", "missingBranch", "summary"]]
            },
            AsValues: {
                values: [{
                    "path": ["videos", "missingBranch"],
                    "value": { "$type": "sentinel" }
                }]
            },
            AsJSON: {
                values: [{
                    json: { "$type": "sentinel" }
                }]
            },
            AsPathMap: {
                values: [{
                    json: { videos: { missingBranch: { "$type": "sentinel" } } }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["videos", "missingBranch"]],
                    jsong: { videos: { missingBranch: { "$type": "sentinel" } } }
                }]
            }
        },
        missingLeaf: {
            getPathSets: {
                query: [["videos", "1234", "missingLeaf"]]
            },
            AsValues: {
                values: [{
                    "path": ["videos", "1234", "missingLeaf"],
                    "value": { "$type": "sentinel" }
                }]
            },
            AsJSON: {
                values: [{
                    json: { "$type": "sentinel" }
                }]
            },
            AsPathMap: {
                values: [{
                    json: { videos: { 1234: { missingLeaf: { "$type": "sentinel" } } } }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["videos", "1234", "missingLeaf"]],
                    jsong: { videos: { 1234: { missingLeaf: { "$type": "sentinel" } } } }
                }]
            }
        },
        sentinelOfUndefined: {
            getPathSets: {
                query: [["misc", "usentinel"]]
            },
            AsValues: {
                values: [{
                    "path": ["misc", "usentinel"],
                    "value": { "$type": "sentinel" }
                }]
            },
            AsJSON: {
                values: [{
                    json: { "$type": "sentinel" }
                }]
            },
            AsPathMap: {
                values: [{
                    json: { misc: { usentinel: { "$type": "sentinel" } } }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["misc", "usentinel"]],
                    jsong: { misc: { usentinel: { "$type": "sentinel" } } }
                }]
            }
        }
    }
}
