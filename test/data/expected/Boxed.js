module.exports = function() {
    return {
        primitiveValue: {
            getPathSets: { query: [["videos", "9999", "summary"]] },
            AsValues: {
                values: [{
                    path: ["videos", "9999", "summary"],
                    value: {
                        "$type": "sentinel",
                        "value": "video 9999 summary"
                    }
                }]
            },
            AsJSON: {
                values: [{
                    json: {
                        "$size": "68",
                        "$type": "sentinel",
                        "value": "video 9999 summary"
                    }
                }]
            },
            AsPathMap: {
                values: [{
                    json: {
                        "videos": {
                            "9999": {
                                "summary": {
                                    "$size": "68",
                                    "$type": "sentinel",
                                    "value": "video 9999 summary"
                                }
                            }
                        }
                    }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["videos", "9999", "summary"]],
                    jsong: {
                        "videos": {
                            "9999": {
                                "summary": {
                                    "$size": "68",
                                    "$type": "sentinel",
                                    "value": "video 9999 summary"
                                }
                            }
                        }
                    }
                }]
            }
        },
        referenceValue: {
            getPathSets: { query: [["genreList", "0"]] },
            AsValues: { 
                values: [{
                    path: ["genreList", "0"],
                    value: ["lists", "abcd"]
                }]
            },
            AsJSON: {
                values: [{
                    json: ["lists", "abcd"]
                }]
            },
            AsPathMap: {
                values: [{
                    json: {
                        "genreList": {
                            "0": ["lists", "abcd"]
                        }
                    }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["genreList", "0"]],
                    jsong: {
                        "genreList": {
                            "0": ["lists", "abcd"]
                        }
                    }
                }]
            }
        },
        sentinelValue: {
            getPathSets: { query: [["genreList", "sentinel"]] },
            AsValues: {
                values: [{
                    path: ["genreList", "sentinel"],
                    value: {
                        "$size": 52,
                        "$type": "sentinel",
                        "value": ["lists", "to-sentinel-list"]
                    }
                }]
            },
            AsJSON: {
                values: [{
                    json: {
                        "$size": 52,
                        "$type": "sentinel",
                        "value": ["lists", "to-sentinel-list"]
                    }
                }]
            },
            AsPathMap: {
                values: [{
                    json: {
                        "genreList": {
                            "sentinel": {
                                "$size": 52,
                                "$type": "sentinel",
                                "value": ["lists", "to-sentinel-list"]
                            }
                        }
                    }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["genreList", "sentinel"]],
                    jsong: {
                        "genreList": {
                            "sentinel": {
                                "$size": 52,
                                "$type": "sentinel",
                                "value": ["lists", "to-sentinel-list"]
                            }
                        }
                    }
                }]
            }
        }
    };
}