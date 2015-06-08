var noop = require("falcor/support/noop");
var $error = require("falcor/types/error");
var pathSyntax = require('falcor-path-syntax');
var getBoundValue = require('falcor/get/getBoundValue');
var InvalidModelError = require('falcor/errors/InvalidModelError');

module.exports = function bindSync(path) {
    
    path = pathSyntax.fromPath(path);
    
    if (!Array.isArray(path)) {
        throw new Error("Model#bindSync must be called with an Array path.");
    }
    
    var boundValue = this.syncCheck("bindSync") && getBoundValue(this, this._path.concat(path));
    var node = boundValue.value;

    if (boundValue.shorted && boundValue.found) {
        throw new InvalidModelError(path, boundValue.path);
    } else if (node && node.$type === $error) {
        if (this._boxed) {
            throw node;
        }
        throw node.value;
    }

    return this.clone(["_path", boundValue.path]);
};
