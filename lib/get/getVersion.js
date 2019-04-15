var getValueSync = require("./getValueSync");

module.exports = function _getVersion(model, path) {
    // ultra fast clone for boxed values.
    var gen = getValueSync({
        _boxed: true,
        _root: model._root,
        _treatErrorsAsValues: model._treatErrorsAsValues
    }, path, true).value;
    var version = gen && gen.$_version;
    return (version == null) ? -1 : version;
};
