module.exports = function getModel(options) {
    options = options || {};
    var root = {};
    root.lru = options.lru || root,
    root.cache = options.cache || new Object(),
    root.expired = options.expired || new Array(),
    root.version = options.version || 0;
    var model = { _root: root };
    model._path = options.path || new Array();
    return model;
}
