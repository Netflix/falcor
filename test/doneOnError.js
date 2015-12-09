var isAssertionError = require('./isAssertionError');

// Convienence function for unit tests and assertion errors.
module.exports = function doneOnError(done) {
    return function(e) {
        if (isAssertionError(e)) {
            return done(e);
        }
        return done();
    };
};
