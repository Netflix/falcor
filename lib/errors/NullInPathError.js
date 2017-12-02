var createErrorType = require("./createErrorType");

/**
 * Does not allow null in path.
 *
 * @private
 */
var NullInPathError = createErrorType(
    "NullInPathError",
    "`null` is not allowed in branch key positions."
);

module.exports = NullInPathError;
