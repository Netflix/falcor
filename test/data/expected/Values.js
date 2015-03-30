module.exports = function() {
    return {
        direct: {
            getPathSets: {
                query: [
                    ["videos", "1234", "summary"]
                ]
            },
            setPathSets: {
                query: [{
                    "path": ["videos", "1234", "summary"],
                    "value": {
                        "title": "House of Cards",
                        "url": "/movies/1234"
                    }
                }]
            },
            setPathMaps: {
                query: [{
                    videos: {
                        1234: {
                            summary: {
                                "title": "House of Cards",
                                "url": "/movies/1234"
                            }
                        }
                    }
                }]
            },
            setJSONGs: {
                query: [{
                    paths: [["videos", "1234", "summary"]],
                    jsong: {
                        videos: {
                            1234: {
                                summary: {
                                    "title": "House of Cards",
                                    "url": "/movies/1234"
                                }
                            }
                        }
                    }
                }]
            },
            getPathMaps: {
                query: [{
                    videos: {
                        1234: {
                            summary: null
                        }
                    }
                }]
            },
            AsValues: {
                values: [{
                    "path": ["videos", "1234", "summary"],
                    "value": {
                        "title": "House of Cards",
                        "url": "/movies/1234"
                    }
                }]
            },
            AsJSON: {
                values: [{
                    json: {
                        "title": "House of Cards",
                        "url": "/movies/1234"
                    }
                }]
            },
            AsJSONG: {
                values: [{
                    jsong: {
                        videos: {
                            1234: {
                                summary: {
                                    "$size": 51,
                                    "$type": "sentinel",
                                    "value": {
                                        "title": "House of Cards",
                                        "url": "/movies/1234"
                                    }
                                }
                            }
                        }
                    },
                    paths: [["videos", "1234", "summary"]]
                }]
            },
            AsPathMap: {
                values: [{
                    json: {
                        videos: {
                            1234: {
                                "summary": {
                                    "title": "House of Cards",
                                    "url": "/movies/1234"
                                }
                            }
                        }
                    }
                }]
            }
        },
        direct553: {
            getPathSets: {
                query: [
                    ["videos", "553", "summary"]
                ]
            },
            setPathSets: {
                query: [{
                    "path": ["videos", "553", "summary"],
                    "value": {
                        "title": "Running Man",
                        "url": "/movies/553"
                    }
                }]
            },
            setPathMaps: {
                query: [{
                    videos: {
                        553: {
                            summary: {
                                "title": "Running Man",
                                "url": "/movies/553"
                            }
                        }
                    }
                }]
            },
            setJSONGs: {
                query: [{
                    paths: [["videos", "553", "summary"]],
                    jsong: {
                        videos: {
                            553: {
                                summary: {
                                    "title": "Running Man",
                                    "url": "/movies/553"
                                }
                            }
                        }
                    }
                }]
            },
            getPathMaps: {
                query: [{
                    videos: {
                        553: {
                            summary: null
                        }
                    }
                }]
            },
            AsValues: {
                values: [{
                    "path": ["videos", "553", "summary"],
                    "value": {
                        "title": "Running Man",
                        "url": "/movies/553"
                    }
                }]
            },
            AsJSON: {
                values: [{
                    json: {
                        "title": "Running Man",
                        "url": "/movies/553"
                    }
                }]
            },
            AsJSONG: {
                values: [{
                    jsong: {
                        videos: {
                            553: {
                                summary: {
                                    "$size": 51,
                                    "$type": "sentinel",
                                    "value": {
                                        "title": "Running Man",
                                        "url": "/movies/553"
                                    }
                                }
                            }
                        }
                    },
                    paths: [["videos", "553", "summary"]]
                }]
            },
            AsPathMap: {
                values: [{
                    json: {
                        videos: {
                            553: {
                                summary: {
                                    "title": "Running Man",
                                    "url": "/movies/553"
                                }
                            }
                        }
                    }
                }]
            }
        },
        reference: {
            optimizedPaths: [
                ["genreList", "0"]
            ],

            setPathSets: {
                query: [
                    {
                        "path": ["genreList", "0"],
                        "value": { "$type": "path", "value": ["lists", "abcd"] }
                    }
                ]
            },

            setPathMaps: {
                query: [{
                    genreList: {
                        0: ["lists", "abcd"]
                    }
                }]
            },
            setJSONGs: {
                query: [{
                    paths: [["genreList", "0"]],
                    jsong: {
                        genreList: {
                            0: ["lists", "abcd"]
                        }
                    }
                }]
            },

            getPathSets: {
                query: [
                    ["genreList", "0"]
                ]
            },

            getPathMaps: {
                query: [{
                    genreList: {
                        0: null
                    }
                }]
            },

            AsValues: {
                values: [
                    {
                        "path": ["genreList", "0"],
                        "value": ["lists", "abcd"]
                    }
                ]
            },

            AsJSON: {
                values: [{
                    json: ["lists", "abcd"]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        genreList: {
                            0: {
                                value: ["lists", "abcd"],
                                $type: 'path',
                                $size: 51
                            }
                        }
                    }
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        genreList: {
                            0: {
                                "$size": 51,
                                "$type": "path",
                                "value": ["lists", "abcd"]
                            }
                        }
                    },
                    paths: [["genreList", "0"]]
                }]
            }
        },
        sentinelDirect: {
            getPathSets: {
                query: [
                    ["videos", "1234", "summary"]
                ]
            },
            setPathSets: {
                query: [{
                    "path": ["videos", "1234", "summary"],
                    "value": {
                        "$type": "sentinel",
                        "value": {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    }
                }]
            },
            setPathMaps: {
                query: [{
                    videos: {
                        1234: {
                            summary: {
                                "title": "House of Cards",
                                "url": "/movies/1234"
                            }
                        }
                    }
                }]
            },
            setJSONGs: {
                query: [{
                    paths: [["videos", "1234", "summary"]],
                    jsong: {
                        videos: {
                            1234: {
                                summary: {
                                    "title": "House of Cards",
                                    "url": "/movies/1234"
                                }
                            }
                        }
                    }
                }]
            },
            getPathMaps: {
                query: [{
                    videos: {
                        1234: {
                            summary: null
                        }
                    }
                }]
            },
            AsValues: {
                values: [{
                    "path": ["videos", "1234", "summary"],
                    "value": {
                        "title": "House of Cards",
                        "url": "/movies/1234"
                    }
                }]
            },
            AsJSON: {
                values: [{
                    json: {
                        "title": "House of Cards",
                        "url": "/movies/1234"
                    }
                }]
            },
            AsJSONG: {
                values: [{
                    jsong: {
                        videos: {
                            1234: {
                                summary: {
                                    "$size": 51,
                                    "$type": "sentinel",
                                    "value": {
                                        "title": "House of Cards",
                                        "url": "/movies/1234"
                                    }
                                }
                            }
                        }
                    },
                    paths: [["videos", "1234", "summary"]]
                }]
            },
            AsPathMap: {
                values: [{
                    json: {
                        videos: {
                            1234: {
                                "summary": {
                                    "title": "House of Cards",
                                    "url": "/movies/1234"
                                }
                            }
                        }
                    }
                }]
            }
        },
        expiredLeafNodeTimestamp: {
            getPathSets: {
                query: [["videos", "expiredLeafByTimestamp", "summary"]]
            },

            getPathMaps: {
                query: [{
                    videos: {
                        expiredLeafByTimestamp: {
                            summary: null
                        }
                    }
                }]
            },
            
            setPathSets: {
                query: [
                    {
                        "path": ["videos", "expiredLeafByTimestamp", "summary"],
                        "value": {
                            "$type": "sentinel",
                            "$expires": Date.now() - 100,
                            "value": {
                                "title": "Marco Polo",
                                "url": "/movies/sentinel"
                            }
                        }
                    }
                ]
            },

            setPathMaps: {
                query: [{
                    videos: {
                        expiredLeafByTimestamp: {
                            summary: {
                                "$type": "sentinel",
                                "$expires": Date.now() - 100,
                                "value": {
                                    "title": "Marco Polo",
                                    "url": "/movies/sentinel"
                                }
                            }
                        }
                    }
                }]
            },
            setJSONG: {
                query: [{
                    paths: [["videos", "sentinel", "summary"]],
                    jsong: {
                        videos: {
                            expiredLeafByTimestamp: {
                                summary: {
                                    "$size": 51,
                                    "$type": "sentinel",
                                    "$expires": Date.now() - 100,
                                    "value": {
                                        "title": "Marco Polo",
                                        "url": "/movies/sentinel"
                                    }
                                }
                            }
                        }
                    }
                }]
            },

            requestedMissingPaths: [["videos", "expiredLeafByTimestamp", "summary"]],

            AsValues: {
                values: []
            },

            AsJSON: {
                values: [{}]
            },

            AsJSONG: {
                values: [{}]
            },

            AsPathMap: {
                values: [{}]
            }
        },
        expiredLeafNode0: {
            getPathSets: {
                query: [["videos", "expiredLeafBy0", "summary"]]
            },

            getPathMaps: {
                query: [{
                    videos: {
                        expiredLeafBy0: {
                            summary: null
                        }
                    }
                }]
            },

            setPathSets: {
                query: [
                    {
                        "path": ["videos", "expiredLeafBy0", "summary"],
                        "value": {
                            "$expires": 0,
                            "$size": 51,
                            "$type": "sentinel",
                            "value": {
                                "sad": "tunafish"
                            }
                        }
                    }
                ]
            },

            setPathMaps: {
                query: [{
                    videos: {
                        expiredLeafBy0: {
                            summary: {
                                "$expires": 0,
                                "$size": 51,
                                "$type": "sentinel",
                                "value": {
                                    "sad": "tunafish"
                                }
                            }
                        }
                    }
                }]
            },
            setJSONG: {
                query: [{
                    paths: [["videos", "expiredLeafBy0", "summary"]],
                    jsong: {
                        videos: {
                            expiredLeafBy0: {
                                summary: {
                                    "$expires": 0,
                                    "$size": 51,
                                    "$type": "sentinel",
                                    "value": {
                                        "sad": "tunafish"
                                    }
                                }
                            }
                        }
                    }
                }]
            },

            requestedMissingPaths: [["videos", "expiredLeafBy0", "summary"]],

            AsValues: {
                values: []
            },

            AsJSON: {
                values: [{}]
            },

            AsJSONG: {
                values: [{}]
            },

            AsPathMap: {
                values: [{}]
            }
        },
        expiredBranchNodeTimestamp: {
            getPathSets: {
                query: [["videos", "expiredBranchByTimestamp", "summary"]]
            },

            getPathMaps: {
                query: [{
                    videos: {
                        expiredBranchByTimestamp: {
                            summary: null
                        }
                    }
                }]
            },

            requestedMissingPaths: [["videos", "expiredBranchByTimestamp", "summary"]],

            AsValues: {
                values: []
            },

            AsJSON: {
                values: [{}]
            },

            AsJSONG: {
                values: [{}]
            },

            AsPathMap: {
                values: [{}]
            }
        },
        expiredBranchNode0: {
            getPathSets: {
                query: [["videos", "expiredBranchBy0", "summary"]]
            },

            getPathMaps: {
                query: [{
                    videos: {
                        expiredBranchBy0: {
                            summary: null
                        }
                    }
                }]
            },

            requestedMissingPaths: [["videos", "expiredBranchBy0", "summary"]],

            AsValues: {
                values: []
            },

            AsJSON: {
                values: [{}]
            },

            AsJSONG: {
                values: [{}]
            },

            AsPathMap: {
                values: [{}]
            }
        },
        errorBranchSummary: {
            getPathSets: {
                query: [["videos", "errorBranch", "summary"]]
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
                errors: [{
                    "path": ["videos", "errorBranch"],
                    "value": "I am yelling timber."
                }]
            },
            AsJSON: {
                errors: [{
                    "path": ["videos", "errorBranch"],
                    "value": "I am yelling timber."
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["videos", "errorBranch"]],
                    jsong: {
                        "videos": {
                            "errorBranch": {
                                "$size": 51,
                                "$type": "error",
                                "value": "I am yelling timber."
                            }
                        }
                    }
                }]
            },
            AsPathMap: {
                errors: [{
                    "path": ["videos", "errorBranch"],
                    "value": "I am yelling timber."
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
                errors: [{
                    "path": ["genreList", "2", null],
                    "value": "Red is the new Black"
                }]
            },
            AsJSON: {
                errors: [{
                    "path": ["genreList", "2", null],
                    "value": "Red is the new Black"
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
                                "$size": 51,
                                "$type": "error",
                                "value": "Red is the new Black"
                            }
                        }
                    }
                }]
            },
            AsPathMap: {
                errors: [{
                    "path": ["genreList", "2", null],
                    "value": "Red is the new Black"
                }]
            }
        },
        missingBranchSummary: {
            getPathSets: {
                query: [
                    ["videos", "missingBranch", "summary"]
                ]
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

            requestedMissingPaths: [
                ["videos", "missingBranch", "summary"]
            ],

            AsValues: {
                values: []
            },

            AsJSON: {
                values: [{}]
            },

            AsJSONG: {
                values: [{}]
            },

            AsPathMap: {
                values: [{}]
            }
        },
        missingLeafSummary: {
            getPathSets: {
                query: [
                    ["videos", "missingLeaf", "summary"]
                ]
            },

            getPathMaps: {
                query: [{
                    videos: {
                        missingLeaf: {
                            summary: null
                        }
                    }
                }]
            },

            requestedMissingPaths: [
                ["videos", "missingLeaf", "summary"]
            ],

            AsValues: {
                values: []
            },

            AsJSON: {
                values: [{}]
            },

            AsJSONG: {
                values: [{}]
            },

            AsPathMap: {
                values: [{}]
            }
        }
    };
};
