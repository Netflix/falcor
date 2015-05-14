var __generation = require('./../internal/generation');

module.exports = function _getGenerationSync(model, path) {
    // ultra fast clone for boxed values.
    var gen = model._getValueSync({
        _boxed: true,
        _root: model._root,
        _cache: model._cache,
        _treatErrorsAsValues: model._treatErrorsAsValues
    }, path, true).value;
    return gen && gen[__generation];
};
