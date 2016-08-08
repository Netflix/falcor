var NAME = "InvalidSourceError";
var MESSAGE = "An exception was thrown when making a request.";

/**
 * InvalidSourceError happens when a dataSource syncronously throws
 * an exception during a get/set/call operation.
 *
 * @param {Error} error - The error that was thrown.
 * @private
 */
function InvalidSourceError(error) {
    var err = Error.call(this, MESSAGE);
    err.name = NAME;
    this.stack = err.stack;
    this.message = err.message;
    this.innerError = error;
    return this;
}

// instanceof will be an error, but stack will be correct because its defined
// in the constructor.
InvalidSourceError.prototype = Object.create(Error.prototype);
InvalidSourceError.prototype.name = NAME;
InvalidSourceError.is = function(e) {
    return e && e.name === NAME;
};

module.exports = InvalidSourceError;
