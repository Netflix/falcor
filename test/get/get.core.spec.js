var falcor = require("./../../lib/");
var Model = falcor.Model;
var Cache = require('../data/Cache');
var Expected = require('../data/expected');
var Rx = require('rx');
var getTestRunner = require('./../getTestRunner');
var testRunner = require('./../testRunner');
var model = testRunner.getModel(null, Cache());
var References = Expected.References;
var Heterogeneous = Expected.Heterogeneous;
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
        it('should never follow an inner reference, but short-circuit.', function() {
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
                getTestRunner(References().referenceBranchIsMissing);
            });
            it('should report a missing path with first position reference.', function() {
                getTestRunner(References().missingFirstKey);
            });
        });
        describe('Expired', function() {
            it('should report a missing requested path when reference is expired.', function() {
                getTestRunner(References().referenceExpired);
            });
        });
    });
    describe('Complex', function() {
        it('should use a complex path object with to only.', function() {
            getTestRunner(Complex().toOnly);
        });
        it('should use a complex path object with 2 complex keys.', function() {
            getTestRunner(Complex().doubleComplex);
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
        it('should report an undefined atom for a materialized missing branch node', function() {
            getTestRunner(Materialized().missingBranch, { materialized: true });
        });
        it('should report an undefined atom for a materialized missing leaf node', function() {
            getTestRunner(Materialized().missingLeaf, { materialized: true });
        });
        it('should report an undefined atom for a materialized undefined atom', function() {
            getTestRunner(Materialized().atomOfUndefined, { materialized: true });
        });
        it('should not report a materialized path when there is a source.', function() {
            var model = new Model({cache: Cache(), source: {}}).materialize();
            getTestRunner(Materialized().routerOrSourceMissing, { model: model });
        });
    });
    describe('Boxed', function() {
        it('should get an Object value directly as a atom in boxed mode', function() {
            getTestRunner(Boxed().atomValue, { boxed: true });
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
    describe('Mixed Modes', function() {
        it('should report a value when coming across an error with treateErrorsAsValues + boxValues', function () {
            getTestRunner(Heterogeneous().errorWithBoxedAndTreatErrorAsValues, {errorsAsValues: true, boxed: true});
        });
    });

    describe('Deref', function() {
        it('should get a value directly.', function () {
            var model = new Model({cache: Cache()}).derefSync(['videos', 1234]);
            getTestRunner(Bound().directValue, {model: model});
        });

        it('should deref to a value.', function () {
            var model = new Model({cache: Cache()}).derefSync(['genreList', 10]);
            getTestRunner(Bound().toLeafNode, {model: model});
        });

        it('should deref to a value and get multiple paths.', function () {
            var model = new Model({cache: Cache()}).derefSync(['videos', 3355]);
            getTestRunner(Bound().multipleQueries, {model: model});
        });

        it('should deref and request a missing path through a reference so the optimized path gets reset.', function () {
            var model = new Model({cache: Cache()}).derefSync(['genreList']);
            getTestRunner(Bound().missingValueWithReference, {model: model});
        });
        it('should deref and request a missing path.', function () {
            var model = new Model({cache: Cache()}).derefSync(['videos', 'missingSummary']);
            getTestRunner(Bound().missingValue, {model: model});
        });

        it('should throw an error when bound and calling jsonGraph.', function() {
            var model = new Model({cache: Cache()}).derefSync(['genreList', 10]);
            var threw = false;
            try {
                model._getPathSetsAsJSONG(model, [['summary']]);
            } catch(ex) {
                threw = true;
                testRunner.compare(testRunner.jsonGraphDerefException, ex.message);
            }
            testRunner.compare(true, threw);
        });
    });
    require('./get.core.specifics.spec');
});
