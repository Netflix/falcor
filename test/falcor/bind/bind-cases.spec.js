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
var assert = chai.assert;
var ref = Model.ref;
var atom = Model.atom;
var sinon = require('sinon');
var $ref = require("./../../../lib/types/ref");
var errorOnCompleted = require('./../../errorOnCompleted');
var errorOnNext = require('./../../errorOnNext');
var doneOnError = require('./../../doneOnError');
var InvalidModelError = require('./../../../lib/errors/InvalidModelError');

describe('Deref', function() {
    it('should allow gets to mutate the cache that would make the initial deref break (short).', function(done) {
        var onGet = sinon.spy(function() {
            return Rx.Observable.create(function(obs) {
                obs.onNext({
                    jsonGraph: {
                        lolomo: ref(['lolomos', 123]),
                        lolomos: {
                            123: Model.error({
                                message: 'Not Authorized'
                            })
                        }
                    }
                });
                obs.onCompleted();
            });
        });
        var model = new Model({
            cache: {
                lolomo: {
                    summary: atom(42, {$expires: Date.now() - 1000})
                }
            },
            source: {
                get: onGet
            }
        });

        var onNext = sinon.spy();
        model.
            deref(['lolomo'], ['summary']).
            doAction(onNext, function(e) {
                expect(onNext.callCount).to.equals(0);
                expect(e instanceof InvalidModelError).to.be.ok;
            }).
            subscribe(
                errorOnNext(done),
                doneOnError(done),
                errorOnCompleted(done));
    });
    it('should allow gets to mutate the cache that would make the initial deref break (undefined).', function(done) {
        var onGet = sinon.spy(function() {
            return Rx.Observable.create(function(obs) {
                obs.onNext({
                    jsonGraph: {
                        lolomo: ref(['lolomos', 123]),
                        lolomos: {
                            123: atom(undefined)
                        }
                    }
                });
                obs.onCompleted();
            });
        });
        var model = new Model({
            cache: {
                lolomo: {
                    summary: atom(42, {$expires: Date.now() - 1000})
                }
            },
            source: {
                get: onGet
            }
        });

        var onNext = sinon.spy();
        model.
            deref(['lolomo'], ['summary']).
            doAction(onNext, noOp, function() {
                expect(onNext.callCount).to.equals(0);
            }).
            subscribe(noOp, done, done);
    });
    it('should allow gets to mutate the cache that would make the initial deref break.', function(done) {
        var onGet = sinon.spy(function() {
            return Rx.Observable.create(function(obs) {
                obs.onNext({
                    jsonGraph: {
                        lolomo: ref(['lolomos', 123]),
                        lolomos: {
                            123: {
                                summary: atom(42)
                            }
                        }
                    }
                });
                obs.onCompleted();
            });
        });
        var model = new Model({
            cache: {
                lolomo: {
                    summary: atom(42, {$expires: Date.now() - 1000})
                }
            },
            source: {
                get: onGet
            }
        });

        var onNext = sinon.spy();
        model.
            deref(['lolomo'], ['summary']).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onNext.getCall(0).args[0]._path).to.deep.equals(['lolomos', 123]);
            }).
            subscribe(noOp, done, done);
    });
    it('should be able to forward on errors from a model.', function(done) {
        var onGet = sinon.spy(function() {
            return Rx.Observable.create(function(obs) {
                obs.onError(new Error('Not Authorized'));
            });
        });
        var model = new Model({
            cache: { },
            source: {
                get: onGet
            }
        });
        model.
            deref(['lolomo'], ['summary']).
            doAction(noOp, function(e) {
                expect(e).to.deep.equals([{
                    path: ['lolomo', 'summary'],
                    value: {
                        message: 'Not Authorized'
                    }
                }]);
            }).
            subscribe(
                errorOnNext(done),
                doneOnError(done),
                errorOnCompleted(done));
    });

    it('should be ok when all data is {$type: atom}, no cache, derefing.', function(done) {
        var onGet = sinon.spy(function() {
            return Rx.Observable.create(function(obs) {
                obs.onNext({
                    jsonGraph: {
                        lolomo: {
                            summary: {$type: 'atom'},
                            length: {$type: 'atom'}
                        }
                    }
                });
                obs.onCompleted();
            });
        });
        var model = new Model({
            cache: { },
            source: {
                get: onGet
            }
        });
        var onNext = sinon.spy();
        model.
            deref(['lolomo'], [['summary', 'length']]).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onGet.calledOnce).to.be.ok;
                expect(onNext.getCall(0).args[0]._path).to.deep.equals(['lolomo']);
            }).
            subscribe(noOp, done, done);
    });

    it('should be ok when requesting all {$type: atom}s for derefing.', function(done) {
        var onGet = sinon.spy(function() {
            return Rx.Observable.create(function(obs) {
                obs.onNext({
                    jsonGraph: {
                        lolomos: {
                            123: {
                                summary: {$type: 'atom'}
                            }
                        }
                    }
                });
                obs.onCompleted();
            });
        });
        var model = new Model({
            cache: {
                lolomo: Model.ref(['lolomos', 123]),
                lolomos: {
                    123: {
                        length: 5
                    }
                }
            },
            source: {
                get: onGet
            }
        });
        var onNext = sinon.spy();
        model.
            deref(['lolomo'], ['summary', 'length']).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onGet.calledOnce).to.be.ok;
                expect(onNext.getCall(0).args[0]._path).to.deep.equals(['lolomos', 123]);
            }).
            subscribe(noOp, done, done);
    });

    it('should not be able to deref to lolomo because of expired, then get the correct data from source, then bind.', function(done) {
        var onGet = sinon.spy(function() {
            return Rx.Observable.create(function(obs) {
                obs.onNext({
                    jsonGraph: {
                        lolomo: Model.ref(['lolomos', 'def'], {$expires: Date.now() + 100000}),
                        lolomos: {
                            def: {
                                summary: 5
                            }
                        }
                    }
                });
                obs.onCompleted();
            });
        });
        var model = new Model({
            cache: {
                lolomo: Model.ref(['lolomos', 'abcd'], {$expires: Date.now() - 1000})
            },
            source: {
                get: onGet
            }
        });

        var onNext = sinon.spy();
        model.
            deref(['lolomo'], ['summary']).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onGet.calledOnce).to.be.ok;
                expect(onNext.getCall(0).args[0]._path).to.deep.equals(['lolomos', 'def']);
            }).
            subscribe(noOp, done, done);
    });

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

    it('should deliver successfully bound model if preload path errors', function(done) {

        var modelCache = getCache();
        var model = new Model({ cache: modelCache });

        var onNext = sinon.spy();
        var onError = sinon.spy(function() {
            assert.fail(0, 1, "Did not expect error handler to be invoked");
        });

        model.
            deref(['lolomo', 0], [1, 'item', 'info']).
            doAction(onNext, onError, function() {
                var boundModel = onNext.getCall(0).args[0];

                expect(onNext.callCount).to.equal(1);
                expect(boundModel).to.not.equal(model);
                expect(boundModel._path).to.deep.equal(
                    ['lists', 'c595efe8-4de0-4226-8d4a-ebe89d236e2f_fcce4c47-7b36-456b-89ac-bde430a24ca8']
                );

            }).
            subscribe(noOp, done, done);
    });

    it('should deliver successfully bound model if one preload path succeeds, and one preload path errors', function(done) {

        var modelCache = getCache();
        var model = new Model({ cache: modelCache });

        var onNext = sinon.spy();
        var onError = sinon.spy(function() {
            assert.fail(0, 1, "Did not expect error handler to be invoked");
        });

        model.
            deref(['lolomo', 0], [[0,1], 'item', 'info']).
            doAction(onNext, onError, function() {
                var boundModel = onNext.getCall(0).args[0];

                expect(onNext.callCount).to.equal(1);
                expect(boundModel).to.not.equal(model);
                expect(boundModel._path).to.deep.equal(
                    ['lists', 'c595efe8-4de0-4226-8d4a-ebe89d236e2f_fcce4c47-7b36-456b-89ac-bde430a24ca8']
                );

            }).
            subscribe(noOp, done, done);
    });

    it('should fix issue https://github.com/Netflix/falcor/issues/669', function(done) {
        var model = new falcor.Model({
            cache: {
                videos: {
                    0: { summary: 'Some summary' },
                    1: Model.atom(),
                    2: Model.atom(),
                    3: Model.atom()
                }
            },
            source: {
                get: function() {
                    return Rx.Observable.create(function(obs) {
                        obs.onNext({
                            jsonGraph: {
                                videos: {
                                    4: Model.atom(),
                                    5: Model.atom(),
                                    6: Model.atom(),
                                    7: Model.atom()
                                }
                            }
                        });
                        obs.onCompleted();
                    });
                }
            }
        });

        var onNext = sinon.spy();
        model.
            deref(['videos'], [{to:7}, 'summary']).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(onNext.getCall(0).args[0].toJSON()).to.deep.equals({
                    $type: $ref,
                    value: ['videos']
                });
            }).
            subscribe(noOp, done, done);
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
                "1":{
                    "item": {
                        "$type": "ref",
                        "value": ["videos", "err"],
                    }
                }
            },
        },
        "videos": {
            "err": {
                "info": {
                    "$type": "error",
                    "value": {
                        "message": "errormsg"
                    }
                }
            },
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
