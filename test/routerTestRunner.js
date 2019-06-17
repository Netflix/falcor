var TestRunner = require('falcor-router/test/TestRunner');
var RouterTestRunner = {
    run: function(obs, expected) {
        var count = 0;
        return obs.
            do(function(x) {
                // Validates against all comparables
                expected.forEach(function(c) {
                    TestRunner.partialCompare(c, x);
                });
                count++;
            }, undefined, function() {
                expect(count).toBe(1);
            });

    },
    
    partialCompare: function(expectedPartials, returnMessage) {
        expectedPartials.forEach(function(expected) {
            TestRunner.partialCompare(expected, returnMessage);
        });
    }
};

module.exports = RouterTestRunner;
