var jsong = require("../../../bin/Falcor");
var Model = jsong.Model;
var Rx = require("rx");
var LocalDataSource = require("../../data/LocalDataSource");
var Cache = require("../../data/Cache");
var Expected = require("../../data/expected");
var getTestRunner = require("../../getTestRunner");
var testRunner = require("../../testRunner");
var References = Expected.References;
var Complex = Expected.Complex;
var Values = Expected.Values;
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};
describe("BindSync", function() {
    it("bound to a path that is an error.", function() {
        var dataModel = testRunner.getModel(new LocalDataSource(Cache()), {
            genreList: {
                0: {
                    0: {
                        $type: "error",
                        message: "emacs."
                    }
                }
            }
        });
        var throwError = false;
        try {
            dataModel.bindSync(["genreList", 0, 0]);
        } catch (e) {
            throwError = true;
            // testRunner.compare({
            //     message: "emacs."
            // }, e);
        }
        expect(throwError).to.be.ok;
    });

    it("bound to a path that short-circuits in a branch key position.", function() {
        var dataModel = testRunner.getModel(new LocalDataSource(Cache()), {
            genreList: {
                0: {
                    $type: "error",
                    message: "The humans are dead."
                }
            }
        });

        var throwError = false;
        try {
            dataModel.bindSync(["genreList", 0, 0]);
        } catch (e) {
            throwError = true;
            // testRunner.compare({
            //     message: "The humans are dead."
            // }, e);
        }
        expect(throwError).to.be.ok;
    });

    it("bound to a path that is a value.", function(done) {
        var dataModel = testRunner.getModel(new LocalDataSource(Cache()), {
            genreList: {
                0: {
                    0: "This is a value"
                }
            }
        });
        var obs = dataModel.
            bindSync(["genreList", 0, 0]).
            get(["summary"]).
            toPathValues();
        getTestRunner.
            async(obs, dataModel, {}, {
                onNextExpected: {
                    values: [{
                        value: "This is a value",
                        path: []
                    }]
                }
            }).
            subscribe(noOp, done, done);
    });

    it("bound to a path that short-circuits in a branch key position.", function() {
        var dataModel = testRunner.getModel(new LocalDataSource(Cache()), {
            genreList: {
                0: "This is a value"
            }
        });
        expect(dataModel.bindSync(["genreList", 0, 0]), "the bound model should be undefined").to.be.not.ok;
    });
});

describe("Bind", function() {
    it("bound to a path that is an error.", function(done) {
        var dataModel = testRunner.getModel(new LocalDataSource(Cache()), {
            genreList: {
                0: {
                    0: {
                        $type: "error",
                        message: "emacs."
                    }
                }
            }
        });
        var obs = dataModel.
            bind(["genreList", 0, 0], ["summary"]).
            map(function(dataModel) {
                return dataModel.getValueSync(["summary"]);
            });

        // Should onError the error from the cache.
        getTestRunner.
            async(obs, dataModel, null, {
                errors: [{
                    "path": ["genreList", "0", "0"],
                    "value": {"message": "emacs." }
                }]
            }).
            subscribe(noOp, done, done);
    });

    it("bound to a path that short-circuits in a branch key position.", function(done) {
        var dataModel = testRunner.getModel(new LocalDataSource(Cache()), {
            genreList: {
                0: {
                    $type: "error",
                    message: "The humans are dead."
                }
            }
        });

        var obs = dataModel.
            bind(["genreList", 0, 0], ["summary"]).
            flatMap(function(dataModel) {
                return dataModel.get(["summary"]).toPathValues();
            });
        getTestRunner.
            async(obs, dataModel, {}, {
                errors: [{
                    "path": ["genreList", "0"],
                    "value": { "message": "The humans are dead." }
                }]
            }).
            subscribe(noOp, done, done);
    });

    it("bound to a path that is a value.", function(done) {
        var dataModel = testRunner.getModel(new LocalDataSource(Cache()), {
            genreList: {
                0: {
                    0: "This is a value"
                }
            }
        });
        var obs = dataModel.
            bind(["genreList", 0, 0], ["summary"]).
            flatMap(function(dataModel) {
                return dataModel.get(["summary"]).toPathValues()
            });
        getTestRunner.
            async(obs, dataModel, {}, {
                onNextExpected: {
                    values: [{
                        value: "This is a value",
                        path: []
                    }]
                }
            }).
            subscribe(noOp, done, done);
    });

    it("bound to a path that short-circuits in a branch key position.", function(done) {
        var dataModel = testRunner.getModel(new LocalDataSource(Cache()), {
            genreList: {
                0: "This is a value"
            }
        });

        var onNext = false;
        dataModel.
            bind(["genreList", 0, 0], ["summary"]).
            flatMap(function(dataModel) {
                return dataModel.get(["summary"]);
            }).
            subscribe(function() {onNext = true;}, done, function() {
                expect(onNext, "onNext should not have been called.").to.be.not.ok;
                done();
            });
    });
});

