var createErrorType = require("./createErrorType");

/**
 * A request can only be retried up to a specified limit.  Once that
 * limit is exceeded, then an error will be thrown.
 *
 * @param {*} missingOptimizedPaths
 *
 * @private
 */
var MaxRetryExceededError = createErrorType(
    "MaxRetryExceededError",
    "The allowed number of retries have been exceeded.",
    function(instance, args) {
        instance.missingOptimizedPaths = args[0] || [];
    }
);

module.exports = MaxRetryExceededError;
