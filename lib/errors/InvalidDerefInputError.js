var createErrorType = require("./createErrorType");

/**
 * An invalid deref input is when deref is used with input that is not generated
 * from a get, set, or a call.
 *
 * @private
 */
var InvalidDerefInputError = createErrorType(
    "InvalidDerefInputError",
    "Deref can only be used with a non-primitive object from get, set, or call."
);

module.exports = InvalidDerefInputError;
