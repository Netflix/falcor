var falcor = require("falcor");

var Rx = require("rx/dist/rx");;
var Observable = Rx.Observable;

var array_map = require("falcor/support/array-map");
var array_slice = require("falcor/support/array-slice");
var array_clone = require("falcor/support/array-clone");
var array_concat = require("falcor/support/array-concat");
var array_flat_map = require("falcor/support/array-flat-map");

var is_array = Array.isArray;
var is_object = require("falcor/support/is-object");
var is_function = require("falcor/support/is-function");
var is_path_value = require("falcor/support/is-path-value");
var is_json_envelope = require("falcor/support/is-json-envelope");
var is_json_graph_envelope = require("falcor/support/is-json-graph-envelope");

var noop = require("falcor/support/noop");
var __version = require("falcor/internal/version");

var jsongMixin = { outputFormat: { value: "AsJSONG" } };
var valuesMixin = { outputFormat: { value: "AsValues" } };
var pathMapMixin = { outputFormat: { value: "AsPathMap" } };
var compactJSONMixin = { outputFormat: { value: "AsJSON" } };
var progressiveMixin = { isProgressive: { value: true } };

function ModelResponse(subscribe) {
    this._subscribe = subscribe;
};

ModelResponse.create = function create(model, args, selector) {
    var response = new ModelResponse(subscribeToResponse);
    response.args = args;
    response.type = this;
    response.model = model;
    response.selector = selector;
    return response;
};

ModelResponse.prototype = Object.create(Observable.prototype);

ModelResponse.prototype.constructor = ModelResponse;

ModelResponse.prototype.mixin = function mixin() {
    var self = this;
    var mixins = array_slice(arguments);
    return new self.constructor(function (observer) {
        return self.subscribe(mixins.reduce(function (proto, mixin) {
            return Object.create(proto, mixin);
        }, observer));
    });
};

ModelResponse.prototype.toPathValues = function toPathValues() {
    return this.mixin(valuesMixin).asObservable();
};

ModelResponse.prototype.toCompactJSON = function toCompactJSON() {
    return this.mixin(compactJSONMixin);
};

ModelResponse.prototype.toJSON = function toJSON() {
    return this.mixin(pathMapMixin);
};

ModelResponse.prototype.toJSONG = function toJSONG() {
    return this.mixin(jsongMixin);
};

ModelResponse.prototype.progressively = function progressively() {
    return this.mixin(progressiveMixin);
};

ModelResponse.prototype.subscribe = function subscribe(a, b, c) {
    if(!a || typeof a !== "object") {
        a = { onNext: a || noop, onError: b || noop, onCompleted: c || noop };
    }
    var subscription = this._subscribe(a);
    switch(typeof subscription) {
        case "function":
            return { dispose: subscription };
        case "object":
            return subscription || { dispose: noop };
        default:
            return { dispose: noop };
    }
};

ModelResponse.prototype.then = function then(onNext, onError) {
    var self = this;
    return new falcor.Promise(function (resolve, reject) {
        var value = undefined;
        self.toArray().subscribe(
            function (values) {
                if (values.length <= 1) {
                    value = values[0];
                } else {
                    value = values;
                }
            },
            function (errors) {
                resolve = undefined;
                reject(errors);
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
    var response = new this.type();

    response.model = model;
    response.args = this.args;
    response.selector = this.selector;
    response.outputFormat = observer.outputFormat || "AsPathMap";
    response.isProgressive = observer.isProgressive || false;
    response.subscribeCount = 0;
    response.subscribeLimit = observer.retryLimit || 10;

    return (response
        .initialize()
        .invokeSourceRequest(model)
        .ensureCollect(model, model._cache[__version])
        .subscribe(observer));
};

module.exports = ModelResponse;