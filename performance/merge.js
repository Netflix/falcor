
module.exports = {
    startup: startup,
    scrollingGallery: scrollingGallery
}

function startup(model, format) {
    var envelopes = [startupRequest()];
    switch (format) {
        case 'JSON':
            return function() {
                model._setJSONGsAsJSON(model, envelopes, [{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{},{}]);
            };
        case 'JSONG':
            return function() {
                model._setJSONGsAsJSONG(model, envelopes, [{}]);
            };
        case 'PathMap':
            return function() {
                model._setJSONGsAsPathMap(model, envelopes, [{}]);
            };
        case 'Value':
            return function() {
                model._setJSONGsAsValues(model, envelopes, []);
            };
    }
}

function scrollingGallery(model, format) {
    var envelopes = [scrollingGalleryRequest()];
    switch (format) {
        case 'JSON':
            return function() {
                model._setJSONGsAsJSON(model, envelopes, [{}]);
            };
        case 'JSONG':
            return function() {
                model._setJSONGsAsJSONG(model, envelopes, [{}]);
            };
        case 'PathMap':
            return function() {
                model._setJSONGsAsPathMap(model, envelopes, [{}]);
            };
        case 'Value':
            return function() {
                model._setJSONGsAsValues(model, envelopes, []);
            };
    }
}

function scrollingGalleryRequest() {
    return {
        "jsong": {
            "lists": {
                "d5ceb1ba-0dbb-4c53-b428-005538056b32_2e067e61-4007-4985-9e2e-f0b2ebbebba1": {
                    "0": {
                        "item": ["videos", "80037657"]
                    },
                    "1": {
                        "item": ["videos", "80007225"]
                    },
                    "2": {
                        "item": ["videos", "70260729"]
                    }
                },
                "d5ceb1ba-0dbb-4c53-b428-005538056b32_f08fe3c6-52ac-40a2-8380-622281ef5a7a": {
                    "0": {
                        "item": ["videos", "80025384"]
                    },
                    "1": {
                        "item": ["videos", "80021955"]
                    },
                    "2": {
                        "item": ["videos", "70178217"]
                    },
                    "3": {
                        "item": ["videos", "80010655"]
                    }
                },
                "d5ceb1ba-0dbb-4c53-b428-005538056b32_e8f0b4bc-cc22-43ce-895e-9cf892c0a7bd": {
                    "0": {
                        "item": ["videos", "80037657"]
                    },
                    "1": {
                        "item": ["videos", "70272726"]
                    },
                    "2": {
                        "item": ["videos", "80002479"]
                    },
                    "3": {
                        "item": ["videos", "80007225"]
                    },
                    "4": {
                        "item": ["videos", "70180183"]
                    },
                    "5": {
                        "item": ["videos", "70260729"]
                    },
                    "6": {
                        "item": ["videos", "80038296"]
                    },
                    "7": {
                        "item": ["videos", "70140358"]
                    },
                    "8": {
                        "item": ["videos", "70285785"]
                    },
                    "9": {
                        "item": ["videos", "70307108"]
                    },
                    "10": {
                        "item": ["videos", "80021955"]
                    }
                },
                "d5ceb1ba-0dbb-4c53-b428-005538056b32_f95c1b7a-5670-4146-a9e9-43038269d9dc": {
                    "0": {
                        "item": ["videos", "80038296"]
                    },
                    "1": {
                        "item": ["videos", "70260729"]
                    },
                    "2": {
                        "item": ["videos", "70140358"]
                    },
                    "3": {
                        "item": ["videos", "70242310"]
                    },
                    "4": {
                        "item": ["videos", "80003481"]
                    },
                    "5": {
                        "item": ["videos", "80020540"]
                    },
                    "6": {
                        "item": ["videos", "70155579"]
                    },
                    "7": {
                        "item": ["videos", "70302480"]
                    },
                    "8": {
                        "item": ["videos", "70290568"]
                    },
                    "9": {
                        "item": ["videos", "70299862"]
                    },
                    "10": {
                        "item": ["videos", "70200276"]
                    }
                },
                "d5ceb1ba-0dbb-4c53-b428-005538056b32_b02c1b8a-62a9-4b24-86d5-2cf87350c518": {
                    "0": {
                        "item": ["videos", "70285785"]
                    },
                    "1": {
                        "item": ["videos", "70307108"]
                    },
                    "2": {
                        "item": ["videos", "70295760"]
                    },
                    "3": {
                        "item": ["videos", "80028426"]
                    },
                    "4": {
                        "item": ["videos", "70285368"]
                    },
                    "5": {
                        "item": ["videos", "70153385"]
                    },
                    "6": {
                        "item": ["videos", "70242310"]
                    },
                    "7": {
                        "item": ["videos", "70258489"]
                    },
                    "8": {
                        "item": ["videos", "80004449"]
                    },
                    "9": {
                        "item": ["videos", "70304245"]
                    },
                    "10": {
                        "item": ["videos", "80006395"]
                    }
                },
                "d5ceb1ba-0dbb-4c53-b428-005538056b32_7bd1d487-e92f-42fb-9ab7-4a5845f4962a": {
                    "0": {
                        "item": ["videos", "80025273"]
                    },
                    "1": {
                        "item": ["videos", "80013282"]
                    },
                    "2": {
                        "item": ["videos", "70258489"]
                    },
                    "3": {
                        "item": ["videos", "80011848"]
                    },
                    "4": {
                        "item": ["videos", "70304245"]
                    },
                    "5": {
                        "item": ["videos", "80045785"]
                    },
                    "6": {
                        "item": ["videos", "80045944"]
                    },
                    "7": {
                        "item": ["videos", "80020540"]
                    },
                    "8": {
                        "item": ["videos", "70271773"]
                    },
                    "9": {
                        "item": ["videos", "80000100"]
                    },
                    "10": {
                        "item": ["videos", "80000101"]
                    }
                },
                "d5ceb1ba-0dbb-4c53-b428-005538056b32_bb415be7-abce-490b-af96-b2e10a795cd9": {
                    "0": {
                        "item": ["videos", "18907685"]
                    },
                    "1": {
                        "item": ["videos", "80044911"]
                    },
                    "2": {
                        "item": ["videos", "563104"]
                    },
                    "3": {
                        "item": ["videos", "80044740"]
                    },
                    "4": {
                        "item": ["videos", "70308063"]
                    },
                    "5": {
                        "item": ["videos", "80044741"]
                    },
                    "6": {
                        "item": ["videos", "80044092"]
                    },
                    "7": {
                        "item": ["videos", "80045945"]
                    },
                    "8": {
                        "item": ["videos", "80044910"]
                    },
                    "9": {
                        "item": ["videos", "80044909"]
                    },
                    "10": {
                        "item": ["videos", "80044739"]
                    }
                },
                "d5ceb1ba-0dbb-4c53-b428-005538056b32_d83cf2f8-7c3c-4ee1-aac1-7448f3909ce6": {
                    "0": {
                        "item": ["videos", "70099116"]
                    },
                    "1": {
                        "item": ["videos", "70267728"]
                    },
                    "2": {
                        "item": ["videos", "1181634"]
                    },
                    "3": {
                        "item": ["videos", "60022989"]
                    },
                    "4": {
                        "item": ["videos", "70075475"]
                    },
                    "5": {
                        "item": ["videos", "80005234"]
                    },
                    "6": {
                        "item": ["videos", "70110031"]
                    },
                    "7": {
                        "item": ["videos", "80000100"]
                    },
                    "8": {
                        "item": ["videos", "60034505"]
                    },
                    "9": {
                        "item": ["videos", "80000101"]
                    },
                    "10": {
                        "item": ["videos", "60029409"]
                    }
                },
                "d5ceb1ba-0dbb-4c53-b428-005538056b32_b2d1fe68-70de-4316-a958-fda271fac65b": {
                    "0": {
                        "item": ["videos", "80004478"]
                    },
                    "1": {
                        "item": ["videos", "70290568"]
                    },
                    "2": {
                        "item": ["videos", "70299862"]
                    },
                    "3": {
                        "item": ["videos", "70302480"]
                    },
                    "4": {
                        "item": ["videos", "80004534"]
                    },
                    "5": {
                        "item": ["videos", "80013282"]
                    },
                    "6": {
                        "item": ["videos", "80002621"]
                    },
                    "7": {
                        "item": ["videos", "70099116"]
                    },
                    "8": {
                        "item": ["videos", "563104"]
                    },
                    "9": {
                        "item": ["videos", "70267728"]
                    },
                    "10": {
                        "item": ["videos", "70280748"]
                    }
                },
                "d5ceb1ba-0dbb-4c53-b428-005538056b32_bd4622a2-fc53-492a-abdf-353062e5d011": {
                    "0": {
                        "item": ["videos", "80021955"]
                    },
                    "1": {
                        "item": ["videos", "70178217"]
                    }
                }
            },
            "videos": {
                "80037657": {
                    "summary": {
                        "id": 80037657,
                        "uri": "http://api.netflix.com/catalog/titles/series/80037657",
                        "type": "show",
                        "orig": true
                    }
                },
                "80007225": {
                    "summary": {
                        "id": 80007225,
                        "uri": "http://api.netflix.com/catalog/titles/series/80007225",
                        "type": "show",
                        "orig": true
                    }
                },
                "70260729": {
                    "summary": {
                        "id": 70260729,
                        "uri": "http://api.netflix.com/catalog/titles/series/70260729",
                        "type": "show"
                    }
                },
                "80025384": {
                    "summary": {
                        "id": 80025384,
                        "uri": "http://api.netflix.com/catalog/titles/series/80025384",
                        "type": "show",
                        "orig": true
                    }
                },
                "80021955": {
                    "summary": {
                        "id": 80021955,
                        "uri": "http://api.netflix.com/catalog/titles/series/80021955",
                        "type": "show",
                        "orig": true
                    }
                },
                "70178217": {
                    "summary": {
                        "id": 70178217,
                        "uri": "http://api.netflix.com/catalog/titles/series/70178217",
                        "type": "show",
                        "orig": true
                    }
                },
                "80010655": {
                    "summary": {
                        "id": 80010655,
                        "uri": "http://api.netflix.com/catalog/titles/series/80010655",
                        "type": "show",
                        "orig": true
                    }
                },
                "70272726": {
                    "summary": {
                        "id": 70272726,
                        "uri": "http://api.netflix.com/catalog/titles/series/70272726",
                        "type": "show",
                        "orig": true
                    }
                },
                "80002479": {
                    "summary": {
                        "id": 80002479,
                        "uri": "http://api.netflix.com/catalog/titles/series/80002479",
                        "type": "show",
                        "orig": true
                    }
                },
                "70180183": {
                    "summary": {
                        "id": 70180183,
                        "uri": "http://api.netflix.com/catalog/titles/series/70180183",
                        "type": "show",
                        "orig": true
                    }
                },
                "80038296": {
                    "summary": {
                        "id": 80038296,
                        "uri": "http://api.netflix.com/catalog/titles/movies/80038296",
                        "type": "movie",
                        "orig": true
                    }
                },
                "70140358": {
                    "summary": {
                        "id": 70140358,
                        "uri": "http://api.netflix.com/catalog/titles/series/70140358",
                        "type": "show",
                        "orig": true
                    }
                },
                "70285785": {
                    "summary": {
                        "id": 70285785,
                        "uri": "http://api.netflix.com/catalog/titles/series/70285785",
                        "type": "show"
                    }
                },
                "70307108": {
                    "summary": {
                        "id": 70307108,
                        "uri": "http://api.netflix.com/catalog/titles/series/70307108",
                        "type": "show",
                        "orig": true
                    }
                },
                "70242310": {
                    "summary": {
                        "id": 70242310,
                        "uri": "http://api.netflix.com/catalog/titles/series/70242310",
                        "type": "show",
                        "orig": true
                    }
                },
                "80003481": {
                    "summary": {
                        "id": 80003481,
                        "uri": "http://api.netflix.com/catalog/titles/movies/80003481",
                        "type": "movie",
                        "orig": true
                    }
                },
                "80020540": {
                    "summary": {
                        "id": 80020540,
                        "uri": "http://api.netflix.com/catalog/titles/series/80020540",
                        "type": "show",
                        "orig": true
                    }
                },
                "70155579": {
                    "summary": {
                        "id": 70155579,
                        "uri": "http://api.netflix.com/catalog/titles/series/70155579",
                        "type": "show"
                    }
                },
                "70302480": {
                    "summary": {
                        "id": 70302480,
                        "uri": "http://api.netflix.com/catalog/titles/movies/70302480",
                        "type": "movie",
                        "orig": true
                    }
                },
                "70290568": {
                    "summary": {
                        "id": 70290568,
                        "uri": "http://api.netflix.com/catalog/titles/movies/70290568",
                        "type": "movie",
                        "orig": true
                    }
                },
                "70299862": {
                    "summary": {
                        "id": 70299862,
                        "uri": "http://api.netflix.com/catalog/titles/movies/70299862",
                        "type": "movie",
                        "orig": true
                    }
                },
                "70200276": {
                    "summary": {
                        "id": 70200276,
                        "uri": "http://api.netflix.com/catalog/titles/series/70200276",
                        "type": "show"
                    }
                },
                "70295760": {
                    "summary": {
                        "id": 70295760,
                        "uri": "http://api.netflix.com/catalog/titles/series/70295760",
                        "type": "show",
                        "orig": true
                    }
                },
                "80028426": {
                    "summary": {
                        "id": 80028426,
                        "uri": "http://api.netflix.com/catalog/titles/series/80028426",
                        "type": "show",
                        "orig": true
                    }
                },
                "70285368": {
                    "summary": {
                        "id": 70285368,
                        "uri": "http://api.netflix.com/catalog/titles/series/70285368",
                        "type": "show",
                        "orig": true
                    }
                },
                "70153385": {
                    "summary": {
                        "id": 70153385,
                        "uri": "http://api.netflix.com/catalog/titles/series/70153385",
                        "type": "show",
                        "orig": true
                    }
                },
                "70258489": {
                    "summary": {
                        "id": 70258489,
                        "uri": "http://api.netflix.com/catalog/titles/series/70258489",
                        "type": "show",
                        "orig": true
                    }
                },
                "80004449": {
                    "summary": {
                        "id": 80004449,
                        "uri": "http://api.netflix.com/catalog/titles/series/80004449",
                        "type": "show",
                        "orig": true
                    }
                },
                "70304245": {
                    "summary": {
                        "id": 70304245,
                        "uri": "http://api.netflix.com/catalog/titles/series/70304245",
                        "type": "show",
                        "orig": true
                    }
                },
                "80006395": {
                    "summary": {
                        "id": 80006395,
                        "uri": "http://api.netflix.com/catalog/titles/series/80006395",
                        "type": "show",
                        "orig": true
                    }
                },
                "80025273": {
                    "summary": {
                        "id": 80025273,
                        "uri": "http://api.netflix.com/catalog/titles/series/80025273",
                        "type": "show",
                        "orig": true
                    }
                },
                "80013282": {
                    "summary": {
                        "id": 80013282,
                        "uri": "http://api.netflix.com/catalog/titles/movies/80013282",
                        "type": "movie",
                        "orig": true
                    }
                },
                "80011848": {
                    "summary": {
                        "id": 80011848,
                        "uri": "http://api.netflix.com/catalog/titles/movies/80011848",
                        "type": "movie",
                        "orig": true
                    }
                },
                "80045785": {
                    "summary": {
                        "id": 80045785,
                        "uri": "http://api.netflix.com/catalog/titles/movies/80045785",
                        "type": "movie"
                    }
                },
                "80045944": {
                    "summary": {
                        "id": 80045944,
                        "uri": "http://api.netflix.com/catalog/titles/movies/80045944",
                        "type": "movie"
                    }
                },
                "70271773": {
                    "summary": {
                        "id": 70271773,
                        "uri": "http://api.netflix.com/catalog/titles/series/70271773",
                        "type": "show",
                        "orig": true
                    }
                },
                "80000100": {
                    "summary": {
                        "id": 80000100,
                        "uri": "http://api.netflix.com/catalog/titles/movies/80000100",
                        "type": "movie"
                    }
                },
                "80000101": {
                    "summary": {
                        "id": 80000101,
                        "uri": "http://api.netflix.com/catalog/titles/series/80000101",
                        "type": "show"
                    }
                },
                "18907685": {
                    "summary": {
                        "id": 18907685,
                        "uri": "http://api.netflix.com/catalog/titles/movies/18907685",
                        "type": "movie"
                    }
                },
                "80044911": {
                    "summary": {
                        "id": 80044911,
                        "uri": "http://api.netflix.com/catalog/titles/series/80044911",
                        "type": "show"
                    }
                },
                "563104": {
                    "summary": {
                        "id": 563104,
                        "uri": "http://api.netflix.com/catalog/titles/movies/563104",
                        "type": "movie"
                    }
                },
                "80044740": {
                    "summary": {
                        "id": 80044740,
                        "uri": "http://api.netflix.com/catalog/titles/series/80044740",
                        "type": "show"
                    }
                },
                "70308063": {
                    "summary": {
                        "id": 70308063,
                        "uri": "http://api.netflix.com/catalog/titles/movies/70308063",
                        "type": "movie",
                        "orig": true
                    }
                },
                "80044741": {
                    "summary": {
                        "id": 80044741,
                        "uri": "http://api.netflix.com/catalog/titles/series/80044741",
                        "type": "show"
                    }
                },
                "80044092": {
                    "summary": {
                        "id": 80044092,
                        "uri": "http://api.netflix.com/catalog/titles/movies/80044092",
                        "type": "movie"
                    }
                },
                "80045945": {
                    "summary": {
                        "id": 80045945,
                        "uri": "http://api.netflix.com/catalog/titles/movies/80045945",
                        "type": "movie"
                    }
                },
                "80044910": {
                    "summary": {
                        "id": 80044910,
                        "uri": "http://api.netflix.com/catalog/titles/movies/80044910",
                        "type": "movie"
                    }
                },
                "80044909": {
                    "summary": {
                        "id": 80044909,
                        "uri": "http://api.netflix.com/catalog/titles/movies/80044909",
                        "type": "movie"
                    }
                },
                "80044739": {
                    "summary": {
                        "id": 80044739,
                        "uri": "http://api.netflix.com/catalog/titles/movies/80044739",
                        "type": "movie"
                    }
                },
                "70099116": {
                    "summary": {
                        "id": 70099116,
                        "uri": "http://api.netflix.com/catalog/titles/movies/70099116",
                        "type": "movie"
                    }
                },
                "70267728": {
                    "summary": {
                        "id": 70267728,
                        "uri": "http://api.netflix.com/catalog/titles/movies/70267728",
                        "type": "movie"
                    }
                },
                "1181634": {
                    "summary": {
                        "id": 1181634,
                        "uri": "http://api.netflix.com/catalog/titles/movies/1181634",
                        "type": "movie"
                    }
                },
                "60022989": {
                    "summary": {
                        "id": 60022989,
                        "uri": "http://api.netflix.com/catalog/titles/movies/60022989",
                        "type": "movie"
                    }
                },
                "70075475": {
                    "summary": {
                        "id": 70075475,
                        "uri": "http://api.netflix.com/catalog/titles/movies/70075475",
                        "type": "movie"
                    }
                },
                "80005234": {
                    "summary": {
                        "id": 80005234,
                        "uri": "http://api.netflix.com/catalog/titles/movies/80005234",
                        "type": "movie"
                    }
                },
                "70110031": {
                    "summary": {
                        "id": 70110031,
                        "uri": "http://api.netflix.com/catalog/titles/movies/70110031",
                        "type": "movie"
                    }
                },
                "60034505": {
                    "summary": {
                        "id": 60034505,
                        "uri": "http://api.netflix.com/catalog/titles/movies/60034505",
                        "type": "movie"
                    }
                },
                "60029409": {
                    "summary": {
                        "id": 60029409,
                        "uri": "http://api.netflix.com/catalog/titles/movies/60029409",
                        "type": "movie"
                    }
                },
                "80004478": {
                    "summary": {
                        "id": 80004478,
                        "uri": "http://api.netflix.com/catalog/titles/movies/80004478",
                        "type": "movie",
                        "orig": true
                    }
                },
                "80004534": {
                    "summary": {
                        "id": 80004534,
                        "uri": "http://api.netflix.com/catalog/titles/movies/80004534",
                        "type": "movie",
                        "orig": true
                    }
                },
                "80002621": {
                    "summary": {
                        "id": 80002621,
                        "uri": "http://api.netflix.com/catalog/titles/movies/80002621",
                        "type": "movie",
                        "orig": true
                    }
                },
                "70280748": {
                    "summary": {
                        "id": 70280748,
                        "uri": "http://api.netflix.com/catalog/titles/movies/70280748",
                        "type": "movie",
                        "orig": true
                    }
                }
            }
        },
        "paths": [
            ["lists", ["d5ceb1ba-0dbb-4c53-b428-005538056b32_2e067e61-4007-4985-9e2e-f0b2ebbebba1", "d5ceb1ba-0dbb-4c53-b428-005538056b32_f08fe3c6-52ac-40a2-8380-622281ef5a7a", "d5ceb1ba-0dbb-4c53-b428-005538056b32_e8f0b4bc-cc22-43ce-895e-9cf892c0a7bd", "d5ceb1ba-0dbb-4c53-b428-005538056b32_f95c1b7a-5670-4146-a9e9-43038269d9dc", "d5ceb1ba-0dbb-4c53-b428-005538056b32_b02c1b8a-62a9-4b24-86d5-2cf87350c518", "d5ceb1ba-0dbb-4c53-b428-005538056b32_7bd1d487-e92f-42fb-9ab7-4a5845f4962a", "d5ceb1ba-0dbb-4c53-b428-005538056b32_bb415be7-abce-490b-af96-b2e10a795cd9", "d5ceb1ba-0dbb-4c53-b428-005538056b32_d83cf2f8-7c3c-4ee1-aac1-7448f3909ce6", "d5ceb1ba-0dbb-4c53-b428-005538056b32_b2d1fe68-70de-4316-a958-fda271fac65b", "d5ceb1ba-0dbb-4c53-b428-005538056b32_bd4622a2-fc53-492a-abdf-353062e5d011"], {
                "from": 0,
                "to": 10
            }, "item", "summary"]
        ]
    };
}



function startupRequest() {
    return {
        "jsong": {
            "startup": {},
            "appconfig": {
                "contentRatings": {
                    "movies": "mpaa_ratings",
                    "tv": "tv_ratings"
                },
                "showDolbyLogo": false,
                "paymentHoldCheckEnabled": true,
                "clockTime": 1427150899,
                "touEnabled": false,
                "enableAudioCodecSwitch": false,
                "user": "BQAJAAEDEGHupCFfyAPTZthQoo6_lZtAN-1kcMQLDmMcUtq4dPZHEq3U_BSmZ_rgQhTz8-PS-YSW--134IhF5-WPnSWivXKjDeH7T3JkslJ2OTGGfJrZWQ..",
                "customerEventsEnabled": true,
                "planUpgradeEnabled": true,
                "nonmemberUrl": "https://tenfootui.netflix.com/htmltvui/innovation/scheduled/2015_02_17/latest/release/${NRDP_VERSION}/${DEVICE_CLASS}/${RESOLUTION}/gibbon/signupwizard.js?env=stg",
                "priceTieringEnabled": true,
                "directDebitEnabled": true,
                "paypalEnabled": true,
                "darwinLaunchDate": "1384502400000",
                "searchConsolidatedLoggingEnabled": true,
                "defaultSearchLoggingEnabled": true,
                "enhancedSubtitles": "false",
                "overrideURL": "",
                "maxSupported": false,
                "enableExitDialog": true,
                "profilesGateInactivityTimeout": 1800000,
                "nonMemberBootloader": "https://api-staging.netflix.com/apps/gibbontvui_nonmember/upgrade_policy",
                "playModeLoggingEnabled": true,
                "appSuspendEnabled": true,
                "appSuspendBackgroundStopGracePeriod": 600000,
                "disabledSsoServices": "ORANGE,BT,bt",
                "disabledSignupServices": "Signup-Service-ALPHA123",
                "deactivateBeforeSignIn": true,
                "notificationTicker": true,
                "profilesEnabled": true,
                "profilesEditingEnabled": true,
                "profilesStartupGate": true,
                "socialConnectEnabled": true,
                "socialConnectStartupEnabled": false,
                "socialUnshareEnabled": true,
                "socialEvidenceEnabled": true,
                "wizcisEnabled": true,
                "voiceAllowed": true,
                "voiceSearchAllowed": false,
                "postplayEnabled": true,
                "postplayCreditrollDisabled": false,
                "oppEnabled": true,
                "oppPrePromotionEnabled": false,
                "postplayEasterEggTitleToSimMap": {},
                "postplayEasterEggSimToAssetBaseMap": {
                    "70242311": "http://cdn-0.nflximg.com/us/ffe/htmltvui/postplayeasteregg/hoconb_final/TVUI-PostPlay_OITNB-S2-date-912x513_"
                },
                "commentaryEnabled": true,
                "mdxScriptPath": "https://secure.netflix.com/us/mobile/test/MDX/r84/mdx.js",
                "mdxDifferentUsersCanPair": false,
                "mdxMultiControllersPerTarget": false,
                "mdxTargetAdvertisementsDisabled": -1,
                "mdxVolumeEnabled": true,
                "mdxTargetAdvertisementsDisabledExplicit": false,
                "clientLoggingAllocationPercentage": 100,
                "clientLoggingMaxFlushDelay": 90000,
                "clientLoggingMaxBufferSize": 15,
                "userSessionTimeoutDuration": 300000,
                "consolidatedLoggingSpecification": {
                    "uiQOE": {
                        "uiDataRequest": {
                            "disabledChance": 0
                        }
                    }
                },
                "overrideConsolidatedLoggingSpecification": {},
                "sendNrdpLogsToConsolidatedLogging": true,
                "extensibilityListEnabled": true,
                "extensibilityOverlayEnabled": true,
                "ignoreShutdownFailure": false,
                "garbageCollectionHintingEnabled": false,
                "testdebugdefs": false
            },
            "languages": {
                "nonmember": ["en-BW"],
                "member": ["en-BW", "en-US"]
            },
            "geolocation": {
                "policy": "ALLOW",
                "country": "BW"
            },
            "user": {
                "user_id": "BQAJAAEDEGHupCFfyAPTZthQoo6_lZtAN-1kcMQLDmMcUtq4dPZHEq3U_BSmZ_rgQhTz8-PS-YSW--134IhF5-WPnSWivXKjDeH7T3JkslJ2OTGGfJrZWQ..",
                "first_name": "botswana",
                "last_name": null,
                "email": "141575399079286075@streamingprofile.netflix.com",
                "instant_queue_enabled": true,
                "is_test_account": true,
                "on_hold_due_to_payment": false,
                "holdTypeCodes": [],
                "payment_method": "",
                "show_terms_of_use": false,
                "preferred_languages": ["en-US"],
                "isAccountOwner": false,
                "social": {
                    "status": "not_connected",
                    "last_connected": 1427150899,
                    "socialEnabled": true
                },
                "membership": {
                    "formerMember": false,
                    "neverMember": false,
                    "anonymous": false
                },
                "dvd_service_allowed": false,
                "dvd_messaging_allowed": false,
                "is_uhd_enabled": false,
                "is_hd_enabled": true,
                "is_3d_enabled": true,
                "can_stream_now": true,
                "autostart_enabled": true,
                "profileName": "botswana",
                "is_first_use": false,
                "survey": {
                    "display": false
                },
                "signupCountry": "US"
            },
            "uiexperience": {
                "instant_queue_enabled": true,
                "subtitleSettings": {
                    "user": {},
                    "default": {
                        "backgroundColor": null,
                        "backgroundOpacity": "OPAQUE",
                        "characterColor": "YELLOW",
                        "characterEdgeAttributes": "DROP_SHADOW",
                        "characterEdgeColor": "BLACK",
                        "characterOpacity": "OPAQUE",
                        "characterSize": "MEDIUM",
                        "characterStyle": "PROPORTIONAL_SANS_SERIF",
                        "windowColor": null,
                        "windowOpacity": "OPAQUE"
                    }
                },
                "logMemory": true,
                "mdpRecommendButton": true,
                "kids": false,
                "activeTests": []
            },
            "lolomo": ["lolomos", "505c7708-ad48-4fef-ba67-d2486c7a78a6_ROOT"],
            "lolomos": {
                "505c7708-ad48-4fef-ba67-d2486c7a78a6_ROOT": {
                    "summary": {
                        "length": 10
                    },
                    "0": ["lists", "505c7708-ad48-4fef-ba67-d2486c7a78a6_3e7c73e4-3417-4cbd-82e9-4d843a789e76"],
                    "1": ["lists", "505c7708-ad48-4fef-ba67-d2486c7a78a6_5cfb2fe1-1b39-40b4-8d3d-c7ac2ef92871"],
                    "2": ["lists", "505c7708-ad48-4fef-ba67-d2486c7a78a6_30d9d14f-9be9-432a-8e5a-835fb555a94b"],
                    "3": ["lists", "505c7708-ad48-4fef-ba67-d2486c7a78a6_ff67e3e0-7bbb-438b-ab21-c328f92e0b43"],
                    "4": ["lists", "505c7708-ad48-4fef-ba67-d2486c7a78a6_4ba894d6-7bdd-4fda-a091-b9df6a135183"],
                    "5": ["lists", "505c7708-ad48-4fef-ba67-d2486c7a78a6_e4923468-3417-4982-8526-c2ed75ea01f7"],
                    "6": ["lists", "505c7708-ad48-4fef-ba67-d2486c7a78a6_74c87c54-977b-457c-a736-f8027a4641f2"],
                    "7": ["lists", "505c7708-ad48-4fef-ba67-d2486c7a78a6_8bb73fce-e483-4b80-b8a2-e700a996cb48"],
                    "8": ["lists", "505c7708-ad48-4fef-ba67-d2486c7a78a6_2f88e20d-b918-4ad9-ab95-85f1a11c7a0b"],
                    "9": ["lists", "505c7708-ad48-4fef-ba67-d2486c7a78a6_711b3dfb-fa2a-4623-8f5d-cbb7062806fa"],
                    "maxExperience": {}
                }
            },
            "lists": {
                "505c7708-ad48-4fef-ba67-d2486c7a78a6_3e7c73e4-3417-4cbd-82e9-4d843a789e76": {
                    "summary": {
                        "displayName": "Spotlight",
                        "length": 1,
                        "trackId": "13462260",
                        "requestId": "b1506541-8995-4f72-ba01-665322ab8672-1990822",
                        "type": "BillboardList",
                        "listContext": "billboard"
                    },
                    "billboardData": {
                        "summary": {
                            "id": 80037657,
                            "uri": "http://api.netflix.com/catalog/titles/series/80037657",
                            "isOriginal": true
                        },
                        "billboardLogo": {
                            "imageUrl": "http://cdn1.nflximg.net/webp/4781/12724781.webp"
                        },
                        "billboardForeground": {
                            "type": "BB2_OG_FOREGROUND",
                            "imageUrl": "http://cdn1.nflximg.net/webp/2647/12722647.webp"
                        },
                        "odpSkinny": {
                            "isOriginal": true,
                            "titleImageUrl": {
                                "large": "http://cdn1.nflximg.net/webp/4781/12724781.webp",
                                "small": "http://cdn0.nflximg.net/webp/4786/12724786.webp"
                            },
                            "trailers": {}
                        },
                        "detail": {
                            "title": "The Returned",
                            "year": 2015,
                            "synopsis": "Several people come back to their home town in the same week after they've been dead for years in this eerie dramatic series.",
                            "narrativeSynopsis": "When you've been dead for some years, showing up in your hometown alive and well can be really disturbing for everyone.",
                            "certificationRating": "TV-14",
                            "maturityDescription": "Parents strongly cautioned. May be unsuitable for children ages 14 and under.",
                            "type": "show",
                            "seasons": 1
                        },
                        "rating": {
                            "stars": 4.2,
                            "type": "predicted"
                        },
                        "horizontal": {
                            "url": "http://cdn1.nflximg.net/webp/7095/12927095.webp",
                            "width": 567,
                            "height": 319
                        },
                        "heroModuleImages": [{
                            "url": "http://cdn1.nflximg.net/webp/1819/12881819.webp",
                            "width": 912,
                            "height": 513
                        }, {
                            "url": "http://so1.akam.nflximg.com/soa1/234/2135451234.webp",
                            "width": 912,
                            "height": 513
                        }, {
                            "url": "http://so1.akam.nflximg.com/soa4/286/2124947286.webp",
                            "width": 912,
                            "height": 513
                        }],
                        "unbadgedHorizontal": {
                            "url": "http://cdn1.nflximg.net/webp/7095/12927095.webp",
                            "width": 567,
                            "height": 319
                        },
                        "tagline": "Watch New Episode Every Week",
                        "storiesBob": null,
                        "topMovieUri": "http://api.netflix.com/catalog/titles/series/80037657",
                        "actions": []
                    },
                    "0": {
                        "postcard": {},
                        "item": ["videos", "80037657"],
                        "evidence": {
                            "type": "hook",
                            "priority": 2,
                            "value": {
                                "kind": "Talent",
                                "text": "Co-creator of \"Lost\" Carlton Cuse developed this American version of the French TV series."
                            },
                            "tracking": {
                                "has_evidence": true,
                                "evidence": [{
                                    "type": "hooktext",
                                    "hook": "Talent"
                                }]
                            }
                        }
                    }
                },
                "505c7708-ad48-4fef-ba67-d2486c7a78a6_5cfb2fe1-1b39-40b4-8d3d-c7ac2ef92871": {
                    "summary": {
                        "displayName": "Recently Watched by botswana",
                        "length": 4,
                        "trackId": "13462100",
                        "requestId": "b1506541-8995-4f72-ba01-665322ab8672-1990822",
                        "type": "RecentlyWatchedList",
                        "listContext": "recentlyWatched",
                        "pollingMode": "selected",
                        "refreshInterval": 900000
                    }
                },
                "505c7708-ad48-4fef-ba67-d2486c7a78a6_30d9d14f-9be9-432a-8e5a-835fb555a94b": {
                    "summary": {
                        "displayName": "Popular on Netflix",
                        "length": 75,
                        "trackId": "13462050",
                        "requestId": "b1506541-8995-4f72-ba01-665322ab8672-1990822",
                        "type": "VideoList",
                        "listContext": "popularTitles"
                    }
                },
                "505c7708-ad48-4fef-ba67-d2486c7a78a6_ff67e3e0-7bbb-438b-ab21-c328f92e0b43": {
                    "summary": {
                        "displayName": "Top Picks for botswana",
                        "length": 75,
                        "trackId": "13462293",
                        "requestId": "b1506541-8995-4f72-ba01-665322ab8672-1990822",
                        "type": "VideoList",
                        "listContext": "topTen",
                        "queue_evidence": {
                            "evidenceType": "EV2"
                        }
                    }
                },
                "505c7708-ad48-4fef-ba67-d2486c7a78a6_4ba894d6-7bdd-4fda-a091-b9df6a135183": {
                    "summary": {
                        "displayName": "TV Shows",
                        "length": 12,
                        "trackId": "13462056",
                        "requestId": "b1506541-8995-4f72-ba01-665322ab8672-1990822",
                        "type": "VideoList",
                        "listContext": "genre"
                    }
                },
                "505c7708-ad48-4fef-ba67-d2486c7a78a6_e4923468-3417-4982-8526-c2ed75ea01f7": {
                    "summary": {
                        "displayName": "New Releases",
                        "length": 11,
                        "trackId": "13462061",
                        "requestId": "b1506541-8995-4f72-ba01-665322ab8672-1990822",
                        "type": "VideoList",
                        "listContext": "newRelease"
                    }
                },
                "505c7708-ad48-4fef-ba67-d2486c7a78a6_74c87c54-977b-457c-a736-f8027a4641f2": {
                    "summary": {
                        "displayName": "Recently Added",
                        "length": 13,
                        "trackId": "13462064",
                        "requestId": "b1506541-8995-4f72-ba01-665322ab8672-1990822",
                        "type": "VideoList",
                        "listContext": "recentlyAdded"
                    }
                },
                "505c7708-ad48-4fef-ba67-d2486c7a78a6_8bb73fce-e483-4b80-b8a2-e700a996cb48": {
                    "summary": {
                        "displayName": "Children & Family Movies",
                        "length": 11,
                        "trackId": "13462062",
                        "requestId": "b1506541-8995-4f72-ba01-665322ab8672-1990822",
                        "type": "VideoList",
                        "listContext": "genre"
                    }
                },
                "505c7708-ad48-4fef-ba67-d2486c7a78a6_2f88e20d-b918-4ad9-ab95-85f1a11c7a0b": {
                    "summary": {
                        "displayName": "Comedies",
                        "length": 20,
                        "trackId": "13462067",
                        "requestId": "b1506541-8995-4f72-ba01-665322ab8672-1990822",
                        "type": "VideoList",
                        "listContext": "genre"
                    }
                },
                "505c7708-ad48-4fef-ba67-d2486c7a78a6_711b3dfb-fa2a-4623-8f5d-cbb7062806fa": {
                    "summary": {
                        "displayName": "My List",
                        "length": 2,
                        "trackId": "13630398",
                        "requestId": "b1506541-8995-4f72-ba01-665322ab8672-1990822",
                        "type": "InstantQueue",
                        "listContext": "queue",
                        "refreshInterval": 15000,
                        "pollingMode": "selected"
                    }
                }
            },
            "profilesList": {
                "0": ["profiles", "5TFDFUMWOFFQTA7TNZOISHF3GY"],
                "1": ["profiles", "AVOV425CLFCA7C7FIVBEXR27TI"],
                "2": ["profiles", "434O6Q7HTRFCNGOA7KDA757CYI"],
                "3": ["profiles", "AXSAE5ZQJZBNRK2RPJJ2MRDG6M"],
                "4": ["profiles", "BELCB7HQEZAUNABBGOWSAE2VCY"],
                "summary": {
                    "length": 5
                },
                "availableAvatarsList": {
                    "0": ["avatars", "nf", "icon13"],
                    "1": ["avatars", "nf", "icon14"],
                    "2": ["avatars", "nf", "icon15"],
                    "3": ["avatars", "nf", "icon16"],
                    "4": ["avatars", "nf", "icon17"],
                    "5": ["avatars", "nf", "icon18"],
                    "6": ["avatars", "nf", "icon19"],
                    "7": ["avatars", "nf", "icon20"],
                    "8": ["avatars", "nf", "icon21"],
                    "9": ["avatars", "nf", "icon22"],
                    "10": ["avatars", "nf", "icon23"],
                    "11": ["avatars", "nf", "icon24"],
                    "summary": {
                        "length": 12
                    }
                }
            },
            "profiles": {
                "5TFDFUMWOFFQTA7TNZOISHF3GY": {
                    "avatar": ["avatars", "nf", "default"],
                    "summary": {
                        "profileName": "Paul",
                        "guid": "5TFDFUMWOFFQTA7TNZOISHF3GY",
                        "isAccountOwner": true,
                        "isFirstUse": false,
                        "isActive": false,
                        "experience": "standard",
                        "avatarName": "default",
                        "canEditCharacter": true
                    }
                },
                "AVOV425CLFCA7C7FIVBEXR27TI": {
                    "avatar": ["avatars", "nf", "icon26"],
                    "summary": {
                        "profileName": "mexico",
                        "guid": "AVOV425CLFCA7C7FIVBEXR27TI",
                        "isAccountOwner": false,
                        "isFirstUse": false,
                        "isActive": false,
                        "experience": "standard",
                        "avatarName": "icon26",
                        "canEditCharacter": true
                    }
                },
                "434O6Q7HTRFCNGOA7KDA757CYI": {
                    "avatar": ["avatars", "nf", "icon27"],
                    "summary": {
                        "profileName": "UK",
                        "guid": "434O6Q7HTRFCNGOA7KDA757CYI",
                        "isAccountOwner": false,
                        "isFirstUse": false,
                        "isActive": false,
                        "experience": "standard",
                        "avatarName": "icon27",
                        "canEditCharacter": true
                    }
                },
                "AXSAE5ZQJZBNRK2RPJJ2MRDG6M": {
                    "avatar": ["avatars", "nf", "icon28"],
                    "summary": {
                        "profileName": "belgium",
                        "guid": "AXSAE5ZQJZBNRK2RPJJ2MRDG6M",
                        "isAccountOwner": false,
                        "isFirstUse": false,
                        "isActive": false,
                        "experience": "standard",
                        "avatarName": "icon28",
                        "canEditCharacter": true
                    }
                },
                "BELCB7HQEZAUNABBGOWSAE2VCY": {
                    "avatar": ["avatars", "nf", "icon29"],
                    "summary": {
                        "profileName": "botswana",
                        "guid": "BELCB7HQEZAUNABBGOWSAE2VCY",
                        "isAccountOwner": false,
                        "isFirstUse": false,
                        "isActive": true,
                        "experience": "standard",
                        "avatarName": "icon29",
                        "canEditCharacter": true
                    }
                },
                "hasSeenPromoGate": {
                    "seen": false
                }
            },
            "avatars": {
                "nf": {
                    "default": {
                        "images": {
                            "byWidth": {
                                "32": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/32x32/PICON_025.png",
                                "64": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/64x64/PICON_025.png",
                                "80": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/80x80/PICON_025.png",
                                "100": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/100x100/PICON_025.png",
                                "112": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/112x112/PICON_025.png",
                                "160": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/160x160/PICON_025.png",
                                "200": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/200x200/PICON_025.png",
                                "320": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/320x320/PICON_025.png"
                            }
                        }
                    },
                    "icon26": {
                        "images": {
                            "byWidth": {
                                "32": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/32x32/PICON_026.png",
                                "64": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/64x64/PICON_026.png",
                                "80": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/80x80/PICON_026.png",
                                "100": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/100x100/PICON_026.png",
                                "112": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/112x112/PICON_026.png",
                                "160": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/160x160/PICON_026.png",
                                "200": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/200x200/PICON_026.png",
                                "320": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/320x320/PICON_026.png"
                            }
                        }
                    },
                    "icon27": {
                        "images": {
                            "byWidth": {
                                "32": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/32x32/PICON_027.png",
                                "64": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/64x64/PICON_027.png",
                                "80": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/80x80/PICON_027.png",
                                "100": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/100x100/PICON_027.png",
                                "112": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/112x112/PICON_027.png",
                                "160": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/160x160/PICON_027.png",
                                "200": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/200x200/PICON_027.png",
                                "320": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/320x320/PICON_027.png"
                            }
                        }
                    },
                    "icon28": {
                        "images": {
                            "byWidth": {
                                "32": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/32x32/PICON_028.png",
                                "64": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/64x64/PICON_028.png",
                                "80": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/80x80/PICON_028.png",
                                "100": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/100x100/PICON_028.png",
                                "112": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/112x112/PICON_028.png",
                                "160": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/160x160/PICON_028.png",
                                "200": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/200x200/PICON_028.png",
                                "320": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/320x320/PICON_028.png"
                            }
                        }
                    },
                    "icon29": {
                        "images": {
                            "byWidth": {
                                "32": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/32x32/PICON_029.png",
                                "64": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/64x64/PICON_029.png",
                                "80": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/80x80/PICON_029.png",
                                "100": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/100x100/PICON_029.png",
                                "112": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/112x112/PICON_029.png",
                                "160": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/160x160/PICON_029.png",
                                "200": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/200x200/PICON_029.png",
                                "320": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/320x320/PICON_029.png"
                            }
                        }
                    },
                    "icon13": {
                        "images": {
                            "byWidth": {
                                "32": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/32x32/PICON_013.png",
                                "64": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/64x64/PICON_013.png",
                                "80": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/80x80/PICON_013.png",
                                "100": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/100x100/PICON_013.png",
                                "112": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/112x112/PICON_013.png",
                                "160": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/160x160/PICON_013.png",
                                "200": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/200x200/PICON_013.png",
                                "320": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/320x320/PICON_013.png"
                            }
                        },
                        "summary": {
                            "name": "icon13",
                            "inDefaultSet": false
                        }
                    },
                    "icon14": {
                        "images": {
                            "byWidth": {
                                "32": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/32x32/PICON_014.png",
                                "64": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/64x64/PICON_014.png",
                                "80": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/80x80/PICON_014.png",
                                "100": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/100x100/PICON_014.png",
                                "112": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/112x112/PICON_014.png",
                                "160": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/160x160/PICON_014.png",
                                "200": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/200x200/PICON_014.png",
                                "320": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/320x320/PICON_014.png"
                            }
                        },
                        "summary": {
                            "name": "icon14",
                            "inDefaultSet": false
                        }
                    },
                    "icon15": {
                        "images": {
                            "byWidth": {
                                "32": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/32x32/PICON_015.png",
                                "64": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/64x64/PICON_015.png",
                                "80": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/80x80/PICON_015.png",
                                "100": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/100x100/PICON_015.png",
                                "112": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/112x112/PICON_015.png",
                                "160": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/160x160/PICON_015.png",
                                "200": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/200x200/PICON_015.png",
                                "320": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/320x320/PICON_015.png"
                            }
                        },
                        "summary": {
                            "name": "icon15",
                            "inDefaultSet": false
                        }
                    },
                    "icon16": {
                        "images": {
                            "byWidth": {
                                "32": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/32x32/PICON_016.png",
                                "64": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/64x64/PICON_016.png",
                                "80": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/80x80/PICON_016.png",
                                "100": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/100x100/PICON_016.png",
                                "112": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/112x112/PICON_016.png",
                                "160": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/160x160/PICON_016.png",
                                "200": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/200x200/PICON_016.png",
                                "320": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/320x320/PICON_016.png"
                            }
                        },
                        "summary": {
                            "name": "icon16",
                            "inDefaultSet": false
                        }
                    },
                    "icon17": {
                        "images": {
                            "byWidth": {
                                "32": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/32x32/PICON_017.png",
                                "64": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/64x64/PICON_017.png",
                                "80": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/80x80/PICON_017.png",
                                "100": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/100x100/PICON_017.png",
                                "112": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/112x112/PICON_017.png",
                                "160": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/160x160/PICON_017.png",
                                "200": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/200x200/PICON_017.png",
                                "320": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/320x320/PICON_017.png"
                            }
                        },
                        "summary": {
                            "name": "icon17",
                            "inDefaultSet": false
                        }
                    },
                    "icon18": {
                        "images": {
                            "byWidth": {
                                "32": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/32x32/PICON_018.png",
                                "64": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/64x64/PICON_018.png",
                                "80": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/80x80/PICON_018.png",
                                "100": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/100x100/PICON_018.png",
                                "112": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/112x112/PICON_018.png",
                                "160": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/160x160/PICON_018.png",
                                "200": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/200x200/PICON_018.png",
                                "320": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/320x320/PICON_018.png"
                            }
                        },
                        "summary": {
                            "name": "icon18",
                            "inDefaultSet": false
                        }
                    },
                    "icon19": {
                        "images": {
                            "byWidth": {
                                "32": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/32x32/PICON_019.png",
                                "64": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/64x64/PICON_019.png",
                                "80": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/80x80/PICON_019.png",
                                "100": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/100x100/PICON_019.png",
                                "112": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/112x112/PICON_019.png",
                                "160": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/160x160/PICON_019.png",
                                "200": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/200x200/PICON_019.png",
                                "320": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/320x320/PICON_019.png"
                            }
                        },
                        "summary": {
                            "name": "icon19",
                            "inDefaultSet": false
                        }
                    },
                    "icon20": {
                        "images": {
                            "byWidth": {
                                "32": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/32x32/PICON_020.png",
                                "64": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/64x64/PICON_020.png",
                                "80": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/80x80/PICON_020.png",
                                "100": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/100x100/PICON_020.png",
                                "112": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/112x112/PICON_020.png",
                                "160": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/160x160/PICON_020.png",
                                "200": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/200x200/PICON_020.png",
                                "320": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/320x320/PICON_020.png"
                            }
                        },
                        "summary": {
                            "name": "icon20",
                            "inDefaultSet": false
                        }
                    },
                    "icon21": {
                        "images": {
                            "byWidth": {
                                "32": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/32x32/PICON_021.png",
                                "64": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/64x64/PICON_021.png",
                                "80": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/80x80/PICON_021.png",
                                "100": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/100x100/PICON_021.png",
                                "112": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/112x112/PICON_021.png",
                                "160": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/160x160/PICON_021.png",
                                "200": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/200x200/PICON_021.png",
                                "320": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/320x320/PICON_021.png"
                            }
                        },
                        "summary": {
                            "name": "icon21",
                            "inDefaultSet": false
                        }
                    },
                    "icon22": {
                        "images": {
                            "byWidth": {
                                "32": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/32x32/PICON_022.png",
                                "64": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/64x64/PICON_022.png",
                                "80": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/80x80/PICON_022.png",
                                "100": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/100x100/PICON_022.png",
                                "112": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/112x112/PICON_022.png",
                                "160": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/160x160/PICON_022.png",
                                "200": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/200x200/PICON_022.png",
                                "320": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/320x320/PICON_022.png"
                            }
                        },
                        "summary": {
                            "name": "icon22",
                            "inDefaultSet": false
                        }
                    },
                    "icon23": {
                        "images": {
                            "byWidth": {
                                "32": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/32x32/PICON_023.png",
                                "64": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/64x64/PICON_023.png",
                                "80": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/80x80/PICON_023.png",
                                "100": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/100x100/PICON_023.png",
                                "112": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/112x112/PICON_023.png",
                                "160": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/160x160/PICON_023.png",
                                "200": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/200x200/PICON_023.png",
                                "320": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/320x320/PICON_023.png"
                            }
                        },
                        "summary": {
                            "name": "icon23",
                            "inDefaultSet": false
                        }
                    },
                    "icon24": {
                        "images": {
                            "byWidth": {
                                "32": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/32x32/PICON_024.png",
                                "64": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/64x64/PICON_024.png",
                                "80": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/80x80/PICON_024.png",
                                "100": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/100x100/PICON_024.png",
                                "112": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/112x112/PICON_024.png",
                                "160": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/160x160/PICON_024.png",
                                "200": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/200x200/PICON_024.png",
                                "320": "http://cdn-0.nflximg.com/en_us/ffe/avatars_v2/320x320/PICON_024.png"
                            }
                        },
                        "summary": {
                            "name": "icon24",
                            "inDefaultSet": false
                        }
                    }
                }
            },
            "videos": {
                "80037657": {
                    "summary": {
                        "id": 80037657,
                        "uri": "http://api.netflix.com/catalog/titles/series/80037657",
                        "type": "show",
                        "orig": true
                    },
                    "outline": {
                        "title": "The Returned",
                        "seasonCount": 1,
                        "releaseYear": 2015,
                        "delivery": {
                            "has3D": false,
                            "hasHD": true,
                            "hasUltraHD": false,
                            "has51Audio": true,
                            "quality": "HD"
                        },
                        "titleImages": {
                            "large": "http://cdn1.nflximg.net/images/4781/12724781.png",
                            "small": "http://cdn0.nflximg.net/images/4786/12724786.png"
                        },
                        "maturity": "TV-14",
                        "rating": {
                            "predicted": 4.2
                        }
                    },
                    "heroImages": [{
                        "url": "http://cdn1.nflximg.net/webp/1819/12881819.webp",
                        "width": 912,
                        "height": 513
                    }, {
                        "url": "http://so1.akam.nflximg.com/soa1/234/2135451234.webp",
                        "width": 912,
                        "height": 513
                    }, {
                        "url": "http://so1.akam.nflximg.com/soa4/286/2124947286.webp",
                        "width": 912,
                        "height": 513
                    }],
                    "info": {
                        "narrativeSynopsis": "When you've been dead for some years, showing up in your hometown alive and well can be really disturbing for everyone.",
                        "tagline": "Watch New Episode Every Week"
                    },
                    "rating": {
                        "userRating": null
                    }
                }
            }
        },
        "paths": [
            ["appconfig"],
            ["languages"],
            ["geolocation"],
            ["user"],
            ["uiexperience"],
            ["lolomo", "summary"],
            ["lolomo", {"to": 60}, "summary"],
            ["lolomo", "0", "billboardData"],
            ["lolomo", "0", "0", "postcard"],
            ["profilesList", {"to": 4}, "avatar", "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]],
            ["profilesList", {"to": 4}, "summary"],
            ["profilesList", "summary"],
            ["profilesList", "availableAvatarsList", {"to": 18}, "images", "byWidth", [32, 64, 80, 100, 112, 160, 200, 320]],
            ["profilesList", "availableAvatarsList", {"to": 18}, "summary"],
            ["profilesList", "availableAvatarsList", "summary"],
            ["profiles", "hasSeenPromoGate"],
            ["lolomo", "maxExperience"],
            ["lolomo", "0", "0", "evidence"],
            ["lolomo", "0", "0", "item", ["info", "summary", "outline", "rating", "heroImages"]]
        ]
    }
}