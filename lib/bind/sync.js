var noop = require("falcor/support/noop");
var $error = require("falcor/types/error");
var pathSyntax = require('falcor-path-syntax');
var getBoundValue = require('falcor/get/getBoundValue');

module.exports = function bindSync(path) {

    path = pathSyntax.fromPath(path);

    if (!Array.isArray(path)) {
        throw new Error("Model#bindSync must be called with an Array path.");
    }

    var boundValue = this.syncCheck("bindSync") && getBoundValue(this, this._path.concat(path));

    var path = boundValue.path;
    var node = boundValue.value;
    var found = boundValue.found;
    var shorted = boundValue.shorted;

    if(!found) {
        return undefined;
    } else if (node && node.$type === $error) {
        if (this._boxed) {
            throw { path: path, value: node };
        }
        throw { path: path, value: node.value };
    }

    return this.clone({ _path: path });
};
