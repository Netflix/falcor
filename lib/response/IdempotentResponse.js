var Rx = require("rx/dist/rx");
var Observable = Rx.Observable;

var ModelResponse = require("./../response/ModelResponse");

var pathSyntax = require("falcor-path-syntax");

var getSize = require("./../support/get-size");
var collectLru = require("./../lru/collect");

var arrayClone = require("./../support/array-clone");

var isArray = Array.isArray;
var isFunction = require("./../support/is-function");
var isPathValue = require("./../support/is-path-value");
var isJsonEnvelope = require("./../support/is-json-envelope");
var isJsonGraphEnvelope = require("./../support/is-json-graph-envelope");

function IdempotentResponse(subscribe) {
    Observable.call(this, subscribe);
}

IdempotentResponse.create = ModelResponse.create;

IdempotentResponse.prototype = Object.create(Observable.prototype);
IdempotentResponse.prototype.constructor = IdempotentResponse;

IdempotentResponse.prototype.subscribeCount = 0;
IdempotentResponse.prototype.subscribeLimit = 10;

IdempotentResponse.prototype.initialize = function initializeResponse() {

    var model = this.model;
    var selector = this.selector;
    var outputFormat = this.outputFormat || "AsPathMap";
    var isProgressive = this.isProgressive;
    var values = [];
    var seedIndex = 0;
    var seedLimit = 0;

    if (isFunction(selector)) {
        outputFormat = "AsJSON";
        seedLimit = selector.length;
        while (seedIndex < seedLimit) {
            values[seedIndex++] = {};
        }
        seedIndex = 0;
    } else if (outputFormat === "AsJSON") {
        seedLimit = -1;
    } else if (outputFormat === "AsValues") {
        values[0] = {};
        isProgressive = false;
    } else {
        values[0] = {};
    }

    var groups = [];
    var args = this.args;

    var group, groupType;

    var argIndex = -1;
    var argCount = args.length;

    // Validation of arguments have been moved out of this function.
    while (++argIndex < argCount) {
        var seedCount = seedIndex + 1;
        var arg = args[argIndex];
        var argType;
        if (isArray(arg) || typeof arg === "string") {
            arg = pathSyntax.fromPath(arg);
            argType = "PathValues";
        } else if (isPathValue(arg)) {
            arg.path = pathSyntax.fromPath(arg.path);
            argType = "PathValues";
        } else if (isJsonGraphEnvelope(arg)) {
            argType = "JSONGs";
            seedCount += arg.paths.length;
        } else if (isJsonEnvelope(arg)) {
            argType = "PathMaps";
        }
        if (groupType !== argType) {
            groupType = argType;
            group = {
                inputType: argType,
                arguments: []
            };
            groups.push(group);
            if (outputFormat === "AsJSON") {
                group.values = [];
            } else if (outputFormat !== "AsValues") {
                group.values = values;
            }
        }

        group.arguments.push(arg);

        if (outputFormat === "AsJSON") {
            var nextSeed;
            if (seedLimit === -1) {
                while (seedIndex < seedCount) {
                    nextSeed = values[seedIndex++] = {};
                    group.values.push(nextSeed);
                }
            } else {
                if (seedLimit < seedCount) {
                    seedCount = seedLimit;
                }
                while (seedIndex < seedCount) {
                    nextSeed = values[seedIndex++] = {};
                    group.values.push(nextSeed);
                }
            }
        }
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

IdempotentResponse.prototype.invokeSourceRequest = function invokeSourceRequest(model) {
    return this;
};

IdempotentResponse.prototype.ensureCollect = function ensureCollect(model) {
    var ensured = this.finally(function ensureCollect() {

        var modelRoot = model._root;
        var modelCache = modelRoot.cache;

        modelRoot.collectionScheduler.schedule(function collectThisPass() {
            collectLru(modelRoot, modelRoot.expired, getSize(modelCache), model._maxSize, model._collectRatio);
        });
    });

    return new this.constructor(function(observer) {
        return ensured.subscribe(observer);
    });
};

module.exports = IdempotentResponse;
