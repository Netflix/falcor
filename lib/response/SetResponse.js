var Rx = require("rx/dist/rx");
var Observable = Rx.Observable;
var Disposable = Rx.Disposable;
var GetResponse = require("./get/GetResponse");
var IdempotentResponse = require("./../response/IdempotentResponse");
var InvalidSourceError = require("./../errors/InvalidSourceError");

var arrayFlatMap = require("./../support/array-flat-map");
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
            model._getPathValuesAsJSONG(model._materialize().withoutDataSource(), optimizedPaths, [envelope]);
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

    if (this.isCompleted) {
        return subscribeToFollowupGet.call(this, observer);
    }

    return subscribeToLocalSet.call(this, observer);
}

function subscribeToLocalSet(observer) {

    if (this.subscribeCount++ > this.subscribeLimit) {
        observer.onError("Loop kill switch thrown.");
        return Disposable.empty;
    }

    var requestedPaths = [];
    var optimizedPaths = [];
    var model = this.model;
    var isMaster = this.isMaster;
    var modelRoot = model._root;
    var outputFormat = this.outputFormat;
    var errorSelector = modelRoot.errorSelector;

    var method = this.method;
    var groups = this.groups;
    var groupIndex = -1;
    var groupCount = groups.length;

    while (++groupIndex < groupCount) {

        var group = groups[groupIndex];
        var inputType = group.inputType;
        var methodArgs = group.arguments;

        if (methodArgs.length > 0) {

            var operationName = "_" + method + inputType + outputFormat;
            var operationFunc = model[operationName];
            var successfulPaths = operationFunc(model, methodArgs, null, errorSelector);

            optimizedPaths.push.apply(optimizedPaths, successfulPaths[1]);

            if (inputType === "PathValues") {
                requestedPaths.push.apply(requestedPaths, methodArgs.map(pluckPath));
            } else if (inputType === "JSONGs") {
                requestedPaths.push.apply(requestedPaths, arrayFlatMap(methodArgs, pluckEnvelopePaths));
            } else {
                requestedPaths.push.apply(requestedPaths, successfulPaths[0]);
            }
        }
    }

    this.requestedPaths = requestedPaths;

    if (isMaster) {
        this.isCompleted = true;
        return subscribeToFollowupGet.call(this, observer);
    } else {
        observer.onError({
            method: method,
            optimizedPaths: optimizedPaths,
            invokeSourceRequest: true
        });
    }
}

function subscribeToFollowupGet(observer) {
    var response = new GetResponse(this.model, this.requestedPaths);
    if (this.outputFormat === "AsJSONG") {
        response = response._toJSONG();
    }
    if (this.isProgressive) {
        response = response.progressively();
    }
    return response.subscribe(observer);
}

function pluckPath(pathValue) {
    return pathValue.path;
}

function pluckEnvelopePaths(jsonGraphEnvelope) {
    return jsonGraphEnvelope.paths;
}

module.exports = SetResponse;
