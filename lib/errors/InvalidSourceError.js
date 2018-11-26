var applyErrorPrototype = require("./applyErrorPrototype");

/**
 * InvalidSourceError happens when a dataSource syncronously throws
 * an exception during a get/set/call operation.
 *
 * @param {Error} error - The error that was thrown.
 *
 * @private
 */
function InvalidSourceError(error) {
    var instance = new Error("An exception was thrown when making a request.");

    instance.name = "InvalidSourceError";
    instance.innerError = error;

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    }

    if (Error.captureStackTrace) {
        Error.captureStackTrace(instance, InvalidSourceError);
    }

    return instance;
}

applyErrorPrototype(InvalidSourceError);

module.exports = InvalidSourceError;
