var jsong = require("../../../../index");
var Model = jsong.Model;
var Rx = require("rx");
var LocalDataSource = require("../../../data/LocalDataSource");
var Cache = require("../../../data/Cache");
var ReducedCache = require("../../../data/ReducedCache");
var Expected = require("../../../data/expected");
var getTestRunner = require("../../../getTestRunner");
var testRunner = require("../../../testRunner");
var Bound = Expected.Bound;
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};

describe("BindSync", function() {
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
            treatErrorsAsValues().
            bindSync(["genreList", 0, 0]).
            get(["summary"]);
        getTestRunner.
            async(obs, dataModel, {}, {
                onNextExpected: [{
                    value: {message: "emacs."},
                    path: []
                }]
            }).
            subscribe(noOp, null, done);
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

        expect(dataModel.
            treatErrorsAsValues().
            bindSync(["genreList", 0, 0])).to.be.not.ok;
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
            treatErrorsAsValues().
            bindSync(["genreList", 0, 0]).
            get(["summary"]);
        getTestRunner.
            async(obs, dataModel, {}, {
                onNextExpected: [{
                    value: "This is a value",
                    path: []
                }]
            }).
            subscribe(noOp, null, done);
    });

    it("bound to a path that short-circuits in a branch key position.", function() {
        var dataModel = testRunner.getModel(new LocalDataSource(Cache()), {
            genreList: {
                0: "This is a value"
            }
        });

        expect(dataModel.
            treatErrorsAsValues().
            bindSync(["genreList", 0, 0])).to.be.not.ok;
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
            treatErrorsAsValues().
            bind(["genreList", 0, 0], ["summary"]).
            get(["summary"]);
        getTestRunner.
            async(obs, dataModel, {}, {
                onNextExpected: [{
                    path: [],
                    message: "emacs."
                }]
            }).
            subscribe(noOp, null, done);
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
        
        dataModel.
            treatErrorsAsValues().
            bind(["genreList", 0, 0], ["summary"]).
            get(["summary"]).
            subscribe(function() {onNext = true;}, done, function() {
                expect(onNext, "onNext should not of been called.").to.be.not.ok;
            });
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
            treatErrorsAsValues().
            bind(["genreList", 0, 0], ["summary"]).
            get(["summary"]);
        getTestRunner.
            async(obs, dataModel, {}, {
                onNextExpected: [{
                    value: "This is a value",
                    path: []
                }]
            }).
            subscribe(noOp, null, done);
    });

    it("bound to a path that short-circuits in a branch key position.", function() {
        var dataModel = testRunner.getModel(new LocalDataSource(Cache()), {
            genreList: {
                0: "This is a value"
            }
        });

        var onNext = false;
        dataModel.
            treatErrorsAsValues().
            bind(["genreList", 0, 0], ["summary"]).
            get(["summary"]).
            subscribe(function() {onNext = true;}, done, function() {
                expect(onNext, "onNext should not of been called.").to.be.not.ok;
            });
    });
});

