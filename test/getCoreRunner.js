var get = require('./../lib/get');
var Model = require('./../lib');
var expect = require('chai').expect;
var clean = require('./cleanData').clean;
var convert = require('./cleanData').convert;
var internalKeys = require('./../lib/internal');
var getCachePosition = require('./../lib/get/getCachePosition');

module.exports = function(testConfig) {
    var isJSONG = testConfig.isJSONG;

    // Gets the expected output, if its a
    // function, then call the function to get it.
    var expectedOutput = testConfig.output;
    if (typeof expectedOutput === 'function') {
        expectedOutput = expectedOutput();
    }
    var requestedMissingPaths = testConfig.requestedMissingPaths;
    var optimizedMissingPaths = testConfig.optimizedMissingPaths;
    var errors = testConfig.errors;
    var type = testConfig.input && testConfig.input[0] ||
        testConfig.inputs && testConfig.inputs[0] && testConfig.inputs[0][0];
    var isJSONInput = !Array.isArray(type);
    var fnKey = 'getWithPathsAs' + (isJSONG ? 'JSONGraph' : 'PathMap');
    var fn = get[fnKey];
    var cache = testConfig.cache;
    if (typeof cache === 'function') {
        cache = cache();
    }
    var source = testConfig.source;
    var model;
    if (testConfig.model) {
        model = testConfig.model;
    }
    else {
        model = new Model({
            cache: cache,
            source: source
        });
    }

    // It only make sense to have one of these on at a time. but
    // you can have both on, fromWhenceYouCame will always win.
    if (testConfig.fromWhenceYouCame) {
        model = model._fromWhenceYouCame(true);
    }

    if (testConfig.treatErrorsAsValues) {
        model = model.treatErrorsAsValues();
    }

    if (testConfig.boxValues) {
        model = model.boxValues();
    }

    // TODO: This is cheating, but its intentional for testing
    if (testConfig.deref) {
        model._path = testConfig.deref;

        // add the reference container to the model as well if there is one.
        if (testConfig.referenceContainer) {
            model._referenceContainer =
                getCachePosition(model, testConfig.referenceContainer);
        }
    }

    if (testConfig.materialize) {
        model = model._materialize();
    }

    var seed = [{}];
    var out;

    if (testConfig.input) {
        out = fn(model, testConfig.input, seed);
    }

    else {
        testConfig.inputs.forEach(function(input) {
            out = fn(model, input, seed);
        });
    }

    var valueNode = out.values && out.values[0];

    // $size is stripped out of basic core tests.
    // We have to strip out parent as well from the output since it will produce
    // infinite recursion.
    clean(valueNode, {strip: ['$size', '$__path']});
    clean(expectedOutput, {strip: ['$size', '$__path']});

    if (expectedOutput) {
        expect(valueNode).to.deep.equals(expectedOutput);
    }
    if (requestedMissingPaths) {
        expect(out.requestedMissingPaths).to.deep.equals(requestedMissingPaths);
    }
    if (optimizedMissingPaths) {
        expect(out.optimizedMissingPaths).to.deep.equals(optimizedMissingPaths);
    }
    if (errors) {
        expect(out.errors).to.deep.equals(errors);
    }
};
