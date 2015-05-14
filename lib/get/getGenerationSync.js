var __generation = require('./../internal/generation');

module.exports = function _getGenerationSync(path) {
    // ultra fast clone for boxed values.
    var gen = this._getValueSync({
        _boxed: true,
        _root: this._root,
        _cache: this._cache,
        _treatErrorsAsValues: this._treatErrorsAsValues
    }, path, true).value;
    return gen && gen[__generation];
};
