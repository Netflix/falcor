var applyErrorPrototype = require("./applyErrorPrototype");

/**
 * Does not allow null in path
 *
 * @private
 */
function NullInPathError() {
    var instance = new Error("`null` and `undefined` are not allowed in branch key positions");

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
