var applyErrorPrototype = require("./applyErrorPrototype");

/**
 * Does not allow null in path
 *
 * @private
 * @param {Object} [options] - Optional object containing additional error information
 * @param {Array} [options.requestedPath] - The path that was being processed when the error occurred
 */
function NullInPathError(options) {
    var requestedPathString = options && options.requestedPath && options.requestedPath.join ? options.requestedPath.join(", ") : "";
    var instance = new Error("`null` and `undefined` are not allowed in branch key positions for requested path: " + requestedPathString);

    instance.name = "NullInPathError";

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    }

    if (Error.captureStackTrace) {
        Error.captureStackTrace(instance, NullInPathError);
    }

    return instance;
}

applyErrorPrototype(NullInPathError);

module.exports = NullInPathError;
