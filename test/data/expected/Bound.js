module.exports = function() {
    return {
        directValue: {
            getPathSets: {
                count: 0,
                query: [["summary"]]
            },
            getPathMaps: {
                query: [{summary: null}]
            },

            optimizedPaths: [
                ["videos", "1234", "summary"]
            ],

            AsValues: {
                values: [{
                    "path": ["summary"],
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

            AsPathMap: {
                values: [{
                    json: {
                        summary: {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    }
                }]
            }
        },
        toLeafNode: {
            getPathSets: {
                query: [[]]
            },
            getPathMaps: {
                query: [{}]
            },

            optimizedPaths: [
                ["videos", "1234", "summary"]
            ],

            AsValues: {
                values: [{
                    "path": [],
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

            AsPathMap: {
                values: [{
                    json: {
                        "title": "House of Cards",
                        "url": "/movies/1234"
                    }
                }]
            }
        },
        toOnly: {
            getPathSets: {
                query: [
                    [{to: 1}, "summary"]
                ]
            },

            getPathMaps: {
                query: [{
                    "0": {
                        "summary": null
                    },
                    "1": {
                        "summary": null
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
                        "path": ["0", "summary"],
                        "value": {
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    },
                    {
                        "path": ["1", "summary"],
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

            AsPathMap: {
                values: [{
                    json: {
                        0: {
                            __key: "0",
                            __generation: 0,
                            summary: {
                                "title": "House of Cards",
                                "url": "/movies/1234"
                            }
                        },
                        1: {
                            __key: "1",
                            __generation: 0,
                            summary: {
                                "title": "Terminator 3",
                                "url": "/movies/766"
                            }
                        }
                    }
                }]
            }
        },
        onReference: {
            getPathSets: {
                query: [
                    ["0", "summary"]
                ]
            },

            setPathSets: {
                query: [
                    {
                        "path": ["0", "summary"],
                        "value": {
                            "$size": 10,
                            "title": "House of Cards",
                            "url": "/movies/1234"
                        }
                    }
                ]
            },
            getPathMaps: {
                query: [{
                    0: {
                        summary: null
                    }
                }]
            },

            optimizedPaths: [
                ["videos", "1234", "summary"]
            ],

            AsValues: {
                values: [
                    {
                        "path": ["0", "summary"],
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

            AsPathMap: {
                values: [{
                    json: {
                        0: {
                            __key: "0",
                            __generation: 0,
                            summary: {
                                "title": "House of Cards",
                                "url": "/movies/1234"
                            }
                        }
                    }
                }]
            }
        }
    };
};
