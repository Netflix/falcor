"use strict";

var root = typeof window !== 'undefined' ? window : global;

function falcor(opts) {
    var model = new falcor.Model(opts);

    var hook = root.__FALCOR_DEVTOOLS_GLOBAL_HOOK__;
    if (hook) {
        hook.setModel(model);
    }
    return model;
}

/**
 * A filtering method for keys from a falcor json response.  The only gotcha
 * to this method is when the incoming json is undefined, then undefined will
 * be returned.
 *
 * @public
 * @param {Object} json - The json response from a falcor model.
 * @returns {Array} - the keys that are in the model response minus the deref
 * _private_ meta data.
 */
falcor.keys = function getJSONKeys(json) {
    if (!json) {
        return undefined;
    }

    return Object.
        keys(json).
        filter(function(key) {
            return key !== "$__path";
        });
};

module.exports = falcor;

falcor.Model = require("./Model");
