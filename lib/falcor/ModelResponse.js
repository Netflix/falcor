var falcor = require('./Falcor');
var pathSyntax = require('falcor-path-syntax');

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

/**
 * A container for the results of an operation performed on a {@link Model}, which can convert the data into any of the following formats: JSON, {@link JSONGraph}, a stream of {@link PathValue}s, or a scalar value. Once the data format is determined, the ModelResponse container can be converted into any of the following container types: Observable (default), or a Promise. A ModelResponse can also push data to a node-style callback.
 * @constructor
 * @augments Observable
 */
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
            operationArgs: {value: pathSyntax.fromPathsOrPathValues(args)},
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

/**
 * Converts the data format to a stream of {@link PathValue}s
 * @return ModelResponse.<PathValue>
 */
ModelResponse.prototype.toPathValues = function() {
    return mixin(this, valuesMixin);
};

/**
 * Converts the data format to JSON 
 * @return ModelResponse.<JSONEnvelope>
 */
ModelResponse.prototype.toJSON = function() {
    return mixin(this, jsonMixin);
};

// TODO: Adapt this to eventual progressive API on model.
// TODO: Pretty sure this documentation is wrong as this just modifies output correct?

/**
 * The progressive method retrieves several {@link Path}s or {@link PathSet}s from the JSONGraph object, and makes them
 * available in the local cache. Like the {@link Model.prototype.getProgressively} function, getProgressively invokes a 
 * selector function every time is available, creating a stream of objects where each new object is a more populated version 
 * of the one before. The getProgressively function is a memory-efficient alternative to the getProgressively function, because get does not convert the requested data from JSONGraph to JSON. Instead the getProgressively function attempts to ensure that the requested paths are locally available in the cache when it invokes a selector function. Within the selector function, data is synchronously retrieved from the local cache and translated into another form - usually a view object. Within the selector function you can use helper methods like getValueSync and setValueSync to synchronously retrieve data from the cache. These methods are only valid within the selector function, and will throw if executed anywhere else.
 * @param {...PathSet} path - The path(s) to retrieve
 * @param {Function} selector - The callback to execute once all the paths have been retrieved
 * @return {ModelResponse.<JSONEnvelope>} the values found at the requested paths.
 */
ModelResponse.prototype.progressively = function() {
    return mixin(this, progressiveMixin);
};

/**
 * Converts the data format to {@link JSONGraph}
 * @return ModelResponse.<JSONGraphEnvelope>
 */
ModelResponse.prototype.toJSONG = function() {
    return mixin(this, jsongMixin);
};
ModelResponse.prototype.withErrorSelector = function(project) {
    return mixin(this, { errorSelector: { value: project } });
};
ModelResponse.prototype.withComparator = function(compare) {
    return mixin(this, { comparator: { value: compare } });
};
ModelResponse.prototype.then = function(onNext, onError) {
    var self = this;
    return new falcor.Promise(function(resolve, reject) {
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
                reject(error);
            },
            function() {
                if(Boolean(resolve)) {
                    resolve(value);
                }
            }
        );
    }).then(onNext, onError);
};

module.exports = ModelResponse;
