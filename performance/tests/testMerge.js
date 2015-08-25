module.exports = function(suite, tests) {
    for (var t in tests) {
        suite.tests[t] = tests[t];
    }
};
