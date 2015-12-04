var NAME = "InvalidModelError";
var MESSAGE = "The boundPath of the model is not valid since a value or error was found before the path end.";
/**
 * An InvalidModelError can only happen when a user binds, whether sync
 * or async to shorted value.  See the unit tests for examples.
 *
 * @param {String} message
 * @private
 */
function InvalidModelError(boundPath, shortedPath) {
    this.message = MESSAGE;
    this.stack = (new Error()).stack;
    this.boundPath = boundPath;
    this.shortedPath = shortedPath;
}

// instanceof will be an error, but stack will be correct because its defined in the constructor.
InvalidModelError.prototype = new Error();
InvalidModelError.prototype.name = NAME;
InvalidModelError.message = MESSAGE;

module.exports = InvalidModelError;
