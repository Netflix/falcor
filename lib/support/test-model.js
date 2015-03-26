module.exports = function(cache) {
    var model = {};
    model._path  = [];
    model._cache = cache;
    model._root  = model;
    model.expired = [];
    return model;
}