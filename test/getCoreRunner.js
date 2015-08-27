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
        var input = test.input;

        // Gets the expected output, if its a
        // function, then call the function to get it.
        var expectedOutput = test.output;
        if (typeof expectedOutput === 'function') {
            expectedOutput = expectedOutput();
        }
        var requestedMissingPaths = test.requestedMissingPaths;
        var optimizedMissingPaths = test.optimizedMissingPaths;
        var errors = test.errors;
        var isJSONInput = !Array.isArray(input[0]);
        var fnKey = 'getWith' +
            (isJSONInput ? 'JSON' : 'Paths') +
            'As' +
            (isJSONG ? 'JSONGraph' : 'PathMap');
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

        var seed = [{}];
        var out = fn(model, input, seed);
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
