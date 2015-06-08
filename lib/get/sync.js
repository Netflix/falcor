var pathSyntax = require('falcor-path-syntax');

module.exports = function getValueSync(path) {
    path = pathSyntax.fromPath(path);
    if (Array.isArray(path) === false) {
        throw new Error("Model#getValueSync must be called with an Array path.");
    }
    if (this._path.length) {
        path = this._path.concat(path);
    }
    return this.syncCheck("getValueSync") && this._getValueSync(this, path).value;
};