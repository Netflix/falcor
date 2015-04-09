var $path = require('./../../../lib/types/path.js');
var $sentinel = require('./../../../lib/types/sentinel.js');
var $error = require('./../../../lib/types/error.js');
module.exports = function() {
    return {
        sentinelValue: {
            getPathSets: { query: [["videos", "0", "summary"]] },
            setPathSets: {
                query: [{
                    path: ["videos", "0", "summary"],
                    value: {
                        "$type": $sentinel,
                        "value": {
                            "title": "Additional Title 0",
                            "url": "/movies/0"
                        }
                    }
                }]
            },
            AsValues: {
                values: [{
                    path: ["videos", "0", "summary"],
                    value: {
                        "$size": 51,
                        "$type": $sentinel,
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
                        "$type": $sentinel,
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
                                    "$type": $sentinel,
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
                                    "$type": $sentinel,
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
                        "$size": 52,
                        "$type": $path,
                        "value": ["lists", "abcd"]
                    }
                }]
            },
            AsJSON: {
                values: [{
                    json: {
                        "$size": 52,
                        "$type": $path,
                        "value": ["lists", "abcd"]
                    }
                }]
            },
            AsPathMap: {
                values: [{
                    json: {
                        "genreList": {
                            "0": {
                                "$size": 52,
                                "$type": $path,
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
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "abcd"]
                            }
                        }
                    }
                }]
            }
        }
    };
}
