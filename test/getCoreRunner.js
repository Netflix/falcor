var get = require('./../lib/get');
var Model = require('./../lib');
var expect = require('chai').expect;
var clean = require('./cleanData').clean;
var convert = require('./cleanData').convert;
var __parent = require('./../lib/internal/parent');
var __key = require('./../lib/internal/key');
var __refReference = require('./../lib/internal/refRef');

var convertConfig = {};
convertConfig[__parent] = function parentConverter(value) {
    if (value) {
        return value[__key];
    }
    return null;
};
convertConfig[__refReference] = function referenceConverter(value) {
    // its been converted already by some other mechanism.
    if (Array.isArray(value)) {
        return value;
    }
    return value.value;
};

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
        testConfig.inputs[0][0];
    var isJSONInput = !Array.isArray(type);
    var fnKey = 'getWithPathsAs' + (isJSONG ? 'JSONGraph' : 'PathMap');
    var fn = get[fnKey];
    var cache = testConfig.cache;
    if (typeof cache === 'function') {
        cache = cache();
    }
    var source = testConfig.source;
    var model = new Model({
        cache: cache,
        source: source
    });

    if (testConfig.treatErrorsAsValues) {
        model = model.treatErrorsAsValues();
    }

    if (testConfig.boxValues) {
        model = model.boxValues();
    }

    // TODO: This is cheating, but its intentional for testing
    if (testConfig.deref) {
        model._path = testConfig.deref;
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


    // $size is stripped out of basic core tests.
    // We have to strip out parent as well from the output since it will produce
    // infinite recursion.
    convert(seed[0], convertConfig);
    convert(expectedOutput, convertConfig);
    clean(seed[0], {strip: ['$size']});
    clean(expectedOutput, {strip: ['$size']});

    if (expectedOutput) {
        expect(seed[0]).to.deep.equals(expectedOutput);
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
