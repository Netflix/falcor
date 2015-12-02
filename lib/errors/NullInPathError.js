var NAME = "NullInPathError";
var MESSAGE = "`null` is not allowed in branch key positions.";

/**
 * Does not allow null in path
 */
function NullInPathError() {
    this.message = MESSAGE;
    this.stack = (new Error()).stack;
}

// instanceof will be an error, but stack will be correct because its defined in the constructor.
NullInPathError.prototype = new Error();
NullInPathError.prototype.name = NAME;
NullInPathError.message = MESSAGE;

module.exports = NullInPathError;
