module.exports = function() {
    return {
        simpleReference0: {
            getPathSets: {
                query: [
                    ["genreList", "0", "0", "summary"]
                ]
            },

            setPathSets: {
                query: [
                    {
                        "path": ["genreList", "0", "0", "summary"],
                        "value": {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    }
                ]
            },
            setJSONGs: {
                query: [{
                    jsong: {
                        genreList: {
                            0: ["lists", "abcd"]
                        },
                        lists: {
                            abcd: {
                                0: ["videos", "1234"]
                            }
                        },
                        videos: {
                            1234: {
                                summary: {
                                    "title": "House of Cards",
                                    "url": "/movies/1234"
                                }
                            }
                        }
                    },
                    paths: [["genreList", "0", "0", "summary"]]
                }]
            },

            getPathMaps: {
                query: [{
                    genreList: {
                        0: {
                            0: {
                                summary: null
                            }
                        }
                    }
                }]
            },

            optimizedPaths: [
                ["videos", "1234", "summary"]
            ],

            AsValues: {
                values: [
                    {
                        "path": ["genreList", "0", "0", "summary"],
                        "value": {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    }
                ]
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
                        genreList: {
                            0: {
                                "$size": "51",
                                "$type": "reference",
                                "value": ["lists", "abcd"]
                            }
                        },
                        lists: {
                            abcd: {
                                0: {
                                    "$size": "51",
                                    "$type": "reference",
                                    "value": ["videos", "1234"]
                                }
                            }
                        },
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
                    paths: [["genreList", "0", "0", "summary"]]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        genreList: {
                            0: {
                                0: {
                                    summary: {
                                        "title": "House of Cards",
                                        "url": "/movies/1234",
                                    }
                                }
                            }
                        }
                    }
                }]
            }
        },
        simpleReference1: {
            getPathSets: {
                query: [
                    ["genreList", "0", "1", "summary"]
                ]
            },

            setPathSets: {
                query: [
                    {
                        "path": ["genreList", "0", "1", "summary"],
                        "value": {
                            "title": "Terminator 3",
                            "url": "/movies/766"
                        }
                    }
                ]
            },
            setJSONGs: {
                query: [{
                    jsong: {
                        genreList: {
                            0: ["lists", "abcd"]
                        },
                        lists: {
                            abcd: {
                                1: ["videos", "766"]
                            }
                        },
                        videos: {
                            766: {
                                summary: {
                                    "title": "Terminator 3",
                                    "url": "/movies/766"
                                }
                            }
                        }
                    },
                    paths: [["genreList", "0", "1", "summary"]]
                }]
            },

            getPathMaps: {
                query: [{
                    genreList: {
                        0: {
                            1: {
                                summary: null
                            }
                        }
                    }
                }]
            },

            optimizedPaths: [
                ["videos", "766", "summary"]
            ],

            AsValues: {
                values: [
                    {
                        "path": ["genreList", "0", "1", "summary"],
                        "value": {
                            "title": "Terminator 3",
                            "url": "/movies/766"
                        }
                    }
                ]
            },

            AsJSON: {
                values: [{
                    json: {
                        "title": "Terminator 3",
                        "url": "/movies/766"
                    }
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        genreList: {
                            0: {
                                "$size": "51",
                                "$type": "reference",
                                "value": ["lists", "abcd"]
                            }
                        },
                        lists: {
                            abcd: {
                                1: {
                                    "$size": "51",
                                    "$type": "reference",
                                    "value": ["videos", "766"]
                                }
                            }
                        },
                        videos: {
                            766: {
                                summary: {
                                    "$size": 51,
                                    "$type": "sentinel",
                                    "value": {
                                        "title": "Terminator 3",
                                        "url": "/movies/766"
                                    }
                                }
                            }
                        }
                    },
                    paths: [["genreList", "0", "1", "summary"]]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        genreList: {
                            0: {
                                1: {
                                    summary: {
                                        "title": "Terminator 3",
                                        "url": "/movies/766"
                                    }
                                }
                            }
                        }
                    }
                }]
            }
        },
        simpleReference2: {
            getPathSets: {
                query: [
                    ["genreList", "0", "2", "summary"]
                ]
            },

            setPathSets: {
                query: [
                    {
                        "path": ["genreList", "0", "2", "summary"],
                        "value": {
                            "title": "Kindergarten Cop",
                            "url": "/movies/7531"
                        }
                    }
                ]
            },
            setJSONGs: {
                query: [{
                    jsong: {
                        genreList: {
                            0: {
                                "$size": "51",
                                "$type": "reference",
                                "value": ["lists", "abcd"]
                            }
                        },
                        lists: {
                            abcd: {
                                2: {
                                    "$size": "51",
                                    "$type": "reference",
                                    "value": ["videos", "7531"]
                                }
                            }
                        },
                        videos: {
                            7531: {
                                summary: {
                                    "title": "Kindergarten Cop",
                                    "url": "/movies/7531"
                                }
                            }
                        }
                    },
                    paths: [["genreList", "0", "2", "summary"]]
                }]
            },

            getPathMaps: {
                query: [{
                    genreList: {
                        0: {
                            2: {
                                summary: null
                            }
                        }
                    }
                }]
            },

            optimizedPaths: [
                ["videos", "7531", "summary"]
            ],

            AsValues: {
                values: [
                    {
                        "path": ["genreList", "0", "2", "summary"],
                        "value": {
                            "title": "Kindergarten Cop",
                            "url": "/movies/7531"
                        }
                    }
                ]
            },

            AsJSON: {
                values: [{
                    json: {
                        "title": "Kindergarten Cop",
                        "url": "/movies/7531"
                    }
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        genreList: {
                            0: {
                                "$size": "51",
                                "$type": "reference",
                                "value": ["lists", "abcd"]
                            }
                        },
                        lists: {
                            abcd: {
                                2: {
                                    "$size": "51",
                                    "$type": "reference",
                                    "value": ["videos", "7531"]
                                }
                            }
                        },
                        videos: {
                            7531: {
                                summary: {
                                    "$size": 51,
                                    "$type": "sentinel",
                                    "value": {
                                        "title": "Kindergarten Cop",
                                        "url": "/movies/7531"
                                    }
                                }
                            }
                        }
                    },
                    paths: [["genreList", "0", "2", "summary"]]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        genreList: {
                            0: {
                                2: {
                                    summary: {
                                        "title": "Kindergarten Cop",
                                        "url": "/movies/7531",
                                    }
                                }
                            }
                        }
                    }
                }]
            }
        },
        simpleReference3: {
            getPathSets: {
                query: [
                    ["genreList", "0", "3", "summary"]
                ]
            },

            setPathSets: {
                query: [
                    {
                        "path": ["genreList", "0", "3", "summary"],
                        "value": {
                            "title": "Commando",
                            "url": "/movies/6420"
                        }
                    }
                ]
            },
            setJSONGs: {
                query: [{
                    jsong: {
                        genreList: {
                            0: {
                                "$size": "51",
                                "$type": "reference",
                                "value": ["lists", "abcd"]
                            }
                        },
                        lists: {
                            abcd: {
                                3: {
                                    "$size": "51",
                                    "$type": "reference",
                                    "value": ["videos", "6420"]
                                }
                            }
                        },
                        videos: {
                            6420: {
                                summary: {
                                    "title": "Commando",
                                    "url": "/movies/6420"
                                }
                            }
                        }
                    },
                    paths: [["genreList", "0", "3", "summary"]]
                }]
            },

            getPathMaps: {
                query: [{
                    genreList: {
                        0: {
                            3: {
                                summary: null
                            }
                        }
                    }
                }]
            },

            optimizedPaths: [
                ["videos", "6420", "summary"]
            ],

            AsValues: {
                values: [
                    {
                        "path": ["genreList", "0", "3", "summary"],
                        "value": {
                            "title": "Commando",
                            "url": "/movies/6420"
                        }
                    }
                ]
            },

            AsJSON: {
                values: [{
                    json: {
                        "title": "Commando",
                        "url": "/movies/6420"
                    }
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        genreList: {
                            0: {
                                "$size": "51",
                                "$type": "reference",
                                "value": ["lists", "abcd"]
                            }
                        },
                        lists: {
                            abcd: {
                                3: {
                                    "$size": "51",
                                    "$type": "reference",
                                    "value": ["videos", "6420"]
                                }
                            }
                        },
                        videos: {
                            6420: {
                                summary: {
                                    "$size": 51,
                                    "$type": "sentinel",
                                    "value": {
                                        "title": "Commando",
                                        "url": "/movies/6420"
                                    }
                                }
                            }
                        }
                    },
                    paths: [["genreList", "0", "3", "summary"]]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        genreList: {
                            0: {
                                3: {
                                    summary: {
                                        "title": "Commando",
                                        "url": "/movies/6420",
                                    }
                                }
                            }
                        }
                    }
                }]
            }
        },
        referenceLeafNode: {
            getPathSets: {
                query: [
                    ["genreList", "10", null]
                ]
            },

//            setPathSets: {
//                query: [
//                    {
//                        "path": ["genreList", "10", null],
//                        "value": {
//                            "title": "House of Cards",
//                            "url": "/movies/1234"
//                        }
//                    }
//                ]
//            },

            getPathMaps: {
                query: [{
                    "genreList": {
                        10: {
                            "__null": null
                        }
                    }
                }]
            },

            optimizedPaths: [
                ["videos", "1234", "summary"]
            ],

            AsValues: {
                values: [
                    {
                        "path": ["genreList", "10", null],
                        "value": {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    }
                ]
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
                        genreList: {
                            10: {
                                "$size": "51",
                                "$type": "reference",
                                "value": ["videos", "1234", "summary"]
                            }
                        },
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
                    paths: [
                        ["genreList", "10", null]
                    ]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        genreList: {
                            10: {
                                "title": "House of Cards",
                                "url": "/movies/1234",
                            }
                        }
                    }
                }]
            }
        },
        referenceToValue: {
            getPathSets: {
                query: [
                    ["genreList", "1", "0", "summary"]
                ]
            },

            getPathMaps: {
                query: [{
                    genreList: {
                        1: {
                            0: {
                                summary: null
                            }
                        }
                    }
                }]
            },

            optimizedPaths: [
                ["videos", "553", "summary"]
            ],

            AsValues: {
                values: [{
                    "path": ["genreList", "1", "0", "summary"],
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
                        genreList: {
                            1: {
                                "$size": "51",
                                "$type": "reference",
                                "value": ["lists", "my-list"]
                            }
                        },
                        lists: {
                            "1x5x": {
                                0: {
                                    "$size": "51",
                                    "$type": "reference",
                                    "value": ["videos", "553"]
                                }
                            },
                            "my-list": {
                                "$size": "51",
                                "$type": "reference",
                                "value": ["lists", "1x5x"]
                            }
                        },
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
                    paths: [
                        ["genreList", "1", "0", "summary"]
                    ]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        genreList: {
                            1: {
                                0: {
                                    summary: {
                                        "title": "Running Man",
                                        "url": "/movies/553",
                                    }
                                }
                            }
                        }
                    }
                }]
            }
        },
        referenceToReferenceComplete: {
            getPathSets: {
                query: [
                    ["genreList", "1", "0", "summary"]
                ]
            },

            getPathMaps: {
                query: [{
                    genreList: {
                        1: {
                            0: {
                                summary: null
                            }
                        }
                    }
                }]
            },

            optimizedPaths: [
                ["videos", "553", "summary"]
            ],

            AsValues: {
                values: [
                    {
                        "path": ["genreList", "1", "0", "summary"],
                        "value": {
                            "title": "Running Man",
                            "url": "/movies/553"
                        }
                    }
                ]
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
                        genreList: {
                            1: {
                                "$size": "51",
                                "$type": "reference",
                                "value": ["lists", "my-list"]
                            }
                        },
                        lists: {
                            "my-list": {
                                "$size": "51",
                                "$type": "reference",
                                "value": ["lists", "1x5x"]
                            },
                            "1x5x": {
                                0: {
                                    "$size": "51",
                                    "$type": "reference",
                                    "value": ["videos", "553"]
                                }
                            }
                        },
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
                    paths: [
                        ["genreList", "1", "0", "summary"]
                    ]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        genreList: {
                            1: {
                                0: {
                                    summary: {
                                        "title": "Running Man",
                                        "url": "/movies/553",
                                    }
                                }
                            }
                        }
                    }
                }]
            }
        },
        referenceToReference: {
            getPathSets: {
                query: [
                    ["genreList", "1", "0"]
                ]
            },

//            setPathSets: {
//                query: [
//                    {
//                        "path": ["genreList", "1", "0"],
//                        "value": ["videos", "553"]
//                    }
//                ]
//            },

            getPathMaps: {
                query: [{
                    genreList: {
                        1: {
                            0: null
                        }
                    }
                }]
            },

            optimizedPaths: [
                ["lists", "1x5x", "0"]
            ],

            AsValues: {
                values: [
                    {
                        "path": ["genreList", "1", "0"],
                        "value": ["videos", "553"]
                    }
                ]
            },

            AsJSON: {
                values: [{
                    json: ["videos", "553"]
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        genreList: {
                            1: {
                                "$size": "51",
                                "$type": "reference",
                                "value": ["lists", "my-list"]
                            }
                        },
                        lists: {
                            "my-list": {
                                "$size": "51",
                                "$type": "reference",
                                "value": ["lists", "1x5x"]
                            },
                            "1x5x": {
                                0: {
                                    "$size": "51",
                                    "$type": "reference",
                                    "value": ["videos", "553"]
                                }
                            }
                        }
                    },
                    paths: [
                        ["genreList", "1", "0"]
                    ]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        genreList: {
                            1: {
                                0: {
                                    "$size": "51",
                                    "$type": "reference",
                                    "value": ["videos", "553"]
                                }
                            }
                        }
                    }
                }]
            }
        },
        sentinelReference: {
            optimizedPaths: [
                ["videos", "333", "summary"]
            ],

            setPathSets: {
                query: [{
                    "path": ["genreList", "3", "0", "summary"],
                    "value": {
                        "title": "Terminator 2",
                        "url": "/movies/333"
                    }
                }]
            },

            getPathMaps: {
                query: [{
                    "genreList": {
                        3: {
                            0: {
                                "summary": null
                            }
                        }
                    }
                }]
            },

            getPathSets: {
                query: [
                    ["genreList", "3", "0", "summary"]
                ]
            },

            AsValues: {
                values: [{
                    "path": ["genreList", "3", "0", "summary"],
                    "value": {
                        "title": "Terminator 2",
                        "url": "/movies/333"
                    }
                }]
            },

            AsJSON: {
                values: [{
                    json: {
                        "title": "Terminator 2",
                        "url": "/movies/333"
                    }
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        genreList: {
                            3: {
                                "$size": "51",
                                "$type": "reference",
                                "value": ["lists", "sentinel-list"]
                            }
                        },
                        lists: {
                            "sentinel-list": {
                                "0": {
                                    "$size": 52,
                                    "$type": "reference",
                                    "value": ["videos", "333"]
                                }
                            }
                        },
                        videos: {
                            333: {
                                summary: {
                                    "$size": 51,
                                    "$type": "sentinel",
                                    "value": {
                                        "title": "Terminator 2",
                                        "url": "/movies/333"
                                    }
                                }
                            }
                        }
                    },
                    paths: [
                        ["genreList", "3", "0", "summary"]
                    ]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        genreList: {
                            3: {
                                0: {
                                    summary: {
                                        "title": "Terminator 2",
                                        "url": "/movies/333",
                                    }
                                }
                            }
                        }
                    }
                }]
            }
        },
        toSentinelReference: {
            getPathSets: {
                query: [
                    ["genreList", "7", "0", "summary"]
                ]
            },
//
//            setPathSets: {
//                query: [
//                    {
//                        "path": ["genreList", "7", "0", "summary"],
//                        "value": {
//                            "title": "Total Recall (Without Colin Farrell)",
//                            "url": "/movies/733"
//                        }
//                    }
//                ]
//            },

            getPathMaps: {
                query: [{
                    "genreList": {
                        7: {
                            0: {
                                "summary": null
                            }
                        }
                    }
                }]
            },

            AsValues: {
                values: [{
                        "path": ["genreList", "7", "0", "summary"],
                        "value": {
                            "title": "Total Recall (Without Colin Farrell)",
                            "url": "/movies/733"
                        }
                    }
                ]
            },

            AsJSON: {
                values: [{
                    json: {
                        "title": "Total Recall (Without Colin Farrell)",
                        "url": "/movies/733"
                    }
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        genreList: {
                            7: {
                                "$size": "51",
                                "$type": "reference",
                                "value": ["lists", "to-sentinel-list"]
                            }
                        },
                        lists: {
                            "sentinel-list-2": {
                                0: {
                                    "$size": 52,
                                    "$type": "reference",
                                    "value": ["videos", "733"]
                                }
                            },
                            "to-sentinel-list": {
                                "$size": 52,
                                "$type": "reference",
                                "value": ["lists", "sentinel-list-2"]
                            }
                        },
                        videos: {
                            733: {
                                summary: {
                                    "$size": 51,
                                    "$type": "sentinel",
                                    "value": {
                                        "title": "Total Recall (Without Colin Farrell)",
                                        "url": "/movies/733"
                                    }
                                }
                            }
                        }
                    },
                    paths: [
                        ["genreList", "7", "0", "summary"]
                    ]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        genreList: {
                            7: {
                                0: {
                                    summary: {
                                        "title": "Total Recall (Without Colin Farrell)",
                                        "url": "/movies/733",
                                    }
                                }
                            }
                        }
                    }
                }]
            }
        },
        toErrorReference: {
            getPathSets: {
                query: [
                    ["genreList", "5", null]
                ]
            },

            getPathMaps: {
                query: [{
                    "genreList": {
                        5: {
                            "__null": null
                        }
                    }
                }]
            },

            AsValues: {
                errors: [{
                    "path": ["genreList", "5", null],
                    "value": "House of Pain"
                }]
            },

            AsJSON: {
                errors: [{
                    "path": ["genreList", "5", null],
                    "value": "House of Pain"
                }]
            },

            AsJSONG: {
                values: [{
                    paths: [["genreList", "5", null]],
                    jsong: {
                        "genreList": {
                            "5": {
                                "$size": "51",
                                "$type": "reference",
                                "value": ["lists", "to-error-list"]
                            }
                        },
                        "lists": {
                            "error-list-2": {
                                "$size": 51,
                                "$type": "error",
                                "value": "House of Pain"
                            },
                            "to-error-list": {
                                "$size": "51",
                                "$type": "reference",
                                "value": ["lists", "error-list-2"]
                            }
                        }
                    }
                }]
            },

            AsPathMap: {
                errors: [{
                    "path": ["genreList", "5", null],
                    "value": "House of Pain"
                }]
            }
        },
        errorReferenceInBranchKey: {
            getPathMaps: {
                query: [{
                    "genreList": {
                        2: {
                            0: {
                                summary: null
                            }
                        }
                    }
                }]
            },

            getPathSets: {
                query: [
                    ["genreList", "2", "0", "summary"]
                ]
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
                    jsong: {
                        "genreList": {
                            "2": {
                                "$size": "51",
                                "$type": "reference",
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
                    },
                    "paths": [
                        ["genreList", "2", null]
                    ]
                }]
            },

            AsPathMap: {
                errors: [{
                    "path": ["genreList", "2", null],
                    "value": "Red is the new Black"
                }]
            }
        },
        innerReference: {
            getPathMaps: {
                query: [{
                    "genreList": {
                        'inner-reference': {
                            "summary": null
                        }
                    }
                }]
            },
            optimizedPaths: [['movies']],
            getPathSets: {
                query: [
                    ["genreList", "inner-reference", 'summary']
                ]
            },

            AsValues: {
                values: [{
                    "path": ["genreList", "inner-reference", null],
                    "value": ['videos']
                }]
            },

            AsJSON: {
                values: [{
                    json: ['videos']
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        genreList: {
                            'inner-reference': {
                                "$size": "51",
                                "$type": "reference",
                                "value": ['movies', 1234]
                            }
                        },
                        movies: ['videos']
                    },
                    paths: [["genreList", "inner-reference", null]]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        genreList: {
                            __key: 'genreList',
                            __generation: 0,
                            'inner-reference': {
                                __key: 'inner-reference',
                                __generation: 0,
                                __null: ['videos']
                            }
                        }
                    }
                }]
            }
        },
        errorReference: {
            getPathMaps: {
                query: [{
                    "genreList": {
                        2: {
                            "__null": null
                        }
                    }
                }]
            },

            getPathSets: {
                query: [
                    ["genreList", "2", null]
                ]
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
                    jsong: {
                        "genreList": {
                            "2": {
                                "$size": "51",
                                "$type": "reference",
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
                    },
                    "paths": [
                        ["genreList", "2", null]
                    ]
                }]
            },

            AsPathMap: {
                errors: [{
                    "path": ["genreList", "2", null],
                    "value": "Red is the new Black"
                }]
            }
        },
        missingReference: {
            requestedMissingPaths: [
                ["genreList", "4", "0", "summary"]
            ],

            getPathMaps: {
                query: [{
                    "genreList": {
                        4: {
                            0: {
                                "summary": null
                            }
                        }
                    }
                }]
            },

            optimizedMissingPaths: [
                ["lists", "missing-list", "0", "summary"]
            ],

            getPathSets: {
                query: [
                    ["genreList", "4", "0", "summary"]
                ]
            },

            AsValues: {
                values: []
            },

            AsJSON: {
                values: [undefined]
            },

            AsJSONG: {
                values: [undefined]
            },

            AsPathMap: {
                values: [undefined]
            }
        },
        toMissingReference: {
            getPathSets: {
                query: [
                    ["genreList", "6", "0", "summary"]
                ]
            },

            getPathMaps: {
                query: [{
                    "genreList": {
                        6: {
                            0: {
                                "summary": null
                            }
                        }
                    }
                }]
            },

            requestedMissingPaths: [
                ["genreList", "6", "0", "summary"]
            ],

            optimizedMissingPaths: [
                ["lists", "missing-list-2", "0", "summary"]
            ],

            AsValues: {
                values: []
            },

            AsJSON: {
                values: [undefined]
            },

            AsJSONG: {
                values: [undefined]
            },

            AsPathMap: {
                values: [undefined]
            }
        },
        referenceBranchIsExpired: {
            getPathSets: {
                query: [
                    ["genreList", "11", "0", null]
                ]
            },

            getPathMaps: {
                query: [{
                    "genreList": {
                        11: {
                            0: {
                                "__null": null
                            }
                        }
                    }
                }]
            },

            requestedMissingPaths: [
                ["genreList", "11", "0", null]
            ],

            optimizedMissingPaths: [
                ["lists", "missing-branch-link", "0"]
            ],

            AsValues: {
                values: []
            },

            AsJSON: {
                values: [undefined]
            },

            AsJSONG: {
                values: [undefined]
            },

            AsPathMap: {
                values: [undefined]
            }
        },
        referenceExpired: {
            getPathSets: {
                query: [
                    ["genreList", "9", "0", "summary"]
                ]
            },

            getPathMaps: {
                query: [{
                    "genreList": {
                        9: {
                            0: {
                                "summary": null
                            }
                        }
                    }
                }]
            },
            requestedMissingPaths: [
                ["genreList", "9", "0", "summary"]
            ],

            optimizedMissingPaths: [
                ["lists", "expired-list", "0", "summary"]
            ],

            AsValues: {
                values: []
            },

            AsJSON: {
                values: [undefined]
            },

            AsJSONG: {
                values: [undefined]
            },

            AsPathMap: {
                values: [undefined]
            }
        },
        referenceMissingBranch: {
            getPathSets: {
                query: [
                    ["genreList", "branch-missing", "0", "summary"]
                ]
            },

            getPathMaps: {
                query: [{
                    "genreList": {
                        "branch-missing": {
                            0: {
                                "summary": null
                            }
                        }
                    }
                }]
            },
            requestedMissingPaths: [
                ["genreList", "branch-missing", "0", "summary"]
            ],

            optimizedMissingPaths: [
                ["does", "not", "exist", "0", "summary"]
            ],

            AsValues: {
                values: []
            },

            AsJSON: {
                values: [undefined]
            },

            AsJSONG: {
                values: [undefined]
            },

            AsPathMap: {
                values: [undefined]
            }
        },
        futureExpiredReference: {
            getPathSets: {
                query: [
                    ["genreList", "12", "0", "summary"]
                ]
            },

            getPathMaps: {
                query: [{
                    "genreList": {
                        12: {
                            0: {
                                "summary": null
                            }
                        }
                    }
                }]
            },

            requestedMissingPaths: [
                ["genreList", "12", "0", "summary"]
            ],

            optimizedMissingPaths: [
                ["lists", "future-expired-list", "0", "summary"]
            ],

            AsValues: {
                values: []
            },

            AsJSON: {
                values: [undefined]
            },

            AsJSONG: {
                values: [undefined]
            },

            AsPathMap: {
                values: [undefined]
            }
        }
    }
};