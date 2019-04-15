var pathSyntax = require("falcor-path-syntax");
var getValueSync = require("./getValueSync");

module.exports = function _getValueSync(pathArg) {
    var path = pathSyntax.fromPath(pathArg);
    if (Array.isArray(path) === false) {
        throw new Error("Model#_getValueSync must be called with an Array path.");
    }
    if (this._path.length) {
        path = this._path.concat(path);
    }
    this._syncCheck("getValueSync");
    return getValueSync(this, path).value;
};
