var falcor = require("./../../../lib/");
var Model = falcor.Model;
var Rx = require("rx");
var LocalDataSource = require("../../data/LocalDataSource");
var chai = require("chai");
var expect = chai.expect;
var inspect = require("util").inspect;
var noOp = function() {};
var sinon = require('sinon');
var cacheGenerator = require('./../../CacheGenerator');
var strip = require('./../../cleanData').stripDerefAndVersionKeys;
var jsonGraph = require('falcor-json-graph');
var ref = jsonGraph.ref;
var atom = jsonGraph.atom;

describe("Cache Only", function() {
    it("should invalidate a leaf value.", function(done) {
        var model = new Model({
            cache: cacheGenerator(0, 1, ['title', 'art'])
        });
        var onNext = sinon.spy();
        model.
            invalidate(["videos", 0, "title"]);

        toObservable(model.
            get(["videos", 0, "title"])).
            concat(model.get(["videos", 0, "art"])).
            doAction(onNext, noOp, function() {
                expect(strip(onNext.getCall(1).args[0])).to.deep.equals({
                    json: {
                        videos: {
                            0: {
                                art: 'Video 0'
                            }
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });

    it("should re-fetch an invalidated value progressively.", function(done) {
        var onGet = sinon.spy();
        var onNext = sinon.spy();
        var model = new Model({
            cache: {
                lolomo: {
                    0: ref(['lists', 123])
                }
            },
            source: new LocalDataSource({
                    lolomo: {
                        0: ref(['lists', 123])
                    },
                    lists: {
                        123: {
                            title: atom('List title')
                        }
                    }
                }, {wait: 100, onGet: onGet})
        });

        toObservable(model.
            get(["lolomo", 0, "title"]).progressively()).
            doAction(onNext, noOp, function() {
                expect(onGet.callCount).to.equal(2);
                expect(onNext.callCount).to.equal(3);
                expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                    json: {
                        lolomo: {}
                    }
                });
                expect(strip(onNext.getCall(1).args[0])).to.deep.equals({
                    json: {
                        lolomo: {}
                    }
                });
                expect(strip(onNext.getCall(2).args[0])).to.deep.equals({
                    json: {
                        lolomo: {
                            0: {
                                title: 'List title'
                            }
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);

        model.invalidate(['lolomo', 0]);
    });

    it("should re-fetch an invalidated value.", function(done) {
        var onGet = sinon.spy();
        var onNext = sinon.spy();
        var model = new Model({
            cache: {
                lolomo: {
                    0: ref(['lists', 123])
                }
            },
            source: new LocalDataSource({
                    lolomo: {
                        0: ref(['lists', 123])
                    },
                    lists: {
                        123: {
                            title: atom('List title')
                        }
                    }
                }, {wait: 100, onGet: onGet})
        });

        toObservable(model.
            get(["lolomo", 0, "title"])).
            doAction(onNext, noOp, function() {
                expect(onGet.callCount).to.equal(2);
                expect(onNext.callCount).to.equal(1);
                expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                    json: {
                        lolomo: {
                            0: {
                                title: 'List title'
                            }
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);

        model.invalidate(['lolomo', 0]);
    });

    it("should invalidate a branch value.", function(done) {
        var dataSourceCount = 0;
        var summary = ["videos", 0, "summary"];
        var art = ["videos", 0, "art"];
        var onGet = sinon.spy();
        var dataSource = new LocalDataSource(cacheGenerator(0, 1, ['summary', 'art']), {
            onGet: onGet
        });
        var model = new Model({
            cache: cacheGenerator(0, 1, ['summary', 'art']),
            source: dataSource
        });
        var onNext = sinon.spy();
        model.
            invalidate(["videos", 0]);

        toObservable(model.
            withoutDataSource().
            get(summary.slice())).
            concat(model.get(art.slice())).
            doAction(onNext, noOp, function() {
                expect(onGet.calledOnce).to.be.ok;
                expect(onGet.getCall(0).args[1]).to.deep.equals([art]);
                expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                    json: {}
                });
                expect(strip(onNext.getCall(1).args[0])).to.deep.equals({
                    json: {
                        videos: {
                            0: {
                                art: 'Video 0'
                            }
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });

    it("should invalidate a reference but not through the reference.", function(done) {
        var summary = ["genreList", 0, 0, "summary"];
        var model = new Model({
            cache: cacheGenerator(0, 1, ['summary', 'art'])
        });
        var onNext = sinon.spy();
        model.
            invalidate(["lolomo", 0]);

        toObservable(model.
            withoutDataSource().
            get(summary.slice())).
            concat(model.get(["lists", "A", 0, "item", "summary"])).
            doAction(onNext, noOp, function() {
                 expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                    json: {}
                });
                expect(strip(onNext.getCall(1).args[0])).to.deep.equals({
                    json: {
                        lists: {
                            A: {
                                0: {
                                    item: {
                                        summary: 'Video 0'
                                    }
                                }
                            }
                        }
                    }
                });
            }).
            subscribe(noOp, done, done);
    });
});
