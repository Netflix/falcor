module.exports = function() {
    return {
        simpleReference0: {
            getPaths: {
                query: [
                    ["genreList", "0", "0", "summary"]
                ]
            },
            setPaths: {
                query: [
                    {
                        "path": ["genreList", "0", "0", "summary"],
                        "value": {
                            "$size": 10,
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
                                    "$type": "leaf",
                                    "$size": 10,
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
                                    "$type": "leaf",
                                    "$size": 10,
                                    "title": "House of Cards",
                                    "url": "/movies/1234"
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
                            __key: "genreList",
                            __generation: 0,
                            0: {
                                __key: "0",
                                __generation: 0,
                                0: {
                                    __key: "0",
                                    __generation: 0,
                                    summary: {
                                        "$type": "leaf",
                                        "title": "House of Cards",
                                        "url": "/movies/1234"
                                    }
                                }
                            }
                        }
                    }
                }]
            }
        },
        simpleReference1: {
            getPaths: {
                query: [
                    ["genreList", "0", "1", "summary"]
                ]
            },

            setPaths: {
                query: [
                    {
                        "path": ["genreList", "0", "1", "summary"],
                        "value": {
                            "$size": 10,
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
                                    "$type": "leaf",
                                    "$size": 10,
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
                                    "$type": "leaf",
                                    "$size": 10,
                                    "title": "Terminator 3",
                                    "url": "/movies/766"
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
                            __key: "genreList",
                            __generation: 0,
                            0: {
                                __key: "0",
                                __generation: 0,
                                1: {
                                    __key: "1",
                                    __generation: 0,
                                    summary: {
                                        "$type": "leaf",
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
            getPaths: {
                query: [
                    ["genreList", "0", "2", "summary"]
                ]
            },

            setPaths: {
                query: [
                    {
                        "path": ["genreList", "0", "2", "summary"],
                        "value": {
                            "$size": 10,
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
                            0: ["lists", "abcd"]
                        },
                        lists: {
                            abcd: {
                                2: ["videos", "7531"]
                            }
                        },
                        videos: {
                            7531: {
                                summary: {
                                    "$type": "leaf",
                                    "$size": 10,
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
                            0: ["lists", "abcd"]
                        },
                        lists: {
                            abcd: {
                                2: ["videos", "7531"]
                            }
                        },
                        videos: {
                            7531: {
                                summary: {
                                    "$type": "leaf",
                                    "$size": 10,
                                    "title": "Kindergarten Cop",
                                    "url": "/movies/7531"
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
                            __key: "genreList",
                            __generation: 0,
                            0: {
                                __key: "0",
                                __generation: 0,
                                2: {
                                    __key: "2",
                                    __generation: 0,
                                    summary: {
                                        "$type": "leaf",
                                        "title": "Kindergarten Cop",
                                        "url": "/movies/7531"
                                    }
                                }
                            }
                        }
                    }
                }]
            }
        },
        simpleReference3: {
            getPaths: {
                query: [
                    ["genreList", "0", "3", "summary"]
                ]
            },

            setPaths: {
                query: [
                    {
                        "path": ["genreList", "0", "3", "summary"],
                        "value": {
                            "$size": 10,
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
                            0: ["lists", "abcd"]
                        },
                        lists: {
                            abcd: {
                                3: ["videos", "6420"]
                            }
                        },
                        videos: {
                            6420: {
                                summary: {
                                    "$type": "leaf",
                                    "$size": 10,
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
                            0: ["lists", "abcd"]
                        },
                        lists: {
                            abcd: {
                                3: ["videos", "6420"]
                            }
                        },
                        videos: {
                            6420: {
                                summary: {
                                    "$type": "leaf",
                                    "$size": 10,
                                    "title": "Commando",
                                    "url": "/movies/6420"
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
                            __key: "genreList",
                            __generation: 0,
                            0: {
                                __key: "0",
                                __generation: 0,
                                3: {
                                    __key: "3",
                                    __generation: 0,
                                    summary: {
                                        "$type": "leaf",
                                        "title": "Commando",
                                        "url": "/movies/6420"
                                    }
                                }
                            }
                        }
                    }
                }]
            }
        },
        referenceLeafNode: {
            getPaths: {
                query: [
                    ["genreList", "10", null]
                ]
            },

//            setPaths: {
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
                            10: ["videos", "1234", "summary"]
                        },
                        videos: {
                            1234: {
                                summary: {
                                    "$type": "leaf",
                                    "$size": 10,
                                    "title": "House of Cards",
                                    "url": "/movies/1234"
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
                            __key: "genreList",
                            __generation: 0,
                            10: {
                                "$type": "leaf",
                                "title": "House of Cards",
                                "url": "/movies/1234"
                            }
                        }
                    }
                }]
            }
        },
        referenceToValue: {
            getPaths: {
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
                            1: ["lists", "my-list"]
                        },
                        lists: {
                            "1x5x": {
                                0: ["videos", "553"]
                            },
                            "my-list": ["lists", "1x5x"]
                        },
                        videos: {
                            553: {
                                summary: {
                                    "$type": "leaf",
                                    "$size": 10,
                                    "title": "Running Man",
                                    "url": "/movies/553"
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
                            __key: "genreList",
                            __generation: 0,
                            1: {
                                __key: "1",
                                __generation: 0,
                                0: {
                                    __key: "0",
                                    __generation: 0,
                                    summary: {
                                        "$type": "leaf",
                                        "title": "Running Man",
                                        "url": "/movies/553"
                                    }
                                }
                            }
                        }
                    }
                }]
            }
        },
        referenceToReferenceComplete: {
            getPaths: {
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
                            1: ["lists", "my-list"]
                        },
                        lists: {
                            "my-list": ["lists", "1x5x"],
                            "1x5x": {
                                0: ["videos", "553"]
                            }
                        },
                        videos: {
                            553: {
                                summary: {
                                    "$type": "leaf",
                                    "$size": 10,
                                    "title": "Running Man",
                                    "url": "/movies/553"
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
                            __key: "genreList",
                            __generation: 0,
                            1: {
                                __key: "1",
                                __generation: 0,
                                0: {
                                    __key: "0",
                                    __generation: 0,
                                    summary: {
                                        "$type": "leaf",
                                        "title": "Running Man",
                                        "url": "/movies/553"
                                    }
                                }
                            }
                        }
                    }
                }]
            }
        },
        referenceToReference: {
            getPaths: {
                query: [
                    ["genreList", "1", "0"]
                ]
            },

//            setPaths: {
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
                            1: ["lists", "my-list"]
                        },
                        lists: {
                            "my-list": ["lists", "1x5x"],
                            "1x5x": {
                                0: ["videos", "553"]
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
                            __key: "genreList",
                            __generation: 0,
                            1: {
                                __key: "1",
                                __generation: 0,
                                0: ["videos", "553"]
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

            setPaths: {
                query: [{
                    "path": ["genreList", "3", "0", "summary"],
                    "value": {
                        "$size": 10,
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

            getPaths: {
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
                            3: ["lists", "sentinel-list"]
                        },
                        lists: {
                            "sentinel-list": {
                                "0": ["videos", "333"]
                            }
                        },
                        videos: {
                            333: {
                                summary: {
                                    "$size": 10,
                                    "$type": "leaf",
                                    "title": "Terminator 2",
                                    "url": "/movies/333"
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
                            __key: "genreList",
                            __generation: 0,
                            3: {
                                __key: "3",
                                __generation: 0,
                                0: {
                                    __key: "0",
                                    __generation: 0,
                                    summary: {
                                        "$type": "leaf",
                                        "title": "Terminator 2",
                                        "url": "/movies/333"
                                    }
                                }
                            }
                        }
                    }
                }]
            }
        },
        toSentinelReference: {
            getPaths: {
                query: [
                    ["genreList", "7", "0", "summary"]
                ]
            },
//
//            setPaths: {
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
                values: [
                    {
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
                            7: ["lists", "to-sentinel-list"]
                        },
                        lists: {
                            "sentinel-list-2": {
                                0: ["videos", "733"]
                            },
                            "to-sentinel-list": ["lists", "sentinel-list-2"]
                        },
                        videos: {
                            733: {
                                summary: {
                                    "$size": 10,
                                    "$type": "leaf",
                                    "title": "Total Recall (Without Colin Farrell)",
                                    "url": "/movies/733"
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
                            __key: "genreList",
                            __generation: 0,
                            7: {
                                __key: "7",
                                __generation: 0,
                                0: {
                                    __key: "0",
                                    __generation: 0,
                                    summary: {
                                        "$type": "leaf",
                                        "title": "Total Recall (Without Colin Farrell)",
                                        "url": "/movies/733"
                                    }
                                }
                            }
                        }
                    }
                }]
            }
        },
        toErrorReference: {
            getPaths: {
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
                    "value": {
                        "message": "House of Pain"
                    }
                }]
            },

            AsJSON: {
                errors: [{
                    "path": ["genreList", "5", null],
                    "value": {
                        "message": "House of Pain"
                    }
                }]
            },

            AsJSONG: {
                errors: [{
                    "path": ["genreList", "5", null],
                    "value": {
                        "$type": "error",
                        "$size": 50,
                        "message": "House of Pain"
                    }
                }]
            },

            AsPathMap: {
                errors: [{
                    "path": ["genreList", "5", null],
                    "value": {
                        "message": "House of Pain"
                    }
                }]
            }
        },
        errorReferenceInBranchKey: {
            optimizedPaths: [
                ["lists", "error-list"]
            ],

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

            getPaths: {
                query: [
                    ["genreList", "2", "0", "summary"]
                ]
            },

            AsValues: {
                errors: [{
                    "path": ["genreList", "2", null],
                    "value": {
                        "message": "Red is the new Black"
                    }
                }]
            },

            AsJSON: {
                errors: [{
                    "path": ["genreList", "2", null],
                    "value": {
                        "message": "Red is the new Black"
                    }
                }]
            },

            AsJSONG: {
                errors: [{
                    "path": ["genreList", "2", null],
                    "value": {
                        "$type": "error",
                        "$size": 50,
                        "message": "Red is the new Black"
                    }
                }],
                values: [{
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
                    },
                    "paths": [
                        ["genreList", "2", null]
                    ]
                }]
            },

            AsPathMap: {
                errors: [{
                    "path": ["genreList", "2", null],
                    "value": {
                        "message": "Red is the new Black"
                    }
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
            getPaths: {
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
                            'inner-reference': ['movies', 1234]
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
            optimizedPaths: [
                ["lists", "error-list"]
            ],

            getPathMaps: {
                query: [{
                    "genreList": {
                        2: {
                            "__null": null
                        }
                    }
                }]
            },

            getPaths: {
                query: [
                    ["genreList", "2", null]
                ]
            },

            AsValues: {
                errors: [{
                    "path": ["genreList", "2", null],
                    "value": {
                        "message": "Red is the new Black"
                    }
                }]
            },

            AsJSON: {
                errors: [{
                    "path": ["genreList", "2", null],
                    "value": {
                        "message": "Red is the new Black"
                    }
                }]
            },

            AsJSONG: {
                errors: [{
                    "path": ["genreList", "2", null],
                    "value": {
                        "$type": "error",
                        "$size": 50,
                        "message": "Red is the new Black"
                    }
                }],
                values: [{
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
                    },
                    "paths": [
                        ["genreList", "2", null]
                    ]
                }]
            },

            AsPathMap: {
                errors: [{
                    "path": ["genreList", "2", null],
                    "value": {
                        "message": "Red is the new Black"
                    }
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

            getPaths: {
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
            getPaths: {
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
            getPaths: {
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
                ["videos", "expiredBranchByTimestamp", "summary"]
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
            getPaths: {
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
                ["lists", "to-expired-list", "0", "summary"]
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
            getPaths: {
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
            getPaths: {
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