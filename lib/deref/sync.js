var $error = require("./../types/error");
var pathSyntax = require('falcor-path-syntax');
var getBoundValue = require('./../get/getBoundValue');
var get_type = require("./../support/get-type");

module.exports = function derefSync(path) {

    path = pathSyntax.fromPath(path);

    if (!Array.isArray(path)) {
        throw new Error("Model#bindSync must be called with an Array path.");
    }

    var boundValue = this.syncCheck("bindSync") && getBoundValue(this, this._path.concat(path));

    var path = boundValue.path;
    var node = boundValue.value;
    var found = boundValue.found;
    var shorted = boundValue.shorted;
    var type;

    if(!found) {
        return undefined;
    } else if(Boolean(node) && (type = get_type(node))) {
        if(type === $error) {
            if (this._boxed) {
                throw node;
            }
            throw node.value;
        } else if(node.value === void 0) {
            return undefined;
        }
    }

    return this.clone({ _path: path });
};
