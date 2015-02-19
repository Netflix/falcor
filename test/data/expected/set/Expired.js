module.exports = function() {
    return {
        referenceExpired: {
            setPaths: {
                query: [{
                    "path": ["genreList", "9", "0", "summary"],
                    "value": "should be expired"
                }]
            },
            setPathMaps: {
                query: [{
                    genreList: {
                        9: {
                            0: {
                                summary: "should be expired"
                            }
                        }
                    }
                }]
            },

            optimizedPaths: [
                ["lists", "to-expired-list", "0", "summary"]
            ],
            requestedPaths: [
                ["genreList", "9", "0", "summary"]
            ],

            AsValues: {
                values: [{
                    "path": ["genreList", "9", "0", "summary"],
                    "value": "should be expired"
                }]
            },

            AsJSON: {
                values: [{
                    json: "should be expired"
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        "genreList": {
                            "9": ["lists", "to-expired-list"]
                        },
                        "lists": {
                            "to-expired-list": {
                                "0": {
                                    "summary": "should be expired"
                                }
                            }
                        }
                    },
                    "paths": [
                        ["genreList", "9", "0", "summary"]
                    ]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        "genreList": {
                            __key: "genreList",
                            __generation: 0,
                            "9": {
                                __key: 9,
                                __generation: 0,
                                "0": {
                                    __key: 0,
                                    __generation: 0,
                                    "summary": "should be expired"
                                }
                            }
                        }
                    }
                }]
            }
        },

        expiredLeafNodeTimestamp: {
            setPaths: {
                query: [{
                    "path": ["videos", "expiredLeafByTimestamp", "summary"],
                    "value": "should be expired"
                }]
            },
            setPathMaps: {
                query: [{
                    videos: {
                        expiredLeafByTimestamp: {
                            summary: "should be expired"
                        }
                    }
                }]
            },

            AsValues: {
                values: [{
                    "path": ["videos", "expiredLeafByTimestamp", "summary"],
                    "value": "should be expired"
                }]
            },

            AsJSON: {
                values: [{
                    json: "should be expired"
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        "videos": {
                            "expiredLeafByTimestamp": {
                                "summary": "should be expired"
                            }
                        }
                    },
                    paths: [["videos", "expiredLeafByTimestamp", "summary"]]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        "videos": {
                            __key: "videos",
                            __generation: 0,
                            "expiredLeafByTimestamp": {
                                __key: "expiredLeafByTimestamp",
                                __generation: 0,
                                "summary": "should be expired"
                            }
                        }
                    }
                }]
            }
        },
        expiredLeafNode0: {
            setPaths: {
                query: [{
                    "path": ["videos", "expiredLeafBy0", "summary"],
                    "value": "should be expired"
                }]
            },
            setPathMaps: {
                query: [{
                    videos: {
                        expiredLeafBy0: {
                            summary: "should be expired"
                        }
                    }
                }]
            },

            AsValues: {
                values: [{
                    "path": ["videos", "expiredLeafBy0", "summary"],
                    "value": "should be expired"
                }]
            },

            AsJSON: {
                values: [{
                    json: "should be expired"
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        "videos": {
                            "expiredLeafBy0": {
                                "summary": "should be expired"
                            }
                        }
                    },
                    paths: [["videos", "expiredLeafBy0", "summary"]]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        "videos": {
                            __key: "videos",
                            __generation: 0,
                            "expiredLeafBy0": {
                                __key: "expiredLeafBy0",
                                __generation: 0,
                                "summary": "should be expired"
                            }
                        }
                    }
                }]
            }
        },
        expiredBranchByTimestamp: {
            setPaths: {
                query: [{
                    "path": ["videos", "expiredBranchByTimestamp", "summary"],
                    "value": "should be expired"
                }]
            },
            setPathMaps: {
                query: [{
                    videos: {
                        expiredBranchByTimestamp: {
                            summary: "should be expired"
                        }
                    }
                }]
            },

            AsValues: {
                values: [{
                    "path": ["videos", "expiredBranchByTimestamp", "summary"],
                    "value": "should be expired"
                }]
            },

            AsJSON: {
                values: [{
                    json: "should be expired"
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        "videos": {
                            "expiredBranchByTimestamp": {
                                "summary": "should be expired"
                            }
                        }
                    },
                    paths: [["videos", "expiredBranchByTimestamp", "summary"]]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        "videos": {
                            __key: "videos",
                            __generation: 0,
                            "expiredBranchByTimestamp": {
                                __key: "expiredBranchByTimestamp",
                                __generation: 0,
                                "summary": "should be expired"
                            }
                        }
                    }
                }]
            }
        },
        expiredBranchBy0: {
            setPaths: {
                query: [{
                    "path": ["videos", "expiredBranchBy0", "summary"],
                    "value": "should be expired"
                }]
            },
            setPathMaps: {
                query: [{
                    videos: {
                        expiredBranchBy0: {
                            summary: "should be expired"
                        }
                    }
                }]
            },

            AsValues: {
                values: [{
                    "path": ["videos", "expiredBranchBy0", "summary"],
                    "value": "should be expired"
                }]
            },

            AsJSON: {
                values: [{
                    json: "should be expired"
                }]
            },

            AsJSONG: {
                values: [{
                    jsong: {
                        "videos": {
                            "expiredBranchBy0": {
                                "summary": "should be expired"
                            }
                        }
                    },
                    paths: [["videos", "expiredBranchBy0", "summary"]]
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        "videos": {
                            __key: "videos",
                            __generation: 0,
                            "expiredBranchBy0": {
                                __key: "expiredBranchBy0",
                                __generation: 0,
                                "summary": "should be expired"
                            }
                        }
                    }
                }]
            }
        },
        futureExpiredReference: {
            setPaths: {
                query: [{
                    "path": ["genreList", "12", "0", "summary"],
                    "value": "should be expired"
                }]
            },
            
            optimizedMissingPaths: [
                ["lists", "future-expired-list", "0", "summary"]
            ],
            
            requestedMissingPaths: [
                ["genreList", "12", "0", "summary"]
            ],

            AsValues: {
                values: []
            },

            AsJSON: {
                values: [undefined]
            },

            // AsJSONG: {
            //     values: []
            // },

            // AsPathMap: {
            //     values: []
            // }
        }
    };
};
