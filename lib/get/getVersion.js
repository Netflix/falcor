module.exports = function _getVersion(model, path) {
    // ultra fast clone for boxed values.
    var gen = model.__getValueSync({
        _boxed: true,
        _root: model._root,
        _treatErrorsAsValues: model._treatErrorsAsValues
    }, path, true).value;
    var version = gen && gen.ツversion;
    return (version == null) ? -1 : version;
};
