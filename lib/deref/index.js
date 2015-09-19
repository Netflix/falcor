var __key = require("./../internal/key");
var __path = require("./../internal/path");
var __parent = require("./../internal/parent");
var InvalidDerefInputError = require("./../errors/InvalidDerefInputError");

module.exports = function deref(boundJSONArg) {
    var path = boundJSONArg && boundJSONArg[__path];

    // The simple deref when there is a path.
    if (path) {
        return this._clone({
            _path: path
        });
    }

    var key = boundJSONArg && boundJSONArg[__key];

    // This is an invalid argument.  Must* be a generated JSON object from
    // get.  * - Technically this can just be passed in but don't do that.
    if (path === undefined && key === undefined) {
        throw new InvalidDerefInputError();
    }

    // We have to follow the path back up recursively until we hit a path
    // or a null parent.
    var reversedKeys = [key];
    var reversedLength = 0;
    var current = boundJSONArg[__parent];
    path = null;
    while (current !== null && !path) {
        key = current[__key];
        path = current[__path];

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
    if (path) {
        for (i = 0, len = path.length; i < len; ++i) {
            nextPath[++nextPathLength] = path[i];
        }
    }
    for (i = reversedKeys.length - 1; i >= 0; --i) {
        nextPath[++nextPathLength] = reversedKeys[i];
    }

    // Finaly clone the path.
    return this._clone({
        _path: nextPath
    });
};
