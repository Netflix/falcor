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

describe('ModelSource - AsPathValues', function() {
    it("should bind and set PathValues as JSON.", function(done) {
        var model = getDataModel(new LocalDataSource(Cache()));
        var expected = Bound().directValue;
        model = model.bindSync(["videos", 1234]);
        model.
            set({path: ["summary"], value: "pie"}).
            flatMap(function() {
                return model.get(["summary"]);
            }).
            doOnNext(function(x) {
                testRunner.compare({json:{summary:"pie"}}, x);
            }).
            subscribe(noOp, done, done);
    });

    it("should bind and set PathValues as JSONG.", function(done) {
        var model = getDataModel(new LocalDataSource(Cache()));
        var expected = Bound().directValue;
        model = model.bindSync(["videos", 1234]);
        model.
            set({path: ["summary"], value: "pie"}).
            toJSONG().
            flatMap(function() {
                return model.get(["summary"]);
            }).
            do(function(x) {
                done('Should not of onNext with ' + x);
            },  function(x) {
                try {
                    expect(x[0].message).to.equals(testRunner.jsongBindException);
                    done();
                } catch(e) {
                    done({error: e});
                }
            }, function() {
                done('Should not of onCompleted');
            }).
            subscribe(noOp, noOp);
    });

    it("should bind and set PathValues as PathValues.", function(done) {
        var model = getDataModel(new LocalDataSource(Cache()));
        var expected = Bound().directValue;
        model = model.bindSync(["videos", 1234]);
        model.
            set({path: ["summary"], value: "pie"}).
            toPathValues().
            doOnNext(function(x) {
                testRunner.compare({path: ['summary'], value: 'pie'}, x);
            }).
            subscribe(noOp, done, done);
    });

    it("should bind and set PathValues w/ Selector.", function(done) {
        var model = getDataModel(new LocalDataSource(Cache()));
        var expected = Bound().directValue;
        model = model.bindSync(["videos", 1234]);
        model.
            set({path: ["summary"], value: "pie"}, function(pie) {
                testRunner.compare('pie', pie);
            }).
            subscribe(noOp, done, done);
    });
});

