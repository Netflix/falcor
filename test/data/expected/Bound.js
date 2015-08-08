module.exports = function() {
    return {
        multipleQueries: {
            getPathValues: {
                count: 2,
                query: [['summary'], ['art']]
            },
            getPathMaps: {
                count: 2,
                query: [{json: {summary: null}}, {json: {art: null}}]
            },
            AsValues: {
                values: [{
                    'path': ['summary'],
                    'value': {
                        "title": "Conan, The Destroyer",
                        "url": "/movies/3355"
                    }
                }, {
                    'path': ['art'],
                    'value': {
                        "box-shot": "www.cdn.com/3355"
                    }
                }]
            },
            AsJSON: {
                values: [{
                    json: {
                        "title": "Conan, The Destroyer",
                        "url": "/movies/3355"
                    }
                }, {
                    json: {
                        "box-shot": "www.cdn.com/3355"
                    }
                }]
            },
            AsPathMap: {
                values: [{
                    json: {
                        summary: {
                            "title": "Conan, The Destroyer",
                            "url": "/movies/3355"
                        },
                        art: {
                            "box-shot": "www.cdn.com/3355"
                        }
                    }
                }]
            }
        },
        directValue: {
            getPathValues: {
                count: 0,
                query: [['summary']]
            },
            getPathMaps: {
                query: [{json: {summary: null}}]
            },

            AsValues: {
                values: [{
                    'path': ['summary'],
                    'value': {
                        'title': 'House of Cards',
                        'url': '/movies/1234'
                    }
                }]
            },

            AsJSON: {
                values: [{
                    json: {
                        'title': 'House of Cards',
                        'url': '/movies/1234'
                    }
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        summary: {
                            'title': 'House of Cards',
                            'url': '/movies/1234'
                        }
                    }
                }]
            }
        },
        missingValueWithReference: {
            getPathValues: {
                query: [[4, 'summary']]
            },
            getPathMaps: {
                query: [{json: {4: {summary: null}}}]
            },

            optimizedMissingPaths: [
                ['lists', 'missing-list', 'summary']
            ],

            AsValues: {
                values: []
            },

            AsJSON: {
                values: [{}]
            },

            AsPathMap: {
                values: [{}]
            }
        },
        missingValue: {
            getPathValues: {
                query: [['summary']]
            },
            getPathMaps: {
                query: [{json:{summary: null}}]
            },

            optimizedMissingPaths: [
                ['videos', 'missingSummary', 'summary']
            ],

            AsValues: {
                values: []
            },

            AsJSON: {
                values: [{}]
            },

            AsPathMap: {
                values: [{}]
            }
        },
        toLeafNode: {
            getPathValues: {
                query: [[]]
            },
            getPathMaps: {
                query: [{json:{}}]
            },

            optimizedPaths: [
                ['videos', '1234', 'summary']
            ],

            AsValues: {
                values: [{
                    'path': [],
                    'value': {
                        'title': 'House of Cards',
                        'url': '/movies/1234'
                    }
                }]
            },

            AsJSON: {
                values: [{
                    json: {
                        'title': 'House of Cards',
                        'url': '/movies/1234'
                    }
                }]
            },

            AsPathMap: {
                values: [{
                    json: {
                        'title': 'House of Cards',
                        'url': '/movies/1234'
                    }
                }]
            }
        }
    };
};
