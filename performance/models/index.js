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

    var modelWithStore = new falcor.Model({dataSource: new LocalDataStore(Cache())});
    modelWithStore._root.unsafeMode = true;

    var macroModel = legacyFalcor.getMacroModel();
    macroModel._root.unsafeMode = true;

    return {
        model: model,
        empty: emptyModel,
        macro: macroModel,
        mdp: mdpModel,
        modelWithStore: modelWithStore
    };
};
