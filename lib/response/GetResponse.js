var Rx = require("rx/dist/rx");
var Observable = Rx.Observable;
var Disposable = Rx.Disposable;
var IdempotentResponse = require("./../response/IdempotentResponse");
var InvalidSourceError = require("./../errors/InvalidSourceError.js");

var arrayMap = require("./../support/array-map");
var arrayConcat = require("./../support/array-concat");
var get = require("./../get");
var getWithPathsAsJSONGraph = get.getWithPathsAsJSONGraph;
var getWithPathsAsPathMap = get.getWithPathsAsPathMap;

function GetResponse(subscribe) {
    IdempotentResponse.call(this, subscribe || subscribeToGetResponse);
}

GetResponse.create = IdempotentResponse.create;

GetResponse.prototype = Object.create(IdempotentResponse.prototype);
GetResponse.prototype.method = "get";
GetResponse.prototype.constructor = GetResponse;
GetResponse.prototype.initialize = function() {
    var model = this.model;
    this.seed = [{}];
    this.boundPath = model._path;
    this.isJSONGraph = this.outputFormat === "AsJSONG" || false;
    this.isCompleted = false;
    this.isMaster = !model._source;

    return this;
};

GetResponse.prototype.invokeSourceRequest = function invokeSourceRequest(model) {

    var source = this;
    var caught = this.catch(function getMissingPaths(results) {

        if (results && results.invokeSourceRequest === true) {

            var optimizedMissingPaths = results.optimizedMissingPaths;

            return (model._request.get(optimizedMissingPaths).
                do(null, function setResponseError() {
                    source.isCompleted = true;
                })
                .materialize()
                .flatMap(function(notification) {
                    if (notification.kind === "C") {
                        return Observable.empty();
                    }
                    if (notification.kind === "E") {
                        var ex = notification.exception;
                        if (InvalidSourceError.is(ex)) {
                            return Observable.throw(notification.exception);
                        }
                    }
                    return caught;
                }));
        }

        return Observable.throw(results);
    });

    return new this.constructor(function(observer) {
        return caught.subscribe(observer);
    });
};

// Executes the local cache search for the GetResponse's operation groups.
function subscribeToGetResponse(observer) {

    if (this.subscribeCount++ >= this.subscribeLimit) {
        observer.onError("Loop kill switch thrown.");
        return Disposable.empty;
    }

    var model = this.model;
    var modelRoot = model._root;
    var method = this.method;
    var boundPath = this.boundPath;

    var isMaster = this.isMaster;
    var isCompleted = this.isCompleted;
    var isProgressive = this.isProgressive;
    var hasValue = false;

    var errors = [];
    var requestedMissingPaths = [];
    var optimizedMissingPaths = [];

    var args = this.args;
    var seed = this.seed;
    var results;

    if (this.isJSONGraph) {
        results = getWithPathsAsJSONGraph(model, args, seed);
    } else {
        results = getWithPathsAsPathMap(model, args, seed);
    }

    errors.push.apply(errors, results.errors);
    requestedMissingPaths.push.apply(requestedMissingPaths, results.requestedMissingPaths);
    optimizedMissingPaths.push.apply(optimizedMissingPaths, results.optimizedMissingPaths);
    hasValue = hasValue || results.hasValue;
    isCompleted = isCompleted || requestedMissingPaths.length === 0;

    var hasError = errors.length > 0;

    try {
        modelRoot.syncRefCount++;
        if (hasValue && (isProgressive || isCompleted || isMaster)) {
            observer.onNext(seed[0]);
        }
        if (isCompleted || isMaster) {
            if (hasError) {
                observer.onError(errors);
            } else {
                observer.onCompleted();
            }
        } else {
            if (this.isJSONGraph) {
                this.seed[0].paths = [];
            }
            observer.onError({
                method: method,
                requestedMissingPaths: arrayMap(requestedMissingPaths, prependBoundPath),
                optimizedMissingPaths: optimizedMissingPaths,
                invokeSourceRequest: true
            });
        }
    } catch (e) {
        throw e;
    } finally {
        --modelRoot.syncRefCount;
    }

    return Disposable.empty;

    function prependBoundPath(path) {
        return arrayConcat(boundPath, path);
    }
}

module.exports = GetResponse;
