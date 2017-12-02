var createErrorType = require("./createErrorType");

/**
 * When a bound model attempts to retrieve JSONGraph it should throw an
 * error.
 *
 * @private
 */
var BoundJSONGraphModelError = createErrorType(
    "BoundJSONGraphModelError",
    "It is not legal to use the JSON Graph format from a bound Model. JSON Graph format" +
    " can only be used from a root model."
);

module.exports = BoundJSONGraphModelError;
