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

    if (boundValue.shorted && boundValue.found) {
        throw new InvalidModelError(path, boundValue.path);
    } else if (node && node.$type === ERROR) {
        if (this._boxed) {
            throw node;
        }
        throw node.value;
    }
    return this.clone(["_path", boundValue.path]);
};
