var $error = require("./../types/error");
var pathSyntax = require("falcor-path-syntax");
var getBoundValue = require("./../get/getBoundValue");
var getType = require("./../support/getType");

module.exports = function derefSync(boundPathArg) {

    var boundPath = pathSyntax.fromPath(boundPathArg);

    if (!Array.isArray(boundPath)) {
        throw new Error("Model#derefSync must be called with an Array path.");
    }

    var boundValue = getBoundValue(this, this._path.concat(boundPath));

    var path = boundValue.path;
    var node = boundValue.value;
    var found = boundValue.found;

    if (!found) {
        return void 0;
    }

    var type = getType(node);

    if (Boolean(node) && Boolean(type)) {
        if (type === $error) {
            if (this._boxed) {
                throw node;
            }
            throw node.value;
        } else if (node.value === void 0) {
            return void 0;
        }
    }

    return this._clone({ _path: path });
};
