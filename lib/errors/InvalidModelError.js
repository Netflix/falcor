var applyErrorPrototype = require("./applyErrorPrototype");

/**
 * An InvalidModelError can only happen when a user binds, whether sync
 * or async to shorted value.  See the unit tests for examples.
 *
 * @param {*} boundPath
 * @param {*} shortedPath
 *
 * @private
 */
function InvalidModelError(boundPath, shortedPath) {
    var instance = new Error("The boundPath of the model is not valid since a value or error was found before the path end.");

    instance.name = "InvalidModelError";
    instance.boundPath = boundPath;
    instance.shortedPath = shortedPath;

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    }

    if (Error.captureStackTrace) {
        Error.captureStackTrace(instance, InvalidModelError);
    }

    return instance;
}

applyErrorPrototype(InvalidModelError);

module.exports = InvalidModelError;
