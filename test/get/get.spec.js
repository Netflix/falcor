var jsong = require("../../bin/Falcor");
var Model = jsong.Model;
var Cache = require("../data/Cache");
var Expected = require("../data/expected");
var Rx = require("rx");
var runGetTests = require("./../getTestRunner").run;
var testRunner = require("./../testRunner");

/**
 * @param newModel
 * @returns {Model}
 */
function getModel(newModel, cache) {
    return newModel ? testRunner.getModel(null, cache || {}) : model;
}
var model = testRunner.getModel(null, Cache());
var References = Expected.References;
var Complex = Expected.Complex;
var Values = Expected.Values;
var Bound = Expected.Bound;
var Materialized = Expected.Materialized;
var Boxed = Expected.Boxed;
var Errors = Expected.Errors;

describe("Use New Model", function() {
    execute(true);
});
//describe("Use Same Model", function() {
//     execute(false);
//     execute(false);
//});

function execute(useNewModel) {
    describe("Values", function() {
        describe("should get a value directly", function() {
            runGetTests(getModel(useNewModel), Values().direct, {useNewModel: useNewModel});
        });
        describe("should get a value that is a references", function() {
            runGetTests(getModel(useNewModel), Values().reference, {useNewModel: useNewModel});
        });
        describe("Sentinels", function() {
            describe("should get a sentinel value", function() {
                runGetTests(getModel(useNewModel), Values().sentinelSummary, {useNewModel: useNewModel});
            });
        });
        describe("Errors", function() {
            describe("should get an error directly", function () {
                runGetTests(getModel(useNewModel), Values().errorBranchSummary, {useNewModel: useNewModel});
            });
            describe("should get an error directly with null", function () {
                runGetTests(getModel(useNewModel), Values().genreListErrorNull, {useNewModel: useNewModel});
            });
        });
        describe("Missing", function() {
            describe("should report a missing branch node.", function () {
                runGetTests(getModel(useNewModel), Values().missingBranchSummary, {useNewModel: useNewModel});
            });
            describe("should report a missing leaf node.", function () {
                runGetTests(getModel(useNewModel), Values().missingLeafSummary, {useNewModel: useNewModel});
            });
        });
        describe("Expired", function() {
            describe("should report a leaf expired by timestamp path.", function() {
                runGetTests(getModel(useNewModel), Values().expiredLeafNodeTimestamp, {useNewModel: useNewModel});
            });
            describe("should report a leaf expired by 0 path.", function() {
                runGetTests(getModel(useNewModel), Values().expiredLeafNode0, {useNewModel: useNewModel});
            });
            describe("should report a branch expired by timestamp path.", function() {
                runGetTests(getModel(useNewModel), Values().expiredBranchNodeTimestamp, {useNewModel: useNewModel});
            });
            describe("should report a branch expired by 0 path.", function() {
                runGetTests(getModel(useNewModel), Values().expiredBranchNode0, {useNewModel: useNewModel});
            });
        });
    });
    describe("References", function() {
        describe("should get a value through simple references", function() {
            runGetTests(getModel(useNewModel), References().simpleReference0, {useNewModel: useNewModel});
        });
        describe("should get a value from a references references", function() {
            runGetTests(getModel(useNewModel), References().referenceToValue, {useNewModel: useNewModel});
        });
        describe("should get a reference from a reference", function() {
            runGetTests(getModel(useNewModel), References().referenceToReference, {useNewModel: useNewModel});
        });
        describe("should get a reference from a reference to the value.", function() {
            runGetTests(getModel(useNewModel), References().referenceToReferenceComplete, {useNewModel: useNewModel});
        });
        describe("should get a value through references when the last key is null", function() {
            runGetTests(getModel(useNewModel), References().referenceLeafNode, {useNewModel: useNewModel});
        });
        xdescribe("should never follow an inner reference, but short-circuit.", function() {
            runGetTests(getModel(useNewModel), References().innerReference, {useNewModel: useNewModel});
        });
        describe("Sentinels", function() {
            describe("should get a sentinel reference", function() {
                runGetTests(getModel(useNewModel), References().sentinelReference, {useNewModel: useNewModel});
            });
            describe("should get a sentinel double reference", function() {
                runGetTests(getModel(useNewModel), References().toSentinelReference, {useNewModel: useNewModel});
            });
            describe("should get an error that is in branch key position.", function () {
                runGetTests(getModel(useNewModel), References().errorReferenceInBranchKey, {useNewModel: useNewModel});
            });
        });
        describe("Errors", function() {
            describe("should get an error through references.", function() {
                runGetTests(getModel(useNewModel), References().errorReference, {useNewModel: useNewModel});
            });
            describe("should get an error through double references.", function() {
                runGetTests(getModel(useNewModel), References().toErrorReference, {useNewModel: useNewModel});
            });
        });
        describe("Missing", function() {
            describe("should report a missing reference.", function() {
                runGetTests(getModel(useNewModel), References().missingReference, {useNewModel: useNewModel});
            });
            describe("should report a missing double reference.", function() {
                runGetTests(getModel(useNewModel), References().toMissingReference, {useNewModel: useNewModel});
            });
            describe("should report a missing path in branch key position.", function() {
                runGetTests(getModel(useNewModel), References().referenceBranchIsMissing, {useNewModel: useNewModel});
            });
        });
        describe("Expired", function() {
            describe("should report a missing requested path when reference is expired.", function() {
                runGetTests(getModel(useNewModel), References().referenceExpired, {useNewModel: useNewModel});
            });
            xdescribe("should report a missing requested path when a hardlinked reference becomes expired.", function() {
                var options = {
                    preCall: function(model, op, query, count) {
                        // setup hardlink to an $expires: Date.now() + 99 reference
                        model[op](model, query, count);
                        // TODO: Don't try this at home kids.  Guarantee you will be hurt.
                        model._cache.lists["future-expired-list"].$expires = Date.now() - 10;
                    },
                    useSameModel: useNewModel
                };
                runGetTests(getModel(useNewModel), References().futureExpiredReference, options);
            });
        });
    });
    describe("Complex", function() {
        describe("should use a complex path object with to only.", function() {
            runGetTests(getModel(useNewModel), Complex().toOnly, {useNewModel: useNewModel});
        });
        describe("should use a complex path object with from only.", function() {
            runGetTests(getModel(useNewModel), Complex().fromOnly, {useNewModel: useNewModel});
        });
        describe("should use a complex path object with negative from and positive to.", function() {
            runGetTests(getModel(useNewModel), Complex().fromAndToWithNegativePaths, {useNewModel: useNewModel});
        });
        describe("should use a complex path object with from and length.", function() {
            runGetTests(getModel(useNewModel), Complex().fromAndLength, {useNewModel: useNewModel});
        });
        describe("should use a complex path array.", function() {
            runGetTests(getModel(useNewModel), Complex().fromArray, {useNewModel: useNewModel});
        });
        describe("should use a complex path array with objects.", function() {
            runGetTests(getModel(useNewModel), Complex().arrayOfComplexPaths, {useNewModel: useNewModel});
        });
        describe("should use a complex path object with to only at leaf.", function() {
            runGetTests(getModel(useNewModel), Complex().toOnlyLeaf, {useNewModel: useNewModel});
        });
        describe("should use a complex path object with from only at leaf.", function() {
            runGetTests(getModel(useNewModel), Complex().fromOnlyLeaf, {useNewModel: useNewModel});
        });
        describe("should use a complex path object with negative from and positive to at leaf.", function() {
            runGetTests(getModel(useNewModel), Complex().fromAndToWithNegativePathsLeaf, {useNewModel: useNewModel});
        });
        describe("should use a complex path object with from and length at leaf.", function() {
            runGetTests(getModel(useNewModel), Complex().fromAndLengthLeaf, {useNewModel: useNewModel});
        });
        describe("should use a complex path array at leaf.", function() {
            runGetTests(getModel(useNewModel), Complex().fromArrayLeaf, {useNewModel: useNewModel});
        });
        describe("should use a complex path array with objects at leaf.", function() {
            runGetTests(getModel(useNewModel), Complex().arrayOfComplexPathsLeaf, {useNewModel: useNewModel});
        });
    });
    describe("Materialized", function() {
        describe("should get a value directly in materialized mode", function() {
            runGetTests(getModel(useNewModel), Values().direct, { useNewModel: useNewModel, materialized: true });
        });
        describe("should report an undefined sentinel for a materialized missing branch node", function() {
            runGetTests(getModel(useNewModel), Materialized().missingBranch, { useNewModel: useNewModel, materialized: true });
        });
        describe("should report an undefined sentinel for a materialized missing leaf node", function() {
            runGetTests(getModel(useNewModel), Materialized().missingLeaf, { useNewModel: useNewModel, materialized: true });
        });
        describe("should report an undefined sentinel for a materialized undefined sentinel", function() {
            runGetTests(getModel(useNewModel), Materialized().sentinelOfUndefined, { useNewModel: useNewModel, materialized: true });
        });
    });
    describe("Boxed", function() {
        describe("should get a primitive value directly as a sentinel in boxed mode", function() {
            runGetTests(getModel(useNewModel), Boxed().primitiveValue, { useNewModel: useNewModel, boxed: true });
        });
        describe("should get a group value directly as a sentinel in boxed mode", function() {
            runGetTests(getModel(useNewModel), Values().direct, { useNewModel: useNewModel, boxed: true });
        });
        describe("should get a reference value in boxed mode", function() {
            runGetTests(getModel(useNewModel), Boxed().referenceValue, { useNewModel: useNewModel, boxed: true });
        });
        describe("should get a sentinel value in boxed mode", function() {
            runGetTests(getModel(useNewModel), Boxed().sentinelValue, { useNewModel: useNewModel, boxed: true });
        });
    });
    describe("Errors as Values", function() {
        describe("should report an error as a value", function () {
            runGetTests(getModel(useNewModel), Errors().errorBranchSummary, {useNewModel: useNewModel, errorsAsValues: true});
        });
        describe("should report an error as a value with null", function () {
            runGetTests(getModel(useNewModel), Errors().genreListErrorNull, {useNewModel: useNewModel, errorsAsValues: true});
        });
    });
}

