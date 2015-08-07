var $path = require('./../../../lib/types/ref');
var $atom = require('./../../../lib/types/atom');
var $error = require('./../../../lib/types/error');
module.exports = function() {
    return {
        atomValue: {
            getPathValues: { query: [["videos", "0", "summary"]] },
            setPathValues: {
                query: [{
                    path: ["videos", "0", "summary"],
                    value: {
                        "$type": $atom,
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
                        "$type": $atom,
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
                        "$type": $atom,
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
                                    "$type": $atom,
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
                    jsonGraph: {
                        "videos": {
                            "0": {
                                "summary": {
                                    "$size": 51,
                                    "$type": $atom,
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
            getPathValues: { query: [["genreList", "0"]] },
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
                    jsonGraph: {
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
