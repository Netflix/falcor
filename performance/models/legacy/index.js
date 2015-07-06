var Rx = require('rx');
global.Rx = Rx;

var Cache = require('./_Cache');
var _Model = require('./_');
var _Falcor = require('./macro/_Falcor');

module.exports = {
    getMdpModel: function() {
        var model = new _Model(
            100000,
            0.75,
            {
                get: function(paths) {
                    Rx.Observable.empty();
                },

                call: function(callPath, parameters, suffixes, paths) {
                    Rx.Observable.empty();
                }
            }, // loader
            Cache(), // cache
            true, // lazy
            [], // batches
            true, // streaming
            true, // connected
            false, // refreshing
            false, // materialized
            function() { return Date.now(); }
        );

        model._getPathSetsAsValues = model._getPaths;
        return model;
    },
    getMacroModel: function() {
        return new _Falcor.Model({cache: Cache()});
    }
};
