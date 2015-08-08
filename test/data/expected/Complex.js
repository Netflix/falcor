var $path = require('./../../../lib/types/ref');
var $atom = require('./../../../lib/types/atom');
var $error = require('./../../../lib/types/error');
module.exports = function() {
    return {
        toOnlyLists: {
            getPathValues: {
                query: [
                    ["genreList", {to: 1}, 0, "summary"]
                ]
            },

            getPathMaps: {
                query: [{
                    json: {
                        "genreList": {
                            "0": {
                                "0": {
                                    "summary": null
                                }
                            },
                            "1": {
                                "0": {
                                    "summary": null
                                }
                            }
                        }
                    }
                }]
            },

            AsValues: {
                values: [
                    {
                        path: ["genreList", "0", "0", "summary"],
                        "value": {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    },
                    {
                        path: ["genreList", "1", "0", "summary"],
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
                            0: {
                                "title": "House of Cards",
                                "url": "/movies/1234"
                            }
                        },
                        1: {
                            0: {
                                "title": "Running Man",
                                "url": "/movies/553"
                            }
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
                            },
                            1: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "my-list"]
                            }
                        },
                        lists: {
                            abcd: {
                                0: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "1234"]
                                }
                            },
                            '1x5x': {
                                0: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "553"]
                                }
                            },
                            'my-list': {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "1x5x"]
                            }
                        },
                        videos: {
                            1234: {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "title": "House of Cards",
                                        "url": "/movies/1234"
                                    }
                                }
                            },
                            553: {
                                "summary": {
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
                            0: {
                                0: {
                                    summary: {
                                        "title": "House of Cards",
                                        "url": "/movies/1234"
                                    }
                                }
                            },
                            1: {
                                0: {
                                    summary: {
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
        doubleComplex: {
            getPathValues: {
                query: [
                    ["genreList", {to: 1}, {to: 1}, "summary"]
                ]
            },

            getPathMaps: {
                query: [{
                    json: {
                        "genreList": {
                            "0": {
                                "0": {
                                    "summary": null
                                },
                                "1": {
                                    "summary": null
                                }
                            },
                            "1": {
                                "0": {
                                    "summary": null
                                },
                                "1": {
                                    "summary": null
                                }
                            }
                        }
                    }
                }]
            },

            AsValues: {
                values: [
                    {
                        path: ["genreList", "0", "0", "summary"],
                        "value": {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    },
                    {
                        path: ["genreList", "0", "1", "summary"],
                        "value": {
                            "title": "Terminator 3",
                            "url": "/movies/766"
                        }
                    },
                    {
                        path: ["genreList", "1", "0", "summary"],
                        "value": {
                            "title": "Running Man",
                            "url": "/movies/553"
                        }
                    },
                    {
                        path: ["genreList", "1", "1", "summary"],
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
                            0: {
                                "title": "House of Cards",
                                "url": "/movies/1234"
                            },
                            1: {
                                "title": "Terminator 3",
                                "url": "/movies/766"
                            }
                        },
                        1: {
                            0: {
                                "title": "Running Man",
                                "url": "/movies/553"
                            },
                            1: {
                                "title": "Junior",
                                "url": "/movies/5522"
                            }
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
                            },
                            1: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "my-list"]
                            }
                        },
                        lists: {
                            abcd: {
                                0: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "1234"]
                                },
                                1: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "766"]
                                }
                            },
                            '1x5x': {
                                0: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "553"]
                                },
                                1: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "5522"]
                                }
                            },
                            'my-list': {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "1x5x"]
                            }
                        },
                        videos: {
                            1234: {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "title": "House of Cards",
                                        "url": "/movies/1234"
                                    }
                                }
                            },
                            5522: {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "title": "Junior",
                                        "url": "/movies/5522"
                                    }
                                }
                            },
                            553: {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "title": "Running Man",
                                        "url": "/movies/553"
                                    }
                                }
                            },
                            766: {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "title": "Terminator 3",
                                        "url": "/movies/766"
                                    }
                                }
                            }
                        }
                    },
                    paths: [
                        ["genreList", "0", "0", "summary"],
                        ["genreList", "0", "1", "summary"],
                        ["genreList", "1", "0", "summary"],
                        ["genreList", "1", "1", "summary"]
                    ]
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
                                        "url": "/movies/1234"
                                    }
                                },
                                1: {
                                    summary: {
                                        "title": "Terminator 3",
                                        "url": "/movies/766"
                                    }
                                }
                            },
                            1: {
                                0: {
                                    summary: {
                                        "title": "Running Man",
                                        "url": "/movies/553"
                                    }
                                },
                                1: {
                                    summary: {
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
        toOnly: {
            getPathValues: {
                query: [
                    ["genreList", "0", {to: 1}, "summary"]
                ]
            },

            getPathMaps: {
                query: [{
                    json: {
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
                        path: ["genreList", "0", "0", "summary"],
                        "value": {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    },
                    {
                        path: ["genreList", "0", "1", "summary"],
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
                    jsonGraph: {
                        genreList: {
                            0: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "abcd"]
                            }
                        },
                        lists: {
                            abcd: {
                                0: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "1234"]
                                },
                                1: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "766"]
                                }
                            }
                        },
                        videos: {
                            1234: {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "title": "House of Cards",
                                        "url": "/movies/1234"
                                    }
                                }
                            },
                            "766": {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "title": "Terminator 3",
                                        "url": "/movies/766"
                                    }
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
                            0: {
                                0: {
                                    summary: {
                                        "title": "House of Cards",
                                        "url": "/movies/1234"
                                    }
                                },
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
        toOnlyMyList: {
            getPathValues: {
                query: [
                    ["genreList", "1", {to: 1}, "summary"]
                ]
            },

            AsValues: {
                values: [
                    {
                        path: ["genreList", "1", "0", "summary"],
                        "value": {
                            "title": "Running Man",
                            "url": "/movies/553"
                        }
                    },
                    {
                        path: ["genreList", "1", "1", "summary"],
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
                    jsonGraph: {
                        genreList: {
                            1: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "my-list"]
                            }
                        },
                        lists: {
                            "1x5x": {
                                0: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "553"]
                                },
                                1: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "5522"]
                                }
                            },
                            "my-list": ["lists", "1x5x"]
                        },
                        videos: {
                            553: {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "title": "Running Man",
                                        "url": "/movies/553"
                                    }
                                }
                            },
                            "5522": {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "title": "Junior",
                                        "url": "/movies/5522"
                                    }
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
                            1: {
                                0: {
                                    summary: {
                                        "title": "Running Man",
                                        "url": "/movies/553"
                                    }
                                },
                                1: {
                                    summary: {
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
            getPathValues: {
                query: [
                    ["genreList", "0", {from: 0}, "summary"]
                ]
            },

            optimizedPaths: [
                ["videos", "1234", "summary"]
            ],

            AsValues: {
                values: [{
                    path: ["genreList", "0", "0", "summary"],
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
                    jsonGraph: {
                        genreList: {
                            0: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "abcd"]
                            }
                        },
                        lists: {
                            abcd: {
                                0: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "1234"]
                                }
                            }
                        },
                        videos: {
                            1234: {
                                "summary": {
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
                    paths: [
                        ["genreList", "0", "0", "summary"]
                    ]
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
            getPathValues: {
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
                        path: ["genreList", "0", "-1", "summary"],
                        "value": {
                            "title": "Beverly Hills Ninja",
                            "url": "/movies/4422"
                        }
                    },
                    {
                        path: ["genreList", "0", "0", "summary"],
                        "value": {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    },
                    {
                        path: ["genreList", "0", "1", "summary"],
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
                    jsonGraph: {
                        genreList: {
                            0: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "abcd"]
                            }
                        },
                        lists: {
                            abcd: {
                                "-1": {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "4422"]
                                },
                                0: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "1234"]
                                },
                                1: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "766"]
                                }
                            }
                        },
                        videos: {
                            1234: {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "title": "House of Cards",
                                        "url": "/movies/1234"
                                    }
                                }
                            },
                            4422: {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "title": "Beverly Hills Ninja",
                                        "url": "/movies/4422"
                                    }
                                }
                            },
                            766: {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "title": "Terminator 3",
                                        "url": "/movies/766"
                                    }
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
                            0: {
                                "-1": {
                                    summary: {
                                        "title": "Beverly Hills Ninja",
                                        "url": "/movies/4422"
                                    }
                                },
                                0: {
                                    summary: {
                                        "title": "House of Cards",
                                        "url": "/movies/1234"
                                    }
                                },
                                "1": {
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
        fromAndLength: {
            getPathValues: {
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
                        path: ["genreList", "0", "-1", "summary"],
                        "value": {
                            "title": "Beverly Hills Ninja",
                            "url": "/movies/4422"
                        }
                    },
                    {
                        path: ["genreList", "0", "0", "summary"],
                        "value": {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    },
                    {
                        path: ["genreList", "0", "1", "summary"],
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
                    jsonGraph: {
                        genreList: {
                            0: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "abcd"]
                            }
                        },
                        lists: {
                            abcd: {
                                "-1": {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "4422"]
                                },
                                0: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "1234"]
                                },
                                1: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "766"]
                                }
                            }
                        },
                        videos: {
                            1234: {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "title": "House of Cards",
                                        "url": "/movies/1234"
                                    }
                                }
                            },
                            4422: {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "title": "Beverly Hills Ninja",
                                        "url": "/movies/4422"
                                    }
                                }
                            },
                            766: {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "title": "Terminator 3",
                                        "url": "/movies/766"
                                    }
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
                            0: {
                                "-1": {
                                    summary: {
                                        "title": "Beverly Hills Ninja",
                                        "url": "/movies/4422"
                                    }
                                },
                                0: {
                                    summary: {
                                        "title": "House of Cards",
                                        "url": "/movies/1234"
                                    }
                                },
                                "1": {
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
        fromArray: {
            getPathValues: {
                query: [
                    ["genreList", "0", ["0", "1"], "summary"]
                ]
            },


            optimizedPaths: [
                ["videos", "1234", "summary"],
                ["videos", "766", "summary"]
            ],

            AsValues: {
                values: [
                    {
                        path: ["genreList", "0", "0", "summary"],
                        "value": {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    },
                    {
                        path: ["genreList", "0", "1", "summary"],
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
                    jsonGraph: {
                        genreList: {
                            0: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "abcd"]
                            }
                        },
                        lists: {
                            abcd: {
                                0: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "1234"]
                                },
                                1: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "766"]
                                }
                            }
                        },
                        videos: {
                            1234: {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "title": "House of Cards",
                                        "url": "/movies/1234"
                                    }
                                }
                            },
                            766: {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "title": "Terminator 3",
                                        "url": "/movies/766"
                                    }
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
                            0: {
                                0: {
                                    summary: {
                                        "title": "House of Cards",
                                        "url": "/movies/1234"
                                    }
                                },
                                "1": {
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
        toOnlyLeaf: {
            getPathValues: {
                query: [
                    ["genreList", {to: 1}]
                ]
            },

            getPathMaps: {
                query: [{
                    json: {
                        "genreList": {
                            "0": null,
                            "1": null
                        }
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
                        path: ["genreList", "0"],
                        "value": ["lists", "abcd"]
                    },
                    {
                        path: ["genreList", "1"],
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
                    jsonGraph: {
                        genreList: {
                            0: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "abcd"]
                            },
                            1: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "my-list"]
                            }
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
                            0: ["lists", "abcd"],
                            1: ["lists", "my-list"]
                        }
                    }
                }]
            }
        },
        fromOnlyLeaf: {
            getPathValues: {
                query: [
                    ["genreList", {from: 0}]
                ]
            },

            optimizedPaths: [
                ["genreList", "0"]
            ],

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
                    json: {
                        0: ["lists", "abcd"]
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
                    paths: [
                        ["genreList", "0"]
                    ]
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
            }
        },
        fromAndLengthLeaf: {
            getPathValues: {
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
                        path: ["genreList", -1],
                        "value": ["lists", "def"]
                    },
                    {
                        path: ["genreList", "0"],
                        "value": ["lists", "abcd"]
                    },
                    {
                        path: ["genreList", "1"],
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
                    jsonGraph: {
                        genreList: {
                            "-1": {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "def"]
                            },
                            0: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "abcd"]
                            },
                            1: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "my-list"]
                            }
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
                            "-1": ["lists", "def"],
                            0: ["lists", "abcd"],
                            1: ["lists", "my-list"]
                        }
                    }
                }]
            }
        },
        fromAndToWithNegativePathsLeaf: {
            getPathValues: {
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
                        path: ["genreList", -1],
                        "value": ["lists", "def"]
                    },
                    {
                        path: ["genreList", "0"],
                        "value": ["lists", "abcd"]
                    },
                    {
                        path: ["genreList", "1"],
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
                    jsonGraph: {
                        genreList: {
                            "-1": {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "def"]
                            },
                            0: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "abcd"]
                            },
                            1: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "my-list"]
                            }
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
                            "-1": ["lists", "def"],
                            0: ["lists", "abcd"],
                            1: ["lists", "my-list"]
                        }
                    }
                }]
            }
        },
        fromArrayLeaf: {
            getPathValues: {
                query: [
                    ["genreList", ["0", "1"]]
                ]
            },

            optimizedPaths: [
                ["genreList", "0"],
                ["genreList", "1"]
            ],

            AsValues: {
                values: [
                    {
                        path: ["genreList", "0"],
                        "value": ["lists", "abcd"]
                    },
                    {
                        path: ["genreList", "1"],
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
                    jsonGraph: {
                        genreList: {
                            0: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "abcd"]
                            },
                            1: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "my-list"]
                            }
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
                            0: ["lists", "abcd"],
                            1: ["lists", "my-list"]
                        }
                    }
                }]
            }
        },
        arrayOfComplexPathsLeaf: {
            getPathValues: {
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
                        path: ["genreList", "0"],
                        "value": ["lists", "abcd"]
                    },
                    {
                        path: ["genreList", "1"],
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
                    jsonGraph: {
                        genreList: {
                            0: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "abcd"]
                            },
                            1: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "my-list"]
                            }
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
                            0: ["lists", "abcd"],
                            1: ["lists", "my-list"]
                        }
                    }
                }]
            }
        },
        arrayOfComplexPaths: {
            getPathValues: {
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
                        path: ["genreList", "0", "0", "summary"],
                        "value": {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    },
                    {
                        path: ["genreList", "1", "0", "summary"],
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
                    jsonGraph: {
                        genreList: {
                            0: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "abcd"]
                            },
                            1: {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "my-list"]
                            }
                        },
                        lists: {
                            abcd: {
                                0: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "1234"]
                                }
                            },
                            "1x5x": {
                                0: {
                                    "$size": 52,
                                    "$type": $path,
                                    "value": ["videos", "553"]
                                }
                            },
                            "my-list": {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "1x5x"]
                            }
                        },
                        videos: {
                            1234: {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
                                    "value": {
                                        "title": "House of Cards",
                                        "url": "/movies/1234"
                                    }
                                }
                            },
                            553: {
                                "summary": {
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
                            0: {
                                0: {
                                    summary: {
                                        "title": "House of Cards",
                                        "url": "/movies/1234"
                                    }
                                }
                            },
                            1: {
                                0: {
                                    summary: {
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
