var expiredTimestamp = Date.now() - 100;
var Cache = function() {
    return {
        "$size": 1353,
        "genreList": {
            "$size": 81,
            "-1": { "$type": "path", "value": ["lists", "def"] },
            "0":  { "$type": "path", "value": ["lists", "abcd"] },
            "1":  { "$type": "path", "value": ["lists", "my-list"] },
            "2":  { "$type": "path", "value": ["lists", "error-list"] },
            "3":  { "$type": "path", "value": ["lists", "sentinel-list"] },
            "4":  { "$type": "path", "value": ["lists", "missing-list"] },
            "5":  { "$type": "path", "value": ["lists", "to-error-list"] },
            "6":  { "$type": "path", "value": ["lists", "to-missing-list"] },
            "7":  { "$type": "path", "value": ["lists", "to-sentinel-list"] },
            "8":  { "$type": "path", "value": ["lists", "expired-list"] },
            "9":  { "$type": "path", "value": ["lists", "to-expired-list"] },
            "10": { "$type": "path", "value": ["videos", 1234, "summary"] },
            "11": { "$type": "path", "value": ["lists", "missing-branch-link", "summary"] },
            "12": { "$type": "path", "value": ["lists", "future-expired-list"] },
            "sentinel": {
                "$size": 52,
                "$type": "path",
                "value": ["lists", "to-sentinel-list"]
            },
            "branch-miss": { "$type": "path", "value": ["does", "not", "exist"] }
        },
        "lists": {
            "$size": 489,
            "abcd": {
                "$size": 8,
                "-1": { "$type": "path", "value": ["videos", 4422] },
                "0":  { "$type": "path", "value": ["videos", 1234] },
                "1":  { "$type": "path", "value": ["videos", 766] },
                "2":  { "$type": "path", "value": ["videos", 7531] },
                "3":  { "$type": "path", "value": ["videos", 6420] },
                "4":  { "$type": "path", "value": ["videos", 0] },
                "5":  { "$type": "path", "value": ["videos", 1] },
                "6":  { "$type": "path", "value": ["videos", 2] },
                "7":  { "$type": "path", "value": ["videos", 3] },
                "8":  { "$type": "path", "value": ["videos", 4] },
                "9":  { "$type": "path", "value": ["videos", 5] },
                "10": { "$type": "path", "value": ["videos", 6] },
                "11": { "$type": "path", "value": ["videos", 7] },
                "12": { "$type": "path", "value": ["videos", 8] },
                "13": { "$type": "path", "value": ["videos", 9] },
                "14": { "$type": "path", "value": ["videos", 10] },
                "15": { "$type": "path", "value": ["videos", 11] },
                "16": { "$type": "path", "value": ["videos", 12] },
                "17": { "$type": "path", "value": ["videos", 13] },
                "18": { "$type": "path", "value": ["videos", 14] },
                "19": { "$type": "path", "value": ["videos", 15] },
                "20": { "$type": "path", "value": ["videos", 16] },
                "21": { "$type": "path", "value": ["videos", 17] },
                "22": { "$type": "path", "value": ["videos", 18] },
                "23": { "$type": "path", "value": ["videos", 19] },
                "24": { "$type": "path", "value": ["videos", 20] },
                "25": { "$type": "path", "value": ["videos", 21] },
                "26": { "$type": "path", "value": ["videos", 22] },
                "27": { "$type": "path", "value": ["videos", 23] },
                "28": { "$type": "path", "value": ["videos", 24] },
                "29": { "$type": "path", "value": ["videos", 25] },
                "30": { "$type": "path", "value": ["videos", 26] },
                "31": { "$type": "path", "value": ["videos", 27] },
                "32": { "$type": "path", "value": ["videos", 28] },
                "33": { "$type": "path", "value": ["videos", 29] }
            },
            "def": {
                "$size": 6,
                "0": { "$type": "path", "value": ["videos", 888] },
                "1": { "$type": "path", "value": ["videos", 999] },
                "2": { "$type": "path", "value": ["videos", 542] }
            },
            "sentinel-list": {
                "$size": 104,
                "0": {
                    "$size": 52,
                    "$type": "path",
                    "value": ["videos", 333]
                },
                "1": {
                    "$size": 52,
                    "$type": "path",
                    "value": ["videos", "sentinel"]
                }
            },
            "sentinel-list-2": {
                "$size": 52,
                "0": {
                    "$size": 52,
                    "$type": "path",
                    "value": ["videos", 733]
                }
            },
            "1x5x": {
                "$size": 4,
                "0": { "$type": "path", "value": ["videos", 553] },
                "1": { "$type": "path", "value": ["videos", 5522] }
            },
            "my-list": { "$type": "path", "value": ["lists", "1x5x"] },
            "error-list": {
                "$size": 51,
                "$type": "error",
                "value": "Red is the new Black"
            },
            "error-list-2": {
                "$size": 51,
                "$type": "error",
                "value": "House of Pain"
            },
            "expired-list": {
                "$size": 51,
                "$type": "sentinel",
                "$expires": expiredTimestamp,
                "value": {
                    "0": { "$type": "path", "value": ["videos", 333] },
                    "1": { "$type": "path", "value": ["videos", "sentinel"] }
                }
            },
            "to-error-list": { "$type": "path", "value": ["lists", "error-list-2"] },
            "to-missing-list": { "$type": "path", "value": ["lists", "missing-list-2"] },
            "to-expired-list": {
                "$size": 52,
                "$type": "path",
                "value": ["lists", "expired-list"]
            },
            "future-expired-list": {
                "$type": "sentinel",
                "$expires": Date.now() + 100000,
                "$size": 51,
                "value": {
                    "0": { "$type": "path", "value": ["videos", 1234] }
                }
            },
            "to-sentinel-list": {
                "$size": 52,
                "$type": "path",
                "value": ["lists", "sentinel-list-2"]
            }
        },
        "videos": {
            "$size": 732,
            "0": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 0",
                        "url": "/movies/0"
                    }
                }
            },
            "1": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 1",
                        "url": "/movies/1"
                    }
                }
            },
            "2": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 2",
                        "url": "/movies/2"
                    }
                }
            },
            "3": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 3",
                        "url": "/movies/3"
                    }
                }
            },
            "4": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 4",
                        "url": "/movies/4"
                    }
                }
            },
            "5": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 5",
                        "url": "/movies/5"
                    }
                }
            },
            "6": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 6",
                        "url": "/movies/6"
                    }
                }
            },
            "7": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 7",
                        "url": "/movies/7"
                    }
                }
            },
            "8": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 8",
                        "url": "/movies/8"
                    }
                }
            },
            "9": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 9",
                        "url": "/movies/9"
                    }
                }
            },
            "10": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 10",
                        "url": "/movies/10"
                    }
                }
            },
            "11": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 11",
                        "url": "/movies/11"
                    }
                }
            },
            "12": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 12",
                        "url": "/movies/12"
                    }
                }
            },
            "13": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 13",
                        "url": "/movies/13"
                    }
                }
            },
            "14": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 14",
                        "url": "/movies/14"
                    }
                }
            },
            "15": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 15",
                        "url": "/movies/15"
                    }
                }
            },
            "16": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 16",
                        "url": "/movies/16"
                    }
                }
            },
            "17": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 17",
                        "url": "/movies/17"
                    }
                }
            },
            "18": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 18",
                        "url": "/movies/18"
                    }
                }
            },
            "19": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 19",
                        "url": "/movies/19"
                    }
                }
            },
            "20": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 20",
                        "url": "/movies/20"
                    }
                }
            },
            "21": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 21",
                        "url": "/movies/21"
                    }
                }
            },
            "22": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 22",
                        "url": "/movies/22"
                    }
                }
            },
            "23": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 23",
                        "url": "/movies/23"
                    }
                }
            },
            "24": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 24",
                        "url": "/movies/24"
                    }
                }
            },
            "25": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 25",
                        "url": "/movies/25"
                    }
                }
            },
            "26": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 26",
                        "url": "/movies/26"
                    }
                }
            },
            "27": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 27",
                        "url": "/movies/27"
                    }
                }
            },
            "28": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 28",
                        "url": "/movies/28"
                    }
                }
            },
            "29": {
                "$size": 10,
                "summary": {
                    "$size": 51,
                    "$type": "sentinel",
                    "value": {
                        "title": "Additional Title 29",
                        "url": "/movies/29"
                    }
                }
            },
            "1234": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "sentinel",
                    "value": {
                        "title": "House of Cards",
                        "url": "/movies/1234"
                    }
                }
            },
            "333": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "sentinel",
                    "value": {
                        "title": "Terminator 2",
                        "url": "/movies/333"
                    }
                }
            },
            "733": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "sentinel",
                    "value": {
                        "title": "Total Recall (Without Colin Farrell)",
                        "url": "/movies/733"
                    }
                }
            },
            "553": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "sentinel",
                    "value": {
                        "title": "Running Man",
                        "url": "/movies/553"
                    }
                }
            },
            "766": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "sentinel",
                    "value": {
                        "title": "Terminator 3",
                        "url": "/movies/766"
                    }
                }
            },
            "888": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "sentinel",
                    "value": {
                        "title": "Terminator Salvation",
                        "url": "/movies/888"
                    }
                }
            },
            "999": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "sentinel",
                    "value": {
                        "title": "Jingle All the Way",
                        "url": "/movies/999"
                    }
                }
            },
            "4422": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "sentinel",
                    "value": {
                        "title": "Beverly Hills Ninja",
                        "url": "/movies/4422"
                    }
                }
            },
            "7531": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "sentinel",
                    "value": {
                        "title": "Kindergarten Cop",
                        "url": "/movies/7531"
                    }
                }
            },
            "5522": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "sentinel",
                    "value": {
                        "title": "Junior",
                        "url": "/movies/5522"
                    }
                }
            },
            "6420": {
                "$size": 10,
                "summary": {
                    "$size": 10,
                    "$type": "sentinel",
                    "value": {
                        "title": "Commando",
                        "url": "/movies/6420"
                    }
                }
            },
            "9999": {
                "summary": "video 9999 summary"
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
                "$type": "sentinel",
                "value": 'expired'
            },
            "expiredBranchBy0": {
                "$size": 51,
                "$expires": 0,
                "$type": "sentinel",
                "value": 'expired'
            },
            "errorBranch": {
                "$size": 51,
                "$type": "error",
                "value": "I am yelling timber."
            },
            "542": {
                "$size": 10,
                "video-item": {
                    "$size": 10,
                    "summary": {
                        "$size": 10,
                        "$type": "sentinel",
                        "value": {
                            "title": "Conan, The Barbarian",
                            "url": "/movies/6420"
                        }
                    }
                }
            },
            "3355": {
                "$size": 26,
                "summary": {
                    "$size": 10,
                    "$type": "sentinel",
                    "value": {
                        "title": "Conan, The Destroyer",
                        "url": "/movies/3355"
                    }
                },
                "art": {
                    "$size": 16,
                    "$type": "sentinel",
                    "value": {
                        "box-shot": "www.cdn.com/3355"
                    }
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

Cache.PathValues = function() {
    return {
        genreList: {
            2: {
                path: ['genreList', 2, null],
                value: {
                    message: 'Red is the new Black'
                }
            }

        }
    };
};

module.exports = Cache;
