var __path = require("./../internal/path");
var InvalidDerefInputError = require("./../errors/InvalidDerefInputError");

module.exports = function deref(boundJSONArg) {
    var absolutePath = boundJSONArg && boundJSONArg[__path];

    // The simple deref when there is a path.
    if (absolutePath) {
        return this._clone({
            _path: absolutePath
        });
    }

    throw new InvalidDerefInputError();
};
