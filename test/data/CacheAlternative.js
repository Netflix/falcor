var expiredTimestamp = Date.now() - 100;
var Cache = function() {
    return {
        "genreList": {
            "0": {$type: 'reference', value: ["lists", "abcd"]}
        },
        "lists": {
            "abcd": {
                "0": {$type: 'reference', value: ["videos", 1234]},
                "1": {$type: 'reference', value: ["videos", 766]},
                "2": {$type: 'reference', value: ["videos", 7531]},
                "3": {$type: 'reference', value: ["videos", 6420]},
                "4": {$type: 'reference', value: ["videos", 0]},
                "5": {$type: 'reference', value: ["videos", 1]},
                "6": {$type: 'reference', value: ["videos", 2]},
                "7": {$type: 'reference', value: ["videos", 3]},
                "8": {$type: 'reference', value: ["videos", 4]},
                "9": {$type: 'reference', value: ["videos", 5]}
            }
        },
        "videos": {
            "0": {
                "summary": {
                    "$type": "atom",
                    "value": {
                        "title": "Additional Title 0",
                        "url": "/movies/0"
                    }
                }
            },
            "1": {
                "summary": {
                    "$type": "atom",
                    "value": {
                        "title": "Additional Title 1",
                        "url": "/movies/1"
                    }
                }
            },
            "2": {
                "summary": {
                    "$type": "atom",
                    "value": {
                        "title": "Additional Title 2",
                        "url": "/movies/2"
                    }
                }
            },
            "3": {
                "summary": {
                    "$type": "atom",
                    "value": {
                        "title": "Additional Title 3",
                        "url": "/movies/3"
                    }
                }
            },
            "4": {
                "summary": {
                    "$type": "atom",
                    "value": {
                        "title": "Additional Title 4",
                        "url": "/movies/4"
                    }
                }
            },
            "5": {
                "summary": {
                    "$type": "atom",
                    "value": {
                        "title": "Additional Title 5",
                        "url": "/movies/5"
                    }
                }
            },
            "1234": {
                "summary": {
                    "$type": "atom",
                    "value": {
                        "title": "House of Cards",
                        "url": "/movies/1234"
                    }
                }
            },
            "766": {
                "summary": {
                    "$type": "atom",
                    "value": {
                        "title": "Terminator 3",
                        "url": "/movies/766"
                    }
                }
            },
            "7531": {
                "summary": {
                    "$type": "atom",
                    "value": {
                        "title": "Kindergarten Cop",
                        "url": "/movies/7531"
                    }
                }
            },
            "6420": {
                "summary": {
                    "$type": "atom",
                    "value": {
                        "title": "Commando",
                        "url": "/movies/6420"
                    }
                }
            }
        }
    };
};


module.exports = Cache;

