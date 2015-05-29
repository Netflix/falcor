/**
 * An InvalidModelError can only happen when a user binds, whether sync
 * or async to shorted value.  See the unit tests for examples.
 *
 * @param {String} message
 */
var InvalidModelError = function InvalidModelError(boundPath, shortedPath) {
    this.message = 'The boundPath of the model is not valid since it a value or error is found before the path ends.';
    this.stack = (new Error()).stack;
    this.boundPath = boundPath;
    this.shortedPath = shortedPath;
};

module.exports = InvalidModelError;

// instanceof will be an error.
// but stack will be correct because its defined in the constructor.
InvalidModelError.prototype = new Error();
InvalidModelError.prototype.name = 'InvalidModel';
