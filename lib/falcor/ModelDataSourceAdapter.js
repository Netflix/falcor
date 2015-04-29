function ModelDataSourceAdapter(model) {
    this._model = model.materialize().boxValues().treatErrorsAsValues();
}

ModelDataSourceAdapter.prototype = {
    get: function(pathSets) {
        return this._model.get.apply(this._model, pathSets).toJSONG();
    },
    set: function(jsongResponse) {
        return this._model.set(jsongResponse).toJSONG();
    },
    call: function(path, args, suffixes, paths) {
        var params = [path, args, suffixes].concat(paths);
        return this._model.call.apply(this._model, params).toJSONG();
    }
};

module.exports = ModelDataSourceAdapter;