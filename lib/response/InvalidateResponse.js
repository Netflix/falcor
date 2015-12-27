var isArray = Array.isArray;
var ModelResponse = require("./ModelResponse");
var isPathValue = require("./../support/isPathValue");
var isJSONEnvelope = require("./../support/isJSONEnvelope");
var empty = {dispose: function() {}};
var __version = require("./../internal/version");
var isFunction = require("./../support/isFunction");
var incrementVersion = require("./../support/incrementVersion");

function InvalidateResponse(model, args, initialCacheVersion) {
    // TODO: This should be removed.  There should only be 1 type of arguments
    // coming in, but we have strayed from documentation.
    this._model = model;

    var groups = [];
    var group, groupType;
    var argIndex = -1;
    var argCount = args.length;

    var currentVersion = model._root.cache[__version];

    if (typeof initialCacheVersion === 'number') {
        this.initialCacheVersion = initialCacheVersion;
    } else if (typeof currentVersion === 'number') {
        this.initialCacheVersion = currentVersion;
    } else {
        this.initialCacheVersion =
        model._root.cache[__version] = incrementVersion();
    }

    // Validation of arguments have been moved out of this function.
    while (++argIndex < argCount) {
        var arg = args[argIndex];
        var argType;
        if (isArray(arg)) {
            argType = "PathValues";
        } else if (isPathValue(arg)) {
            argType = "PathValues";
        } else if (isJSONEnvelope(arg)) {
            argType = "PathMaps";
        } else {
            throw new Error("Invalid Input");
        }

        if (groupType !== argType) {
            groupType = argType;
            group = {
                inputType: argType,
                arguments: []
            };
            groups.push(group);
        }

        group.arguments.push(arg);
    }

    this._groups = groups;
}

InvalidateResponse.prototype = Object.create(ModelResponse.prototype);
InvalidateResponse.prototype.progressively = function progressively() {
    return this;
};
InvalidateResponse.prototype._toJSONG = function _toJSONG() {
    return this;
};

InvalidateResponse.prototype._subscribe = function _subscribe(observer) {

    var model = this._model;
    this._groups.forEach(function(group) {
        var inputType = group.inputType;
        var methodArgs = group.arguments;
        var operationName = "_invalidate" + inputType;
        var operationFunc = model[operationName];
        operationFunc(model, methodArgs);
    });
    observer.onCompleted();

    var modelRoot = model._root;
    var modelCache = modelRoot.cache;
    var currentVersion = modelCache[__version];
    var initialCacheVersion = this.initialCacheVersion;
    var rootOnChangesCompletedHandler = modelRoot.onChangesCompleted;

    if (initialCacheVersion !== currentVersion && (
        modelRoot.syncRefCount <= 0) &&
        isFunction(rootOnChangesCompletedHandler)) {
        rootOnChangesCompletedHandler.call(modelRoot.topLevelModel);
    }


    return empty;
};

module.exports = InvalidateResponse;
