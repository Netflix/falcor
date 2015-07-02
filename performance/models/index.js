var Rx = require('rx');
global.Rx = Rx;

var falcor = require('./../../index');
var legacyFalcor = require('./legacy');

var Cache = require('./../../test/data/Cache');
var LocalDataStore = require('./../../test/data/LocalDataSource');

module.exports = function() {

    var mdpModel = legacyFalcor.getMdpModel();
    var emptyModel = new falcor.Model();

    var model = new falcor.Model({cache: Cache()});
    model._root.unsafeMode = true;

    var modelWithSource = new falcor.Model({source: new LocalDataStore(Cache())});
    modelWithSource._root.unsafeMode = true;
    var modelGet = modelWithSource.get.bind(modelWithSource);
    modelWithSource.get = function() {
        modelWithSource._cache = {};
        return modelGet.apply(modelWithSource, arguments);
    };

    var macroModel = legacyFalcor.getMacroModel();
    macroModel._root.unsafeMode = true;

    return {
        model: model,
        empty: emptyModel,
        macro: macroModel,
        mdp: mdpModel,
        modelWithSource: modelWithSource
    };
};
