var Rx = require("falcor-observable");
var Observable = Rx.Observable;

var jsongMixin = { format: { value: "AsJSONG" } };
var valuesMixin = { format: { value: "AsValues" } };
var pathMapMixin = { format: { value: "AsPathMap" } };
var compactJSONMixin = { format: { value: "AsJSON" } };
var progressiveMixin = { isProgressive: { value: true } };

var array_slice = require("falcor/support/array-slice");

var is_array = Array.isArray;
var is_object = require("falcor/support/is-object");
var is_function = require("falcor/support/is-function");
var is_path_value = require("falcor/support/is-path-value");
var is_json_envelope = require("falcor/support/is-json-envelope");
var is_json_graph_envelope = require("falcor/support/is-json-graph-envelope");

function ModelResponse(subscribe) {
    Observable.call(this, subscribe);
};

ModelResponse.create = function create(model, args, selector) {
    var response = new ModelResponse(subscribeToResponse);
    response.args = args;
    response.type = this;
    response.model = model;
    response.method = this.method;
    response.selector = selector;
    return response;
};

ModelResponse.prototype = Object.create(Observable.prototype);

ModelResponse.prototype.constructor = ModelResponse;

ModelResponse.prototype.mixin = function mixin() {
    var self = this;
    var mixins = array_slice(arguments);
    return new self.constructor(function (other) {
        return self.subscribe(mixins.reduce(function (proto, mixin) {
            return Object.create(proto, mixin);
        }, other));
    });
};

ModelResponse.prototype.toPathValues = function toPathValues() {
    return this.mixin(valuesMixin).asObservable();
};

ModelResponse.prototype.toCompactJSON = function toCompactJSON() {
    return this.mixin(compactJSONMixin);
};

ModelResponse.prototype.toJSONG = function toJSONG() {
    return this.mixin(jsongMixin);
};

ModelResponse.prototype.progressively = function progressively() {
    return this.mixin(progressiveMixin);
};

ModelResponse.prototype.withErrorSelector = function withErrorSelector(project) {
    return this.mixin({ errorSelector: { value: project } });
};

ModelResponse.prototype.withComparator = function withComparator(compare) {
    return this.mixin({ comparator: { value: compare } });
};

ModelResponse.prototype.then = function then(onNext, onError) {
    var self = this;
    return new Rx.Promise(function (resolve, reject) {
        var value = undefined;
        var error = undefined;
        self.toArray().subscribe(
            function (values) {
                if (values.length <= 1) {
                    value = values[0];
                } else {
                    value = values;
                }
            },
            function (errors) {
                if (errors.length <= 1) {
                    error = errors[0];
                } else {
                    error = errors;
                }
                resolve = undefined;
                reject(error);
            },
            function () {
                if (Boolean(resolve)) {
                    resolve(value);
                }
            }
        );
    }).then(onNext, onError);
};

function subscribeToResponse(observer) {
    var model = this.model;
    observer.comparator || (observer.comparator = model._comparator);
    observer.errorSelector || (observer.errorSelector = model._errorSelector)
    return (new this
        .type(subscribeToOperation)
        .updateProgressively()
        .invokeSourceRequest()
        .subscribe(observerFromResponse(this, observer)));
};

function subscribeToOperation(observer) {
    var errorHappened = true;
    var groups = observer.groups;
    var asPathValues = observer.asPathValues;
    observer.subscribeCount += 1;
    try {
        observer = groups.reduce(aggregate_operation_groups, observer);
        if (!asPathValues) {
            observer.onNext(observer);
        }
        errorHappened = false;
    } catch (e) {
        errorHappened = true;
        observer.onError(e);
    } finally {
        if (!errorHappened) {
            observer.onCompleted();
        }
    }
}

