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
                    "value": {
                        "$size": 50,
                        "$type": "error",
                        "message": "I am yelling timber."
                    }
                }]
            },
            AsJSON: {
                values: [{
                    json: {
                        "$size": 50,
                        "$type": "error",
                        "message": "I am yelling timber."
                    }
                }]
            },
            AsPathMap: {
                values: [{
                    json: {
                        "videos": {
                            "errorBranch": {
                                "$size": 50,
                                "$type": "error",
                                "message": "I am yelling timber."
                            }
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
                                "$size": 50,
                                "$type": "error",
                                "message": "I am yelling timber."
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
                    "value": {
                        "$size": 50,
                        "$type": "error",
                        "message": "Red is the new Black"
                    }
                }]
            },
            AsJSON: {
                values: [{
                    json: {
                        "$size": 50,
                        "$type": "error",
                        "message": "Red is the new Black"
                    }
                }]
            },
            AsPathMap: {
                values: [{
                    json: {
                        "genreList": {
                            "2": {
                                "$size": 50,
                                "$type": "error",
                                "message": "Red is the new Black"
                            }
                        }
                    }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["genreList", "2", null]],
                    jsong: {
                        "genreList": {
                            "2": ["lists", "error-list"]
                        },
                        "lists": {
                            "error-list": {
                                "$size": 50,
                                "$type": "error",
                                "message": "Red is the new Black"
                            }
                        }
                    }
                }]
            }
        },
    };
}