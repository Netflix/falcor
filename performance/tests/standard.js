var testMerge = require('./testMerge');
var standardTest = {
    './get/get.core.perf.js': 5,
    //'./set/set.json-graph.perf': 5
};

module.exports = function(name) {
    // Creates the test suites
    var suite = require('./testSuite')(name);

    // merges tests
    for (var k in standardTest) {
        require(k)(suite.tests, standardTest[k]);
    }

    return suite;
};
