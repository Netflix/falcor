var config = require("./../../").config;
var pathSyntax = require("falcor-path-syntax");
var ModelResponse = require("./../ModelResponse");
var GET_VALID_INPUT = require("./validInput");
var validateInput = require("./../../support/validate-input");
var getSubscribe = require('./getSubscribe');

/**
 * Performs a get on the cache and if there are missing paths
 * then the request will be forwarded to the get request cycle.
 */
module.exports = function get() {
    // Validates the input.  If the input is not paths or strings then we
    // will onError.
    if (config.DEBUG) {
        var out = validateInput(arguments, GET_VALID_INPUT, "get");
        if (out !== true) {
            return new ModelResponse(function(o) {
                o.onError(out);
            });
        }
    }

    var paths;
    // If get with paths only mode is on, then we can just
    // clone the array.
    if (config.GET_WITH_PATHS_ONLY) {
        paths = [];
        for (var i = 0, len = arguments.length; i < len; ++i) {
            paths[i] = arguments[i];
        }
    }

    // Else clone and test all of the paths for strings.
    else {
        paths = pathSyntax.fromPathsOrPathValues(arguments);
    }

    // Does a greedy cache lookup before setting up the
    // request observable.
    return new ModelResponse(getSubscribe(this, paths));
};
