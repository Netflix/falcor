var Rx = require("rx/dist/rx");
var Observable = Rx.Observable;

var ModelResponse = require("./../response/ModelResponse");

var pathSyntax = require("falcor-path-syntax");

var getSize = require("./../support/getSize");
var collectLru = require("./../lru/collect");

var arrayClone = require("./../support/array-clone");
var __version = require("./../internal/version");

var isArray = Array.isArray;
var isPathValue = require("./../support/isPathValue");
var isJSONEnvelope = require("./../support/isJSONEnvelope");
var isJSONGraphEnvelope = require("./../support/isJSONGraphEnvelope");

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
    var outputFormat = this.outputFormat || "AsPathMap";
    var isProgressive = this.isProgressive;
    var values = [{}];

    var groups = [];
    var args = this.args;

    var group, groupType;

    var argIndex = -1;
    var argCount = args.length;

    // Validation of arguments have been moved out of this function.
    while (++argIndex < argCount) {
        var arg = args[argIndex];
        var argType;
        if (isArray(arg) || typeof arg === "string") {
            arg = pathSyntax.fromPath(arg);
            argType = "PathValues";
        } else if (isPathValue(arg)) {
            arg.path = pathSyntax.fromPath(arg.path);
            argType = "PathValues";
        } else if (isJSONGraphEnvelope(arg)) {
            argType = "JSONGs";
        } else if (isJSONEnvelope(arg)) {
            argType = "PathMaps";
        }
        if (groupType !== argType) {
            groupType = argType;
            group = {
                inputType: argType,
                arguments: []
            };
            groups.push(group);
            group.values = values;
        }

        group.arguments.push(arg);
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
            collectLru(modelRoot, modelRoot.expired, getSize(modelCache),
                model._maxSize, model._collectRatio, modelCache[__version]);
        });
    });

    return new this.constructor(function(observer) {
        return ensured.subscribe(observer);
    });
};

module.exports = IdempotentResponse;
