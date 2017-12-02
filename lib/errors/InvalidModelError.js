var createErrorType = require("./createErrorType");

/**
 * An InvalidModelError can only happen when a user binds, whether sync
 * or async to shorted value.  See the unit tests for examples.
 *
 * @param {*} boundPath
 * @param {*} shortedPath
 *
 * @private
 */
var InvalidModelError = createErrorType(
    "InvalidModelError",
    "The boundPath of the model is not valid since a value or error was found before the path end.",
    ["boundPath", "shortedPath"]
);

module.exports = InvalidModelError;
