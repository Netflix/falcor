var Rx = require("falcor-observable");
var Observable = Rx.Observable;
var Disposable = Rx.Disposable;

var IdempotentResponse = require("falcor/response/IdempotentResponse");

var array_map = require("falcor/support/array-map");
var array_concat = require("falcor/support/array-concat");
var is_function = require("falcor/support/is-function");

var set_json_graph_as_json_dense = require("falcor/set/set-json-graph-as-json-dense");
var set_json_values_as_json_dense = require("falcor/set/set-json-values-as-json-dense");

var empty_array = new Array(0);

function GetResponse(subscribe) {
    IdempotentResponse.call(this, subscribe || subscribeToGetResponse);
}

GetResponse.create = IdempotentResponse.create;

GetResponse.prototype = Object.create(IdempotentResponse.prototype);
GetResponse.prototype.method = "get";
GetResponse.prototype.constructor = GetResponse;

GetResponse.prototype.invokeSourceRequest = function invokeSourceRequest(model) {

    var source = this;
    var caught = this["catch"](function getMissingPaths(results) {

        if(results && results.invokeSourceRequest === true) {

            var boundPath = model._path;
            var requestedMissingPaths = results.requestedMissingPaths;
            var optimizedMissingPaths = results.optimizedMissingPaths;

            return (model._request
                .get(optimizedMissingPaths)
                .do(function setResponseEnvelope(envelope) {
                        model._path = empty_array;
                        set_json_graph_as_json_dense(model, [{
                            paths: requestedMissingPaths,
                            jsonGraph: envelope.jsonGraph || envelope.jsong  || envelope.values || envelope.value
                        }], empty_array, source.errorSelector, source.comparator);
                        model._path = boundPath;
                    },
                    function setResponseError(error) {
                        source.isCompleted = true;
                        model._path = empty_array;
                        set_json_values_as_json_dense(model, array_map(optimizedMissingPaths, function(path) {
                            return { path: path, value: error };
                        }), empty_array, source.errorSelector, source.comparator);
                        model._path = boundPath;
                    }
                )
                .materialize()
                .flatMap(function(notification) {
                    if(notification.kind === "C") {
                        return Observable.empty();
                    }
                    return caught;
                }));
        }

        return Observable["throw"](results);
    });

    return new this.constructor(function(observer) {
        return caught.subscribe(observer);
    });
};

function subscribeToGetResponse(observer) {

    if(this.subscribeCount++ >= this.subscribeLimit) {
        observer.onError("Loop kill switch thrown.");
        return;
    }

    var model = this.model;
    var modelRoot = model._root;
    var method = this.method;
    var boundPath = this.boundPath;
    var outputFormat = this.outputFormat;

    var isMaster = this.isMaster;
    var isCompleted = this.isCompleted;
    var isProgressive = this.isProgressive;
    var asJSONG  = outputFormat === "AsJSONG";
    var asValues = outputFormat === "AsValues";
    var hasValue = false;

    var errors = [];
    var requestedMissingPaths = [];
    var optimizedMissingPaths = [];

    var groups = this.groups;
    var groupIndex = -1;
    var groupCount = groups.length;

    while(++groupIndex < groupCount) {

        var group = groups[groupIndex];
        var groupValues = !asValues && group.values || function onPathValueNext(x) {
            ++modelRoot.syncRefCount;
            try {
                observer.onNext(x);
            } catch(e) {
                throw e;
            } finally {
                --modelRoot.syncRefCount;
            }
        };

        var inputType = group.inputType;
        var methodArgs = group.arguments;

        if(methodArgs.length > 0) {

            var operationName = "_" + method + inputType + outputFormat;
            var operationFunc = model[operationName];
            var results = operationFunc(model, methodArgs, groupValues);

            errors.push.apply(errors, results.errors);
            requestedMissingPaths.push.apply(requestedMissingPaths, results.requestedMissingPaths);
            optimizedMissingPaths.push.apply(optimizedMissingPaths, results.optimizedMissingPaths);

            if(asValues) {
                group.arguments = results.requestedMissingPaths;
            } else  {
                hasValue = hasValue || results.hasValue || results.requestedPaths.length > 0;
            }
        }
    }

    isCompleted = isCompleted || requestedMissingPaths.length === 0;
    var hasError = errors.length > 0;

    try {
        modelRoot.syncRefCount++;
        if(hasValue && (isProgressive || isCompleted || isMaster)) {
            var values = this.values;
            var selector = this.selector;
            if(is_function(selector)) {
                observer.onNext(selector.apply(model, values.map(pluckJSON)));
            } else {
                var valueIndex = -1;
                var valueCount = values.length;
                while(++valueIndex < valueCount) {
                    observer.onNext(values[valueIndex]);
                }
            }
        }
        if(isCompleted || isMaster) {
            if(hasError) {
                observer.onError(errors);
            } else {
                observer.onCompleted();
            }
        } else {
            if(asJSONG) {
                this.values[0].paths = [];
            }
            observer.onError({
                method: method,
                requestedMissingPaths: array_map(requestedMissingPaths, prependBoundPath),
                optimizedMissingPaths: optimizedMissingPaths,
                invokeSourceRequest: true
            });
        }
    } catch(e) {
        throw e;
    } finally {
        --modelRoot.syncRefCount;
    }

    return Disposable.empty;

    function prependBoundPath(path) {
        return array_concat(boundPath, path);
    }
}

function pluckJSON(jsonEnvelope) {
    return jsonEnvelope.json;
}

module.exports = GetResponse;