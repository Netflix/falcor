module.exports = function() {
    return {
        referenceExpired: {
            setPathValues: {
                query: [{
                    "path": ["genreList", "9", "0", "summary"],
                    "value": "should be expired"
                }]
            },
            setPathMaps: {
                query: [{
                    json: {
                        genreList: {
                            9: {
                                0: {
                                    summary: "should be expired"
                                }
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
                    jsonGraph: {
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
                            "9": {
                                "0": {
                                    "summary": "should be expired"
                                }
                            }
                        }
                    }
                }]
            }
        },

        expiredLeafNodeTimestamp: {
            setPathValues: {
                query: [{
                    "path": ["videos", "expiredLeafByTimestamp", "summary"],
                    "value": "should be expired"
                }]
            },
            setPathMaps: {
                query: [{
                    json: {
                        videos: {
                            expiredLeafByTimestamp: {
                                summary: "should be expired"
                            }
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
                    jsonGraph: {
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
                            "expiredLeafByTimestamp": {
                                "summary": "should be expired"
                            }
                        }
                    }
                }]
            }
        },
        expiredLeafNode0: {
            setPathValues: {
                query: [{
                    "path": ["videos", "expiredLeafBy0", "summary"],
                    "value": "should be expired"
                }]
            },
            setPathMaps: {
                query: [{
                    json: {
                        videos: {
                            expiredLeafBy0: {
                                summary: "should be expired"
                            }
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
                    jsonGraph: {
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
                            "expiredLeafBy0": {
                                "summary": "should be expired"
                            }
                        }
                    }
                }]
            }
        },
        expiredBranchByTimestamp: {
            setPathValues: {
                query: [{
                    "path": ["videos", "expiredBranchByTimestamp", "summary"],
                    "value": "should be expired"
                }]
            },
            setPathMaps: {
                query: [{
                    json: {
                        videos: {
                            expiredBranchByTimestamp: {
                                summary: "should be expired"
                            }
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
                    jsonGraph: {
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
                            "expiredBranchByTimestamp": {
                                "summary": "should be expired"
                            }
                        }
                    }
                }]
            }
        },
        expiredBranchBy0: {
            setPathValues: {
                query: [{
                    "path": ["videos", "expiredBranchBy0", "summary"],
                    "value": "should be expired"
                }]
            },
            setPathMaps: {
                query: [{
                    json: {
                        videos: {
                            expiredBranchBy0: {
                                summary: "should be expired"
                            }
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
                    jsonGraph: {
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
                            "expiredBranchBy0": {
                                "summary": "should be expired"
                            }
                        }
                    }
                }]
            }
        },
        futureExpiredReference: {
            setPathValues: {
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
