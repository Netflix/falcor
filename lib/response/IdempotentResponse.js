var Rx = require("rx/dist/rx");;
var Disposable = Rx.Disposable;
var Observable = Rx.Observable;
var SerialDisposable = Rx.SerialDisposable;
var CompositeDisposable = Rx.CompositeDisposable;

var ModelResponse = require("falcor/response/ModelResponse");

var pathSyntax = require("falcor-path-syntax");

var get_size = require("falcor/support/get-size");
var collect_lru = require("falcor/lru/collect");
var __version = require("falcor/internal/version");

var array_map = require("falcor/support/array-map");
var array_clone = require("falcor/support/array-clone");

var is_array = Array.isArray;
var is_object = require("falcor/support/is-object");
var is_function = require("falcor/support/is-function");
var is_path_value = require("falcor/support/is-path-value");
var is_json_envelope = require("falcor/support/is-json-envelope");
var is_json_graph_envelope = require("falcor/support/is-json-graph-envelope");

function IdempotentResponse(subscribe) {
    Observable.call(this, subscribe);
}

IdempotentResponse.create = ModelResponse.create;

IdempotentResponse.prototype = Object.create(Observable.prototype);
IdempotentResponse.prototype.constructor = IdempotentResponse;

IdempotentResponse.prototype.subscribeCount = 0;
IdempotentResponse.prototype.subscribeLimit = 10;

IdempotentResponse.prototype.initialize = function initialize_response() {

    var model = this.model;
    var method = this.method;
    var selector = this.selector;
    var outputFormat = this.outputFormat || "AsPathMap";
    var isProgressive = this.isProgressive;
    var values = [];
    var seedIndex = 0;
    var seedLimit = 0;

    if(is_function(selector)) {
        outputFormat = "AsJSON";
        seedLimit = selector.length;
        while(seedIndex < seedLimit) {
            values[seedIndex++] = {};
        }
        seedIndex = 0;
    } else if(outputFormat === "AsJSON") {
        seedLimit = -1;
    } else if(outputFormat === "AsValues") {
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

    while(++argIndex < argCount) {
        var seedCount = seedIndex + 1;
        var arg = args[argIndex];
        var argType;
        if (is_array(arg) || typeof arg === "string") {
            if(method === "set") {
                throw new Error("Unrecognized argument " + (typeof arg) + " [" + String(arg) + "] " + "to Model#" + method + "");
            } else {
                arg = pathSyntax.fromPath(arg);
                argType = "PathSets";
            }
        } else if (is_path_value(arg)) {
            if(method === "set") {
                arg.path = pathSyntax.fromPath(arg.path);
                argType = "PathValues";
            } else {
                arg = pathSyntax.fromPath(arg.path);
                argType = "PathSets";
            }
        } else if (is_json_graph_envelope(arg)) {
            argType = "JSONGs";
            arg.paths = array_map(arg.paths, pathSyntax.fromPath);
            seedCount += arg.paths.length;
        } else if (is_json_envelope(arg)) {
            argType = "PathMaps";
        } else {
            throw new Error("Unrecognized argument " + (typeof arg) + " [" + String(arg) + "] " + "to Model#" + method + "");
        }
        if (groupType !== argType) {
            groupType = argType;
            group = { inputType: argType , arguments: [] };
            groups.push(group);
            if(outputFormat === "AsJSON") {
                group.values = [];
            } else if(outputFormat !== "AsValues") {
                group.values = values;
            }
        }

        group.arguments.push(arg);

        if(outputFormat === "AsJSON") {
            if(seedLimit === -1) {
                while(seedIndex < seedCount) {
                    group.values.push(values[seedIndex++] = {});
                }
            } else {
                if(seedLimit < seedCount) {
                    seedCount = seedLimit;
                }
                while(seedIndex < seedCount) {
                    group.values.push(values[seedIndex++] = {});
                }
            }
        }
    }

    this.boundPath = array_clone(model._path);
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

IdempotentResponse.prototype.ensureCollect = function ensureCollect(model, initialVersion) {

    var ensured = this["finally"](function ensureCollect() {

        var modelRoot = model._root;
        var modelCache = model._cache;
        var newVersion = modelCache[__version];
        var rootChangeHandler = modelRoot.onChange;

        if(rootChangeHandler && initialVersion !== newVersion) {
            rootChangeHandler();
        }

        modelRoot.collectionScheduler.schedule(function collectThisPass() {
            collect_lru(modelRoot, modelRoot.expired, get_size(modelCache), model._maxSize, model._collectRatio);
        });
    });

    return new this.constructor(function(observer) {
        return ensured.subscribe(observer);
    });
};

module.exports = IdempotentResponse;