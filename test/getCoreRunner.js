var get = require('./../lib/get');
var Model = require('./../lib');
var expect = require('chai').expect;
var clean = require('./cleanData').clean;

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

    if (isJSONG || testConfig.boxValues) {
        clean(seed[0], {strip: ["$size"]});
        clean(expectedOutput, {strip: ["$size"]});
    }

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
