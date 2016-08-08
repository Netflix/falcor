var NAME = "CircularReferenceError";

/**
 * Does not allow null in path
 */
function CircularReferenceError(referencePath) {
    var err = Error.call(this, "Encountered circular reference " +
        JSON.stringify(referencePath));
    err.name = NAME;
    this.stack = err.stack;
    this.message = err.message;
    return this;
}

// instanceof will be an error, but stack will be correct because its defined in the constructor.
CircularReferenceError.prototype = Object.create(Error.prototype);
CircularReferenceError.prototype.name = NAME;

module.exports = CircularReferenceError;
