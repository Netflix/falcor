module.exports = function getValueSync(path) {
    if (Array.isArray(path) === false) {
        throw new Error("Model#getValueSync must be called with an Array path.");
    }
    if (this._path.length) {
        path = this._path.concat(path);
    }
    return this._syncCheck("getValueSync") && this._getValueSync(this, path).value;
};
