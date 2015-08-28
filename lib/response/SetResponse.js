var Rx = require("rx/dist/rx");
var Observable = Rx.Observable;
var Disposable = Rx.Disposable;

var IdempotentResponse = require("./../response/IdempotentResponse");
var InvalidSourceError = require("./../errors/InvalidSourceError.js");

var arrayMap = require("./../support/array-map");
var spreadJSON = require("./../get/util/spreadJSON");
var arrayFlatMap = require("./../support/array-flat-map");
var isFunction = require("./../support/is-function");
var emptyArray = new Array(0);

function SetResponse(subscribe) {
    IdempotentResponse.call(this, subscribe || subscribeToSetResponse);
}

SetResponse.create = IdempotentResponse.create;

SetResponse.prototype = Object.create(IdempotentResponse.prototype);
SetResponse.prototype.method = "set";
SetResponse.prototype.constructor = SetResponse;

SetResponse.prototype.invokeSourceRequest = function invokeSourceRequest(model) {

    var source = this;
    var caught = this.catch(function setJSONGraph(results) {

        var requestObs;
        if (results && results.invokeSourceRequest === true) {

            var envelope = {};
            var boundPath = model._path;
            var optimizedPaths = results.optimizedPaths;

            model._path = emptyArray;
            model._getPathValuesAsJSONG(
                model._materialize().withoutDataSource(),
                optimizedPaths, [envelope]);
            model._path = boundPath;
            requestObs = model.
                _request.set(envelope).
                do(
                    function setResponseEnvelope(envelope2) {
                        source.isCompleted = optimizedPaths.length === envelope2.paths.length;
                    },
                    function setResponseError() {
                        source.isCompleted = true;
                    }
                ).
                materialize().
                flatMap(function(notification) {
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
                });
        }
        else {
            requestObs = Observable.throw(results);
        }

        return requestObs;
    });

    return new this.constructor(function(observer) {
        return caught.subscribe(observer);
    });
};

function subscribeToSetResponse(observer) {

    if (this.subscribeCount >= this.subscribeLimit) {
        observer.onError("Loop kill switch thrown.");
        return Disposable.empty;
    }

    var model = this.model;
    var materializedModel = this.materializedModel || model._materialize();
    if (!this.materializedModel) {
        this.materializedModel = materializedModel;
    }

    var modelRoot = model._root;
    var method = this.method;
    var outputFormat = this.outputFormat;
    var errorSelector = modelRoot.errorSelector;
    var comparator = this.subscribeCount++ > 0 && modelRoot.comparator || void 0;

    var isMaster = this.isMaster;
    var isCompleted = this.isCompleted;
    var isProgressive = this.isProgressive;
    var asJSONG = outputFormat === "AsJSONG";
    var asValues = outputFormat === "AsValues";
    var hasValue = false;

    var errors = [];
    var optimizedPaths = [];

    var groups = this.groups;
    var groupIndex = -1;
    var groupCount = groups.length;
    var modelToUse = model;

    if (isCompleted) {
        method = "get";
    } else {
        modelToUse = materializedModel;
    }

    while (++groupIndex < groupCount) {

        var group = groups[groupIndex];
        var groupValues = !asValues && group.values || onPathValueNext;

        var inputType = group.inputType;
        var methodArgs = group.arguments;

        if (isCompleted) {
            if (inputType === "PathValues") {
                inputType = "PathValues";
                methodArgs = arrayMap(methodArgs, pluckPath);
            } else if (inputType === "JSONGs") {
                inputType = "PathValues";
                methodArgs = arrayFlatMap(methodArgs, pluckPaths);
            }
        }

        if (methodArgs.length > 0) {

            // TODO: Performance - Its intentional for now.
            var tmpInputType = inputType;
            if (inputType === 'PathMaps' && method === 'get') {
                var nextArgs = [];
                for (var i = 0, len = methodArgs.length; i < len; ++i) {
                    spreadJSON(methodArgs[i].json, nextArgs);
                }
                methodArgs = nextArgs;
                tmpInputType = 'PathValues';

            }

            var operationName = "_" + method + tmpInputType + outputFormat;
            var operationFunc = model[operationName];
            var results = operationFunc(modelToUse, methodArgs, groupValues, errorSelector, comparator);

            errors.push.apply(errors, results.errors);
            optimizedPaths.push.apply(optimizedPaths, results.optimizedPaths);

            hasValue = !asValues && (hasValue || results.hasValue);
        }
    }

    var hasError = errors.length > 0;

    try {
        modelRoot.syncRefCount++;
        if (hasValue && (isProgressive || isCompleted || isMaster) && !asValues) {
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
                optimizedPaths: optimizedPaths,
                invokeSourceRequest: true
            });
        }
    } catch (e) {
        throw e;
    } finally {
        --modelRoot.syncRefCount;
    }

    return Disposable.empty;

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

function pluckPath(pathValue) {
    return pathValue.path;
}

function pluckPaths(jsonGraphEnvelope) {
    return jsonGraphEnvelope.paths;
}

module.exports = SetResponse;
