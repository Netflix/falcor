var NAME = "NullInPathToBranchError";
var MESSAGE = "Attempted to retrieve a reference target value with `null`, but reference points to a branch node.";

/**
 * Does not allow null in path
 */
function NullInPathToBranchError(referencePath) {
    var err = Error.call(this,
        "Attempted to retrieve the target of " + JSON.stringify(referencePath) +
        " with `null` at the end of the path, but the reference points to a" +
        " branch instead of a value."
    );
    err.name = NAME;
    this.stack = err.stack;
    this.message = err.message;
    return this;
}

// instanceof will be an error, but stack will be correct because its defined in the constructor.
NullInPathToBranchError.prototype = Object.create(Error.prototype);
NullInPathToBranchError.prototype.name = NAME;
NullInPathToBranchError.message = MESSAGE;

module.exports = NullInPathToBranchError;
