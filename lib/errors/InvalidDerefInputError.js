var NAME = "InvalidDerefInputError";
var MESSAGE = "Deref can only be used with a non-primitive object from get, set, or call.";

/**
 * An invalid deref input is when deref is used with input that is not generated
 * from a get, set, or a call.
 *
 * @param {String} message
 * @private
 */
function InvalidDerefInputError() {
    var err = Error.call(this, MESSAGE);
    err.name = NAME;
    this.stack = err.stack;
    this.message = err.message;
    return this;
}

// instanceof will be an error, but stack will be correct because its defined in the constructor.
InvalidDerefInputError.prototype = Object.create(Error.prototype);
InvalidDerefInputError.prototype.name = NAME;
InvalidDerefInputError.message = MESSAGE;

module.exports = InvalidDerefInputError;
