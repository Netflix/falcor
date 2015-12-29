var ModelResponse = require("./../response/ModelResponse");
var InvalidSourceError = require("./../errors/InvalidSourceError");
var SetResponse = require("./../response/set/SetResponse");
var pathSyntax = require("falcor-path-syntax");
var __version = require("./../internal/version");
var incrementVersion = require("./../support/incrementVersion");

/**
 * @private
 * @augments ModelResponse
 */
function CallResponse(model, callPath, args, suffix, paths) {
    this.callPath = pathSyntax.fromPath(callPath);
    this.args = args;

    if (paths) {
        this.paths = paths.map(pathSyntax.fromPath);
    }
    if (suffix) {
        this.suffix = suffix.map(pathSyntax.fromPath);
    }
    this.model = model;

    var currentVersion = model._root.cache[__version];

    if (typeof currentVersion === "number") {
        this.initialCacheVersion = currentVersion;
    } else {
        this.initialCacheVersion =
        model._root.cache[__version] = incrementVersion();
    }
}

CallResponse.prototype = Object.create(ModelResponse.prototype);
CallResponse.prototype._subscribe = function _subscribe(observer) {
    var callPath = this.callPath;
    var callArgs = this.args;
    var suffixes = this.suffix;
    var extraPaths = this.paths;
    var model = this.model;
    var rootModel = model._clone({
        _path: []
    });
    var boundPath = model._path;
    var boundCallPath = boundPath.concat(callPath);
    var initialCacheVersion = this.initialCacheVersion;

    /*eslint-disable consistent-return*/
    // Precisely the same error as the router when a call function does not
    // exist.
    if (!model._source) {
        observer.onError(new Error("function does not exist"));
        return;
    }


    var response, obs;
    try {
        obs = model._source.
            call(boundCallPath, callArgs, suffixes, extraPaths);
    } catch (e) {
        observer.onError(new InvalidSourceError(e));
        return;
    }

    return obs.
        subscribe(function(res) {
            response = res;
        }, function(err) {
            observer.onError(err);
        }, function() {

            // Run the invalidations first then the follow up JSONGraph set.
            var invalidations = response.invalidated;
            if (invalidations && invalidations.length) {
                // Increment `syncRefCount` here to block calling the _root's
                // onChangesCompleted handler.
                ++model._root.syncRefCount;
                rootModel.invalidate.apply(rootModel, invalidations);
                --model._root.syncRefCount;
            }

            // Use the SetResponse directly so we can specify the
            // initialCacheVersion from before the call operation was invoked.
            return new SetResponse(rootModel.withoutDataSource(), [response],
                false, false, initialCacheVersion).subscribe(function(x) {
                    observer.onNext(x);
                }, function(err) {
                    observer.onError(err);
                }, function() {
                    observer.onCompleted();
                });
        });
    /*eslint-enable consistent-return*/
};

module.exports = CallResponse;
