module.exports = function() {
    return {
        errorBranchSummary: {
            getPathSets: {
                query: [
                    ["videos", "errorBranch", "summary"]
                ]
            },
            getPathMaps: {
                query: [{
                    videos: {
                        errorBranch: {
                            summary: null
                        }
                    }
                }]
            },
            AsValues: {
                values: [{
                    "path": ["videos", "errorBranch"],
                    "value": "I am yelling timber."
                }]
            },
            AsJSON: {
                values: [{
                    json: "I am yelling timber."
                }]
            },
            AsPathMap: {
                values: [{
                    json: {
                        "videos": {
                            "errorBranch": "I am yelling timber."
                        }
                    }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["videos", "errorBranch"]],
                    jsong: {
                        "videos": {
                            "errorBranch": {
                                "$size": "51",
                                "$type": "error",
                                "value": "I am yelling timber."
                            }
                        }
                    }
                }]
            }
        },
        genreListErrorNull: {
            getPathSets: {
                query: [
                    ["genreList", 2, null]
                ]
            },
            getPathMaps: {
                query: [{
                    genreList: {
                        2: {
                            __null: null
                        }
                    }
                }]
            },
            AsValues: {
                values: [{
                    "path": ["genreList", "2", null],
                    "value": "Red is the new Black"
                }]
            },
            AsJSON: {
                values: [{
                    json: "Red is the new Black"
                }]
            },
            AsPathMap: {
                values: [{
                    json: {
                        "genreList": {
                            "2": "Red is the new Black"
                        }
                    }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["genreList", "2", null]],
                    jsong: {
                        "genreList": {
                            "2": {
                                "$size": 51,
                                "$type": "path",
                                "value": ["lists", "error-list"]
                            }
                        },
                        "lists": {
                            "error-list": {
                                "$size": "51",
                                "$type": "error",
                                "value": "Red is the new Black"
                            }
                        }
                    }
                }]
            }
        }
    };
}