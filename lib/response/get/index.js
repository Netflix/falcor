var config = require("./../../").config;
var pathSyntax = require("falcor-path-syntax");
var ModelResponse = require("./../ModelResponse");
var gets = require("./../../get");
var getWithPathsAsJSONGraph = gets.getWithPathsAsJSONGraph;
var getWithPathsAsPathMap = gets.getWithPathsAsPathMap;
var GET_VALID_INPUT = require("./validInput");
var validateInput = require("./../../support/validateInput");
var GetResponse = require("./../GetResponse");

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
    var model = this;

    // Does a greedy cache lookup before setting up the
    // request observable.
    return new ModelResponse(function(observer) {
        var results;
        var seed = [{}];
        var isJSONG = observer.outputFormat === "AsJSONG";
        // Gets either as jsonGraph or as pathMaps
        if (isJSONG) {
            results = getWithPathsAsJSONGraph(model, paths, seed);
        }

        else {
            results = getWithPathsAsPathMap(model, paths, seed);
        }

        // We can complete without going to the server and without performinc
        // any cache clean up.
        if (!results.requestedMissingPaths) {
            // There has to be at least one value to report an onNext.
            if (results.hasValue) {
                observer.onNext(seed[0]);
            }
            if (results.errors) {
                observer.onError(results.errors);
            } else {
                observer.onCompleted();
            }
            return null;
        }

        // Else go into the legacy get request cycle using full Rx.
        // The request has to be copied onto the inner request.
        // TODO: Obvious performance win here if the request cycle was
        // done without observable copying.
        var getResponse = GetResponse.
            create(model, paths);

        if (isJSONG) {
            getResponse = getResponse._toJSONG();
        }
        if (observer.isProgressive) {
            getResponse = getResponse.progressively();
        }
        return getResponse.subscribe(
                observer.onNext.bind(observer),
                observer.onError.bind(observer),
                observer.onCompleted.bind(observer));

    });
};
