var falcor = require("./../../../lib/");
var Model = falcor.Model;
var Rx = require("rx");
var Cache = require("../../data/Cache");
var LocalDataSource = require("../../data/LocalDataSource");
var testRunner = require("../../testRunner");
var Expected = require("../../data/expected");
var Bound = Expected.Bound;
var noOp = function() {};
var chai = require("chai");
var expect = chai.expect;
var ref = Model.ref;
var atom = Model.atom;
var sinon = require('sinon');
var $ref = require("./../../../lib/types/ref");

describe('Deref', function() {
    it('should ensure that deref correctly makes a request to the dataStore.', function(done) {
        var onGet = sinon.spy();
        var onNext = sinon.spy();

        var dataModel = new Model({
            cache: {
                genreList: {
                    '0':  { '$type': $ref, 'value': ['lists', 'abcd'] },

                },
                'lists': {
                    'abcd': {
                        '0':  { '$type': $ref, 'value': ['videos', 1234] }
                    }
                }
            },
            source: new LocalDataSource(Cache(), {
                onGet: onGet
            })
        });

        var throwError = false;
        dataModel.
            deref(['genreList', 0, 0], ['summary']).
            doAction(onNext, noOp, function() {
                expect(onGet.called).to.be.ok;
                expect(onGet.getCall(0).args[1]).to.deep.equals([
                    ['videos', 1234, 'summary']
                ]);
                expect(onNext.called).to.be.ok;
                expect(onNext.getCall(0).args[0]._path).to.deep.equals([
                    'videos', 1234
                ]);
            }).
            subscribe(noOp, done, done);
    });

    it('should deref to a branch node.', function(done) {
        var model = new Model({source: new LocalDataSource(Cache())});
        var count = 0;
        var expected = Bound().directValue.AsPathMap.values[0];
        model = model.
            deref(["genreList", 0, 0], ['summary']).
            flatMap(function(model) {
                return model.get(['summary']);
            }).
            doAction(function(x) {
                testRunner.compare(expected, x);
                count++;
            }, noOp, function() {
                testRunner.compare(1, count, 'onNext should be called 1 time.');
            }).
            subscribe(noOp, done, done);
    });
    it('should deref to a branch node and build proper missing paths', function() {
        var model = new Model({ cache: getCache() })._derefSync(["lolomos","c595efe8-4de0-4226-8d4a-ebe89d236e2f_ROOT"]);
        var results = model._getPathValuesAsPathMap(model, [
            [[{"from":0,"to":4}, {"from":5,"to":9}, {"from":30,"to":34}], 0,"item",["summary","outline","info","heroImages","rating","share","queue","details"]],
            [[{"from":0,"to":4}, {"from":5,"to":9}, {"from":30,"to":34}], 0,"evidence"]
        ], [{}]);

        expect(typeof results.optimizedMissingPaths[10][0] !== 'undefined').to.be.ok;
    });
    it('ensure that roman riding is working', function() {
        var model = new Model({ cache: getCache() });
        model._root.unsafeMode = true;
        var out = model._getValueSync(model, ["lolomos","c595efe8-4de0-4226-8d4a-ebe89d236e2f_ROOT", 1, 0]);
        expect(out.optimizedPath).to.deep.equal(["lolomos","c595efe8-4de0-4226-8d4a-ebe89d236e2f_ROOT", 1, 0]);
    });

    it('should allow for multiple deref operations.', function(done) {
        var model = new Model({ cache: getCache() });
        var expectedAtLolomo = ["lolomos", "c595efe8-4de0-4226-8d4a-ebe89d236e2f_ROOT"];
        var expectedAtLolomo0 = ["lists", "c595efe8-4de0-4226-8d4a-ebe89d236e2f_fcce4c47-7b36-456b-89ac-bde430a24ca8"];
        var expectedAtLolomo00Item = ["videos", "80041601"];
        var called = [false, false, false];
        model.
            deref('lolomo', [0, 0, 'item', 'info']).
            flatMap(function(boundModel) {
                testRunner.compare(expectedAtLolomo, boundModel._path);
                called[0] = true;
                return boundModel.deref([0], [0, 'item', 'info']);
            }).
            flatMap(function(boundModel) {
                testRunner.compare(expectedAtLolomo0, boundModel._path);
                called[1] = true;
                return boundModel.deref([0, 'item'], ['info']);
            }).
            doAction(function(boundModel) {
                called[2] = true;
                testRunner.compare(expectedAtLolomo00Item, boundModel._path);
            }, noOp, function() {
                expect(called.every(function(x) { return x; })).to.be.ok;
            }).
            subscribe(noOp, done, done);
    });

    it('should not be able to get an item out of the core that is expired, but previously hard-linked.', function() {
        // hardlinks
        var model = new Model({
            cache: {
                lolomo: ref(['lolomos', 'abc'], {$expires: Date.now() + 1000}),
                lolomos: {
                    abc: {
                        0: atom('foo')
                    }
                }
            }
        });

        // expires the hardlinked item.
        model._root.cache.lolomo.$expires = Date.now() - 10;
        var out = model._getValueSync(model, ['lolomo', 0]);

        expect(out.value).to.equals(undefined);
    });
});

