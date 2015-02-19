var jsong = require("../../bin/Falcor");
var Model = jsong.Model;
var Rx = require("rx");
var LocalDataSource = require("../data/LocalDataSource");
var UnoDataSource = require("../data/UnoDataSource");
var Cache = require("../data/Cache");
var RCache = require("../data/ReducedCache");
var ReducedCache = RCache.ReducedCache;
var Expected = require("../data/expected");
var getTestRunner = require("../getTestRunner");
var testRunner = require("../testRunner");
var References = Expected.References;
var Complex = Expected.Complex;
var Values = Expected.Values;
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};

var getModel = testRunner.getModel;
describe("Invalidate", function() {
    it("should invalidate a leaf value.", function(done) {
        var dataSourceCount = 0;
        var dataSource = new LocalDataSource({}, {
            onGet: function(path) {
                dataSourceCount++;
            }
        });
        var model = getModel(dataSource, Cache()).setRetryCount(1);
        var invalidate = model.
            invalidate(["videos", 3355, "summary"]).
            flatMap(function() {
                return model.get(["videos", 3355, "summary"]);
            }).
            doAction(function(x) {
                throw "Should not be onNext";
            });
        var otherLeaf = model.get(["videos", 3355, "art"]).toPathValues();
        var count = 0;
        invalidate.concat(otherLeaf).subscribe(function(x) {
            count++;
            testRunner.compare({
                path: ["videos", 3355, "art"],
                value: {
                    "box-shot": "www.cdn.com/3355"
                }
            }, x);
        }, done, function() {
            // wtf is this all about.  I rely on errors in subscriptions all the time.
            var error = false;
            try {
                expect(count, "onNext must be called 1 time.").to.equal(1);
                expect(dataSourceCount, "dataSource.get must be called 0 times.").to.equal(0);
            } catch (e) {
                done(e);
                error = true;
            }
            if (!error) {
                done();
            }
        });
    });
    
    it("should invalidate a branch value.", function(done) {
        var dataSourceCount = 0;
        var summary = ["videos", 3355, "summary"];
        var art = ["videos", 3355, "art"];
        var doneDone = false;
        var dataSource = new LocalDataSource(Cache(), {
            onGet: function(source, path) {
                try {
                    // if (dataSourceCount === 0) {
                    //     testRunner.compare([summary], path);
                    // } else {
                        testRunner.compare([art], path);
                    // }
                } catch (e) {
                    doneDone = true;
                    done(e);
                }
                dataSourceCount++;
            }
        });
        var model = getModel(dataSource, Cache()).setRetryCount(1);
        var invalidate = model.
            invalidate(["videos", 3355]).
            flatMap(function() {
                return model.get(summary.slice());
            }).
            doAction(function(x) {
                throw "Should not be onNext";
            });
        var otherLeaf = model.get(art.slice()).toPathValues();
        var count = 0;
        invalidate.concat(otherLeaf).subscribe(function(x) {
            count++;
        }, function(e) {
            if (!doneDone) {
                done(e);
            }
        }, function() {
            // wtf is this all about.  I rely on errors in subscriptions all the time.
            if (!doneDone) {
                var error = false;
                try {
                    expect(count, "onNext must be called 1 time.").to.equal(1);
                    expect(dataSourceCount, "dataSource.get must be called 1 times.").to.equal(1);
                } catch (e) {
                    done(e);
                    error = true;
                }
                if (!error) {
                    done();
                }
            }
        });
    });

    it("should invalidate a references but not through the references.", function(done) {
        var dataSourceCount = 0;
        var doneDone = false;
        var summary = ["genreList", 0, 0, "summary"];
        var dataSource = new LocalDataSource({}, {
            onGet: function(source, path) {
                try {
                    if (dataSourceCount === 0) {
                        testRunner.compare([summary], path);
                    } else {
                        testRunner.compare([], path);
                    }
                } catch (e) {
                    doneDone = true;
                    done(e);
                }
                dataSourceCount++;
            }
        });
        var model = getModel(dataSource, Cache()).setRetryCount(1);
        var invalidate = model.
            invalidate(["genreList", 0]).
            flatMap(function() {
                return model.get(summary.concat());
            }).
            doAction(function(x) {
                throw "Should not be onNext";
            });
        var otherLeaf = model.get(["lists", "abcd", 0, "summary"]).toPathValues();
        var count = 0;
        invalidate.concat(otherLeaf).subscribe(function(x) {
            count++;
            testRunner.compare({
                path: ["lists", "abcd", 0, "summary"],
                value: {
                    "title": "House of Cards",
                    "url": "/movies/1234"
                }
            }, x);
        }, function(e) {
            if (!doneDone) {
                done(e);
            }
        }, function() {
            // wtf is this all about.  I rely on errors in subscriptions all the time.
            if (!doneDone) {
                var error = false;
                try {
                    expect(count, "onNext must be called 1 time.").to.equal(1);
                    expect(dataSourceCount, "dataSource.get must be called 0 times.").to.equal(0);
                } catch (e) {
                    done(e);
                    error = true;
                }
                if (!error) {
                    done();
                }
            }
        });
    });
});
