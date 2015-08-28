var testMerge = require('./testMerge');

module.exports = function(name) {
    // Creates the test suites
    var suite = require('./testSuite')(name);
    testMerge(suite, require('./get/onValue.perf'));

    return suite;
};
