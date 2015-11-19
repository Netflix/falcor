var Model = require("./../../../lib").Model;
var noOp = function() {};
var cacheGenerator = require('./../../../test/CacheGenerator');
var cache = cacheGenerator(0, 50);
var model = new Model();
var root = model._root;
var head = require('./../../../lib/internal/head');
var tail = require('./../../../lib/internal/tail');
var next = require('./../../../lib/internal/next');
var prev = require('./../../../lib/internal/prev');
var set = require('./../../../lib/set').setJSONGraphs;

module.exports = function setJSONGraphTests(out, count) {
    count = count || 5;
    out = out || {};

    for (var i = 0; i < count; ++i) {
        out['set.merge row' + i] = insertJSONGraphRow;
    }

    return out;
};

insertJSONGraphRow();
function insertJSONGraphRow() {
    root.cache = {};
    root[head] = null;
    root[tail] = null;
    root[prev] = null;
    root[next] = null;
    root.expired = [];

    set(model, getJSONGraphRow(), null, null);
}

function getJSONGraphRow() {
    return [{
        "jsonGraph": {
            "lolomo": {
                "$type": "ref",
                "value": [
                    "lolomos",
                    "1234"
                ],
                "$size": 52
            },
            "lolomos": {
                "1234": {
                    "0": {
                        "$type": "ref",
                        "value": [
                            "lists",
                            "A"
                        ],
                        "$size": 52
                    }
                }
            },
            "lists": {
                "A": {
                    "0": {
                        "item": {
                            "$type": "ref",
                            "value": [
                                "videos",
                                "0"
                            ],
                            "$size": 52
                        }
                    },
                    "1": {
                        "item": {
                            "$type": "ref",
                            "value": [
                                "videos",
                                "1"
                            ],
                            "$size": 52
                        }
                    },
                    "2": {
                        "item": {
                            "$type": "ref",
                            "value": [
                                "videos",
                                "2"
                            ],
                            "$size": 52
                        }
                    },
                    "3": {
                        "item": {
                            "$type": "ref",
                            "value": [
                                "videos",
                                "3"
                            ],
                            "$size": 52
                        }
                    },
                    "4": {
                        "item": {
                            "$type": "ref",
                            "value": [
                                "videos",
                                "4"
                            ],
                            "$size": 52
                        }
                    },
                    "5": {
                        "item": {
                            "$type": "ref",
                            "value": [
                                "videos",
                                "5"
                            ],
                            "$size": 52
                        }
                    },
                    "6": {
                        "item": {
                            "$type": "ref",
                            "value": [
                                "videos",
                                "6"
                            ],
                            "$size": 52
                        }
                    },
                    "7": {
                        "item": {
                            "$type": "ref",
                            "value": [
                                "videos",
                                "7"
                            ],
                            "$size": 52
                        }
                    },
                    "8": {
                        "item": {
                            "$type": "ref",
                            "value": [
                                "videos",
                                "8"
                            ],
                            "$size": 52
                        }
                    },
                    "9": {
                        "item": {
                            "$type": "ref",
                            "value": [
                                "videos",
                                "9"
                            ],
                            "$size": 52
                        }
                    }
                }
            },
            "videos": {
                "0": {
                    "title": {
                        "$type": "atom",
                        "value": "Video 0",
                        "$size": 57
                    }
                },
                "1": {
                    "title": {
                        "$type": "atom",
                        "value": "Video 1",
                        "$size": 57
                    }
                },
                "2": {
                    "title": {
                        "$type": "atom",
                        "value": "Video 2",
                        "$size": 57
                    }
                },
                "3": {
                    "title": {
                        "$type": "atom",
                        "value": "Video 3",
                        "$size": 57
                    }
                },
                "4": {
                    "title": {
                        "$type": "atom",
                        "value": "Video 4",
                        "$size": 57
                    }
                },
                "5": {
                    "title": {
                        "$type": "atom",
                        "value": "Video 5",
                        "$size": 57
                    }
                },
                "6": {
                    "title": {
                        "$type": "atom",
                        "value": "Video 6",
                        "$size": 57
                    }
                },
                "7": {
                    "title": {
                        "$type": "atom",
                        "value": "Video 7",
                        "$size": 57
                    }
                },
                "8": {
                    "title": {
                        "$type": "atom",
                        "value": "Video 8",
                        "$size": 57
                    }
                },
                "9": {
                    "title": {
                        "$type": "atom",
                        "value": "Video 9",
                        "$size": 57
                    }
                }
            }
        },
        "paths": [
            ['lolomo', 0, {to:9}, 'item', 'title']
        ]
    }];
}
