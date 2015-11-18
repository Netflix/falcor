var NAME = "InvalidSourceError";
/**
 * InvalidSourceError happens when a dataSource syncronously throws
 * an exception during a get/set/call operation.
 *
 * @param {Error} error - The error that was thrown.
 * @private
 */
function InvalidSourceError(error) {
    this.message = "An exception was thrown when making a request.";
    this.stack = (new Error()).stack;
    this.innerError = error;
}

// instanceof will be an error, but stack will be correct because its defined
// in the constructor.
InvalidSourceError.prototype = new Error();
InvalidSourceError.prototype.name = NAME;
InvalidSourceError.is = function(e) {
    return e && e.name === NAME;
};

module.exports = InvalidSourceError;
