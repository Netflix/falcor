var applyErrorPrototype = require("./applyErrorPrototype");

/**
 * A request can only be retried up to a specified limit.  Once that
 * limit is exceeded, then an error will be thrown.
 *
 * @param {*} missingOptimizedPaths
 *
 * @private
 */
function MaxRetryExceededError(missingOptimizedPaths) {
    var instance = new Error("The allowed number of retries have been exceeded.");

    instance.name = "MaxRetryExceededError";
    instance.missingOptimizedPaths = missingOptimizedPaths || [];

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    }

    if (Error.captureStackTrace) {
        Error.captureStackTrace(instance, MaxRetryExceededError);
    }

    return instance;
}

applyErrorPrototype(MaxRetryExceededError);

MaxRetryExceededError.is = function(e) {
    return e && e.name === "MaxRetryExceededError";
};

module.exports = MaxRetryExceededError;
