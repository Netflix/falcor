var jsong = require("../../../index");
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
var _ = require('lodash');
describe('Bind', function() {
    it('should bind to an undefined sentinel and onCompleted.', function(done) {
        var model = getDataModel(null, Cache());
        model = model.
            bindSync(["misc", "usentinel"]).
            get([]).
            subscribe(function(x) {
                // done('onNext called with value' + x + ' on a bound model to an sentinel of undefined. Expected to onCompleted only.');
            }, done, done);
    });
});

describe("BindSync", function() {
    xit('should bind to an undefined sentinel and return undefined.', function(done) {
        var model = getDataModel(null, Cache());
        model = model.bindSync(["misc", "usentinel"]);
        expect(model).to.equals(undefined);
    });
    
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
            model = model.bindSync(["genreList", 0]);
            getTestRunner.
                async(Rx.Observable.return(42), model, expected, {useNewModel: false}).
                subscribe(noOp, done, done);
        });

        it("should throw when trying to get JSONG.", function(done) {
            var model = getDataModel(null, Cache());
            var expected = Bound().onReference;
            model.
                bindSync(["genreList", 0]).
                get([0, 'summary']).
                toJSONG().
                do(function(x) {
                    done('onNext called with value' + x + ' on a bound model requesting toJSONG().');
                }, function(errs) {
                    try {
                        expect(errs[0].message).to.equals(testRunner.jsongBindException);
                        done();
                    } catch(e) {
                        done(e);
                    }
                }, function() {
                    done('onCompleted called on a bound model requesting toJSONG().');
                }).
                subscribe();
        });
    });
    
    describe("DataSource Only", function() {
        it("should bind to an object.", function(done) {
            var model = getDataModel(new LocalDataSource(Cache()), Cache());
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
            var model = getDataModel(new LocalDataSource(Cache()), Cache());
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
                doOnCompleted(function() {
                    getTestRunner.runSync(model, expected, {useNewModel: false});
                }).
                subscribe(noOp, done, done);
        });
    });
    
    describe('Set', function() {
        setCases('PathValues', {path: ['summary'], value: 'pie'});
        setCases('JSON', {summary: 'pie'});
    });
});

function setCases(name, setValue) {
    describe(name, function() {
        describe('Cache Only', function () {
            it("should bind and set the value.", function (done) {
                var model = getDataModel(null, Cache());
                var expected = Bound().directValue;
                model = model.bindSync(["videos", 1234]);
                model.
                    set(_.cloneDeep(setValue)).
                    flatMap(function () {
                        return model.get(["summary"]);
                    }).
                    doOnNext(function (x) {
                        testRunner.compare({json: {summary: "pie"}}, x);
                    }).
                    subscribe(noOp, done, done);
            });
        });
        describe('Model Source', function() {
            it('should bind and set ' + name + ' as JSON.', function(done) {
                var model = getDataModel(new LocalDataSource(Cache()));
                model = model.bindSync(['videos', 1234]);
                model.
                    set(_.cloneDeep(setValue)).
                    flatMap(function() {
                        return model.get(['summary']);
                    }).
                    doOnNext(function(x) {
                        testRunner.compare({json:{summary:'pie'}}, x);
                    }).
                    subscribe(noOp, done, done);
            });

            it('should bind and set ' + name + ' as JSONG.', function(done) {
                var model = getDataModel(new LocalDataSource(Cache()));
                var expected = Bound().directValue;
                model = model.bindSync(['videos', 1234]);
                model.
                    set(_.cloneDeep(setValue)).
                    toJSONG().
                    flatMap(function() {
                        return model.get(['summary']);
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

            it('should bind and set ' + name + ' as PathValues.', function(done) {
                var model = getDataModel(new LocalDataSource(Cache()));
                model = model.bindSync(['videos', 1234]);
                model.
                    set(_.cloneDeep(setValue)).
                    toPathValues().
                    doOnNext(function(x) {
                        testRunner.compare({path: ['summary'], value: 'pie'}, x);
                    }).
                    subscribe(noOp, done, done);
            });

            it('should bind and set ' + name + ' w/ Selector.', function(done) {
                var model = getDataModel(new LocalDataSource(Cache()));
                var expected = Bound().directValue;
                model = model.bindSync(['videos', 1234]);
                model.
                    set(_.cloneDeep(setValue), function(pie) {
                        testRunner.compare('pie', pie);
                    }).
                    subscribe(noOp, done, done);
            });
        });
    });
}