var __key = require("./../internal/key");
var __refReference = require("./../internal/refRef");
var __parent = require("./../internal/parent");
var InvalidDerefInputError = require("./../errors/InvalidDerefInputError");

module.exports = function deref(boundJSONArg) {
    var reference = boundJSONArg && boundJSONArg[__refReference];

    // The simple deref when there is a path.
    if (reference) {
        return this._clone({
            _fromReference: reference,
            _path: reference.value
        });
    }

    var key = boundJSONArg && boundJSONArg[__key];

    // This is an invalid argument.  Must* be a generated JSON object from
    // get.  * - Technically this can just be passed in but don't do that.
    if (reference === undefined && key === undefined) {
        throw new InvalidDerefInputError();
    }

    // We have to follow the path back up recursively until we hit a path
    // or a null parent.
    var reversedKeys = [key];
    var reversedLength = 0;
    var current = boundJSONArg[__parent];
    reference = null;
    while (current !== null && !reference) {
        key = current[__key];
        reference = current[__refReference];

        if (key !== undefined) {
            reversedKeys[++reversedLength] = key;
            current = current[__parent];
        }
    }

    // The construction of the path is
    // path.concat([keyN, keyN - 1, ... keyN - (N - 1)])
    var nextPath = [];
    var nextPathLength = -1;
    var i, len;
    if (reference) {
        var referenceValue = reference.value;
        for (i = 0, len = referenceValue.length; i < len; ++i) {
            nextPath[++nextPathLength] = referenceValue[i];
        }
    }
    for (i = reversedKeys.length - 1; i >= 0; --i) {
        nextPath[++nextPathLength] = reversedKeys[i];
    }

    // This is the key for creating a path from key/parent combo's only
    // and there was already a bound path.  If we follow a reference (path
    // variable is defined) then we do not need to concat any paths.
    if (!reference && this._path.length) {
        nextPath = this._path.concat(nextPath);
        reference = this._fromReference;
    }

    // Finaly clone the path.
    return this._clone({
        _path: nextPath,
        _fromReference: reference
    });
};
