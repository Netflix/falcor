var jsong = require("../../../bin/Falcor");
var Model = jsong.Model;
var Rx = require("rx");
var LocalDataSource = require("../../data/LocalDataSource");
var Cache = require("../../data/Cache");
var ReducedCache = require("../../data/ReducedCache");
var Expected = require("../../data/expected");
var getTestRunner = require("../../getTestRunner");
var testRunner = require("../../testRunner");
var Bound = Expected.Bound;
var chai = require("chai");
var expect = chai.expect;
var noOp = function() {};
var getDataModel = testRunner.getModel;

describe("BindSync", function() {
    describe("Cache Only", function() {
        it("should bind to an object.", function(done) {
            var model = getDataModel(null, Cache());
            var expected = Bound().directValue;
            model = model.bindSync(["videos", 1234]);
            getTestRunner.
                async(Rx.Observable.return(42), model, expected, {useNewModel: false}).
                subscribe(noOp, done, done);
        });

        it("should bind through a reference.", function(done) {
            var model = getDataModel(null, Cache());
            var expected = Bound().onReference;
            debugger;
            model = model.bindSync(["genreList", 0]);
            getTestRunner.
                async(Rx.Observable.return(42), model, expected, {useNewModel: false}).
                subscribe(noOp, done, done);
        });
    });
    
    describe("DataSource Only", function() {
        it("should bind to an object.", function(done) {
            var model = getDataModel(new LocalDataSource(Cache()), {});
            var expected = Bound().directValue;
            model = model.bindSync(["videos", 1234]);
            getTestRunner.
                async(model.get(["summary"]), model, expected, {
                    useNewModel: false,
                    onNextExpected: expected.AsPathMap
                }).
                subscribe(noOp, done, done);
        });

        it("should bind through a reference.", function(done) {
            var model = getDataModel(new LocalDataSource(Cache()), {});
            var expected = Bound().onReference;
            model = model.bindSync(["genreList", 0]);
            getTestRunner.
                async(model.get([0, "summary"]), model, expected, {
                    useNewModel: false,
                    onNextExpected: expected.AsPathMap
                }).
                subscribe(noOp, done, done);
        });
    });

    describe("DataSource + Cache", function() {
        it("should bind to an object.", function(done) {
            var model = getDataModel(
                new LocalDataSource(Cache()), 
                ReducedCache.MinimalCache());
            var expected = Bound().toOnly;
            model = model.bindSync(["genreList", 0]);
            getTestRunner.
                async(model.get([{to:1}, "summary"]), model, expected, {
                    useNewModel: false,
                    onNextExpected: expected.AsPathMap
                }).
                subscribe(noOp, done, done);
        });
        
        it("should bind to an object with a selector.", function(done) {
            var model = getDataModel(
                new LocalDataSource(Cache()),
                ReducedCache.MinimalCache());
            var expected = Bound().toOnly;
            model = model.bindSync(["genreList", 0]);
            model.
                get([{to:1}, "summary"], function(list) {
                    testRunner.compare(expected.AsJSON.values[0].json, list);
                }).
                subscribe(noOp, done, function() {
                    getTestRunner.runSync(model, expected, {useNewModel: false});
                    done();
                });
        });

        it("should bind and set the value.", function(done) {
            var model = getDataModel(null, Cache());
            var expected = Bound().directValue;
            model = model.bindSync(["videos", 1234]);
            model.
                set({path: ["summary"], value: "pie"}).
                flatMap(function() {
                    return model.get(["summary"]);
                }).
                subscribe(function(x) {
                    testRunner.compare({json:{summary:"pie"}}, x);
                }, done, done);
        });
    });
});