function getCache() {
    return {
        "lolomo": {
            "$type": "ref",
            "value": ["lolomos", "c595efe8-4de0-4226-8d4a-ebe89d236e2f_ROOT"],
        },
        "lolomos": {
            "c595efe8-4de0-4226-8d4a-ebe89d236e2f_ROOT": {
                "0": {
                    "$type": "ref",
                    "value": ["lists", "c595efe8-4de0-4226-8d4a-ebe89d236e2f_fcce4c47-7b36-456b-89ac-bde430a24ca8"],
                },
            },
        },
        "lists": {
            "c595efe8-4de0-4226-8d4a-ebe89d236e2f_fcce4c47-7b36-456b-89ac-bde430a24ca8": {
                "0": {
                    "item": {
                        "$type": "ref",
                        "value": ["videos", "80041601"],
                    },
                    "evidence": {
                        "value": {
                            "type": "faux",
                            "priority": 3,
                            "value": {
                                "0": "irreverent",
                                "1": "romantic"
                            },
                            "tracking": {
                                "has_evidence": true,
                                "evidence": {
                                    "0": {
                                        "type": "faux",
                                        "tagIds": {
                                            "0": 100048,
                                            "1": 100052
                                        }
                                    }
                                }
                            },
                        },
                        "$type": "atom",
                    }
                },
            },
        },
        "videos": {
            "80041601": {
                "info": {
                    "value": {
                        "narrativeSynopsis": "His search for The One takes a detour: the STD clinic. Sowing your wild oats has never been funnier or more honest.",
                        "tagline": "Watch Season 1 Now",
                        "summary": {
                            "id": 80041601,
                            "uri": "http://api.netflix.com/catalog/titles/series/80041601",
                            "type": "show",
                            "orig": true,
                        },
                        "listType": null
                    },
                    "$type": "atom",
                },
                "summary": {
                    "$type": "atom",
                },
                "outline": {
                    "value": {
                        "title": "Scrotal Recall",
                        "seasonCount": 1,
                        "releaseYear": 2014,
                        "delivery": {
                            "has3D": false,
                            "hasHD": true,
                            "hasUltraHD": false,
                            "has51Audio": false,
                            "quality": "HD"
                        },
                        "titleImages": {
                            "large": "http://cdn0.nflximg.net/images/3254/20913254.png",
                            "small": "http://cdn0.nflximg.net/images/3256/20913256.png",
                            "larger": false
                        },
                        "maturity": "TV-MA",
                        "rating": {
                            "user": null,
                            "predicted": 3.815692
                        },
                        "id": 80041601,
                        "type": "show",
                        "listType": null
                    },
                    "$type": "atom",
                },
                "rating": {
                    "value": {
                        "userRating": null,
                    },
                    "$type": "atom",
                },
                "heroImages": {
                    "value": {
                        "0": {
                            "imageKey": "StoryArt,0",
                            "url": "http://cdn1.nflximg.net/webp/3119/20913119.webp",
                            "width": 912,
                            "height": 513
                        },
                        "1": {
                            "imageKey": "InterestingMoment,0",
                            "url": "http://so1.akam.nflximg.com/soa3/824/280541824.webp",
                            "width": 912,
                            "height": 513
                        },
                        "2": {
                            "imageKey": "InterestingMoment,1",
                            "url": "http://so1.akam.nflximg.com/soa1/676/587798676.webp",
                            "width": 912,
                            "height": 513
                        }
                    },
                    "$type": "atom",
                }
            },
        }
    };
}
