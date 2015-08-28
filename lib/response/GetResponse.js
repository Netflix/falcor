var Rx = require("rx/dist/rx");
var Observable = Rx.Observable;
var Disposable = Rx.Disposable;

var IdempotentResponse = require("./../response/IdempotentResponse");
var InvalidSourceError = require("./../errors/InvalidSourceError.js");
var pathSyntax = require('falcor-path-syntax');

var arrayClone = require("./../support/array-clone");
var arrayMap = require("./../support/array-map");
var arrayConcat = require("./../support/array-concat");
var isFunction = require("./../support/is-function");

function GetResponse(subscribe) {
    IdempotentResponse.call(this, subscribe || subscribeToGetResponse);
}

GetResponse.create = IdempotentResponse.create;

GetResponse.prototype = Object.create(IdempotentResponse.prototype);
GetResponse.prototype.method = "get";
GetResponse.prototype.constructor = GetResponse;
GetResponse.prototype.initialize = function() {
    var model = this.model;
    var outputFormat = this.outputFormat || "AsPathMap";
    var isProgressive = this.isProgressive;
    var values = [{}];
    var groups = [{
        inputType: "PathValues",
        arguments: [],
        values: values
    }];
    var args = this.args;
    var group = groups[0];
    var argIndex = -1;
    var argCount = args.length;

    // Validation of arguments have been moved out of this function.
    var argType = "PathValues";
    while (++argIndex < argCount) {
        var arg = pathSyntax.fromPath(args[argIndex]);
        group.arguments[argIndex] = arg;
    }

    this.boundPath = arrayClone(model._path);
    this.groups = groups;
    this.outputFormat = outputFormat;
    this.isProgressive = isProgressive;
    this.isCompleted = false;
    this.isMaster = model._source == null;
    this.values = values;

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
    var outputFormat = this.outputFormat;

    var isMaster = this.isMaster;
    var isCompleted = this.isCompleted;
    var isProgressive = this.isProgressive;
    var asJSONG = outputFormat === "AsJSONG";
    var asValues = outputFormat === "AsValues";
    var hasValue = false;

    var errors = [];
    var requestedMissingPaths = [];
    var optimizedMissingPaths = [];

    var groups = this.groups;
    var groupIndex = -1;
    var groupCount = groups.length;

    while (++groupIndex < groupCount) {

        var group = groups[groupIndex];
        var groupValues = !asValues && group.values || onPathValueNext;

        var inputType = group.inputType;
        var methodArgs = group.arguments;

        if (methodArgs.length > 0) {

            var operationName = "_" + method + inputType + outputFormat;
            var operationFunc = model[operationName];
            var results = operationFunc(model, methodArgs, groupValues);

            errors.push.apply(errors, results.errors);
            requestedMissingPaths.push.apply(requestedMissingPaths, results.requestedMissingPaths);
            optimizedMissingPaths.push.apply(optimizedMissingPaths, results.optimizedMissingPaths);

            if (asValues) {
                group.arguments = results.requestedMissingPaths;
            } else {
                hasValue = hasValue || results.hasValue;
            }
        }
    }

    isCompleted = isCompleted || requestedMissingPaths.length === 0;
    var hasError = errors.length > 0;

    try {
        modelRoot.syncRefCount++;
        if (hasValue && (isProgressive || isCompleted || isMaster)) {
            var values = this.values;
            var valueIndex = -1;
            var valueCount = values.length;
            while (++valueIndex < valueCount) {
                observer.onNext(values[valueIndex]);
            }
        }
        if (isCompleted || isMaster) {
            if (hasError) {
                observer.onError(errors);
            } else {
                observer.onCompleted();
            }
        } else {
            if (asJSONG) {
                this.values[0].paths = [];
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

    function onPathValueNext(x) {
        ++modelRoot.syncRefCount;
        try {
            observer.onNext(x);
        } catch (e) {
            throw e;
        } finally {
            --modelRoot.syncRefCount;
        }
    }
}

function pluckJSON(jsonEnvelope) {
    return jsonEnvelope.json;
}

module.exports = GetResponse;
