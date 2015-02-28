module.exports = function() {
    return {
        toOnly: {
            getPaths: {
                count: 2,
                query: [
                    ["genreList", "0", {to: 1}, "summary"]
                ]
            },

            getPathMaps: {
                count: 2,
                query: [{
                    "genreList": {
                        "0": {
                            "0": {
                                "summary": null
                            },
                            "1": {
                                "summary": null
                            }
                        }
                    }
                }]
            },

            optimizedPaths: [
                ["videos", "1234", "summary"],
                ["videos", "766", "summary"]
            ],

            AsValues: {
                values: [
                    {
                        "path": ["genreList", "0", "0", "summary"],
                        "value": {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    },
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
                        0: {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        },
                        1: {
                            "title": "Terminator 3",
                            "url": "/movies/766"
                        }
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
                                0: ["videos", "1234"],
                                1: ["videos", "766"]
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
                            },
                            "766": {
                                "summary": {
                                    "$size": 10,
                                    "$type": "leaf",
                                    "title": "Terminator 3",
                                    "url": "/movies/766"
                                }
                            }
                        }
                    },
                    paths: [
                        ["genreList", "0", "0", "summary"],
                        ["genreList", "0", "1", "summary"]
                    ]
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
                                },
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
        toOnlyMyList: {
            getPaths: {
                count: 2,
                query: [
                    ["genreList", "1", {to: 1}, "summary"]
                ]
            },

            AsValues: {
                values: [
                    {
                        "path": ["genreList", "1", "0", "summary"],
                        "value": {
                            "title": "Running Man",
                            "url": "/movies/553"
                        }
                    },
                    {
                        "path": ["genreList", "1", "1", "summary"],
                        "value": {
                            "title": "Junior",
                            "url": "/movies/5522"
                        }
                    }
                ]
            },

            AsJSON: {
                values: [{
                    json: {
                        0: {
                            "title": "Running Man",
                            "url": "/movies/553"
                        },
                        1: {
                            "title": "Junior",
                            "url": "/movies/5522"
                        }
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
                                0: ["videos", "553"],
                                1: ["videos", "5522"]
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
                            },
                            "5522": {
                                "summary": {
                                    "$size": 10,
                                    "$type": "leaf",
                                    "title": "Junior",
                                    "url": "/movies/5522"
                                }
                            }
                        }
                    },
                    paths: [
                        ["genreList", "1", "0", "summary"],
                        ["genreList", "1", "1", "summary"]
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
                                },
                                1: {
                                    __key: "1",
                                    __generation: 0,
                                    summary: {
                                        "$type": "leaf",
                                        "title": "Junior",
                                        "url": "/movies/5522"
                                    }
                                }
                            }
                        }
                    }
                }]
            }
        },
        fromOnly: {
            getPaths: {
                query: [
                    ["genreList", "0", {from: 0, to:0}, "summary"]
                ]
            },

            optimizedPaths: [
                ["videos", "1234", "summary"]
            ],

            AsValues: {
                values: [{
                    "path": ["genreList", "0", "0", "summary"],
                    "value": {
                        "title": "House of Cards",
                        "url": "/movies/1234"
                    }
                }]
            },

            AsJSON: {
                values: [{
                    json: {
                        0: {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
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
                    paths: [
                        ["genreList", "0", "0", "summary"]
                    ]
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
        fromAndToWithNegativePaths: {
            getPaths: {
                count: 3,
                query: [
                    ["genreList", "0", {from: -1, to: 1}, "summary"]
                ]
            },

            optimizedPaths: [
                ["videos", "4422", "summary"],
                ["videos", "1234", "summary"],
                ["videos", "766", "summary"]
            ],

            AsValues: {
                values: [
                    {
                        "path": ["genreList", "0", "-1", "summary"],
                        "value": {
                            "title": "Beverly Hills Ninja",
                            "url": "/movies/4422"
                        }
                    },
                    {
                        "path": ["genreList", "0", "0", "summary"],
                        "value": {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    },
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
                        "-1": {
                            "title": "Beverly Hills Ninja",
                            "url": "/movies/4422"
                        },
                        0: {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        },
                        1: {
                            "title": "Terminator 3",
                            "url": "/movies/766"
                        }
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
                                "-1": ["videos", "4422"],
                                0: ["videos", "1234"],
                                1: ["videos", "766"]
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
                            },
                            4422: {
                                summary: {
                                    "$type": "leaf",
                                    "$size": 10,
                                    "title": "Beverly Hills Ninja",
                                    "url": "/movies/4422"
                                }
                            },
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
                    paths: [
                        ["genreList", "0", -1, "summary"],
                        ["genreList", "0", "0", "summary"],
                        ["genreList", "0", "1", "summary"]
                    ]
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
                                "-1": {
                                    __key: "-1",
                                    __generation: 0,
                                    summary: {
                                        "$type": "leaf",
                                        "title": "Beverly Hills Ninja",
                                        "url": "/movies/4422"
                                    }
                                },
                                0: {
                                    __key: "0",
                                    __generation: 0,
                                    summary: {
                                        "$type": "leaf",
                                        "title": "House of Cards",
                                        "url": "/movies/1234"
                                    }
                                },
                                "1": {
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
        fromAndLength: {
            getPaths: {
                count: 3,
                query: [
                    ["genreList", "0", {from: -1, length: 3}, "summary"]
                ]
            },

            optimizedPaths: [
                ["videos", "4422", "summary"],
                ["videos", "1234", "summary"],
                ["videos", "766", "summary"]
            ],

            AsValues: {
                values: [
                    {
                        "path": ["genreList", "0", "-1", "summary"],
                        "value": {
                            "title": "Beverly Hills Ninja",
                            "url": "/movies/4422"
                        }
                    },
                    {
                        "path": ["genreList", "0", "0", "summary"],
                        "value": {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    },
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
                        "-1": {
                            "title": "Beverly Hills Ninja",
                            "url": "/movies/4422"
                        },
                        0: {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        },
                        1: {
                            "title": "Terminator 3",
                            "url": "/movies/766"
                        }
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
                                "-1": ["videos", "4422"],
                                0: ["videos", "1234"],
                                1: ["videos", "766"]
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
                            },
                            4422: {
                                summary: {
                                    "$type": "leaf",
                                    "$size": 10,
                                    "title": "Beverly Hills Ninja",
                                    "url": "/movies/4422"
                                }
                            },
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
                    paths: [
                        ["genreList", "0", -1, "summary"],
                        ["genreList", "0", "0", "summary"],
                        ["genreList", "0", "1", "summary"]
                    ]
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
                                "-1": {
                                    __key: "-1",
                                    __generation: 0,
                                    summary: {
                                        "$type": "leaf",
                                        "title": "Beverly Hills Ninja",
                                        "url": "/movies/4422"
                                    }
                                },
                                0: {
                                    __key: "0",
                                    __generation: 0,
                                    summary: {
                                        "$type": "leaf",
                                        "title": "House of Cards",
                                        "url": "/movies/1234"
                                    }
                                },
                                "1": {
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
        fromArray: {
            getPaths: {
                count: 2,
                query: [
                    ["genreList", "0", ["0", "1"], "summary"]
                ]
            },

            getPathMaps: {
                count: 2,

                query: [{
                    "genreList": {
                        "0": {
                            "0": {
                                "summary": null
                            },
                            "1": {
                                "summary": null
                            }
                        }
                    }
                }]
            },

            optimizedPaths: [
                ["videos", "1234", "summary"],
                ["videos", "766", "summary"]
            ],

            AsValues: {
                values: [
                    {
                        "path": ["genreList", "0", "0", "summary"],
                        "value": {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    },
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
                        0: {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        },
                        1: {
                            "title": "Terminator 3",
                            "url": "/movies/766"
                        }
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
                                0: ["videos", "1234"],
                                1: ["videos", "766"]
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
                            },
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
                    paths: [
                        ["genreList", "0", "0", "summary"],
                        ["genreList", "0", "1", "summary"]
                    ]
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
                                },
                                "1": {
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
        toOnlyLeaf: {
            getPaths: {
                count: 2,
                query: [
                    ["genreList", {to: 1}]
                ]
            },

            getPathMaps: {
                count: 2,

                query: [{
                    "genreList": {
                        "0": null,
                        "1": null
                    }
                }]
            },

            optimizedPaths: [
                ["genreList", "0"],
                ["genreList", "1"]
            ],

            AsValues: {
                values: [
                    {
                        "path": ["genreList", "0"],
                        "value": ["lists", "abcd"]
                    },
                    {
                        "path": ["genreList", "1"],
                        "value": ["lists", "my-list"]
                    }
                ]
            },

            AsJSON: {
                values: [{
                    json: {
                        0: ["lists", "abcd"],
                        1: ["lists", "my-list"]
                    }
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        genreList: {
                            0: ["lists", "abcd"],
                            1: ["lists", "my-list"]
                        }
                    },
                    paths: [
                        ["genreList", "0"],
                        ["genreList", "1"]
                    ]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        genreList: {
                            __key: "genreList",
                            __generation: 0,
                            0: ["lists", "abcd"],
                            1: ["lists", "my-list"]
                        }
                    }
                }]
            }
        },
        fromOnlyLeaf: {
            getPaths: {
                query: [
                    ["genreList", {from: 0, to: 0}]
                ]
            },

            optimizedPaths: [
                ["genreList", "0"]
            ],

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
                    json: {
                        0: ["lists", "abcd"]
                    }
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        genreList: {
                            0: ["lists", "abcd"]
                        }
                    },
                    paths: [
                        ["genreList", "0"]
                    ]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        genreList: {
                            __key: "genreList",
                            __generation: 0,
                            0: ["lists", "abcd"]
                        }
                    }
                }]
            }
        },
        fromAndLengthLeaf: {
            getPaths: {
                count: 3,
                query: [
                    ["genreList", {from: -1, length: 3}]
                ]
            },

            optimizedPaths: [
                ["genreList", -1],
                ["genreList", "0"],
                ["genreList", "1"]
            ],

            AsValues: {
                values: [
                    {
                        "path": ["genreList", -1],
                        "value": ["lists", "def"]
                    },
                    {
                        "path": ["genreList", "0"],
                        "value": ["lists", "abcd"]
                    },
                    {
                        "path": ["genreList", "1"],
                        "value": ["lists", "my-list"]
                    }
                ]
            },

            AsJSON: {
                values: [{
                    json: {
                        "-1": ["lists", "def"],
                        0: ["lists", "abcd"],
                        1: ["lists", "my-list"]
                    }
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        genreList: {
                            "-1": ["lists", "def"],
                            0: ["lists", "abcd"],
                            1: ["lists", "my-list"]
                        }
                    },
                    paths: [
                        ["genreList", -1],
                        ["genreList", "0"],
                        ["genreList", "1"]
                    ]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        genreList: {
                            __key: "genreList",
                            __generation: 0,
                            "-1": ["lists", "def"],
                            0: ["lists", "abcd"],
                            1: ["lists", "my-list"]
                        }
                    }
                }]
            }
        },
        fromAndToWithNegativePathsLeaf: {
            getPaths: {
                count: 3,
                query: [
                    ["genreList", {from: -1, to: 1}]
                ]
            },

            optimizedPaths: [
                ["genreList", -1],
                ["genreList", "0"],
                ["genreList", "1"]
            ],

            AsValues: {
                values: [
                    {
                        "path": ["genreList", -1],
                        "value": ["lists", "def"]
                    },
                    {
                        "path": ["genreList", "0"],
                        "value": ["lists", "abcd"]
                    },
                    {
                        "path": ["genreList", "1"],
                        "value": ["lists", "my-list"]
                    }
                ]
            },

            AsJSON: {
                values: [{
                    json: {
                        "-1": ["lists", "def"],
                        0: ["lists", "abcd"],
                        1: ["lists", "my-list"]
                    }
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        genreList: {
                            "-1": ["lists", "def"],
                            0: ["lists", "abcd"],
                            1: ["lists", "my-list"]
                        }
                    },
                    paths: [
                        ["genreList", -1],
                        ["genreList", "0"],
                        ["genreList", "1"]
                    ]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        genreList: {
                            __key: "genreList",
                            __generation: 0,
                            "-1": ["lists", "def"],
                            0: ["lists", "abcd"],
                            1: ["lists", "my-list"]
                        }
                    }
                }]
            }
        },
        fromArrayLeaf: {
            getPaths: {
                count: 2,
                query: [
                    ["genreList", ["0", "1"]]
                ]
            },

            getPathMaps: {
                count: 2,

                query: [{
                    "genreList": {
                        "0": null,
                        "1": null
                    }
                }]
            },

            optimizedPaths: [
                ["genreList", "0"],
                ["genreList", "1"]
            ],

            AsValues: {
                values: [
                    {
                        "path": ["genreList", "0"],
                        "value": ["lists", "abcd"]
                    },
                    {
                        "path": ["genreList", "1"],
                        "value": ["lists", "my-list"]
                    }
                ]
            },

            AsJSON: {
                values: [{
                    json: {
                        0: ["lists", "abcd"],
                        1: ["lists", "my-list"]
                    }
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        genreList: {
                            0: ["lists", "abcd"],
                            1: ["lists", "my-list"]
                        }
                    },
                    paths: [
                        ["genreList", "0"],
                        ["genreList", "1"]
                    ]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        genreList: {
                            __key: "genreList",
                            __generation: 0,
                            0: ["lists", "abcd"],
                            1: ["lists", "my-list"]
                        }
                    }
                }]
            }
        },
        arrayOfComplexPathsLeaf: {
            getPaths: {
                count: 2,
                query: [
                    ["genreList", [{to: 0}, {from: 1, to: 1}]]
                ]
            },

            optimizedPaths: [
                ["genreList", "0"],
                ["genreList", "1"]
            ],

            AsValues: {
                values: [
                    {
                        "path": ["genreList", "0"],
                        "value": ["lists", "abcd"]
                    },
                    {
                        "path": ["genreList", "1"],
                        "value": ["lists", "my-list"]
                    }
                ]
            },

            AsJSON: {
                values: [{
                    json: {
                        0: ["lists", "abcd"],
                        1: ["lists", "my-list"]
                    }
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        genreList: {
                            0: ["lists", "abcd"],
                            1: ["lists", "my-list"]
                        }
                    },
                    paths: [
                        ["genreList", "0"],
                        ["genreList", "1"]
                    ]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        genreList: {
                            __key: "genreList",
                            __generation: 0,
                            0: ["lists", "abcd"],
                            1: ["lists", "my-list"]
                        }
                    }
                }]
            }
        },
        arrayOfComplexPaths: {
            getPaths: {
                count: 2,
                query: [
                    ["genreList", [{to: 0}, {from: 1, to: 1}], "0", "summary"]
                ]
            },

            optimizedPaths: [
                ["videos", "1234", "summary"],
                ["videos", "553", "summary"]
            ],

            AsValues: {
                values: [
                    {
                        "path": ["genreList", "0", "0", "summary"],
                        "value": {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    },
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
                        0: {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        },
                        1: {
                            "title": "Running Man",
                            "url": "/movies/553"
                        }
                    }
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        genreList: {
                            0: ["lists", "abcd"],
                            1: ["lists", "my-list"]
                        },
                        lists: {
                            abcd: {
                                0: ["videos", "1234"]
                            },
                            "1x5x": {
                                0: ["videos", "553"]
                            },
                            "my-list": ["lists", "1x5x"]
                        },
                        videos: {
                            1234: {
                                summary: {
                                    "$type": "leaf",
                                    "$size": 10,
                                    "title": "House of Cards",
                                    "url": "/movies/1234"
                                }
                            },
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
                        ["genreList", "0", "0", "summary"],
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
                            },
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
        }
    }
};