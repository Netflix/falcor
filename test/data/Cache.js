var expiredTimestamp = Date.now() - 100;
var $path = require('./../../lib/types/ref');
var $atom = require('./../../lib/types/atom');
var $error = require('./../../lib/types/error');

var Cache = function() {
    return {
        "movies": { "$type": $path, "value": ['videos'] },
        "genreList": {
            "-1": { "$type": $path, "value": ["lists", "def"] },
            "0":  { "$type": $path, "value": ["lists", "abcd"] },
            "1":  { "$type": $path, "value": ["lists", "my-list"] },
            "2":  { "$type": $path, "value": ["lists", "error-list"] },
            "3":  { "$type": $path, "value": ["lists", "atom-list"] },
            "4":  { "$type": $path, "value": ["lists", "missing-list"] },
            "5":  { "$type": $path, "value": ["lists", "to-error-list"] },
            "6":  { "$type": $path, "value": ["lists", "to-missing-list"] },
            "7":  { "$type": $path, "value": ["lists", "to-atom-list"] },
            "8":  { "$type": $path, "value": ["lists", "expired-list"] },
            "9":  { "$type": $path, "value": ["lists", "to-expired-list"] },
            "10": { "$type": $path, "value": ["videos", 1234, "summary"] },
            "11": { "$type": $path, "value": ["lists", "missing-branch-link", "summary"] },
            "12": { "$type": $path, "value": ["lists", "future-expired-list"] },
            "13": { "$type": $path, "value": ["missing", 12341234] },
            "inner-reference": { "$type": $path, "value": ['movies', 1234] },
            $atom: {
                "$type": $path,
                "value": ["lists", "to-atom-list"]
            },
            "branch-miss": { "$type": $path, "value": ["does", "not", "exist"] }
        },
        "lists": {
            "abcd": {
                "-1": { "$type": $path, "value": ["videos", 4422] },
                "0":  { "$type": $path, "value": ["videos", 1234] },
                "1":  { "$type": $path, "value": ["videos", 766] },
                "2":  { "$type": $path, "value": ["videos", 7531] },
                "3":  { "$type": $path, "value": ["videos", 6420] },
                "4":  { "$type": $path, "value": ["videos", 0] },
                "5":  { "$type": $path, "value": ["videos", 1] },
                "6":  { "$type": $path, "value": ["videos", 2] },
                "7":  { "$type": $path, "value": ["videos", 3] },
                "8":  { "$type": $path, "value": ["videos", 4] },
                "9":  { "$type": $path, "value": ["videos", 5] },
                "10": { "$type": $path, "value": ["videos", 6] },
                "11": { "$type": $path, "value": ["videos", 7] },
                "12": { "$type": $path, "value": ["videos", 8] },
                "13": { "$type": $path, "value": ["videos", 9] },
                "14": { "$type": $path, "value": ["videos", 10] },
                "15": { "$type": $path, "value": ["videos", 11] },
                "16": { "$type": $path, "value": ["videos", 12] },
                "17": { "$type": $path, "value": ["videos", 13] },
                "18": { "$type": $path, "value": ["videos", 14] },
                "19": { "$type": $path, "value": ["videos", 15] },
                "20": { "$type": $path, "value": ["videos", 16] },
                "21": { "$type": $path, "value": ["videos", 17] },
                "22": { "$type": $path, "value": ["videos", 18] },
                "23": { "$type": $path, "value": ["videos", 19] },
                "24": { "$type": $path, "value": ["videos", 20] },
                "25": { "$type": $path, "value": ["videos", 21] },
                "26": { "$type": $path, "value": ["videos", 22] },
                "27": { "$type": $path, "value": ["videos", 23] },
                "28": { "$type": $path, "value": ["videos", 24] },
                "29": { "$type": $path, "value": ["videos", 25] },
                "30": { "$type": $path, "value": ["videos", 26] },
                "31": { "$type": $path, "value": ["videos", 27] },
                "32": { "$type": $path, "value": ["videos", 28] },
                "33": { "$type": $path, "value": ["videos", 29] },
                "34": { "$type": $path, "value": ["videos", 30] },
                "35": { "$type": $path, "value": ["videos", 31] },
                "36": { "$type": $path, "value": ["videos", 32] },
                "37": { "$type": $path, "value": ["videos", 33] },
                "38": { "$type": $path, "value": ["videos", 34] },
                "39": { "$type": $path, "value": ["videos", 35] },
                "40": { "$type": $path, "value": ["videos", 36] }
            },
            "def": {
                "0": { "$type": $path, "value": ["videos", 888] },
                "1": { "$type": $path, "value": ["videos", 999] },
                "2": { "$type": $path, "value": ["videos", 542] }
            },
            "atom-list": {
                "0": {
                    "$size": 52,
                    "$type": $path,
                    "value": ["videos", 333]
                },
                "1": {
                    "$size": 52,
                    "$type": $path,
                    "value": ["videos", $atom]
                }
            },
            "atom-list-2": {
                "0": {
                    "$size": 52,
                    "$type": $path,
                    "value": ["videos", 733]
                }
            },
            "1x5x": {
                "0": { "$type": $path, "value": ["videos", 553] },
                "1": { "$type": $path, "value": ["videos", 5522] }
            },
            "my-list": { "$type": $path, "value": ["lists", "1x5x"] },
            "error-list": {
                "$size": 51,
                "$type": $error,
                "value": "Red is the new Black"
            },
            "error-list-2": {
                "$size": 51,
                "$type": $error,
                "value": "House of Pain"
            },
            "expired-list": {
                "$size": 51,
                "$type": $atom,
                "$expires": expiredTimestamp,
                "value": {
                    "0": { "$type": $path, "value": ["videos", 333] },
                    "1": { "$type": $path, "value": ["videos", $atom] }
                }
            },
            "to-error-list": { "$type": $path, "value": ["lists", "error-list-2"] },
            "to-missing-list": { "$type": $path, "value": ["lists", "missing-list-2"] },
            "to-expired-list": {
                "$size": 52,
                "$type": $path,
                "value": ["lists", "expired-list"]
            },
            "future-expired-list": {
                "$type": $atom,
                "$expires": Date.now() + 100000,
                "$size": 51,
                "value": {
                    "0": { "$type": $path, "value": ["videos", 1234] }
                }
            },
            "to-atom-list": {
                "$size": 52,
                "$type": $path,
                "value": ["lists", "atom-list-2"]
            }
        },
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
            },
            "1": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 1",
                        "url": "/movies/1"
                    }
                }
            },
            "2": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 2",
                        "url": "/movies/2"
                    }
                }
            },
            "3": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 3",
                        "url": "/movies/3"
                    }
                }
            },
            "4": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 4",
                        "url": "/movies/4"
                    }
                }
            },
            "5": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 5",
                        "url": "/movies/5"
                    }
                }
            },
            "6": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 6",
                        "url": "/movies/6"
                    }
                }
            },
            "7": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 7",
                        "url": "/movies/7"
                    }
                }
            },
            "8": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 8",
                        "url": "/movies/8"
                    }
                }
            },
            "9": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 9",
                        "url": "/movies/9"
                    }
                }
            },
            "10": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 10",
                        "url": "/movies/10"
                    }
                }
            },
            "11": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 11",
                        "url": "/movies/11"
                    }
                }
            },
            "12": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 12",
                        "url": "/movies/12"
                    }
                }
            },
            "13": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 13",
                        "url": "/movies/13"
                    }
                }
            },
            "14": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 14",
                        "url": "/movies/14"
                    }
                }
            },
            "15": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 15",
                        "url": "/movies/15"
                    }
                }
            },
            "16": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 16",
                        "url": "/movies/16"
                    }
                }
            },
            "17": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 17",
                        "url": "/movies/17"
                    }
                }
            },
            "18": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 18",
                        "url": "/movies/18"
                    }
                }
            },
            "19": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 19",
                        "url": "/movies/19"
                    }
                }
            },
            "20": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 20",
                        "url": "/movies/20"
                    }
                }
            },
            "21": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 21",
                        "url": "/movies/21"
                    }
                }
            },
            "22": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 22",
                        "url": "/movies/22"
                    }
                }
            },
            "23": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 23",
                        "url": "/movies/23"
                    }
                }
            },
            "24": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 24",
                        "url": "/movies/24"
                    }
                }
            },
            "25": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 25",
                        "url": "/movies/25"
                    }
                }
            },
            "26": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 26",
                        "url": "/movies/26"
                    }
                }
            },
            "27": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 27",
                        "url": "/movies/27"
                    }
                }
            },
            "28": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 28",
                        "url": "/movies/28"
                    }
                }
            },
            "29": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 29",
                        "url": "/movies/29"
                    }
                }
            },
            "30": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 30",
                        "url": "/movies/30"
                    }
                }
            },
            "31": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 31",
                        "url": "/movies/31"
                    }
                }
            },
            "32": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 32",
                        "url": "/movies/32"
                    }
                }
            },
            "33": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 33",
                        "url": "/movies/33"
                    }
                }
            },
            "34": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 34",
                        "url": "/movies/34"
                    }
                }
            },
            "35": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 35",
                        "url": "/movies/35"
                    }
                }
            },
            "36": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Additional Title 36",
                        "url": "/movies/36"
                    }
                }
            },
            "1234": {
                "title": {
                    "$size": 51,
                    "$type": $atom,
                    "value": "House of Cards"
                },
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "House of Cards",
                        "url": "/movies/1234"
                    }
                }
            },
            "333": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Terminator 2",
                        "url": "/movies/333"
                    }
                }
            },
            "733": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Total Recall (Without Colin Farrell)",
                        "url": "/movies/733"
                    }
                }
            },
            "553": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Running Man",
                        "url": "/movies/553"
                    }
                }
            },
            "766": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Terminator 3",
                        "url": "/movies/766"
                    }
                }
            },
            "888": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Terminator Salvation",
                        "url": "/movies/888"
                    }
                }
            },
            "999": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Jingle All the Way",
                        "url": "/movies/999"
                    }
                }
            },
            "4422": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Beverly Hills Ninja",
                        "url": "/movies/4422"
                    }
                }
            },
            "7531": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Kindergarten Cop",
                        "url": "/movies/7531"
                    }
                }
            },
            "5522": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Junior",
                        "url": "/movies/5522"
                    }
                }
            },
            "6420": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Commando",
                        "url": "/movies/6420"
                    }
                }
            },
            $atom: {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Marco Polo",
                        "url": "/movies/atom"
                    }
                }
            },
            "expiredLeafByTimestamp": {
                "summary": {
                    "$size": 51,
                    "$expires": expiredTimestamp,
                    "$type": $atom,
                    "value": {
                        "sad": "panda"
                    }
                }
            },
            "expiredLeafBy0": {
                "summary": {
                    "$expires": 0,
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "sad": "tunafish"
                    }
                }
            },
            "expiredBranchByTimestamp": {
                "$size": 51,
                "$expires": expiredTimestamp,
                "$type": $atom,
                "value": 'expired'
            },
            "expiredBranchBy0": {
                "$size": 51,
                "$expires": 0,
                "$type": $atom,
                "value": 'expired'
            },
            "errorBranch": {
                "$size": 51,
                "$type": $error,
                "value": "I am yelling timber."
            },
            "542": {
                "video-item": {
                    "summary": {
                        "$size": 51,
                        "$type": $atom,
                        "value": {
                            "title": "Conan, The Barbarian",
                            "url": "/movies/6420"
                        }
                    }
                }
            },
            "3355": {
                "summary": {
                    "$size": 51,
                    "$type": $atom,
                    "value": {
                        "title": "Conan, The Destroyer",
                        "url": "/movies/3355"
                    }
                },
                "art": {
                    "$size": 16,
                    "$type": $atom,
                    "value": {
                        "box-shot": "www.cdn.com/3355"
                    }
                }
            },
            "missingValue": { "$type": $atom },
            "missingSummary": {
                "art": {
                    "$size": 16,
                    "$type": $atom,
                    "value": {
                        "box-shot": "www.cdn.com/missing-summary"
                    }
                }
            }
        },
        "misc": {
            "uatom": {
                "$size": 51,
                "$type": $atom,
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
