var ErrorDataSource = require("../../data/ErrorDataSource");
var falcor = require("falcor");
var Model = falcor.Model;
var chai = require("chai");
var expect = chai.expect;
var testRunner = require("../../testRunner");
var noOp = function() {};

describe("Error", function() {
    it("should get a hard error from the DataSource.", function(done) {
        var model = new Model({
            source: new ErrorDataSource(503, "Timeout")
        });
        model.
            get(["test", {to: 5}, "summary"]).
            toPathValues().
            doAction(noOp, function(err) {
                expect(err.length).to.equal(6);
                // not in boxValue mode
                var expected = {
                    path: [],
                    value: {
                        status: 503,
                        message: "Timeout"
                    }
                };
                err.forEach(function(e, i) {
                    expected.path = ["test", i, "summary"];
                    testRunner.compare(expected, e);
                });
            }).
            subscribe(function() {
                done('Should not onNext');
            },
            function(e) {
                if (isAssertionError(e)) {
                    done(e);
                } else {
                    done();
                }
            },
            function() {
                done('Should not onComplete');
            });
    });

    it("should get a hard error from the DataSource with some data found in the cache.", function(done) {
        var model = new Model({
            source: new ErrorDataSource(503, "Timeout"),
            cache: {
                test: {
                    0: {
                        summary: "in cache"
                    },
                    5: {
                        summary: "in cache"
                    }
                }
            }
        });
        var count = 0;
        model.
            get(["test", {to: 5}, "summary"]).
            toPathValues().
            doAction(function(x) {
                var expected = {
                    path: ["test", count === 0 ? 0 : 5, "summary"],
                    value: "in cache"
                };
                count++;
                testRunner.compare(expected, x);
            }, function(err) {
                expect(err.length).to.equal(4);
                // not in boxValue mode
                var expected = {
                    path: [],
                    value: {
                        status: 503,
                        message: "Timeout"
                    }
                };
                err.forEach(function(e, i) {
                    expected.path = ["test", i + 1, "summary"];
                    testRunner.compare(expected, e);
                });
                expect(count).to.equals(2);
            }).
            subscribe(noOp,
            function(e) {
                if (isAssertionError(e)) {
                    done(e);
                } else {
                    done();
                }
            },
            function() {
                done('Should not onComplete');
            });
    });
});

function isAssertionError(e) {
    return e.hasOwnProperty('expected') && e.hasOwnProperty('actual');
}
