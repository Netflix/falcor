var applyErrorPrototype = require("./applyErrorPrototype");

/**
 * An invalid deref input is when deref is used with input that is not generated
 * from a get, set, or a call.
 *
 * @private
 */
function InvalidDerefInputError() {
    var instance = new Error("Deref can only be used with a non-primitive object from get, set, or call.");

    instance.name = "InvalidDerefInputError";

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    }

    if (Error.captureStackTrace) {
        Error.captureStackTrace(instance, InvalidDerefInputError);
    }

    return instance;
}

applyErrorPrototype(InvalidDerefInputError);

module.exports = InvalidDerefInputError;
