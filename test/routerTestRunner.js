var chai = require('chai');
var expect = chai.expect;
var TestRunner = require('falcor-router/test/TestRunner');
var RouterTestRunner = {
    run: function(obs, expected) {
        var count = 0;
        return obs.
            do(function(x) {
                // Validates against all comparables
                expected.forEach(function(c) {
                    TestRunner.partialCompare(x, c);
                });
                count++;
            }, undefined, function() {
                expect(count, 'The observable should of onNext one time').to.equal(1);
            });
        
    },
    
    partialCompare: function(expectedPartials, returnMessage) {
        expectedPartials.forEach(function(expected) {
            TestRunner.partialCompare(returnMessage, expected);
        });
    }
};

module.exports = RouterTestRunner;
