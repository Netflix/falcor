var jsong = require("../bin/Falcor");
var _ = require("lodash");
var Rx = require("rx");
var testRunner = require("./testRunner");
var noOp = function() {};
var chai = require("chai");
var expect = chai.expect;
var Model = jsong.Model;
var Cache = require("./data/Cache");

function getTestRunnerHeader(model, data, options) {
    if (!(model instanceof Rx.Observable)) {
        var m = model;
        model = Rx.Observable.returnValue(m);
    }
    return model.doAction(function(dataModel) {
        getTestRunner(dataModel, data, options);
    });
}
function getTestRunner(model, data, options) {
    options = _.extend({
        useNewModel: true,
        preCall: noOp
    }, options);

    var testRunnerResults = testRunner.transformData(data);
    var prefixesAndSuffixes = testRunnerResults.prefixesAndSuffixes;
    var universalExpectedValues = testRunnerResults.universalExpectedValues;
    var preCallFn = options.preCall;
    var actual;
    var expectedValues, expected;

    prefixesAndSuffixes[0].
        filter(function (prefix) {
            return ~prefix.indexOf("get");
        }).
        forEach(function (prefix) {
            prefixesAndSuffixes[1].map(function (suffix) {
                var query = data[prefix].query;
                var countOrFunction = data[prefix].count === undefined ? 1 : 0;
                var op = "_" + prefix + suffix;
                
                countOrFunction = Array(countOrFunction).join(",").split(",").map(function() { return {}; });

                // If this prefix operation intentionally excludes then early return.
                if (data[prefix].exclude && _.contains(data[prefix].exclude, suffix)) {
                    return;
                }
                expectedValues = data[suffix];
                expected = _.assign({}, expectedValues, universalExpectedValues);

                if (options.useNewModel) {
                    model = testRunner.getModel(null, Cache());
                }
                
                // TODO: will verify the onNext values coming in for AsValues.
                debugger;
                var expectedCount = expected.values && expected.values.length;
                var actualCount = 0;
                if (suffix === 'AsValues') {
                    var vals = expected.values;
                    expected.values = undefined;
                    
                    countOrFunction = function(pV) {
                        debugger;
                        if (vals && vals.length) {
                            var tested = false;
                            var path = pV.path.map(toString);
                            for (var i = 0; i < vals.length; i++) {
                                var val = vals[i].path.map(toString);
                                if (_.isEqual(path, val)) {
                                    actualCount++;
                                    tested = true;
                                    testRunner.compare(vals[i].path, pV.path);
                                    break;
                                }
                            }
                            if (!tested) {
                                throw 'The path ' + pV.path + ' does not exist within ' + JSON.stringify(vals.map(function(x) { return x.path; }), null, 4);
                            }
                        } else {
                            throw 'There are no more values to compare against AsValues onNext callback. ' + JSON.stringify(pV);
                        }
                    };
                }

                // For doing any preprocessing.
                preCallFn(model, op, _.cloneDeep(query), countOrFunction);
                actual = model[op](model, _.cloneDeep(query), countOrFunction, model._errorSelector);

                // validates that the results from the operation and the expected values are valid.
                testRunner.validateData(expected, actual);

                // validates against the expected vs actual
                testRunner.validateOperation(op, expected, actual);

                if (suffix === 'AsValues' && expectedCount > 0) {
                    expect(actualCount).to.equal(expectedCount);
                }
            });
        });
}
function toString(x) {
    if (x === null) {
        return x;
    }
    return x + '';
}

function async(obs, model, data, options) {
    var idx = 0;
    options = options || {};
    var expectedCount = options.onNextExpected &&
        options.onNextExpected.values &&
        options.onNextExpected.values.length || 0;
    var errorThrown = false;
    var verify = options && options.verify === false ? false : true;
    return Rx.Observable.create(function(observer) {
        var n = observer.onNext.bind(observer);
        var e = observer.onError.bind(observer);
        var c = observer.onCompleted.bind(observer);
        obs.
            doOnNext(function(x) {
                if (options.onNextExpected) {
                    var expected = options.onNextExpected.values[idx++];
                    testRunner.compare(expected, x);
                }
            }).
            doOnError(function(err) {
                errorThrown = true;
                if (options.errors) {
                    testRunner.compare(options.errors, err);
                }
            }).
            doOnCompleted(function() {
                if (options.onNextExpected) {
                    expect(idx, "The amount of onNexts did not meet expected").to.equal(expectedCount);
                }
                if (verify && data && Object.keys(data).length) {
                    getTestRunner(model, data, options);
                }
            }).
            subscribe(n, function(err) {
                var threw = false;
                try {
                    if (options.errors) {
                        expect(errorThrown, "Expected an error to be thrown, and no error was.").to.be.ok;
                    } else {
                        if (err instanceof Error || toString.call(err) === "[object Error]") {
                            e(err);
                        } else {
                            e({error: err});
                        }
                        threw = true;
                    }
                } catch(ex) {
                    e(ex);
                    threw = true;
                }
                if (!threw) {
                    c();
                }
            }, c);
        
        function complete() {
        }
    });
    
}


var GetTestRunner = module.exports = {
    run: function() {
        var args = arguments;
        if (args[2] && args[2].it === false) {
            return getTestRunnerHeader.apply(null, args);
        } else {
            it("perform _get*", function(done) {
                getTestRunnerHeader.apply(null, args).subscribe(noOp, done, done);
            });
        }
    },
    runSync: function() {
        getTestRunner.apply(null, arguments);
    },
    async: async
};
