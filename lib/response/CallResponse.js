var Rx = require("rx/dist/rx") && require("rx/dist/rx.aggregates");
var Observable = Rx.Observable;
var CompositeDisposable = Rx.CompositeDisposable;

var ModelResponse = require("./../response/ModelResponse");
var InvalidSourceError = require("./../errors/InvalidSourceError");

var derefSync = require("./../deref/sync");
var $ref = require("./../types/ref");

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
    this._subscribe = subscribeToResponse;
}

CallResponse.create = ModelResponse.create;
CallResponse.prototype.subscribe = ModelResponse.prototype.subscribe;

function subscribeToResponse(observer) {
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

    // Precisely the same error as the router when a call function does not
    // exist.
    if (!model._source) {
        observer.onError(new Error('function does not exist'));
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
                rootModel.invalidate.apply(rootModel, invalidations);
            }

            // The set
            rootModel.
                withoutDataSource().
                set(response).subscribe(function(x) {
                    observer.onNext(x);
                }, function(err) {
                    observer.onError(err);
                }, function() {
                    observer.onCompleted();
                });
        });
}

module.exports = CallResponse;
