var NAME = "MaxRetryExceededError";
/**
 * A request can only be retried up to a specified limit.  Once that
 * limit is exceeded, then an error will be thrown.
 *
 * @private
 */
function MaxRetryExceededError() {
    this.message = "The allowed number of retries have been exceeded.";
    this.stack = (new Error()).stack;
}

// instanceof will be an error, but stack will be correct because its defined
// in the constructor.
MaxRetryExceededError.prototype = new Error();
MaxRetryExceededError.prototype.name = NAME;
MaxRetryExceededError.is = function(e) {
    return e && e.name === NAME;
};

module.exports = MaxRetryExceededError;
