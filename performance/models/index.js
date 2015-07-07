var falcor = require('./../../index');
var legacyFalcor = require('./legacy');

var Cache = require('./../../test/data/Cache');
var LocalDataStore = require('./../../test/data/LocalDataSource');
var head = require('./../../lib/internal/head');
var tail = require('./../../lib/internal/tail');
var next = require('./../../lib/internal/next');
var prev = require('./../../lib/internal/prev');

module.exports = function() {

    var emptyModel = new falcor.Model();

    var model = new falcor.Model({cache: Cache()});
    model._root.unsafeMode = true;

    var modelWithSource = new falcor.Model({source: new LocalDataStore(Cache())});
    modelWithSource._root.unsafeMode = true;
    var modelGet = modelWithSource.get.bind(modelWithSource);
    modelWithSource.get = function() {
        modelWithSource._cache = {};
        modelWithSource._root[head] = null;
        modelWithSource._root[tail] = null;
        modelWithSource._root[prev] = null;
        modelWithSource._root[next] = null;
        modelWithSource._root.expired = [];
        return modelGet.apply(modelWithSource, arguments);
    };
   
    return {
        model: model,
        empty: emptyModel,
        modelWithSource: modelWithSource
    };
};
