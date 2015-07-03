var falcor = require('./../../index');
var legacyFalcor = require('./legacy');

var mock = require("./../../lib/support/test-model");
var Cache = require('./../../test/data/Cache');

module.exports = function() {

    var mockModel = mock(Cache());
    var emptyModel = new falcor.Model();

    var model = new falcor.Model({cache: Cache()});
    model._root.unsafeMode = true;

    var mdpModel = legacyFalcor.getMdpModel();
    var macroModel = legacyFalcor.getMacroModel();
    macroModel._root.unsafeMode = true;

    return {
        model: model,
        empty: emptyModel,
        macro: macroModel,
        mdp: mdpModel,
        mock: mockModel
    };
};