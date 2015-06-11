var $path = require('falcor/types/ref');
var $atom = require('falcor/types/atom');
var $error = require('falcor/types/error');
module.exports = function() {
    return {
        errorWithBoxedAndTreatErrorAsValues: {
            getPathSets: {
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
                values: [
                    {
                        path: ["videos", "errorBranch"],
                        "value": {
                            "$size": 51,
                            "$type": $error,
                            value: "I am yelling timber."
                        }
                    }
                ]
            },
            AsJSON: {
                values: [
                    {
                        json: {
                            "$size": 51,
                            "$type": $error,
                            value: "I am yelling timber."
                        }
                    }
                ]
            },
            AsJSONG: {
                values: [
                    {
                        paths: [
                            ["videos", "errorBranch"]
                        ],
                        jsong: {
                            "videos": {
                                "errorBranch": {
                                    "$size": 51,
                                    "$type": $error,
                                    "value": "I am yelling timber."
                                }
                            }
                        }
                    }
                ]
            },
            AsPathMap: {
                values: [{
                    json: {
                        videos: {
                            errorBranch: {
                                "$size": 51,
                                "$type": $error,
                                value: "I am yelling timber."
                            }
                        }
                    }
                }]
            }
        }
    };
};

