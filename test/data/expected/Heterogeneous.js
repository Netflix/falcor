var $path = require('./../../../lib/types/ref');
var $atom = require('./../../../lib/types/atom');
var $error = require('./../../../lib/types/error');
module.exports = function() {
    return {
        errorWithBoxedAndTreatErrorAsValues: {
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
                        jsonGraph: {
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

