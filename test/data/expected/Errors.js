var $path = require('./../../../lib/types/ref');
var $atom = require('./../../../lib/types/atom');
var $error = require('./../../../lib/types/error');
module.exports = function() {
    return {
        errorBranchSummary: {
            getPathValues: {
                query: [
                    ["videos", "errorBranch", "summary"]
                ]
            },
            getPathMaps: {
                query: [{
                    json: {
                        videos: {
                            errorBranch: {
                                summary: null
                            }
                        }
                    }
                }]
            },
            AsValues: {
                values: [{
                    path: ["videos", "errorBranch"],
                    "value": "I am yelling timber."
                }]
            },
            AsJSON: {
                values: [{
                    json: "I am yelling timber."
                }]
            },
            AsPathMap: {
                values: [{
                    json: {
                        "videos": {
                            "errorBranch": "I am yelling timber."
                        }
                    }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["videos", "errorBranch"]],
                    jsonGraph: {
                        "videos": {
                            "errorBranch": {
                                "$size": "51",
                                "$type": $error,
                                "value": "I am yelling timber."
                            }
                        }
                    }
                }]
            }
        },
        genreListErrorNull: {
            getPathValues: {
                query: [
                    ["genreList", 2, null]
                ]
            },
            getPathMaps: {
                query: [{
                    json: {
                        genreList: {
                            2: {
                                __null: null
                            }
                        }
                    }
                }]
            },
            AsValues: {
                values: [{
                    path: ["genreList", "2", null],
                    "value": "Red is the new Black"
                }]
            },
            AsJSON: {
                values: [{
                    json: "Red is the new Black"
                }]
            },
            AsPathMap: {
                values: [{
                    json: {
                        "genreList": {
                            "2": "Red is the new Black"
                        }
                    }
                }]
            },
            AsJSONG: {
                values: [{
                    paths: [["genreList", "2", null]],
                    jsonGraph: {
                        "genreList": {
                            "2": {
                                "$size": 52,
                                "$type": $path,
                                "value": ["lists", "error-list"]
                            }
                        },
                        "lists": {
                            "error-list": {
                                "$size": "51",
                                "$type": $error,
                                "value": "Red is the new Black"
                            }
                        }
                    }
                }]
            }
        }
    };
}
