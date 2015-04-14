var falcor = require('./Falcor');

if(typeof Promise !== "undefined" && Promise) {
    falcor.Promise = Promise;
} else {
    falcor.Promise = require("promise");
}

var Observable  = falcor.Observable,
    valuesMixin = { format: { value: "AsValues"  } },
    jsonMixin   = { format: { value: "AsPathMap" } },
    jsongMixin  = { format: { value: "AsJSONG"   } },
    progressiveMixin = { operationIsProgressive: { value: true } };

function ModelResponse(forEach) {
    this._subscribe = forEach;
}

ModelResponse.create = function(forEach) {
    return new ModelResponse(forEach);
};

ModelResponse.fromOperation = function(model, args, selector, forEach) {
    return new ModelResponse(function(observer) {
        return forEach(Object.create(observer, {
            operationModel: {value: model},
            operationArgs: {value: args},
            operationSelector: {value: selector}
        }));
    });
};

function noop() {}
function mixin(self) {
    var mixins = Array.prototype.slice.call(arguments, 1);
    return new ModelResponse(function(other) {
        return self.subscribe(mixins.reduce(function(proto, mixin) {
            return Object.create(proto, mixin);
        }, other));
    });
}

ModelResponse.prototype = Observable.create(noop);
ModelResponse.prototype.format = "AsPathMap";
ModelResponse.prototype.toPathValues = function() {
    return mixin(this, valuesMixin);
};
ModelResponse.prototype.toJSON = function() {
    return mixin(this, jsonMixin);
};
ModelResponse.prototype.progressively = function() {
    return mixin(this, progressiveMixin);
};
ModelResponse.prototype.toJSONG = function() {
    return mixin(this, jsongMixin);
};
ModelResponse.prototype.then = function(onNext, onError) {
    var self = this;
    return new falcor.Promise(function(resolve, reject) {
        setTimeout(function(){
            var value = undefined;
            var error = undefined;
            self.toArray().subscribe(
                function(values) {
                    if(values.length <= 1) {
                        value = values[0];
                    } else {
                        value = values;
                    }
                },
                function(errors) {
                    if(errors.length <= 1) {
                        error = errors[0];
                    } else {
                        error = errors;
                    }
                    resolve = undefined;
                },
                function() {
                    if(!!resolve) {
                        resolve(value);
                    } else {
                        reject(error);
                    }
                }
            );
        }, 0);
    }).then(onNext, onError);
};

module.exports = ModelResponse;
