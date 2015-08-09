var falcor = require("./../");

var Rx = require("rx/dist/rx");
var Observable = Rx.Observable;

var arraySlice = require("./../support/array-slice");

var noop = require("./../support/noop");

var jsongMixin = { outputFormat: { value: "AsJSONG" } };
var valuesMixin = { outputFormat: { value: "AsValues" } };
var pathMapMixin = { outputFormat: { value: "AsPathMap" } };
var progressiveMixin = { isProgressive: { value: true } };

function ModelResponse(subscribe) {
    this._subscribe = subscribe;
}

ModelResponse.create = function create(model, args, selector) {
    var response = new ModelResponse(subscribeToResponse);
    // TODO: make these private
    response.args = args;
    response.type = this;
    response.model = model;
    response.selector = selector;
    return response;
};

ModelResponse.prototype = Object.create(Observable.prototype);

ModelResponse.prototype.constructor = ModelResponse;

ModelResponse.prototype._mixin = function mixin() {
    var self = this;
    var mixins = arraySlice(arguments);
    return new self.constructor(function(observer) {
        return self.subscribe(mixins.reduce(function(proto, mixin2) {
            return Object.create(proto, mixin2);
        }, observer));
    });
};

ModelResponse.prototype.toPathValues = function toPathValues() {
    return this._mixin(valuesMixin).asObservable();
};

ModelResponse.prototype.toJSON = function toJSON() {
    return this._mixin(pathMapMixin);
};

ModelResponse.prototype._toJSONG = function toJSONG() {
    return this._mixin(jsongMixin);
};

ModelResponse.prototype.progressively = function progressively() {
    return this._mixin(progressiveMixin);
};

ModelResponse.prototype.subscribe = function subscribe(a, b, c) {
    var observer = a;
    if (!observer || typeof observer !== "object") {
        observer = { onNext: a || noop, onError: b || noop, onCompleted: c || noop };
    }
    var subscription = this._subscribe(observer);
    switch (typeof subscription) {
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
    return new falcor.Promise(function(resolve, reject) {
        var value, rejected = false;
        self.toArray().subscribe(
            function(values) {
                if (values.length <= 1) {
                    value = values[0];
                } else {
                    value = values;
                }
            },
            function(errors) {
                rejected = true;
                reject(errors);
            },
            function() {
                if (rejected === false) {
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
        .ensureCollect(model)
        .subscribe(observer));
}

module.exports = ModelResponse;
