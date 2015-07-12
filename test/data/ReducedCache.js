var $path = require('./../../lib/types/ref');
var $atom = require('./../../lib/types/atom');
var $error = require('./../../lib/types/error');
var ReducedCache = function() {
    return {
        "$size": 38,
        "genreList": {
            "$size": 2,
            "0": {$type: $path, value: ["lists", "abcd"]},
            "1": {$type: $path, value: ["lists", "my-list"]}
        },
        "lists": {
            "$size": 6,
            "my-list": {$type: $path, value: ["lists", "1x5x"]},
            "1x5x": {
                "$size": 2,
                "1": {$type: $path, value: ["videos", 5522]}
            },
            "abcd": {
                "$size": 4,
                "0": {$type: $path, value: ["videos", 1234]}
            }
        },
        "videos": {
            "$size": 30,
            "1234": {
                "$size": 10,
                "summary": {
                    $type: $atom,
                    value: {
                        "title": "House of Cards",
                        "url": "/movies/1234"
                    }
                }
            },
            "5522": {
                "$size": 10,
                "summary": {
                    $type: $atom,
                    value: {
                        "title": "Junior",
                        "url": "/movies/5522"
                    }
                }
            }
        }
    };
};
var MinimalCache = function() {
    return {
        "$size": 14,
        "genreList": {
            "$size": 2,
            "0": {$type: $path, value: ["lists", "abcd"]}
        },
        "lists": {
            "$size": 2,
            "abcd": {
                "$size": 2,
                "0": {$type: $path, value: ["videos", 1234]}
            }
        },
        "videos": {
            "$size": 10,
            "1234": {
                "$size": 10,
                "summary": {
                    $type: $atom,
                    value: {
                        "title": "House of Cards",
                        "url": "/movies/1234"
                    }
                }
            }
        }
    };
};

module.exports = {
    ReducedCache: ReducedCache,
    MinimalCache: MinimalCache
};

