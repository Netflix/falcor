var expiredTimestamp = Date.now() - 100;
var Cache = function() {
    return {
        "$size": 1053,
        "genreList": {
            "$size": 81,
            "-1": ["lists", "def"],
            "0": ["lists", "abcd"],
            "1": ["lists", "my-list"],
            "2": ["lists", "error-list"],
            "3": ["lists", "sentinel-list"],
            "4": ["lists", "missing-list"],
            "5": ["lists", "to-error-list"],
            "6": ["lists", "to-missing-list"],
            "7": ["lists", "to-sentinel-list"],
            "8": ["lists", "expired-list"],
            "9": ["lists", "to-expired-list"],
            "10": ["videos", 1234, "summary"],
            "11": ["lists", "expired-video-branch"],
            "12": ["lists", "future-expired-list"],
            "sentinel": {
                "$size": 52,
                "$type": "sentinel",
                "value": ["lists", "to-sentinel-list"]
            },
            "branch-miss": ["does", "not", "exist"]
        },
        "lists": {
            "$size": 489,
            "abcd": {
                "$size": 8,
                "-1": ["videos", 4422],
                "0": ["videos", 1234],
                "1": ["videos", 766],
                "2": ["videos", 7531],
                "3": ["videos", 6420]
            },
            "def": {
                "$size": 6,
                "0": ["videos", 888],
                "1": ["videos", 999],
                "2": ["videos", 542]
            },
            "sentinel-list": {
                "$size": 104,
                "0": {
                    "$size": 52,
                    "$type": "sentinel",
                    "value": ["videos", 333]
                },
                "1": {
                    "$size": 52,
                    "$type": "sentinel",
                    "value": ["videos", "sentinel"]
                }
            },
            "sentinel-list-2": {
                "$size": 52,
                "0": {
                    "$size": 52,
                    "$type": "sentinel",
                    "value": ["videos", 733]
                }
            },
            "expired-video-branch": {
                "$size": 3,
                "0": ["videos", "expiredBranchByTimestamp", "summary"]
            },
            "1x5x": {
                "$size": 4,
                "0": ["videos", 553],
                "1": ["videos", 5522]
            },
            "my-list": ["lists", "1x5x"],
            "error-list": {
                "$size": 50,
                "$type": "error",
                "message": "Red is the new Black"
            },
            "error-list-2": {
                "$size": 50,
                "$type": "error",
                "message": "House of Pain"
            },
            "expired-list": {
                "$size": 51,
                "$type": "sentinel",
                "$expires": expiredTimestamp,
                "value": {
                    "0": ["videos", 333],
                    "1": ["videos", "sentinel"]
                }
            },
            "to-error-list": ["lists", "error-list-2"],
            "to-missing-list": ["lists", "missing-list-2"],
            "to-expired-list": {
                "$size": 52,
                "$type": "sentinel",
                "$expires": expiredTimestamp,
                "value": ["lists", "expired-list"]
            },
            "future-expired-list": {
                "$type": "sentinel",
                "$expires": Date.now() + 100000,
                "$size": 51,
                "value": {
                    "0": ["videos", 1234]
                }
            },
            "to-sentinel-list": {
                "$size": 52,
                "$type": "sentinel",
                "value": ["lists", "sentinel-list-2"]
            }
        },
        "videos": {
            "$size": 432,
            "1234": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "leaf",
                    "title": "House of Cards",
                    "url": "/movies/1234"
                }
            },
            "333": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "leaf",
                    "title": "Terminator 2",
                    "url": "/movies/333"
                }
            },
            "733": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "leaf",
                    "title": "Total Recall (Without Colin Farrell)",
                    "url": "/movies/733"
                }
            },
            "553": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "leaf",
                    "title": "Running Man",
                    "url": "/movies/553"
                }
            },
            "766": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "leaf",
                    "title": "Terminator 3",
                    "url": "/movies/766"
                }
            },
            "888": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "leaf",
                    "title": "Terminator Salvation",
                    "url": "/movies/888"
                }
            },
            "999": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "leaf",
                    "title": "Jingle All the Way",
                    "url": "/movies/999"
                }
            },
            "4422": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "leaf",
                    "title": "Beverly Hills Ninja",
                    "url": "/movies/4422"
                }
            },
            "7531": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "leaf",
                    "title": "Kindergarten Cop",
                    "url": "/movies/7531"
                }
            },
            "5522": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "leaf",
                    "title": "Junior",
                    "url": "/movies/5522"
                }
            },
            "6420": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "leaf",
                    "title": "Commando",
                    "url": "/movies/6420"
                }
            },
            "sentinel": {
                "$size": 51,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Marco Polo",
                        "url": "/movies/sentinel"
                    }
                }
            },
            "expiredLeafByTimestamp": {
                "$size": 51,
                "summary": {
                    "$size": 51,
                    "$expires": expiredTimestamp,
                    "$type": "sentinel",
                    "value": {
                        "sad": "panda"
                    }
                }
            },
            "expiredLeafBy0": {
                "$size": 51,
                "summary": {
                    "$expires": 0,
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "sad": "tunafish"
                    }
                }
            },
            "expiredBranchByTimestamp": {
                "$size": 51,
                "$expires": expiredTimestamp,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "sad": "liger"
                    }
                }
            },
            "expiredBranchBy0": {
                "$size": 51,
                "$expires": 0,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "sad": "turtle"
                    }
                }
            },
            "errorBranch": {
                "$size": 50,
                "$type": "error",
                "message": "I am yelling timber."
            },
            "542": {
                "$size": 10,
                "video-item": {
                    "$size": 10,
                    "summary": {
                        "$size": 10,
                        "$type": "leaf",
                        "title": "Conan, The Barbarian",
                        "url": "/movies/6420"
                    }
                }
            },
            "3355": {
                "$size": 26,
                "summary": {
                    "$size": 10,
                    "$type": "leaf",
                    "title": "Conan, The Destroyer",
                    "url": "/movies/3355"
                },
                "art": {
                    "$size": 16,
                    "$type": "leaf",
                    "box-shot": "www.cdn.com/3355"
                }
            },
            "missingValue": { "$type": "sentinel" }
        },
        "misc": {
            "$size": 51,
            "usentinel": {
                "$size": 51,
                "$type": "sentinel",
                "value": undefined
            }
        }
    };
};

