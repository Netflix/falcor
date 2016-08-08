var NAME = "BoundJSONGraphModelError";
var MESSAGE = "It is not legal to use the JSON Graph " +
    "format from a bound Model. JSON Graph format" +
    " can only be used from a root model.";

/**
 * When a bound model attempts to retrieve JSONGraph it should throw an
 * error.
 *
 * @private
 */
function BoundJSONGraphModelError() {
    var err = Error.call(this, MESSAGE);
    err.name = this.name;
    this.stack = err.stack;
    this.message = err.message;
    return this;
}

// instanceof will be an error, but stack will be correct because its defined in the constructor.
BoundJSONGraphModelError.prototype = Object.create(Error.prototype);
BoundJSONGraphModelError.prototype.name = NAME;
BoundJSONGraphModelError.message = MESSAGE;

module.exports = BoundJSONGraphModelError;
