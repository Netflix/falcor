var createErrorType = require("./createErrorType");

/**
 * InvalidSourceError happens when a dataSource syncronously throws
 * an exception during a get/set/call operation.
 *
 * @param {Error} innerError - The error that was thrown.
 *
 * @private
 */
var InvalidSourceError = createErrorType(
    "InvalidSourceError",
    "An exception was thrown when making a request.",
    ["innerError"]
);

module.exports = InvalidSourceError;