function observerFromResponse(response, observer) {

    var selector = response.selector;
    var seedCount = 1;
    var outputFormat = observer.outputFormat || "AsPathMap";
    var isProgressive = observer.isProgressive || false;

    var argument_groups = response.args.reduce(partition_args, {
        groups: [],
        argCount: 0
    }).groups;

    if (is_function(selector)) {
        outputFormat = "AsJSON";
        seedCount = selector.length;
    } else if (outputFormat === "AsValues") {
        seedCount = 0;
        isProgressive = false;
    }

    var values = [];
    var seedIndex = -1;

    while (++seedIndex < seedCount) {
        values[seedIndex] = {};
    }

    return Object.create(observer, {
        model                 : { value: response.model },
        method                : { value: response.method },
        groups                : { value: argument_groups },
        selector              : { value: selector },
        subscribeLimit        : { value: 10 /*<- arbitrary max request retry limit */ },
        subscribeCount        : { value: 0, writable: true },
        outputFormat          : { value: outputFormat },
        asJSON                : { value: outputFormat === "AsJSON" },
        asJSONG               : { value: outputFormat === "AsJSONG" },
        asPathMap             : { value: outputFormat === "AsPathMap" },
        asPathValues          : { value: outputFormat === "AsValues" },
        isProgressive         : { value: isProgressive },
        values                : { value: [] },
        errors                : { value: [] },
        hasValue              : { value: false, writable: true },
        hasError              : { value: false, writable: true },
        isCompleted           : { value: false, writable: true },
        requestedPaths        : { value: [] },
        optimizedPaths        : { value: [] },
        requestedMissingPaths : { value: [] },
        optimizedMissingPaths : { value: [] },
        isResponseObserver    : { value: true }
    });
}

function partition_args(tuple, arg) {
    var group, argType;
    var groups = tuple.groups;
    var argCount = tuple.argCount;
    var groupType = tuple.inputType;
    if (is_array(arg)) {
        argType = "PathSets";
    } else if (is_path_value(arg)) {
        argType = "PathValues";
    } else if (is_json_graph_envelope(arg)) {
        argType = "JSONGs";
    } else if (is_json_envelope(arg)) {
        argType = "PathMaps";
    } else {
        throw new Error("Unrecognized argument " + (typeof arg) + " [" + String(arg) + "] " + "to Model#" + method + "");
    }
    if (groupType !== argType) {
        tuple.inputType = argType;
        group = groups[groups.length] = {
            arguments: [],
            inputType: argType,
            argOffset: argCount
        };
    } else {
        group = groups[groups.length - 1];
    }
    tuple.argCount = argCount + 1;
    group.arguments.push(arg);
    return tuple;
}

function aggregate_operation_groups(operation, group) {

    if (group.isCompleted) {
        return operation;
    }

    var model = observer.model;
    var method = observer.method;
    var inputType = group.inputType;
    var outputFormat = observer.outputFormat;
    var methodArgs = group.arguments;
    var argOffset = group.argOffset;
    var argLength = methodArgs.length;

    var onNext = observer.asPathValues && observer.onNext;
    var values = observer.values;
    var errors = observer.errors;
    var hasValue = observer.hasValue;
    var hasError = observer.hasError;
    var requestedPaths = observer.requestedPaths;
    var optimizedPaths = observer.optimizedPaths;
    var requestedMissingPaths = observer.requestedMissingPaths;
    var optimizedMissingPaths = observer.optimizedMissingPaths;

    var seeds = values;
    var err_selector = observer.err_selector;
    var subscribeCount = observer.subscribeCount;
    var comparator = subscribeCount > 1 && observer.comparator || undefined;

    if (observer.asJSON && values.length > 0) {
        seeds = new Array(argLength);
        var seedIndex = -1;
        var argIndex = argOffset - 1;
        var argCount = argOffset + argLength;
        while (++argIndex < argCount) {
            seeds[++seedIndex] = values[argIndex];
        }
    }

    var operationName = "_" + method + inputType + outputFormat;

    var results = model[operationName](
        model, methodArgs,
        onNext || seeds,
        err_selector, comparator
    );

    errors.push.apply(errors, results.errors);
    requestedPaths.push.apply(requestedPaths, results.requestedPaths);
    optimizedPaths.push.apply(optimizedPaths, results.optimizedPaths);
    requestedMissingPaths.push.apply(requestedMissingPaths, results.requestedMissingPaths);
    optimizedMissingPaths.push.apply(optimizedMissingPaths, results.optimizedMissingPaths);

    observer.hasValue = hasValue || results.hasValue;
    observer.hasError = hasError || errors.length;
    observer.isCompleted = group.isCompleted = requestedMissingPaths.length === 0;

    return operation;
}

module.exports = ModelResponse;
