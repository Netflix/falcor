var get = require('./../lib/get');
var Model = require('./../lib');
var expect = require('chai').expect;
var clean = require('./cleanData').clean;

module.exports = function(tests) {
    var only = [];
    tests.forEach(function(test) {
        if (test.only) {
            only.push(test);
        }
    });

    if (only.length) {
        tests = only;
    }

    tests.forEach(function(test) {
        run(test);
    });
};

function run(test) {
    it(test.it, function() {
        var isJSONG = test.isJSONG;

        // Gets the expected output, if its a
        // function, then call the function to get it.
        var expectedOutput = test.output;
        if (typeof expectedOutput === 'function') {
            expectedOutput = expectedOutput();
        }
        var requestedMissingPaths = test.requestedMissingPaths;
        var optimizedMissingPaths = test.optimizedMissingPaths;
        var errors = test.errors;
        var type = test.input && test.input[0] || test.inputs[0][0];
        var isJSONInput = !Array.isArray(type);
        var fnKey = 'getWithPathsAs' + (isJSONG ? 'JSONGraph' : 'PathMap');
        var fn = get[fnKey];
        var cache = test.cache;
        if (typeof cache === 'function') {
            cache = cache();
        }
        var source = test.source;
        var model = new Model({
            cache: cache,
            source: source
        });

        if (test.treatErrorsAsValues) {
            model = model.treatErrorsAsValues();
        }

        if (test.boxValues) {
            model = model.boxValues();
        }

        // TODO: This is cheating, but its intentional for testing
        if (test.deref) {
            model._path = test.deref;
        }

        if (test.materialize) {
            model = model._materialize();
        }

        var seed = [{}];
        var out;

        if (test.input) {
            out = fn(model, test.input, seed);
        }

        else {
            test.inputs.forEach(function(input) {
                out = fn(model, input, seed);
            });
        }

        if (isJSONG || test.boxValues) {
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
    });
}
