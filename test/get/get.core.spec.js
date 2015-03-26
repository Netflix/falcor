var jsong = require('../../index');
var Model = jsong.Model;
var Cache = require('../data/Cache');
var Expected = require('../data/expected');
var Rx = require('rx');
var getTestRunner = require('./../getTestRunner');
var testRunner = require('./../testRunner');

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

describe('Core', function() {
    describe('Values', function() {
        it('should get a value directly', function() {
            getTestRunner(Values().direct);
        });
        it('should get a value that is a reference', function() {
            getTestRunner(Values().reference);
        });
        describe('Errors', function() {
            it('should get an error directly', function () {
                getTestRunner(Values().errorBranchSummary);
            });
            it('should get an error directly with null', function () {
                getTestRunner(Values().genreListErrorNull);
            });
        });
        describe('Missing', function() {
            it('should report a missing branch node.', function () {
                getTestRunner(Values().missingBranchSummary);
            });
            it('should report a missing leaf node.', function () {
                getTestRunner(Values().missingLeafSummary);
            });
        });
        describe('Expired', function() {
            it('should report a leaf expired by timestamp path.', function() {
                getTestRunner(Values().expiredLeafNodeTimestamp);
            });
            it('should report a leaf expired by 0 path.', function() {
                getTestRunner(Values().expiredLeafNode0);
            });
            it('should report a branch expired by timestamp path.', function() {
                getTestRunner(Values().expiredBranchNodeTimestamp);
            });
            it('should report a branch expired by 0 path.', function() {
                getTestRunner(Values().expiredBranchNode0);
            });
        });
    });
    describe('References', function() {
        it('should get a value through simple references', function() {
            getTestRunner(References().simpleReference0);
        });
        it('should get a value from a references references', function() {
            getTestRunner(References().referenceToValue);
        });
        it('should get a reference from a reference', function() {
            getTestRunner(References().referenceToReference);
        });
        it('should get a reference from a reference to the value.', function() {
            getTestRunner(References().referenceToReferenceComplete);
        });
        it('should get a value through references when the last key is null', function() {
            getTestRunner(References().referenceLeafNode);
        });
        xit('should never follow an inner reference, but short-circuit.', function() {
            getTestRunner(References().innerReference);
        });
        describe('Errors', function() {
            it('should get an error through references.', function() {
                getTestRunner(References().errorReference);
            });
            it('should get an error through double references.', function() {
                getTestRunner(References().toErrorReference);
            });
        });
        describe('Missing', function() {
            it('should report a missing reference.', function() {
                getTestRunner(References().missingReference);
            });
            it('should report a missing double reference.', function() {
                getTestRunner(References().toMissingReference);
            });
            it('should report a missing path in branch key position.', function() {
                getTestRunner(References().referenceBranchIsExpired);
            });
        });
        describe('Expired', function() {
            xit('should report a missing requested path when reference is expired.', function() {
                getTestRunner(References().referenceExpired);
            });
            xit('should report a missing requested path when a hardlinked reference becomes expired.', function() {
                var options = {
                    preCall: function(model, op, query, count) {
                        // setup hardlink to an $expires: Date.now() + 99 reference
                        model[op](model, query, count);
                        // TODO: Don't try this at home kids.  Guarantee you will be hurt.
                        model._cache.lists['future-expired-list'].$expires = Date.now() - 10;
                    },
                    useSameModel: useNewModel
                };
                getTestRunner(References().futureExpiredReference, options);
            });
        });
    });
    describe('Complex', function() {
        it('should use a complex path object with to only.', function() {
            getTestRunner(Complex().toOnly);
        });
        it('should use a complex path object with from only.', function() {
            getTestRunner(Complex().fromOnly);
        });
        it('should use a complex path object with negative from and positive to.', function() {
            getTestRunner(Complex().fromAndToWithNegativePaths);
        });
        it('should use a complex path object with from and length.', function() {
            getTestRunner(Complex().fromAndLength);
        });
        it('should use a complex path array.', function() {
            getTestRunner(Complex().fromArray);
        });
        it('should use a complex path array with objects.', function() {
            getTestRunner(Complex().arrayOfComplexPaths);
        });
        it('should use a complex path object with to only at leaf.', function() {
            getTestRunner(Complex().toOnlyLeaf);
        });
        it('should use a complex path object with from only at leaf.', function() {
            getTestRunner(Complex().fromOnlyLeaf);
        });
        it('should use a complex path object with negative from and positive to at leaf.', function() {
            getTestRunner(Complex().fromAndToWithNegativePathsLeaf);
        });
        it('should use a complex path object with from and length at leaf.', function() {
            getTestRunner(Complex().fromAndLengthLeaf);
        });
        it('should use a complex path array at leaf.', function() {
            getTestRunner(Complex().fromArrayLeaf);
        });
        it('should use a complex path array with objects at leaf.', function() {
            getTestRunner(Complex().arrayOfComplexPathsLeaf);
        });
    });
    describe('Materialized', function() {
        it('should get a value directly in materialized mode', function() {
            getTestRunner(Values().direct, { materialized: true });
        });
        it('should report an undefined sentinel for a materialized missing branch node', function() {
            getTestRunner(Materialized().missingBranch, { materialized: true });
        });
        it('should report an undefined sentinel for a materialized missing leaf node', function() {
            getTestRunner(Materialized().missingLeaf, { materialized: true });
        });
        it('should report an undefined sentinel for a materialized undefined sentinel', function() {
            getTestRunner(Materialized().sentinelOfUndefined, { materialized: true });
        });
    });
    describe('Boxed', function() {
        it('should get an Object value directly as a sentinel in boxed mode', function() {
            getTestRunner(Boxed().sentinelValue, { boxed: true });
        });
        it('should get a reference value directly as a reference in boxed mode', function() {
            getTestRunner(Boxed().referenceValue, { boxed: true });
        });
    });
    describe('Errors as Values', function() {
        it('should report an error as a value', function () {
            getTestRunner(Errors().errorBranchSummary, {errorsAsValues: true});
        });
        it('should report an error as a value with null', function () {
            getTestRunner(Errors().genreListErrorNull, {errorsAsValues: true});
        });
    });

    describe('Bind', function() {
        it('should get a value directly.', function () {
            var model = new Model({cache: Cache()}).bindSync(['videos', 1234]);
            getTestRunner(Bound().directValue, {model: model});
        });
        
        it('should bind to a value.', function () {
            var model = new Model({cache: Cache()}).bindSync(['genreList', 10]);
            getTestRunner(Bound().toLeafNode, {model: model});
        });
    });
});
