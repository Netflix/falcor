var falcor = require("./../../../lib/");
var Model = falcor.Model;
var LocalDataSource = require("../../data/LocalDataSource");
var strip = require("../../cleanData").stripDerefAndVersionKeys;
var chai = require("chai");
var sinon = require("sinon");
var expect = chai.expect;
var noOp = function() {};
var ModelResponse = require("./../../../lib/response/ModelResponse");
var Rx5 = require("rxjs");

/**
 * @param newModel
 * @returns {Model}
 */
function getModel(newModel, cache) {
    return newModel ? testRunner.getModel(null, cache || {}) : model;
}

describe("Call", function() {
    it("executes a remote call on a bound Model and sends the call and extra paths relative to the root", function(done) {
        var model = new Model({
            source: {
                call: function(callPath, args, suffixes, extraPaths) {
                    expect(callPath).to.deep.equal(["lists", "add"]);
                    expect(extraPaths).to.deep.equal([[0, "summary"]]);
                    done();

                    return {subscribe: noOp};
                }
            }
        });

        toObservable(model.
            _clone({ _path: ["lists"] }).
            call(["add"], [], [], [[0, "summary"]])).
            subscribe(noOp, noOp, noOp);
    });

    it("ensures that invalidations are ran.", function(done) {
        var model = new Model({
            source: {
                call: function(callPath, args, suffixes, extraPaths) {
                    return new ModelResponse(function(observer) {
                        observer.onNext({
                            jsonGraph: {
                                a: "test"
                            },
                            paths: [["a"]],
                            invalidated: [["b"]]
                        });
                        observer.onCompleted();
                    });
                }
            },
            cache: {
                a: "foo",
                b: "test"
            }
        });

        var onNext = sinon.spy();
        var onNext2 = sinon.spy();
        toObservable(model.
            call(["test"], [])).
            doAction(onNext, noOp, function() {
                expect(onNext.calledOnce).to.be.ok;
                expect(strip(onNext.getCall(0).args[0])).to.deep.equals({
                    json: {
                        a: "test"
                    }
                });
            }).
            flatMap(function() {
                return model.
                    withoutDataSource().
                    get(["a"], ["b"]);
            }).
            doAction(onNext2, noOp, function() {
                expect(onNext2.calledOnce).to.be.ok;
                expect(strip(onNext2.getCall(0).args[0])).to.deep.equals({
                    json: {
                        a: "test"
                    }
                });
            }).
            subscribe(noOp, done, done);
    });
    it("should sent parsed arguments to the dataSource.", function(done) {
        var call = sinon.spy(function() {
            return {
                subscribe: function(onNext, onError, onCompleted) {
                    onNext({jsonGraph: {
                        a: {
                            b: "hello"
                        }
                    }, paths: [
                        ["a", "b"]
                    ]});
                    onCompleted();
                }
            };
        });
        var model = new Model({
            source: {
                call: call
            }
        });
        toObservable(model.
            call("test.again", [], ["oneSuffix.a", "twoSuffix.b"], ["onePath.a", "twoPath.b"])).
            doAction(noOp, noOp, function() {
                expect(call.calledOnce).to.be.ok;

                var callArgs = call.getCall(0).args;
                expect(callArgs[0]).to.deep.equals(["test", "again"]);
                expect(callArgs[1]).to.deep.equals([]);
                expect(callArgs[2]).to.deep.equals([
                    ["oneSuffix", "a"],
                    ["twoSuffix", "b"]
                ]);
                expect(callArgs[3]).to.deep.equals([
                    ["onePath", "a"],
                    ["twoPath", "b"]
                ]);
            }).
            subscribe(noOp, done, done);
    });

    it("does not re-execute a call on multiple thens", function(done) {
        var call = sinon.spy(function() {
            return new ModelResponse(function(observer) {
                observer.onNext({
                    jsonGraph: { a: "test" },
                    paths: [["a"]],
                    invalidated: []
                });
                observer.onCompleted();
            });
        });
        var model = new Model({
            source: { call: call }
        });

        var response = model.call(["add"], [], [], [[0, "summary"]]);
        response.then();
        response.then(function() {
          expect(call.calledOnce).to.be.ok;
          done();
        }).catch(done);
    });
});

describe("ModelResponse", function() {
    it("should be consumable with RxJS 5", function(done) {
        var response = new ModelResponse(function(observer) {
            observer.onNext({
                jsonGraph: { a: "test" },
                paths: [["a"]],
                invalidated: []
            });
            observer.onCompleted();
        });

        var results = [];

        Rx5.Observable.from(response)
            .subscribe(
                function(value) { results.push(value); },
                null,
                function() {
                    expect(results).to.deep.equals([{
                        jsonGraph: { a: "test" },
                        paths: [["a"]],
                        invalidated: []
                    }]);
                    done();
                }
            );
    });
});
