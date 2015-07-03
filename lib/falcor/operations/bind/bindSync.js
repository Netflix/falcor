var pathSyntax = require('falcor-path-syntax');
var falcor = require('./../../Falcor');
var noop = function() {};
var ERROR = require("../../../types/error");
var getBoundValue = require('./../../../get/getBoundValue');
var InvalidModelError = require('./../../InvalidModelError');

module.exports = function bindSync(path) {
    path = pathSyntax.fromPath(path);
    if (!Array.isArray(path)) {
        throw new Error("Model#bindSync must be called with an Array path.");
    }
    var boundValue = this.syncCheck("bindSync") && getBoundValue(this, this._path.concat(path));
    var node = boundValue.value;

    // We found a value and shorted, therefore return the invalid model
    // expection.
    if (boundValue.shorted && boundValue.found) {
        throw new InvalidModelError(path, boundValue.path);
    }

    // We were unable to bind to anything, therefore return undefined.
    else if (!node) {
        return node;
    }

    // We bound to an error, throw the error
    else if (node && node.$type === ERROR) {
        if (this._boxed) {
            throw node;
        }
        throw node.value;
    }

    // We are successful, return new model.
    return this.clone(["_path", boundValue.path]);
};
