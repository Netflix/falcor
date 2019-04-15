var applyErrorPrototype = require("./applyErrorPrototype");

/**
 * When a bound model attempts to retrieve JSONGraph it should throw an
 * error.
 *
 * @private
 */
function BoundJSONGraphModelError() {
    var instance = new Error("It is not legal to use the JSON Graph " +
    "format from a bound Model. JSON Graph format" +
    " can only be used from a root model.");

    instance.name = "BoundJSONGraphModelError";

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    }

    if (Error.captureStackTrace) {
        Error.captureStackTrace(instance, BoundJSONGraphModelError);
    }

    return instance;
}

applyErrorPrototype(BoundJSONGraphModelError);

module.exports = BoundJSONGraphModelError;
