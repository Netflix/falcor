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
        sentinelValue: {
            getPathSets: { query: [["videos", "0", "summary"]] },
            AsValues: {
                values: [{
                    path: ["videos", "0", "summary"],
                    value: {
                        "$size": 51,
                        "$type": "sentinel",
                        "value": {
                            "title": "Additional Title 0",
                            "url": "/movies/0"
                        }
                    }
                }]
            },
            AsJSON: {
                values: [{
                    json: {
                        "$size": 51,
                        "$type": "sentinel",
                        "value": {
                            "title": "Additional Title 0",
                            "url": "/movies/0"
                        }
                    }
                }]
            },
            AsPathMap: {
                values: [{
                    json: {
                        "videos": {
                            "0": {
                                "summary": {
                                    "$size": 51,
                                    "$type": "sentinel",
                                    "value": {
                                        "title": "Additional Title 0",
                                        "url": "/movies/0"
                                    }
                                }
                            }
                        }
                    }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["videos", "0", "summary"]],
                    jsong: {
                        "videos": {
                            "0": {
                                "summary": {
                                    "$size": 51,
                                    "$type": "sentinel",
                                    "value": {
                                        "title": "Additional Title 0",
                                        "url": "/movies/0"
                                    }
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
                    value: {
                        "$size": 51,
                        "$type": "reference",
                        "value": ["lists", "abcd"]
                    }
                }]
            },
            AsJSON: {
                values: [{
                    json: {
                        "$size": 51,
                        "$type": "reference",
                        "value": ["lists", "abcd"]
                    }
                }]
            },
            AsPathMap: {
                values: [{
                    json: {
                        "genreList": {
                            "0": {
                                "$size": 51,
                                "$type": "reference",
                                "value": ["lists", "abcd"]
                            }
                        }
                    }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["genreList", "0"]],
                    jsong: {
                        "genreList": {
                            "0": {
                                "$size": 51,
                                "$type": "reference",
                                "value": ["lists", "abcd"]
                            }
                        }
                    }
                }]
            }
        }
    };
}