var applyErrorPrototype = require("./applyErrorPrototype");

/**
 * InvalidSourceError happens when a dataSource syncronously throws
 * an exception during a get/set/call operation.
 *
 * @param {Error} innerError - The error that was thrown.
 *
 * @private
 */
function InvalidSourceError(innerError) {
    var instance = new Error("An exception was thrown when making a request.");

    instance.name = "InvalidSourceError";
    instance.innerError = innerError;

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    }

    if (Error.captureStackTrace) {
        Error.captureStackTrace(instance, InvalidSourceError);
    }

    return instance;
}

applyErrorPrototype(InvalidSourceError);

InvalidSourceError.is = function(e) {
    return e && e.name === "InvalidSourceError";
};

module.exports = InvalidSourceError;
