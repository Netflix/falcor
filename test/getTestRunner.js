var falcor = require("./../lib/");
var _ = require("lodash");
var Rx = require("rx");
var testRunner = require("./testRunner");
var noOp = function() {};
var chai = require("chai");
var expect = chai.expect;
var Model = falcor.Model;
var Cache = require("./data/Cache");
function getTestRunner(data, options) {
    options = _.extend({
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
                var seedsOrFunction = [{}], count;
                if (suffix === 'AsJSON') {
                    count = data[prefix].count === undefined || !data[prefix].count ? 1 : data[prefix].count;
                    seedsOrFunction = Array(count).join(",").split(",").map(function() { return {}; });
                }
                var op = "_" + prefix + suffix;


                // If this prefix operation intentionally excludes then early return.
                if (data[prefix].exclude && _.contains(data[prefix].exclude, suffix)) {
                    return;
                }
                expectedValues = data[suffix];
                expected = _.assign({}, expectedValues, universalExpectedValues);

                var model;
                if (options.model) {
                    model = options.model;
                } else {
                    model = new falcor.Model({cache: Cache()});
                }

                if(options.materialized) {
                    model._materialized = true;
                }

                if(options.boxed) {
                    model._boxed = true;
                }

                if(options.errorsAsValues) {
                    model._treatErrorsAsValues = true;
                }

                // TODO: quick debug
                switch (suffix) {
                    case 'AsPathMap':
                        break;
                    case 'AsJSON':
                        break;
                    case 'AsJSONG':
                        break;
                    case 'AsValues':
                        break;
                }
                // TODO: will verify the onNext values coming in for AsValues.
                var expectedCount = expected.values && expected.values.length;
                var actualCount = 0;
                if (suffix === 'AsValues') {
                    var vals = expected.values;
                    delete expected.values;

                    seedsOrFunction = function(pV) {
                        if (vals && vals.length) {
                            var tested = false;
                            var path = pV.path.map(toString);
                            for (var i = 0; i < vals.length; i++) {
                                var val = vals[i].path.map(toString);
                                if (_.isEqual(path, val)) {
                                    actualCount++;
                                    tested = true;
                                    testRunner.compare(vals[i], pV);
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
                preCallFn(model, op, _.cloneDeep(query), seedsOrFunction);
                actual = model[op](model, _.cloneDeep(query), seedsOrFunction, model._errorSelector);

                actual = Object.keys(expected).reduce(function(memo, key) {
                    memo[key] = actual[key];
                    return memo;
                }, {});

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

module.exports = getTestRunner;
