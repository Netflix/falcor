var $error = require("./../types/error");
var pathSyntax = require("falcor-path-syntax");
var getBoundValue = require("./../get/getBoundValue");
var getType = require("./../support/getType");
var InvalidModelError = require("./../errors/InvalidModelError");
var $atom = require("./../types/atom");

module.exports = function derefSync(boundPathArg) {

    var boundPath = pathSyntax.fromPath(boundPathArg);

    if (!Array.isArray(boundPath)) {
        throw new Error("Model#derefSync must be called with an Array path.");
    }

    var boundValue = getBoundValue(this, this._path.concat(boundPath), false);

    var path = boundValue.path;
    var node = boundValue.value;
    var found = boundValue.found;

    if (!found) {
        return void 0;
    }

    if (node.$type) {
        throw new InvalidModelError();
    }

    return this._clone({ _path: path });
};
