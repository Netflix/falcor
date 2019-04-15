var lru = require('./lru');
var get = require('./get/get.perf');
var getCore = require('./get/get.core.perf');
var set = require('./set/set.json-graph.perf');
var clone = require('./clone/clone.perf');

var standardTests = [[get, 7], getCore, set, clone, lru];

module.exports = function(name) {
    // Create the test suites
    var suite = require('./testSuite')(name);

    // Merge tests
    for (var i = 0; i < standardTests.length; i++) {
        var test = standardTests[i];
        if (Array.isArray(test)) {
            var _test = test[0];
            var count = test[1];
            _test(suite.tests, count);
        } else {
            test(suite.tests);
        }
    }

    return suite;
};
