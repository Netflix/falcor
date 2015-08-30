var config = require('./../../').config;
var pathSyntax = require('falcor-path-syntax');
var arrayClone = require('./../../support/array-clone');
var ModelResponse = require('./../ModelResponse');
var gets = require('./../../get');
var getWithPathsAsJSONGraph = gets.getWithPathsAsJSONGraph;
var getWithPathsAsPathMap = gets.getWithPathsAsPathMap;
var GET_VALID_INPUT = require('./validInput');
var validateInput = require("./../../support/validate-input");

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
        paths = arrayClone(arguments);
    }

    // Else clone and test all of the paths for strings.
    else {
        paths = pathSyntax.fromPathsOrPathValues(arguments);
    }
    var model = this;

    // Does a greedy cache lookup before setting up the
    // request observable.
    return new ModelResponse(function(observer) {
        var out;
        var seed = [{}];
        // Gets either as jsonGraph or as pathMaps
        if (observer.outputFormat === 'AsJSONG') {
            out = getWithPathsAsJSONGraph(model, paths, seed);
        }

        else {
            out = getWithPathsAsPathMap(model, paths, seed);
        }

        // We can complete without going to the server and without performinc
        // any cache clean up.
        if (!out.requestedMissingPaths) {
            observer.onNext(seed[0]);
            if (out.errors) {
                observer.onError(out.errors);
            } else {
                observer.onCompleted();
            }
        }
    });
};
