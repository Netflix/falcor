var testReporter;

if (typeof process === 'object' && process.env) {
    testReporter = require('./nodeTestReporter');
} else {
    testReporter = require('./browserTestReporter');
}

module.exports = testReporter;