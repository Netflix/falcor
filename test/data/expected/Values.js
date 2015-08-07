var $path = require('./../../../lib/types/ref');
var $atom = require('./../../../lib/types/atom');
var $error = require('./../../../lib/types/error');
module.exports = function() {
    return {
        direct: {
            getPathValues: {
                query: [
                    ["videos", "1234", "summary"]
                ]
            },
            setPathValues: {
                query: [{
                    path: ["videos", "1234", "summary"],
                    "value": {
                        "title": "House of Cards",
                        "url": "/movies/1234"
                    }
                }]
            },
            setPathMaps: {
                query: [{
                    json: {
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
            setJSONGs: {
                query: [{
                    paths: [["videos", "1234", "summary"]],
                    jsonGraph: {
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
                    json: {
                        videos: {
                            1234: {
                                summary: null
                            }
                        }
                    }
                }]
            },
            AsValues: {
                values: [{
                    path: ["videos", "1234", "summary"],
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
                    jsonGraph: {
                        videos: {
                            1234: {
                                summary: {
                                    "$size": 51,
                                    "$type": $atom,
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
            getPathValues: {
                query: [
                    ["videos", "553", "summary"]
                ]
            },
            setPathValues: {
                query: [{
                    path: ["videos", "553", "summary"],
                    "value": {
                        "title": "Running Man",
                        "url": "/movies/553"
                    }
                }]
            },
            setPathMaps: {
                query: [{
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
            },
            setJSONGs: {
                query: [{
                    paths: [["videos", "553", "summary"]],
                    jsonGraph: {
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
                    json: {
                        videos: {
                            553: {
                                summary: null
                            }
                        }
                    }
                }]
            },
            AsValues: {
                values: [{
                    path: ["videos", "553", "summary"],
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
                    jsonGraph: {
                        videos: {
                            553: {
                                summary: {
                                    "$size": 51,
                                    "$type": $atom,
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

            setPathValues: {
                query: [
                    {
                        path: ["genreList", "0"],
                        "value": { "$type": $path, "value": ["lists", "abcd"] }
                    }
                ]
            },

            setPathMaps: {
                query: [{
                    json: {
                        genreList: {
                            0: ["lists", "abcd"]
                        }
                    }
                }]
            },
            setJSONGs: {
                query: [{
                    paths: [["genreList", "0"]],
                    jsonGraph: {
                        genreList: {
                            0: ["lists", "abcd"]
                        }
                    }
                }]
            },

            getPathValues: {
                query: [
                    ["genreList", "0"]
                ]
            },

            getPathMaps: {
                query: [{
                    json: {
                        genreList: {
                            0: null
                        }
                    }
                }]
            },

            AsValues: {
                values: [
                    {
                        path: ["genreList", "0"],
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
                            0: ["lists", "abcd"]
                        }
                    }
                }]
            },

            AsJSONG: {
                values: [{
                    jsonGraph: {
                        genreList: {
                            0: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "abcd"]
                            }
                        }
                    },
                    paths: [["genreList", "0"]]
                }]
            }
        },
        atomDirect: {
            getPathValues: {
                query: [
                    ["videos", "1234", "summary"]
                ]
            },
            setPathValues: {
                query: [{
                    path: ["videos", "1234", "summary"],
                    "value": {
                        "$type": $atom,
                        "value": {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    }
                }]
            },
            setPathMaps: {
                query: [{
                    json: {
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
            setJSONGs: {
                query: [{
                    paths: [["videos", "1234", "summary"]],
                    jsonGraph: {
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
                    json: {
                        videos: {
                            1234: {
                                summary: null
                            }
                        }
                    }
                }]
            },
            AsValues: {
                values: [{
                    path: ["videos", "1234", "summary"],
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
                    jsonGraph: {
                        videos: {
                            1234: {
                                summary: {
                                    "$size": 51,
                                    "$type": $atom,
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
            getPathValues: {
                query: [["videos", "expiredLeafByTimestamp", "summary"]]
            },

            getPathMaps: {
                query: [{
                    json: {
                        videos: {
                            expiredLeafByTimestamp: {
                                summary: null
                            }
                        }
                    }
                }]
            },

            setPathValues: {
                query: [
                    {
                        path: ["videos", "expiredLeafByTimestamp", "summary"],
                        "value": {
                            "$type": $atom,
                            "$expires": Date.now() - 100,
                            "value": {
                                "title": "Marco Polo",
                                "url": "/movies/atom"
                            }
                        }
                    }
                ]
            },

            setPathMaps: {
                query: [{
                    json: {
                        videos: {
                            expiredLeafByTimestamp: {
                                summary: {
                                    "$type": $atom,
                                    "$expires": Date.now() - 100,
                                    "value": {
                                        "title": "Marco Polo",
                                        "url": "/movies/atom"
                                    }
                                }
                            }
                        }
                    }
                }]
            },
            setJSONG: {
                query: [{
                    paths: [["videos", $atom, "summary"]],
                    jsonGraph: {
                        videos: {
                            expiredLeafByTimestamp: {
                                summary: {
                                    "$size": 51,
                                    "$type": $atom,
                                    "$expires": Date.now() - 100,
                                    "value": {
                                        "title": "Marco Polo",
                                        "url": "/movies/atom"
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
            getPathValues: {
                query: [["videos", "expiredLeafBy0", "summary"]]
            },

            getPathMaps: {
                query: [{
                    json: {
                        videos: {
                            expiredLeafBy0: {
                                summary: null
                            }
                        }
                    }
                }]
            },

            setPathValues: {
                query: [
                    {
                        path: ["videos", "expiredLeafBy0", "summary"],
                        "value": {
                            "$expires": 0,
                            "$size": 51,
                            "$type": $atom,
                            "value": {
                                "sad": "tunafish"
                            }
                        }
                    }
                ]
            },

            setPathMaps: {
                query: [{
                    json: {
                        videos: {
                            expiredLeafBy0: {
                                summary: {
                                    "$expires": 0,
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "sad": "tunafish"
                                    }
                                }
                            }
                        }
                    }
                }]
            },
            setJSONG: {
                query: [{
                    paths: [["videos", "expiredLeafBy0", "summary"]],
                    jsonGraph: {
                        videos: {
                            expiredLeafBy0: {
                                summary: {
                                    "$expires": 0,
                                    "$size": 51,
                                    "$type": $atom,
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
            getPathValues: {
                query: [["videos", "expiredBranchByTimestamp", "summary"]]
            },

            getPathMaps: {
                query: [{
                    json: {
                        videos: {
                            expiredBranchByTimestamp: {
                                summary: null
                            }
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
            getPathValues: {
                query: [["videos", "expiredBranchBy0", "summary"]]
            },

            getPathMaps: {
                query: [{
                    json: {
                        videos: {
                            expiredBranchBy0: {
                                summary: null
                            }
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
            getPathValues: {
                query: [["videos", "errorBranch", "summary"]]
            },
            getPathMaps: {
                query: [{
                    json: {
                        videos: {
                            errorBranch: {
                                summary: null
                            }
                        }
                    }
                }]
            },
            AsValues: {
                errors: [{
                    path: ["videos", "errorBranch"],
                    "value": "I am yelling timber."
                }]
            },
            AsJSON: {
                errors: [{
                    path: ["videos", "errorBranch"],
                    "value": "I am yelling timber."
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["videos", "errorBranch"]],
                    jsonGraph: {
                        "videos": {
                            "errorBranch": {
                                "$size": 51,
                                "$type": $error,
                                "value": "I am yelling timber."
                            }
                        }
                    }
                }]
            },
            AsPathMap: {
                errors: [{
                    path: ["videos", "errorBranch"],
                    "value": "I am yelling timber."
                }]
            }
        },
        genreListErrorNull: {
            getPathValues: {
                query: [
                    ["genreList", 2, null]
                ]
            },
            getPathMaps: {
                query: [{
                    json: {
                        genreList: {
                            2: {
                                __null: null
                            }
                        }
                    }
                }]
            },
            AsValues: {
                errors: [{
                    path: ["genreList", "2", null],
                    "value": "Red is the new Black"
                }]
            },
            AsJSON: {
                errors: [{
                    path: ["genreList", "2", null],
                    "value": "Red is the new Black"
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["genreList", "2", null]],
                    jsonGraph: {
                        "genreList": {
                            "2": {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "error-list"]
                            }
                        },
                        "lists": {
                            "error-list": {
                                "$size": 51,
                                "$type": $error,
                                "value": "Red is the new Black"
                            }
                        }
                    }
                }]
            },
            AsPathMap: {
                errors: [{
                    path: ["genreList", "2", null],
                    "value": "Red is the new Black"
                }]
            }
        },
        missingBranchSummary: {
            getPathValues: {
                query: [
                    ["videos", "missingBranch", "summary"]
                ]
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
            getPathValues: {
                query: [
                    ["videos", "missingLeaf", "summary"]
                ]
            },

            getPathMaps: {
                query: [{
                    json: {
                        videos: {
                            missingLeaf: {
                                summary: null
                            }
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
