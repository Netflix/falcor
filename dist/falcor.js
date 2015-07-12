/*!
 * Copyright 2014 Netflix, Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */
(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Rx = require(161) && require(159) && require(160);

function falcor(opts) {
    return new falcor.Model(opts);
}

if(typeof Promise !== "undefined" && Promise) {
    falcor.Promise = Promise;
} else {
    falcor.Promise = require(152);
}

module.exports = falcor;

falcor.Model = require(2);

},{"152":152,"159":159,"160":160,"161":161,"2":2}],2:[function(require,module,exports){
var $ref = require(128);
var $atom = require(126);
var $error = require(127);

var ModelRoot = require(4);
var ModelDataSourceAdapter = require(3);

var RequestQueue = require(54);
var GetResponse = require(57);
var SetResponse = require(61);
var CallResponse = require(56);
var InvalidateResponse = require(59);

var ASAPScheduler = require(62);
var TimeoutScheduler = require(64);
var ImmediateScheduler = require(63);

var identity = require(98);
var array_clone = require(80);
var array_slice = require(84);

var collect_lru = require(48);
var pathSyntax = require(145);

var get_size = require(94);
var is_object = require(106);
var is_function = require(103);
var is_path_value = require(107);
var is_json_envelope = require(104);
var is_json_graph_envelope = require(105);

var set_cache = require(65);
var set_json_graph_as_json_dense = require(66);

module.exports = Model;

Model.ref = function ref(path) {
    return { $type: $ref, value: pathSyntax.fromPath(path) };
};

Model.atom = function atom(value) {
    return { $type: $atom, value: value };
};

Model.error = function error(error) {
    return { $type: $error, value: error };
};

Model.pathValue = function pathValue(path, value) {
    return { path: pathSyntax.fromPath(path), value: value };
};

/**
 * A Model object is used to execute commands against a {@link JSONGraph} object. {@link Model}s can work with a local JSONGraph cache, or it can work with a remote {@link JSONGraph} object through a {@link DataSource}.
 * @constructor
 * @param {?Object} options - A set of options to customize behavior
 * @param {?DataSource} options.source - A data source to retrieve and manage the {@link JSONGraph}
 * @param {?JSONGraph} options.cache - Initial state of the {@link JSONGraph}
 * @param {?number} options.maxSize - The maximum size of the cache
 * @param {?number} options.collectRatio - The ratio of the maximum size to collect when the maxSize is exceeded
 * @param {?Model~errorSelector} options.errorSelector - A function used to translate errors before they are returned
 */
function Model(options) {

    options = options || {};

    this._root = options._root || new ModelRoot(options);
    this._path = options.path || options._path || [];
    this._scheduler = options.scheduler || options._scheduler || new ImmediateScheduler();
    this._source = options.source || options._source;
    this._request = options.request || options._request || new RequestQueue(this, this._scheduler);
    this._router = options.router || options._router;

    if(options.boxed || options.hasOwnProperty("_boxed")) {
        this._boxed = options.boxed || options._boxed;
    }

    if(options.materialized || options.hasOwnProperty("_materialized")) {
        this._materialized = options.materialized || options._materialized;
    }

    if(typeof options.treatErrorsAsValues === "boolean") {
        this._treatErrorsAsValues = options.treatErrorsAsValues;
    } else if(options.hasOwnProperty("_treatErrorsAsValues")) {
        this._treatErrorsAsValues = options._treatErrorsAsValues;
    }

    if(options.cache) {
        this.setCache(options.cache);
    } else if(options._cache) {
        this._cache = options._cache;
    } else {
        this._cache = {};
    }
}

Model.prototype.constructor = Model;

Model.prototype._materialized = false;
Model.prototype._boxed = false;
Model.prototype._progressive = false;
Model.prototype._treatErrorsAsValues = false;
Model.prototype._maxSize = Math.pow(2, 53) - 1;
Model.prototype._collectRatio = 0.75;

/**
 * The get method retrieves several {@link Path}s or {@link PathSet}s from a {@link Model}. The get method is versatile and may be called in several different ways, allowing you to make different trade-offs between performance and expressiveness. The simplest invocation returns an ModelResponse stream that contains a JSON object with all of the requested values. An optional selector function can also be passed in order to translate the retrieved data before it appears in the Observable stream. If a selector function is provided, the output will be an Observable stream with the result of the selector function invocation instead of a ModelResponse stream.
 If you intend to transform the JSON data into another form, specifying a selector function may be more efficient. The selector function is run once all of the requested path values are available. In the body of the selector function, you can read data from the Model's cache using {@link Model.prototype.getValueSync} and transform it directly into its final representation (ex. an HTML string). This technique can reduce allocations by preventing the get method from copying the data in {@link Model}'s cache into an intermediary JSON representation.
 Instead of directly accessing the cache within the selector function, you can optionally pass arguments to the selector function and they will be automatically bound to the corresponding {@link Path} or {@link PathSet} passed to the get method. If a {@link Path} is bound to a selector function argument, the function argument will contain the value found at that path. However if a {@link PathSet} is bound to a selector function argument, the function argument will be a JSON structure containing all of the path values. Using argument binding can provide a good balance between allocations and expressiveness. For more detail on how {@link Path}s and {@link PathSet}s are bound to selector function arguments, see the examples below.
 * @function
 * @param {...PathSet} path - The path(s) to retrieve
 * @param {?Function} selector - The callback to execute once all of the paths have been retrieved
 * @return {ModelResponse.<JSONEnvelope>|Observable} - The requested data as JSON, or the result of the optional selector function.
 */
Model.prototype.get = function get() {
    var args;
    var argsIdx = -1;
    var argsLen = arguments.length;
    var selector = arguments[argsLen - 1];
    if(is_function(selector)) {
        argsLen = argsLen - 1;
    } else {
        selector = undefined;
    }
    args = new Array(argsLen);
    while(++argsIdx < argsLen) {
        args[argsIdx] = arguments[argsIdx];
    }
    return GetResponse.create(this, args, selector);
};

/**
 * Sets the value at one or more places in the JSONGraph model. The set method accepts one or more {@link PathValue}s, each of which is a combination of a location in the document and the value to place there.  In addition to accepting  {@link PathValue}s, the set method also returns the values after the set operation is complete.
 * @function
 * @param {...(PathValue | JSONGraphEnvelope | JSONEnvelope)} value - A value or collection of values to set into the Model.
 * @return {ModelResponse.<JSON> | Observable} - An {@link Observable} stream containing the values in the JSONGraph model after the set was attempted.
 */
Model.prototype.set = function set() {
    var args;
    var argsIdx = -1;
    var argsLen = arguments.length;
    var selector = arguments[argsLen - 1];
    if(is_function(selector)) {
        argsLen = argsLen - 1;
    } else {
        selector = undefined;
    }
    args = new Array(argsLen);
    while(++argsIdx < argsLen) {
        args[argsIdx] = arguments[argsIdx];
    }
    return SetResponse.create(this, args, selector);
};

/*
 * Invoke a function
 * @function
 * @param {Path} functionPath - The path to the function to invoke
 * @param {Array.<Object>} args - The arguments to pass to the function
 * @param {Array.<PathSet>} pathSuffixes - The paths to retrieve from objects returned from the function
 * @param {Array.<PathSet>} calleePaths - The paths to retrieve from function callee after successful function execution
 * @param {Function} selector The selector function
 * @returns {ModelResponse.<*> | Observable} The {JSONGraph} fragment and associated metadata returned from the invoked function
 */
Model.prototype.call = function call() {
    var args;
    var argsIdx = -1;
    var argsLen = arguments.length;
    var selector = arguments[argsLen - 1];
    if(is_function(selector)) {
        argsLen = argsLen - 1;
    } else {
        selector = undefined;
    }
    args = new Array(argsLen);
    while(++argsIdx < argsLen) {
        args[argsIdx] = arguments[argsIdx];
    }
    return CallResponse.create(this, args, selector);
};

Model.prototype.invalidate = function invalidate() {
    var args;
    var argsIdx = -1;
    var argsLen = arguments.length;
    var selector = arguments[argsLen - 1];
    if(is_function(selector)) {
        argsLen = argsLen - 1;
    } else {
        selector = undefined;
    }
    args = new Array(argsLen);
    while(++argsIdx < argsLen) {
        args[argsIdx] = arguments[argsIdx];
    }
    InvalidateResponse.create(this, args, selector).subscribe();
    return this;
};

/**
 * Returns a clone of the {@link Model} bound to a location within the {@link JSONGraph}. The bound location is never a {@link Reference}: any {@link Reference}s encountered while resolving the bound {@link Path} are always replaced with the {@link Reference}s target value. For subsequent operations on the {@link Model}, all paths will be evaluated relative to the bound path. Bind allows you to:
 * - Expose only a fragment of the {@link JSONGraph} to components, rather than the entire graph
 * - Hide the location of a {@link JSONGraph} fragment from components
 * - Optimize for executing multiple operations and path looksup at/below the same location in the {@link JSONGraph}
 * @param {Path} boundPath - The path to bind to
 * @param {...PathSet} relativePathsToPreload - Paths to preload before Model is created. These paths are relative to the bound path.
 * @return {Observable.<Model>} - An Observable stream with a single value, the bound {@link Model}, or an empty stream if nothing is found at the path
*/
Model.prototype.bind = require(5);

/**
 * Synchronously returns a clone of the {@link Model} bound to a location within the {@link JSONGraph}. Unlike bind or bindSync, softBind never optimizes its path.  Soft bind is ideal if you want to retrieve the bound path every time, rather than retrieve the optimized path once and then always retrieve paths from that object in the JSON Graph. For example, if you always wanted to retrieve the name from the first item in a list you could softBind to the path "list[0]".
 * @param {Path} path - The path prefix to retrieve every time an operation is executed on a Model.
 * @return {Model}
 */
Model.prototype.softBind = function softBind(path) {
    path = pathSyntax.fromPath(path);
    if(Array.isArray(path) === false) {
        throw new Error("Model#softBind must be called with an Array path.");
    }
    return this.clone({ _path: path });
};

/**
 * Get data for a single {@link Path}
 * @param {Path} path - The path to retrieve
 * @return {Observable.<*>} - The value for the path
 * @example
 var model = new falcor.Model({source: new falcor.HttpDataSource("/model.json") });

 model.
     getValue('user.name').
     subscribe(function(name) {
         console.log(name);
     });

 // The code above prints "Jim" to the console.
 */
Model.prototype.getValue = function getValue(path) {
    return this.get(path, identity);
};

Model.prototype.setValue = function setValue(path, value) {
    path = pathSyntax.fromPath(path);
    value = is_path_value(path) ? path : Model.pathValue(path, value);
    return this.set(value, identity);
};

// TODO: Does not throw if given a PathSet rather than a Path, not sure if it should or not.
// TODO: Doc not accurate? I was able to invoke directly against the Model, perhaps because I don't have a data source?
// TODO: Not clear on what it means to "retrieve objects in addition to JSONGraph values"
/**
 * Synchronously retrieves a single path from the local {@link Model} only and will not retrieve missing paths from the {@link DataSource}. This method can only be invoked when the {@link Model} does not have a {@link DataSource} or from within a selector function. See {@link Model.prototype.get}. The getValueSync method differs from the asynchronous get methods (ex. get, getValues) in that it can be used to retrieve objects in addition to JSONGraph values.
 * @arg {Path} path - The path to retrieve
 * @return {*} - The value for the specified path
 */
Model.prototype.getValueSync = require(20);

Model.prototype.setValueSync = require(78);

Model.prototype.bindSync = require(6);

/**
 * Set the local cache to a {@link JSONGraph} fragment. This method can be a useful way of mocking a remote document, or restoring the local cache from a previously stored state
 * @param {JSONGraph} jsonGraph - The {@link JSONGraph} fragment to use as the local cache
 */
Model.prototype.setCache = function setCache(cacheOrJSONGraphEnvelope) {
    var cache = this._cache;
    if(cacheOrJSONGraphEnvelope !== cache) {
        var modelRoot = this._root;
        this._cache = {};
        if(typeof cache !== "undefined") {
            collect_lru(modelRoot, modelRoot.expired, get_size(cache), 0);
        }
        if(is_json_graph_envelope(cacheOrJSONGraphEnvelope)) {
            set_json_graph_as_json_dense(this, [cacheOrJSONGraphEnvelope], []);
        } else if(is_json_envelope(cacheOrJSONGraphEnvelope)) {
            set_cache(this, cacheOrJSONGraphEnvelope.json);
        } else if(is_object(cacheOrJSONGraphEnvelope)) {
            set_cache(this, cacheOrJSONGraphEnvelope);
        }
    } else if(typeof cache === "undefined") {
        this._cache = {};
    }
    return this;
};

/**
 * Get the local {@link JSONGraph} cache. This method can be a useful to store the state of the cache
 * @param {...Array.<PathSet>} [pathSets] - The path(s) to retrieve. If no paths are specified, the entire {@link JSONGraph} is returned
 * @return {JSONGraph} jsonGraph - A {@link JSONGraph} fragment
 * @example
 // Storing the boxshot of the first 10 titles in the first 10 genreLists to local storage.
 localStorage.setItem('cache', JSON.stringify(model.getCache("genreLists[0...10][0...10].boxshot")));
 */
Model.prototype.getCache = function getCache() {
    var paths = array_slice(arguments);
    if(paths.length === 0) {
        paths[0] = { json: this._cache };
    }
    var result;
    this.get.apply(this.
            withoutDataSource().
            boxValues().
            treatErrorsAsValues().
            materialize(), paths).
        toJSONG().
        subscribe(function(envelope) {
            result = envelope.jsong;
        });
    return result;
};

Model.prototype.getGeneration = function getGeneration(path) {
    path = path && pathSyntax.fromPath(path) || [];
    if (Array.isArray(path) === false) {
        throw new Error("Model#getGenerationSync must be called with an Array path.");
    }
    if (this._path.length) {
        path = this._path.concat(path);
    }
    return this._getGeneration(this, path);
};

Model.prototype.syncCheck = function syncCheck(name) {
    if (Boolean(this._source) && this._root.syncRefCount <= 0 && this._root.unsafeMode === false) {
        throw new Error("Model#" + name + " may only be called within the context of a request selector.");
    }
    return true;
};

Model.prototype.clone = function clone(opts) {
    var clone = new Model(this);
    for(var key in opts) {
        var value = opts[key];
        if(value === "delete") {
            delete clone[key];
        } else {
            clone[key] = value;
        }
    }
    return clone;
};

// TODO: Should we be clearer this only applies to "get" operations? I'm assuming that is true
/**
 * Returns a clone of the {@link Model} that eanbles batching. Within the configured time period, paths for operations of the same type are collected and executed on the {@link DataSource} in a batch. Batching can make more efficient use of the {@link DataSource} depending on its implementation, for example, reducing the number of HTTP requests to the server
 * @param {?Scheduler|number} schedulerOrDelay - Either a {@link Scheduler} that determines when to send a batch to the {@link DataSource}, or the number in milliseconds to collect a batch before sending to the {@link DataSource}. If this parameter is omitted, then batch collection ends at the end of the next tick.
 * @return {Model}
 */
Model.prototype.batch = function batch(schedulerOrDelay) {
    if(typeof schedulerOrDelay === "number") {
        schedulerOrDelay = new TimeoutScheduler(Math.round(Math.abs(schedulerOrDelay)));
    } else if(!schedulerOrDelay || !schedulerOrDelay.schedule) {
        schedulerOrDelay = new ASAPScheduler();
    }
    return this.clone({ _request: new RequestQueue(this, schedulerOrDelay) });
};

/**
 * Returns a clone of the {@link Model} that disables batching. This is the default mode. Each operation will be executed on the {@link DataSource} separately
 * @name unbatch
 * @memberof Model.prototype
 * @function
 * @return {Model} a {@link Model} that batches requests of the same type and sends them to the data source together.
 */
Model.prototype.unbatch = function unbatch() {
    return this.clone({ _request: new RequestQueue(this, new ImmediateScheduler()) });
};

// TODO: Add example of treatErrorsAsValues
/**
 * Returns a clone of the {@link Model} that treats errors as values. Errors will be reported in the same callback used to report data. Errors will appear as objects in responses, rather than being sent to the {@link Observable~onErrorCallback} callback of the {@link ModelResponse}.
 * @return {Model}
 */
Model.prototype.treatErrorsAsValues = function treatErrorsAsValues() {
    return this.clone({ _treatErrorsAsValues: true });
};

Model.prototype.asDataSource = function asDataSource() {
    return new ModelDataSourceAdapter(this);
};

Model.prototype.materialize = function materialize() {
    return this.clone({ _materialized: true });
};

Model.prototype.dematerialize = function materialize() {
    return this.clone({ _materialized: "delete" });
};

/**
 * Returns a clone of the {@link Model} that boxes values returning the wrapper ({@link Atom}, {@link Reference}, or {@link Error}), rather than the value inside it. This allows any metadata attached to the wrapper to be inspected
 * @return {Model}
 */
Model.prototype.boxValues = function boxValues() {
    return this.clone({ _boxed: true });
};

/**
 * Returns a clone of the {@link Model} that unboxes values, returning the value inside of the wrapper ({@link Atom}, {@link Reference}, or {@link Error}), rather than the wrapper itself. This is the default mode.
 * @return {Model}
 */
Model.prototype.unboxValues = function unboxValues() {
    return this.clone({ _boxed: "delete" });
};

/**
 * Returns a clone of the {@link Model} that only uses the local {@link JSONGraph} and never uses a {@link DataSource} to retrieve missing paths
 * @return {Model}
 */
Model.prototype.withoutDataSource = function withoutDataSource() {
    return this.clone({ _source: "delete" });
};

Model.prototype.toJSON = function toJSON() {
    return { $type: "ref", value: this._path };
};

Model.prototype.getPath = function getPath() {
    return array_clone(this._path);
};

var get_walk = require(16);

Model.prototype._getBoundValue = require(13);
Model.prototype._getGeneration = require(14);
Model.prototype._getValueSync = require(15);
Model.prototype._getPathSetsAsValues = require(12)(get_walk);
Model.prototype._getPathSetsAsJSON = require(9)(get_walk);
Model.prototype._getPathSetsAsPathMap = require(11)(get_walk);
Model.prototype._getPathSetsAsJSONG = require(10)(get_walk);
Model.prototype._getPathMapsAsValues = require(12)(get_walk);
Model.prototype._getPathMapsAsJSON = require(9)(get_walk);
Model.prototype._getPathMapsAsPathMap = require(11)(get_walk);
Model.prototype._getPathMapsAsJSONG = require(10)(get_walk);

Model.prototype._setPathValuesAsJSON = require(74);
Model.prototype._setPathValuesAsJSONG = require(75);
Model.prototype._setPathValuesAsPathMap = require(76);
Model.prototype._setPathValuesAsValues = require(77);

Model.prototype._setPathMapsAsJSON = require(70);
Model.prototype._setPathMapsAsJSONG = require(71);
Model.prototype._setPathMapsAsPathMap = require(72);
Model.prototype._setPathMapsAsValues = require(73);

Model.prototype._setJSONGsAsJSON = require(66);
Model.prototype._setJSONGsAsJSONG = require(67);
Model.prototype._setJSONGsAsPathMap = require(68);
Model.prototype._setJSONGsAsValues = require(69);

Model.prototype._setCache = require(65);

Model.prototype._invalidatePathSetsAsJSON = require(47);
Model.prototype._invalidatePathMapsAsJSON = require(46);

},{"10":10,"103":103,"104":104,"105":105,"106":106,"107":107,"11":11,"12":12,"126":126,"127":127,"128":128,"13":13,"14":14,"145":145,"15":15,"16":16,"20":20,"3":3,"4":4,"46":46,"47":47,"48":48,"5":5,"54":54,"56":56,"57":57,"59":59,"6":6,"61":61,"62":62,"63":63,"64":64,"65":65,"66":66,"67":67,"68":68,"69":69,"70":70,"71":71,"72":72,"73":73,"74":74,"75":75,"76":76,"77":77,"78":78,"80":80,"84":84,"9":9,"94":94,"98":98}],3:[function(require,module,exports){
function ModelDataSourceAdapter(model) {
    this._model = model.materialize().boxValues().treatErrorsAsValues();
}

ModelDataSourceAdapter.prototype = {
    get: function(pathSets) {
        return this._model.get.apply(this._model, pathSets).toJSONG();
    },
    set: function(jsongResponse) {
        return this._model.set(jsongResponse).toJSONG();
    },
    call: function(path, args, suffixes, paths) {
        var params = [path, args, suffixes].concat(paths);
        return this._model.call.apply(this._model, params).toJSONG();
    }
};

module.exports = ModelDataSourceAdapter;
},{}],4:[function(require,module,exports){
var is_function = require(103);
var ImmediateScheduler = require(63);

function ModelRoot(options) {

    options = options || {};

    this.syncRefCount = 0;
    this.expired = options.expired || [];
    this.unsafeMode = options.unsafeMode || false;
    this.collectionScheduler = options.collectionScheduler || new ImmediateScheduler();

    if(is_function(options.comparator)) {
        this.comparator = options.comparator;
    }

    if(is_function(options.errorSelector)) {
        this.errorSelector = options.errorSelector;
    }

    if(is_function(options.onChange)) {
        this.onChange = options.onChange;
    }
};

ModelRoot.prototype.errorSelector = function errorSelector(x, y) { return y; };
ModelRoot.prototype.comparator = function comparator(a, b) {
    if (Boolean(a) && typeof a === "object" && a.hasOwnProperty("value") &&
        Boolean(b) && typeof b === "object" && b.hasOwnProperty("value")) {
        return a.value === b.value;
    }
    return a === b;
};

module.exports = ModelRoot;
},{"103":103,"63":63}],5:[function(require,module,exports){
var Rx = require(161);
var pathSyntax = require(145);

module.exports = function bind(boundPath) {

    var model = this;
    var modelRoot = model._root;
    var pathsIndex = -1;
    var pathsCount = arguments.length - 1;
    var paths = new Array(pathsCount);

    boundPath = pathSyntax.fromPath(boundPath);

    while(++pathsIndex < pathsCount) {
        paths[pathsIndex] = pathSyntax.fromPath(arguments[pathsIndex + 1]);
    }

    if(modelRoot.syncRefCount <= 0 && pathsCount === 0) {
        throw new Error("Model#bind requires at least one value path.");
    }

    return Rx.Observable.defer(function() {
        var value;
        var errorHappened = false;
        try {
            ++modelRoot.syncRefCount;
            value = model.bindSync(boundPath);
        } catch(e) {
            value = e;
            errorHappened = true;
        } finally {
            --modelRoot.syncRefCount;
            return errorHappened ?
                Rx.Observable["throw"](value) :
                Rx.Observable["return"](value)
        }
    }).
    flatMap(function(boundModel) {
        if(Boolean(boundModel)) {
            if(pathsCount > 0) {
                return boundModel.get.apply(boundModel, paths.concat(function() {
                    return boundModel;
                }))["catch"](Rx.Observable.empty());
            }
            return Rx.Observable["return"](boundModel);
        } else if(pathsCount > 0) {
            return (model.get.apply(model, paths.map(function(path) {
                    return boundPath.concat(path);
                }).concat(function() {
                    return model.bind(boundPath);
                }))
                .mergeAll());
        }
        return Rx.Observable.empty();
    });
};

},{"145":145,"161":161}],6:[function(require,module,exports){
var noop = require(111);
var $error = require(127);
var pathSyntax = require(145);
var getBoundValue = require(13);
var get_type = require(95);

module.exports = function bindSync(path) {

    path = pathSyntax.fromPath(path);

    if (!Array.isArray(path)) {
        throw new Error("Model#bindSync must be called with an Array path.");
    }

    var boundValue = this.syncCheck("bindSync") && getBoundValue(this, this._path.concat(path));

    var path = boundValue.path;
    var node = boundValue.value;
    var found = boundValue.found;
    var shorted = boundValue.shorted;
    var type;

    if(!found) {
        return undefined;
    } else if(Boolean(node) && (type = get_type(node))) {
        if(type === $error) {
            if (this._boxed) {
                throw node;
            }
            throw node.value;
        } else if(node.value === void 0) {
            return undefined;
        }
    }

    return this.clone({ _path: path });
};

},{"111":111,"127":127,"13":13,"145":145,"95":95}],7:[function(require,module,exports){
/**
 * An InvalidModelError can only happen when a user binds, whether sync
 * or async to shorted value.  See the unit tests for examples.
 *
 * @param {String} message
 */
function InvalidModelError(boundPath, shortedPath) {
    this.message = 'The boundPath of the model is not valid since a value or error was found before the path end.';
    this.stack = (new Error()).stack;
    this.boundPath = boundPath;
    this.shortedPath = shortedPath;
};

// instanceof will be an error, but stack will be correct because its defined in the constructor.
InvalidModelError.prototype = new Error();
InvalidModelError.prototype.name = 'InvalidModel';

module.exports = InvalidModelError;
},{}],8:[function(require,module,exports){
var hardLink = require(22);
var createHardlink = hardLink.create;
var onValue = require(19);
var isExpired = require(23);
var $ref = require(128);
var __context = require(30);
var promote = require(26).promote;

function followReference(model, root, node, referenceContainer, reference, seed, outputFormat) {

    var depth = 0;
    var k, next;

    while (true) { //eslint-disable-line no-constant-condition
        if (depth === 0 && referenceContainer[__context]) {
            depth = reference.length;
            next = referenceContainer[__context];
        } else {
            k = reference[depth++];
            next = node[k];
        }
        if (next) {
            var type = next.$type;
            var value = type && next.value || next;

            if (depth < reference.length) {
                if (type) {
                    node = next;
                    break;
                }

                node = next;
                continue;
            }

            // We need to report a value or follow another reference.
            else {

                node = next;

                if (type && isExpired(next)) {
                    break;
                }

                if (!referenceContainer[__context]) {
                    createHardlink(referenceContainer, next);
                }

                // Restart the reference follower.
                if (type === $ref) {
                    if (outputFormat === 'JSONG') {
                        onValue(model, next, seed, null, null, reference, null, outputFormat);
                    } else {
                        promote(model, next);
                    }

                    depth = 0;
                    reference = value;
                    referenceContainer = next;
                    node = root;
                    continue;
                }

                break;
            }
        } else {
            node = undefined;
        }
        break;
    }


    if (depth < reference.length && node !== undefined) {
        var ref = [];
        for (var i = 0; i < depth; i++) {
            ref[i] = reference[i];
        }
        reference = ref;
    }

    return [node, reference];
}

module.exports = followReference;

},{"128":128,"19":19,"22":22,"23":23,"26":26,"30":30}],9:[function(require,module,exports){
var getBoundValue = require(13);
var isPathValue = require(25);
module.exports = function(walk) {
    return function getAsJSON(model, paths, values) {
        var results = {
            values: [],
            errors: [],
            requestedPaths: [],
            optimizedPaths: [],
            requestedMissingPaths: [],
            optimizedMissingPaths: []
        };
        var requestedMissingPaths = results.requestedMissingPaths;
        var inputFormat = Array.isArray(paths[0]) || isPathValue(paths[0]) ?
            'Paths' : 'JSON';
        var cache = model._cache;
        var boundPath = model._path;
        var currentCachePosition;
        var missingIdx = 0;
        var boundOptimizedPath, optimizedPath;
        var i, j, len, bLen;

        results.values = values;
        if (!values) {
            values = [];
        }
        if (boundPath.length) {
            var boundValue = getBoundValue(model, boundPath);
            currentCachePosition = boundValue.value;
            optimizedPath = boundOptimizedPath = boundValue.path;
        } else {
            currentCachePosition = cache;
            optimizedPath = boundOptimizedPath = [];
        }

        for (i = 0, len = paths.length; i < len; i++) {
            var valueNode = undefined;
            var pathSet = paths[i];
            if (values[i]) {
                valueNode = values[i];
            }
            if (len > 1) {
                optimizedPath = [];
                for (j = 0, bLen = boundOptimizedPath.length; j < bLen; j++) {
                    optimizedPath[j] = boundOptimizedPath[j];
                }
            }
            if(inputFormat == 'JSON') {
                pathSet = pathSet.json;
            } else if (pathSet.path) {
                pathSet = pathSet.path;
            }

            walk(model, cache, currentCachePosition, pathSet, 0, valueNode, [], results, optimizedPath, [], inputFormat, 'JSON');
            if (missingIdx < requestedMissingPaths.length) {
                for (j = missingIdx, length = requestedMissingPaths.length; j < length; j++) {
                    requestedMissingPaths[j].pathSetIndex = i;
                }
                missingIdx = length;
            }
        }

        return results;
    };
};


},{"13":13,"25":25}],10:[function(require,module,exports){
var getBoundValue = require(13);
var isPathValue = require(25);
module.exports = function(walk) {
    return function getAsJSONG(model, paths, values) {
        var results = {
            values: [],
            errors: [],
            requestedPaths: [],
            optimizedPaths: [],
            requestedMissingPaths: [],
            optimizedMissingPaths: []
        };
        var inputFormat = Array.isArray(paths[0]) || isPathValue(paths[0]) ?
            'Paths' : 'JSON';
        results.values = values;
        var cache = model._cache;
        var boundPath = model._path;
        var currentCachePosition;
        if (boundPath.length) {
            throw 'It is not legal to use the JSON Graph format from a bound Model. JSON Graph format can only be used from a root model.';
        } else {
            currentCachePosition = cache;
        }

        for (var i = 0, len = paths.length; i < len; i++) {
            var pathSet = paths[i];
            if(inputFormat == 'JSON') {
                pathSet = pathSet.json;
            } else if (pathSet.path) {
                pathSet = pathSet.path;
            }
            walk(model, cache, currentCachePosition, pathSet, 0, values[0], [], results, [], [], inputFormat, 'JSONG');
        }
        return results;
    };
};


},{"13":13,"25":25}],11:[function(require,module,exports){
var getBoundValue = require(13);
var isPathValue = require(25);
module.exports = function(walk) {
    return function getAsPathMap(model, paths, values) {
        var valueNode;
        var results = {
            values: [],
            errors: [],
            requestedPaths: [],
            optimizedPaths: [],
            requestedMissingPaths: [],
            optimizedMissingPaths: []
        };
        var inputFormat = Array.isArray(paths[0]) || isPathValue(paths[0]) ?
            'Paths' : 'JSON';
        valueNode = values[0];
        results.values = values;

        var cache = model._cache;
        var boundPath = model._path;
        var currentCachePosition;
        var optimizedPath, boundOptimizedPath;
        if (boundPath.length) {
            var boundValue = getBoundValue(model, boundPath);
            currentCachePosition = boundValue.value;
            optimizedPath = boundOptimizedPath = boundValue.path;
        } else {
            currentCachePosition = cache;
            optimizedPath = boundOptimizedPath = [];
        }

        for (var i = 0, len = paths.length; i < len; i++) {
            if (len > 1) {
                optimizedPath = [];
                for (j = 0, bLen = boundOptimizedPath.length; j < bLen; j++) {
                    optimizedPath[j] = boundOptimizedPath[j];
                }
            }
            var pathSet = paths[i];
            if(inputFormat == 'JSON') {
                pathSet = pathSet.json;
            } else if (pathSet.path) {
                pathSet = pathSet.path;
            }
            walk(model, cache, currentCachePosition, pathSet, 0, valueNode, [], results, optimizedPath, [], inputFormat, 'PathMap');
        }
        return results;
    };
};

},{"13":13,"25":25}],12:[function(require,module,exports){
var getBoundValue = require(13);
var isPathValue = require(25);
module.exports = function(walk) {
    return function getAsValues(model, paths, onNext) {
        var results = {
            values: [],
            errors: [],
            requestedPaths: [],
            optimizedPaths: [],
            requestedMissingPaths: [],
            optimizedMissingPaths: []
        };
        var inputFormat = Array.isArray(paths[0]) || isPathValue(paths[0]) ?
            'Paths' : 'JSON';
        var cache = model._cache;
        var boundPath = model._path;
        var currentCachePosition;
        var optimizedPath, boundOptimizedPath;
        if (boundPath.length) {
            var boundValue = getBoundValue(model, boundPath);
            currentCachePosition = boundValue.value;
            optimizedPath = boundOptimizedPath = boundValue.path;
        } else {
            currentCachePosition = cache;
            optimizedPath = boundOptimizedPath = [];
        }

        for (var i = 0, len = paths.length; i < len; i++) {
            if (len > 1) {
                optimizedPath = [];
                for (j = 0, bLen = boundOptimizedPath.length; j < bLen; j++) {
                    optimizedPath[j] = boundOptimizedPath[j];
                }
            }
            var pathSet = paths[i];
            if(inputFormat == 'JSON') {
                pathSet = pathSet.json;
            } else if (pathSet.path) {
                pathSet = pathSet.path;
            }
            walk(model, cache, currentCachePosition, pathSet, 0, onNext, null, results, optimizedPath, [], inputFormat, 'Values');
        }
        return results;
    };
};


},{"13":13,"25":25}],13:[function(require,module,exports){
var getValueSync = require(15);
var InvalidModelError = require(7);

module.exports = function getBoundValue(model, path) {

    var boundPath = path;
    var boxed, materialized,
        treatErrorsAsValues,
        value, shorted, found;

    boxed = model._boxed;
    materialized = model._materialized;
    treatErrorsAsValues = model._treatErrorsAsValues;

    model._boxed = true;
    model._materialized = true;
    model._treatErrorsAsValues = true;

    value = getValueSync(model, path.concat(null), true);

    model._boxed = boxed;
    model._materialized = materialized;
    model._treatErrorsAsValues = treatErrorsAsValues;

    path = value.optimizedPath;
    shorted = value.shorted;
    found = value.found;
    value = value.value;

    while (path.length && path[path.length - 1] === null) {
        path.pop();
    }

    if(found && shorted) {
        throw new InvalidModelError(boundPath, path);
    }

    return {
        path: path,
        value: value,
        shorted: shorted,
        found: found
    };
};


},{"15":15,"7":7}],14:[function(require,module,exports){
var __generation = require(32);

module.exports = function _getGeneration(model, path) {
    // ultra fast clone for boxed values.
    var gen = model._getValueSync({
        _boxed: true,
        _root: model._root,
        _cache: model._cache,
        _treatErrorsAsValues: model._treatErrorsAsValues
    }, path, true).value;
    return gen && gen[__generation];
};

},{"32":32}],15:[function(require,module,exports){
var followReference = require(8);
var clone = require(21);
var isExpired = require(23);
var promote = require(26).promote;
var $ref = require(128);
var $atom = require(126);
var $error = require(127);

module.exports = function getValueSync(model, simplePath, noClone) {
    var root = model._cache;
    var len = simplePath.length;
    var optimizedPath = [];
    var shorted = false, shouldShort = false;
    var depth = 0;
    var key, i, next = root, type, curr = root, out, ref, refNode;
    var found = true;

    do {
        key = simplePath[depth++];
        if (key !== null) {
            next = curr[key];
            optimizedPath[optimizedPath.length] = key;
        }

        if (!next) {
            out = undefined;
            shorted = true;
            found = false;
            break;
        }

        type = next.$type;

        // Up to the last key we follow references
        if (depth < len) {
            if (type === $ref) {
                ref = followReference(model, root, root, next, next.value);
                refNode = ref[0];

                // The next node is also set to undefined because nothing
                // could be found, this reference points to nothing, so
                // nothing must be returned.
                if (!refNode) {
                    out = undefined;
                    next = undefined;
                    break;
                }
                type = refNode.$type;
                next = refNode;
                optimizedPath = ref[1].slice(0);
            }

            if (type) {
                break;
            }
        }
        // If there is a value, then we have great success, else, report an undefined.
        else {
            out = next;
        }
        curr = next;

    } while (next && depth < len);

    if (depth < len) {
        // Unfortunately, if all that follows are nulls, then we have not shorted.
        for (i = depth; i < len; ++i) {
            if (simplePath[depth] !== null) {
                shouldShort = true;
                break;
            }
        }
        // if we should short or report value.  Values are reported on nulls.
        if (shouldShort) {
            shorted = true;
            out = undefined;
        } else {
            out = next;
        }

        for (i = depth; i < len; ++i) {
            optimizedPath[optimizedPath.length] = simplePath[i];
        }
    }

    // promotes if not expired
    if (out) {
        if (isExpired(out)) {
            out = undefined;
        } else {
            promote(model, out);
        }
    }

    if (out && out.$type === $error && !model._treatErrorsAsValues) {
        throw {
            path: depth === len ? simplePath : simplePath.slice(0, depth),
            value: out.value
        };
    } else if (out && model._boxed) {
        out = Boolean(type) && !noClone ? clone(out) : out;
    } else if (!out && model._materialized) {
        out = {$type: $atom};
    } else if (out) {
        out = out.value;
    }

    return {
        value: out,
        shorted: shorted,
        optimizedPath: optimizedPath,
        found: found
    };
};

},{"126":126,"127":127,"128":128,"21":21,"23":23,"26":26,"8":8}],16:[function(require,module,exports){
var followReference = require(8);
var onError = require(17);
var onMissing = require(18);
var onValue = require(19);
var lru = require(26);
var hardLink = require(22);
var isMaterialized = require(24);
var removeHardlink = hardLink.remove;
var splice = lru.splice;
var isExpired = require(23);
var permuteKey = require(27);
var $ref = require(128);
var $error = require(127);
var __invalidated = require(34);
var prefix = require(39);

function getWalk(model, root, curr, pathOrJSON, depth, seedOrFunction, positionalInfo, outerResults, optimizedPath, requestedPath, inputFormat, outputFormat, fromReference) {
    if ((!curr || curr && curr.$type) &&
        evaluateNode(model, curr, pathOrJSON, depth, seedOrFunction, requestedPath, optimizedPath, positionalInfo, outerResults, outputFormat, fromReference)) {
        return;
    }

    // We continue the search to the end of the path/json structure.
    else {

        // Base case of the searching:  Have we hit the end of the road?
        // Paths
        // 1) depth === path.length
        // PathMaps (json input)
        // 2) if its an object with no keys
        // 3) its a non-object
        var jsonQuery = inputFormat === 'JSON';
        var atEndOfJSONQuery = false;
        var k, i, len;
        if (jsonQuery) {
            // it has a $type property means we have hit a end.
            if (pathOrJSON && pathOrJSON.$type) {
                atEndOfJSONQuery = true;
            }

            else if (pathOrJSON && typeof pathOrJSON === 'object') {
                k = Object.keys(pathOrJSON);

                // Parses out all the prefix keys so that later parts
                // of the algorithm do not have to consider them.
                var parsedKeys = [];
                var parsedKeysLength = -1;
                for (i = 0, len = k.length; i < len; ++i) {
                    if (k[i][0] !== prefix && k[i][0] !== '$') {
                        parsedKeys[++parsedKeysLength] = k[i];
                    }
                }
                k = parsedKeys;
                if (k.length === 1) {
                    k = k[0];
                }
            }

            // found a primitive, we hit the end.
            else {
                atEndOfJSONQuery = true;
            }
        } else {
            k = pathOrJSON[depth];
        }

        // BaseCase: we have hit the end of our query without finding a 'leaf' node, therefore emit missing.
        if (atEndOfJSONQuery || !jsonQuery && depth === pathOrJSON.length) {
            if (isMaterialized(model)) {
                onValue(model, curr, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat, fromReference);
                return;
            }
            onMissing(model, curr, pathOrJSON, depth, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat);
            return;
        }

        var memo = {done: false};
        var permutePosition = positionalInfo;
        var permuteRequested = requestedPath;
        var permuteOptimized = optimizedPath;
        var asJSONG = outputFormat === 'JSONG';
        var asJSON = outputFormat === 'JSON';
        var isKeySet = false;
        var hasChildren = false;
        depth++;

        var key;
        if (k && typeof k === 'object') {
            memo.isArray = Array.isArray(k);
            memo.arrOffset = 0;

            key = permuteKey(k, memo);
            isKeySet = true;

            // The complex key provided is actual empty
            if (memo.done) {
                return;
            }
        } else {
            key = k;
            memo.done = true;
        }

        if (asJSON && isKeySet) {
            permutePosition = [];
            for (i = 0, len = positionalInfo.length; i < len; i++) {
                permutePosition[i] = positionalInfo[i];
            }
            permutePosition.push(depth - 1);
        }

        do {
            fromReference = false;
            if (!memo.done) {
                permuteOptimized = [];
                permuteRequested = [];
                for (i = 0, len = requestedPath.length; i < len; i++) {
                    permuteRequested[i] = requestedPath[i];
                }
                for (i = 0, len = optimizedPath.length; i < len; i++) {
                    permuteOptimized[i] = optimizedPath[i];
                }
            }

            var nextPathOrPathMap = jsonQuery ? pathOrJSON[key] : pathOrJSON;
            if (jsonQuery && nextPathOrPathMap) {
                if (typeof nextPathOrPathMap === 'object') {
                    if (nextPathOrPathMap.$type) {
                        hasChildren = false;
                    } else {
                        hasChildren = Object.keys(nextPathOrPathMap).length > 0;
                    }
                }
            }

            var next;
            if (key === null || jsonQuery && key === '__null') {
                next = curr;
            } else {
                next = curr[key];
                permuteOptimized.push(key);
                permuteRequested.push(key);
            }

            if (next) {
                var nType = next.$type;
                var value = nType && next.value || next;

                if (jsonQuery && hasChildren || !jsonQuery && depth < pathOrJSON.length) {

                    if (nType && nType === $ref && !isExpired(next)) {
                        if (asJSONG) {
                            onValue(model, next, seedOrFunction, outerResults, false, permuteOptimized, permutePosition, outputFormat);
                        }
                        var ref = followReference(model, root, root, next, value, seedOrFunction, outputFormat);
                        fromReference = true;
                        next = ref[0];
                        var refPath = ref[1];

                        permuteOptimized = [];
                        for (i = 0, len = refPath.length; i < len; i++) {
                            permuteOptimized[i] = refPath[i];
                        }
                    }
                }
            }
            getWalk(model, root, next, nextPathOrPathMap, depth, seedOrFunction, permutePosition, outerResults, permuteOptimized, permuteRequested, inputFormat, outputFormat, fromReference);

            if (!memo.done) {
                key = permuteKey(k, memo);
            }

        } while (!memo.done);
    }
}

function evaluateNode(model, curr, pathOrJSON, depth, seedOrFunction, requestedPath, optimizedPath, positionalInfo, outerResults, outputFormat, fromReference) {
    // BaseCase: This position does not exist, emit missing.
    if (!curr) {
        if (isMaterialized(model)) {
            onValue(model, curr, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat, fromReference);
        } else {
            onMissing(model, curr, pathOrJSON, depth, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat);
        }
        return true;
    }

    var currType = curr.$type;

    positionalInfo = positionalInfo || [];

    // The Base Cases.  There is a type, therefore we have hit a 'leaf' node.
    if (currType === $error) {
        if (fromReference) {
            requestedPath.push(null);
        }
        if (outputFormat === 'JSONG' || model._treatErrorsAsValues) {
            onValue(model, curr, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat, fromReference);
        } else {
            onError(model, curr, requestedPath, optimizedPath, outerResults);
        }
    }

    // Else we have found a value, emit the current position information.
    else {
        if (isExpired(curr)) {
            if (!curr[__invalidated]) {
                splice(model, curr);
                removeHardlink(curr);
            }
            onMissing(model, curr, pathOrJSON, depth, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat);
        } else {
            onValue(model, curr, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat, fromReference);
        }
    }

    return true;
}

module.exports = getWalk;

},{"127":127,"128":128,"17":17,"18":18,"19":19,"22":22,"23":23,"24":24,"26":26,"27":27,"34":34,"39":39,"8":8}],17:[function(require,module,exports){
var lru = require(26);
var clone = require(21);
var promote = lru.promote;
module.exports = function onError(model, node, permuteRequested, permuteOptimized, outerResults) {
    var value = node.value;

    if (model._boxed) {
        value = clone(node);
    }
    outerResults.errors.push({path: permuteRequested, value: value});
    promote(model, node);
};


},{"21":21,"26":26}],18:[function(require,module,exports){
var support = require(29);
var fastCat = support.fastCat,
    fastCatSkipNulls = support.fastCatSkipNulls,
    fastCopy = support.fastCopy;
var isExpired = require(23);
var spreadJSON = require(28);
var clone = require(21);

module.exports = function onMissing(model, node, path, depth, seedOrFunction, outerResults, permuteRequested, permuteOptimized, permutePosition, outputFormat) {
    var pathSlice;
    if (Array.isArray(path)) {
        if (depth < path.length) {
            pathSlice = fastCopy(path, depth);
        } else {
            pathSlice = [];
        }

        concatAndInsertMissing(pathSlice, outerResults, permuteRequested, permuteOptimized, permutePosition, outputFormat);
    } else {
        pathSlice = [];
        spreadJSON(path, pathSlice);

        for (var i = 0, len = pathSlice.length; i < len; i++) {
            concatAndInsertMissing(pathSlice[i], outerResults, permuteRequested, permuteOptimized, permutePosition, outputFormat, true);
        }
    }
};

function concatAndInsertMissing(remainingPath, results, permuteRequested, permuteOptimized, permutePosition, outputFormat, __null) {
    var i = 0, len;
    if (__null) {
        for (i = 0, len = remainingPath.length; i < len; i++) {
            if (remainingPath[i] === '__null') {
                remainingPath[i] = null;
            }
        }
    }
    if (outputFormat === 'JSON') {
        permuteRequested = fastCat(permuteRequested, remainingPath);
        for (i = 0, len = permutePosition.length; i < len; i++) {
            var idx = permutePosition[i];
            var r = permuteRequested[idx];
            permuteRequested[idx] = [r];
        }
        results.requestedMissingPaths.push(permuteRequested);
        results.optimizedMissingPaths.push(fastCatSkipNulls(permuteOptimized, remainingPath));
    } else {
        results.requestedMissingPaths.push(fastCat(permuteRequested, remainingPath));
        results.optimizedMissingPaths.push(fastCatSkipNulls(permuteOptimized, remainingPath));
    }
}


},{"21":21,"23":23,"28":28,"29":29}],19:[function(require,module,exports){
var lru = require(26);
var clone = require(21);
var promote = lru.promote;
var $ref = require(128);
var $atom = require(126);
var $error = require(127);
module.exports = function onValue(model, node, seedOrFunction, outerResults, permuteRequested, permuteOptimized, permutePosition, outputFormat, fromReference) {
    var i, len, k, key, curr, prev, prevK;
    var materialized = false, valueNode;
    if (node) {
        promote(model, node);
    }

    if (!node || node.value === undefined) {
        materialized = model._materialized;
    }

    // materialized
    if (materialized) {
        valueNode = {$type: $atom};
    }

    // Boxed Mode will clone the node.
    else if (model._boxed) {
        valueNode = clone(node);
    }

    // JSONG always clones the node.
    else if (node.$type === $ref || node.$type === $error) {
        if (outputFormat === 'JSONG') {
            valueNode = clone(node);
        } else {
            valueNode = node.value;
        }
    }

    else {
        if (outputFormat === 'JSONG') {
            if (typeof node.value === 'object') {
                valueNode = clone(node);
            } else {
                valueNode = node.value;
            }
        } else {
            valueNode = node.value;
        }
    }


    if (permuteRequested) {
        if (fromReference && permuteRequested[permuteRequested.length - 1] !== null) {
            permuteRequested.push(null);
        }
        outerResults.requestedPaths.push(permuteRequested);
        outerResults.optimizedPaths.push(permuteOptimized);
    }

    switch (outputFormat) {

        case 'Values':
            // Its difficult to invert this statement, so for now i am going
            // to leave it as is.  This just prevents onNexts from happening on
            // undefined nodes
            if (valueNode === undefined ||
                !materialized && !model._boxed && valueNode &&
                valueNode.$type === $atom && valueNode.value === undefined) {
                return;
            }
            seedOrFunction({path: permuteRequested, value: valueNode});
            break;

        case 'PathMap':
            len = permuteRequested.length - 1;
            if (len === -1) {
                seedOrFunction.json = valueNode;
            } else {
                curr = seedOrFunction.json;
                if (!curr) {
                    curr = seedOrFunction.json = {};
                }
                for (i = 0; i < len; i++) {
                    k = permuteRequested[i];
                    if (!curr[k]) {
                        curr[k] = {};
                    }
                    prev = curr;
                    prevK = k;
                    curr = curr[k];
                }
                k = permuteRequested[i];
                if (k !== null) {
                    curr[k] = valueNode;
                } else {
                    prev[prevK] = valueNode;
                }
            }
            break;

        case 'JSON':
            if (seedOrFunction) {
                if (permutePosition.length) {
                    if (!seedOrFunction.json) {
                        seedOrFunction.json = {};
                    }
                    curr = seedOrFunction.json;
                    for (i = 0, len = permutePosition.length - 1; i < len; i++) {
                        k = permutePosition[i];
                        key = permuteRequested[k];

                        if (!curr[key]) {
                            curr[key] = {};
                        }
                        curr = curr[key];
                    }

                    // assign the last
                    k = permutePosition[i];
                    key = permuteRequested[k];
                    curr[key] = valueNode;
                } else {
                    seedOrFunction.json = valueNode;
                }
            }
            break;

        case 'JSONG':
            curr = seedOrFunction.jsong;
            if (!curr) {
                curr = seedOrFunction.jsong = {};
                seedOrFunction.paths = [];
            }
            for (i = 0, len = permuteOptimized.length - 1; i < len; i++) {
                key = permuteOptimized[i];

                if (!curr[key]) {
                    curr[key] = {};
                }
                curr = curr[key];
            }

            // assign the last
            key = permuteOptimized[i];

            // TODO: Special case? do string comparisons make big difference?
            curr[key] = materialized ? {$type: $atom} : valueNode;
            if (permuteRequested) {
                seedOrFunction.paths.push(permuteRequested);
            }
            break;
    }
};



},{"126":126,"127":127,"128":128,"21":21,"26":26}],20:[function(require,module,exports){
var pathSyntax = require(145);

module.exports = function getValueSync(path) {
    path = pathSyntax.fromPath(path);
    if (Array.isArray(path) === false) {
        throw new Error("Model#getValueSync must be called with an Array path.");
    }
    if (this._path.length) {
        path = this._path.concat(path);
    }
    return this.syncCheck("getValueSync") && this._getValueSync(this, path).value;
};
},{"145":145}],21:[function(require,module,exports){
// Copies the node
var prefix = require(39);
module.exports = function clone(node) {
    var outValue, i, len;
    var keys = Object.keys(node);
    outValue = {};
    for (i = 0, len = keys.length; i < len; i++) {
        var k = keys[i];
        if (k[0] === prefix) {
            continue;
        }
        outValue[k] = node[k];
    }
    return outValue;
};


},{"39":39}],22:[function(require,module,exports){
var __ref = require(42);
var __context = require(30);
var __ref_index = require(41);
var __refs_length = require(43);

function createHardlink(from, to) {
    
    // create a back reference
    var backRefs  = to[__refs_length] || 0;
    to[__ref + backRefs] = from;
    to[__refs_length] = backRefs + 1;
    
    // create a hard reference
    from[__ref_index] = backRefs;
    from[__context] = to;
}

function removeHardlink(cacheObject) {
    var context = cacheObject[__context];
    if (context) {
        var idx = cacheObject[__ref_index];
        var len = context[__refs_length];
        
        while (idx < len) {
            context[__ref + idx] = context[__ref + idx + 1];
            ++idx;
        }
        
        context[__refs_length] = len - 1;
        cacheObject[__context] = undefined;
        cacheObject[__ref_index] = undefined;
    }
}

module.exports = {
    create: createHardlink,
    remove: removeHardlink
};

},{"30":30,"41":41,"42":42,"43":43}],23:[function(require,module,exports){
var now = require(112);
module.exports = function isExpired(node) {
    var $expires = node.$expires === undefined && -1 || node.$expires;
    return $expires !== -1 && $expires !== 1 && ($expires === 0 || $expires < now());
};

},{"112":112}],24:[function(require,module,exports){
module.exports = function isMaterialized(model) {
    return model._materialized && !(model._router || model._source);
};

},{}],25:[function(require,module,exports){
module.exports = function isPathValue(x) {
    return x.path && x.value;
};
},{}],26:[function(require,module,exports){
var __head = require(33);
var __tail = require(44);
var __next = require(36);
var __prev = require(40);
var __invalidated = require(34);

// [H] -> Next -> ... -> [T]
// [T] -> Prev -> ... -> [H]
function lruPromote(model, object) {
    var root = model._root;
    var head = root[__head];
    if (head === object) {
        return;
    }

    // First insert
    if (!head) {
        root[__head] = object;
        return;
    }

    // The head and the tail need to separate
    if (!root[__tail]) {
        root[__head] = object;
        root[__tail] = head;
        object[__next] = head;
        
        // Now tail
        head[__prev] = object;
        return;
    }

    // Its in the cache.  Splice out.
    var prev = object[__prev];
    var next = object[__next];
    if (next) {
        next[__prev] = prev;
    }
    if (prev) {
        prev[__next] = next;
    }
    object[__prev] = undefined;

    // Insert into head position
    root[__head] = object;
    object[__next] = head;
    head[__prev] = object;
}

function lruSplice(model, object) {
    var root = model._root;

    // Its in the cache.  Splice out.
    var prev = object[__prev];
    var next = object[__next];
    if (next) {
        next[__prev] = prev;
    }
    if (prev) {
        prev[__next] = next;
    }
    object[__prev] = undefined;
    
    if (object === root[__head]) {
        root[__head] = undefined;
    }
    if (object === root[__tail]) {
        root[__tail] = undefined;
    }
    object[__invalidated] = true;
    root.expired.push(object);
}

module.exports = {
    promote: lruPromote,
    splice: lruSplice
};
},{"33":33,"34":34,"36":36,"40":40,"44":44}],27:[function(require,module,exports){
module.exports = function permuteKey(key, memo) {
    if (memo.isArray) {
        if (memo.loaded && memo.rangeOffset > memo.to) {
            memo.arrOffset++;
            memo.loaded = false;
        }

        var idx = memo.arrOffset, length = key.length;
        if (idx === length) {
            memo.done = true;
            return '';
        }

        var el = key[memo.arrOffset];
        var type = typeof el;
        if (type === 'object') {
            if (!memo.loaded) {
                memo.from = el.from || 0;
                memo.to = el.to ||
                    typeof el.length === 'number' && memo.from + el.length - 1 || 0;
                memo.rangeOffset = memo.from;
                memo.loaded = true;
            }

            return memo.rangeOffset++;
        } else {
            memo.arrOffset = idx + 1;
            return el;
        }
    } else {
        if (!memo.loaded) {
            memo.from = key.from || 0;
            memo.to = key.to ||
                typeof key.length === 'number' && memo.from + key.length - 1 || 0;
            memo.rangeOffset = memo.from;
            memo.loaded = true;
        }
        if (memo.rangeOffset > memo.to) {
            memo.done = true;
            return '';
        }

        return memo.rangeOffset++;
    }
};


},{}],28:[function(require,module,exports){
var fastCopy = require(29).fastCopy;
module.exports = function spreadJSON(root, bins, bin) {
    bin = bin || [];
    if (!bins.length) {
        bins.push(bin);
    }
    if (!root || typeof root !== 'object' || root.$type) {
        return [];
    }
    var keys = Object.keys(root);
    if (keys.length === 1) {
        bin.push(keys[0]);
        spreadJSON(root[keys[0]], bins, bin);
    } else {
        for (var i = 0, len = keys.length; i < len; i++) {
            var k = keys[i];
            var nextBin = fastCopy(bin);
            nextBin.push(k);
            bins.push(nextBin);
            spreadJSON(root[k], bins, nextBin);
        }
    }
};

},{"29":29}],29:[function(require,module,exports){
function fastCopy(arr, i) {
    var a = [], len, j;
    for (j = 0, i = i || 0, len = arr.length; i < len; j++, i++) {
        a[j] = arr[i];
    }
    return a;
}

function fastCatSkipNulls(arr1, arr2) {
    var a = [], i, len, j;
    for (i = 0, len = arr1.length; i < len; i++) {
        a[i] = arr1[i];
    }
    for (j = 0, len = arr2.length; j < len; j++) {
        if (arr2[j] !== null) {
            a[i++] = arr2[j];
        }
    }
    return a;
}

function fastCat(arr1, arr2) {
    var a = [], i, len, j;
    for (i = 0, len = arr1.length; i < len; i++) {
        a[i] = arr1[i];
    }
    for (j = 0, len = arr2.length; j < len; j++) {
        a[i++] = arr2[j];
    }
    return a;
}



module.exports = {
    fastCat: fastCat,
    fastCatSkipNulls: fastCatSkipNulls,
    fastCopy: fastCopy
};

},{}],30:[function(require,module,exports){
module.exports = require(39) + "context";
},{"39":39}],31:[function(require,module,exports){
module.exports = require(39) + "count";
},{"39":39}],32:[function(require,module,exports){
module.exports = require(39) + "generation";
},{"39":39}],33:[function(require,module,exports){
module.exports = require(39) + "head";
},{"39":39}],34:[function(require,module,exports){
module.exports = require(39) + "invalidated";
},{"39":39}],35:[function(require,module,exports){
module.exports = require(39) + "key";
},{"39":39}],36:[function(require,module,exports){
module.exports = require(39) + "next";
},{"39":39}],37:[function(require,module,exports){
module.exports = require(39) + "offset";
},{"39":39}],38:[function(require,module,exports){
module.exports = require(39) + "parent";
},{"39":39}],39:[function(require,module,exports){
/**
 * http://en.wikipedia.org/wiki/Delimiter#ASCII_delimited_text
 * record separator character.
 */
module.exports = String.fromCharCode(30);

},{}],40:[function(require,module,exports){
module.exports = require(39) + "prev";
},{"39":39}],41:[function(require,module,exports){
module.exports = require(39) + "ref-index";
},{"39":39}],42:[function(require,module,exports){
module.exports = require(39) + "ref";
},{"39":39}],43:[function(require,module,exports){
module.exports = require(39) + "refs-length";
},{"39":39}],44:[function(require,module,exports){
module.exports = require(39) + "tail";
},{"39":39}],45:[function(require,module,exports){
module.exports = require(39) + "version";
},{"39":39}],46:[function(require,module,exports){
module.exports = invalidate_json_sparse_as_json_dense;

var clone = require(85);
var array_clone = require(80);
var array_slice = require(84);

var options = require(113);
var walk_path_map = require(132);

var is_object = require(106);

var get_valid_key = require(96);
var update_graph = require(124);
var invalidate_node = require(101);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function invalidate_json_sparse_as_json_dense(model, pathmaps, values, error_selector, comparator) {

    var roots = options([], model, error_selector, comparator);
    var index = -1;
    var count = pathmaps.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = array_clone(roots.bound);
    var keys_stack = [];
    var json, hasValue, hasValues;

    roots[_cache] = roots.root;

    while (++index < count) {

        json = values && values[index];
        if (is_object(json)) {
            roots.json = roots[_json] = parents[_json] = nodes[_json] = json.json || (json.json = {})
        } else {
            roots.json = roots[_json] = parents[_json] = nodes[_json] = undefined;
        }

        var pathmap = pathmaps[index].json;
        roots.index = index;

        walk_path_map(onNode, onEdge, pathmap, keys_stack, 0, roots, parents, nodes, requested, optimized);

        hasValue = roots.hasValue;
        if (Boolean(hasValue)) {
            hasValues = true;
            if (is_object(json)) {
                json.json = roots.json;
            }
            delete roots.json;
            delete roots.hasValue;
        } else if (is_object(json)) {
            delete json.json;
        }
    }

    return {
        values: values,
        errors: roots.errors,
        hasValue: hasValues,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathmap, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset, is_keyset) {

    var parent, json;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        json = parents[_json];
        parent = parents[_cache];
    } else {
        json = is_keyset && nodes[_json] || parents[_json];
        parent = nodes[_cache];
    }

    var node = parent[key];

    if (is_reference) {
        parents[_cache] = parent;
        nodes[_cache] = node;
        return;
    }

    parents[_json] = json;

    if (is_branch) {
        parents[_cache] = nodes[_cache] = node;
        if (is_keyset && Boolean(json)) {
            nodes[_json] = json[keyset] || (json[keyset] = {});
        }
        return;
    }

    nodes[_cache] = node;

    var lru = roots.lru;
    var size = node.$size || 0;
    var version = roots.version;
    invalidate_node(parent, node, key, lru);
    update_graph(parent, size, version, lru);
}

function onEdge(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);

    if (keyset == null) {
        roots.json = clone(roots, node, type, node && node.value);
    } else if (Boolean(json = parents[_json])) {
        json[keyset] = clone(roots, node, type, node && node.value);
    }
    roots.hasValue = true;
    roots.requestedPaths.push(array_slice(requested, roots.offset));
}
},{"101":101,"106":106,"113":113,"115":115,"124":124,"132":132,"80":80,"84":84,"85":85,"96":96}],47:[function(require,module,exports){
module.exports = invalidate_path_sets_as_json_dense;

var clone = require(85);
var array_clone = require(80);
var array_slice = require(84);

var options = require(113);
var walk_path_set = require(134);

var is_object = require(106);

var get_valid_key = require(96);
var update_graph = require(124);
var invalidate_node = require(101);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function invalidate_path_sets_as_json_dense(model, pathsets, values) {

    var roots = options([], model);
    var index = -1;
    var count = pathsets.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];
    var json, hasValue;

    roots[_cache] = roots.root;

    while (++index < count) {

        json = values && values[index];
        if (is_object(json)) {
            roots[_json] = parents[_json] = nodes[_json] = json.json || (json.json = {})
        } else {
            roots[_json] = parents[_json] = nodes[_json] = undefined;
        }

        var pathset = pathsets[index];
        roots.index = index;

        walk_path_set(onNode, onEdge, pathset, 0, roots, parents, nodes, requested, optimized);

        if (is_object(json)) {
            json.json = roots.json;
        }
        delete roots.json;
    }

    return {
        values: values,
        errors: roots.errors,
        hasValue: true,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathset, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset, is_keyset) {

    var parent, json;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        json = parents[_json];
        parent = parents[_cache];
    } else {
        json = is_keyset && nodes[_json] || parents[_json];
        parent = nodes[_cache];
    }

    var node = parent[key];

    if (is_reference) {
        parents[_cache] = parent;
        nodes[_cache] = node;
        return;
    }

    parents[_json] = json;

    if (is_branch) {
        parents[_cache] = nodes[_cache] = node;
        if (is_keyset && Boolean(json)) {
            nodes[_json] = json[keyset] || (json[keyset] = {});
        }
        return;
    }

    nodes[_cache] = node;

    var lru = roots.lru;
    var size = node.$size || 0;
    var version = roots.version;
    invalidate_node(parent, node, key, roots.lru);
    update_graph(parent, size, version, lru);
}

function onEdge(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);

    if (keyset == null) {
        roots.json = clone(roots, node, type, node && node.value);
    } else if (Boolean(json = parents[_json])) {
        json[keyset] = clone(roots, node, type, node && node.value);
    }
    roots.hasValue = true;
    roots.requestedPaths.push(array_slice(requested, roots.offset));
}
},{"101":101,"106":106,"113":113,"115":115,"124":124,"134":134,"80":80,"84":84,"85":85,"96":96}],48:[function(require,module,exports){
var __key  = require(35);
var __parent = require(38);

var __head = require(33);
var __tail = require(44);
var __next = require(36);
var __prev = require(40);

var remove_node = require(116);
var update_graph = require(124);

module.exports = function collect(lru, expired, total, max, ratio, version) {
    
    if(typeof ratio !== "number") {
        ratio = 0.75;
    }

    var shouldUpdate = typeof version === "number";
    var targetSize = max * ratio;
    var parent, node, size;

    while(!!(node = expired.pop())) {
        size = node.$size || 0;
        total -= size;
        if(shouldUpdate === true) {
            update_graph(node, size, version, lru);
        } else if(parent = node[__parent]) {
            remove_node(parent, node, node[__key], lru);
        }
    }

    if(total >= max) {
        var prev = lru[__tail];
        while((total >= targetSize) && !!(node = prev)) {
            prev = prev[__prev];
            size = node.$size || 0;
            total -= size;
            if(shouldUpdate === true) {
                update_graph(node, size, version, lru);
            }
        }
        
        if((lru[__tail] = lru[__prev] = prev) == null) {
            lru[__head] = lru[__next] = undefined;
        } else {
            prev[__next] = undefined;
        }
    }
};
},{"116":116,"124":124,"33":33,"35":35,"36":36,"38":38,"40":40,"44":44}],49:[function(require,module,exports){
var $expires_never = require(129);
var __head = require(33);
var __tail = require(44);
var __next = require(36);
var __prev = require(40);

var is_object = require(106);

module.exports = function lru_promote(root, node) {
    if(is_object(node) && (node.$expires !== $expires_never)) {
        var head = root[__head], tail = root[__tail],
            next = node[__next], prev = node[__prev];
        if (node !== head) {
            (next != null && typeof next === "object") && (next[__prev] = prev);
            (prev != null && typeof prev === "object") && (prev[__next] = next);
            (next = head) && (head != null && typeof head === "object") && (head[__prev] = node);
            (root[__head] = root[__next] = head = node);
            (head[__next] = next);
            (head[__prev] = undefined);
        }
        if (tail == null || node === tail) {
            root[__tail] = root[__prev] = tail = prev || node;
        }
    }
    return node;
};
},{"106":106,"129":129,"33":33,"36":36,"40":40,"44":44}],50:[function(require,module,exports){
var __head = require(33);
var __tail = require(44);
var __next = require(36);
var __prev = require(40);

module.exports = function lru_splice(root, node) {
    var head = root[__head], tail = root[__tail],
        next = node[__next], prev = node[__prev];
    (next != null && typeof next === "object") && (next[__prev] = prev);
    (prev != null && typeof prev === "object") && (prev[__next] = next);
    (node === head) && (root[__head] = root[__next] = next);
    (node === tail) && (root[__tail] = root[__prev] = prev);
    node[__next] = node[__prev] = undefined;
    head = tail = next = prev = undefined;
};
},{"33":33,"36":36,"40":40,"44":44}],51:[function(require,module,exports){
var Rx = require(161);
var Observer = Rx.Observer;
var Observable = Rx.Observable;
var immediateScheduler = Rx.Scheduler.immediate;

var Request = require(53);

function BatchedRequest() {
    Request.call(this);
}

BatchedRequest.create = Request.create;

BatchedRequest.prototype = Object.create(Request.prototype);
BatchedRequest.prototype.constructor = BatchedRequest;

BatchedRequest.prototype.getSourceObservable = function getSourceObservable() {

    if (this.refCountedObservable) {
        return this.refCountedObservable;
    }

    var count = 0;
    var source = this;
    var subject = new Rx.ReplaySubject(null, null, immediateScheduler);
    var connection = null;

    return (this.refCountedObservable = Observable.create(function subscribe(observer) {
        if (++count === 1 && !connection) {
            connection = source.subscribe(subject);
        }
        var subscription = subject.subscribe(observer);
        return function dispose() {
            subscription.dispose();
            if (--count === 0) {
                connection.dispose();
            }
        }
    }));
};

module.exports = BatchedRequest;
},{"161":161,"53":53}],52:[function(require,module,exports){
var Rx = require(161);
var Observer = Rx.Observer;

var BatchedRequest = require(51);

var collapse = require(91)
var array_map = require(83);

var set_json_graph_as_json_dense = require(66);
var set_json_values_as_json_dense = require(74);

var empty_array = new Array(0);

function GetRequest() {
    BatchedRequest.call(this);
}

GetRequest.create = BatchedRequest.create;

GetRequest.prototype = Object.create(BatchedRequest.prototype);
GetRequest.prototype.constructor = GetRequest;

GetRequest.prototype.method = "get";

GetRequest.prototype.getSourceArgs = function getSourceArgs() {
    return (this.paths = collapse(this.pathmaps));
};

GetRequest.prototype.getSourceObserver = function getSourceObserver(observer) {

    var model = this.model;
    var bound = model._path;
    var paths = this.paths;
    var modelRoot = model._root;
    var errorSelector = modelRoot.errorSelector;
    var comparator = modelRoot.comparator;

    return BatchedRequest.prototype.getSourceObserver.call(this, Observer.create(
        function onNext(jsonGraphEnvelope) {

            model._path = empty_array;

            set_json_graph_as_json_dense(model, [{
                paths: paths,
                jsonGraph: jsonGraphEnvelope.jsonGraph
            }], empty_array, errorSelector, comparator);

            model._path = bound;

            observer.onNext(jsonGraphEnvelope);
        },
        function onError(error) {

            model._path = empty_array;

            set_json_values_as_json_dense(model, array_map(paths, function (path) {
                return {
                    path: path,
                    value: error
                };
            }), empty_array, errorSelector, comparator);

            model._path = bound;

            observer.onError(error);
        },
        function onCompleted() {
            observer.onCompleted();
        }
    ));
};

module.exports = GetRequest;
},{"161":161,"51":51,"66":66,"74":74,"83":83,"91":91}],53:[function(require,module,exports){
var Rx = require(161);
var Observer = Rx.Observer;
var Observable = Rx.Observable;
var Disposable = Rx.Disposable;
var SerialDisposable = Rx.SerialDisposable;
var CompositeDisposable = Rx.CompositeDisposable;

var collapse = require(91);
var permute_keyset = require(114);
var keyset_to_key = require(109);

var is_array = Array.isArray;
var is_object = require(106);
var is_primitive = require(108);

var __count = require(31);

function Request() {
    this.length = 0;
    this.pending = false;
    this.pathmaps = [];
    Observable.call(this, this._subscribe);
}

Request.create = function create(queue, model, index) {
    var request = new this();
    request.queue = queue;
    request.model = model;
    request.index = index;
    return request;
};

Request.prototype = Object.create(Observable.prototype);

Request.prototype.constructor = Request;

Request.prototype.insertPath = function insertPathIntoRequest(path, union, parent, index, count) {

    index = index || 0;
    count = count || path.length - 1;
    parent = parent || this.pathmaps[count + 1] || (this.pathmaps[count + 1] = Object.create(null));

    if (parent == null) {
        return false;
    }

    var key, node;
    var keyset = path[index];
    var is_keyset = is_object(keyset);
    var run_once = false;

    while (is_keyset && permute_keyset(keyset) && (run_once = true) || (run_once = !run_once)) {
        key = keyset_to_key(keyset, is_keyset);
        node = parent[key];
        if (index < count) {
            if (node == null) {
                if (union) {
                    return false;
                }
                node = parent[key] = Object.create(null);
            }
            if (this.insertPath(path, union, node, index + 1, count) === false) {
                return false;
            }
        } else {
            parent[key] = (node || 0) + 1;
            this.length += 1;
        }
    }
    return true;
};

Request.prototype.removePath = function removePathFromRequest(path, parent, index, count) {

    index = index || 0;
    count = count || path.length - 1;
    parent = parent || this.pathmaps[count + 1];

    if (parent == null) {
        return true;
    }

    var key, node, deleted = 0;
    var keyset = path[index];
    var is_keyset = is_object(keyset);
    var run_once = false;

    while (is_keyset && permute_keyset(keyset) && (run_once = true) || (run_once = !run_once)) {
        key = keyset_to_key(keyset, is_keyset);
        node = parent[key];
        if (node == null) {
            continue;
        } else if (index < count) {
            deleted += this.removePath(path, node, index + 1, count);
            var emptyNodeKey = void 0;
            for (emptyNodeKey in node) {
                break;
            }
            if (emptyNodeKey === void 0) {
                delete parent[key];
            }
        } else {
            if ((parent[key] = (node || 1) - 1) === 0) {
                delete parent[key];
            }
            deleted += 1;
            this.length -= 1;
        }
    }

    return deleted;
};

Request.prototype.getSourceObserver = function getSourceObserver(observer) {
    var request = this;
    return Observer.create(
        function onNext(envelope) {
            envelope.jsonGraph = envelope.jsonGraph ||
                envelope.jsong ||
                envelope.values ||
                envelope.value;
            envelope.index = request.index;
            observer.onNext(envelope);
        },
        function onError(e) {
            observer.onError(e);
        },
        function onCompleted() {
            observer.onCompleted();
        });
};

Request.prototype._subscribe = function _subscribe(observer) {

    var request = this;
    var queue = this.queue;

    request.pending = true;

    var isDisposed = false;
    var sourceSubscription = new SerialDisposable();
    var queueDisposable = Disposable.create(function () {
        if (!isDisposed) {
            isDisposed = true;
            queue && queue._remove(request);
        }
    });

    var disposables = new CompositeDisposable(sourceSubscription, queueDisposable);

    sourceSubscription.setDisposable(
        this.model._source[this.method](this.getSourceArgs())
        .subscribe(this.getSourceObserver(observer)));

    return disposables;
};

module.exports = Request;
},{"106":106,"108":108,"109":109,"114":114,"161":161,"31":31,"91":91}],54:[function(require,module,exports){
var Rx = require(161);
var Observable = Rx.Observable;
var SerialDisposable = Rx.SerialDisposable;

var GetRequest = require(52);
var SetRequest = require(55);

var prefix = require(39);
var get_type = require(95);
var is_object = require(106);
var array_clone = require(80);

function RequestQueue(model, scheduler) {
    this.total = 0;
    this.model = model;
    this.requests = [];
    this.scheduler = scheduler;
}

RequestQueue.prototype.get = function getRequest(paths) {

    var self = this;

    return Observable.defer(function () {

        var requests = self.distributePaths(paths, self.requests, GetRequest);

        return (Observable.defer(function () {
                return Observable.fromArray(requests.map(function (request) {
                    return request.getSourceObservable();
                }));
            })
            .mergeAll()
            .reduce(self.mergeJSONGraphs, {
                index: -1,
                jsonGraph: {}
            })
            .map(function (response) {
                return {
                    paths: paths,
                    index: response.index,
                    jsonGraph: response.jsonGraph
                };
            })
            .subscribeOn(self.scheduler)[
            "finally"](function () {
            var paths2 = array_clone(paths);
            var pathCount = paths2.length;
            var requestIndex = -1;
            var requestCount = requests.length;
            while (pathCount > 0 && requestCount > 0 && ++requestIndex < requestCount) {
                var request = requests[requestIndex];
                if (request.pending) {
                    continue;
                }
                var pathIndex = -1;
                while (++pathIndex < pathCount) {
                    var path = paths2[pathIndex];
                    if (request.removePath(path)) {
                        paths2.splice(pathIndex--, 1);
                        if (--pathCount === 0) {
                            break;
                        }
                    }
                }
                if (request.length === 0) {
                    requests.splice(requestIndex--, 1);
                    if (--requestCount === 0) {
                        break;
                    }
                }
            }
        }));
    });
};

RequestQueue.prototype.set = function setRequest(jsonGraphEnvelope) {
    return SetRequest.create(this.model, jsonGraphEnvelope);
}

RequestQueue.prototype._remove = function removeRequest(request) {
    var requests = this.requests;
    var index = requests.indexOf(request);
    if (index != -1) {
        requests.splice(index, 1);
    }
};

RequestQueue.prototype.distributePaths = function distributePathsAcrossRequests(paths, requests, RequestType) {

    var model = this.model;
    var pathsIndex = -1;
    var pathsCount = paths.length;

    var requestIndex = -1;
    var requestCount = requests.length;
    var participatingRequests = [];
    var pendingRequest;

    insert_path: while (++pathsIndex < pathsCount) {

        var path = paths[pathsIndex];
        var request = undefined;

        requestIndex = -1;

        while (++requestIndex < requestCount) {
            request = requests[requestIndex];
            if (request.insertPath(path, request.pending)) {
                participatingRequests[requestIndex] = request;
                continue insert_path;
            }
        }

        if (!pendingRequest) {
            pendingRequest = RequestType.create(this, model, this.total++);
            requests[requestIndex] = pendingRequest;
            participatingRequests[requestCount++] = pendingRequest;
        }

        pendingRequest.insertPath(path, false);
    }

    var pathRequests = [];
    var pathRequestsIndex = -1;

    requestIndex = -1;

    while (++requestIndex < requestCount) {
        request = participatingRequests[requestIndex];
        if (request != null) {
            pathRequests[++pathRequestsIndex] = request;
        }
    }

    return pathRequests;
};

RequestQueue.prototype.mergeJSONGraphs = function mergeJSONGraphs(aggregate, response) {

    var depth = 0;
    var contexts = [];
    var messages = [];
    var keystack = [];
    var latestIndex = aggregate.index;
    var responseIndex = response.index;

    aggregate.index = Math.max(latestIndex, responseIndex);

    contexts[-1] = aggregate.jsonGraph || {};
    messages[-1] = response.jsonGraph || {};

    recursing: while (depth > -1) {

        var context = contexts[depth - 1];
        var message = messages[depth - 1];
        var keys = keystack[depth - 1] || (keystack[depth - 1] = Object.keys(message));

        while (keys.length > 0) {

            var key = keys.pop();

            if (key[0] === prefix) {
                continue;
            }

            if (context.hasOwnProperty(key)) {
                var node = context[key];
                var nodeType = get_type(node);
                var messageNode = message[key];
                var messageType = get_type(messageNode);
                if (is_object(node) && is_object(messageNode) && !nodeType && !messageType) {
                    contexts[depth] = node;
                    messages[depth] = messageNode;
                    depth += 1;
                    continue recursing;
                } else if (responseIndex > latestIndex) {
                    context[key] = messageNode;
                }
            } else {
                context[key] = message[key];
            }
        }

        depth -= 1;
    }

    return aggregate;
};

module.exports = RequestQueue;
},{"106":106,"161":161,"39":39,"52":52,"55":55,"80":80,"95":95}],55:[function(require,module,exports){
var Rx = require(161);
var Observer = Rx.Observer;

var Request = require(53);

var array_map = require(83);

var set_json_graph_as_json_dense = require(66);
var set_json_values_as_json_dense = require(74);

var empty_array = new Array(0);

function SetRequest() {
    Request.call(this);
}

SetRequest.create = function create(model, jsonGraphEnvelope) {
    var request = new SetRequest();
    request.model = model;
    request.jsonGraphEnvelope = jsonGraphEnvelope;
    return request;
};

SetRequest.prototype = Object.create(Request.prototype);
SetRequest.prototype.constructor = SetRequest;

SetRequest.prototype.method = "set";
SetRequest.prototype.insertPath = function () {
    return false;
};
SetRequest.prototype.removePath = function () {
    return 0;
};

SetRequest.prototype.getSourceArgs = function getSourceArgs() {
    return this.jsonGraphEnvelope;
};

SetRequest.prototype.getSourceObserver = function getSourceObserver(observer) {

    var model = this.model;
    var bound = model._path;
    var paths = this.jsonGraphEnvelope.paths;
    var modelRoot = model._root;
    var errorSelector = modelRoot.errorSelector;
    var comparator = modelRoot.comparator;

    return Request.prototype.getSourceObserver.call(this, Observer.create(
        function onNext(jsonGraphEnvelope) {

            model._path = empty_array;

            set_json_graph_as_json_dense(model, [{
                paths: paths,
                jsonGraph: jsonGraphEnvelope.jsonGraph
            }], empty_array, errorSelector, comparator);

            model._path = bound;

            observer.onNext(jsonGraphEnvelope);
        },
        function onError(error) {

            model._path = empty_array;

            set_json_values_as_json_dense(model, array_map(paths, function (path) {
                return {
                    path: path,
                    value: error
                };
            }), empty_array, errorSelector, comparator);

            model._path = bound;

            observer.onError(error);
        },
        function onCompleted() {
            observer.onCompleted();
        }
    ));
};

module.exports = SetRequest;
},{"161":161,"53":53,"66":66,"74":74,"83":83}],56:[function(require,module,exports){
var Rx = require(161);
var Observable = Rx.Observable;
var Disposable = Rx.Disposable;
var SerialDisposable = Rx.SerialDisposable;
var CompositeDisposable = Rx.CompositeDisposable;

var ModelResponse = require(60);

var pathSyntax = require(145);

var $ref = require(128);

function CallResponse(subscribe) {
    Observable.call(this, subscribe || subscribeToResponse);
}

CallResponse.create = ModelResponse.create;

CallResponse.prototype = Object.create(Observable.prototype);
CallResponse.prototype.constructor = CallResponse;

CallResponse.prototype.invokeSourceRequest = function invokeSourceRequest(model) {
    return this;
};

CallResponse.prototype.ensureCollect = function ensureCollect(model, initialVersion, pendingPromiseID) {
    return this;
};

CallResponse.prototype.initialize = function initialize_response() {
    return this;
};

function subscribeToResponse(observer) {

    var args = this.args;
    var model = this.model;
    var selector = this.selector;

    var callPath = pathSyntax.fromPath(args[0]);
    var callArgs = args[1] || [];
    var suffixes = (args[2] || []).map(pathSyntax.fromPath);
    var extraPaths = (args[3] || []).map(pathSyntax.fromPath);

    var rootModel = model.clone({
        _path: []
    });
    var localRoot = rootModel.withoutDataSource();
    var dataSource = model._source;
    var boundPath = model._path;
    var boundCallPath = boundPath.concat(callPath);
    var boundThisPath = boundCallPath.slice(0, -1);

    var setCallValuesObs = model
        .withoutDataSource()
        .get(callPath, function (localFn) {
            return {
                model: rootModel.bindSync(boundThisPath).boxValues(),
                localFn: localFn
            };
        })
        .flatMap(getLocalCallObs)
        .defaultIfEmpty(getRemoteCallObs(dataSource))
        .mergeAll()
        .flatMap(setCallEnvelope);

    var disposables = new CompositeDisposable();

    disposables.add(setCallValuesObs.last().subscribe(function (envelope) {
            var paths = envelope.paths;
            var invalidated = envelope.invalidated;
            if (selector) {
                paths.push(function () {
                    return selector.call(model, paths);
                });
            }
            var innerObs = model.get.apply(model, paths);
            if (observer.outputFormat === "AsJSONG") {
                innerObs = innerObs.toJSONG().doAction(function (envelope) {
                    envelope.invalidated = invalidated;
                });
            }
            disposables.add(innerObs.subscribe(observer));
        },
        function (e) {
            observer.onError(e);
        }
    ));

    return disposables;

    function getLocalCallObs(tuple) {

        var localFn = tuple && tuple.localFn;

        if (typeof localFn === "function") {

            var localFnModel = tuple.model;
            var localThisPath = localFnModel._path;

            var remoteGetValues = localFn
                .apply(localFnModel, callArgs)
                .reduce(aggregateFnResults, {
                    values: [],
                    references: [],
                    invalidations: [],
                    localThisPath: localThisPath
                })
                .flatMap(setLocalValues)
                .flatMap(getRemoteValues);

            return Observable["return"](remoteGetValues);
        }

        return Observable.empty();

        function aggregateFnResults(results, pathValue) {
            var localThisPath = results.localThisPath;
            if (Boolean(pathValue.invalidated)) {
                results.invalidations.push(localThisPath.concat(pathValue.path));
            } else {
                var path = pathValue.path;
                var value = pathValue.value;
                if (Boolean(value) && typeof value === "object" && value.$type === $ref) {
                    results.references.push({
                        path: prependThisPath(path),
                        value: pathValue.value
                    });
                } else {
                    results.values.push({
                        path: prependThisPath(path),
                        value: pathValue.value
                    });
                }
            }
            return results;
        }

        function setLocalValues(results) {
            var values = results.values.concat(results.references);
            if (values.length > 0) {
                return localRoot.set
                    .apply(localRoot, values)
                    .toJSONG()
                    .map(function (envelope) {
                        return {
                            results: results,
                            envelope: envelope
                        };
                    });
            } else {
                return Observable["return"]({
                    results: results,
                    envelope: {
                        jsonGraph: {},
                        paths: []
                    }
                });
            }
        }

        function getRemoteValues(tuple) {

            var envelope = tuple.envelope;
            var results = tuple.results;
            var values = results.values;
            var references = results.references;
            var invalidations = results.invalidations;

            var rootValues = values.map(pluckPath).map(prependThisPath);
            var rootSuffixes = references.reduce(prependRefToSuffixes, []);
            var rootExtraPaths = extraPaths.map(prependThisPath);
            var rootPaths = rootSuffixes.concat(rootExtraPaths);
            var envelopeObs;

            if (rootPaths.length > 0) {
                envelopeObs = rootModel.get.apply(rootModel, rootValues.concat(rootPaths)).toJSONG();
            } else {
                envelopeObs = Observable["return"](envelope);
            }

            return envelopeObs.doAction(function (envelope) {
                envelope.invalidated = invalidations;
            });
        }

        function prependRefToSuffixes(refPaths, refPathValue) {
            var refPath = refPathValue.path;
            refPaths.push.apply(refPaths, suffixes.map(function (pathSuffix) {
                return refPath.concat(pathSuffix);
            }));
            return refPaths;
        }

        function pluckPath(pathValue) {
            return pathValue.path;
        }

        function prependThisPath(path) {
            return boundThisPath.concat(path);
        }
    }

    function getRemoteCallObs(dataSource) {

        if (dataSource && typeof dataSource === "object") {
            return dataSource
                .call(callPath, callArgs, suffixes, extraPaths)
                .map(invalidateLocalValues);
            // .flatMap(invalidateLocalValues);
        }

        return Observable.empty();

        function invalidateLocalValues(envelope) {
            var invalidations = envelope.invalidated;
            if (invalidations && invalidations.length) {
                rootModel.invalidate.apply(rootModel, invalidations);
                // return rootModel
                //     .invalidate
                //     .apply(rootModel, invalidations)
                //     .map(function () {
                //         return envelope;
                //     });
            }
            // return Observable["return"](envelope);
            return envelope;
        }
    }

    function setCallEnvelope(envelope) {
        return localRoot.set(envelope, function () {
            return {
                invalidated: envelope.invalidated,
                paths: envelope.paths.map(function (path) {
                    return path.slice(boundPath.length);
                })
            };
        });
    }
};

module.exports = CallResponse;
},{"128":128,"145":145,"161":161,"60":60}],57:[function(require,module,exports){
var Rx = require(161);
var Observable = Rx.Observable;
var Disposable = Rx.Disposable;

var IdempotentResponse = require(58);

var array_map = require(83);
var array_concat = require(81);
var is_function = require(103);

var set_json_graph_as_json_dense = require(66);
var set_json_values_as_json_dense = require(74);

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

        if (results && results.invokeSourceRequest === true) {

            var optimizedMissingPaths = results.optimizedMissingPaths;

            return (model._request.get(optimizedMissingPaths)[
                "do"](null, function setResponseError(error) {
                    source.isCompleted = true;
                })
                .materialize()
                .flatMap(function (notification) {
                    if (notification.kind === "C") {
                        return Observable.empty();
                    }
                    return caught;
                }));
        }

        return Observable["throw"](results);
    });

    return new this.constructor(function (observer) {
        return caught.subscribe(observer);
    });
};

// Executes the local cache search for the GetResponse's operation groups.
function subscribeToGetResponse(observer) {

    if (this.subscribeCount++ >= this.subscribeLimit) {
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
    var asJSONG = outputFormat === "AsJSONG";
    var asValues = outputFormat === "AsValues";
    var hasValue = false;

    var errors = [];
    var requestedMissingPaths = [];
    var optimizedMissingPaths = [];

    var groups = this.groups;
    var groupIndex = -1;
    var groupCount = groups.length;

    while (++groupIndex < groupCount) {

        var group = groups[groupIndex];
        var groupValues = !asValues && group.values || function onPathValueNext(x) {
            ++modelRoot.syncRefCount;
            try {
                observer.onNext(x);
            } catch (e) {
                throw e;
            } finally {
                --modelRoot.syncRefCount;
            }
        };

        var inputType = group.inputType;
        var methodArgs = group.arguments;

        if (methodArgs.length > 0) {

            var operationName = "_" + method + inputType + outputFormat;
            var operationFunc = model[operationName];
            var results = operationFunc(model, methodArgs, groupValues);

            errors.push.apply(errors, results.errors);
            requestedMissingPaths.push.apply(requestedMissingPaths, results.requestedMissingPaths);
            optimizedMissingPaths.push.apply(optimizedMissingPaths, results.optimizedMissingPaths);

            if (asValues) {
                group.arguments = results.requestedMissingPaths;
            } else {
                hasValue = hasValue || results.hasValue || results.requestedPaths.length > 0;
            }
        }
    }

    isCompleted = isCompleted || requestedMissingPaths.length === 0;
    var hasError = errors.length > 0;

    try {
        modelRoot.syncRefCount++;
        if (hasValue && (isProgressive || isCompleted || isMaster)) {
            var values = this.values;
            var selector = this.selector;
            if (is_function(selector)) {
                observer.onNext(selector.apply(model, values.map(pluckJSON)));
            } else {
                var valueIndex = -1;
                var valueCount = values.length;
                while (++valueIndex < valueCount) {
                    observer.onNext(values[valueIndex]);
                }
            }
        }
        if (isCompleted || isMaster) {
            if (hasError) {
                observer.onError(errors);
            } else {
                observer.onCompleted();
            }
        } else {
            if (asJSONG) {
                this.values[0].paths = [];
            }
            observer.onError({
                method: method,
                requestedMissingPaths: array_map(requestedMissingPaths, prependBoundPath),
                optimizedMissingPaths: optimizedMissingPaths,
                invokeSourceRequest: true
            });
        }
    } catch (e) {
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
},{"103":103,"161":161,"58":58,"66":66,"74":74,"81":81,"83":83}],58:[function(require,module,exports){
var Rx = require(161);
var Disposable = Rx.Disposable;
var Observable = Rx.Observable;
var SerialDisposable = Rx.SerialDisposable;
var CompositeDisposable = Rx.CompositeDisposable;

var ModelResponse = require(60);

var pathSyntax = require(145);

var get_size = require(94);
var collect_lru = require(48);
var __version = require(45);

var array_map = require(83);
var array_clone = require(80);

var is_array = Array.isArray;
var is_object = require(106);
var is_function = require(103);
var is_path_value = require(107);
var is_json_envelope = require(104);
var is_json_graph_envelope = require(105);

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
},{"103":103,"104":104,"105":105,"106":106,"107":107,"145":145,"161":161,"45":45,"48":48,"60":60,"80":80,"83":83,"94":94}],59:[function(require,module,exports){
var Rx = require(161);
var Observable = Rx.Observable;
var Disposable = Rx.Disposable;

var IdempotentResponse = require(58);

var empty_array = new Array(0);

function InvalidateResponse(subscribe) {
    IdempotentResponse.call(this, subscribe || subscribeToInvalidateResponse);
}

InvalidateResponse.create = IdempotentResponse.create;

InvalidateResponse.prototype = Object.create(IdempotentResponse.prototype);
InvalidateResponse.prototype.method = "invalidate";
InvalidateResponse.prototype.constructor = InvalidateResponse;

function subscribeToInvalidateResponse(observer) {

    var model = this.model;
    var method = this.method;

    var groups = this.groups;
    var groupIndex = -1;
    var groupCount = groups.length;

    while(++groupIndex < groupCount) {

        var group = groups[groupIndex];
        var inputType = group.inputType;
        var methodArgs = group.arguments;

        if(methodArgs.length > 0) {
            var operationName = "_" + method + inputType + "AsJSON";
            var operationFunc = model[operationName];
            operationFunc(model, methodArgs, empty_array);
        }
    }

    return Disposable.empty;
}

module.exports = InvalidateResponse;
},{"161":161,"58":58}],60:[function(require,module,exports){
var falcor = require("./../");

var Rx = require(161);
var Observable = Rx.Observable;

var array_map = require(83);
var array_slice = require(84);
var array_clone = require(80);
var array_concat = require(81);
var array_flat_map = require(82);

var is_array = Array.isArray;
var is_object = require(106);
var is_function = require(103);
var is_path_value = require(107);
var is_json_envelope = require(104);
var is_json_graph_envelope = require(105);

var noop = require(111);
var __version = require(45);

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
    // TODO: make these private
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
},{"103":103,"104":104,"105":105,"106":106,"107":107,"111":111,"161":161,"45":45,"80":80,"81":81,"82":82,"83":83,"84":84,"undefined":undefined}],61:[function(require,module,exports){
var Rx = require(161);
var Observable = Rx.Observable;
var Disposable = Rx.Disposable;

var IdempotentResponse = require(58);

var array_map = require(83);
var array_flat_map = require(82);
var is_function = require(103);

var set_json_graph_as_json_dense = require(66);
var set_json_values_as_json_dense = require(74);

var empty_array = new Array(0);

function SetResponse(subscribe) {
    IdempotentResponse.call(this, subscribe || subscribeToSetResponse);
}

SetResponse.create = IdempotentResponse.create;

SetResponse.prototype = Object.create(IdempotentResponse.prototype);
SetResponse.prototype.method = "set";
SetResponse.prototype.constructor = SetResponse;

SetResponse.prototype.invokeSourceRequest = function invokeSourceRequest(model) {

    var source = this;
    var caught = this["catch"](function setJSONGraph(results) {

        if (results && results.invokeSourceRequest === true) {

            var envelope = {};
            var boundPath = model._path;
            var optimizedPaths = results.optimizedPaths;

            model._path = empty_array;
            model._getPathSetsAsJSONG(model, optimizedPaths, [envelope]);
            model._path = boundPath;

            return (model._request.set(envelope)[
                "do"](
                    function setResponseEnvelope(envelope) {
                        source.isCompleted = optimizedPaths.length === envelope.paths.length;
                    },
                    function setResponseError(error) {
                        source.isCompleted = true;
                    }
                )
                .materialize()
                .flatMap(function (notification) {
                    if (notification.kind === "C") {
                        return Observable.empty();
                    }
                    return caught;
                }));
        }

        return Observable["throw"](results);
    });

    return new this.constructor(function (observer) {
        return caught.subscribe(observer);
    });
};

function subscribeToSetResponse(observer) {

    if (this.subscribeCount >= this.subscribeLimit) {
        observer.onError("Loop kill switch thrown.");
        return;
    }

    var model = this.model;
    var modelRoot = model._root;
    var method = this.method;
    var boundPath = this.boundPath;
    var outputFormat = this.outputFormat;
    var errorSelector = modelRoot.errorSelector;
    var comparator = this.subscribeCount++ > 0 && modelRoot.comparator || undefined;

    var isMaster = this.isMaster;
    var isCompleted = this.isCompleted;
    var isProgressive = this.isProgressive;
    var asJSONG = outputFormat === "AsJSONG";
    var asValues = outputFormat === "AsValues";
    var hasValue = false;

    var errors = [];
    var optimizedPaths = [];

    var groups = this.groups;
    var groupIndex = -1;
    var groupCount = groups.length;

    if (isCompleted) {
        method = "get";
    }

    while (++groupIndex < groupCount) {

        var group = groups[groupIndex];
        var groupValues = !asValues && group.values || function onPathValueNext(x) {
            ++modelRoot.syncRefCount;
            try {
                observer.onNext(x);
            } catch (e) {
                throw e;
            } finally {
                --modelRoot.syncRefCount;
            }
        };

        var inputType = group.inputType;
        var methodArgs = group.arguments;

        if (isCompleted) {
            if (inputType === "PathValues") {
                inputType = "PathSets";
                methodArgs = array_map(methodArgs, pluckPath);
            } else if (inputType === "JSONGs") {
                inputType = "PathSets";
                methodArgs = array_flat_map(methodArgs, pluckPaths);
            }
        }

        if (methodArgs.length > 0) {

            var operationName = "_" + method + inputType + outputFormat;
            var operationFunc = model[operationName];
            var results = operationFunc(model, methodArgs, groupValues, errorSelector, comparator);

            errors.push.apply(errors, results.errors);
            optimizedPaths.push.apply(optimizedPaths, results.optimizedPaths);

            hasValue = !asValues && (hasValue || results.hasValue || results.requestedPaths.length > 0);
        }
    }

    var hasError = errors.length > 0;

    try {
        modelRoot.syncRefCount++;
        if (hasValue && (isProgressive || isCompleted || isMaster)) {
            var values = this.values;
            var selector = this.selector;
            if (is_function(selector)) {
                observer.onNext(selector.apply(model, values.map(pluckJSON)));
            } else {
                var valueIndex = -1;
                var valueCount = values.length;
                while (++valueIndex < valueCount) {
                    observer.onNext(values[valueIndex]);
                }
            }
        }
        if (isCompleted || isMaster) {
            if (hasError) {
                observer.onError(errors);
            } else {
                observer.onCompleted();
            }
        } else {
            if (asJSONG) {
                this.values[0].paths = [];
            }
            observer.onError({
                method: method,
                optimizedPaths: optimizedPaths,
                invokeSourceRequest: true
            });
        }
    } catch (e) {
        throw e;
    } finally {
        --modelRoot.syncRefCount;
    }

    return Disposable.empty;
}

function pluckJSON(jsonEnvelope) {
    return jsonEnvelope.json;
}

function pluckPath(pathValue) {
    return pathValue.path;
}

function pluckPaths(jsonGraphEnvelope) {
    return jsonGraphEnvelope.paths;
}

module.exports = SetResponse;
},{"103":103,"161":161,"58":58,"66":66,"74":74,"82":82,"83":83}],62:[function(require,module,exports){
var asap = require(136);
var Rx = require(161);
var Disposable = Rx.Disposable;

function ASAPScheduler() {
    
}

ASAPScheduler.prototype.schedule = function schedule(action) {
    asap(action);
    return Disposable.empty;
};

ASAPScheduler.prototype.scheduleWithState = function scheduleWithState(state, action) {
    var self = this;
    asap(function() {
        action(self, state);
    });
    return Disposable.empty;
};

module.exports = ASAPScheduler;
},{"136":136,"161":161}],63:[function(require,module,exports){
var Rx = require(161);
var Disposable = Rx.Disposable;

function ImmediateScheduler() {
    
}

ImmediateScheduler.prototype.schedule = function schedule(action) {
    action();
    return Disposable.empty;
};

ImmediateScheduler.prototype.scheduleWithState = function scheduleWithState(state, action) {
    action(this, state);
    return Disposable.empty;
};

module.exports = ImmediateScheduler;

},{"161":161}],64:[function(require,module,exports){
var Rx = require(161);
var Disposable = Rx.Disposable;

function TimeoutScheduler(delay) {
    this.delay = delay;
}

TimeoutScheduler.prototype.schedule = function schedule(action) {
    var id = setTimeout(action, this.delay);
    return Disposable.create(function() {
        if(id !== undefined) {
            clearTimeout(id);
            id = undefined;
        }
    });
};

TimeoutScheduler.prototype.scheduleWithState = function scheduleWithState(state, action) {
    var self = this;
    var id = setTimeout(function() {
        action(self, state);
    }, this.delay);
    return Disposable.create(function() {
        if(id !== undefined) {
            clearTimeout(id);
            id = undefined;
        }
    });
};

module.exports = TimeoutScheduler;

},{"161":161}],65:[function(require,module,exports){
module.exports = set_cache;

var $error = require(127);
var $atom = require(126);

var clone = require(85);
var array_clone = require(80);

var options = require(113);
var walk_path_map = require(132);

var is_object = require(106);

var get_valid_key = require(96);
var create_branch = require(92);
var wrap_node = require(125);
var replace_node = require(117);
var graph_node = require(97);
var update_back_refs = require(123);
var update_graph = require(124);
var inc_generation = require(99);

var promote = require(49);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

/**
 * Populates a model's cache from an existing deserialized cache.
 * Traverses the existing cache as a path map, writing all the leaves
 * into the model's cache as they're encountered.
 */
function set_cache(model, pathmap, error_selector) {

    var roots = options([], model, error_selector);
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];
    var keys_stack = [];
    
    roots[_cache] = roots.root;

    walk_path_map(onNode, onEdge, pathmap, keys_stack, 0, roots, parents, nodes, requested, optimized);

    return model;
}

function onNode(pathmap, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset, is_keyset) {

    var parent;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        parent = parents[_cache];
    } else {
        parent = nodes[_cache];
    }

    var node = parent[key],
        type;

    if (is_branch) {
        type = is_object(node) && node.$type || undefined;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = nodes[_cache] = node;
        return;
    }

    var selector = roots.error_selector;
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var mess = pathmap;

    type = is_object(mess) && mess.$type || undefined;
    mess = wrap_node(mess, type, Boolean(type) ? mess.value : mess);
    type || (type = $atom);

    if (type == $error && Boolean(selector)) {
        mess = selector(requested, mess);
    }

    node = replace_node(parent, node, mess, key, roots.lru);
    node = graph_node(root, parent, node, key, inc_generation());
    update_graph(parent, size - node.$size, roots.version, roots.lru);
    nodes[_cache] = node;
}

function onEdge(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset) {
    if(depth > 0) {
        promote(roots.lru, nodes[_cache]);
    }
}
},{"106":106,"113":113,"115":115,"117":117,"123":123,"124":124,"125":125,"126":126,"127":127,"132":132,"49":49,"80":80,"85":85,"92":92,"96":96,"97":97,"99":99}],66:[function(require,module,exports){
module.exports = set_json_graph_as_json_dense;

var $ref = require(128);

var clone = require(85);
var array_clone = require(80);

var options = require(113);
var walk_path_set = require(133);

var is_object = require(106);

var get_valid_key = require(96);
var merge_node = require(110);

var set_node_if_missing_path = require(121);
var set_node_if_error = require(120);
var set_successful_paths = require(118);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function set_json_graph_as_json_dense(model, envelopes, values, error_selector, comparator) {

    var roots = [];
    roots.offset = model._path.length;
    roots.bound = [];
    roots = options(roots, model, error_selector, comparator);

    var index = -1;
    var index2 = -1;
    var count = envelopes.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];
    var json, hasValue, hasValues;

    roots[_cache] = roots.root;

    while (++index < count) {
        var envelope = envelopes[index];
        var pathsets = envelope.paths;
        var jsong = envelope.jsonGraph || envelope.jsong || envelope.values || envelope.value;
        var index3 = -1;
        var count2 = pathsets.length;
        roots[_message] = jsong;
        nodes[_message] = jsong;
        while (++index3 < count2) {

            json = values && values[++index2];
            if (is_object(json)) {
                roots.json = roots[_json] = parents[_json] = nodes[_json] = json.json || (json.json = {});
            } else {
                roots.json = roots[_json] = parents[_json] = nodes[_json] = undefined;
            }

            var pathset = pathsets[index3];
            roots.index = index3;

            walk_path_set(onNode, onEdge, pathset, 0, roots, parents, nodes, requested, optimized);

            hasValue = roots.hasValue;
            if (Boolean(hasValue)) {
                hasValues = true;
                if (is_object(json)) {
                    json.json = roots.json;
                }
                delete roots.json;
                delete roots.hasValue;
            } else if (is_object(json)) {
                delete json.json;
            }
        }
    }

    return {
        values: values,
        errors: roots.errors,
        hasValue: hasValues,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathset, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset, is_keyset) {

    var parent, messageParent, json;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        json = parents[_json];
        parent = parents[_cache];
        messageParent = parents[_message];
    } else {
        json = is_keyset && nodes[_json] || parents[_json];
        parent = nodes[_cache];
        messageParent = nodes[_message];
    }

    var node = parent[key];
    var message = messageParent && messageParent[key];

    nodes[_message] = message;
    nodes[_cache] = node = merge_node(roots, parent, node, messageParent, message, key, requested);

    if (is_reference) {
        parents[_cache] = parent;
        parents[_message] = messageParent;
        return;
    }

    var length = requested.length;
    var offset = roots.offset;

    parents[_json] = json;

    if (is_branch) {
        parents[_cache] = node;
        parents[_message] = message;
        if ((length > offset) && is_keyset && Boolean(json)) {
            nodes[_json] = json[keyset] || (json[keyset] = {});
        }
    }
}

function onEdge(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);
    var isMissingPath = set_node_if_missing_path(roots, node, type, pathset, depth, requested, optimized);

    if (isMissingPath) {
        return;
    }

    var isError = set_node_if_error(roots, node, type, requested);

    if (isError) {
        return;
    }

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        set_successful_paths(roots, requested, optimized);
        if (keyset == null) {
            roots.json = clone(roots, node, type, node && node.value);
        } else if (Boolean(json = parents[_json])) {
            json[keyset] = clone(roots, node, type, node && node.value);
        }
        roots.hasValue = true;
    }
}
},{"106":106,"110":110,"113":113,"115":115,"118":118,"120":120,"121":121,"128":128,"133":133,"80":80,"85":85,"96":96}],67:[function(require,module,exports){
module.exports = set_json_graph_as_json_graph;

var $ref = require(128);

var clone = require(86);
var array_clone = require(80);

var options = require(113);
var walk_path_set = require(133);

var is_object = require(106);

var get_valid_key = require(96);
var merge_node = require(110);

var set_node_if_missing_path = require(121);
var set_node_if_error = require(120);
var set_successful_paths = require(118);

var promote = require(49);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function set_json_graph_as_json_graph(model, envelopes, values, error_selector, comparator) {

    var roots = [];
    roots.offset = 0;
    roots.bound = [];
    roots = options(roots, model, error_selector, comparator);

    var index = -1;
    var count = envelopes.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];
    var json = values[0];
    var hasValue;

    roots[_cache] = roots.root;
    roots[_jsong] = parents[_jsong] = nodes[_jsong] = json.jsong || (json.jsong = {});
    roots.requestedPaths = json.paths || (json.paths = roots.requestedPaths);

    while (++index < count) {
        var envelope = envelopes[index];
        var pathsets = envelope.paths;
        var jsong = envelope.jsonGraph || envelope.jsong || envelope.values || envelope.value;
        var index2 = -1;
        var count2 = pathsets.length;
        roots[_message] = jsong;
        nodes[_message] = jsong;
        while (++index2 < count2) {
            var pathset = pathsets[index2];
            walk_path_set(onNode, onEdge, pathset, 0, roots, parents, nodes, requested, optimized);
        }
    }

    hasValue = roots.hasValue;
    if (hasValue) {
        json.jsong = roots[_jsong];
    } else {
        delete json.jsong;
        delete json.paths;
    }

    return {
        values: values,
        errors: roots.errors,
        hasValue: hasValue,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathset, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset, is_keyset) {

    var parent, messageParent, json, jsonkey;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        json = parents[_jsong];
        parent = parents[_cache];
        messageParent = parents[_message];
    } else {
        json = nodes[_jsong];
        parent = nodes[_cache];
        messageParent = nodes[_message];
    }

    var jsonkey = key;
    var node = parent[key];
    var message = messageParent && messageParent[key];

    nodes[_message] = message;
    nodes[_cache] = node = merge_node(roots, parent, node, messageParent, message, key, requested);

    var type = is_object(node) && node.$type || undefined;

    if (is_reference) {
        parents[_cache] = parent;
        parents[_message] = messageParent;
        parents[_jsong] = json;
        if (type === $ref) {
            json[jsonkey] = clone(roots, node, type, node.value);
            roots.hasValue = true;
        } else {
            nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    if (is_branch) {
        parents[_cache] = node;
        parents[_message] = message;
        parents[_jsong] = json;
        if (type === $ref) {
            json[jsonkey] = clone(roots, node, type, node.value);
            roots.hasValue = true;
        } else {
            nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    if(roots.is_distinct === true) {
        roots.is_distinct = false;
        json[jsonkey] = clone(roots, node, type, node && node.value);
        roots.hasValue = true;
    }
}

function onEdge(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);

    var isMissingPath = set_node_if_missing_path(roots, node, type, pathset, depth, requested, optimized);

    if (isMissingPath) {
        return;
    }

    promote(roots.lru, node);

    set_successful_paths(roots, requested, optimized);

    if (keyset == null && !roots.hasValue && (keyset = get_valid_key(optimized)) == null) {
        node = clone(roots, node, type, node && node.value);
        json = roots[_jsong];
        json.$type = node.$type;
        json.value = node.value;
    }
    roots.hasValue = true;
}
},{"106":106,"110":110,"113":113,"115":115,"118":118,"120":120,"121":121,"128":128,"133":133,"49":49,"80":80,"86":86,"96":96}],68:[function(require,module,exports){
module.exports = set_json_graph_as_json_sparse;

var $ref = require(128);

var clone = require(85);
var array_clone = require(80);

var options = require(113);
var walk_path_set = require(133);

var is_object = require(106);

var get_valid_key = require(96);
var merge_node = require(110);

var set_node_if_missing_path = require(121);
var set_node_if_error = require(120);
var set_successful_paths = require(118);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function set_json_graph_as_json_sparse(model, envelopes, values, error_selector, comparator) {

    var roots = [];
    roots.offset = model._path.length;
    roots.bound = [];
    roots = options(roots, model, error_selector, comparator);

    var index = -1;
    var count = envelopes.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];
    var json = values[0];
    var hasValue;

    roots[_cache] = roots.root;
    roots[_json] = parents[_json] = nodes[_json] = json.json || (json.json = {});

    while (++index < count) {
        var envelope = envelopes[index];
        var pathsets = envelope.paths;
        var jsong = envelope.jsonGraph || envelope.jsong || envelope.values || envelope.value;
        var index2 = -1;
        var count2 = pathsets.length;
        roots[_message] = jsong;
        nodes[_message] = jsong;
        while (++index2 < count2) {
            var pathset = pathsets[index2];
            walk_path_set(onNode, onEdge, pathset, 0, roots, parents, nodes, requested, optimized);
        }
    }

    hasValue = roots.hasValue;
    if (hasValue) {
        json.json = roots[_json];
    } else {
        delete json.json;
    }

    return {
        values: values,
        errors: roots.errors,
        hasValue: hasValue,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathset, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset, is_keyset) {

    var parent, messageParent, json, jsonkey;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        jsonkey = get_valid_key(requested);
        json = parents[_json];
        parent = parents[_cache];
        messageParent = parents[_message];
    } else {
        jsonkey = key;
        json = nodes[_json];
        parent = nodes[_cache];
        messageParent = nodes[_message];
    }

    var node = parent[key];
    var message = messageParent && messageParent[key];

    nodes[_message] = message;
    nodes[_cache] = node = merge_node(roots, parent, node, messageParent, message, key, requested);

    if (is_reference) {
        parents[_cache] = parent;
        parents[_message] = messageParent;
        return;
    }

    parents[_json] = json;

    if (is_branch) {
        var length = requested.length;
        var offset = roots.offset;
        var type = is_object(node) && node.$type || undefined;

        parents[_cache] = node;
        parents[_message] = message;
        if ((length > offset) && (!type || type == $ref)) {
            nodes[_json] = json[jsonkey] || (json[jsonkey] = {});
        }
    }
}

function onEdge(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);

    var isMissingPath = set_node_if_missing_path(roots, node, type, pathset, depth, requested, optimized);

    if (isMissingPath) {
        return;
    }

    var isError = set_node_if_error(roots, node, type, requested);

    if (isError) {
        return;
    }

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        set_successful_paths(roots, requested, optimized);
        if (keyset == null && !roots.hasValue && (keyset = get_valid_key(optimized)) == null) {
            node = clone(roots, node, type, node && node.value);
            json = roots[_json];
            json.$type = node.$type;
            json.value = node.value;
        } else {
            json = parents[_json];
            json[key] = clone(roots, node, type, node && node.value);
        }
        roots.hasValue = true;
    }
}
},{"106":106,"110":110,"113":113,"115":115,"118":118,"120":120,"121":121,"128":128,"133":133,"80":80,"85":85,"96":96}],69:[function(require,module,exports){
module.exports = set_json_graph_as_json_values;

var $ref = require(128);

var clone = require(85);
var array_clone = require(80);
var array_slice = require(84);

var options = require(113);
var walk_path_set = require(133);

var is_object = require(106);

var get_valid_key = require(96);
var merge_node = require(110);

var set_node_if_missing_path = require(121);
var set_node_if_error = require(120);
var set_successful_paths = require(118);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function set_json_graph_as_json_values(model, envelopes, onNext, error_selector, comparator) {

    var roots = [];
    roots.offset = model._path.length;
    roots.bound = [];
    roots = options(roots, model, error_selector, comparator);

    var index = -1;
    var count = envelopes.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];

    roots[_cache] = roots.root;
    roots.onNext = onNext;

    while (++index < count) {
        var envelope = envelopes[index];
        var pathsets = envelope.paths;
        var jsong = envelope.jsonGraph || envelope.jsong || envelope.values || envelope.value;
        var index2 = -1;
        var count2 = pathsets.length;
        roots[_message] = jsong;
        nodes[_message] = jsong;
        while (++index2 < count2) {
            var pathset = pathsets[index2];
            walk_path_set(onNode, onEdge, pathset, 0, roots, parents, nodes, requested, optimized);
        }
    }

    return {
        values: null,
        errors: roots.errors,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathset, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset) {

    var parent, messageParent;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        parent = parents[_cache];
        messageParent = parents[_message];
    } else {
        parent = nodes[_cache];
        messageParent = nodes[_message];
    }

    var node = parent[key];
    var message = messageParent && messageParent[key];

    nodes[_message] = message;
    nodes[_cache] = node = merge_node(roots, parent, node, messageParent, message, key, requested);

    if (is_reference) {
        parents[_cache] = parent;
        parents[_message] = messageParent;
        return;
    }

    if (is_branch) {
        parents[_cache] = node;
        parents[_message] = message;
    }
}

function onEdge(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset, is_keyset) {

    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);
    var isMissingPath = set_node_if_missing_path(roots, node, type, pathset, depth, requested, optimized);

    if (isMissingPath) {
        return;
    }

    var isError = set_node_if_error(roots, node, type, requested);

    if (isError) {
        return;
    }

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        set_successful_paths(roots, requested, optimized);
        roots.onNext({
            path: array_slice(requested, roots.offset),
            value: clone(roots, node, type, node && node.value)
        });
    }
}
},{"106":106,"110":110,"113":113,"115":115,"118":118,"120":120,"121":121,"128":128,"133":133,"80":80,"84":84,"85":85,"96":96}],70:[function(require,module,exports){
module.exports = set_json_sparse_as_json_dense;

var $ref = require(128);
var $error = require(127);
var $atom = require(126);

var clone = require(85);
var array_clone = require(80);

var options = require(113);
var walk_path_map = require(132);

var is_object = require(106);

var get_valid_key = require(96);
var create_branch = require(92);
var wrap_node = require(125);
var replace_node = require(117);
var graph_node = require(97);
var update_back_refs = require(123);
var update_graph = require(124);
var inc_generation = require(99);

var set_node_if_error = require(120);
var set_successful_paths = require(118);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function set_json_sparse_as_json_dense(model, pathmaps, values, error_selector, comparator) {

    var roots = options([], model, error_selector, comparator);
    var index = -1;
    var count = pathmaps.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = array_clone(roots.bound);
    var keys_stack = [];
    var json, hasValue, hasValues;

    roots[_cache] = roots.root;

    while (++index < count) {

        json = values && values[index];
        if (is_object(json)) {
            roots.json = roots[_json] = parents[_json] = nodes[_json] = json.json || (json.json = {})
        } else {
            roots.json = roots[_json] = parents[_json] = nodes[_json] = undefined;
        }

        var pathmap = pathmaps[index].json;
        roots.index = index;

        walk_path_map(onNode, onEdge, pathmap, keys_stack, 0, roots, parents, nodes, requested, optimized);

        hasValue = roots.hasValue;
        if (Boolean(hasValue)) {
            hasValues = true;
            if (is_object(json)) {
                json.json = roots.json;
            }
            delete roots.json;
            delete roots.hasValue;
        } else if (is_object(json)) {
            delete json.json;
        }
    }

    return {
        values: values,
        errors: roots.errors,
        hasValue: hasValues,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathmap, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset, is_keyset) {

    var parent, json;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        json = parents[_json];
        parent = parents[_cache];
    } else {
        json = is_keyset && nodes[_json] || parents[_json];
        parent = nodes[_cache];
    }

    var node = parent[key],
        type;

    if (is_reference) {
        type = is_object(node) && node.$type || undefined;
        type = type && is_branch && "." || type;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = parent;
        nodes[_cache] = node;
        return;
    }

    parents[_json] = json;

    if (is_branch) {
        type = is_object(node) && node.$type || undefined;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = nodes[_cache] = node;
        if (is_keyset && Boolean(json)) {
            nodes[_json] = json[keyset] || (json[keyset] = {});
        }
        return;
    }

    var selector = roots.error_selector;
    var comparator = roots.comparator;
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var message = pathmap;

    type = is_object(message) && message.$type || undefined;
    message = wrap_node(message, type, Boolean(type) ? message.value : message);
    type || (type = $atom);

    if (type == $error && Boolean(selector)) {
        message = selector(requested, message);
    }

    var is_distinct = roots.is_distinct = true;

    if(Boolean(comparator)) {
        is_distinct = roots.is_distinct = !comparator(requested, node, message);
    }

    if (is_distinct) {
        node = replace_node(parent, node, message, key, roots.lru);
        node = graph_node(root, parent, node, key, inc_generation());
        update_graph(parent, size - node.$size, roots.version, roots.lru);
    }
    nodes[_cache] = node;
}

function onEdge(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);

    var isError = set_node_if_error(roots, node, type, requested);

    if (isError) {
        return;
    }

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        set_successful_paths(roots, requested, optimized);
        if (keyset == null) {
            roots.json = clone(roots, node, type, node && node.value);
        } else if (Boolean(json = parents[_json])) {
            json[keyset] = clone(roots, node, type, node && node.value);
        }
        roots.hasValue = true;
    }
}
},{"106":106,"113":113,"115":115,"117":117,"118":118,"120":120,"123":123,"124":124,"125":125,"126":126,"127":127,"128":128,"132":132,"80":80,"85":85,"92":92,"96":96,"97":97,"99":99}],71:[function(require,module,exports){
module.exports = set_json_sparse_as_json_graph;

var $ref = require(128);
var $error = require(127);
var $atom = require(126);

var clone = require(86);
var array_clone = require(80);

var options = require(113);
var walk_path_map = require(131);

var is_object = require(106);

var get_valid_key = require(96);
var create_branch = require(92);
var wrap_node = require(125);
var replace_node = require(117);
var graph_node = require(97);
var update_back_refs = require(123);
var update_graph = require(124);
var inc_generation = require(99);

var set_node_if_error = require(120);
var set_successful_paths = require(118);

var promote = require(49);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function set_json_sparse_as_json_graph(model, pathmaps, values, error_selector, comparator) {

    var roots = options([], model, error_selector, comparator);
    var index = -1;
    var count = pathmaps.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = array_clone(roots.bound);
    var keys_stack = [];
    var json = values[0];
    var hasValue;

    roots[_cache] = roots.root;
    roots[_jsong] = parents[_jsong] = nodes[_jsong] = json.jsong || (json.jsong = {});
    roots.requestedPaths = json.paths || (json.paths = roots.requestedPaths);

    while (++index < count) {
        var pathmap = pathmaps[index].json;
        walk_path_map(onNode, onEdge, pathmap, keys_stack, 0, roots, parents, nodes, requested, optimized);
    }

    hasValue = roots.hasValue;
    if (hasValue) {
        json.jsong = roots[_jsong];
    } else {
        delete json.jsong;
        delete json.paths;
    }

    return {
        values: values,
        errors: roots.errors,
        hasValue: hasValue,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathmap, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset, is_keyset) {

    var parent, json;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        json = parents[_jsong];
        parent = parents[_cache];
    } else {
        json = nodes[_jsong];
        parent = nodes[_cache];
    }

    var jsonkey = key;
    var node = parent[key],
        type;

    if (is_reference) {
        type = is_object(node) && node.$type || undefined;
        type = type && is_branch && "." || type;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = parent;
        nodes[_cache] = node;
        parents[_jsong] = json;
        if (type == $ref) {
            json[jsonkey] = clone(roots, node, type, node.value);
            roots.hasValue = true;
        } else {
            nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    if (is_branch) {
        type = is_object(node) && node.$type || undefined;
        node = create_branch(roots, parent, node, type, key);
        type = node.$type;
        parents[_cache] = nodes[_cache] = node;
        parents[_jsong] = json;
        if (type == $ref) {
            json[jsonkey] = clone(roots, node, type, node.value);
            roots.hasValue = true;
        } else {
            nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    var selector = roots.error_selector;
    var comparator = roots.comparator;
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var message = pathmap;

    type = is_object(message) && message.$type || undefined;
    message = wrap_node(message, type, Boolean(type) ? message.value : message);
    type || (type = $atom);

    if (type == $error && Boolean(selector)) {
        message = selector(requested, message);
    }

    var is_distinct = roots.is_distinct = true;

    if(Boolean(comparator)) {
        is_distinct = roots.is_distinct = !comparator(requested, node, message);
    }

    if (is_distinct) {
        node = replace_node(parent, node, message, key, roots.lru);
        node = graph_node(root, parent, node, key, inc_generation());
        update_graph(parent, size - node.$size, roots.version, roots.lru);

        json[jsonkey] = clone(roots, node, type, node && node.value);
        roots.hasValue = true;
    }
    nodes[_cache] = node;
}

function onEdge(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);

    promote(roots.lru, node);

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        set_successful_paths(roots, requested, optimized);
        if (keyset == null && !roots.hasValue && (keyset = get_valid_key(optimized)) == null) {
            node = clone(roots, node, type, node && node.value);
            json = roots[_jsong];
            json.$type = node.$type;
            json.value = node.value;
        }
        roots.hasValue = true;
    }
}
},{"106":106,"113":113,"115":115,"117":117,"118":118,"120":120,"123":123,"124":124,"125":125,"126":126,"127":127,"128":128,"131":131,"49":49,"80":80,"86":86,"92":92,"96":96,"97":97,"99":99}],72:[function(require,module,exports){
module.exports = set_json_sparse_as_json_sparse;

var $ref = require(128);
var $error = require(127);
var $atom = require(126);

var clone = require(85);
var array_clone = require(80);

var options = require(113);
var walk_path_map = require(132);

var is_object = require(106);

var get_valid_key = require(96);
var create_branch = require(92);
var wrap_node = require(125);
var replace_node = require(117);
var graph_node = require(97);
var update_back_refs = require(123);
var update_graph = require(124);
var inc_generation = require(99);

var set_node_if_error = require(120);
var set_successful_paths = require(118);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function set_json_sparse_as_json_sparse(model, pathmaps, values, error_selector, comparator) {

    var roots = options([], model, error_selector, comparator);
    var index = -1;
    var count = pathmaps.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = array_clone(roots.bound);
    var keys_stack = [];
    var json = values[0];
    var hasValue;

    roots[_cache] = roots.root;
    roots[_json] = parents[_json] = nodes[_json] = json.json || (json.json = {});

    while (++index < count) {
        var pathmap = pathmaps[index].json;
        walk_path_map(onNode, onEdge, pathmap, keys_stack, 0, roots, parents, nodes, requested, optimized);
    }

    hasValue = roots.hasValue;
    if (hasValue) {
        json.json = roots[_json];
    } else {
        delete json.json;
    }

    return {
        values: values,
        errors: roots.errors,
        hasValue: hasValue,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathmap, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset, is_keyset) {

    var parent, json, jsonkey;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        jsonkey = get_valid_key(requested);
        json = parents[_json];
        parent = parents[_cache];
    } else {
        jsonkey = key;
        json = nodes[_json];
        parent = nodes[_cache];
    }

    var node = parent[key],
        type;

    if (is_reference) {
        type = is_object(node) && node.$type || undefined;
        type = type && is_branch && "." || type;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = parent;
        nodes[_cache] = node;
        return;
    }

    parents[_json] = json;

    if (is_branch) {
        type = is_object(node) && node.$type || undefined;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = nodes[_cache] = node;
        nodes[_json] = json[jsonkey] || (json[jsonkey] = {});
        return;
    }

    var selector = roots.error_selector;
    var comparator = roots.comparator;
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var message = pathmap;

    type = is_object(message) && message.$type || undefined;
    message = wrap_node(message, type, Boolean(type) ? message.value : message);
    type || (type = $atom);

    if (type == $error && Boolean(selector)) {
        message = selector(requested, message);
    }

    var is_distinct = roots.is_distinct = true;

    if(Boolean(comparator)) {
        is_distinct = roots.is_distinct = !comparator(requested, node, message);
    }

    if (is_distinct) {
        node = replace_node(parent, node, message, key, roots.lru);
        node = graph_node(root, parent, node, key, inc_generation());
        update_graph(parent, size - node.$size, roots.version, roots.lru);
    }
    nodes[_cache] = node;
}

function onEdge(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);

    var isError = set_node_if_error(roots, node, type, requested);

    if(isError) {
        return;
    }

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        set_successful_paths(roots, requested, optimized);
        if (keyset == null && !roots.hasValue && (keyset = get_valid_key(optimized)) == null) {
            node = clone(roots, node, type, node && node.value);
            json = roots[_json];
            json.$type = node.$type;
            json.value = node.value;
        } else {
            json = parents[_json];
            json[key] = clone(roots, node, type, node && node.value);
        }
        roots.hasValue = true;
    }
}
},{"106":106,"113":113,"115":115,"117":117,"118":118,"120":120,"123":123,"124":124,"125":125,"126":126,"127":127,"128":128,"132":132,"80":80,"85":85,"92":92,"96":96,"97":97,"99":99}],73:[function(require,module,exports){
module.exports = set_path_map_as_json_values;

var $error = require(127);
var $atom = require(126);

var clone = require(85);
var array_clone = require(80);

var options = require(113);
var walk_path_map = require(132);

var is_object = require(106);

var get_valid_key = require(96);
var create_branch = require(92);
var wrap_node = require(125);
var replace_node = require(117);
var graph_node = require(97);
var update_back_refs = require(123);
var update_graph = require(124);
var inc_generation = require(99);

var set_node_if_error = require(120);
var set_successful_paths = require(118);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function set_path_map_as_json_values(model, pathmaps, onNext, error_selector, comparator) {

    var roots = options([], model, error_selector, comparator);
    var index = -1;
    var count = pathmaps.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = array_clone(roots.bound);
    var keys_stack = [];
    roots[_cache] = roots.root;
    roots.onNext = onNext;

    while (++index < count) {
        var pathmap = pathmaps[index].json;
        walk_path_map(onNode, onEdge, pathmap, keys_stack, 0, roots, parents, nodes, requested, optimized);
    }

    return {
        values: null,
        errors: roots.errors,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathmap, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset, is_keyset) {

    var parent;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        parent = parents[_cache];
    } else {
        parent = nodes[_cache];
    }

    var node = parent[key],
        type;

    if (is_reference) {
        type = is_object(node) && node.$type || undefined;
        type = type && is_branch && "." || type;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = parent;
        nodes[_cache] = node;
        return;
    }

    if (is_branch) {
        type = is_object(node) && node.$type || undefined;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = nodes[_cache] = node;
        return;
    }

    var selector = roots.error_selector;
    var comparator = roots.comparator;
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var message = pathmap;

    type = is_object(message) && message.$type || undefined;
    message = wrap_node(message, type, Boolean(type) ? message.value : message);
    type || (type = $atom);

    if (type == $error && Boolean(selector)) {
        message = selector(requested, message);
    }

    var is_distinct = roots.is_distinct = true;

    if(Boolean(comparator)) {
        is_distinct = roots.is_distinct = !comparator(requested, node, message);
    }

    if (is_distinct) {
        node = replace_node(parent, node, message, key, roots.lru);
        node = graph_node(root, parent, node, key, inc_generation());
        update_graph(parent, size - node.$size, roots.version, roots.lru);
    }

    nodes[_cache] = node;
}

function onEdge(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);

    var isError = set_node_if_error(roots, node, type, requested);

    if(isError) {
        return;
    }

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        set_successful_paths(roots, requested, optimized);
        roots.onNext({
            path: array_clone(requested),
            value: clone(roots, node, type, node && node.value)
        });
    }
}
},{"106":106,"113":113,"115":115,"117":117,"118":118,"120":120,"123":123,"124":124,"125":125,"126":126,"127":127,"132":132,"80":80,"85":85,"92":92,"96":96,"97":97,"99":99}],74:[function(require,module,exports){
module.exports = set_json_values_as_json_dense;

var $ref = require(128);
var $error = require(127);
var $atom = require(126);

var clone = require(85);
var array_clone = require(80);

var options = require(113);
var walk_path_set = require(134);

var is_object = require(106);

var get_valid_key = require(96);
var create_branch = require(92);
var wrap_node = require(125);
var invalidate_node = require(101);
var replace_node = require(117);
var graph_node = require(97);
var update_back_refs = require(123);
var update_graph = require(124);
var inc_generation = require(99);

var set_node_if_missing_path = require(121);
var set_node_if_error = require(120);
var set_successful_paths = require(118);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function set_json_values_as_json_dense(model, pathvalues, values, error_selector, comparator) {

    var roots = options([], model, error_selector, comparator);
    var index = -1;
    var count = pathvalues.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = array_clone(roots.bound);
    var json, hasValue, hasValues;

    roots[_cache] = roots.root;

    while (++index < count) {

        json = values && values[index];
        if (is_object(json)) {
            roots.json = roots[_json] = parents[_json] = nodes[_json] = json.json || (json.json = {})
        } else {
            roots.json = roots[_json] = parents[_json] = nodes[_json] = undefined;
        }

        var pv = pathvalues[index];
        var pathset = pv.path;
        roots.value = pv.value;
        roots.index = index;

        walk_path_set(onNode, onEdge, pathset, 0, roots, parents, nodes, requested, optimized);

        hasValue = roots.hasValue;
        if (Boolean(hasValue)) {
            hasValues = true;
            if (is_object(json)) {
                json.json = roots.json;
            }
            delete roots.json;
            delete roots.hasValue;
        } else if (is_object(json)) {
            delete json.json;
        }
    }

    return {
        values: values,
        errors: roots.errors,
        hasValue: hasValues,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathset, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset, is_keyset) {

    var parent, json;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        json = parents[_json];
        parent = parents[_cache];
    } else {
        json = is_keyset && nodes[_json] || parents[_json];
        parent = nodes[_cache];
    }

    var node = parent[key],
        type;

    if (is_reference) {
        type = is_object(node) && node.$type || undefined;
        type = type && is_branch && "." || type;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = parent;
        nodes[_cache] = node;
        return;
    }

    parents[_json] = json;

    if (is_branch) {
        type = is_object(node) && node.$type || undefined;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = parent;
        nodes[_cache] = node;
        if (is_keyset && Boolean(json)) {
            nodes[_json] = json[keyset] || (json[keyset] = {});
        }
        return;
    }

    var selector = roots.error_selector;
    var comparator = roots.comparator;
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var message = roots.value;

    if (message === undefined && roots.no_data_source) {
        invalidate_node(parent, node, key, roots.lru);
        update_graph(parent, size, roots.version, roots.lru);
        node = undefined;
    } else {
        type = is_object(message) && message.$type || undefined;
        message = wrap_node(message, type, Boolean(type) ? message.value : message);
        type || (type = $atom);

        if (type == $error && Boolean(selector)) {
            message = selector(requested, message);
        }

        var is_distinct = roots.is_distinct = true;

        if(Boolean(comparator)) {
            is_distinct = roots.is_distinct = !comparator(requested, node, message);
        }

        if (is_distinct) {
            node = replace_node(parent, node, message, key, roots.lru);
            node = graph_node(root, parent, node, key, inc_generation());
            update_graph(parent, size - node.$size, roots.version, roots.lru);
        }
    }

    nodes[_cache] = node;
}

function onEdge(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);
    var isMissingPath = set_node_if_missing_path(roots, node, type, pathset, depth, requested, optimized);

    if(isMissingPath) {
        return;
    }

    var isError = set_node_if_error(roots, node, type, requested);

    if(isError) {
        return;
    }

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        set_successful_paths(roots, requested, optimized);
        if (keyset == null) {
            roots.json = clone(roots, node, type, node && node.value);
        } else if (Boolean(json = parents[_json])) {
            json[keyset] = clone(roots, node, type, node && node.value);
        }
        roots.hasValue = true;
    }
}
},{"101":101,"106":106,"113":113,"115":115,"117":117,"118":118,"120":120,"121":121,"123":123,"124":124,"125":125,"126":126,"127":127,"128":128,"134":134,"80":80,"85":85,"92":92,"96":96,"97":97,"99":99}],75:[function(require,module,exports){
module.exports = set_json_values_as_json_graph;

var $ref = require(128);
var $error = require(127);
var $atom = require(126);

var clone = require(86);
var array_clone = require(80);

var options = require(113);
var walk_path_set = require(133);

var is_object = require(106);

var get_valid_key = require(96);
var create_branch = require(92);
var wrap_node = require(125);
var invalidate_node = require(101);
var replace_node = require(117);
var graph_node = require(97);
var update_back_refs = require(123);
var update_graph = require(124);
var inc_generation = require(99);

var set_node_if_missing_path = require(121);
var set_node_if_error = require(120);
var set_successful_paths = require(118);

var promote = require(49);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function set_json_values_as_json_graph(model, pathvalues, values, error_selector, comparator) {

    var roots = options([], model, error_selector, comparator);
    var index = -1;
    var count = pathvalues.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = array_clone(roots.bound);
    var json = values[0];
    var hasValue;

    roots[_cache] = roots.root;
    roots[_jsong] = parents[_jsong] = nodes[_jsong] = json.jsong || (json.jsong = {});
    roots.requestedPaths = json.paths || (json.paths = roots.requestedPaths);

    while (++index < count) {

        var pv = pathvalues[index];
        var pathset = pv.path;
        roots.value = pv.value;

        walk_path_set(onNode, onEdge, pathset, 0, roots, parents, nodes, requested, optimized);
    }

    hasValue = roots.hasValue;
    if (hasValue) {
        json.jsong = roots[_jsong];
    } else {
        delete json.jsong;
        delete json.paths;
    }

    return {
        values: values,
        errors: roots.errors,
        hasValue: hasValue,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathset, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset, is_keyset) {

    var parent, json;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        json = parents[_jsong];
        parent = parents[_cache];
    } else {
        json = nodes[_jsong];
        parent = nodes[_cache];
    }

    var jsonkey = key;
    var node = parent[key],
        type;

    if (is_reference) {
        type = is_object(node) && node.$type || undefined;
        type = type && is_branch && "." || type;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = parent;
        nodes[_cache] = node;
        parents[_jsong] = json;
        if (type == $ref) {
            json[jsonkey] = clone(roots, node, type, node.value);
            roots.hasValue = true;
        } else {
            nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    if (is_branch) {
        type = is_object(node) && node.$type || undefined;
        node = create_branch(roots, parent, node, type, key);
        type = node.$type;
        parents[_cache] = parent;
        nodes[_cache] = node;
        parents[_jsong] = json;
        if (type == $ref) {
            json[jsonkey] = clone(roots, node, type, node.value);
            roots.hasValue = true;
        } else {
            nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    var selector = roots.error_selector;
    var comparator = roots.comparator;
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var message = roots.value;

    if (message === undefined && roots.no_data_source) {
        invalidate_node(parent, node, key, roots.lru);
        update_graph(parent, size, roots.version, roots.lru);
        node = undefined;
    } else {
        type = is_object(message) && message.$type || undefined;
        message = wrap_node(message, type, Boolean(type) ? message.value : message);
        type || (type = $atom);

        if (type == $error && Boolean(selector)) {
            message = selector(requested, message);
        }

        var is_distinct = roots.is_distinct = true;

        if(Boolean(comparator)) {
            is_distinct = roots.is_distinct = !comparator(requested, node, message);
        }

        if (is_distinct) {
            node = replace_node(parent, node, message, key, roots.lru);
            node = graph_node(root, parent, node, key, inc_generation());
            update_graph(parent, size - node.$size, roots.version, roots.lru);

            json[jsonkey] = clone(roots, node, type, node && node.value);
            roots.hasValue = true;
        }
    }
    nodes[_cache] = node;
}

function onEdge(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);
    var isMissingPath = set_node_if_missing_path(roots, node, type, pathset, depth, requested, optimized)

    if(isMissingPath) {
        return;
    }

    promote(roots.lru, node);

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        set_successful_paths(roots, requested, optimized);
        if (keyset == null && !roots.hasValue && (keyset = get_valid_key(optimized)) == null) {
            node = clone(roots, node, type, node && node.value);
            json = roots[_jsong];
            json.$type = node.$type;
            json.value = node.value;
        }
        roots.hasValue = true;
    }
}
},{"101":101,"106":106,"113":113,"115":115,"117":117,"118":118,"120":120,"121":121,"123":123,"124":124,"125":125,"126":126,"127":127,"128":128,"133":133,"49":49,"80":80,"86":86,"92":92,"96":96,"97":97,"99":99}],76:[function(require,module,exports){
module.exports = set_json_values_as_json_sparse;

var $ref = require(128);
var $error = require(127);
var $atom = require(126);

var clone = require(85);
var array_clone = require(80);

var options = require(113);
var walk_path_set = require(134);

var is_object = require(106);

var get_valid_key = require(96);
var create_branch = require(92);
var wrap_node = require(125);
var invalidate_node = require(101);
var replace_node = require(117);
var graph_node = require(97);
var update_back_refs = require(123);
var update_graph = require(124);
var inc_generation = require(99);

var set_node_if_missing_path = require(121);
var set_node_if_error = require(120);
var set_successful_paths = require(118);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function set_json_values_as_json_sparse(model, pathvalues, values, error_selector, comparator) {

    var roots = options([], model, error_selector, comparator);
    var index = -1;
    var count = pathvalues.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = array_clone(roots.bound);
    var json = values[0];
    var hasValue;

    roots[_cache] = roots.root;
    roots[_json] = parents[_json] = nodes[_json] = json.json || (json.json = {});

    while (++index < count) {

        var pv = pathvalues[index];
        var pathset = pv.path;
        roots.value = pv.value;

        walk_path_set(onNode, onEdge, pathset, 0, roots, parents, nodes, requested, optimized);
    }

    hasValue = roots.hasValue;
    if (hasValue) {
        json.json = roots[_json];
    } else {
        delete json.json;
    }

    return {
        values: values,
        errors: roots.errors,
        hasValue: hasValue,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

function onNode(pathset, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset, is_keyset) {

    var parent, json, jsonkey;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        jsonkey = get_valid_key(requested);
        json = parents[_json];
        parent = parents[_cache];
    } else {
        jsonkey = key;
        json = nodes[_json];
        parent = nodes[_cache];
    }

    var node = parent[key],
        type;

    if (is_reference) {
        type = is_object(node) && node.$type || undefined;
        type = type && is_branch && "." || type;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = parent;
        nodes[_cache] = node;
        return;
    }

    parents[_json] = json;

    if (is_branch) {
        type = is_object(node) && node.$type || undefined;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = parent;
        nodes[_cache] = node;
        nodes[_json] = json[jsonkey] || (json[jsonkey] = {});
        return;
    }

    var selector = roots.error_selector;
    var comparator = roots.comparator;
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var message = roots.value;

    if (message === undefined && roots.no_data_source) {
        invalidate_node(parent, node, key, roots.lru);
        update_graph(parent, size, roots.version, roots.lru);
        node = undefined;
    } else {
        type = is_object(message) && message.$type || undefined;
        message = wrap_node(message, type, Boolean(type) ? message.value : message);
        type || (type = $atom);

        if (type == $error && Boolean(selector)) {
            message = selector(requested, message);
        }

        var is_distinct = roots.is_distinct = true;

        if(Boolean(comparator)) {
            is_distinct = roots.is_distinct = !comparator(requested, node, message);
        }

        if (is_distinct) {
            node = replace_node(parent, node, message, key, roots.lru);
            node = graph_node(root, parent, node, key, inc_generation());
            update_graph(parent, size - node.$size, roots.version, roots.lru);
        }
    }
    nodes[_cache] = node;
}

function onEdge(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);
    var isMissingPath = set_node_if_missing_path(roots, node, type, pathset, depth, requested, optimized);
    
    if(isMissingPath) {
        return;
    }
    
    var isError = set_node_if_error(roots, node, type, requested);
    
    if(isError) {
        return;
    }
    
    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        set_successful_paths(roots, requested, optimized);
        if (keyset == null && !roots.hasValue && (keyset = get_valid_key(optimized)) == null) {
            node = clone(roots, node, type, node && node.value);
            json = roots[_json];
            json.$type = node.$type;
            json.value = node.value;
        } else {
            json = parents[_json];
            json[key] = clone(roots, node, type, node && node.value);
        }
        roots.hasValue = true;
    }
}
},{"101":101,"106":106,"113":113,"115":115,"117":117,"118":118,"120":120,"121":121,"123":123,"124":124,"125":125,"126":126,"127":127,"128":128,"134":134,"80":80,"85":85,"92":92,"96":96,"97":97,"99":99}],77:[function(require,module,exports){
module.exports = set_json_values_as_json_values;

var $error = require(127);
var $atom = require(126);

var clone = require(85);
var array_clone = require(80);

var options = require(113);
var walk_path_set = require(134);

var is_object = require(106);

var get_valid_key = require(96);
var create_branch = require(92);
var wrap_node = require(125);
var invalidate_node = require(101);
var replace_node = require(117);
var graph_node = require(97);
var update_back_refs = require(123);
var update_graph = require(124);
var inc_generation = require(99);

var set_node_if_missing_path = require(121);
var set_node_if_error = require(120);
var set_successful_paths = require(118);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

/**
 * TODO: CR More comments.
 * Sets a list of PathValues into the cache and calls the onNext for each value.
 */
function set_json_values_as_json_values(model, pathvalues, onNext, error_selector, comparator) {

    // TODO: CR Rename options to setup set state
    var roots = options([], model, error_selector, comparator);
    var pathsIndex = -1;
    var pathsCount = pathvalues.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requestedPath = [];
    var optimizedPath = array_clone(roots.bound);

    // TODO: CR Rename node array indicies
    roots[_cache] = roots.root;
    roots.onNext = onNext;

    while (++pathsIndex < pathsCount) {
        var pv = pathvalues[pathsIndex];
        var pathset = pv.path;
        roots.value = pv.value;
        walk_path_set(onNode, onValueType, pathset, 0, roots, parents, nodes, requestedPath, optimizedPath);
    }

    return {
        values: null,
        errors: roots.errors,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

// TODO: CR
// - comment parents and nodes initial state
// - comment parents and nodes mutation

function onNode(pathset, roots, parents, nodes, requested, optimized, is_reference, is_branch, key, keyset, is_keyset) {

    var parent;

    if (key == null) {
        if ((key = get_valid_key(optimized)) == null) {
            return;
        }
        parent = parents[_cache];
    } else {
        parent = nodes[_cache];
    }

    var node = parent[key],
        type;

    if (is_reference) {
        type = is_object(node) && node.$type || undefined;
        type = type && is_branch && "." || type;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = parent;
        nodes[_cache] = node;
        return;
    }

    if (is_branch) {
        type = is_object(node) && node.$type || undefined;
        node = create_branch(roots, parent, node, type, key);
        parents[_cache] = parent;
        nodes[_cache] = node;
        return;
    }

    var selector = roots.error_selector;
    var comparator = roots.comparator;
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var message = roots.value;

    if (message === undefined && roots.no_data_source) {
        invalidate_node(parent, node, key, roots.lru);
        update_graph(parent, size, roots.version, roots.lru);
        node = undefined;
    } else {
        type = is_object(message) && message.$type || undefined;
        message = wrap_node(message, type, Boolean(type) ? message.value : message);
        type || (type = $atom);

        if (type == $error && Boolean(selector)) {
            message = selector(requested, message);
        }

        var is_distinct = roots.is_distinct = true;

        if(Boolean(comparator)) {
            is_distinct = roots.is_distinct = !comparator(requested, node, message);
        }

        if (is_distinct) {
            node = replace_node(parent, node, message, key, roots.lru);
            node = graph_node(root, parent, node, key, inc_generation());
            update_graph(parent, size - node.$size, roots.version, roots.lru);
        }
    }
    nodes[_cache] = node;
}

// TODO: CR describe onValueType's job
function onValueType(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var node = nodes[_cache];
    var type = is_object(node) && node.$type || (node = undefined);
    var isMissingPath = set_node_if_missing_path(roots, node, type, pathset, depth, requested, optimized);

    if (isMissingPath) {
        return;
    }

    var isError = set_node_if_error(roots, node, type, requested);

    if (isError) {
        return;
    }

    if (roots.is_distinct === true) {
        // TODO: CR Explain what's happening here.
        roots.is_distinct = false;
        set_successful_paths(roots, requested, optimized);
        roots.onNext({
            path: array_clone(requested),
            value: clone(roots, node, type, node && node.value)
        });
    }
}
},{"101":101,"106":106,"113":113,"115":115,"117":117,"118":118,"120":120,"121":121,"123":123,"124":124,"125":125,"126":126,"127":127,"134":134,"80":80,"85":85,"92":92,"96":96,"97":97,"99":99}],78:[function(require,module,exports){
var $error = require(127);
var pathSyntax = require(145);
var get_type = require(95);
var is_object = require(106);
var is_path_value = require(107);
var set_json_values_as_json_dense = require(74);

module.exports = function setValueSync(path, value, errorSelector, comparator) {

    path = pathSyntax.fromPath(path);

    if(is_path_value(path)) {
        comparator = errorSelector;
        errorSelector = value;
        value = path;
    } else {
        value = { path: path, value: value };
    }

    if(is_path_value(value) === false) {
        throw new Error("Model#setValueSync must be called with an Array path.");
    }

    if(typeof errorSelector !== "function") {
        errorSelector = this._root._errorSelector;
    }

    if(typeof comparator !== "function") {
        comparator = this._root._comparator;
    }

    if(this.syncCheck("setValueSync")) {

        var json = {};
        var boxed = this._boxed;
        var treatErrorsAsValues = this._treatErrorsAsValues;

        this._boxed = true;
        this._treatErrorsAsValues = true;

        set_json_values_as_json_dense(this, [value], [json], errorSelector, comparator);

        this._boxed = boxed;
        this._treatErrorsAsValues = treatErrorsAsValues;

        json = json.json;

        if(is_object(json) === false) {
            return json;
        } else if(treatErrorsAsValues || get_type(json) !== $error) {
            if(boxed) {
                return json;
            } else {
                return json.value;
            }
        } else if(boxed) {
            throw json;
        } else {
            throw json.value;
        }
    }
};
},{"106":106,"107":107,"127":127,"145":145,"74":74,"95":95}],79:[function(require,module,exports){
module.exports = function array_append(array, value) {
    var i = -1;
    var n = array.length;
    var array2 = new Array(n + 1);
    while(++i < n) { array2[i] = array[i]; }
    array2[i] = value;
    return array2;
};
},{}],80:[function(require,module,exports){
module.exports = function array_clone(array) {
    if(!array) { return array; };
    var i = -1;
    var n = array.length;
    var array2 = new Array(n);
    while(++i < n) { array2[i] = array[i]; }
    return array2;
};
},{}],81:[function(require,module,exports){
module.exports = function array_concat(array, other) {
    if(!array) { return other; };
    var i = -1, j = -1;
    var n = array.length;
    var m = other.length;
    var array2 = new Array(n + m);
    while(++i < n) { array2[i] = array[i]; }
    while(++j < m) { array2[i++] = other[j]; }
    return array2;
};
},{}],82:[function(require,module,exports){
module.exports = function array_flat_map(array, selector) {
    var index = -1;
    var i = -1;
    var n = array.length;
    var array2 = new Array(n);
    while(++i < n) {
        var array3 = selector(array[i], i, array);
        var j = -1;
        var k = array3.length;
        while(++j < k) {
            array2[++index] = array3[j];
        }
    }
    return array2;
}
},{}],83:[function(require,module,exports){
module.exports = function array_map(array, selector) {
    var i = -1;
    var n = array.length;
    var array2 = new Array(n);
    while(++i < n) { array2[i] = selector(array[i], i, array); }
    return array2;
}
},{}],84:[function(require,module,exports){
module.exports = function array_slice(array, index) {
    index || (index = 0);
    var i = -1;
    var n = Math.max(array.length - index, 0);
    var array2 = new Array(n);
    while(++i < n) { array2[i] = array[i + index]; }
    return array2;
};
},{}],85:[function(require,module,exports){
var $atom = require(126);
var clone = require(90);
module.exports = function clone_json_dense(roots, node, type, value) {

    if (node == null || value === undefined) {
        return { $type: $atom };
    }

    if (roots.boxed) {
        return Boolean(type) && clone(node) || node;
    }

    return value;
};

},{"126":126,"90":90}],86:[function(require,module,exports){
var $atom = require(126);
var clone = require(90);
var is_primitive = require(108);
module.exports = function clone_json_graph(roots, node, type, value) {

    if(node == null || value === undefined) {
        return { $type: $atom };
    }

    if(roots.boxed == true) {
        return Boolean(type) && clone(node) || node;
    }

    if(!type || (type === $atom && is_primitive(value))) {
        return value;
    }

    return clone(node);
};
},{"108":108,"126":126,"90":90}],87:[function(require,module,exports){
var clone_requested_path = require(89);
var clone_optimized_path = require(88);
module.exports = function clone_missing_path_sets(roots, pathset, depth, requested, optimized) {
    roots.requestedMissingPaths.push(clone_requested_path(roots.bound, requested, pathset, depth, roots.index));
    roots.optimizedMissingPaths.push(clone_optimized_path(optimized, pathset, depth));
}
},{"88":88,"89":89}],88:[function(require,module,exports){
module.exports = function clone_optimized_path(optimized, pathset, depth) {
    var x;
    var i = -1;
    var j = depth - 1;
    var n = optimized.length;
    var m = pathset.length;
    var array2 = [];
    while(++i < n) {
        array2[i] = optimized[i];
    }
    while(++j < m) {
        if((x = pathset[j]) != null) {
            array2[i++] = x;
        }
    }
    return array2;
};
},{}],89:[function(require,module,exports){
var is_object = require(106);
module.exports = function clone_requested_path(bound, requested, pathset, depth, index) {
    var x;
    var i = -1;
    var j = -1;
    var l = 0;
    var m = requested.length;
    var n = bound.length;
    var array2 = [];
    while(++i < n) {
        array2[i] = bound[i];
    }
    while(++j < m) {
        if((x = requested[j]) != null) {
            if(is_object(pathset[l++])) {
                array2[i++] = [x];
            } else {
                array2[i++] = x;
            }
        }
    }
    m = n + l + pathset.length - depth;
    while(i < m) {
        array2[i++] = pathset[l++];
    }
    if(index != null) {
        array2.pathSetIndex = index;
    }
    return array2;
};
},{"106":106}],90:[function(require,module,exports){
var is_object = require(106);
var prefix = require(39);

module.exports = function clone(value) {
    var dest = value, src = dest, i = -1, n, keys, key;
    if(is_object(dest)) {
        dest = {};
        keys = Object.keys(src);
        n = keys.length;
        while(++i < n) {
            key = keys[i];
            if(key[0] !== prefix) {
                dest[key] = src[key];
            }
        }
    }
    return dest;
};
},{"106":106,"39":39}],91:[function(require,module,exports){
var is_array = Array.isArray;
var is_object = require(106);

/* jshint forin: false */
module.exports = function collapse(lengths) {
    var pathmap;
    var allPaths = [];
    var allPathsLength = 0;
    for (var length in lengths) {
        if (isNumber(length) && is_object(pathmap = lengths[length])) {
            var paths = collapsePathMap(pathmap, 0, parseInt(length, 10)).sets;
            var pathsIndex = -1;
            var pathsCount = paths.length;
            while (++pathsIndex < pathsCount) {
                allPaths[allPathsLength++] = collapsePathSetIndexes(paths[pathsIndex]);
            }
        }
    }
    return allPaths;
};

function collapsePathMap(pathmap, depth, length) {

    var key;
    var code = getHashCode(String(depth));
    var subs = Object.create(null);

    var codes = [];
    var codesIndex = -1;
    var codesCount = 0;

    var pathsets = [];
    var pathsetsCount = 0;

    var subPath, subCode,
        subKeys, subKeysIndex, subKeysCount,
        subSets, subSetsIndex, subSetsCount,
        pathset, pathsetIndex, pathsetCount,
        firstSubKey, pathsetClone;

    subKeys = [];
    subKeysIndex = -1;

    if (depth < length - 1) {

        subKeysCount = getSortedKeys(pathmap, subKeys);

        while (++subKeysIndex < subKeysCount) {
            key = subKeys[subKeysIndex];
            subPath = collapsePathMap(pathmap[key], depth + 1, length);
            subCode = subPath.code;
            if(subs[subCode]) {
                subPath = subs[subCode];
            } else {
                codes[codesCount++] = subCode;
                subPath = subs[subCode] = {
                    keys: [],
                    sets: subPath.sets
                };
            }
            code = getHashCode(code + key + subCode);

            isNumber(key) &&
                subPath.keys.push(parseInt(key, 10)) ||
                subPath.keys.push(key);
        }

        while(++codesIndex < codesCount) {

            key = codes[codesIndex];
            subPath = subs[key];
            subKeys = subPath.keys;
            subKeysCount = subKeys.length;

            if (subKeysCount > 0) {

                subSets = subPath.sets;
                subSetsIndex = -1;
                subSetsCount = subSets.length;
                firstSubKey = subKeys[0];

                while (++subSetsIndex < subSetsCount) {

                    pathset = subSets[subSetsIndex];
                    pathsetIndex = -1;
                    pathsetCount = pathset.length;
                    pathsetClone = new Array(pathsetCount + 1);
                    pathsetClone[0] = subKeysCount > 1 && subKeys || firstSubKey;

                    while (++pathsetIndex < pathsetCount) {
                        pathsetClone[pathsetIndex + 1] = pathset[pathsetIndex];
                    }

                    pathsets[pathsetsCount++] = pathsetClone;
                }
            }
        }
    } else {
        subKeysCount = getSortedKeys(pathmap, subKeys);
        if (subKeysCount > 1) {
            pathsets[pathsetsCount++] = [subKeys];
        } else {
            pathsets[pathsetsCount++] = subKeys;
        }
        while (++subKeysIndex < subKeysCount) {
            code = getHashCode(code + subKeys[subKeysIndex]);
        }
    }

    return {
        code: code,
        sets: pathsets
    };
}

function collapsePathSetIndexes(pathset) {

    var keysetIndex = -1;
    var keysetCount = pathset.length;

    while (++keysetIndex < keysetCount) {
        var keyset = pathset[keysetIndex];
        if (is_array(keyset)) {
            pathset[keysetIndex] = collapseIndex(keyset);
        }
    }

    return pathset;
}

/**
 * Collapse range indexers, e.g. when there is a continuous
 * range in an array, turn it into an object instead:
 *
 * [1,2,3,4,5,6] => {"from":1, "to":6}
 *
 */
function collapseIndex(keyset) {

    // Do we need to dedupe an indexer keyset if they're duplicate consecutive integers?
    // var hash = {};
    var keyIndex = -1;
    var keyCount = keyset.length - 1;
    var isSparseRange = keyCount > 0;

    while (++keyIndex <= keyCount) {

        var key = keyset[keyIndex];

        if (!isNumber(key) /* || hash[key] === true*/ ) {
            isSparseRange = false;
            break;
        }
        // hash[key] = true;
        // Cast number indexes to integers.
        keyset[keyIndex] = parseInt(key, 10);
    }

    if (isSparseRange === true) {

        keyset.sort(sortListAscending);

        var from = keyset[0];
        var to = keyset[keyCount];

        // If we re-introduce deduped integer indexers, change this comparson to "===".
        if (to - from <= keyCount) {
            return {
                from: from,
                to: to
            };
        }
    }

    return keyset;
}

function sortListAscending(a, b) {
    return a - b;
}

/* jshint forin: false */
function getSortedKeys(map, keys, sort) {
    var len = 0;
    for (var key in map) {
        keys[len++] = key;
    }
    if (len > 1) {
        keys.sort(sort);
    }
    return len;
}

function getHashCode(key) {
    var code = 5381;
    var index = -1;
    var count = key.length;
    while (++index < count) {
        code = (code << 5) + code + key.charCodeAt(index);
    }
    return String(code);
}

/**
 * Return true if argument is a number or can be cast to a number
 */
function isNumber(val) {
    // parseFloat NaNs numeric-cast false positives (null|true|false|"")
    // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
    // subtraction forces infinities to NaN
    // adding 1 corrects loss of precision from parseFloat (#15100)
    return !is_array(val) && (val - parseFloat(val) + 1) >= 0;
}
},{"106":106}],92:[function(require,module,exports){
var $ref = require(128);
var $expired = "expired";
var replace_node = require(117);
var graph_node = require(97);
var update_back_refs = require(123);
var is_primitive = require(108);
var is_expired = require(102);

// TODO: comment about what happens if node is a branch vs leaf.
module.exports = function create_branch(roots, parent, node, type, key) {

    if(Boolean(type) && is_expired(roots, node)) {
        type = $expired;
    }

    if((Boolean(type) && type != $ref) || is_primitive(node)) {
        node = replace_node(parent, node, {}, key, roots.lru);
        node = graph_node(roots[0], parent, node, key, 0);
        node = update_back_refs(node, roots.version);
    }
    return node;
}
},{"102":102,"108":108,"117":117,"123":123,"128":128,"97":97}],93:[function(require,module,exports){
var __ref = require(42);
var __context = require(30);
var __ref_index = require(41);
var __refs_length = require(43);

module.exports = function delete_back_refs(node) {
    var ref, i = -1, n = node[__refs_length] || 0;
    while(++i < n) {
        if((ref = node[__ref + i]) !== undefined) {
            ref[__context] = ref[__ref_index] = node[__ref + i] = undefined;
        }
    }
    node[__refs_length] = undefined
};
},{"30":30,"41":41,"42":42,"43":43}],94:[function(require,module,exports){
var is_object = require(106);
module.exports = function get_size(node) {
    return is_object(node) && node.$size || 0;
};
},{"106":106}],95:[function(require,module,exports){
var is_object = require(106);

module.exports = function get_type(node, anyType) {
    var type = is_object(node) && node.$type || undefined;
    if(anyType && type) {
        return "branch";
    }
    return type;
};
},{"106":106}],96:[function(require,module,exports){
module.exports = function get_valid_key(path) {
    var key, index = path.length - 1;
    do {
        if((key = path[index]) != null) {
            return key;
        }
    } while(--index > -1);
    return null;
};
},{}],97:[function(require,module,exports){
var __parent = require(38);
var __key = require(35);
var __generation = require(32);

module.exports = function graph_node(root, parent, node, key, generation) {
    node[__parent] = parent;
    node[__key] = key;
    node[__generation] = generation;
    return node;
};
},{"32":32,"35":35,"38":38}],98:[function(require,module,exports){
module.exports = function identity(x) { return x; };
},{}],99:[function(require,module,exports){
var generation = 0;
module.exports = function increment_generation() { return generation++; };
},{}],100:[function(require,module,exports){
var version = 0;
module.exports = function increment_version() { return version++; };
},{}],101:[function(require,module,exports){
var is_object = require(106);
var remove_node = require(116);
var prefix = require(39);

module.exports = function invalidate_node(parent, node, key, lru) {
    if(remove_node(parent, node, key, lru)) {
        var type = is_object(node) && node.$type || undefined;
        if(type == null) {
            var keys = Object.keys(node);
            for(var i = -1, n = keys.length; ++i < n;) {
                var key = keys[i];
                if(key[0] !== prefix && key[0] !== "$") {
                    invalidate_node(node, node[key], key, lru);
                }
            }
        }
        return true;
    }
    return false;
};
},{"106":106,"116":116,"39":39}],102:[function(require,module,exports){
var $expires_now = require(130);
var $expires_never = require(129);
var __invalidated = require(34);
var now = require(112);
var splice = require(50);

module.exports = function isExpired(roots, node) {
    var expires = node.$expires;
    if((expires != null                            ) && (
        expires != $expires_never                  ) && (
        expires == $expires_now || expires < now()))    {
        if(!node[__invalidated]) {
            node[__invalidated] = true;
            roots.expired.push(node);
            splice(roots.lru, node);
        }
        return true;
    }
    return false;
}

},{"112":112,"129":129,"130":130,"34":34,"50":50}],103:[function(require,module,exports){
var function_typeof = "function";

module.exports = function is_function(func) {
    return Boolean(func) && typeof func === function_typeof;
};
},{}],104:[function(require,module,exports){
var is_object = require(106);

module.exports = function is_json_graph_envelope(envelope) {
    return is_object(envelope) && ("json" in envelope);
};
},{"106":106}],105:[function(require,module,exports){
var is_array = Array.isArray;
var is_object = require(106);

module.exports = function is_json_graph_envelope(envelope) {
    return is_object(envelope) && is_array(envelope.paths) && (
        is_object(envelope.jsonGraph) ||
        is_object(envelope.jsong)     ||
        is_object(envelope.json)      ||
        is_object(envelope.values)    ||
        is_object(envelope.value)
    );
};
},{"106":106}],106:[function(require,module,exports){
var obj_typeof = "object";
module.exports = function is_object(value) {
    return value != null && typeof value == obj_typeof;
};
},{}],107:[function(require,module,exports){
var is_array = Array.isArray;
var is_object = require(106);

module.exports = function is_path_value(pathValue) {
    return is_object(pathValue) &&  (
        is_array(pathValue.path) || (
            typeof pathValue.path === "string"
        ));
};
},{"106":106}],108:[function(require,module,exports){
var obj_typeof = "object";
module.exports = function is_primitive(value) {
    return value == null || typeof value != obj_typeof;
};
},{}],109:[function(require,module,exports){
var __offset = require(37);
var is_array = Array.isArray;
var is_object = require(106);

module.exports = function key_to_keyset(key, iskeyset) {
    if(iskeyset) {
        if(is_array(key)) {
            key = key[key[__offset]];
            return key_to_keyset(key, is_object(key));
        } else {
            return key[__offset];
        }
    }
    return key;
};
},{"106":106,"37":37}],110:[function(require,module,exports){
var __parent = require(38);
var $ref = require(128);
var $atom = require(126);
var $expires_now = require(130);

var is_object = require(106);
var is_primitive = require(108);
var is_expired = require(102);
var promote = require(49);
var wrap_node = require(125);
var graph_node = require(97);
var replace_node = require(117);
var update_graph  = require(124);
var inc_generation = require(99);
var invalidate_node = require(101);

module.exports = function merge_node(roots, parent, node, messageParent, message, key, requested) {

    var type, messageType, node_is_object, message_is_object;

    // If the cache and message are the same, we can probably return early:
    // - If they're both null, return null.
    // - If they're both branches, return the branch.
    // - If they're both edges, continue below.
    if(node == message) {
        if(node == null) {
            return null;
        } else if((node_is_object = is_object(node))) {
            type = node.$type;
            if(type == null) {
                if(node[__parent] == null) {
                    return graph_node(roots[0], parent, node, key, 0);
                }
                return node;
            }
        }
    } else if((node_is_object = is_object(node))) {
        type = node.$type;
    }

    var value, messageValue;

    if(type == $ref) {
        if(message == null) {
            // If the cache is an expired reference, but the message
            // is empty, remove the cache value and return undefined
            // so we build a missing path.
            if(is_expired(roots, node)) {
                invalidate_node(parent, node, key, roots.lru);
                return undefined;
            }
            // If the cache has a reference and the message is empty,
            // leave the cache alone and follow the reference.
            return node;
        } else if((message_is_object = is_object(message))) {
            messageType = message.$type;
            // If the cache and the message are both references,
            // check if we need to replace the cache reference.
            if(messageType == $ref) {
                if(node === message) {
                    // If the cache and message are the same reference,
                    // we performed a whole-branch merge of one of the
                    // grandparents. If we've previously graphed this
                    // reference, break early.
                    if(node[__parent] != null) {
                        return node;
                    }
                }
                // If the message doesn't expire immediately and is newer than the
                // cache (or either cache or message don't have timestamps), attempt
                // to use the message value.
                // Note: Number and `undefined` compared LT/GT to `undefined` is `false`.
                else if((
                    is_expired(roots, message) === false) && ((
                    message.$timestamp < node.$timestamp) === false)) {

                    // Compare the cache and message references.
                    // - If they're the same, break early so we don't insert.
                    // - If they're different, replace the cache reference.

                    value = node.value;
                    messageValue = message.value;

                    var count = value.length;

                    // If the reference lengths are equal, check their keys for equality.
                    if(count === messageValue.length) {
                        while(--count > -1) {
                            // If any of their keys are different, replace the reference
                            // in the cache with the reference in the message.
                            if(value[count] !== messageValue[count]) {
                                break;
                            }
                        }
                        // If all their keys are equal, leave the cache value alone.
                        if(count === -1) {
                            return node;
                        }
                    }
                }
            }
        }
    } else {
        if((message_is_object = is_object(message))) {
            messageType = message.$type;
        }
        if(node_is_object && !type) {
            // Otherwise if the cache is a branch and the message is either
            // null or also a branch, continue with the cache branch.
            if(message == null || (message_is_object && !messageType)) {
                return node;
            }
        }
    }

    // If the message is an expired edge, report it back out so we don't build a missing path, but
    // don't insert it into the cache. If a value exists in the cache that didn't come from a
    // whole-branch grandparent merge, remove the cache value.
    if(Boolean(messageType) && Boolean(message[__parent]) && is_expired(roots, message)) {
        if(node_is_object && node != message) {
            invalidate_node(parent, node, key, roots.lru);
        }
        return message;
    }
    // If the cache is a value, but the message is a branch, merge the branch over the value.
    else if(Boolean(type) && message_is_object && !messageType) {
        node = replace_node(parent, node, message, key, roots.lru);
        return graph_node(roots[0], parent, node, key, 0);
    }
    // If the message is a value, insert it into the cache.
    else if(!message_is_object || Boolean(messageType)) {
        var offset = 0;
        // If we've arrived at this message value, but didn't perform a whole-branch merge
        // on one of its ancestors, replace the cache node with the message value.
        if(node != message) {
            messageValue || (messageValue = Boolean(messageType) ? message.value : message);
            message = wrap_node(message, messageType, messageValue);
            var comparator = roots.comparator;
            var is_distinct = roots.is_distinct = true;
            if(Boolean(comparator)) {
                is_distinct = roots.is_distinct = !comparator(requested, node, message);
            }
            if(is_distinct) {
                var size = node_is_object && node.$size || 0;
                var messageSize = message.$size;
                offset = size - messageSize;

                node = replace_node(parent, node, message, key, roots.lru);
                update_graph(parent, offset, roots.version, roots.lru);
                node = graph_node(roots[0], parent, node, key, inc_generation());
            }
        }
        // If the cache and the message are the same value, we branch-merged one of its
        // ancestors. Give the message a $size and $type, attach its graph pointers, and
        // update the cache sizes and generations.
        else if(node_is_object && node[__parent] == null) {
            roots.is_distinct = true;
            node = parent[key] = wrap_node(node, type, node.value);
            offset = -node.$size;
            update_graph(parent, offset, roots.version, roots.lru);
            node = graph_node(roots[0], parent, node, key, inc_generation());
        }
        // Otherwise, cache and message are the same primitive value. Wrap in a atom and insert.
        else {
            roots.is_distinct = true;
            node = parent[key] = wrap_node(node, type, node);
            offset = -node.$size;
            update_graph(parent, offset, roots.version, roots.lru);
            node = graph_node(roots[0], parent, node, key, inc_generation());
        }
        // If the node is already expired, return undefined to build a missing path.
        // if(is_expired(roots, node)) {
        //     return undefined;
        // }

        // Promote the message edge in the LRU.
        promote(roots.lru, node);
    }
    // If we get here, the cache is empty and the message is a branch.
    // Merge the whole branch over.
    else if(node == null) {
        node = parent[key] = graph_node(roots[0], parent, message, key, 0);
    }

    return node;
}

},{"101":101,"102":102,"106":106,"108":108,"117":117,"124":124,"125":125,"126":126,"128":128,"130":130,"38":38,"49":49,"97":97,"99":99}],111:[function(require,module,exports){
module.exports = function noop() {};
},{}],112:[function(require,module,exports){
module.exports = Date.now;
},{}],113:[function(require,module,exports){
var inc_version = require(100);
var getBoundValue = require(13);

/**
 * TODO: more options state tracking comments.
 */
module.exports = function get_initial_state(options, model, error_selector, comparator) {
    
    var bound = options.bound     || (options.bound                 = model._path || []);
    var root  = options.root      || (options.root                  = model._cache);
    var nodes = options.nodes     || (options.nodes                 = []);
    var lru   = options.lru       || (options.lru                   = model._root);
    options.expired               || (options.expired               = lru.expired);
    options.errors                || (options.errors                = []);
    options.requestedPaths        || (options.requestedPaths        = []);
    options.optimizedPaths        || (options.optimizedPaths        = []);
    options.requestedMissingPaths || (options.requestedMissingPaths = []);
    options.optimizedMissingPaths || (options.optimizedMissingPaths = []);
    options.boxed  = model._boxed || false;
    options.materialized = model._materialized;
    options.errorsAsValues = model._treatErrorsAsValues || false;
    options.no_data_source = model._source == null;
    options.version = model._version = inc_version();
    
    options.offset || (options.offset = 0);
    options.error_selector = error_selector || model._errorSelector;
    options.comparator = comparator;
    
    if(bound.length) {
        nodes[0] = getBoundValue(model, bound).value;
    } else {
        nodes[0] = root;
    }
    
    return options;
};
},{"100":100,"13":13}],114:[function(require,module,exports){
var __offset = require(37);
var is_array = Array.isArray;
var is_object = require(106);

module.exports = function permute_keyset(key) {
    if(is_array(key)) {
        if(key.length == 0) {
            return false;
        }
        if(key[__offset] === undefined) {
            return permute_keyset(key[key[__offset] = 0]) || true;
        } else if(permute_keyset(key[key[__offset]])) {
            return true;
        } else if(++key[__offset] >= key.length) {
            key[__offset] = undefined;
            return false;
        } else {
            return true;
        }
    } else if(is_object(key)) {
        if(key[__offset] === undefined) {
            key[__offset] = (key.from || (key.from = 0)) - 1;
            if(key.to === undefined) {
                if(key.length === undefined) {
                    throw new Error("Range keysets must specify at least one index to retrieve.");
                } else if(key.length === 0) {
                    return false;
                }
                key.to = key.from + (key.length || 1) - 1;
            }
        }
        
        if(++key[__offset] > key.to) {
            key[__offset] = key.from - 1;
            return false;
        }
        
        return true;
    }
    
    return false;
};
},{"106":106,"37":37}],115:[function(require,module,exports){
module.exports = {
    cache: 0,
    message: 1,
    jsong: 2,
    json: 3
};
},{}],116:[function(require,module,exports){
var $ref = require(128);
var __parent = require(38);
var unlink = require(122);
var delete_back_refs = require(93);
var splice = require(50);
var is_object = require(106);

module.exports = function remove_node(parent, node, key, lru) {
    if(is_object(node)) {
        var type  = node.$type;
        if(Boolean(type)) {
            if(type == $ref) { unlink(node); }
            splice(lru, node);
        }
        delete_back_refs(node);
        parent[key] = node[__parent] = undefined;
        return true;
    }
    return false;
}

},{"106":106,"122":122,"128":128,"38":38,"50":50,"93":93}],117:[function(require,module,exports){
var transfer_back_refs = require(119);
var invalidate_node = require(101);

module.exports = function replace_node(parent, node, replacement, key, lru) {
    if(node != null && node !== replacement && typeof node == "object") {
        transfer_back_refs(node, replacement);
        invalidate_node(parent, node, key, lru);
    }
    return parent[key] = replacement;
}
},{"101":101,"119":119}],118:[function(require,module,exports){
var array_slice = require(84);
var array_clone = require(80);

module.exports = function cloneSuccessPaths(roots, requested, optimized) {
    roots.requestedPaths.push(array_slice(requested, roots.offset));
    roots.optimizedPaths.push(array_clone(optimized));
}
},{"80":80,"84":84}],119:[function(require,module,exports){
var __ref = require(42);
var __context = require(30);
var __refs_length = require(43);

module.exports = function transfer_back_references(node, dest) {
    var nodeRefsLength = node[__refs_length] || 0,
        destRefsLength = dest[__refs_length] || 0,
        i = -1, ref;
    while(++i < nodeRefsLength) {
        ref = node[__ref + i];
        if(ref !== undefined) {
            ref[__context] = dest;
            dest[__ref + (destRefsLength + i)] = ref;
            node[__ref + i] = undefined;
        }
    }
    dest[__refs_length] = nodeRefsLength + destRefsLength;
    node[__refs_length] = ref = undefined;
}
},{"30":30,"42":42,"43":43}],120:[function(require,module,exports){
var $error = require(127);
var promote = require(49);
var array_clone = require(80);
var clone = require(90);

module.exports = function treatNodeAsError(roots, node, type, path) {
    if(node == null) {
        return false;
    }
    promote(roots.lru, node);
    if(type != $error || roots.errorsAsValues) {
        return false;
    }
    roots.errors.push({
        path: array_clone(path),
        value: roots.boxed && clone(node) || node.value
    });
    return true;
};

},{"127":127,"49":49,"80":80,"90":90}],121:[function(require,module,exports){
var $atom = require(126);
var clone_misses = require(87);
var is_expired = require(102);

module.exports = function treatNodeAsMissingPathSet(roots, node, type, pathset, depth, requested, optimized) {
    var dematerialized = !roots.materialized;
    if(node == null && dematerialized) {
        clone_misses(roots, pathset, depth, requested, optimized);
        return true;
    } else if(Boolean(type)) {
        if(type == $atom && node.value === undefined && dematerialized && !roots.boxed) {
            // Don't clone the missing paths because we found a value, but don't want to report it.
            // TODO: CR Explain weirdness further.
            return true;
        } else if(is_expired(roots, node)) {
            clone_misses(roots, pathset, depth, requested, optimized);
            return true;
        }
    }
    return false;
};

},{"102":102,"126":126,"87":87}],122:[function(require,module,exports){
var __ref = require(42);
var __context = require(30);
var __ref_index = require(41);
var __refs_length = require(43);

module.exports = function unlink_ref(ref) {
    var destination = ref[__context];
    if(destination) {
        var i = (ref[__ref_index] || 0) - 1,
            n = (destination[__refs_length] || 0) - 1;
        while(++i <= n) {
            destination[__ref + i] = destination[__ref + (i + 1)];
        }
        destination[__refs_length] = n;
        ref[__ref_index] = ref[__context] = destination = undefined;
    }
}
},{"30":30,"41":41,"42":42,"43":43}],123:[function(require,module,exports){
var __ref = require(42);
var __parent = require(38);
var __version = require(45);
var __generation = require(32);
var __refs_length = require(43);

var generation = require(99);

module.exports = function update_back_refs(node, version) {
    if(node && node[__version] !== version) {
        node[__version] = version;
        node[__generation] = generation();
        update_back_refs(node[__parent], version);
        var i = -1, n = node[__refs_length] || 0;
        while(++i < n) {
            update_back_refs(node[__ref + i], version);
        }
    }
    return node;
}

},{"32":32,"38":38,"42":42,"43":43,"45":45,"99":99}],124:[function(require,module,exports){
var __key = require(35);
var __version = require(45);
var __parent = require(38);
var remove_node = require(116);
var update_back_refs = require(123);

module.exports = function update_graph(node, offset, version, lru) {
    var child;
    while((child = node)) {
        node = child[__parent];
        if((child.$size = (child.$size || 0) - offset) <= 0 && node != null) {
            remove_node(node, child, child[__key], lru);
        } else if(child[__version] !== version) {
            update_back_refs(child, version);
        }
    }
};
},{"116":116,"123":123,"35":35,"38":38,"45":45}],125:[function(require,module,exports){
var $ref = require(128);
var $error = require(127);
var $atom = require(126);

var now = require(112);
var clone = require(90);
var is_array = Array.isArray;
var is_object = require(106);

// TODO: CR Wraps a node for insertion.
// TODO: CR Define default atom size values.
module.exports = function wrap_node(node, type, value) {

    var dest = node, size = 0;

    if(Boolean(type)) {
        dest = clone(node);
        size = dest.$size;
    // }
    // if(type == $ref) {
    //     dest = clone(node);
    //     size = 50 + (value.length || 1);
    // } else if(is_object(node) && (type || (type = node.$type))) {
    //     dest = clone(node);
    //     size = dest.$size;
    } else {
        dest = { value: value };
        type = $atom;
    }

    if(size <= 0 || size == null) {
        switch(typeof value) {
            case "number":
            case "boolean":
            case "function":
            case "undefined":
                size = 51;
                break;
            case "object":
                size = is_array(value) && (50 + value.length) || 51;
                break;
            case "string":
                size = 50 + value.length;
                break;
        }
    }

    var expires = is_object(node) && node.$expires || undefined;
    if(typeof expires === "number" && expires < 0) {
        dest.$expires = now() + (expires * -1);
    }

    dest.$type = type;
    dest.$size = size;

    return dest;
}

},{"106":106,"112":112,"126":126,"127":127,"128":128,"90":90}],126:[function(require,module,exports){
module.exports = "atom";

},{}],127:[function(require,module,exports){
module.exports = "error";
},{}],128:[function(require,module,exports){
module.exports = "ref";
},{}],129:[function(require,module,exports){
module.exports = 1;
},{}],130:[function(require,module,exports){
module.exports = 0;
},{}],131:[function(require,module,exports){
module.exports = walk_path_map;

var prefix = require(39);
var $ref = require(128);

var walk_reference = require(135);

var array_slice = require(84);
var array_clone    = require(80);
var array_append   = require(79);

var is_expired = require(102);
var is_primitive = require(108);
var is_object = require(106);
var is_array = Array.isArray;

var promote = require(49);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function walk_path_map(onNode, onValueType, pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset, is_keyset) {

    var node = nodes[_cache];

    if(is_primitive(pathmap) || is_primitive(node)) {
        return onValueType(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var type = node.$type;

    while(type === $ref) {

        if(is_expired(roots, node)) {
            nodes[_cache] = undefined;
            return onValueType(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
        }

        promote(roots.lru, node);

        var container = node;
        var reference = node.value;

        nodes[_cache] = parents[_cache] = roots[_cache];
        nodes[_jsong] = parents[_jsong] = roots[_jsong];
        nodes[_message] = parents[_message] = roots[_message];

        walk_reference(onNode, container, reference, roots, parents, nodes, requested, optimized);

        node = nodes[_cache];

        if(node == null) {
            optimized = array_clone(reference);
            return onValueType(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
        } else if(is_primitive(node) || ((type = node.$type) && type != $ref)) {
            onNode(pathmap, roots, parents, nodes, requested, optimized, false, null, keyset, false);
            return onValueType(pathmap, keys_stack, depth, roots, parents, nodes, array_append(requested, null), optimized, key, keyset);
        }
    }

    if(type != null) {
        return onValueType(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var keys = keys_stack[depth] = Object.keys(pathmap);

    if(keys.length == 0) {
        return onValueType(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var is_outer_keyset = keys.length > 1;

    for(var i = -1, n = keys.length; ++i < n;) {

        var inner_key = keys[i];

        if((inner_key[0] === prefix) || (inner_key[0] === "$")) {
            continue;
        }

        var inner_keyset = is_outer_keyset ? inner_key : keyset;
        var nodes2 = array_clone(nodes);
        var parents2 = array_clone(parents);
        var pathmap2 = pathmap[inner_key];
        var requested2, optimized2, is_branch;
        var has_child_key = false;

        var is_branch = is_object(pathmap2) && !pathmap2.$type;// && !is_array(pathmap2);
        if(is_branch) {
            for(child_key in pathmap2) {
                if((child_key[0] === prefix) || (child_key[0] === "$")) {
                    continue;
                }
                child_key = pathmap2.hasOwnProperty(child_key);
                break;
            }
            is_branch = child_key === true;
        }

        requested2 = array_append(requested, inner_key);
        optimized2 = array_append(optimized, inner_key);
        onNode(pathmap2, roots, parents2, nodes2, requested2, optimized2, false, is_branch, inner_key, inner_keyset, is_outer_keyset);

        if(is_branch) {
            walk_path_map(onNode, onValueType,
                pathmap2, keys_stack, depth + 1,
                roots, parents2, nodes2,
                requested2, optimized2,
                inner_key, inner_keyset, is_outer_keyset
            );
        } else {
            onValueType(pathmap2, keys_stack, depth + 1, roots, parents2, nodes2, requested2, optimized2, inner_key, inner_keyset);
        }
    }
}

},{"102":102,"106":106,"108":108,"115":115,"128":128,"135":135,"39":39,"49":49,"79":79,"80":80,"84":84}],132:[function(require,module,exports){
module.exports = walk_path_map;

var prefix = require(39);
var __context = require(30);
var $ref = require(128);

var walk_reference = require(135);

var array_slice = require(84);
var array_clone    = require(80);
var array_append   = require(79);

var is_expired = require(102);
var is_primitive = require(108);
var is_object = require(106);
var is_array = Array.isArray;

var promote = require(49);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function walk_path_map(onNode, onValueType, pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset, is_keyset) {

    var node = nodes[_cache];

    if(is_primitive(pathmap) || is_primitive(node)) {
        return onValueType(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var type = node.$type;

    while(type === $ref) {

        if(is_expired(roots, node)) {
            nodes[_cache] = undefined;
            return onValueType(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
        }

        promote(roots.lru, node);

        var container = node;
        var reference = node.value;
        node = node[__context];

        if(node != null) {
            type = node.$type;
            optimized = array_clone(reference);
            nodes[_cache] = node;
        } else {

            nodes[_cache] = parents[_cache] = roots[_cache];

            walk_reference(onNode, container, reference, roots, parents, nodes, requested, optimized);

            node = nodes[_cache];

            if(node == null) {
                optimized = array_clone(reference);
                return onValueType(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
            } else if(is_primitive(node) || ((type = node.$type) && type != $ref)) {
                onNode(pathmap, roots, parents, nodes, requested, optimized, false, null, keyset, false);
                return onValueType(pathmap, keys_stack, depth, roots, parents, nodes, array_append(requested, null), optimized, key, keyset);
            }
        }
    }

    if(type != null) {
        return onValueType(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var keys = keys_stack[depth] = Object.keys(pathmap);

    if(keys.length == 0) {
        return onValueType(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var is_outer_keyset = keys.length > 1;

    for(var i = -1, n = keys.length; ++i < n;) {

        var inner_key = keys[i];

        if((inner_key[0] === prefix) || (inner_key[0] === "$")) {
            continue;
        }

        var inner_keyset = is_outer_keyset ? inner_key : keyset;
        var nodes2 = array_clone(nodes);
        var parents2 = array_clone(parents);
        var pathmap2 = pathmap[inner_key];
        var requested2, optimized2, is_branch;
        var child_key = false;

        var is_branch = is_object(pathmap2) && !pathmap2.$type;// && !is_array(pathmap2);
        if(is_branch) {
            for(child_key in pathmap2) {
                if((child_key[0] === prefix) || (child_key[0] === "$")) {
                    continue;
                }
                child_key = pathmap2.hasOwnProperty(child_key);
                break;
            }
            is_branch = child_key === true;
        }

        if(inner_key == "null") {
            requested2 = array_append(requested, null);
            optimized2 = array_clone(optimized);
            inner_key  = key;
            inner_keyset = keyset;
            pathmap2 = pathmap;
            onNode(pathmap2, roots, parents2, nodes2, requested2, optimized2, false, is_branch, null, inner_keyset, false);
        } else {
            requested2 = array_append(requested, inner_key);
            optimized2 = array_append(optimized, inner_key);
            onNode(pathmap2, roots, parents2, nodes2, requested2, optimized2, false, is_branch, inner_key, inner_keyset, is_outer_keyset);
        }

        if(is_branch) {
            walk_path_map(onNode, onValueType,
                pathmap2, keys_stack, depth + 1,
                roots, parents2, nodes2,
                requested2, optimized2,
                inner_key, inner_keyset, is_outer_keyset
            );
        } else {
            onValueType(pathmap2, keys_stack, depth + 1, roots, parents2, nodes2, requested2, optimized2, inner_key, inner_keyset);
        }
    }
}

},{"102":102,"106":106,"108":108,"115":115,"128":128,"135":135,"30":30,"39":39,"49":49,"79":79,"80":80,"84":84}],133:[function(require,module,exports){
module.exports = walk_path_set;

var $ref = require(128);

var walk_reference = require(135);

var array_slice    = require(84);
var array_clone    = require(80);
var array_append   = require(79);

var is_expired = require(102);
var is_primitive = require(108);
var is_object = require(106);

var keyset_to_key  = require(109);
var permute_keyset = require(114);

var promote = require(49);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function walk_path_set(onNode, onValueType, pathset, depth, roots, parents, nodes, requested, optimized, key, keyset, is_keyset) {

    var node = nodes[_cache];

    if(depth >= pathset.length || is_primitive(node)) {
        return onValueType(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var type = node.$type;

    while(type === $ref) {

        if(is_expired(roots, node)) {
            nodes[_cache] = undefined;
            return onValueType(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset);
        }

        promote(roots.lru, node);

        var container = node;
        var reference = node.value;

        nodes[_cache] = parents[_cache] = roots[_cache];
        nodes[_jsong] = parents[_jsong] = roots[_jsong];
        nodes[_message] = parents[_message] = roots[_message];

        walk_reference(onNode, container, reference, roots, parents, nodes, requested, optimized);

        node = nodes[_cache];

        if(node == null) {
            optimized = array_clone(reference);
            return onValueType(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset);
        } else if(is_primitive(node) || ((type = node.$type) && type != $ref)) {
            onNode(pathset, roots, parents, nodes, requested, optimized, false, false, null, keyset, false);
            return onValueType(pathset, depth, roots, parents, nodes, array_append(requested, null), optimized, key, keyset);
        }
    }

    if(type != null) {
        return onValueType(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var outer_key = pathset[depth];
    var is_outer_keyset = is_object(outer_key);
    var is_branch = depth < pathset.length - 1;
    var run_once = false;

    while(is_outer_keyset && permute_keyset(outer_key) && (run_once = true) || (run_once = !run_once)) {
        var inner_key, inner_keyset;

        if(is_outer_keyset === true) {
            inner_key = keyset_to_key(outer_key, true);
            inner_keyset = inner_key;
        } else {
            inner_key = outer_key;
            inner_keyset = keyset;
        }

        var nodes2 = array_clone(nodes);
        var parents2 = array_clone(parents);
        var requested2, optimized2;

        if(inner_key == null) {
            requested2 = array_append(requested, null);
            optimized2 = array_clone(optimized);
            // optimized2 = optimized;
            inner_key = key;
            inner_keyset = keyset;
            onNode(pathset, roots, parents2, nodes2, requested2, optimized2, false, is_branch, null, inner_keyset, false);
        } else {
            requested2 = array_append(requested, inner_key);
            optimized2 = array_append(optimized, inner_key);
            onNode(pathset, roots, parents2, nodes2, requested2, optimized2, false, is_branch, inner_key, inner_keyset, is_outer_keyset);
        }

        walk_path_set(onNode, onValueType,
            pathset, depth + 1,
            roots, parents2, nodes2,
            requested2, optimized2,
            inner_key, inner_keyset, is_outer_keyset
        );
    }
}

},{"102":102,"106":106,"108":108,"109":109,"114":114,"115":115,"128":128,"135":135,"49":49,"79":79,"80":80,"84":84}],134:[function(require,module,exports){
module.exports = walk_path_set;

var __context = require(30);
var $ref = require(128);

var walk_reference = require(135);

var array_slice    = require(84);
var array_clone    = require(80);
var array_append   = require(79);

var is_expired = require(102);
var is_primitive = require(108);
var is_object = require(106);

var keyset_to_key  = require(109);
var permute_keyset = require(114);

var promote = require(49);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function walk_path_set(onNode, onValueType, pathset, depth, roots, parents, nodes, requested, optimized, key, keyset, is_keyset) {

    var node = nodes[_cache];

    if(depth >= pathset.length || is_primitive(node)) {
        return onValueType(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var type = node.$type;

    while(type === $ref) {

        if(is_expired(roots, node)) {
            nodes[_cache] = undefined;
            return onValueType(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset);
        }

        promote(roots.lru, node);

        var container = node;
        var reference = node.value;
        node = node[__context];

        if(node != null) {
            type = node.$type;
            optimized = array_clone(reference);
            nodes[_cache]  = node;
        } else {

            nodes[_cache] = parents[_cache] = roots[_cache];

            walk_reference(onNode, container, reference, roots, parents, nodes, requested, optimized);

            node = nodes[_cache];

            if(node == null) {
                optimized = array_clone(reference);
                return onValueType(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset);
            } else if(is_primitive(node) || ((type = node.$type) && type != $ref)) {
                onNode(pathset, roots, parents, nodes, requested, optimized, false, false, null, keyset, false);
                return onValueType(pathset, depth, roots, parents, nodes, array_append(requested, null), optimized, key, keyset);
            }
        }
    }

    if(type != null) {
        return onValueType(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var outer_key = pathset[depth];
    var is_outer_keyset = is_object(outer_key);
    var is_branch = depth < pathset.length - 1;
    var run_once = false;

    while(is_outer_keyset && permute_keyset(outer_key) && (run_once = true) || (run_once = !run_once)) {

        var inner_key, inner_keyset;

        if(is_outer_keyset === true) {
            inner_key = keyset_to_key(outer_key, true);
            inner_keyset = inner_key;
        } else {
            inner_key = outer_key;
            inner_keyset = keyset;
        }

        var nodes2 = array_clone(nodes);
        var parents2 = array_clone(parents);
        var requested2, optimized2;

        if(inner_key == null) {
            requested2 = array_append(requested, null);
            optimized2 = array_clone(optimized);
            // optimized2 = optimized;
            inner_key = key;
            inner_keyset = keyset;
            onNode(pathset, roots, parents2, nodes2, requested2, optimized2, false, is_branch, null, inner_keyset, false);
        } else {
            requested2 = array_append(requested, inner_key);
            optimized2 = array_append(optimized, inner_key);
            onNode(pathset, roots, parents2, nodes2, requested2, optimized2, false, is_branch, inner_key, inner_keyset, is_outer_keyset);
        }

        walk_path_set(onNode, onValueType,
            pathset, depth + 1,
            roots, parents2, nodes2,
            requested2, optimized2,
            inner_key, inner_keyset, is_outer_keyset
        );
    }
}

},{"102":102,"106":106,"108":108,"109":109,"114":114,"115":115,"128":128,"135":135,"30":30,"49":49,"79":79,"80":80,"84":84}],135:[function(require,module,exports){
module.exports = walk_reference;

var prefix = require(39);
var __ref = require(42);
var __context = require(30);
var __ref_index = require(41);
var __refs_length = require(43);

var is_object      = require(106);
var is_primitive   = require(108);
var array_slice    = require(84);
var array_append   = require(79);

var positions = require(115);
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function walk_reference(onNode, container, reference, roots, parents, nodes, requested, optimized) {

    optimized.length = 0;

    var index = -1;
    var count = reference.length;
    var node, key, keyset;

    while(++index < count) {

        node = nodes[_cache];

        if(node == null) {
            return nodes;
        } else if(is_primitive(node) || node.$type) {
            onNode(reference, roots, parents, nodes, requested, optimized, true, false, keyset, null, false);
            return nodes;
        }

        do {
            key = reference[index];
            if(key != null) {
                keyset = key;
                optimized.push(key);
                onNode(reference, roots, parents, nodes, requested, optimized, true, index < count - 1, key, null, false);
                break;
            }
        } while(++index < count);
    }

    node = nodes[_cache];

    if(is_object(node) && container[__context] !== node) {
        var backrefs = node[__refs_length] || 0;
        node[__refs_length] = backrefs + 1;
        node[__ref + backrefs] = container;
        container[__context]    = node;
        container[__ref_index]  = backrefs;
    }

    return nodes;
}

},{"106":106,"108":108,"115":115,"30":30,"39":39,"41":41,"42":42,"43":43,"79":79,"84":84}],136:[function(require,module,exports){
"use strict";

// rawAsap provides everything we need except exception management.
var rawAsap = require(137);
// RawTasks are recycled to reduce GC churn.
var freeTasks = [];
// We queue errors to ensure they are thrown in right order (FIFO).
// Array-as-queue is good enough here, since we are just dealing with exceptions.
var pendingErrors = [];
var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);

function throwFirstError() {
    if (pendingErrors.length) {
        throw pendingErrors.shift();
    }
}

/**
 * Calls a task as soon as possible after returning, in its own event, with priority
 * over other events like animation, reflow, and repaint. An error thrown from an
 * event will not interrupt, nor even substantially slow down the processing of
 * other events, but will be rather postponed to a lower priority event.
 * @param {{call}} task A callable object, typically a function that takes no
 * arguments.
 */
module.exports = asap;
function asap(task) {
    var rawTask;
    if (freeTasks.length) {
        rawTask = freeTasks.pop();
    } else {
        rawTask = new RawTask();
    }
    rawTask.task = task;
    rawAsap(rawTask);
}

// We wrap tasks with recyclable task objects.  A task object implements
// `call`, just like a function.
function RawTask() {
    this.task = null;
}

// The sole purpose of wrapping the task is to catch the exception and recycle
// the task object after its single use.
RawTask.prototype.call = function () {
    try {
        this.task.call();
    } catch (error) {
        if (asap.onerror) {
            // This hook exists purely for testing purposes.
            // Its name will be periodically randomized to break any code that
            // depends on its existence.
            asap.onerror(error);
        } else {
            // In a web browser, exceptions are not fatal. However, to avoid
            // slowing down the queue of pending tasks, we rethrow the error in a
            // lower priority turn.
            pendingErrors.push(error);
            requestErrorThrow();
        }
    } finally {
        this.task = null;
        freeTasks[freeTasks.length] = this;
    }
};

},{"137":137}],137:[function(require,module,exports){
(function (global){
"use strict";

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including IO, animation, reflow, and redraw
// events in browsers.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
module.exports = rawAsap;
function rawAsap(task) {
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    // Equivalent to push, but avoids a function call.
    queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// `requestFlush` is an implementation-specific method that attempts to kick
// off a `flush` event as quickly as possible. `flush` will attempt to exhaust
// the event queue before yielding to the browser's own event loop.
var requestFlush;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory exhaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
    while (index < queue.length) {
        var currentIndex = index;
        // Advance the index before calling the task. This ensures that we will
        // begin flushing on the next task the task throws an error.
        index = index + 1;
        queue[currentIndex].call();
        // Prevent leaking memory for long chains of recursive calls to `asap`.
        // If we call `asap` within tasks scheduled by `asap`, the queue will
        // grow, but to avoid an O(n) walk for every task we execute, we don't
        // shift tasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 tasks off the queue.
        if (index > capacity) {
            // Manually shift all values starting at the index back to the
            // beginning of the queue.
            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                queue[scan] = queue[scan + index];
            }
            queue.length -= index;
            index = 0;
        }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
}

// `requestFlush` is implemented using a strategy based on data collected from
// every available SauceLabs Selenium web driver worker at time of writing.
// https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593

// Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
// have WebKitMutationObserver but not un-prefixed MutationObserver.
// Must use `global` instead of `window` to work in both frames and web
// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.
var BrowserMutationObserver = global.MutationObserver || global.WebKitMutationObserver;

// MutationObservers are desirable because they have high priority and work
// reliably everywhere they are implemented.
// They are implemented in all modern browsers.
//
// - Android 4-4.3
// - Chrome 26-34
// - Firefox 14-29
// - Internet Explorer 11
// - iPad Safari 6-7.1
// - iPhone Safari 7-7.1
// - Safari 6-7
if (typeof BrowserMutationObserver === "function") {
    requestFlush = makeRequestCallFromMutationObserver(flush);

// MessageChannels are desirable because they give direct access to the HTML
// task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
// 11-12, and in web workers in many engines.
// Although message channels yield to any queued rendering and IO tasks, they
// would be better than imposing the 4ms delay of timers.
// However, they do not work reliably in Internet Explorer or Safari.

// Internet Explorer 10 is the only browser that has setImmediate but does
// not have MutationObservers.
// Although setImmediate yields to the browser's renderer, it would be
// preferrable to falling back to setTimeout since it does not have
// the minimum 4ms penalty.
// Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
// Desktop to a lesser extent) that renders both setImmediate and
// MessageChannel useless for the purposes of ASAP.
// https://github.com/kriskowal/q/issues/396

// Timers are implemented universally.
// We fall back to timers in workers in most engines, and in foreground
// contexts in the following browsers.
// However, note that even this simple case requires nuances to operate in a
// broad spectrum of browsers.
//
// - Firefox 3-13
// - Internet Explorer 6-9
// - iPad Safari 4.3
// - Lynx 2.8.7
} else {
    requestFlush = makeRequestCallFromTimer(flush);
}

// `requestFlush` requests that the high priority event queue be flushed as
// soon as possible.
// This is useful to prevent an error thrown in a task from stalling the event
// queue if the exception handled by Node.js’s
// `process.on("uncaughtException")` or by a domain.
rawAsap.requestFlush = requestFlush;

// To request a high priority event, we induce a mutation observer by toggling
// the text of a text node between "1" and "-1".
function makeRequestCallFromMutationObserver(callback) {
    var toggle = 1;
    var observer = new BrowserMutationObserver(callback);
    var node = document.createTextNode("");
    observer.observe(node, {characterData: true});
    return function requestCall() {
        toggle = -toggle;
        node.data = toggle;
    };
}

// The message channel technique was discovered by Malte Ubl and was the
// original foundation for this library.
// http://www.nonblocking.io/2011/06/windownexttick.html

// Safari 6.0.5 (at least) intermittently fails to create message ports on a
// page's first load. Thankfully, this version of Safari supports
// MutationObservers, so we don't need to fall back in that case.

// function makeRequestCallFromMessageChannel(callback) {
//     var channel = new MessageChannel();
//     channel.port1.onmessage = callback;
//     return function requestCall() {
//         channel.port2.postMessage(0);
//     };
// }

// For reasons explained above, we are also unable to use `setImmediate`
// under any circumstances.
// Even if we were, there is another bug in Internet Explorer 10.
// It is not sufficient to assign `setImmediate` to `requestFlush` because
// `setImmediate` must be called *by name* and therefore must be wrapped in a
// closure.
// Never forget.

// function makeRequestCallFromSetImmediate(callback) {
//     return function requestCall() {
//         setImmediate(callback);
//     };
// }

// Safari 6.0 has a problem where timers will get lost while the user is
// scrolling. This problem does not impact ASAP because Safari 6.0 supports
// mutation observers, so that implementation is used instead.
// However, if we ever elect to use timers in Safari, the prevalent work-around
// is to add a scroll event listener that calls for a flush.

// `setTimeout` does not call the passed callback if the delay is less than
// approximately 7 in web workers in Firefox 8 through 18, and sometimes not
// even then.

function makeRequestCallFromTimer(callback) {
    return function requestCall() {
        // We dispatch a timeout with a specified delay of 0 for engines that
        // can reliably accommodate that request. This will usually be snapped
        // to a 4 milisecond delay, but once we're flushing, there's no delay
        // between events.
        var timeoutHandle = setTimeout(handleTimer, 0);
        // However, since this timer gets frequently dropped in Firefox
        // workers, we enlist an interval handle that will try to fire
        // an event 20 times per second until it succeeds.
        var intervalHandle = setInterval(handleTimer, 50);

        function handleTimer() {
            // Whichever timer succeeds will cancel both timers and
            // execute the callback.
            clearTimeout(timeoutHandle);
            clearInterval(intervalHandle);
            callback();
        }
    };
}

// This is for `asap.js` only.
// Its name will be periodically randomized to break any code that depends on
// its existence.
rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;

// ASAP was originally a nextTick shim included in Q. This was factored out
// into this ASAP package. It was later adapted to RSVP which made further
// amendments. These decisions, particularly to marginalize MessageChannel and
// to capture the MutationObserver implementation in a closure, were integrated
// back into ASAP proper.
// https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],138:[function(require,module,exports){
(function (process){
"use strict";

var domain; // The domain module is executed on demand
var hasSetImmediate = typeof setImmediate === "function";

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including network IO events in Node.js.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
module.exports = rawAsap;
function rawAsap(task) {
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    // Avoids a function call
    queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory excaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
    while (index < queue.length) {
        var currentIndex = index;
        // Advance the index before calling the task. This ensures that we will
        // begin flushing on the next task the task throws an error.
        index = index + 1;
        queue[currentIndex].call();
        // Prevent leaking memory for long chains of recursive calls to `asap`.
        // If we call `asap` within tasks scheduled by `asap`, the queue will
        // grow, but to avoid an O(n) walk for every task we execute, we don't
        // shift tasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 tasks off the queue.
        if (index > capacity) {
            // Manually shift all values starting at the index back to the
            // beginning of the queue.
            for (var scan = 0, newLength = queue.length - index; scan < newLength; scan++) {
                queue[scan] = queue[scan + index];
            }
            queue.length -= index;
            index = 0;
        }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
}

rawAsap.requestFlush = requestFlush;
function requestFlush() {
    // Ensure flushing is not bound to any domain.
    // It is not sufficient to exit the domain, because domains exist on a stack.
    // To execute code outside of any domain, the following dance is necessary.
    var parentDomain = process.domain;
    if (parentDomain) {
        if (!domain) {
            // Lazy execute the domain module.
            // Only employed if the user elects to use domains.
            domain = require(139);
        }
        domain.active = process.domain = null;
    }

    // `setImmediate` is slower that `process.nextTick`, but `process.nextTick`
    // cannot handle recursion.
    // `requestFlush` will only be called recursively from `asap.js`, to resume
    // flushing after an error is thrown into a domain.
    // Conveniently, `setImmediate` was introduced in the same version
    // `process.nextTick` started throwing recursion errors.
    if (flushing && hasSetImmediate) {
        setImmediate(flush);
    } else {
        process.nextTick(flush);
    }

    if (parentDomain) {
        domain.active = process.domain = parentDomain;
    }
}

}).call(this,require(141))
},{"139":139,"141":141}],139:[function(require,module,exports){
/*global define:false require:false */
module.exports = (function(){
	// Import Events
	var events = require(140)

	// Export Domain
	var domain = {}
	domain.createDomain = domain.create = function(){
		var d = new events.EventEmitter()

		function emitError(e) {
			d.emit('error', e)
		}

		d.add = function(emitter){
			emitter.on('error', emitError)
		}
		d.remove = function(emitter){
			emitter.removeListener('error', emitError)
		}
		d.bind = function(fn){
			return function(){
				var args = Array.prototype.slice.call(arguments)
				try {
					fn.apply(null, args)
				}
				catch (err){
					emitError(err)
				}
			}
		}
		d.intercept = function(fn){
			return function(err){
				if ( err ) {
					emitError(err)
				}
				else {
					var args = Array.prototype.slice.call(arguments, 1)
					try {
						fn.apply(null, args)
					}
					catch (err){
						emitError(err)
					}
				}
			}
		}
		d.run = function(fn){
			try {
				fn()
			}
			catch (err) {
				emitError(err)
			}
			return this
		};
		d.dispose = function(){
			this.removeAllListeners()
			return this
		};
		d.enter = d.exit = function(){
			return this
		}
		return d
	};
	return domain
}).call(this)
},{"140":140}],140:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],141:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            currentQueue[queueIndex].run();
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],142:[function(require,module,exports){
module.exports = {
    integers: 'integers',
    ranges: 'ranges',
    keys: 'keys'
};

},{}],143:[function(require,module,exports){
var TokenTypes = {
    token: 'token',
    dotSeparator: '.',
    commaSeparator: ',',
    openingBracket: '[',
    closingBracket: ']',
    openingBrace: '{',
    closingBrace: '}',
    escape: '\\',
    space: ' ',
    colon: ':',
    quote: 'quote',
    unknown: 'unknown'
};

module.exports = TokenTypes;

},{}],144:[function(require,module,exports){
module.exports = {
    indexer: {
        nested: 'Indexers cannot be nested.',
        needQuotes: 'unquoted indexers must be numeric.',
        empty: 'cannot have empty indexers.',
        leadingDot: 'Indexers cannot have leading dots.',
        leadingComma: 'Indexers cannot have leading comma.',
        requiresComma: 'Indexers require commas between indexer args.',
        routedTokens: 'Only one token can be used per indexer when specifying routed tokens.'
    },
    range: {
        precedingNaN: 'ranges must be preceded by numbers.',
        suceedingNaN: 'ranges must be suceeded by numbers.'
    },
    routed: {
        invalid: 'Invalid routed token.  only integers|ranges|keys are supported.'
    },
    quote: {
        empty: 'cannot have empty quoted keys.',
        illegalEscape: 'Invalid escape character.  Only quotes are escapable.'
    },
    unexpectedToken: 'Unexpected token.',
    invalidIdentifier: 'Invalid Identifier.',
    invalidPath: 'Please provide a valid path.',
    throwError: function(err, tokenizer, token) {
        if (token) {
            throw err + ' -- ' + tokenizer.parseString + ' with next token: ' + token;
        }
        throw err + ' -- ' + tokenizer.parseString;
    }
};


},{}],145:[function(require,module,exports){
var Tokenizer = require(151);
var head = require(146);
var RoutedTokens = require(142);

var parser = function parser(string, extendedRules) {
    return head(new Tokenizer(string, extendedRules));
};

module.exports = parser;

// Constructs the paths from paths / pathValues that have strings.
// If it does not have a string, just moves the value into the return
// results.
parser.fromPathsOrPathValues = function(paths, ext) {
    if (!paths) {
        return [];
    }

    var out = [];
    for (i = 0, len = paths.length; i < len; i++) {

        // Is the path a string
        if (typeof paths[i] === 'string') {
            out[i] = parser(paths[i], ext);
        }

        // is the path a path value with a string value.
        else if (typeof paths[i].path === 'string') {
            out[i] = {
                path: parser(paths[i].path, ext), value: paths[i].value
            };
        }

        // just copy it over.
        else {
            out[i] = paths[i];
        }
    }

    return out;
};

// If the argument is a string, this with convert, else just return
// the path provided.
parser.fromPath = function(path, ext) {
    if (!path) {
        return [];
    }

    if (typeof path === 'string') {
        return parser(path, ext);
    }

    return path;
};

// Potential routed tokens.
parser.RoutedTokens = RoutedTokens;

},{"142":142,"146":146,"151":151}],146:[function(require,module,exports){
var TokenTypes = require(143);
var E = require(144);
var indexer = require(147);

/**
 * The top level of the parse tree.  This returns the generated path
 * from the tokenizer.
 */
module.exports = function head(tokenizer) {
    var token = tokenizer.next();
    var state = {};
    var out = [];

    while (!token.done) {

        switch (token.type) {
            case TokenTypes.token:
                var first = +token.token[0];
                if (!isNaN(first)) {
                    E.throwError(E.invalidIdentifier, tokenizer);
                }
                out[out.length] = token.token;
                break;

            // dotSeparators at the top level have no meaning
            case TokenTypes.dotSeparator:
                if (out.length === 0) {
                    E.throwError(E.unexpectedToken, tokenizer);
                }
                break;

            // Spaces do nothing.
            case TokenTypes.space:
                // NOTE: Spaces at the top level are allowed.
                // titlesById  .summary is a valid path.
                break;


            // Its time to decend the parse tree.
            case TokenTypes.openingBracket:
                indexer(tokenizer, token, state, out);
                break;

            default:
                E.throwError(E.unexpectedToken, tokenizer);
                break;
        }

        // Keep cycling through the tokenizer.
        token = tokenizer.next();
    }

    if (out.length === 0) {
        E.throwError(E.invalidPath, tokenizer);
    }

    return out;
};


},{"143":143,"144":144,"147":147}],147:[function(require,module,exports){
var TokenTypes = require(143);
var E = require(144);
var idxE = E.indexer;
var range = require(149);
var quote = require(148);
var routed = require(150);

/**
 * The indexer is all the logic that happens in between
 * the '[', opening bracket, and ']' closing bracket.
 */
module.exports = function indexer(tokenizer, openingToken, state, out) {
    var token = tokenizer.next();
    var done = false;
    var allowedMaxLength = 1;
    var routedIndexer = false;

    // State variables
    state.indexer = [];

    while (!token.done) {

        switch (token.type) {
            case TokenTypes.token:
            case TokenTypes.quote:

                // ensures that token adders are properly delimited.
                if (state.indexer.length === allowedMaxLength) {
                    E.throwError(idxE.requiresComma, tokenizer);
                }
                break;
        }

        switch (token.type) {
            // Extended syntax case
            case TokenTypes.openingBrace:
                routedIndexer = true;
                routed(tokenizer, token, state, out);
                break;


            case TokenTypes.token:
                var t = +token.token;
                if (isNaN(t)) {
                    E.throwError(idxE.needQuotes, tokenizer);
                }
                state.indexer[state.indexer.length] = t;
                break;

            // dotSeparators at the top level have no meaning
            case TokenTypes.dotSeparator:
                if (!state.indexer.length) {
                    E.throwError(idxE.leadingDot, tokenizer);
                }
                range(tokenizer, token, state, out);
                break;

            // Spaces do nothing.
            case TokenTypes.space:
                break;

            case TokenTypes.closingBracket:
                done = true;
                break;


            // The quotes require their own tree due to what can be in it.
            case TokenTypes.quote:
                quote(tokenizer, token, state, out);
                break;


            // Its time to decend the parse tree.
            case TokenTypes.openingBracket:
                E.throwError(idxE.nested, tokenizer);
                break;

            case TokenTypes.commaSeparator:
                ++allowedMaxLength;
                break;

            default:
                E.throwError(E.unexpectedToken, tokenizer);
                break;
        }

        // If done, leave loop
        if (done) {
            break;
        }

        // Keep cycling through the tokenizer.
        token = tokenizer.next();
    }

    if (state.indexer.length === 0) {
        E.throwError(idxE.empty, tokenizer);
    }

    if (state.indexer.length > 1 && routedIndexer) {
        E.throwError(idxE.routedTokens, tokenizer);
    }

    // Remember, if an array of 1, keySets will be generated.
    if (state.indexer.length === 1) {
        state.indexer = state.indexer[0];
    }

    out[out.length] = state.indexer;

    // Clean state.
    state.indexer = undefined;
};


},{"143":143,"144":144,"148":148,"149":149,"150":150}],148:[function(require,module,exports){
var TokenTypes = require(143);
var E = require(144);
var quoteE = E.quote;

/**
 * quote is all the parse tree in between quotes.  This includes the only
 * escaping logic.
 *
 * parse-tree:
 * <opening-quote>(.|(<escape><opening-quote>))*<opening-quote>
 */
module.exports = function quote(tokenizer, openingToken, state, out) {
    var token = tokenizer.next();
    var innerToken = '';
    var openingQuote = openingToken.token;
    var escaping = false;
    var done = false;

    while (!token.done) {

        switch (token.type) {
            case TokenTypes.token:
            case TokenTypes.space:

            case TokenTypes.dotSeparator:
            case TokenTypes.commaSeparator:

            case TokenTypes.openingBracket:
            case TokenTypes.closingBracket:
            case TokenTypes.openingBrace:
            case TokenTypes.closingBrace:
                if (escaping) {
                    E.throwError(quoteE.illegalEscape, tokenizer);
                }

                innerToken += token.token;
                break;


            case TokenTypes.quote:
                // the simple case.  We are escaping
                if (escaping) {
                    innerToken += token.token;
                    escaping = false;
                }

                // its not a quote that is the opening quote
                else if (token.token !== openingQuote) {
                    innerToken += token.token;
                }

                // last thing left.  Its a quote that is the opening quote
                // therefore we must produce the inner token of the indexer.
                else {
                    done = true;
                }

                break;
            case TokenTypes.escape:
                escaping = true;
                break;

            default:
                E.throwError(E.unexpectedToken, tokenizer);
        }

        // If done, leave loop
        if (done) {
            break;
        }

        // Keep cycling through the tokenizer.
        token = tokenizer.next();
    }

    if (innerToken.length === 0) {
        E.throwError(quoteE.empty, tokenizer);
    }

    state.indexer[state.indexer.length] = innerToken;
};


},{"143":143,"144":144}],149:[function(require,module,exports){
var Tokenizer = require(151);
var TokenTypes = require(143);
var E = require(144);

/**
 * The indexer is all the logic that happens in between
 * the '[', opening bracket, and ']' closing bracket.
 */
module.exports = function range(tokenizer, openingToken, state, out) {
    var token = tokenizer.peek();
    var dotCount = 1;
    var done = false;
    var inclusive = true;

    // Grab the last token off the stack.  Must be an integer.
    var idx = state.indexer.length - 1;
    var from = Tokenizer.toNumber(state.indexer[idx]);
    var to;

    if (isNaN(from)) {
        E.throwError(E.range.precedingNaN, tokenizer);
    }

    // Why is number checking so difficult in javascript.

    while (!done && !token.done) {

        switch (token.type) {

            // dotSeparators at the top level have no meaning
            case TokenTypes.dotSeparator:
                if (dotCount === 3) {
                    E.throwError(E.unexpectedToken, tokenizer);
                }
                ++dotCount;

                if (dotCount === 3) {
                    inclusive = false;
                }
                break;

            case TokenTypes.token:
                // move the tokenizer forward and save to.
                to = Tokenizer.toNumber(tokenizer.next().token);

                // throw potential error.
                if (isNaN(to)) {
                    E.throwError(E.range.suceedingNaN, tokenizer);
                }

                done = true;
                break;

            default:
                done = true;
                break;
        }

        // Keep cycling through the tokenizer.  But ranges have to peek
        // before they go to the next token since there is no 'terminating'
        // character.
        if (!done) {
            tokenizer.next();

            // go to the next token without consuming.
            token = tokenizer.peek();
        }

        // break and remove state information.
        else {
            break;
        }
    }

    state.indexer[idx] = {from: from, to: inclusive ? to : to - 1};
};


},{"143":143,"144":144,"151":151}],150:[function(require,module,exports){
var TokenTypes = require(143);
var RoutedTokens = require(142);
var E = require(144);
var routedE = E.routed;

/**
 * The routing logic.
 *
 * parse-tree:
 * <opening-brace><routed-token>(:<token>)<closing-brace>
 */
module.exports = function routed(tokenizer, openingToken, state, out) {
    var routeToken = tokenizer.next();
    var named = false;
    var name = '';

    // ensure the routed token is a valid ident.
    switch (routeToken.token) {
        case RoutedTokens.integers:
        case RoutedTokens.ranges:
        case RoutedTokens.keys:
            //valid
            break;
        default:
            E.throwError(routedE.invalid, tokenizer);
            break;
    }

    // Now its time for colon or ending brace.
    var next = tokenizer.next();

    // we are parsing a named identifier.
    if (next.type === TokenTypes.colon) {
        named = true;

        // Get the token name.
        next = tokenizer.next();
        if (next.type !== TokenTypes.token) {
            E.throwError(routedE.invalid, tokenizer);
        }
        name = next.token;

        // move to the closing brace.
        next = tokenizer.next();
    }

    // must close with a brace.

    if (next.type === TokenTypes.closingBrace) {
        var outputToken = {
            type: routeToken.token,
            named: named,
            name: name
        };
        state.indexer[state.indexer.length] = outputToken;
    }

    // closing brace expected
    else {
        E.throwError(routedE.invalid, tokenizer);
    }

};


},{"142":142,"143":143,"144":144}],151:[function(require,module,exports){
var TokenTypes = require(143);
var DOT_SEPARATOR = '.';
var COMMA_SEPARATOR = ',';
var OPENING_BRACKET = '[';
var CLOSING_BRACKET = ']';
var OPENING_BRACE = '{';
var CLOSING_BRACE = '}';
var COLON = ':';
var ESCAPE = '\\';
var DOUBLE_OUOTES = '"';
var SINGE_OUOTES = "'";
var SPACE = " ";
var SPECIAL_CHARACTERS = '\\\'"[]., ';
var EXT_SPECIAL_CHARACTERS = '\\{}\'"[]., :';

var Tokenizer = module.exports = function(string, ext) {
    this._string = string;
    this._idx = -1;
    this._extended = ext;
    this.parseString = '';
};

Tokenizer.prototype = {
    /**
     * grabs the next token either from the peek operation or generates the
     * next token.
     */
    next: function() {
        var nextToken = this._nextToken ?
            this._nextToken : getNext(this._string, this._idx, this._extended);

        this._idx = nextToken.idx;
        this._nextToken = false;
        this.parseString += nextToken.token.token;

        return nextToken.token;
    },

    /**
     * will peak but not increment the tokenizer
     */
    peek: function() {
        var nextToken = this._nextToken ?
            this._nextToken : getNext(this._string, this._idx, this._extended);
        this._nextToken = nextToken;

        return nextToken.token;
    }
};

Tokenizer.toNumber = function toNumber(x) {
    if (!isNaN(+x)) {
        return +x;
    }
    return NaN;
};

function toOutput(token, type, done) {
    return {
        token: token,
        done: done,
        type: type
    };
}

function getNext(string, idx, ext) {
    var output = false;
    var token = '';
    var specialChars = ext ?
        EXT_SPECIAL_CHARACTERS : SPECIAL_CHARACTERS;
    do {

        done = idx + 1 >= string.length;
        if (done) {
            break;
        }

        // we have to peek at the next token
        var character = string[idx + 1];

        if (character !== undefined &&
            specialChars.indexOf(character) === -1) {

            token += character;
            ++idx;
            continue;
        }

        // The token to delimiting character transition.
        else if (token.length) {
            break;
        }

        ++idx;
        var type;
        switch (character) {
            case DOT_SEPARATOR:
                type = TokenTypes.dotSeparator;
                break;
            case COMMA_SEPARATOR:
                type = TokenTypes.commaSeparator;
                break;
            case OPENING_BRACKET:
                type = TokenTypes.openingBracket;
                break;
            case CLOSING_BRACKET:
                type = TokenTypes.closingBracket;
                break;
            case OPENING_BRACE:
                type = TokenTypes.openingBrace;
                break;
            case CLOSING_BRACE:
                type = TokenTypes.closingBrace;
                break;
            case SPACE:
                type = TokenTypes.space;
                break;
            case DOUBLE_OUOTES:
            case SINGE_OUOTES:
                type = TokenTypes.quote;
                break;
            case ESCAPE:
                type = TokenTypes.escape;
                break;
            case COLON:
                type = TokenTypes.colon;
                break;
            default:
                type = TokenTypes.unknown;
                break;
        }
        output = toOutput(character, type, false);
        break;
    } while (!done);

    if (!output && token.length) {
        output = toOutput(token, TokenTypes.token, false);
    }

    if (!output) {
        output = {done: true};
    }

    return {
        token: output,
        idx: idx
    };
}



},{"143":143}],152:[function(require,module,exports){
'use strict';

module.exports = require(157)

},{"157":157}],153:[function(require,module,exports){
'use strict';

var asap = require(138)

function noop() {};

// States:
//
// 0 - pending
// 1 - fulfilled with _value
// 2 - rejected with _value
// 3 - adopted the state of another promise, _value
//
// once the state is no longer pending (0) it is immutable

// All `_` prefixed properties will be reduced to `_{random number}`
// at build time to obfuscate them and discourage their use.
// We don't use symbols or Object.defineProperty to fully hide them
// because the performance isn't good enough.


// to avoid using try/catch inside critical functions, we
// extract them to here.
var LAST_ERROR = null;
var IS_ERROR = {};
function getThen(obj) {
  try {
    return obj.then;
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

function tryCallOne(fn, a) {
  try {
    return fn(a);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}
function tryCallTwo(fn, a, b) {
  try {
    fn(a, b);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

module.exports = Promise;
function Promise(fn) {
  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new')
  if (typeof fn !== 'function') throw new TypeError('not a function')
  this._71 = 0;
  this._18 = null;
  this._61 = [];
  if (fn === noop) return;
  doResolve(fn, this);
}
Promise.prototype._10 = function (onFulfilled, onRejected) {
  var self = this;
  return new this.constructor(function (resolve, reject) {
    var res = new Promise(noop);
    res.then(resolve, reject);
    self._24(new Handler(onFulfilled, onRejected, res));
  });
};
Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.constructor !== Promise) return this._10(onFulfilled, onRejected);
  var res = new Promise(noop);
  this._24(new Handler(onFulfilled, onRejected, res));
  return res;
};
Promise.prototype._24 = function(deferred) {
  if (this._71 === 3) {
    this._18._24(deferred);
    return;
  }
  if (this._71 === 0) {
    this._61.push(deferred);
    return;
  }
  var state = this._71;
  var value = this._18;
  asap(function() {
    var cb = state === 1 ? deferred.onFulfilled : deferred.onRejected
    if (cb === null) {
      (state === 1 ? deferred.promise._82(value) : deferred.promise._67(value))
      return
    }
    var ret = tryCallOne(cb, value);
    if (ret === IS_ERROR) {
      deferred.promise._67(LAST_ERROR)
    } else {
      deferred.promise._82(ret)
    }
  });
};
Promise.prototype._82 = function(newValue) {
  //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  if (newValue === this) {
    return this._67(new TypeError('A promise cannot be resolved with itself.'))
  }
  if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
    var then = getThen(newValue);
    if (then === IS_ERROR) {
      return this._67(LAST_ERROR);
    }
    if (
      then === this.then &&
      newValue instanceof Promise &&
      newValue._24 === this._24
    ) {
      this._71 = 3;
      this._18 = newValue;
      for (var i = 0; i < this._61.length; i++) {
        newValue._24(this._61[i]);
      }
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), this)
      return
    }
  }
  this._71 = 1
  this._18 = newValue
  this._94()
}

Promise.prototype._67 = function (newValue) {
  this._71 = 2
  this._18 = newValue
  this._94()
}
Promise.prototype._94 = function () {
  for (var i = 0; i < this._61.length; i++)
    this._24(this._61[i])
  this._61 = null
}


function Handler(onFulfilled, onRejected, promise){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, promise) {
  var done = false;
  var res = tryCallTwo(fn, function (value) {
    if (done) return
    done = true
    promise._82(value)
  }, function (reason) {
    if (done) return
    done = true
    promise._67(reason)
  })
  if (!done && res === IS_ERROR) {
    done = true
    promise._67(LAST_ERROR)
  }
}
},{"138":138}],154:[function(require,module,exports){
'use strict';

var Promise = require(153)

module.exports = Promise
Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this
  self.then(null, function (err) {
    setTimeout(function () {
      throw err
    }, 0)
  })
}
},{"153":153}],155:[function(require,module,exports){
'use strict';

//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = require(153)
var asap = require(138)

module.exports = Promise

/* Static Functions */

function ValuePromise(value) {
  this.then = function (onFulfilled) {
    if (typeof onFulfilled !== 'function') return this
    return new Promise(function (resolve, reject) {
      asap(function () {
        try {
          resolve(onFulfilled(value))
        } catch (ex) {
          reject(ex);
        }
      })
    })
  }
}
ValuePromise.prototype = Promise.prototype

var TRUE = new ValuePromise(true)
var FALSE = new ValuePromise(false)
var NULL = new ValuePromise(null)
var UNDEFINED = new ValuePromise(undefined)
var ZERO = new ValuePromise(0)
var EMPTYSTRING = new ValuePromise('')

Promise.resolve = function (value) {
  if (value instanceof Promise) return value

  if (value === null) return NULL
  if (value === undefined) return UNDEFINED
  if (value === true) return TRUE
  if (value === false) return FALSE
  if (value === 0) return ZERO
  if (value === '') return EMPTYSTRING

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then
      if (typeof then === 'function') {
        return new Promise(then.bind(value))
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex)
      })
    }
  }

  return new ValuePromise(value)
}

Promise.all = function (arr) {
  var args = Array.prototype.slice.call(arr)

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([])
    var remaining = args.length
    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        var then = val.then
        if (typeof then === 'function') {
          then.call(val, function (val) { res(i, val) }, reject)
          return
        }
      }
      args[i] = val
      if (--remaining === 0) {
        resolve(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i])
    }
  })
}

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) { 
    reject(value);
  });
}

Promise.race = function (values) {
  return new Promise(function (resolve, reject) { 
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    })
  });
}

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
}

},{"138":138,"153":153}],156:[function(require,module,exports){
'use strict';

var Promise = require(153)

module.exports = Promise
Promise.prototype['finally'] = function (f) {
  return this.then(function (value) {
    return Promise.resolve(f()).then(function () {
      return value
    })
  }, function (err) {
    return Promise.resolve(f()).then(function () {
      throw err
    })
  })
}

},{"153":153}],157:[function(require,module,exports){
'use strict';

module.exports = require(153)
require(154)
require(156)
require(155)
require(158)

},{"153":153,"154":154,"155":155,"156":156,"158":158}],158:[function(require,module,exports){
'use strict';

//This file contains then/promise specific extensions that are only useful for node.js interop

var Promise = require(153)
var asap = require(136)

module.exports = Promise

/* Static Functions */

Promise.denodeify = function (fn, argumentCount) {
  argumentCount = argumentCount || Infinity
  return function () {
    var self = this
    var args = Array.prototype.slice.call(arguments)
    return new Promise(function (resolve, reject) {
      while (args.length && args.length > argumentCount) {
        args.pop()
      }
      args.push(function (err, res) {
        if (err) reject(err)
        else resolve(res)
      })
      var res = fn.apply(self, args)
      if (res && (typeof res === 'object' || typeof res === 'function') && typeof res.then === 'function') {
        resolve(res)
      }
    })
  }
}
Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    var callback = typeof args[args.length - 1] === 'function' ? args.pop() : null
    var ctx = this
    try {
      return fn.apply(this, arguments).nodeify(callback, ctx)
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) { reject(ex) })
      } else {
        asap(function () {
          callback.call(ctx, ex)
        })
      }
    }
  }
}

Promise.prototype.nodeify = function (callback, ctx) {
  if (typeof callback != 'function') return this

  this.then(function (value) {
    asap(function () {
      callback.call(ctx, null, value)
    })
  }, function (err) {
    asap(function () {
      callback.call(ctx, err)
    })
  })
}

},{"136":136,"153":153}],159:[function(require,module,exports){
(function (global){
// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. See License.txt in the project root for license information.

;(function (factory) {
    var objectTypes = {
        'boolean': false,
        'function': true,
        'object': true,
        'number': false,
        'string': false,
        'undefined': false
    };

    var root = (objectTypes[typeof window] && window) || this,
        freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports,
        freeModule = objectTypes[typeof module] && module && !module.nodeType && module,
        moduleExports = freeModule && freeModule.exports === freeExports && freeExports,
        freeGlobal = objectTypes[typeof global] && global;

    if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
        root = freeGlobal;
    }

    // Because of build optimizers
    if (typeof define === 'function' && define.amd) {
        define(['rx'], function (Rx, exports) {
            return factory(root, exports, Rx);
        });
    } else if (typeof module === 'object' && module && module.exports === freeExports) {
        module.exports = factory(root, module.exports, require(161));
    } else {
        root.Rx = factory(root, {}, root.Rx);
    }
}.call(this, function (root, exp, Rx, undefined) {

  // References
  var Observable = Rx.Observable,
    observableProto = Observable.prototype,
    CompositeDisposable = Rx.CompositeDisposable,
    AnonymousObservable = Rx.AnonymousObservable,
    disposableEmpty = Rx.Disposable.empty,
    isEqual = Rx.internals.isEqual,
    helpers = Rx.helpers,
    not = helpers.not,
    defaultComparer = helpers.defaultComparer,
    identity = helpers.identity,
    defaultSubComparer = helpers.defaultSubComparer,
    isFunction = helpers.isFunction,
    isPromise = helpers.isPromise,
    isArrayLike = helpers.isArrayLike,
    isIterable = helpers.isIterable,
    inherits = Rx.internals.inherits,
    observableFromPromise = Observable.fromPromise,
    observableFrom = Observable.from,
    bindCallback = Rx.internals.bindCallback,
    EmptyError = Rx.EmptyError,
    ObservableBase = Rx.ObservableBase,
    ArgumentOutOfRangeError = Rx.ArgumentOutOfRangeError;

  var errorObj = {e: {}};
  var tryCatchTarget;
  function tryCatcher() {
    try {
      return tryCatchTarget.apply(this, arguments);
    } catch (e) {
      errorObj.e = e;
      return errorObj;
    }
  }
  function tryCatch(fn) {
    if (!isFunction(fn)) { throw new TypeError('fn must be a function'); }
    tryCatchTarget = fn;
    return tryCatcher;
  }
  function thrower(e) {
    throw e;
  }

  function extremaBy(source, keySelector, comparer) {
    return new AnonymousObservable(function (o) {
      var hasValue = false, lastKey = null, list = [];
      return source.subscribe(function (x) {
        var comparison, key;
        try {
          key = keySelector(x);
        } catch (ex) {
          o.onError(ex);
          return;
        }
        comparison = 0;
        if (!hasValue) {
          hasValue = true;
          lastKey = key;
        } else {
          try {
            comparison = comparer(key, lastKey);
          } catch (ex1) {
            o.onError(ex1);
            return;
          }
        }
        if (comparison > 0) {
          lastKey = key;
          list = [];
        }
        if (comparison >= 0) { list.push(x); }
      }, function (e) { o.onError(e); }, function () {
        o.onNext(list);
        o.onCompleted();
      });
    }, source);
  }

  function firstOnly(x) {
    if (x.length === 0) { throw new EmptyError(); }
    return x[0];
  }

  /**
   * Applies an accumulator function over an observable sequence, returning the result of the aggregation as a single element in the result sequence. The specified seed value is used as the initial accumulator value.
   * For aggregation behavior with incremental intermediate results, see Observable.scan.
   * @deprecated Use #reduce instead
   * @param {Mixed} [seed] The initial accumulator value.
   * @param {Function} accumulator An accumulator function to be invoked on each element.
   * @returns {Observable} An observable sequence containing a single element with the final accumulator value.
   */
  observableProto.aggregate = function () {
    var hasSeed = false, accumulator, seed, source = this;
    if (arguments.length === 2) {
      hasSeed = true;
      seed = arguments[0];
      accumulator = arguments[1];
    } else {
      accumulator = arguments[0];
    }
    return new AnonymousObservable(function (o) {
      var hasAccumulation, accumulation, hasValue;
      return source.subscribe (
        function (x) {
          !hasValue && (hasValue = true);
          try {
            if (hasAccumulation) {
              accumulation = accumulator(accumulation, x);
            } else {
              accumulation = hasSeed ? accumulator(seed, x) : x;
              hasAccumulation = true;
            }
          } catch (e) {
            return o.onError(e);
          }
        },
        function (e) { o.onError(e); },
        function () {
          hasValue && o.onNext(accumulation);
          !hasValue && hasSeed && o.onNext(seed);
          !hasValue && !hasSeed && o.onError(new EmptyError());
          o.onCompleted();
        }
      );
    }, source);
  };

  var ReduceObservable = (function(__super__) {
    inherits(ReduceObservable, __super__);
    function ReduceObservable(source, acc, hasSeed, seed) {
      this.source = source;
      this.acc = acc;
      this.hasSeed = hasSeed;
      this.seed = seed;
      __super__.call(this);
    }

    ReduceObservable.prototype.subscribeCore = function(observer) {
      return this.source.subscribe(new InnerObserver(observer,this));
    };

    function InnerObserver(o, parent) {
      this.o = o;
      this.acc = parent.acc;
      this.hasSeed = parent.hasSeed;
      this.seed = parent.seed;
      this.hasAccumulation = false;
      this.result = null;
      this.hasValue = false;
      this.isStopped = false;
    }
    InnerObserver.prototype.onNext = function (x) {
      if (this.isStopped) { return; }
      !this.hasValue && (this.hasValue = true);
      if (this.hasAccumulation) {
        this.result = tryCatch(this.acc)(this.result, x);
      } else {
        this.result = this.hasSeed ? tryCatch(this.acc)(this.seed, x) : x;
        this.hasAccumulation = true;
      }
      if (this.result === errorObj) { this.o.onError(this.result.e); }
    };
    InnerObserver.prototype.onError = function (e) { 
      if (!this.isStopped) { this.isStopped = true; this.o.onError(e); } 
    };
    InnerObserver.prototype.onCompleted = function () {
      if (!this.isStopped) {
        this.isStopped = true;
        this.hasValue && this.o.onNext(this.result);
        !this.hasValue && this.hasSeed && this.o.onNext(this.seed);
        !this.hasValue && !this.hasSeed && this.o.onError(new EmptyError());
        this.o.onCompleted();
      }
    };
    InnerObserver.prototype.dispose = function () { this.isStopped = true; };
    InnerObserver.prototype.fail = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
        return true;
      }
      return false;
    };

    return ReduceObservable;
  }(ObservableBase));

  /**
  * Applies an accumulator function over an observable sequence, returning the result of the aggregation as a single element in the result sequence. The specified seed value is used as the initial accumulator value.
  * For aggregation behavior with incremental intermediate results, see Observable.scan.
  * @param {Function} accumulator An accumulator function to be invoked on each element.
  * @param {Any} [seed] The initial accumulator value.
  * @returns {Observable} An observable sequence containing a single element with the final accumulator value.
  */
  observableProto.reduce = function (accumulator) {
    var hasSeed = false;
    if (arguments.length === 2) {
      hasSeed = true;
      var seed = arguments[1];
    }
    return new ReduceObservable(this, accumulator, hasSeed, seed);
  };

  /**
   * Determines whether any element of an observable sequence satisfies a condition if present, else if any items are in the sequence.
   * @param {Function} [predicate] A function to test each element for a condition.
   * @returns {Observable} An observable sequence containing a single element determining whether any elements in the source sequence pass the test in the specified predicate if given, else if any items are in the sequence.
   */
  observableProto.some = function (predicate, thisArg) {
    var source = this;
    return predicate ?
      source.filter(predicate, thisArg).some() :
      new AnonymousObservable(function (observer) {
        return source.subscribe(function () {
          observer.onNext(true);
          observer.onCompleted();
        }, function (e) { observer.onError(e); }, function () {
          observer.onNext(false);
          observer.onCompleted();
        });
      }, source);
  };

  /** @deprecated use #some instead */
  observableProto.any = function () {
    //deprecate('any', 'some');
    return this.some.apply(this, arguments);
  };

  /**
   * Determines whether an observable sequence is empty.
   * @returns {Observable} An observable sequence containing a single element determining whether the source sequence is empty.
   */
  observableProto.isEmpty = function () {
    return this.any().map(not);
  };

  /**
   * Determines whether all elements of an observable sequence satisfy a condition.
   * @param {Function} [predicate] A function to test each element for a condition.
   * @param {Any} [thisArg] Object to use as this when executing callback.
   * @returns {Observable} An observable sequence containing a single element determining whether all elements in the source sequence pass the test in the specified predicate.
   */
  observableProto.every = function (predicate, thisArg) {
    return this.filter(function (v) { return !predicate(v); }, thisArg).some().map(not);
  };

  /** @deprecated use #every instead */
  observableProto.all = function () {
    //deprecate('all', 'every');
    return this.every.apply(this, arguments);
  };

  /**
   * Determines whether an observable sequence includes a specified element with an optional equality comparer.
   * @param searchElement The value to locate in the source sequence.
   * @param {Number} [fromIndex] An equality comparer to compare elements.
   * @returns {Observable} An observable sequence containing a single element determining whether the source sequence includes an element that has the specified value from the given index.
   */
  observableProto.includes = function (searchElement, fromIndex) {
    var source = this;
    function comparer(a, b) {
      return (a === 0 && b === 0) || (a === b || (isNaN(a) && isNaN(b)));
    }
    return new AnonymousObservable(function (o) {
      var i = 0, n = +fromIndex || 0;
      Math.abs(n) === Infinity && (n = 0);
      if (n < 0) {
        o.onNext(false);
        o.onCompleted();
        return disposableEmpty;
      }
      return source.subscribe(
        function (x) {
          if (i++ >= n && comparer(x, searchElement)) {
            o.onNext(true);
            o.onCompleted();
          }
        },
        function (e) { o.onError(e); },
        function () {
          o.onNext(false);
          o.onCompleted();
        });
    }, this);
  };

  /**
   * @deprecated use #includes instead.
   */
  observableProto.contains = function (searchElement, fromIndex) {
    //deprecate('contains', 'includes');
    observableProto.includes(searchElement, fromIndex);
  };

  /**
   * Returns an observable sequence containing a value that represents how many elements in the specified observable sequence satisfy a condition if provided, else the count of items.
   * @example
   * res = source.count();
   * res = source.count(function (x) { return x > 3; });
   * @param {Function} [predicate]A function to test each element for a condition.
   * @param {Any} [thisArg] Object to use as this when executing callback.
   * @returns {Observable} An observable sequence containing a single element with a number that represents how many elements in the input sequence satisfy the condition in the predicate function if provided, else the count of items in the sequence.
   */
  observableProto.count = function (predicate, thisArg) {
    return predicate ?
      this.filter(predicate, thisArg).count() :
      this.reduce(function (count) { return count + 1; }, 0);
  };

  /**
   * Returns the first index at which a given element can be found in the observable sequence, or -1 if it is not present.
   * @param {Any} searchElement Element to locate in the array.
   * @param {Number} [fromIndex] The index to start the search.  If not specified, defaults to 0.
   * @returns {Observable} And observable sequence containing the first index at which a given element can be found in the observable sequence, or -1 if it is not present.
   */
  observableProto.indexOf = function(searchElement, fromIndex) {
    var source = this;
    return new AnonymousObservable(function (o) {
      var i = 0, n = +fromIndex || 0;
      Math.abs(n) === Infinity && (n = 0);
      if (n < 0) {
        o.onNext(-1);
        o.onCompleted();
        return disposableEmpty;
      }
      return source.subscribe(
        function (x) {
          if (i >= n && x === searchElement) {
            o.onNext(i);
            o.onCompleted();
          }
          i++;
        },
        function (e) { o.onError(e); },
        function () {
          o.onNext(-1);
          o.onCompleted();
        });
    }, source);
  };

  /**
   * Computes the sum of a sequence of values that are obtained by invoking an optional transform function on each element of the input sequence, else if not specified computes the sum on each item in the sequence.
   * @param {Function} [selector] A transform function to apply to each element.
   * @param {Any} [thisArg] Object to use as this when executing callback.
   * @returns {Observable} An observable sequence containing a single element with the sum of the values in the source sequence.
   */
  observableProto.sum = function (keySelector, thisArg) {
    return keySelector && isFunction(keySelector) ?
      this.map(keySelector, thisArg).sum() :
      this.reduce(function (prev, curr) { return prev + curr; }, 0);
  };

  /**
   * Returns the elements in an observable sequence with the minimum key value according to the specified comparer.
   * @example
   * var res = source.minBy(function (x) { return x.value; });
   * var res = source.minBy(function (x) { return x.value; }, function (x, y) { return x - y; });
   * @param {Function} keySelector Key selector function.
   * @param {Function} [comparer] Comparer used to compare key values.
   * @returns {Observable} An observable sequence containing a list of zero or more elements that have a minimum key value.
   */
  observableProto.minBy = function (keySelector, comparer) {
    comparer || (comparer = defaultSubComparer);
    return extremaBy(this, keySelector, function (x, y) { return comparer(x, y) * -1; });
  };

  /**
   * Returns the minimum element in an observable sequence according to the optional comparer else a default greater than less than check.
   * @example
   * var res = source.min();
   * var res = source.min(function (x, y) { return x.value - y.value; });
   * @param {Function} [comparer] Comparer used to compare elements.
   * @returns {Observable} An observable sequence containing a single element with the minimum element in the source sequence.
   */
  observableProto.min = function (comparer) {
    return this.minBy(identity, comparer).map(function (x) { return firstOnly(x); });
  };

  /**
   * Returns the elements in an observable sequence with the maximum  key value according to the specified comparer.
   * @example
   * var res = source.maxBy(function (x) { return x.value; });
   * var res = source.maxBy(function (x) { return x.value; }, function (x, y) { return x - y;; });
   * @param {Function} keySelector Key selector function.
   * @param {Function} [comparer]  Comparer used to compare key values.
   * @returns {Observable} An observable sequence containing a list of zero or more elements that have a maximum key value.
   */
  observableProto.maxBy = function (keySelector, comparer) {
    comparer || (comparer = defaultSubComparer);
    return extremaBy(this, keySelector, comparer);
  };

  /**
   * Returns the maximum value in an observable sequence according to the specified comparer.
   * @example
   * var res = source.max();
   * var res = source.max(function (x, y) { return x.value - y.value; });
   * @param {Function} [comparer] Comparer used to compare elements.
   * @returns {Observable} An observable sequence containing a single element with the maximum element in the source sequence.
   */
  observableProto.max = function (comparer) {
    return this.maxBy(identity, comparer).map(function (x) { return firstOnly(x); });
  };

  /**
   * Computes the average of an observable sequence of values that are in the sequence or obtained by invoking a transform function on each element of the input sequence if present.
   * @param {Function} [selector] A transform function to apply to each element.
   * @param {Any} [thisArg] Object to use as this when executing callback.
   * @returns {Observable} An observable sequence containing a single element with the average of the sequence of values.
   */
  observableProto.average = function (keySelector, thisArg) {
    return keySelector && isFunction(keySelector) ?
      this.map(keySelector, thisArg).average() :
      this.reduce(function (prev, cur) {
        return {
          sum: prev.sum + cur,
          count: prev.count + 1
        };
      }, {sum: 0, count: 0 }).map(function (s) {
        if (s.count === 0) { throw new EmptyError(); }
        return s.sum / s.count;
      });
  };

  /**
   *  Determines whether two sequences are equal by comparing the elements pairwise using a specified equality comparer.
   *
   * @example
   * var res = res = source.sequenceEqual([1,2,3]);
   * var res = res = source.sequenceEqual([{ value: 42 }], function (x, y) { return x.value === y.value; });
   * 3 - res = source.sequenceEqual(Rx.Observable.returnValue(42));
   * 4 - res = source.sequenceEqual(Rx.Observable.returnValue({ value: 42 }), function (x, y) { return x.value === y.value; });
   * @param {Observable} second Second observable sequence or array to compare.
   * @param {Function} [comparer] Comparer used to compare elements of both sequences.
   * @returns {Observable} An observable sequence that contains a single element which indicates whether both sequences are of equal length and their corresponding elements are equal according to the specified equality comparer.
   */
  observableProto.sequenceEqual = function (second, comparer) {
    var first = this;
    comparer || (comparer = defaultComparer);
    return new AnonymousObservable(function (o) {
      var donel = false, doner = false, ql = [], qr = [];
      var subscription1 = first.subscribe(function (x) {
        var equal, v;
        if (qr.length > 0) {
          v = qr.shift();
          try {
            equal = comparer(v, x);
          } catch (e) {
            o.onError(e);
            return;
          }
          if (!equal) {
            o.onNext(false);
            o.onCompleted();
          }
        } else if (doner) {
          o.onNext(false);
          o.onCompleted();
        } else {
          ql.push(x);
        }
      }, function(e) { o.onError(e); }, function () {
        donel = true;
        if (ql.length === 0) {
          if (qr.length > 0) {
            o.onNext(false);
            o.onCompleted();
          } else if (doner) {
            o.onNext(true);
            o.onCompleted();
          }
        }
      });

      (isArrayLike(second) || isIterable(second)) && (second = observableFrom(second));
      isPromise(second) && (second = observableFromPromise(second));
      var subscription2 = second.subscribe(function (x) {
        var equal;
        if (ql.length > 0) {
          var v = ql.shift();
          try {
            equal = comparer(v, x);
          } catch (exception) {
            o.onError(exception);
            return;
          }
          if (!equal) {
            o.onNext(false);
            o.onCompleted();
          }
        } else if (donel) {
          o.onNext(false);
          o.onCompleted();
        } else {
          qr.push(x);
        }
      }, function(e) { o.onError(e); }, function () {
        doner = true;
        if (qr.length === 0) {
          if (ql.length > 0) {
            o.onNext(false);
            o.onCompleted();
          } else if (donel) {
            o.onNext(true);
            o.onCompleted();
          }
        }
      });
      return new CompositeDisposable(subscription1, subscription2);
    }, first);
  };

  function elementAtOrDefault(source, index, hasDefault, defaultValue) {
    if (index < 0) { throw new ArgumentOutOfRangeError(); }
    return new AnonymousObservable(function (o) {
      var i = index;
      return source.subscribe(function (x) {
        if (i-- === 0) {
          o.onNext(x);
          o.onCompleted();
        }
      }, function (e) { o.onError(e); }, function () {
        if (!hasDefault) {
          o.onError(new ArgumentOutOfRangeError());
        } else {
          o.onNext(defaultValue);
          o.onCompleted();
        }
      });
    }, source);
  }

  /**
   * Returns the element at a specified index in a sequence.
   * @example
   * var res = source.elementAt(5);
   * @param {Number} index The zero-based index of the element to retrieve.
   * @returns {Observable} An observable sequence that produces the element at the specified position in the source sequence.
   */
  observableProto.elementAt =  function (index) {
    return elementAtOrDefault(this, index, false);
  };

  /**
   * Returns the element at a specified index in a sequence or a default value if the index is out of range.
   * @example
   * var res = source.elementAtOrDefault(5);
   * var res = source.elementAtOrDefault(5, 0);
   * @param {Number} index The zero-based index of the element to retrieve.
   * @param [defaultValue] The default value if the index is outside the bounds of the source sequence.
   * @returns {Observable} An observable sequence that produces the element at the specified position in the source sequence, or a default value if the index is outside the bounds of the source sequence.
   */
  observableProto.elementAtOrDefault = function (index, defaultValue) {
    return elementAtOrDefault(this, index, true, defaultValue);
  };

  function singleOrDefaultAsync(source, hasDefault, defaultValue) {
    return new AnonymousObservable(function (o) {
      var value = defaultValue, seenValue = false;
      return source.subscribe(function (x) {
        if (seenValue) {
          o.onError(new Error('Sequence contains more than one element'));
        } else {
          value = x;
          seenValue = true;
        }
      }, function (e) { o.onError(e); }, function () {
        if (!seenValue && !hasDefault) {
          o.onError(new EmptyError());
        } else {
          o.onNext(value);
          o.onCompleted();
        }
      });
    }, source);
  }

  /**
   * Returns the only element of an observable sequence that satisfies the condition in the optional predicate, and reports an exception if there is not exactly one element in the observable sequence.
   * @param {Function} [predicate] A predicate function to evaluate for elements in the source sequence.
   * @param {Any} [thisArg] Object to use as `this` when executing the predicate.
   * @returns {Observable} Sequence containing the single element in the observable sequence that satisfies the condition in the predicate.
   */
  observableProto.single = function (predicate, thisArg) {
    return predicate && isFunction(predicate) ?
      this.where(predicate, thisArg).single() :
      singleOrDefaultAsync(this, false);
  };

  /**
   * Returns the only element of an observable sequence that matches the predicate, or a default value if no such element exists; this method reports an exception if there is more than one element in the observable sequence.
   * @example
   * var res = res = source.singleOrDefault();
   * var res = res = source.singleOrDefault(function (x) { return x === 42; });
   * res = source.singleOrDefault(function (x) { return x === 42; }, 0);
   * res = source.singleOrDefault(null, 0);
   * @memberOf Observable#
   * @param {Function} predicate A predicate function to evaluate for elements in the source sequence.
   * @param [defaultValue] The default value if the index is outside the bounds of the source sequence.
   * @param {Any} [thisArg] Object to use as `this` when executing the predicate.
   * @returns {Observable} Sequence containing the single element in the observable sequence that satisfies the condition in the predicate, or a default value if no such element exists.
   */
  observableProto.singleOrDefault = function (predicate, defaultValue, thisArg) {
    return predicate && isFunction(predicate) ?
      this.filter(predicate, thisArg).singleOrDefault(null, defaultValue) :
      singleOrDefaultAsync(this, true, defaultValue);
  };

  function firstOrDefaultAsync(source, hasDefault, defaultValue) {
    return new AnonymousObservable(function (o) {
      return source.subscribe(function (x) {
        o.onNext(x);
        o.onCompleted();
      }, function (e) { o.onError(e); }, function () {
        if (!hasDefault) {
          o.onError(new EmptyError());
        } else {
          o.onNext(defaultValue);
          o.onCompleted();
        }
      });
    }, source);
  }

  /**
   * Returns the first element of an observable sequence that satisfies the condition in the predicate if present else the first item in the sequence.
   * @example
   * var res = res = source.first();
   * var res = res = source.first(function (x) { return x > 3; });
   * @param {Function} [predicate] A predicate function to evaluate for elements in the source sequence.
   * @param {Any} [thisArg] Object to use as `this` when executing the predicate.
   * @returns {Observable} Sequence containing the first element in the observable sequence that satisfies the condition in the predicate if provided, else the first item in the sequence.
   */
  observableProto.first = function (predicate, thisArg) {
    return predicate ?
      this.where(predicate, thisArg).first() :
      firstOrDefaultAsync(this, false);
  };

  /**
   * Returns the first element of an observable sequence that satisfies the condition in the predicate, or a default value if no such element exists.
   * @param {Function} [predicate] A predicate function to evaluate for elements in the source sequence.
   * @param {Any} [defaultValue] The default value if no such element exists.  If not specified, defaults to null.
   * @param {Any} [thisArg] Object to use as `this` when executing the predicate.
   * @returns {Observable} Sequence containing the first element in the observable sequence that satisfies the condition in the predicate, or a default value if no such element exists.
   */
  observableProto.firstOrDefault = function (predicate, defaultValue, thisArg) {
    return predicate ?
      this.where(predicate).firstOrDefault(null, defaultValue) :
      firstOrDefaultAsync(this, true, defaultValue);
  };

  function lastOrDefaultAsync(source, hasDefault, defaultValue) {
    return new AnonymousObservable(function (o) {
      var value = defaultValue, seenValue = false;
      return source.subscribe(function (x) {
        value = x;
        seenValue = true;
      }, function (e) { o.onError(e); }, function () {
        if (!seenValue && !hasDefault) {
          o.onError(new EmptyError());
        } else {
          o.onNext(value);
          o.onCompleted();
        }
      });
    }, source);
  }

  /**
   * Returns the last element of an observable sequence that satisfies the condition in the predicate if specified, else the last element.
   * @param {Function} [predicate] A predicate function to evaluate for elements in the source sequence.
   * @param {Any} [thisArg] Object to use as `this` when executing the predicate.
   * @returns {Observable} Sequence containing the last element in the observable sequence that satisfies the condition in the predicate.
   */
  observableProto.last = function (predicate, thisArg) {
    return predicate ?
      this.where(predicate, thisArg).last() :
      lastOrDefaultAsync(this, false);
  };

  /**
   * Returns the last element of an observable sequence that satisfies the condition in the predicate, or a default value if no such element exists.
   * @param {Function} [predicate] A predicate function to evaluate for elements in the source sequence.
   * @param [defaultValue] The default value if no such element exists.  If not specified, defaults to null.
   * @param {Any} [thisArg] Object to use as `this` when executing the predicate.
   * @returns {Observable} Sequence containing the last element in the observable sequence that satisfies the condition in the predicate, or a default value if no such element exists.
   */
  observableProto.lastOrDefault = function (predicate, defaultValue, thisArg) {
    return predicate ?
      this.where(predicate, thisArg).lastOrDefault(null, defaultValue) :
      lastOrDefaultAsync(this, true, defaultValue);
  };

  function findValue (source, predicate, thisArg, yieldIndex) {
    var callback = bindCallback(predicate, thisArg, 3);
    return new AnonymousObservable(function (o) {
      var i = 0;
      return source.subscribe(function (x) {
        var shouldRun;
        try {
          shouldRun = callback(x, i, source);
        } catch (e) {
          o.onError(e);
          return;
        }
        if (shouldRun) {
          o.onNext(yieldIndex ? i : x);
          o.onCompleted();
        } else {
          i++;
        }
      }, function (e) { o.onError(e); }, function () {
        o.onNext(yieldIndex ? -1 : undefined);
        o.onCompleted();
      });
    }, source);
  }

  /**
   * Searches for an element that matches the conditions defined by the specified predicate, and returns the first occurrence within the entire Observable sequence.
   * @param {Function} predicate The predicate that defines the conditions of the element to search for.
   * @param {Any} [thisArg] Object to use as `this` when executing the predicate.
   * @returns {Observable} An Observable sequence with the first element that matches the conditions defined by the specified predicate, if found; otherwise, undefined.
   */
  observableProto.find = function (predicate, thisArg) {
    return findValue(this, predicate, thisArg, false);
  };

  /**
   * Searches for an element that matches the conditions defined by the specified predicate, and returns
   * an Observable sequence with the zero-based index of the first occurrence within the entire Observable sequence.
   * @param {Function} predicate The predicate that defines the conditions of the element to search for.
   * @param {Any} [thisArg] Object to use as `this` when executing the predicate.
   * @returns {Observable} An Observable sequence with the zero-based index of the first occurrence of an element that matches the conditions defined by match, if found; otherwise, –1.
  */
  observableProto.findIndex = function (predicate, thisArg) {
    return findValue(this, predicate, thisArg, true);
  };

  /**
   * Converts the observable sequence to a Set if it exists.
   * @returns {Observable} An observable sequence with a single value of a Set containing the values from the observable sequence.
   */
  observableProto.toSet = function () {
    if (typeof root.Set === 'undefined') { throw new TypeError(); }
    var source = this;
    return new AnonymousObservable(function (o) {
      var s = new root.Set();
      return source.subscribe(
        function (x) { s.add(x); },
        function (e) { o.onError(e); },
        function () {
          o.onNext(s);
          o.onCompleted();
        });
    }, source);
  };

  /**
  * Converts the observable sequence to a Map if it exists.
  * @param {Function} keySelector A function which produces the key for the Map.
  * @param {Function} [elementSelector] An optional function which produces the element for the Map. If not present, defaults to the value from the observable sequence.
  * @returns {Observable} An observable sequence with a single value of a Map containing the values from the observable sequence.
  */
  observableProto.toMap = function (keySelector, elementSelector) {
    if (typeof root.Map === 'undefined') { throw new TypeError(); }
    var source = this;
    return new AnonymousObservable(function (o) {
      var m = new root.Map();
      return source.subscribe(
        function (x) {
          var key;
          try {
            key = keySelector(x);
          } catch (e) {
            o.onError(e);
            return;
          }

          var element = x;
          if (elementSelector) {
            try {
              element = elementSelector(x);
            } catch (e) {
              o.onError(e);
              return;
            }
          }

          m.set(key, element);
        },
        function (e) { o.onError(e); },
        function () {
          o.onNext(m);
          o.onCompleted();
        });
    }, source);
  };

    return Rx;
}));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"161":161}],160:[function(require,module,exports){
(function (global){
// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. See License.txt in the project root for license information.

;(function (factory) {
    var objectTypes = {
        'boolean': false,
        'function': true,
        'object': true,
        'number': false,
        'string': false,
        'undefined': false
    };

    var root = (objectTypes[typeof window] && window) || this,
        freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports,
        freeModule = objectTypes[typeof module] && module && !module.nodeType && module,
        moduleExports = freeModule && freeModule.exports === freeExports && freeExports,
        freeGlobal = objectTypes[typeof global] && global;

    if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
        root = freeGlobal;
    }

    // Because of build optimizers
    if (typeof define === 'function' && define.amd) {
        define(['rx'], function (Rx, exports) {
            return factory(root, exports, Rx);
        });
    } else if (typeof module === 'object' && module && module.exports === freeExports) {
        module.exports = factory(root, module.exports, require(161));
    } else {
        root.Rx = factory(root, {}, root.Rx);
    }
}.call(this, function (root, exp, Rx, undefined) {

  var Observable = Rx.Observable,
    observableProto = Observable.prototype,
    AnonymousObservable = Rx.AnonymousObservable,
    Subject = Rx.Subject,
    AsyncSubject = Rx.AsyncSubject,
    Observer = Rx.Observer,
    ScheduledObserver = Rx.internals.ScheduledObserver,
    disposableCreate = Rx.Disposable.create,
    disposableEmpty = Rx.Disposable.empty,
    CompositeDisposable = Rx.CompositeDisposable,
    currentThreadScheduler = Rx.Scheduler.currentThread,
    isFunction = Rx.helpers.isFunction,
    inherits = Rx.internals.inherits,
    addProperties = Rx.internals.addProperties,
    checkDisposed = Rx.Disposable.checkDisposed;

  // Utilities
  function cloneArray(arr) {
    var len = arr.length, a = new Array(len);
    for(var i = 0; i < len; i++) { a[i] = arr[i]; }
    return a;
  }

  /**
   * Multicasts the source sequence notifications through an instantiated subject into all uses of the sequence within a selector function. Each
   * subscription to the resulting sequence causes a separate multicast invocation, exposing the sequence resulting from the selector function's
   * invocation. For specializations with fixed subject types, see Publish, PublishLast, and Replay.
   *
   * @example
   * 1 - res = source.multicast(observable);
   * 2 - res = source.multicast(function () { return new Subject(); }, function (x) { return x; });
   *
   * @param {Function|Subject} subjectOrSubjectSelector
   * Factory function to create an intermediate subject through which the source sequence's elements will be multicast to the selector function.
   * Or:
   * Subject to push source elements into.
   *
   * @param {Function} [selector] Optional selector function which can use the multicasted source sequence subject to the policies enforced by the created subject. Specified only if <paramref name="subjectOrSubjectSelector" is a factory function.
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
   */
  observableProto.multicast = function (subjectOrSubjectSelector, selector) {
    var source = this;
    return typeof subjectOrSubjectSelector === 'function' ?
      new AnonymousObservable(function (observer) {
        var connectable = source.multicast(subjectOrSubjectSelector());
        return new CompositeDisposable(selector(connectable).subscribe(observer), connectable.connect());
      }, source) :
      new ConnectableObservable(source, subjectOrSubjectSelector);
  };

  /**
   * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence.
   * This operator is a specialization of Multicast using a regular Subject.
   *
   * @example
   * var resres = source.publish();
   * var res = source.publish(function (x) { return x; });
   *
   * @param {Function} [selector] Selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will receive all notifications of the source from the time of the subscription on.
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
   */
  observableProto.publish = function (selector) {
    return selector && isFunction(selector) ?
      this.multicast(function () { return new Subject(); }, selector) :
      this.multicast(new Subject());
  };

  /**
   * Returns an observable sequence that shares a single subscription to the underlying sequence.
   * This operator is a specialization of publish which creates a subscription when the number of observers goes from zero to one, then shares that subscription with all subsequent observers until the number of observers returns to zero, at which point the subscription is disposed.
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence.
   */
  observableProto.share = function () {
    return this.publish().refCount();
  };

  /**
   * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence containing only the last notification.
   * This operator is a specialization of Multicast using a AsyncSubject.
   *
   * @example
   * var res = source.publishLast();
   * var res = source.publishLast(function (x) { return x; });
   *
   * @param selector [Optional] Selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will only receive the last notification of the source.
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
   */
  observableProto.publishLast = function (selector) {
    return selector && isFunction(selector) ?
      this.multicast(function () { return new AsyncSubject(); }, selector) :
      this.multicast(new AsyncSubject());
  };

  /**
   * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence and starts with initialValue.
   * This operator is a specialization of Multicast using a BehaviorSubject.
   *
   * @example
   * var res = source.publishValue(42);
   * var res = source.publishValue(function (x) { return x.select(function (y) { return y * y; }) }, 42);
   *
   * @param {Function} [selector] Optional selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will receive immediately receive the initial value, followed by all notifications of the source from the time of the subscription on.
   * @param {Mixed} initialValue Initial value received by observers upon subscription.
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
   */
  observableProto.publishValue = function (initialValueOrSelector, initialValue) {
    return arguments.length === 2 ?
      this.multicast(function () {
        return new BehaviorSubject(initialValue);
      }, initialValueOrSelector) :
      this.multicast(new BehaviorSubject(initialValueOrSelector));
  };

  /**
   * Returns an observable sequence that shares a single subscription to the underlying sequence and starts with an initialValue.
   * This operator is a specialization of publishValue which creates a subscription when the number of observers goes from zero to one, then shares that subscription with all subsequent observers until the number of observers returns to zero, at which point the subscription is disposed.
   * @param {Mixed} initialValue Initial value received by observers upon subscription.
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence.
   */
  observableProto.shareValue = function (initialValue) {
    return this.publishValue(initialValue).refCount();
  };

  /**
   * Returns an observable sequence that is the result of invoking the selector on a connectable observable sequence that shares a single subscription to the underlying sequence replaying notifications subject to a maximum time length for the replay buffer.
   * This operator is a specialization of Multicast using a ReplaySubject.
   *
   * @example
   * var res = source.replay(null, 3);
   * var res = source.replay(null, 3, 500);
   * var res = source.replay(null, 3, 500, scheduler);
   * var res = source.replay(function (x) { return x.take(6).repeat(); }, 3, 500, scheduler);
   *
   * @param selector [Optional] Selector function which can use the multicasted source sequence as many times as needed, without causing multiple subscriptions to the source sequence. Subscribers to the given source will receive all the notifications of the source subject to the specified replay buffer trimming policy.
   * @param bufferSize [Optional] Maximum element count of the replay buffer.
   * @param windowSize [Optional] Maximum time length of the replay buffer.
   * @param scheduler [Optional] Scheduler where connected observers within the selector function will be invoked on.
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence within a selector function.
   */
  observableProto.replay = function (selector, bufferSize, windowSize, scheduler) {
    return selector && isFunction(selector) ?
      this.multicast(function () { return new ReplaySubject(bufferSize, windowSize, scheduler); }, selector) :
      this.multicast(new ReplaySubject(bufferSize, windowSize, scheduler));
  };

  /**
   * Returns an observable sequence that shares a single subscription to the underlying sequence replaying notifications subject to a maximum time length for the replay buffer.
   * This operator is a specialization of replay which creates a subscription when the number of observers goes from zero to one, then shares that subscription with all subsequent observers until the number of observers returns to zero, at which point the subscription is disposed.
   *
   * @example
   * var res = source.shareReplay(3);
   * var res = source.shareReplay(3, 500);
   * var res = source.shareReplay(3, 500, scheduler);
   *

   * @param bufferSize [Optional] Maximum element count of the replay buffer.
   * @param window [Optional] Maximum time length of the replay buffer.
   * @param scheduler [Optional] Scheduler where connected observers within the selector function will be invoked on.
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source sequence.
   */
  observableProto.shareReplay = function (bufferSize, windowSize, scheduler) {
    return this.replay(null, bufferSize, windowSize, scheduler).refCount();
  };

  var InnerSubscription = function (subject, observer) {
    this.subject = subject;
    this.observer = observer;
  };

  InnerSubscription.prototype.dispose = function () {
    if (!this.subject.isDisposed && this.observer !== null) {
      var idx = this.subject.observers.indexOf(this.observer);
      this.subject.observers.splice(idx, 1);
      this.observer = null;
    }
  };

  /**
   *  Represents a value that changes over time.
   *  Observers can subscribe to the subject to receive the last (or initial) value and all subsequent notifications.
   */
  var BehaviorSubject = Rx.BehaviorSubject = (function (__super__) {
    function subscribe(observer) {
      checkDisposed(this);
      if (!this.isStopped) {
        this.observers.push(observer);
        observer.onNext(this.value);
        return new InnerSubscription(this, observer);
      }
      if (this.hasError) {
        observer.onError(this.error);
      } else {
        observer.onCompleted();
      }
      return disposableEmpty;
    }

    inherits(BehaviorSubject, __super__);

    /**
     *  Initializes a new instance of the BehaviorSubject class which creates a subject that caches its last value and starts with the specified value.
     *  @param {Mixed} value Initial value sent to observers when no other value has been received by the subject yet.
     */
    function BehaviorSubject(value) {
      __super__.call(this, subscribe);
      this.value = value,
      this.observers = [],
      this.isDisposed = false,
      this.isStopped = false,
      this.hasError = false;
    }

    addProperties(BehaviorSubject.prototype, Observer, {
      /**
       * Gets the current value or throws an exception.
       * Value is frozen after onCompleted is called.
       * After onError is called always throws the specified exception.
       * An exception is always thrown after dispose is called.
       * @returns {Mixed} The initial value passed to the constructor until onNext is called; after which, the last value passed to onNext.
       */
      getValue: function () {
          checkDisposed(this);
          if (this.hasError) {
              throw this.error;
          }
          return this.value;
      },
      /**
       * Indicates whether the subject has observers subscribed to it.
       * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
       */
      hasObservers: function () { return this.observers.length > 0; },
      /**
       * Notifies all subscribed observers about the end of the sequence.
       */
      onCompleted: function () {
        checkDisposed(this);
        if (this.isStopped) { return; }
        this.isStopped = true;
        for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
          os[i].onCompleted();
        }

        this.observers.length = 0;
      },
      /**
       * Notifies all subscribed observers about the exception.
       * @param {Mixed} error The exception to send to all observers.
       */
      onError: function (error) {
        checkDisposed(this);
        if (this.isStopped) { return; }
        this.isStopped = true;
        this.hasError = true;
        this.error = error;

        for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
          os[i].onError(error);
        }

        this.observers.length = 0;
      },
      /**
       * Notifies all subscribed observers about the arrival of the specified element in the sequence.
       * @param {Mixed} value The value to send to all observers.
       */
      onNext: function (value) {
        checkDisposed(this);
        if (this.isStopped) { return; }
        this.value = value;
        for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
          os[i].onNext(value);
        }
      },
      /**
       * Unsubscribe all observers and release resources.
       */
      dispose: function () {
        this.isDisposed = true;
        this.observers = null;
        this.value = null;
        this.exception = null;
      }
    });

    return BehaviorSubject;
  }(Observable));

  /**
   * Represents an object that is both an observable sequence as well as an observer.
   * Each notification is broadcasted to all subscribed and future observers, subject to buffer trimming policies.
   */
  var ReplaySubject = Rx.ReplaySubject = (function (__super__) {

    var maxSafeInteger = Math.pow(2, 53) - 1;

    function createRemovableDisposable(subject, observer) {
      return disposableCreate(function () {
        observer.dispose();
        !subject.isDisposed && subject.observers.splice(subject.observers.indexOf(observer), 1);
      });
    }

    function subscribe(observer) {
      var so = new ScheduledObserver(this.scheduler, observer),
        subscription = createRemovableDisposable(this, so);
      checkDisposed(this);
      this._trim(this.scheduler.now());
      this.observers.push(so);

      for (var i = 0, len = this.q.length; i < len; i++) {
        so.onNext(this.q[i].value);
      }

      if (this.hasError) {
        so.onError(this.error);
      } else if (this.isStopped) {
        so.onCompleted();
      }

      so.ensureActive();
      return subscription;
    }

    inherits(ReplaySubject, __super__);

    /**
     *  Initializes a new instance of the ReplaySubject class with the specified buffer size, window size and scheduler.
     *  @param {Number} [bufferSize] Maximum element count of the replay buffer.
     *  @param {Number} [windowSize] Maximum time length of the replay buffer.
     *  @param {Scheduler} [scheduler] Scheduler the observers are invoked on.
     */
    function ReplaySubject(bufferSize, windowSize, scheduler) {
      this.bufferSize = bufferSize == null ? maxSafeInteger : bufferSize;
      this.windowSize = windowSize == null ? maxSafeInteger : windowSize;
      this.scheduler = scheduler || currentThreadScheduler;
      this.q = [];
      this.observers = [];
      this.isStopped = false;
      this.isDisposed = false;
      this.hasError = false;
      this.error = null;
      __super__.call(this, subscribe);
    }

    addProperties(ReplaySubject.prototype, Observer.prototype, {
      /**
       * Indicates whether the subject has observers subscribed to it.
       * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
       */
      hasObservers: function () {
        return this.observers.length > 0;
      },
      _trim: function (now) {
        while (this.q.length > this.bufferSize) {
          this.q.shift();
        }
        while (this.q.length > 0 && (now - this.q[0].interval) > this.windowSize) {
          this.q.shift();
        }
      },
      /**
       * Notifies all subscribed observers about the arrival of the specified element in the sequence.
       * @param {Mixed} value The value to send to all observers.
       */
      onNext: function (value) {
        checkDisposed(this);
        if (this.isStopped) { return; }
        var now = this.scheduler.now();
        this.q.push({ interval: now, value: value });
        this._trim(now);

        for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
          var observer = os[i];
          observer.onNext(value);
          observer.ensureActive();
        }
      },
      /**
       * Notifies all subscribed observers about the exception.
       * @param {Mixed} error The exception to send to all observers.
       */
      onError: function (error) {
        checkDisposed(this);
        if (this.isStopped) { return; }
        this.isStopped = true;
        this.error = error;
        this.hasError = true;
        var now = this.scheduler.now();
        this._trim(now);
        for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
          var observer = os[i];
          observer.onError(error);
          observer.ensureActive();
        }
        this.observers.length = 0;
      },
      /**
       * Notifies all subscribed observers about the end of the sequence.
       */
      onCompleted: function () {
        checkDisposed(this);
        if (this.isStopped) { return; }
        this.isStopped = true;
        var now = this.scheduler.now();
        this._trim(now);
        for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
          var observer = os[i];
          observer.onCompleted();
          observer.ensureActive();
        }
        this.observers.length = 0;
      },
      /**
       * Unsubscribe all observers and release resources.
       */
      dispose: function () {
        this.isDisposed = true;
        this.observers = null;
      }
    });

    return ReplaySubject;
  }(Observable));

  var ConnectableObservable = Rx.ConnectableObservable = (function (__super__) {
    inherits(ConnectableObservable, __super__);

    function ConnectableObservable(source, subject) {
      var hasSubscription = false,
        subscription,
        sourceObservable = source.asObservable();

      this.connect = function () {
        if (!hasSubscription) {
          hasSubscription = true;
          subscription = new CompositeDisposable(sourceObservable.subscribe(subject), disposableCreate(function () {
            hasSubscription = false;
          }));
        }
        return subscription;
      };

      __super__.call(this, function (o) { return subject.subscribe(o); });
    }

    ConnectableObservable.prototype.refCount = function () {
      var connectableSubscription, count = 0, source = this;
      return new AnonymousObservable(function (observer) {
          var shouldConnect = ++count === 1,
            subscription = source.subscribe(observer);
          shouldConnect && (connectableSubscription = source.connect());
          return function () {
            subscription.dispose();
            --count === 0 && connectableSubscription.dispose();
          };
      });
    };

    return ConnectableObservable;
  }(Observable));

  /**
   * Returns an observable sequence that shares a single subscription to the underlying sequence. This observable sequence
   * can be resubscribed to, even if all prior subscriptions have ended. (unlike `.publish().refCount()`)
   * @returns {Observable} An observable sequence that contains the elements of a sequence produced by multicasting the source.
   */
  observableProto.singleInstance = function() {
    var source = this, hasObservable = false, observable;

    function getObservable() {
      if (!hasObservable) {
        hasObservable = true;
        observable = source.finally(function() { hasObservable = false; }).publish().refCount();
      }
      return observable;
    };

    return new AnonymousObservable(function(o) {
      return getObservable().subscribe(o);
    });
  };

    return Rx;
}));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"161":161}],161:[function(require,module,exports){
(function (process,global){
// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. See License.txt in the project root for license information.

;(function (undefined) {

  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  var root = (objectTypes[typeof window] && window) || this,
    freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports,
    freeModule = objectTypes[typeof module] && module && !module.nodeType && module,
    moduleExports = freeModule && freeModule.exports === freeExports && freeExports,
    freeGlobal = objectTypes[typeof global] && global;

  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  var Rx = {
      internals: {},
      config: {
        Promise: root.Promise
      },
      helpers: { }
  };

  // Defaults
  var noop = Rx.helpers.noop = function () { },
    notDefined = Rx.helpers.notDefined = function (x) { return typeof x === 'undefined'; },
    identity = Rx.helpers.identity = function (x) { return x; },
    pluck = Rx.helpers.pluck = function (property) { return function (x) { return x[property]; }; },
    just = Rx.helpers.just = function (value) { return function () { return value; }; },
    defaultNow = Rx.helpers.defaultNow = Date.now,
    defaultComparer = Rx.helpers.defaultComparer = function (x, y) { return isEqual(x, y); },
    defaultSubComparer = Rx.helpers.defaultSubComparer = function (x, y) { return x > y ? 1 : (x < y ? -1 : 0); },
    defaultKeySerializer = Rx.helpers.defaultKeySerializer = function (x) { return x.toString(); },
    defaultError = Rx.helpers.defaultError = function (err) { throw err; },
    isPromise = Rx.helpers.isPromise = function (p) { return !!p && typeof p.subscribe !== 'function' && typeof p.then === 'function'; },
    asArray = Rx.helpers.asArray = function () { return Array.prototype.slice.call(arguments); },
    not = Rx.helpers.not = function (a) { return !a; },
    isFunction = Rx.helpers.isFunction = (function () {

      var isFn = function (value) {
        return typeof value == 'function' || false;
      }

      // fallback for older versions of Chrome and Safari
      if (isFn(/x/)) {
        isFn = function(value) {
          return typeof value == 'function' && toString.call(value) == '[object Function]';
        };
      }

      return isFn;
    }());

  function cloneArray(arr) { for(var a = [], i = 0, len = arr.length; i < len; i++) { a.push(arr[i]); } return a;}

  Rx.config.longStackSupport = false;
  var hasStacks = false;
  try {
    throw new Error();
  } catch (e) {
    hasStacks = !!e.stack;
  }

  // All code after this point will be filtered from stack traces reported by RxJS
  var rStartingLine = captureLine(), rFileName;

  var STACK_JUMP_SEPARATOR = "From previous event:";

  function makeStackTraceLong(error, observable) {
      // If possible, transform the error stack trace by removing Node and RxJS
      // cruft, then concatenating with the stack trace of `observable`.
      if (hasStacks &&
          observable.stack &&
          typeof error === "object" &&
          error !== null &&
          error.stack &&
          error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
      ) {
        var stacks = [];
        for (var o = observable; !!o; o = o.source) {
          if (o.stack) {
            stacks.unshift(o.stack);
          }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
  }

  function filterStackString(stackString) {
    var lines = stackString.split("\n"),
        desiredLines = [];
    for (var i = 0, len = lines.length; i < len; i++) {
      var line = lines[i];

      if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
        desiredLines.push(line);
      }
    }
    return desiredLines.join("\n");
  }

  function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);
    if (!fileNameAndLineNumber) {
      return false;
    }
    var fileName = fileNameAndLineNumber[0], lineNumber = fileNameAndLineNumber[1];

    return fileName === rFileName &&
      lineNumber >= rStartingLine &&
      lineNumber <= rEndingLine;
  }

  function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
      stackLine.indexOf("(node.js:") !== -1;
  }

  function captureLine() {
    if (!hasStacks) { return; }

    try {
      throw new Error();
    } catch (e) {
      var lines = e.stack.split("\n");
      var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
      var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
      if (!fileNameAndLineNumber) { return; }

      rFileName = fileNameAndLineNumber[0];
      return fileNameAndLineNumber[1];
    }
  }

  function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) { return [attempt1[1], Number(attempt1[2])]; }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) { return [attempt2[1], Number(attempt2[2])]; }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) { return [attempt3[1], Number(attempt3[2])]; }
  }

  var EmptyError = Rx.EmptyError = function() {
    this.message = 'Sequence contains no elements.';
    Error.call(this);
  };
  EmptyError.prototype = Error.prototype;

  var ObjectDisposedError = Rx.ObjectDisposedError = function() {
    this.message = 'Object has been disposed';
    Error.call(this);
  };
  ObjectDisposedError.prototype = Error.prototype;

  var ArgumentOutOfRangeError = Rx.ArgumentOutOfRangeError = function () {
    this.message = 'Argument out of range';
    Error.call(this);
  };
  ArgumentOutOfRangeError.prototype = Error.prototype;

  var NotSupportedError = Rx.NotSupportedError = function (message) {
    this.message = message || 'This operation is not supported';
    Error.call(this);
  };
  NotSupportedError.prototype = Error.prototype;

  var NotImplementedError = Rx.NotImplementedError = function (message) {
    this.message = message || 'This operation is not implemented';
    Error.call(this);
  };
  NotImplementedError.prototype = Error.prototype;

  var notImplemented = Rx.helpers.notImplemented = function () {
    throw new NotImplementedError();
  };

  var notSupported = Rx.helpers.notSupported = function () {
    throw new NotSupportedError();
  };

  // Shim in iterator support
  var $iterator$ = (typeof Symbol === 'function' && Symbol.iterator) ||
    '_es6shim_iterator_';
  // Bug for mozilla version
  if (root.Set && typeof new root.Set()['@@iterator'] === 'function') {
    $iterator$ = '@@iterator';
  }

  var doneEnumerator = Rx.doneEnumerator = { done: true, value: undefined };

  var isIterable = Rx.helpers.isIterable = function (o) {
    return o[$iterator$] !== undefined;
  }

  var isArrayLike = Rx.helpers.isArrayLike = function (o) {
    return o && o.length !== undefined;
  }

  Rx.helpers.iterator = $iterator$;

  var bindCallback = Rx.internals.bindCallback = function (func, thisArg, argCount) {
    if (typeof thisArg === 'undefined') { return func; }
    switch(argCount) {
      case 0:
        return function() {
          return func.call(thisArg)
        };
      case 1:
        return function(arg) {
          return func.call(thisArg, arg);
        }
      case 2:
        return function(value, index) {
          return func.call(thisArg, value, index);
        };
      case 3:
        return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
    }

    return function() {
      return func.apply(thisArg, arguments);
    };
  };

  /** Used to determine if values are of the language type Object */
  var dontEnums = ['toString',
    'toLocaleString',
    'valueOf',
    'hasOwnProperty',
    'isPrototypeOf',
    'propertyIsEnumerable',
    'constructor'],
  dontEnumsLength = dontEnums.length;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
    arrayClass = '[object Array]',
    boolClass = '[object Boolean]',
    dateClass = '[object Date]',
    errorClass = '[object Error]',
    funcClass = '[object Function]',
    numberClass = '[object Number]',
    objectClass = '[object Object]',
    regexpClass = '[object RegExp]',
    stringClass = '[object String]';

  var toString = Object.prototype.toString,
    hasOwnProperty = Object.prototype.hasOwnProperty,
    supportsArgsClass = toString.call(arguments) == argsClass, // For less <IE9 && FF<4
    supportNodeClass,
    errorProto = Error.prototype,
    objectProto = Object.prototype,
    stringProto = String.prototype,
    propertyIsEnumerable = objectProto.propertyIsEnumerable;

  try {
    supportNodeClass = !(toString.call(document) == objectClass && !({ 'toString': 0 } + ''));
  } catch (e) {
    supportNodeClass = true;
  }

  var nonEnumProps = {};
  nonEnumProps[arrayClass] = nonEnumProps[dateClass] = nonEnumProps[numberClass] = { 'constructor': true, 'toLocaleString': true, 'toString': true, 'valueOf': true };
  nonEnumProps[boolClass] = nonEnumProps[stringClass] = { 'constructor': true, 'toString': true, 'valueOf': true };
  nonEnumProps[errorClass] = nonEnumProps[funcClass] = nonEnumProps[regexpClass] = { 'constructor': true, 'toString': true };
  nonEnumProps[objectClass] = { 'constructor': true };

  var support = {};
  (function () {
    var ctor = function() { this.x = 1; },
      props = [];

    ctor.prototype = { 'valueOf': 1, 'y': 1 };
    for (var key in new ctor) { props.push(key); }
    for (key in arguments) { }

    // Detect if `name` or `message` properties of `Error.prototype` are enumerable by default.
    support.enumErrorProps = propertyIsEnumerable.call(errorProto, 'message') || propertyIsEnumerable.call(errorProto, 'name');

    // Detect if `prototype` properties are enumerable by default.
    support.enumPrototypes = propertyIsEnumerable.call(ctor, 'prototype');

    // Detect if `arguments` object indexes are non-enumerable
    support.nonEnumArgs = key != 0;

    // Detect if properties shadowing those on `Object.prototype` are non-enumerable.
    support.nonEnumShadows = !/valueOf/.test(props);
  }(1));

  var isObject = Rx.internals.isObject = function(value) {
    var type = typeof value;
    return value && (type == 'function' || type == 'object') || false;
  };

  function keysIn(object) {
    var result = [];
    if (!isObject(object)) {
      return result;
    }
    if (support.nonEnumArgs && object.length && isArguments(object)) {
      object = slice.call(object);
    }
    var skipProto = support.enumPrototypes && typeof object == 'function',
        skipErrorProps = support.enumErrorProps && (object === errorProto || object instanceof Error);

    for (var key in object) {
      if (!(skipProto && key == 'prototype') &&
          !(skipErrorProps && (key == 'message' || key == 'name'))) {
        result.push(key);
      }
    }

    if (support.nonEnumShadows && object !== objectProto) {
      var ctor = object.constructor,
          index = -1,
          length = dontEnumsLength;

      if (object === (ctor && ctor.prototype)) {
        var className = object === stringProto ? stringClass : object === errorProto ? errorClass : toString.call(object),
            nonEnum = nonEnumProps[className];
      }
      while (++index < length) {
        key = dontEnums[index];
        if (!(nonEnum && nonEnum[key]) && hasOwnProperty.call(object, key)) {
          result.push(key);
        }
      }
    }
    return result;
  }

  function internalFor(object, callback, keysFunc) {
    var index = -1,
      props = keysFunc(object),
      length = props.length;

    while (++index < length) {
      var key = props[index];
      if (callback(object[key], key, object) === false) {
        break;
      }
    }
    return object;
  }

  function internalForIn(object, callback) {
    return internalFor(object, callback, keysIn);
  }

  function isNode(value) {
    // IE < 9 presents DOM nodes as `Object` objects except they have `toString`
    // methods that are `typeof` "string" and still can coerce nodes to strings
    return typeof value.toString != 'function' && typeof (value + '') == 'string';
  }

  var isArguments = function(value) {
    return (value && typeof value == 'object') ? toString.call(value) == argsClass : false;
  }

  // fallback for browsers that can't detect `arguments` objects by [[Class]]
  if (!supportsArgsClass) {
    isArguments = function(value) {
      return (value && typeof value == 'object') ? hasOwnProperty.call(value, 'callee') : false;
    };
  }

  var isEqual = Rx.internals.isEqual = function (x, y) {
    return deepEquals(x, y, [], []);
  };

  /** @private
   * Used for deep comparison
   **/
  function deepEquals(a, b, stackA, stackB) {
    // exit early for identical values
    if (a === b) {
      // treat `+0` vs. `-0` as not equal
      return a !== 0 || (1 / a == 1 / b);
    }

    var type = typeof a,
        otherType = typeof b;

    // exit early for unlike primitive values
    if (a === a && (a == null || b == null ||
        (type != 'function' && type != 'object' && otherType != 'function' && otherType != 'object'))) {
      return false;
    }

    // compare [[Class]] names
    var className = toString.call(a),
        otherClass = toString.call(b);

    if (className == argsClass) {
      className = objectClass;
    }
    if (otherClass == argsClass) {
      otherClass = objectClass;
    }
    if (className != otherClass) {
      return false;
    }
    switch (className) {
      case boolClass:
      case dateClass:
        // coerce dates and booleans to numbers, dates to milliseconds and booleans
        // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
        return +a == +b;

      case numberClass:
        // treat `NaN` vs. `NaN` as equal
        return (a != +a) ?
          b != +b :
          // but treat `-0` vs. `+0` as not equal
          (a == 0 ? (1 / a == 1 / b) : a == +b);

      case regexpClass:
      case stringClass:
        // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
        // treat string primitives and their corresponding object instances as equal
        return a == String(b);
    }
    var isArr = className == arrayClass;
    if (!isArr) {

      // exit for functions and DOM nodes
      if (className != objectClass || (!support.nodeClass && (isNode(a) || isNode(b)))) {
        return false;
      }
      // in older versions of Opera, `arguments` objects have `Array` constructors
      var ctorA = !support.argsObject && isArguments(a) ? Object : a.constructor,
          ctorB = !support.argsObject && isArguments(b) ? Object : b.constructor;

      // non `Object` object instances with different constructors are not equal
      if (ctorA != ctorB &&
            !(hasOwnProperty.call(a, 'constructor') && hasOwnProperty.call(b, 'constructor')) &&
            !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
            ('constructor' in a && 'constructor' in b)
          ) {
        return false;
      }
    }
    // assume cyclic structures are equal
    // the algorithm for detecting cyclic structures is adapted from ES 5.1
    // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
    var initedStack = !stackA;
    stackA || (stackA = []);
    stackB || (stackB = []);

    var length = stackA.length;
    while (length--) {
      if (stackA[length] == a) {
        return stackB[length] == b;
      }
    }
    var size = 0;
    var result = true;

    // add `a` and `b` to the stack of traversed objects
    stackA.push(a);
    stackB.push(b);

    // recursively compare objects and arrays (susceptible to call stack limits)
    if (isArr) {
      // compare lengths to determine if a deep comparison is necessary
      length = a.length;
      size = b.length;
      result = size == length;

      if (result) {
        // deep compare the contents, ignoring non-numeric properties
        while (size--) {
          var index = length,
              value = b[size];

          if (!(result = deepEquals(a[size], value, stackA, stackB))) {
            break;
          }
        }
      }
    }
    else {
      // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
      // which, in this case, is more costly
      internalForIn(b, function(value, key, b) {
        if (hasOwnProperty.call(b, key)) {
          // count the number of properties.
          size++;
          // deep compare each property value.
          return (result = hasOwnProperty.call(a, key) && deepEquals(a[key], value, stackA, stackB));
        }
      });

      if (result) {
        // ensure both objects have the same number of properties
        internalForIn(a, function(value, key, a) {
          if (hasOwnProperty.call(a, key)) {
            // `size` will be `-1` if `a` has more properties than `b`
            return (result = --size > -1);
          }
        });
      }
    }
    stackA.pop();
    stackB.pop();

    return result;
  }

  var hasProp = {}.hasOwnProperty,
      slice = Array.prototype.slice;

  var inherits = this.inherits = Rx.internals.inherits = function (child, parent) {
    function __() { this.constructor = child; }
    __.prototype = parent.prototype;
    child.prototype = new __();
  };

  var addProperties = Rx.internals.addProperties = function (obj) {
    for(var sources = [], i = 1, len = arguments.length; i < len; i++) { sources.push(arguments[i]); }
    for (var idx = 0, ln = sources.length; idx < ln; idx++) {
      var source = sources[idx];
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    }
  };

  // Rx Utils
  var addRef = Rx.internals.addRef = function (xs, r) {
    return new AnonymousObservable(function (observer) {
      return new CompositeDisposable(r.getDisposable(), xs.subscribe(observer));
    });
  };

  function arrayInitialize(count, factory) {
    var a = new Array(count);
    for (var i = 0; i < count; i++) {
      a[i] = factory();
    }
    return a;
  }

  var errorObj = {e: {}};
  var tryCatchTarget;
  function tryCatcher() {
    try {
      return tryCatchTarget.apply(this, arguments);
    } catch (e) {
      errorObj.e = e;
      return errorObj;
    }
  }
  function tryCatch(fn) {
    if (!isFunction(fn)) { throw new TypeError('fn must be a function'); }
    tryCatchTarget = fn;
    return tryCatcher;
  }
  function thrower(e) {
    throw e;
  }

  // Collections
  function IndexedItem(id, value) {
    this.id = id;
    this.value = value;
  }

  IndexedItem.prototype.compareTo = function (other) {
    var c = this.value.compareTo(other.value);
    c === 0 && (c = this.id - other.id);
    return c;
  };

  // Priority Queue for Scheduling
  var PriorityQueue = Rx.internals.PriorityQueue = function (capacity) {
    this.items = new Array(capacity);
    this.length = 0;
  };

  var priorityProto = PriorityQueue.prototype;
  priorityProto.isHigherPriority = function (left, right) {
    return this.items[left].compareTo(this.items[right]) < 0;
  };

  priorityProto.percolate = function (index) {
    if (index >= this.length || index < 0) { return; }
    var parent = index - 1 >> 1;
    if (parent < 0 || parent === index) { return; }
    if (this.isHigherPriority(index, parent)) {
      var temp = this.items[index];
      this.items[index] = this.items[parent];
      this.items[parent] = temp;
      this.percolate(parent);
    }
  };

  priorityProto.heapify = function (index) {
    +index || (index = 0);
    if (index >= this.length || index < 0) { return; }
    var left = 2 * index + 1,
        right = 2 * index + 2,
        first = index;
    if (left < this.length && this.isHigherPriority(left, first)) {
      first = left;
    }
    if (right < this.length && this.isHigherPriority(right, first)) {
      first = right;
    }
    if (first !== index) {
      var temp = this.items[index];
      this.items[index] = this.items[first];
      this.items[first] = temp;
      this.heapify(first);
    }
  };

  priorityProto.peek = function () { return this.items[0].value; };

  priorityProto.removeAt = function (index) {
    this.items[index] = this.items[--this.length];
    this.items[this.length] = undefined;
    this.heapify();
  };

  priorityProto.dequeue = function () {
    var result = this.peek();
    this.removeAt(0);
    return result;
  };

  priorityProto.enqueue = function (item) {
    var index = this.length++;
    this.items[index] = new IndexedItem(PriorityQueue.count++, item);
    this.percolate(index);
  };

  priorityProto.remove = function (item) {
    for (var i = 0; i < this.length; i++) {
      if (this.items[i].value === item) {
        this.removeAt(i);
        return true;
      }
    }
    return false;
  };
  PriorityQueue.count = 0;

  /**
   * Represents a group of disposable resources that are disposed together.
   * @constructor
   */
  var CompositeDisposable = Rx.CompositeDisposable = function () {
    var args = [], i, len;
    if (Array.isArray(arguments[0])) {
      args = arguments[0];
      len = args.length;
    } else {
      len = arguments.length;
      args = new Array(len);
      for(i = 0; i < len; i++) { args[i] = arguments[i]; }
    }
    for(i = 0; i < len; i++) {
      if (!isDisposable(args[i])) { throw new TypeError('Not a disposable'); }
    }
    this.disposables = args;
    this.isDisposed = false;
    this.length = args.length;
  };

  var CompositeDisposablePrototype = CompositeDisposable.prototype;

  /**
   * Adds a disposable to the CompositeDisposable or disposes the disposable if the CompositeDisposable is disposed.
   * @param {Mixed} item Disposable to add.
   */
  CompositeDisposablePrototype.add = function (item) {
    if (this.isDisposed) {
      item.dispose();
    } else {
      this.disposables.push(item);
      this.length++;
    }
  };

  /**
   * Removes and disposes the first occurrence of a disposable from the CompositeDisposable.
   * @param {Mixed} item Disposable to remove.
   * @returns {Boolean} true if found; false otherwise.
   */
  CompositeDisposablePrototype.remove = function (item) {
    var shouldDispose = false;
    if (!this.isDisposed) {
      var idx = this.disposables.indexOf(item);
      if (idx !== -1) {
        shouldDispose = true;
        this.disposables.splice(idx, 1);
        this.length--;
        item.dispose();
      }
    }
    return shouldDispose;
  };

  /**
   *  Disposes all disposables in the group and removes them from the group.
   */
  CompositeDisposablePrototype.dispose = function () {
    if (!this.isDisposed) {
      this.isDisposed = true;
      var len = this.disposables.length, currentDisposables = new Array(len);
      for(var i = 0; i < len; i++) { currentDisposables[i] = this.disposables[i]; }
      this.disposables = [];
      this.length = 0;

      for (i = 0; i < len; i++) {
        currentDisposables[i].dispose();
      }
    }
  };

  /**
   * Provides a set of static methods for creating Disposables.
   * @param {Function} dispose Action to run during the first call to dispose. The action is guaranteed to be run at most once.
   */
  var Disposable = Rx.Disposable = function (action) {
    this.isDisposed = false;
    this.action = action || noop;
  };

  /** Performs the task of cleaning up resources. */
  Disposable.prototype.dispose = function () {
    if (!this.isDisposed) {
      this.action();
      this.isDisposed = true;
    }
  };

  /**
   * Creates a disposable object that invokes the specified action when disposed.
   * @param {Function} dispose Action to run during the first call to dispose. The action is guaranteed to be run at most once.
   * @return {Disposable} The disposable object that runs the given action upon disposal.
   */
  var disposableCreate = Disposable.create = function (action) { return new Disposable(action); };

  /**
   * Gets the disposable that does nothing when disposed.
   */
  var disposableEmpty = Disposable.empty = { dispose: noop };

  /**
   * Validates whether the given object is a disposable
   * @param {Object} Object to test whether it has a dispose method
   * @returns {Boolean} true if a disposable object, else false.
   */
  var isDisposable = Disposable.isDisposable = function (d) {
    return d && isFunction(d.dispose);
  };

  var checkDisposed = Disposable.checkDisposed = function (disposable) {
    if (disposable.isDisposed) { throw new ObjectDisposedError(); }
  };

  // Single assignment
  var SingleAssignmentDisposable = Rx.SingleAssignmentDisposable = function () {
    this.isDisposed = false;
    this.current = null;
  };
  SingleAssignmentDisposable.prototype.getDisposable = function () {
    return this.current;
  };
  SingleAssignmentDisposable.prototype.setDisposable = function (value) {
    if (this.current) { throw new Error('Disposable has already been assigned'); }
    var shouldDispose = this.isDisposed;
    !shouldDispose && (this.current = value);
    shouldDispose && value && value.dispose();
  };
  SingleAssignmentDisposable.prototype.dispose = function () {
    if (!this.isDisposed) {
      this.isDisposed = true;
      var old = this.current;
      this.current = null;
    }
    old && old.dispose();
  };

  // Multiple assignment disposable
  var SerialDisposable = Rx.SerialDisposable = function () {
    this.isDisposed = false;
    this.current = null;
  };
  SerialDisposable.prototype.getDisposable = function () {
    return this.current;
  };
  SerialDisposable.prototype.setDisposable = function (value) {
    var shouldDispose = this.isDisposed;
    if (!shouldDispose) {
      var old = this.current;
      this.current = value;
    }
    old && old.dispose();
    shouldDispose && value && value.dispose();
  };
  SerialDisposable.prototype.dispose = function () {
    if (!this.isDisposed) {
      this.isDisposed = true;
      var old = this.current;
      this.current = null;
    }
    old && old.dispose();
  };

  /**
   * Represents a disposable resource that only disposes its underlying disposable resource when all dependent disposable objects have been disposed.
   */
  var RefCountDisposable = Rx.RefCountDisposable = (function () {

    function InnerDisposable(disposable) {
      this.disposable = disposable;
      this.disposable.count++;
      this.isInnerDisposed = false;
    }

    InnerDisposable.prototype.dispose = function () {
      if (!this.disposable.isDisposed && !this.isInnerDisposed) {
        this.isInnerDisposed = true;
        this.disposable.count--;
        if (this.disposable.count === 0 && this.disposable.isPrimaryDisposed) {
          this.disposable.isDisposed = true;
          this.disposable.underlyingDisposable.dispose();
        }
      }
    };

    /**
     * Initializes a new instance of the RefCountDisposable with the specified disposable.
     * @constructor
     * @param {Disposable} disposable Underlying disposable.
      */
    function RefCountDisposable(disposable) {
      this.underlyingDisposable = disposable;
      this.isDisposed = false;
      this.isPrimaryDisposed = false;
      this.count = 0;
    }

    /**
     * Disposes the underlying disposable only when all dependent disposables have been disposed
     */
    RefCountDisposable.prototype.dispose = function () {
      if (!this.isDisposed && !this.isPrimaryDisposed) {
        this.isPrimaryDisposed = true;
        if (this.count === 0) {
          this.isDisposed = true;
          this.underlyingDisposable.dispose();
        }
      }
    };

    /**
     * Returns a dependent disposable that when disposed decreases the refcount on the underlying disposable.
     * @returns {Disposable} A dependent disposable contributing to the reference count that manages the underlying disposable's lifetime.
     */
    RefCountDisposable.prototype.getDisposable = function () {
      return this.isDisposed ? disposableEmpty : new InnerDisposable(this);
    };

    return RefCountDisposable;
  })();

  function ScheduledDisposable(scheduler, disposable) {
    this.scheduler = scheduler;
    this.disposable = disposable;
    this.isDisposed = false;
  }

  function scheduleItem(s, self) {
    if (!self.isDisposed) {
      self.isDisposed = true;
      self.disposable.dispose();
    }
  }

  ScheduledDisposable.prototype.dispose = function () {
    this.scheduler.scheduleWithState(this, scheduleItem);
  };

  var ScheduledItem = Rx.internals.ScheduledItem = function (scheduler, state, action, dueTime, comparer) {
    this.scheduler = scheduler;
    this.state = state;
    this.action = action;
    this.dueTime = dueTime;
    this.comparer = comparer || defaultSubComparer;
    this.disposable = new SingleAssignmentDisposable();
  }

  ScheduledItem.prototype.invoke = function () {
    this.disposable.setDisposable(this.invokeCore());
  };

  ScheduledItem.prototype.compareTo = function (other) {
    return this.comparer(this.dueTime, other.dueTime);
  };

  ScheduledItem.prototype.isCancelled = function () {
    return this.disposable.isDisposed;
  };

  ScheduledItem.prototype.invokeCore = function () {
    return this.action(this.scheduler, this.state);
  };

  /** Provides a set of static properties to access commonly used schedulers. */
  var Scheduler = Rx.Scheduler = (function () {

    function Scheduler(now, schedule, scheduleRelative, scheduleAbsolute) {
      this.now = now;
      this._schedule = schedule;
      this._scheduleRelative = scheduleRelative;
      this._scheduleAbsolute = scheduleAbsolute;
    }

    /** Determines whether the given object is a scheduler */
    Scheduler.isScheduler = function (s) {
      return s instanceof Scheduler;
    }

    function invokeAction(scheduler, action) {
      action();
      return disposableEmpty;
    }

    var schedulerProto = Scheduler.prototype;

    /**
     * Schedules an action to be executed.
     * @param {Function} action Action to execute.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.schedule = function (action) {
      return this._schedule(action, invokeAction);
    };

    /**
     * Schedules an action to be executed.
     * @param state State passed to the action to be executed.
     * @param {Function} action Action to be executed.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleWithState = function (state, action) {
      return this._schedule(state, action);
    };

    /**
     * Schedules an action to be executed after the specified relative due time.
     * @param {Function} action Action to execute.
     * @param {Number} dueTime Relative time after which to execute the action.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleWithRelative = function (dueTime, action) {
      return this._scheduleRelative(action, dueTime, invokeAction);
    };

    /**
     * Schedules an action to be executed after dueTime.
     * @param state State passed to the action to be executed.
     * @param {Function} action Action to be executed.
     * @param {Number} dueTime Relative time after which to execute the action.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleWithRelativeAndState = function (state, dueTime, action) {
      return this._scheduleRelative(state, dueTime, action);
    };

    /**
     * Schedules an action to be executed at the specified absolute due time.
     * @param {Function} action Action to execute.
     * @param {Number} dueTime Absolute time at which to execute the action.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
      */
    schedulerProto.scheduleWithAbsolute = function (dueTime, action) {
      return this._scheduleAbsolute(action, dueTime, invokeAction);
    };

    /**
     * Schedules an action to be executed at dueTime.
     * @param {Mixed} state State passed to the action to be executed.
     * @param {Function} action Action to be executed.
     * @param {Number}dueTime Absolute time at which to execute the action.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleWithAbsoluteAndState = function (state, dueTime, action) {
      return this._scheduleAbsolute(state, dueTime, action);
    };

    /** Gets the current time according to the local machine's system clock. */
    Scheduler.now = defaultNow;

    /**
     * Normalizes the specified TimeSpan value to a positive value.
     * @param {Number} timeSpan The time span value to normalize.
     * @returns {Number} The specified TimeSpan value if it is zero or positive; otherwise, 0
     */
    Scheduler.normalize = function (timeSpan) {
      timeSpan < 0 && (timeSpan = 0);
      return timeSpan;
    };

    return Scheduler;
  }());

  var normalizeTime = Scheduler.normalize, isScheduler = Scheduler.isScheduler;

  (function (schedulerProto) {

    function invokeRecImmediate(scheduler, pair) {
      var state = pair[0], action = pair[1], group = new CompositeDisposable();

      function recursiveAction(state1) {
        action(state1, function (state2) {
          var isAdded = false, isDone = false,
          d = scheduler.scheduleWithState(state2, function (scheduler1, state3) {
            if (isAdded) {
              group.remove(d);
            } else {
              isDone = true;
            }
            recursiveAction(state3);
            return disposableEmpty;
          });
          if (!isDone) {
            group.add(d);
            isAdded = true;
          }
        });
      }
      recursiveAction(state);
      return group;
    }

    function invokeRecDate(scheduler, pair, method) {
      var state = pair[0], action = pair[1], group = new CompositeDisposable();
      function recursiveAction(state1) {
        action(state1, function (state2, dueTime1) {
          var isAdded = false, isDone = false,
          d = scheduler[method](state2, dueTime1, function (scheduler1, state3) {
            if (isAdded) {
              group.remove(d);
            } else {
              isDone = true;
            }
            recursiveAction(state3);
            return disposableEmpty;
          });
          if (!isDone) {
            group.add(d);
            isAdded = true;
          }
        });
      };
      recursiveAction(state);
      return group;
    }

    function scheduleInnerRecursive(action, self) {
      action(function(dt) { self(action, dt); });
    }

    /**
     * Schedules an action to be executed recursively.
     * @param {Function} action Action to execute recursively. The parameter passed to the action is used to trigger recursive scheduling of the action.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleRecursive = function (action) {
      return this.scheduleRecursiveWithState(action, scheduleInnerRecursive);
    };

    /**
     * Schedules an action to be executed recursively.
     * @param {Mixed} state State passed to the action to be executed.
     * @param {Function} action Action to execute recursively. The last parameter passed to the action is used to trigger recursive scheduling of the action, passing in recursive invocation state.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleRecursiveWithState = function (state, action) {
      return this.scheduleWithState([state, action], invokeRecImmediate);
    };

    /**
     * Schedules an action to be executed recursively after a specified relative due time.
     * @param {Function} action Action to execute recursively. The parameter passed to the action is used to trigger recursive scheduling of the action at the specified relative time.
     * @param {Number}dueTime Relative time after which to execute the action for the first time.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleRecursiveWithRelative = function (dueTime, action) {
      return this.scheduleRecursiveWithRelativeAndState(action, dueTime, scheduleInnerRecursive);
    };

    /**
     * Schedules an action to be executed recursively after a specified relative due time.
     * @param {Mixed} state State passed to the action to be executed.
     * @param {Function} action Action to execute recursively. The last parameter passed to the action is used to trigger recursive scheduling of the action, passing in the recursive due time and invocation state.
     * @param {Number}dueTime Relative time after which to execute the action for the first time.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleRecursiveWithRelativeAndState = function (state, dueTime, action) {
      return this._scheduleRelative([state, action], dueTime, function (s, p) {
        return invokeRecDate(s, p, 'scheduleWithRelativeAndState');
      });
    };

    /**
     * Schedules an action to be executed recursively at a specified absolute due time.
     * @param {Function} action Action to execute recursively. The parameter passed to the action is used to trigger recursive scheduling of the action at the specified absolute time.
     * @param {Number}dueTime Absolute time at which to execute the action for the first time.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleRecursiveWithAbsolute = function (dueTime, action) {
      return this.scheduleRecursiveWithAbsoluteAndState(action, dueTime, scheduleInnerRecursive);
    };

    /**
     * Schedules an action to be executed recursively at a specified absolute due time.
     * @param {Mixed} state State passed to the action to be executed.
     * @param {Function} action Action to execute recursively. The last parameter passed to the action is used to trigger recursive scheduling of the action, passing in the recursive due time and invocation state.
     * @param {Number}dueTime Absolute time at which to execute the action for the first time.
     * @returns {Disposable} The disposable object used to cancel the scheduled action (best effort).
     */
    schedulerProto.scheduleRecursiveWithAbsoluteAndState = function (state, dueTime, action) {
      return this._scheduleAbsolute([state, action], dueTime, function (s, p) {
        return invokeRecDate(s, p, 'scheduleWithAbsoluteAndState');
      });
    };
  }(Scheduler.prototype));

  (function (schedulerProto) {

    /**
     * Schedules a periodic piece of work by dynamically discovering the scheduler's capabilities. The periodic task will be scheduled using window.setInterval for the base implementation.
     * @param {Number} period Period for running the work periodically.
     * @param {Function} action Action to be executed.
     * @returns {Disposable} The disposable object used to cancel the scheduled recurring action (best effort).
     */
    Scheduler.prototype.schedulePeriodic = function (period, action) {
      return this.schedulePeriodicWithState(null, period, action);
    };

    /**
     * Schedules a periodic piece of work by dynamically discovering the scheduler's capabilities. The periodic task will be scheduled using window.setInterval for the base implementation.
     * @param {Mixed} state Initial state passed to the action upon the first iteration.
     * @param {Number} period Period for running the work periodically.
     * @param {Function} action Action to be executed, potentially updating the state.
     * @returns {Disposable} The disposable object used to cancel the scheduled recurring action (best effort).
     */
    Scheduler.prototype.schedulePeriodicWithState = function(state, period, action) {
      if (typeof root.setInterval === 'undefined') { throw new NotSupportedError(); }
      period = normalizeTime(period);
      var s = state, id = root.setInterval(function () { s = action(s); }, period);
      return disposableCreate(function () { root.clearInterval(id); });
    };

  }(Scheduler.prototype));

  (function (schedulerProto) {
    /**
     * Returns a scheduler that wraps the original scheduler, adding exception handling for scheduled actions.
     * @param {Function} handler Handler that's run if an exception is caught. The exception will be rethrown if the handler returns false.
     * @returns {Scheduler} Wrapper around the original scheduler, enforcing exception handling.
     */
    schedulerProto.catchError = schedulerProto['catch'] = function (handler) {
      return new CatchScheduler(this, handler);
    };
  }(Scheduler.prototype));

  var SchedulePeriodicRecursive = Rx.internals.SchedulePeriodicRecursive = (function () {
    function tick(command, recurse) {
      recurse(0, this._period);
      try {
        this._state = this._action(this._state);
      } catch (e) {
        this._cancel.dispose();
        throw e;
      }
    }

    function SchedulePeriodicRecursive(scheduler, state, period, action) {
      this._scheduler = scheduler;
      this._state = state;
      this._period = period;
      this._action = action;
    }

    SchedulePeriodicRecursive.prototype.start = function () {
      var d = new SingleAssignmentDisposable();
      this._cancel = d;
      d.setDisposable(this._scheduler.scheduleRecursiveWithRelativeAndState(0, this._period, tick.bind(this)));

      return d;
    };

    return SchedulePeriodicRecursive;
  }());

  /** Gets a scheduler that schedules work immediately on the current thread. */
  var immediateScheduler = Scheduler.immediate = (function () {
    function scheduleNow(state, action) { return action(this, state); }
    return new Scheduler(defaultNow, scheduleNow, notSupported, notSupported);
  }());

  /**
   * Gets a scheduler that schedules work as soon as possible on the current thread.
   */
  var currentThreadScheduler = Scheduler.currentThread = (function () {
    var queue;

    function runTrampoline () {
      while (queue.length > 0) {
        var item = queue.dequeue();
        !item.isCancelled() && item.invoke();
      }
    }

    function scheduleNow(state, action) {
      var si = new ScheduledItem(this, state, action, this.now());

      if (!queue) {
        queue = new PriorityQueue(4);
        queue.enqueue(si);

        var result = tryCatch(runTrampoline)();
        queue = null;
        if (result === errorObj) { return thrower(result.e); }
      } else {
        queue.enqueue(si);
      }
      return si.disposable;
    }

    var currentScheduler = new Scheduler(defaultNow, scheduleNow, notSupported, notSupported);
    currentScheduler.scheduleRequired = function () { return !queue; };

    return currentScheduler;
  }());

  var scheduleMethod, clearMethod;

  var localTimer = (function () {
    var localSetTimeout, localClearTimeout = noop;
    if (!!root.setTimeout) {
      localSetTimeout = root.setTimeout;
      localClearTimeout = root.clearTimeout;
    } else if (!!root.WScript) {
      localSetTimeout = function (fn, time) {
        root.WScript.Sleep(time);
        fn();
      };
    } else {
      throw new NotSupportedError();
    }

    return {
      setTimeout: localSetTimeout,
      clearTimeout: localClearTimeout
    };
  }());
  var localSetTimeout = localTimer.setTimeout,
    localClearTimeout = localTimer.clearTimeout;

  (function () {

    var nextHandle = 1, tasksByHandle = {}, currentlyRunning = false;

    clearMethod = function (handle) {
      delete tasksByHandle[handle];
    };

    function runTask(handle) {
      if (currentlyRunning) {
        localSetTimeout(function () { runTask(handle) }, 0);
      } else {
        var task = tasksByHandle[handle];
        if (task) {
          currentlyRunning = true;
          var result = tryCatch(task)();
          clearMethod(handle);
          currentlyRunning = false;
          if (result === errorObj) { return thrower(result.e); }
        }
      }
    }

    var reNative = RegExp('^' +
      String(toString)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/toString| for [^\]]+/g, '.*?') + '$'
    );

    var setImmediate = typeof (setImmediate = freeGlobal && moduleExports && freeGlobal.setImmediate) == 'function' &&
      !reNative.test(setImmediate) && setImmediate;

    function postMessageSupported () {
      // Ensure not in a worker
      if (!root.postMessage || root.importScripts) { return false; }
      var isAsync = false, oldHandler = root.onmessage;
      // Test for async
      root.onmessage = function () { isAsync = true; };
      root.postMessage('', '*');
      root.onmessage = oldHandler;

      return isAsync;
    }

    // Use in order, setImmediate, nextTick, postMessage, MessageChannel, script readystatechanged, setTimeout
    if (isFunction(setImmediate)) {
      scheduleMethod = function (action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        setImmediate(function () { runTask(id); });

        return id;
      };
    } else if (typeof process !== 'undefined' && {}.toString.call(process) === '[object process]') {
      scheduleMethod = function (action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        process.nextTick(function () { runTask(id); });

        return id;
      };
    } else if (postMessageSupported()) {
      var MSG_PREFIX = 'ms.rx.schedule' + Math.random();

      function onGlobalPostMessage(event) {
        // Only if we're a match to avoid any other global events
        if (typeof event.data === 'string' && event.data.substring(0, MSG_PREFIX.length) === MSG_PREFIX) {
          runTask(event.data.substring(MSG_PREFIX.length));
        }
      }

      if (root.addEventListener) {
        root.addEventListener('message', onGlobalPostMessage, false);
      } else if (root.attachEvent) {
        root.attachEvent('onmessage', onGlobalPostMessage);
      } else {
        root.onmessage = onGlobalPostMessage;
      }

      scheduleMethod = function (action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        root.postMessage(MSG_PREFIX + currentId, '*');
        return id;
      };
    } else if (!!root.MessageChannel) {
      var channel = new root.MessageChannel();

      channel.port1.onmessage = function (e) { runTask(e.data); };

      scheduleMethod = function (action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        channel.port2.postMessage(id);
        return id;
      };
    } else if ('document' in root && 'onreadystatechange' in root.document.createElement('script')) {

      scheduleMethod = function (action) {
        var scriptElement = root.document.createElement('script');
        var id = nextHandle++;
        tasksByHandle[id] = action;

        scriptElement.onreadystatechange = function () {
          runTask(id);
          scriptElement.onreadystatechange = null;
          scriptElement.parentNode.removeChild(scriptElement);
          scriptElement = null;
        };
        root.document.documentElement.appendChild(scriptElement);
        return id;
      };

    } else {
      scheduleMethod = function (action) {
        var id = nextHandle++;
        tasksByHandle[id] = action;
        localSetTimeout(function () {
          runTask(id);
        }, 0);

        return id;
      };
    }
  }());

  /**
   * Gets a scheduler that schedules work via a timed callback based upon platform.
   */
  var timeoutScheduler = Scheduler.timeout = Scheduler['default'] = (function () {

    function scheduleNow(state, action) {
      var scheduler = this, disposable = new SingleAssignmentDisposable();
      var id = scheduleMethod(function () {
        !disposable.isDisposed && disposable.setDisposable(action(scheduler, state));
      });
      return new CompositeDisposable(disposable, disposableCreate(function () {
        clearMethod(id);
      }));
    }

    function scheduleRelative(state, dueTime, action) {
      var scheduler = this, dt = Scheduler.normalize(dueTime), disposable = new SingleAssignmentDisposable();
      if (dt === 0) { return scheduler.scheduleWithState(state, action); }
      var id = localSetTimeout(function () {
        !disposable.isDisposed && disposable.setDisposable(action(scheduler, state));
      }, dt);
      return new CompositeDisposable(disposable, disposableCreate(function () {
        localClearTimeout(id);
      }));
    }

    function scheduleAbsolute(state, dueTime, action) {
      return this.scheduleWithRelativeAndState(state, dueTime - this.now(), action);
    }

    return new Scheduler(defaultNow, scheduleNow, scheduleRelative, scheduleAbsolute);
  })();

  var CatchScheduler = (function (__super__) {

    function scheduleNow(state, action) {
      return this._scheduler.scheduleWithState(state, this._wrap(action));
    }

    function scheduleRelative(state, dueTime, action) {
      return this._scheduler.scheduleWithRelativeAndState(state, dueTime, this._wrap(action));
    }

    function scheduleAbsolute(state, dueTime, action) {
      return this._scheduler.scheduleWithAbsoluteAndState(state, dueTime, this._wrap(action));
    }

    inherits(CatchScheduler, __super__);

    function CatchScheduler(scheduler, handler) {
      this._scheduler = scheduler;
      this._handler = handler;
      this._recursiveOriginal = null;
      this._recursiveWrapper = null;
      __super__.call(this, this._scheduler.now.bind(this._scheduler), scheduleNow, scheduleRelative, scheduleAbsolute);
    }

    CatchScheduler.prototype._clone = function (scheduler) {
        return new CatchScheduler(scheduler, this._handler);
    };

    CatchScheduler.prototype._wrap = function (action) {
      var parent = this;
      return function (self, state) {
        try {
          return action(parent._getRecursiveWrapper(self), state);
        } catch (e) {
          if (!parent._handler(e)) { throw e; }
          return disposableEmpty;
        }
      };
    };

    CatchScheduler.prototype._getRecursiveWrapper = function (scheduler) {
      if (this._recursiveOriginal !== scheduler) {
        this._recursiveOriginal = scheduler;
        var wrapper = this._clone(scheduler);
        wrapper._recursiveOriginal = scheduler;
        wrapper._recursiveWrapper = wrapper;
        this._recursiveWrapper = wrapper;
      }
      return this._recursiveWrapper;
    };

    CatchScheduler.prototype.schedulePeriodicWithState = function (state, period, action) {
      var self = this, failed = false, d = new SingleAssignmentDisposable();

      d.setDisposable(this._scheduler.schedulePeriodicWithState(state, period, function (state1) {
        if (failed) { return null; }
        try {
          return action(state1);
        } catch (e) {
          failed = true;
          if (!self._handler(e)) { throw e; }
          d.dispose();
          return null;
        }
      }));

      return d;
    };

    return CatchScheduler;
  }(Scheduler));

  /**
   *  Represents a notification to an observer.
   */
  var Notification = Rx.Notification = (function () {
    function Notification(kind, value, exception, accept, acceptObservable, toString) {
      this.kind = kind;
      this.value = value;
      this.exception = exception;
      this._accept = accept;
      this._acceptObservable = acceptObservable;
      this.toString = toString;
    }

    /**
     * Invokes the delegate corresponding to the notification or the observer's method corresponding to the notification and returns the produced result.
     *
     * @memberOf Notification
     * @param {Any} observerOrOnNext Delegate to invoke for an OnNext notification or Observer to invoke the notification on..
     * @param {Function} onError Delegate to invoke for an OnError notification.
     * @param {Function} onCompleted Delegate to invoke for an OnCompleted notification.
     * @returns {Any} Result produced by the observation.
     */
    Notification.prototype.accept = function (observerOrOnNext, onError, onCompleted) {
      return observerOrOnNext && typeof observerOrOnNext === 'object' ?
        this._acceptObservable(observerOrOnNext) :
        this._accept(observerOrOnNext, onError, onCompleted);
    };

    /**
     * Returns an observable sequence with a single notification.
     *
     * @memberOf Notifications
     * @param {Scheduler} [scheduler] Scheduler to send out the notification calls on.
     * @returns {Observable} The observable sequence that surfaces the behavior of the notification upon subscription.
     */
    Notification.prototype.toObservable = function (scheduler) {
      var self = this;
      isScheduler(scheduler) || (scheduler = immediateScheduler);
      return new AnonymousObservable(function (observer) {
        return scheduler.scheduleWithState(self, function (_, notification) {
          notification._acceptObservable(observer);
          notification.kind === 'N' && observer.onCompleted();
        });
      });
    };

    return Notification;
  })();

  /**
   * Creates an object that represents an OnNext notification to an observer.
   * @param {Any} value The value contained in the notification.
   * @returns {Notification} The OnNext notification containing the value.
   */
  var notificationCreateOnNext = Notification.createOnNext = (function () {
      function _accept(onNext) { return onNext(this.value); }
      function _acceptObservable(observer) { return observer.onNext(this.value); }
      function toString() { return 'OnNext(' + this.value + ')'; }

      return function (value) {
        return new Notification('N', value, null, _accept, _acceptObservable, toString);
      };
  }());

  /**
   * Creates an object that represents an OnError notification to an observer.
   * @param {Any} error The exception contained in the notification.
   * @returns {Notification} The OnError notification containing the exception.
   */
  var notificationCreateOnError = Notification.createOnError = (function () {
    function _accept (onNext, onError) { return onError(this.exception); }
    function _acceptObservable(observer) { return observer.onError(this.exception); }
    function toString () { return 'OnError(' + this.exception + ')'; }

    return function (e) {
      return new Notification('E', null, e, _accept, _acceptObservable, toString);
    };
  }());

  /**
   * Creates an object that represents an OnCompleted notification to an observer.
   * @returns {Notification} The OnCompleted notification.
   */
  var notificationCreateOnCompleted = Notification.createOnCompleted = (function () {
    function _accept (onNext, onError, onCompleted) { return onCompleted(); }
    function _acceptObservable(observer) { return observer.onCompleted(); }
    function toString () { return 'OnCompleted()'; }

    return function () {
      return new Notification('C', null, null, _accept, _acceptObservable, toString);
    };
  }());

  /**
   * Supports push-style iteration over an observable sequence.
   */
  var Observer = Rx.Observer = function () { };

  /**
   *  Creates a notification callback from an observer.
   * @returns The action that forwards its input notification to the underlying observer.
   */
  Observer.prototype.toNotifier = function () {
    var observer = this;
    return function (n) { return n.accept(observer); };
  };

  /**
   *  Hides the identity of an observer.
   * @returns An observer that hides the identity of the specified observer.
   */
  Observer.prototype.asObserver = function () {
    return new AnonymousObserver(this.onNext.bind(this), this.onError.bind(this), this.onCompleted.bind(this));
  };

  /**
   *  Checks access to the observer for grammar violations. This includes checking for multiple OnError or OnCompleted calls, as well as reentrancy in any of the observer methods.
   *  If a violation is detected, an Error is thrown from the offending observer method call.
   * @returns An observer that checks callbacks invocations against the observer grammar and, if the checks pass, forwards those to the specified observer.
   */
  Observer.prototype.checked = function () { return new CheckedObserver(this); };

  /**
   *  Creates an observer from the specified OnNext, along with optional OnError, and OnCompleted actions.
   * @param {Function} [onNext] Observer's OnNext action implementation.
   * @param {Function} [onError] Observer's OnError action implementation.
   * @param {Function} [onCompleted] Observer's OnCompleted action implementation.
   * @returns {Observer} The observer object implemented using the given actions.
   */
  var observerCreate = Observer.create = function (onNext, onError, onCompleted) {
    onNext || (onNext = noop);
    onError || (onError = defaultError);
    onCompleted || (onCompleted = noop);
    return new AnonymousObserver(onNext, onError, onCompleted);
  };

  /**
   *  Creates an observer from a notification callback.
   *
   * @static
   * @memberOf Observer
   * @param {Function} handler Action that handles a notification.
   * @returns The observer object that invokes the specified handler using a notification corresponding to each message it receives.
   */
  Observer.fromNotifier = function (handler, thisArg) {
    return new AnonymousObserver(function (x) {
      return handler.call(thisArg, notificationCreateOnNext(x));
    }, function (e) {
      return handler.call(thisArg, notificationCreateOnError(e));
    }, function () {
      return handler.call(thisArg, notificationCreateOnCompleted());
    });
  };

  /**
   * Schedules the invocation of observer methods on the given scheduler.
   * @param {Scheduler} scheduler Scheduler to schedule observer messages on.
   * @returns {Observer} Observer whose messages are scheduled on the given scheduler.
   */
  Observer.prototype.notifyOn = function (scheduler) {
    return new ObserveOnObserver(scheduler, this);
  };

  Observer.prototype.makeSafe = function(disposable) {
    return new AnonymousSafeObserver(this._onNext, this._onError, this._onCompleted, disposable);
  };

  /**
   * Abstract base class for implementations of the Observer class.
   * This base class enforces the grammar of observers where OnError and OnCompleted are terminal messages.
   */
  var AbstractObserver = Rx.internals.AbstractObserver = (function (__super__) {
    inherits(AbstractObserver, __super__);

    /**
     * Creates a new observer in a non-stopped state.
     */
    function AbstractObserver() {
      this.isStopped = false;
      __super__.call(this);
    }

    // Must be implemented by other observers
    AbstractObserver.prototype.next = notImplemented;
    AbstractObserver.prototype.error = notImplemented;
    AbstractObserver.prototype.completed = notImplemented;

    /**
     * Notifies the observer of a new element in the sequence.
     * @param {Any} value Next element in the sequence.
     */
    AbstractObserver.prototype.onNext = function (value) {
      if (!this.isStopped) { this.next(value); }
    };

    /**
     * Notifies the observer that an exception has occurred.
     * @param {Any} error The error that has occurred.
     */
    AbstractObserver.prototype.onError = function (error) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.error(error);
      }
    };

    /**
     * Notifies the observer of the end of the sequence.
     */
    AbstractObserver.prototype.onCompleted = function () {
      if (!this.isStopped) {
        this.isStopped = true;
        this.completed();
      }
    };

    /**
     * Disposes the observer, causing it to transition to the stopped state.
     */
    AbstractObserver.prototype.dispose = function () {
      this.isStopped = true;
    };

    AbstractObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.error(e);
        return true;
      }

      return false;
    };

    return AbstractObserver;
  }(Observer));

  /**
   * Class to create an Observer instance from delegate-based implementations of the on* methods.
   */
  var AnonymousObserver = Rx.AnonymousObserver = (function (__super__) {
    inherits(AnonymousObserver, __super__);

    /**
     * Creates an observer from the specified OnNext, OnError, and OnCompleted actions.
     * @param {Any} onNext Observer's OnNext action implementation.
     * @param {Any} onError Observer's OnError action implementation.
     * @param {Any} onCompleted Observer's OnCompleted action implementation.
     */
    function AnonymousObserver(onNext, onError, onCompleted) {
      __super__.call(this);
      this._onNext = onNext;
      this._onError = onError;
      this._onCompleted = onCompleted;
    }

    /**
     * Calls the onNext action.
     * @param {Any} value Next element in the sequence.
     */
    AnonymousObserver.prototype.next = function (value) {
      this._onNext(value);
    };

    /**
     * Calls the onError action.
     * @param {Any} error The error that has occurred.
     */
    AnonymousObserver.prototype.error = function (error) {
      this._onError(error);
    };

    /**
     *  Calls the onCompleted action.
     */
    AnonymousObserver.prototype.completed = function () {
      this._onCompleted();
    };

    return AnonymousObserver;
  }(AbstractObserver));

  var CheckedObserver = (function (__super__) {
    inherits(CheckedObserver, __super__);

    function CheckedObserver(observer) {
      __super__.call(this);
      this._observer = observer;
      this._state = 0; // 0 - idle, 1 - busy, 2 - done
    }

    var CheckedObserverPrototype = CheckedObserver.prototype;

    CheckedObserverPrototype.onNext = function (value) {
      this.checkAccess();
      var res = tryCatch(this._observer.onNext).call(this._observer, value);
      this._state = 0;
      res === errorObj && thrower(res.e);
    };

    CheckedObserverPrototype.onError = function (err) {
      this.checkAccess();
      var res = tryCatch(this._observer.onError).call(this._observer, err);
      this._state = 2;
      res === errorObj && thrower(res.e);
    };

    CheckedObserverPrototype.onCompleted = function () {
      this.checkAccess();
      var res = tryCatch(this._observer.onCompleted).call(this._observer);
      this._state = 2;
      res === errorObj && thrower(res.e);
    };

    CheckedObserverPrototype.checkAccess = function () {
      if (this._state === 1) { throw new Error('Re-entrancy detected'); }
      if (this._state === 2) { throw new Error('Observer completed'); }
      if (this._state === 0) { this._state = 1; }
    };

    return CheckedObserver;
  }(Observer));

  var ScheduledObserver = Rx.internals.ScheduledObserver = (function (__super__) {
    inherits(ScheduledObserver, __super__);

    function ScheduledObserver(scheduler, observer) {
      __super__.call(this);
      this.scheduler = scheduler;
      this.observer = observer;
      this.isAcquired = false;
      this.hasFaulted = false;
      this.queue = [];
      this.disposable = new SerialDisposable();
    }

    ScheduledObserver.prototype.next = function (value) {
      var self = this;
      this.queue.push(function () { self.observer.onNext(value); });
    };

    ScheduledObserver.prototype.error = function (e) {
      var self = this;
      this.queue.push(function () { self.observer.onError(e); });
    };

    ScheduledObserver.prototype.completed = function () {
      var self = this;
      this.queue.push(function () { self.observer.onCompleted(); });
    };

    ScheduledObserver.prototype.ensureActive = function () {
      var isOwner = false, parent = this;
      if (!this.hasFaulted && this.queue.length > 0) {
        isOwner = !this.isAcquired;
        this.isAcquired = true;
      }
      if (isOwner) {
        this.disposable.setDisposable(this.scheduler.scheduleRecursive(function (self) {
          var work;
          if (parent.queue.length > 0) {
            work = parent.queue.shift();
          } else {
            parent.isAcquired = false;
            return;
          }
          try {
            work();
          } catch (ex) {
            parent.queue = [];
            parent.hasFaulted = true;
            throw ex;
          }
          self();
        }));
      }
    };

    ScheduledObserver.prototype.dispose = function () {
      __super__.prototype.dispose.call(this);
      this.disposable.dispose();
    };

    return ScheduledObserver;
  }(AbstractObserver));

  var ObserveOnObserver = (function (__super__) {
    inherits(ObserveOnObserver, __super__);

    function ObserveOnObserver(scheduler, observer, cancel) {
      __super__.call(this, scheduler, observer);
      this._cancel = cancel;
    }

    ObserveOnObserver.prototype.next = function (value) {
      __super__.prototype.next.call(this, value);
      this.ensureActive();
    };

    ObserveOnObserver.prototype.error = function (e) {
      __super__.prototype.error.call(this, e);
      this.ensureActive();
    };

    ObserveOnObserver.prototype.completed = function () {
      __super__.prototype.completed.call(this);
      this.ensureActive();
    };

    ObserveOnObserver.prototype.dispose = function () {
      __super__.prototype.dispose.call(this);
      this._cancel && this._cancel.dispose();
      this._cancel = null;
    };

    return ObserveOnObserver;
  })(ScheduledObserver);

  var observableProto;

  /**
   * Represents a push-style collection.
   */
  var Observable = Rx.Observable = (function () {

    function Observable(subscribe) {
      if (Rx.config.longStackSupport && hasStacks) {
        try {
          throw new Error();
        } catch (e) {
          this.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }

        var self = this;
        this._subscribe = function (observer) {
          var oldOnError = observer.onError.bind(observer);

          observer.onError = function (err) {
            makeStackTraceLong(err, self);
            oldOnError(err);
          };

          return subscribe.call(self, observer);
        };
      } else {
        this._subscribe = subscribe;
      }
    }

    observableProto = Observable.prototype;

    /**
     *  Subscribes an observer to the observable sequence.
     *  @param {Mixed} [observerOrOnNext] The object that is to receive notifications or an action to invoke for each element in the observable sequence.
     *  @param {Function} [onError] Action to invoke upon exceptional termination of the observable sequence.
     *  @param {Function} [onCompleted] Action to invoke upon graceful termination of the observable sequence.
     *  @returns {Diposable} A disposable handling the subscriptions and unsubscriptions.
     */
    observableProto.subscribe = observableProto.forEach = function (observerOrOnNext, onError, onCompleted) {
      return this._subscribe(typeof observerOrOnNext === 'object' ?
        observerOrOnNext :
        observerCreate(observerOrOnNext, onError, onCompleted));
    };

    /**
     * Subscribes to the next value in the sequence with an optional "this" argument.
     * @param {Function} onNext The function to invoke on each element in the observable sequence.
     * @param {Any} [thisArg] Object to use as this when executing callback.
     * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
     */
    observableProto.subscribeOnNext = function (onNext, thisArg) {
      return this._subscribe(observerCreate(typeof thisArg !== 'undefined' ? function(x) { onNext.call(thisArg, x); } : onNext));
    };

    /**
     * Subscribes to an exceptional condition in the sequence with an optional "this" argument.
     * @param {Function} onError The function to invoke upon exceptional termination of the observable sequence.
     * @param {Any} [thisArg] Object to use as this when executing callback.
     * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
     */
    observableProto.subscribeOnError = function (onError, thisArg) {
      return this._subscribe(observerCreate(null, typeof thisArg !== 'undefined' ? function(e) { onError.call(thisArg, e); } : onError));
    };

    /**
     * Subscribes to the next value in the sequence with an optional "this" argument.
     * @param {Function} onCompleted The function to invoke upon graceful termination of the observable sequence.
     * @param {Any} [thisArg] Object to use as this when executing callback.
     * @returns {Disposable} A disposable handling the subscriptions and unsubscriptions.
     */
    observableProto.subscribeOnCompleted = function (onCompleted, thisArg) {
      return this._subscribe(observerCreate(null, null, typeof thisArg !== 'undefined' ? function() { onCompleted.call(thisArg); } : onCompleted));
    };

    return Observable;
  })();

  var ObservableBase = Rx.ObservableBase = (function (__super__) {
    inherits(ObservableBase, __super__);

    function fixSubscriber(subscriber) {
      return subscriber && isFunction(subscriber.dispose) ? subscriber :
        isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
    }

    function setDisposable(s, state) {
      var ado = state[0], self = state[1];
      var sub = tryCatch(self.subscribeCore).call(self, ado);

      if (sub === errorObj) {
        if(!ado.fail(errorObj.e)) { return thrower(errorObj.e); }
      }
      ado.setDisposable(fixSubscriber(sub));
    }

    function subscribe(observer) {
      var ado = new AutoDetachObserver(observer), state = [ado, this];

      if (currentThreadScheduler.scheduleRequired()) {
        currentThreadScheduler.scheduleWithState(state, setDisposable);
      } else {
        setDisposable(null, state);
      }
      return ado;
    }

    function ObservableBase() {
      __super__.call(this, subscribe);
    }

    ObservableBase.prototype.subscribeCore = notImplemented;

    return ObservableBase;
  }(Observable));

  var Enumerable = Rx.internals.Enumerable = function () { };

  var ConcatEnumerableObservable = (function(__super__) {
    inherits(ConcatEnumerableObservable, __super__);
    function ConcatEnumerableObservable(sources) {
      this.sources = sources;
      __super__.call(this);
    }
    
    ConcatEnumerableObservable.prototype.subscribeCore = function (o) {
      var isDisposed, subscription = new SerialDisposable();
      var cancelable = immediateScheduler.scheduleRecursiveWithState(this.sources[$iterator$](), function (e, self) {
        if (isDisposed) { return; }
        var currentItem = tryCatch(e.next).call(e);
        if (currentItem === errorObj) { return o.onError(currentItem.e); }

        if (currentItem.done) {
          return o.onCompleted();
        }

        // Check if promise
        var currentValue = currentItem.value;
        isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

        var d = new SingleAssignmentDisposable();
        subscription.setDisposable(d);
        d.setDisposable(currentValue.subscribe(new InnerObserver(o, self, e)));
      });

      return new CompositeDisposable(subscription, cancelable, disposableCreate(function () {
        isDisposed = true;
      }));
    };
    
    function InnerObserver(o, s, e) {
      this.o = o;
      this.s = s;
      this.e = e;
      this.isStopped = false;
    }
    InnerObserver.prototype.onNext = function (x) { if(!this.isStopped) { this.o.onNext(x); } };
    InnerObserver.prototype.onError = function (err) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(err);
      }
    };
    InnerObserver.prototype.onCompleted = function () {
      if (!this.isStopped) {
        this.isStopped = true;
        this.s(this.e);
      }
    };
    InnerObserver.prototype.dispose = function () { this.isStopped = true; };
    InnerObserver.prototype.fail = function (err) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(err);
        return true;
      }
      return false;
    };
    
    return ConcatEnumerableObservable;
  }(ObservableBase));

  Enumerable.prototype.concat = function () {
    return new ConcatEnumerableObservable(this);
  };
  
  var CatchErrorObservable = (function(__super__) {
    inherits(CatchErrorObservable, __super__);
    function CatchErrorObservable(sources) {
      this.sources = sources;
      __super__.call(this);
    }
    
    CatchErrorObservable.prototype.subscribeCore = function (o) {
      var e = this.sources[$iterator$]();

      var isDisposed, subscription = new SerialDisposable();
      var cancelable = immediateScheduler.scheduleRecursiveWithState(null, function (lastException, self) {
        if (isDisposed) { return; }
        var currentItem = tryCatch(e.next).call(e);
        if (currentItem === errorObj) { return o.onError(currentItem.e); }

        if (currentItem.done) {
          return lastException !== null ? o.onError(lastException) : o.onCompleted();
        }

        // Check if promise
        var currentValue = currentItem.value;
        isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

        var d = new SingleAssignmentDisposable();
        subscription.setDisposable(d);
        d.setDisposable(currentValue.subscribe(
          function(x) { o.onNext(x); },
          self,
          function() { o.onCompleted(); }));
      });
      return new CompositeDisposable(subscription, cancelable, disposableCreate(function () {
        isDisposed = true;
      }));
    };
    
    return CatchErrorObservable;
  }(ObservableBase));

  Enumerable.prototype.catchError = function () {
    return new CatchErrorObservable(this);
  };

  Enumerable.prototype.catchErrorWhen = function (notificationHandler) {
    var sources = this;
    return new AnonymousObservable(function (o) {
      var exceptions = new Subject(),
        notifier = new Subject(),
        handled = notificationHandler(exceptions),
        notificationDisposable = handled.subscribe(notifier);

      var e = sources[$iterator$]();

      var isDisposed,
        lastException,
        subscription = new SerialDisposable();
      var cancelable = immediateScheduler.scheduleRecursive(function (self) {
        if (isDisposed) { return; }
        var currentItem = tryCatch(e.next).call(e);
        if (currentItem === errorObj) { return o.onError(currentItem.e); }

        if (currentItem.done) {
          if (lastException) {
            o.onError(lastException);
          } else {
            o.onCompleted();
          }
          return;
        }

        // Check if promise
        var currentValue = currentItem.value;
        isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

        var outer = new SingleAssignmentDisposable();
        var inner = new SingleAssignmentDisposable();
        subscription.setDisposable(new CompositeDisposable(inner, outer));
        outer.setDisposable(currentValue.subscribe(
          function(x) { o.onNext(x); },
          function (exn) {
            inner.setDisposable(notifier.subscribe(self, function(ex) {
              o.onError(ex);
            }, function() {
              o.onCompleted();
            }));

            exceptions.onNext(exn);
          },
          function() { o.onCompleted(); }));
      });

      return new CompositeDisposable(notificationDisposable, subscription, cancelable, disposableCreate(function () {
        isDisposed = true;
      }));
    });
  };
  
  var RepeatEnumerable = (function (__super__) {
    inherits(RepeatEnumerable, __super__);
    
    function RepeatEnumerable(v, c) {
      this.v = v;
      this.c = c == null ? -1 : c;
    }
    RepeatEnumerable.prototype[$iterator$] = function () {
      return new RepeatEnumerator(this); 
    };
    
    function RepeatEnumerator(p) {
      this.v = p.v;
      this.l = p.c;
    }
    RepeatEnumerator.prototype.next = function () {
      if (this.l === 0) { return doneEnumerator; }
      if (this.l > 0) { this.l--; }
      return { done: false, value: this.v }; 
    };
    
    return RepeatEnumerable;
  }(Enumerable));

  var enumerableRepeat = Enumerable.repeat = function (value, repeatCount) {
    return new RepeatEnumerable(value, repeatCount);
  };
  
  var OfEnumerable = (function(__super__) {
    inherits(OfEnumerable, __super__);
    function OfEnumerable(s, fn, thisArg) {
      this.s = s;
      this.fn = fn ? bindCallback(fn, thisArg, 3) : null;
    }
    OfEnumerable.prototype[$iterator$] = function () {
      return new OfEnumerator(this);
    };
    
    function OfEnumerator(p) {
      this.i = -1;
      this.s = p.s;
      this.l = this.s.length;
      this.fn = p.fn;
    }
    OfEnumerator.prototype.next = function () {
     return ++this.i < this.l ?
       { done: false, value: !this.fn ? this.s[this.i] : this.fn(this.s[this.i], this.i, this.s) } :
       doneEnumerator; 
    };
    
    return OfEnumerable;
  }(Enumerable));

  var enumerableOf = Enumerable.of = function (source, selector, thisArg) {
    return new OfEnumerable(source, selector, thisArg);
  };

   /**
   *  Wraps the source sequence in order to run its observer callbacks on the specified scheduler.
   *
   *  This only invokes observer callbacks on a scheduler. In case the subscription and/or unsubscription actions have side-effects
   *  that require to be run on a scheduler, use subscribeOn.
   *
   *  @param {Scheduler} scheduler Scheduler to notify observers on.
   *  @returns {Observable} The source sequence whose observations happen on the specified scheduler.
   */
  observableProto.observeOn = function (scheduler) {
    var source = this;
    return new AnonymousObservable(function (observer) {
      return source.subscribe(new ObserveOnObserver(scheduler, observer));
    }, source);
  };

   /**
   *  Wraps the source sequence in order to run its subscription and unsubscription logic on the specified scheduler. This operation is not commonly used;
   *  see the remarks section for more information on the distinction between subscribeOn and observeOn.

   *  This only performs the side-effects of subscription and unsubscription on the specified scheduler. In order to invoke observer
   *  callbacks on a scheduler, use observeOn.

   *  @param {Scheduler} scheduler Scheduler to perform subscription and unsubscription actions on.
   *  @returns {Observable} The source sequence whose subscriptions and unsubscriptions happen on the specified scheduler.
   */
  observableProto.subscribeOn = function (scheduler) {
    var source = this;
    return new AnonymousObservable(function (observer) {
      var m = new SingleAssignmentDisposable(), d = new SerialDisposable();
      d.setDisposable(m);
      m.setDisposable(scheduler.schedule(function () {
        d.setDisposable(new ScheduledDisposable(scheduler, source.subscribe(observer)));
      }));
      return d;
    }, source);
  };

	var FromPromiseObservable = (function(__super__) {
		inherits(FromPromiseObservable, __super__);
		function FromPromiseObservable(p) {
			this.p = p;
			__super__.call(this);
		}
		
		FromPromiseObservable.prototype.subscribeCore = function(o) {
			this.p.then(function (data) {
				o.onNext(data);
				o.onCompleted();
			}, function (err) { o.onError(err); });
			return disposableEmpty;	
		};
		
		return FromPromiseObservable;
	}(ObservableBase));	 
	 
	 /**
	 * Converts a Promise to an Observable sequence
	 * @param {Promise} An ES6 Compliant promise.
	 * @returns {Observable} An Observable sequence which wraps the existing promise success and failure.
	 */
	var observableFromPromise = Observable.fromPromise = function (promise) {
		return new FromPromiseObservable(promise);
	};
  /*
   * Converts an existing observable sequence to an ES6 Compatible Promise
   * @example
   * var promise = Rx.Observable.return(42).toPromise(RSVP.Promise);
   *
   * // With config
   * Rx.config.Promise = RSVP.Promise;
   * var promise = Rx.Observable.return(42).toPromise();
   * @param {Function} [promiseCtor] The constructor of the promise. If not provided, it looks for it in Rx.config.Promise.
   * @returns {Promise} An ES6 compatible promise with the last value from the observable sequence.
   */
  observableProto.toPromise = function (promiseCtor) {
    promiseCtor || (promiseCtor = Rx.config.Promise);
    if (!promiseCtor) { throw new NotSupportedError('Promise type not provided nor in Rx.config.Promise'); }
    var source = this;
    return new promiseCtor(function (resolve, reject) {
      // No cancellation can be done
      var value, hasValue = false;
      source.subscribe(function (v) {
        value = v;
        hasValue = true;
      }, reject, function () {
        hasValue && resolve(value);
      });
    });
  };

  var ToArrayObservable = (function(__super__) {
    inherits(ToArrayObservable, __super__);
    function ToArrayObservable(source) {
      this.source = source;
      __super__.call(this);
    }

    ToArrayObservable.prototype.subscribeCore = function(o) {
      return this.source.subscribe(new InnerObserver(o));
    };

    function InnerObserver(o) {
      this.o = o;
      this.a = [];
      this.isStopped = false;
    }
    InnerObserver.prototype.onNext = function (x) { if(!this.isStopped) { this.a.push(x); } };
    InnerObserver.prototype.onError = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
      }
    };
    InnerObserver.prototype.onCompleted = function () {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onNext(this.a);
        this.o.onCompleted();
      }
    };
    InnerObserver.prototype.dispose = function () { this.isStopped = true; }
    InnerObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
        return true;
      }
 
      return false;
    };

    return ToArrayObservable;
  }(ObservableBase));

  /**
  * Creates an array from an observable sequence.
  * @returns {Observable} An observable sequence containing a single element with a list containing all the elements of the source sequence.
  */
  observableProto.toArray = function () {
    return new ToArrayObservable(this);
  };

  /**
   *  Creates an observable sequence from a specified subscribe method implementation.
   * @example
   *  var res = Rx.Observable.create(function (observer) { return function () { } );
   *  var res = Rx.Observable.create(function (observer) { return Rx.Disposable.empty; } );
   *  var res = Rx.Observable.create(function (observer) { } );
   * @param {Function} subscribe Implementation of the resulting observable sequence's subscribe method, returning a function that will be wrapped in a Disposable.
   * @returns {Observable} The observable sequence with the specified implementation for the Subscribe method.
   */
  Observable.create = Observable.createWithDisposable = function (subscribe, parent) {
    return new AnonymousObservable(subscribe, parent);
  };

  /**
   *  Returns an observable sequence that invokes the specified factory function whenever a new observer subscribes.
   *
   * @example
   *  var res = Rx.Observable.defer(function () { return Rx.Observable.fromArray([1,2,3]); });
   * @param {Function} observableFactory Observable factory function to invoke for each observer that subscribes to the resulting sequence or Promise.
   * @returns {Observable} An observable sequence whose observers trigger an invocation of the given observable factory function.
   */
  var observableDefer = Observable.defer = function (observableFactory) {
    return new AnonymousObservable(function (observer) {
      var result;
      try {
        result = observableFactory();
      } catch (e) {
        return observableThrow(e).subscribe(observer);
      }
      isPromise(result) && (result = observableFromPromise(result));
      return result.subscribe(observer);
    });
  };

  var EmptyObservable = (function(__super__) {
    inherits(EmptyObservable, __super__);
    function EmptyObservable(scheduler) {
      this.scheduler = scheduler;
      __super__.call(this);
    }

    EmptyObservable.prototype.subscribeCore = function (observer) {
      var sink = new EmptySink(observer, this);
      return sink.run();
    };

    function EmptySink(observer, parent) {
      this.observer = observer;
      this.parent = parent;
    }

    function scheduleItem(s, state) {
      state.onCompleted();
    }

    EmptySink.prototype.run = function () {
      return this.parent.scheduler.scheduleWithState(this.observer, scheduleItem);
    };

    return EmptyObservable;
  }(ObservableBase));

  /**
   *  Returns an empty observable sequence, using the specified scheduler to send out the single OnCompleted message.
   *
   * @example
   *  var res = Rx.Observable.empty();
   *  var res = Rx.Observable.empty(Rx.Scheduler.timeout);
   * @param {Scheduler} [scheduler] Scheduler to send the termination call on.
   * @returns {Observable} An observable sequence with no elements.
   */
  var observableEmpty = Observable.empty = function (scheduler) {
    isScheduler(scheduler) || (scheduler = immediateScheduler);
    return new EmptyObservable(scheduler);
  };

  var FromObservable = (function(__super__) {
    inherits(FromObservable, __super__);
    function FromObservable(iterable, mapper, scheduler) {
      this.iterable = iterable;
      this.mapper = mapper;
      this.scheduler = scheduler;
      __super__.call(this);
    }

    FromObservable.prototype.subscribeCore = function (observer) {
      var sink = new FromSink(observer, this);
      return sink.run();
    };

    return FromObservable;
  }(ObservableBase));

  var FromSink = (function () {
    function FromSink(observer, parent) {
      this.observer = observer;
      this.parent = parent;
    }

    FromSink.prototype.run = function () {
      var list = Object(this.parent.iterable),
          it = getIterable(list),
          observer = this.observer,
          mapper = this.parent.mapper;

      function loopRecursive(i, recurse) {
        try {
          var next = it.next();
        } catch (e) {
          return observer.onError(e);
        }
        if (next.done) {
          return observer.onCompleted();
        }

        var result = next.value;

        if (mapper) {
          try {
            result = mapper(result, i);
          } catch (e) {
            return observer.onError(e);
          }
        }

        observer.onNext(result);
        recurse(i + 1);
      }

      return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
    };

    return FromSink;
  }());

  var maxSafeInteger = Math.pow(2, 53) - 1;

  function StringIterable(str) {
    this._s = s;
  }

  StringIterable.prototype[$iterator$] = function () {
    return new StringIterator(this._s);
  };

  function StringIterator(str) {
    this._s = s;
    this._l = s.length;
    this._i = 0;
  }

  StringIterator.prototype[$iterator$] = function () {
    return this;
  };

  StringIterator.prototype.next = function () {
    return this._i < this._l ? { done: false, value: this._s.charAt(this._i++) } : doneEnumerator;
  };

  function ArrayIterable(a) {
    this._a = a;
  }

  ArrayIterable.prototype[$iterator$] = function () {
    return new ArrayIterator(this._a);
  };

  function ArrayIterator(a) {
    this._a = a;
    this._l = toLength(a);
    this._i = 0;
  }

  ArrayIterator.prototype[$iterator$] = function () {
    return this;
  };

  ArrayIterator.prototype.next = function () {
    return this._i < this._l ? { done: false, value: this._a[this._i++] } : doneEnumerator;
  };

  function numberIsFinite(value) {
    return typeof value === 'number' && root.isFinite(value);
  }

  function isNan(n) {
    return n !== n;
  }

  function getIterable(o) {
    var i = o[$iterator$], it;
    if (!i && typeof o === 'string') {
      it = new StringIterable(o);
      return it[$iterator$]();
    }
    if (!i && o.length !== undefined) {
      it = new ArrayIterable(o);
      return it[$iterator$]();
    }
    if (!i) { throw new TypeError('Object is not iterable'); }
    return o[$iterator$]();
  }

  function sign(value) {
    var number = +value;
    if (number === 0) { return number; }
    if (isNaN(number)) { return number; }
    return number < 0 ? -1 : 1;
  }

  function toLength(o) {
    var len = +o.length;
    if (isNaN(len)) { return 0; }
    if (len === 0 || !numberIsFinite(len)) { return len; }
    len = sign(len) * Math.floor(Math.abs(len));
    if (len <= 0) { return 0; }
    if (len > maxSafeInteger) { return maxSafeInteger; }
    return len;
  }

  /**
  * This method creates a new Observable sequence from an array-like or iterable object.
  * @param {Any} arrayLike An array-like or iterable object to convert to an Observable sequence.
  * @param {Function} [mapFn] Map function to call on every element of the array.
  * @param {Any} [thisArg] The context to use calling the mapFn if provided.
  * @param {Scheduler} [scheduler] Optional scheduler to use for scheduling.  If not provided, defaults to Scheduler.currentThread.
  */
  var observableFrom = Observable.from = function (iterable, mapFn, thisArg, scheduler) {
    if (iterable == null) {
      throw new Error('iterable cannot be null.')
    }
    if (mapFn && !isFunction(mapFn)) {
      throw new Error('mapFn when provided must be a function');
    }
    if (mapFn) {
      var mapper = bindCallback(mapFn, thisArg, 2);
    }
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new FromObservable(iterable, mapper, scheduler);
  }

  var FromArrayObservable = (function(__super__) {
    inherits(FromArrayObservable, __super__);
    function FromArrayObservable(args, scheduler) {
      this.args = args;
      this.scheduler = scheduler;
      __super__.call(this);
    }

    FromArrayObservable.prototype.subscribeCore = function (observer) {
      var sink = new FromArraySink(observer, this);
      return sink.run();
    };

    return FromArrayObservable;
  }(ObservableBase));

  function FromArraySink(observer, parent) {
    this.observer = observer;
    this.parent = parent;
  }

  FromArraySink.prototype.run = function () {
    var observer = this.observer, args = this.parent.args, len = args.length;
    function loopRecursive(i, recurse) {
      if (i < len) {
        observer.onNext(args[i]);
        recurse(i + 1);
      } else {
        observer.onCompleted();
      }
    }

    return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
  };

  /**
  *  Converts an array to an observable sequence, using an optional scheduler to enumerate the array.
  * @deprecated use Observable.from or Observable.of
  * @param {Scheduler} [scheduler] Scheduler to run the enumeration of the input sequence on.
  * @returns {Observable} The observable sequence whose elements are pulled from the given enumerable sequence.
  */
  var observableFromArray = Observable.fromArray = function (array, scheduler) {
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new FromArrayObservable(array, scheduler)
  };

  /**
   *  Generates an observable sequence by running a state-driven loop producing the sequence's elements, using the specified scheduler to send out observer messages.
   *
   * @example
   *  var res = Rx.Observable.generate(0, function (x) { return x < 10; }, function (x) { return x + 1; }, function (x) { return x; });
   *  var res = Rx.Observable.generate(0, function (x) { return x < 10; }, function (x) { return x + 1; }, function (x) { return x; }, Rx.Scheduler.timeout);
   * @param {Mixed} initialState Initial state.
   * @param {Function} condition Condition to terminate generation (upon returning false).
   * @param {Function} iterate Iteration step function.
   * @param {Function} resultSelector Selector function for results produced in the sequence.
   * @param {Scheduler} [scheduler] Scheduler on which to run the generator loop. If not provided, defaults to Scheduler.currentThread.
   * @returns {Observable} The generated sequence.
   */
  Observable.generate = function (initialState, condition, iterate, resultSelector, scheduler) {
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new AnonymousObservable(function (o) {
      var first = true;
      return scheduler.scheduleRecursiveWithState(initialState, function (state, self) {
        var hasResult, result;
        try {
          if (first) {
            first = false;
          } else {
            state = iterate(state);
          }
          hasResult = condition(state);
          hasResult && (result = resultSelector(state));
        } catch (e) {
          return o.onError(e);
        }
        if (hasResult) {
          o.onNext(result);
          self(state);
        } else {
          o.onCompleted();
        }
      });
    });
  };

  var NeverObservable = (function(__super__) {
    inherits(NeverObservable, __super__);
    function NeverObservable() {
      __super__.call(this);
    }

    NeverObservable.prototype.subscribeCore = function (observer) {
      return disposableEmpty;
    };

    return NeverObservable;
  }(ObservableBase));

  /**
   * Returns a non-terminating observable sequence, which can be used to denote an infinite duration (e.g. when using reactive joins).
   * @returns {Observable} An observable sequence whose observers will never get called.
   */
  var observableNever = Observable.never = function () {
    return new NeverObservable();
  };

  function observableOf (scheduler, array) {
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new FromArrayObservable(array, scheduler);
  }

  /**
  *  This method creates a new Observable instance with a variable number of arguments, regardless of number or type of the arguments.
  * @returns {Observable} The observable sequence whose elements are pulled from the given arguments.
  */
  Observable.of = function () {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    return new FromArrayObservable(args, currentThreadScheduler);
  };

  /**
  *  This method creates a new Observable instance with a variable number of arguments, regardless of number or type of the arguments.
  * @param {Scheduler} scheduler A scheduler to use for scheduling the arguments.
  * @returns {Observable} The observable sequence whose elements are pulled from the given arguments.
  */
  Observable.ofWithScheduler = function (scheduler) {
    var len = arguments.length, args = new Array(len - 1);
    for(var i = 1; i < len; i++) { args[i - 1] = arguments[i]; }
    return new FromArrayObservable(args, scheduler);
  };

  var PairsObservable = (function(__super__) {
    inherits(PairsObservable, __super__);
    function PairsObservable(obj, scheduler) {
      this.obj = obj;
      this.keys = Object.keys(obj);
      this.scheduler = scheduler;
      __super__.call(this);
    }

    PairsObservable.prototype.subscribeCore = function (observer) {
      var sink = new PairsSink(observer, this);
      return sink.run();
    };

    return PairsObservable;
  }(ObservableBase));

  function PairsSink(observer, parent) {
    this.observer = observer;
    this.parent = parent;
  }

  PairsSink.prototype.run = function () {
    var observer = this.observer, obj = this.parent.obj, keys = this.parent.keys, len = keys.length;
    function loopRecursive(i, recurse) {
      if (i < len) {
        var key = keys[i];
        observer.onNext([key, obj[key]]);
        recurse(i + 1);
      } else {
        observer.onCompleted();
      }
    }

    return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
  };

  /**
   * Convert an object into an observable sequence of [key, value] pairs.
   * @param {Object} obj The object to inspect.
   * @param {Scheduler} [scheduler] Scheduler to run the enumeration of the input sequence on.
   * @returns {Observable} An observable sequence of [key, value] pairs from the object.
   */
  Observable.pairs = function (obj, scheduler) {
    scheduler || (scheduler = currentThreadScheduler);
    return new PairsObservable(obj, scheduler);
  };

    var RangeObservable = (function(__super__) {
    inherits(RangeObservable, __super__);
    function RangeObservable(start, count, scheduler) {
      this.start = start;
      this.rangeCount = count;
      this.scheduler = scheduler;
      __super__.call(this);
    }

    RangeObservable.prototype.subscribeCore = function (observer) {
      var sink = new RangeSink(observer, this);
      return sink.run();
    };

    return RangeObservable;
  }(ObservableBase));

  var RangeSink = (function () {
    function RangeSink(observer, parent) {
      this.observer = observer;
      this.parent = parent;
    }

    RangeSink.prototype.run = function () {
      var start = this.parent.start, count = this.parent.rangeCount, observer = this.observer;
      function loopRecursive(i, recurse) {
        if (i < count) {
          observer.onNext(start + i);
          recurse(i + 1);
        } else {
          observer.onCompleted();
        }
      }

      return this.parent.scheduler.scheduleRecursiveWithState(0, loopRecursive);
    };

    return RangeSink;
  }());

  /**
  *  Generates an observable sequence of integral numbers within a specified range, using the specified scheduler to send out observer messages.
  * @param {Number} start The value of the first integer in the sequence.
  * @param {Number} count The number of sequential integers to generate.
  * @param {Scheduler} [scheduler] Scheduler to run the generator loop on. If not specified, defaults to Scheduler.currentThread.
  * @returns {Observable} An observable sequence that contains a range of sequential integral numbers.
  */
  Observable.range = function (start, count, scheduler) {
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new RangeObservable(start, count, scheduler);
  };

  var RepeatObservable = (function(__super__) {
    inherits(RepeatObservable, __super__);
    function RepeatObservable(value, repeatCount, scheduler) {
      this.value = value;
      this.repeatCount = repeatCount == null ? -1 : repeatCount;
      this.scheduler = scheduler;
      __super__.call(this);
    }

    RepeatObservable.prototype.subscribeCore = function (observer) {
      var sink = new RepeatSink(observer, this);
      return sink.run();
    };

    return RepeatObservable;
  }(ObservableBase));

  function RepeatSink(observer, parent) {
    this.observer = observer;
    this.parent = parent;
  }

  RepeatSink.prototype.run = function () {
    var observer = this.observer, value = this.parent.value;
    function loopRecursive(i, recurse) {
      if (i === -1 || i > 0) {
        observer.onNext(value);
        i > 0 && i--;
      }
      if (i === 0) { return observer.onCompleted(); }
      recurse(i);
    }

    return this.parent.scheduler.scheduleRecursiveWithState(this.parent.repeatCount, loopRecursive);
  };

  /**
   *  Generates an observable sequence that repeats the given element the specified number of times, using the specified scheduler to send out observer messages.
   * @param {Mixed} value Element to repeat.
   * @param {Number} repeatCount [Optiona] Number of times to repeat the element. If not specified, repeats indefinitely.
   * @param {Scheduler} scheduler Scheduler to run the producer loop on. If not specified, defaults to Scheduler.immediate.
   * @returns {Observable} An observable sequence that repeats the given element the specified number of times.
   */
  Observable.repeat = function (value, repeatCount, scheduler) {
    isScheduler(scheduler) || (scheduler = currentThreadScheduler);
    return new RepeatObservable(value, repeatCount, scheduler);
  };

  var JustObservable = (function(__super__) {
    inherits(JustObservable, __super__);
    function JustObservable(value, scheduler) {
      this.value = value;
      this.scheduler = scheduler;
      __super__.call(this);
    }

    JustObservable.prototype.subscribeCore = function (observer) {
      var sink = new JustSink(observer, this);
      return sink.run();
    };

    function JustSink(observer, parent) {
      this.observer = observer;
      this.parent = parent;
    }

    function scheduleItem(s, state) {
      var value = state[0], observer = state[1];
      observer.onNext(value);
      observer.onCompleted();
    }

    JustSink.prototype.run = function () {
      return this.parent.scheduler.scheduleWithState([this.parent.value, this.observer], scheduleItem);
    };

    return JustObservable;
  }(ObservableBase));

  /**
   *  Returns an observable sequence that contains a single element, using the specified scheduler to send out observer messages.
   *  There is an alias called 'just' or browsers <IE9.
   * @param {Mixed} value Single element in the resulting observable sequence.
   * @param {Scheduler} scheduler Scheduler to send the single element on. If not specified, defaults to Scheduler.immediate.
   * @returns {Observable} An observable sequence containing the single specified element.
   */
  var observableReturn = Observable['return'] = Observable.just = Observable.returnValue = function (value, scheduler) {
    isScheduler(scheduler) || (scheduler = immediateScheduler);
    return new JustObservable(value, scheduler);
  };

  var ThrowObservable = (function(__super__) {
    inherits(ThrowObservable, __super__);
    function ThrowObservable(error, scheduler) {
      this.error = error;
      this.scheduler = scheduler;
      __super__.call(this);
    }

    ThrowObservable.prototype.subscribeCore = function (o) {
      var sink = new ThrowSink(o, this);
      return sink.run();
    };

    function ThrowSink(o, p) {
      this.o = o;
      this.p = p;
    }

    function scheduleItem(s, state) {
      var e = state[0], o = state[1];
      o.onError(e);
    }

    ThrowSink.prototype.run = function () {
      return this.p.scheduler.scheduleWithState([this.p.error, this.o], scheduleItem);
    };

    return ThrowObservable;
  }(ObservableBase));

  /**
   *  Returns an observable sequence that terminates with an exception, using the specified scheduler to send out the single onError message.
   *  There is an alias to this method called 'throwError' for browsers <IE9.
   * @param {Mixed} error An object used for the sequence's termination.
   * @param {Scheduler} scheduler Scheduler to send the exceptional termination call on. If not specified, defaults to Scheduler.immediate.
   * @returns {Observable} The observable sequence that terminates exceptionally with the specified exception object.
   */
  var observableThrow = Observable['throw'] = Observable.throwError = Observable.throwException = function (error, scheduler) {
    isScheduler(scheduler) || (scheduler = immediateScheduler);
    return new ThrowObservable(error, scheduler);
  };

  /**
   * Constructs an observable sequence that depends on a resource object, whose lifetime is tied to the resulting observable sequence's lifetime.
   * @param {Function} resourceFactory Factory function to obtain a resource object.
   * @param {Function} observableFactory Factory function to obtain an observable sequence that depends on the obtained resource.
   * @returns {Observable} An observable sequence whose lifetime controls the lifetime of the dependent resource object.
   */
  Observable.using = function (resourceFactory, observableFactory) {
    return new AnonymousObservable(function (observer) {
      var disposable = disposableEmpty, resource, source;
      try {
        resource = resourceFactory();
        resource && (disposable = resource);
        source = observableFactory(resource);
      } catch (exception) {
        return new CompositeDisposable(observableThrow(exception).subscribe(observer), disposable);
      }
      return new CompositeDisposable(source.subscribe(observer), disposable);
    });
  };

  /**
   * Propagates the observable sequence or Promise that reacts first.
   * @param {Observable} rightSource Second observable sequence or Promise.
   * @returns {Observable} {Observable} An observable sequence that surfaces either of the given sequences, whichever reacted first.
   */
  observableProto.amb = function (rightSource) {
    var leftSource = this;
    return new AnonymousObservable(function (observer) {
      var choice,
        leftChoice = 'L', rightChoice = 'R',
        leftSubscription = new SingleAssignmentDisposable(),
        rightSubscription = new SingleAssignmentDisposable();

      isPromise(rightSource) && (rightSource = observableFromPromise(rightSource));

      function choiceL() {
        if (!choice) {
          choice = leftChoice;
          rightSubscription.dispose();
        }
      }

      function choiceR() {
        if (!choice) {
          choice = rightChoice;
          leftSubscription.dispose();
        }
      }

      leftSubscription.setDisposable(leftSource.subscribe(function (left) {
        choiceL();
        choice === leftChoice && observer.onNext(left);
      }, function (err) {
        choiceL();
        choice === leftChoice && observer.onError(err);
      }, function () {
        choiceL();
        choice === leftChoice && observer.onCompleted();
      }));

      rightSubscription.setDisposable(rightSource.subscribe(function (right) {
        choiceR();
        choice === rightChoice && observer.onNext(right);
      }, function (err) {
        choiceR();
        choice === rightChoice && observer.onError(err);
      }, function () {
        choiceR();
        choice === rightChoice && observer.onCompleted();
      }));

      return new CompositeDisposable(leftSubscription, rightSubscription);
    });
  };

  /**
   * Propagates the observable sequence or Promise that reacts first.
   *
   * @example
   * var = Rx.Observable.amb(xs, ys, zs);
   * @returns {Observable} An observable sequence that surfaces any of the given sequences, whichever reacted first.
   */
  Observable.amb = function () {
    var acc = observableNever(), items = [];
    if (Array.isArray(arguments[0])) {
      items = arguments[0];
    } else {
      for(var i = 0, len = arguments.length; i < len; i++) { items.push(arguments[i]); }
    }

    function func(previous, current) {
      return previous.amb(current);
    }
    for (var i = 0, len = items.length; i < len; i++) {
      acc = func(acc, items[i]);
    }
    return acc;
  };

  function observableCatchHandler(source, handler) {
    return new AnonymousObservable(function (o) {
      var d1 = new SingleAssignmentDisposable(), subscription = new SerialDisposable();
      subscription.setDisposable(d1);
      d1.setDisposable(source.subscribe(function (x) { o.onNext(x); }, function (e) {
        try {
          var result = handler(e);
        } catch (ex) {
          return o.onError(ex);
        }
        isPromise(result) && (result = observableFromPromise(result));

        var d = new SingleAssignmentDisposable();
        subscription.setDisposable(d);
        d.setDisposable(result.subscribe(o));
      }, function (x) { o.onCompleted(x); }));

      return subscription;
    }, source);
  }

  /**
   * Continues an observable sequence that is terminated by an exception with the next observable sequence.
   * @example
   * 1 - xs.catchException(ys)
   * 2 - xs.catchException(function (ex) { return ys(ex); })
   * @param {Mixed} handlerOrSecond Exception handler function that returns an observable sequence given the error that occurred in the first sequence, or a second observable sequence used to produce results when an error occurred in the first sequence.
   * @returns {Observable} An observable sequence containing the first sequence's elements, followed by the elements of the handler sequence in case an exception occurred.
   */
  observableProto['catch'] = observableProto.catchError = observableProto.catchException = function (handlerOrSecond) {
    return typeof handlerOrSecond === 'function' ?
      observableCatchHandler(this, handlerOrSecond) :
      observableCatch([this, handlerOrSecond]);
  };

  /**
   * Continues an observable sequence that is terminated by an exception with the next observable sequence.
   * @param {Array | Arguments} args Arguments or an array to use as the next sequence if an error occurs.
   * @returns {Observable} An observable sequence containing elements from consecutive source sequences until a source sequence terminates successfully.
   */
  var observableCatch = Observable.catchError = Observable['catch'] = Observable.catchException = function () {
    var items = [];
    if (Array.isArray(arguments[0])) {
      items = arguments[0];
    } else {
      for(var i = 0, len = arguments.length; i < len; i++) { items.push(arguments[i]); }
    }
    return enumerableOf(items).catchError();
  };

  /**
   * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
   * This can be in the form of an argument list of observables or an array.
   *
   * @example
   * 1 - obs = observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
   * 2 - obs = observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
   * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
   */
  observableProto.combineLatest = function () {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    if (Array.isArray(args[0])) {
      args[0].unshift(this);
    } else {
      args.unshift(this);
    }
    return combineLatest.apply(this, args);
  };

  /**
   * Merges the specified observable sequences into one observable sequence by using the selector function whenever any of the observable sequences or Promises produces an element.
   *
   * @example
   * 1 - obs = Rx.Observable.combineLatest(obs1, obs2, obs3, function (o1, o2, o3) { return o1 + o2 + o3; });
   * 2 - obs = Rx.Observable.combineLatest([obs1, obs2, obs3], function (o1, o2, o3) { return o1 + o2 + o3; });
   * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
   */
  var combineLatest = Observable.combineLatest = function () {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    var resultSelector = args.pop();
    Array.isArray(args[0]) && (args = args[0]);

    return new AnonymousObservable(function (o) {
      var n = args.length,
        falseFactory = function () { return false; },
        hasValue = arrayInitialize(n, falseFactory),
        hasValueAll = false,
        isDone = arrayInitialize(n, falseFactory),
        values = new Array(n);

      function next(i) {
        hasValue[i] = true;
        if (hasValueAll || (hasValueAll = hasValue.every(identity))) {
          try {
            var res = resultSelector.apply(null, values);
          } catch (e) {
            return o.onError(e);
          }
          o.onNext(res);
        } else if (isDone.filter(function (x, j) { return j !== i; }).every(identity)) {
          o.onCompleted();
        }
      }

      function done (i) {
        isDone[i] = true;
        isDone.every(identity) && o.onCompleted();
      }

      var subscriptions = new Array(n);
      for (var idx = 0; idx < n; idx++) {
        (function (i) {
          var source = args[i], sad = new SingleAssignmentDisposable();
          isPromise(source) && (source = observableFromPromise(source));
          sad.setDisposable(source.subscribe(function (x) {
              values[i] = x;
              next(i);
            },
            function(e) { o.onError(e); },
            function () { done(i); }
          ));
          subscriptions[i] = sad;
        }(idx));
      }

      return new CompositeDisposable(subscriptions);
    }, this);
  };

  /**
   * Concatenates all the observable sequences.  This takes in either an array or variable arguments to concatenate.
   * @returns {Observable} An observable sequence that contains the elements of each given sequence, in sequential order.
   */
  observableProto.concat = function () {
    for(var args = [], i = 0, len = arguments.length; i < len; i++) { args.push(arguments[i]); }
    args.unshift(this);
    return observableConcat.apply(null, args);
  };

	var ConcatObservable = (function(__super__) {
		inherits(ConcatObservable, __super__);
		function ConcatObservable(sources) {
			this.sources = sources;
			__super__.call(this);
		}
		
		ConcatObservable.prototype.subscribeCore = function(o) {
      var sink = new ConcatSink(this.sources, o);
      return sink.run();
		};
    
    function ConcatSink(sources, o) {
      this.sources = sources;
      this.o = o;
    }
    ConcatSink.prototype.run = function () {
      var isDisposed, subscription = new SerialDisposable(), sources = this.sources, length = sources.length, o = this.o;
      var cancelable = immediateScheduler.scheduleRecursiveWithState(0, function (i, self) {
        if (isDisposed) { return; }
        if (i === length) {
					return o.onCompleted();
				}
	
        // Check if promise
        var currentValue = sources[i];
        isPromise(currentValue) && (currentValue = observableFromPromise(currentValue));

        var d = new SingleAssignmentDisposable();
        subscription.setDisposable(d);
        d.setDisposable(currentValue.subscribe(
          function (x) { o.onNext(x); },
          function (e) { o.onError(e); },
          function () { self(i + 1); }
        ));
      });

      return new CompositeDisposable(subscription, cancelable, disposableCreate(function () {
        isDisposed = true;
      }));
    };
    
		
		return ConcatObservable;
	}(ObservableBase));
  
  /**
   * Concatenates all the observable sequences.
   * @param {Array | Arguments} args Arguments or an array to concat to the observable sequence.
   * @returns {Observable} An observable sequence that contains the elements of each given sequence, in sequential order.
   */
  var observableConcat = Observable.concat = function () {
    var args;
    if (Array.isArray(arguments[0])) {
      args = arguments[0];
    } else {
      args = new Array(arguments.length);
      for(var i = 0, len = arguments.length; i < len; i++) { args[i] = arguments[i]; }
    }
    return new ConcatObservable(args);
  };

  /**
   * Concatenates an observable sequence of observable sequences.
   * @returns {Observable} An observable sequence that contains the elements of each observed inner sequence, in sequential order.
   */
  observableProto.concatAll = observableProto.concatObservable = function () {
    return this.merge(1);
  };

  var MergeObservable = (function (__super__) {
    inherits(MergeObservable, __super__);

    function MergeObservable(source, maxConcurrent) {
      this.source = source;
      this.maxConcurrent = maxConcurrent;
      __super__.call(this);
    }

    MergeObservable.prototype.subscribeCore = function(observer) {
      var g = new CompositeDisposable();
      g.add(this.source.subscribe(new MergeObserver(observer, this.maxConcurrent, g)));
      return g;
    };

    return MergeObservable;

  }(ObservableBase));

  var MergeObserver = (function () {
    function MergeObserver(o, max, g) {
      this.o = o;
      this.max = max;
      this.g = g;
      this.done = false;
      this.q = [];
      this.activeCount = 0;
      this.isStopped = false;
    }
    MergeObserver.prototype.handleSubscribe = function (xs) {
      var sad = new SingleAssignmentDisposable();
      this.g.add(sad);
      isPromise(xs) && (xs = observableFromPromise(xs));
      sad.setDisposable(xs.subscribe(new InnerObserver(this, sad)));
    };
    MergeObserver.prototype.onNext = function (innerSource) {
      if (this.isStopped) { return; }
        if(this.activeCount < this.max) {
          this.activeCount++;
          this.handleSubscribe(innerSource);
        } else {
          this.q.push(innerSource);
        }
      };
      MergeObserver.prototype.onError = function (e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
        }
      };
      MergeObserver.prototype.onCompleted = function () {
        if (!this.isStopped) {
          this.isStopped = true;
          this.done = true;
          this.activeCount === 0 && this.o.onCompleted();
        }
      };
      MergeObserver.prototype.dispose = function() { this.isStopped = true; };
      MergeObserver.prototype.fail = function (e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.o.onError(e);
          return true;
        }

        return false;
      };

      function InnerObserver(parent, sad) {
        this.parent = parent;
        this.sad = sad;
        this.isStopped = false;
      }
      InnerObserver.prototype.onNext = function (x) { if(!this.isStopped) { this.parent.o.onNext(x); } };
      InnerObserver.prototype.onError = function (e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
        }
      };
      InnerObserver.prototype.onCompleted = function () {
        if(!this.isStopped) {
          this.isStopped = true;
          var parent = this.parent;
          parent.g.remove(this.sad);
          if (parent.q.length > 0) {
            parent.handleSubscribe(parent.q.shift());
          } else {
            parent.activeCount--;
            parent.done && parent.activeCount === 0 && parent.o.onCompleted();
          }
        }
      };
      InnerObserver.prototype.dispose = function() { this.isStopped = true; };
      InnerObserver.prototype.fail = function (e) {
        if (!this.isStopped) {
          this.isStopped = true;
          this.parent.o.onError(e);
          return true;
        }

        return false;
      };

      return MergeObserver;
  }());





  /**
  * Merges an observable sequence of observable sequences into an observable sequence, limiting the number of concurrent subscriptions to inner sequences.
  * Or merges two observable sequences into a single observable sequence.
  *
  * @example
  * 1 - merged = sources.merge(1);
  * 2 - merged = source.merge(otherSource);
  * @param {Mixed} [maxConcurrentOrOther] Maximum number of inner observable sequences being subscribed to concurrently or the second observable sequence.
  * @returns {Observable} The observable sequence that merges the elements of the inner sequences.
  */
  observableProto.merge = function (maxConcurrentOrOther) {
    return typeof maxConcurrentOrOther !== 'number' ?
      observableMerge(this, maxConcurrentOrOther) :
      new MergeObservable(this, maxConcurrentOrOther);
  };

  /**
   * Merges all the observable sequences into a single observable sequence.
   * The scheduler is optional and if not specified, the immediate scheduler is used.
   * @returns {Observable} The observable sequence that merges the elements of the observable sequences.
   */
  var observableMerge = Observable.merge = function () {
    var scheduler, sources = [], i, len = arguments.length;
    if (!arguments[0]) {
      scheduler = immediateScheduler;
      for(i = 1; i < len; i++) { sources.push(arguments[i]); }
    } else if (isScheduler(arguments[0])) {
      scheduler = arguments[0];
      for(i = 1; i < len; i++) { sources.push(arguments[i]); }
    } else {
      scheduler = immediateScheduler;
      for(i = 0; i < len; i++) { sources.push(arguments[i]); }
    }
    if (Array.isArray(sources[0])) {
      sources = sources[0];
    }
    return observableOf(scheduler, sources).mergeAll();
  };

  var CompositeError = Rx.CompositeError = function(errors) {
    this.name = "NotImplementedError";
    this.innerErrors = errors;
    this.message = 'This contains multiple errors. Check the innerErrors';
    Error.call(this);
  }
  CompositeError.prototype = Error.prototype;

  /**
  * Flattens an Observable that emits Observables into one Observable, in a way that allows an Observer to
  * receive all successfully emitted items from all of the source Observables without being interrupted by
  * an error notification from one of them.
  *
  * This behaves like Observable.prototype.mergeAll except that if any of the merged Observables notify of an
  * error via the Observer's onError, mergeDelayError will refrain from propagating that
  * error notification until all of the merged Observables have finished emitting items.
  * @param {Array | Arguments} args Arguments or an array to merge.
  * @returns {Observable} an Observable that emits all of the items emitted by the Observables emitted by the Observable
  */
  Observable.mergeDelayError = function() {
    var args;
    if (Array.isArray(arguments[0])) {
      args = arguments[0];
    } else {
      var len = arguments.length;
      args = new Array(len);
      for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    }
    var source = observableOf(null, args);

    return new AnonymousObservable(function (o) {
      var group = new CompositeDisposable(),
        m = new SingleAssignmentDisposable(),
        isStopped = false,
        errors = [];

      function setCompletion() {
        if (errors.length === 0) {
          o.onCompleted();
        } else if (errors.length === 1) {
          o.onError(errors[0]);
        } else {
          o.onError(new CompositeError(errors));
        }
      }

      group.add(m);

      m.setDisposable(source.subscribe(
        function (innerSource) {
          var innerSubscription = new SingleAssignmentDisposable();
          group.add(innerSubscription);

          // Check for promises support
          isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));

          innerSubscription.setDisposable(innerSource.subscribe(
            function (x) { o.onNext(x); },
            function (e) {
              errors.push(e);
              group.remove(innerSubscription);
              isStopped && group.length === 1 && setCompletion();
            },
            function () {
              group.remove(innerSubscription);
              isStopped && group.length === 1 && setCompletion();
          }));
        },
        function (e) {
          errors.push(e);
          isStopped = true;
          group.length === 1 && setCompletion();
        },
        function () {
          isStopped = true;
          group.length === 1 && setCompletion();
        }));
      return group;
    });
  };

  var MergeAllObservable = (function (__super__) {
    inherits(MergeAllObservable, __super__);

    function MergeAllObservable(source) {
      this.source = source;
      __super__.call(this);
    }

    MergeAllObservable.prototype.subscribeCore = function (observer) {
      var g = new CompositeDisposable(), m = new SingleAssignmentDisposable();
      g.add(m);
      m.setDisposable(this.source.subscribe(new MergeAllObserver(observer, g)));
      return g;
    };
    
    function MergeAllObserver(o, g) {
      this.o = o;
      this.g = g;
      this.isStopped = false;
      this.done = false;
    }
    MergeAllObserver.prototype.onNext = function(innerSource) {
      if(this.isStopped) { return; }
      var sad = new SingleAssignmentDisposable();
      this.g.add(sad);

      isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));

      sad.setDisposable(innerSource.subscribe(new InnerObserver(this, this.g, sad)));
    };
    MergeAllObserver.prototype.onError = function (e) {
      if(!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
      }
    };
    MergeAllObserver.prototype.onCompleted = function () {
      if(!this.isStopped) {
        this.isStopped = true;
        this.done = true;
        this.g.length === 1 && this.o.onCompleted();
      }
    };
    MergeAllObserver.prototype.dispose = function() { this.isStopped = true; };
    MergeAllObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
        return true;
      }

      return false;
    };

    function InnerObserver(parent, g, sad) {
      this.parent = parent;
      this.g = g;
      this.sad = sad;
      this.isStopped = false;
    }
    InnerObserver.prototype.onNext = function (x) { if (!this.isStopped) { this.parent.o.onNext(x); } };
    InnerObserver.prototype.onError = function (e) {
      if(!this.isStopped) {
        this.isStopped = true;
        this.parent.o.onError(e);
      }
    };
    InnerObserver.prototype.onCompleted = function () {
      if(!this.isStopped) {
        var parent = this.parent;
        this.isStopped = true;
        parent.g.remove(this.sad);
        parent.done && parent.g.length === 1 && parent.o.onCompleted();
      }
    };
    InnerObserver.prototype.dispose = function() { this.isStopped = true; };
    InnerObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.parent.o.onError(e);
        return true;
      }

      return false;
    };

    return MergeAllObservable;
  }(ObservableBase));

  /**
  * Merges an observable sequence of observable sequences into an observable sequence.
  * @returns {Observable} The observable sequence that merges the elements of the inner sequences.
  */
  observableProto.mergeAll = observableProto.mergeObservable = function () {
    return new MergeAllObservable(this);
  };

  /**
   * Continues an observable sequence that is terminated normally or by an exception with the next observable sequence.
   * @param {Observable} second Second observable sequence used to produce results after the first sequence terminates.
   * @returns {Observable} An observable sequence that concatenates the first and second sequence, even if the first sequence terminates exceptionally.
   */
  observableProto.onErrorResumeNext = function (second) {
    if (!second) { throw new Error('Second observable is required'); }
    return onErrorResumeNext([this, second]);
  };

  /**
   * Continues an observable sequence that is terminated normally or by an exception with the next observable sequence.
   *
   * @example
   * 1 - res = Rx.Observable.onErrorResumeNext(xs, ys, zs);
   * 1 - res = Rx.Observable.onErrorResumeNext([xs, ys, zs]);
   * @returns {Observable} An observable sequence that concatenates the source sequences, even if a sequence terminates exceptionally.
   */
  var onErrorResumeNext = Observable.onErrorResumeNext = function () {
    var sources = [];
    if (Array.isArray(arguments[0])) {
      sources = arguments[0];
    } else {
      for(var i = 0, len = arguments.length; i < len; i++) { sources.push(arguments[i]); }
    }
    return new AnonymousObservable(function (observer) {
      var pos = 0, subscription = new SerialDisposable(),
      cancelable = immediateScheduler.scheduleRecursive(function (self) {
        var current, d;
        if (pos < sources.length) {
          current = sources[pos++];
          isPromise(current) && (current = observableFromPromise(current));
          d = new SingleAssignmentDisposable();
          subscription.setDisposable(d);
          d.setDisposable(current.subscribe(observer.onNext.bind(observer), self, self));
        } else {
          observer.onCompleted();
        }
      });
      return new CompositeDisposable(subscription, cancelable);
    });
  };

  /**
   * Returns the values from the source observable sequence only after the other observable sequence produces a value.
   * @param {Observable | Promise} other The observable sequence or Promise that triggers propagation of elements of the source sequence.
   * @returns {Observable} An observable sequence containing the elements of the source sequence starting from the point the other sequence triggered propagation.
   */
  observableProto.skipUntil = function (other) {
    var source = this;
    return new AnonymousObservable(function (o) {
      var isOpen = false;
      var disposables = new CompositeDisposable(source.subscribe(function (left) {
        isOpen && o.onNext(left);
      }, function (e) { o.onError(e); }, function () {
        isOpen && o.onCompleted();
      }));

      isPromise(other) && (other = observableFromPromise(other));

      var rightSubscription = new SingleAssignmentDisposable();
      disposables.add(rightSubscription);
      rightSubscription.setDisposable(other.subscribe(function () {
        isOpen = true;
        rightSubscription.dispose();
      }, function (e) { o.onError(e); }, function () {
        rightSubscription.dispose();
      }));

      return disposables;
    }, source);
  };

  var SwitchObservable = (function(__super__) {
    inherits(SwitchObservable, __super__);
    function SwitchObservable(source) {
      this.source = source;
      __super__.call(this);
    }

    SwitchObservable.prototype.subscribeCore = function (o) {
      var inner = new SerialDisposable(), s = this.source.subscribe(new SwitchObserver(o, inner));
      return new CompositeDisposable(s, inner);
    };

    function SwitchObserver(o, inner) {
      this.o = o;
      this.inner = inner;
      this.stopped = false;
      this.latest = 0;
      this.hasLatest = false;
      this.isStopped = false;
    }
    SwitchObserver.prototype.onNext = function (innerSource) {
      if (this.isStopped) { return; }
      var d = new SingleAssignmentDisposable(), id = ++this.latest;
      this.hasLatest = true;
      this.inner.setDisposable(d);
      isPromise(innerSource) && (innerSource = observableFromPromise(innerSource));
      d.setDisposable(innerSource.subscribe(new InnerObserver(this, id)));
    };
    SwitchObserver.prototype.onError = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
      }
    };
    SwitchObserver.prototype.onCompleted = function () {
      if (!this.isStopped) {
        this.isStopped = true;
        this.stopped = true;
        !this.hasLatest && this.o.onCompleted();
      }
    };
    SwitchObserver.prototype.dispose = function () { this.isStopped = true; };
    SwitchObserver.prototype.fail = function (e) {
      if(!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
        return true;
      }
      return false;
    };

    function InnerObserver(parent, id) {
      this.parent = parent;
      this.id = id;
      this.isStopped = false;
    }
    InnerObserver.prototype.onNext = function (x) {
      if (this.isStopped) { return; }
      this.parent.latest === this.id && this.parent.o.onNext(x);
    };
    InnerObserver.prototype.onError = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.parent.latest === this.id && this.parent.o.onError(e);
      }
    };
    InnerObserver.prototype.onCompleted = function () {
      if (!this.isStopped) {
        this.isStopped = true;
        if (this.parent.latest === this.id) {
          this.parent.hasLatest = false;
          this.parent.isStopped && this.parent.o.onCompleted();
        }
      }
    };
    InnerObserver.prototype.dispose = function () { this.isStopped = true; }
    InnerObserver.prototype.fail = function (e) {
      if(!this.isStopped) {
        this.isStopped = true;
        this.parent.o.onError(e);
        return true;
      }
      return false;
    };

    return SwitchObservable;
  }(ObservableBase));

  /**
  * Transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
  * @returns {Observable} The observable sequence that at any point in time produces the elements of the most recent inner observable sequence that has been received.
  */
  observableProto['switch'] = observableProto.switchLatest = function () {
    return new SwitchObservable(this);
  };

  var TakeUntilObservable = (function(__super__) {
    inherits(TakeUntilObservable, __super__);

    function TakeUntilObservable(source, other) {
      this.source = source;
      this.other = isPromise(other) ? observableFromPromise(other) : other;
      __super__.call(this);
    }

    TakeUntilObservable.prototype.subscribeCore = function(o) {
      return new CompositeDisposable(
        this.source.subscribe(o),
        this.other.subscribe(new InnerObserver(o))
      );
    };

    function InnerObserver(o) {
      this.o = o;
      this.isStopped = false;
    }
    InnerObserver.prototype.onNext = function (x) {
      if (this.isStopped) { return; }
      this.o.onCompleted();
    };
    InnerObserver.prototype.onError = function (err) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(err);
      }
    };
    InnerObserver.prototype.onCompleted = function () {
      !this.isStopped && (this.isStopped = true);
    };
    InnerObserver.prototype.dispose = function() { this.isStopped = true; };
    InnerObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
        return true;
      }
      return false;
    };

    return TakeUntilObservable;
  }(ObservableBase));

  /**
   * Returns the values from the source observable sequence until the other observable sequence produces a value.
   * @param {Observable | Promise} other Observable sequence or Promise that terminates propagation of elements of the source sequence.
   * @returns {Observable} An observable sequence containing the elements of the source sequence up to the point the other sequence interrupted further propagation.
   */
  observableProto.takeUntil = function (other) {
    return new TakeUntilObservable(this, other);
  };

  function falseFactory() { return false; }

  /**
   * Merges the specified observable sequences into one observable sequence by using the selector function only when the (first) source observable sequence produces an element.
   * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
   */
  observableProto.withLatestFrom = function () {
    var len = arguments.length, args = new Array(len)
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    var resultSelector = args.pop(), source = this;
    Array.isArray(args[0]) && (args = args[0]);

    return new AnonymousObservable(function (observer) {
      var n = args.length,
        hasValue = arrayInitialize(n, falseFactory),
        hasValueAll = false,
        values = new Array(n);

      var subscriptions = new Array(n + 1);
      for (var idx = 0; idx < n; idx++) {
        (function (i) {
          var other = args[i], sad = new SingleAssignmentDisposable();
          isPromise(other) && (other = observableFromPromise(other));
          sad.setDisposable(other.subscribe(function (x) {
            values[i] = x;
            hasValue[i] = true;
            hasValueAll = hasValue.every(identity);
          }, function (e) { observer.onError(e); }, noop));
          subscriptions[i] = sad;
        }(idx));
      }

      var sad = new SingleAssignmentDisposable();
      sad.setDisposable(source.subscribe(function (x) {
        var allValues = [x].concat(values);
        if (!hasValueAll) { return; }
        var res = tryCatch(resultSelector).apply(null, allValues);
        if (res === errorObj) { return observer.onError(res.e); }
        observer.onNext(res);
      }, function (e) { observer.onError(e); }, function () {
        observer.onCompleted();
      }));
      subscriptions[n] = sad;

      return new CompositeDisposable(subscriptions);
    }, this);
  };

  function zipArray(second, resultSelector) {
    var first = this;
    return new AnonymousObservable(function (o) {
      var index = 0, len = second.length;
      return first.subscribe(function (left) {
        if (index < len) {
          var right = second[index++], res = tryCatch(resultSelector)(left, right);
          if (res === errorObj) { return o.onError(res.e); }
          o.onNext(res);
        } else {
          o.onCompleted();
        }
      }, function (e) { o.onError(e); }, function () { o.onCompleted(); });
    }, first);
  }

  function falseFactory() { return false; }
  function emptyArrayFactory() { return []; }

  /**
   * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences or an array have produced an element at a corresponding index.
   * The last element in the arguments must be a function to invoke for each series of elements at corresponding indexes in the args.
   * @returns {Observable} An observable sequence containing the result of combining elements of the args using the specified result selector function.
   */
  observableProto.zip = function () {
    if (Array.isArray(arguments[0])) { return zipArray.apply(this, arguments); }
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }

    var parent = this, resultSelector = args.pop();
    args.unshift(parent);
    return new AnonymousObservable(function (o) {
      var n = args.length,
        queues = arrayInitialize(n, emptyArrayFactory),
        isDone = arrayInitialize(n, falseFactory);

      var subscriptions = new Array(n);
      for (var idx = 0; idx < n; idx++) {
        (function (i) {
          var source = args[i], sad = new SingleAssignmentDisposable();
          isPromise(source) && (source = observableFromPromise(source));
          sad.setDisposable(source.subscribe(function (x) {
            queues[i].push(x);
            if (queues.every(function (x) { return x.length > 0; })) {
              var queuedValues = queues.map(function (x) { return x.shift(); }),
                  res = tryCatch(resultSelector).apply(parent, queuedValues);
              if (res === errorObj) { return o.onError(res.e); }
              o.onNext(res);
            } else if (isDone.filter(function (x, j) { return j !== i; }).every(identity)) {
              o.onCompleted();
            }
          }, function (e) { o.onError(e); }, function () {
            isDone[i] = true;
            isDone.every(identity) && o.onCompleted();
          }));
          subscriptions[i] = sad;
        })(idx);
      }

      return new CompositeDisposable(subscriptions);
    }, parent);
  };

  /**
   * Merges the specified observable sequences into one observable sequence by using the selector function whenever all of the observable sequences have produced an element at a corresponding index.
   * @param arguments Observable sources.
   * @param {Function} resultSelector Function to invoke for each series of elements at corresponding indexes in the sources.
   * @returns {Observable} An observable sequence containing the result of combining elements of the sources using the specified result selector function.
   */
  Observable.zip = function () {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    var first = args.shift();
    return first.zip.apply(first, args);
  };

  function falseFactory() { return false; }
  function arrayFactory() { return []; }

  /**
   * Merges the specified observable sequences into one observable sequence by emitting a list with the elements of the observable sequences at corresponding indexes.
   * @param arguments Observable sources.
   * @returns {Observable} An observable sequence containing lists of elements at corresponding indexes.
   */
  Observable.zipArray = function () {
    var sources;
    if (Array.isArray(arguments[0])) {
      sources = arguments[0];
    } else {
      var len = arguments.length;
      sources = new Array(len);
      for(var i = 0; i < len; i++) { sources[i] = arguments[i]; }
    }
    return new AnonymousObservable(function (o) {
      var n = sources.length,
        queues = arrayInitialize(n, arrayFactory),
        isDone = arrayInitialize(n, falseFactory);

      var subscriptions = new Array(n);
      for (var idx = 0; idx < n; idx++) {
        (function (i) {
          subscriptions[i] = new SingleAssignmentDisposable();
          subscriptions[i].setDisposable(sources[i].subscribe(function (x) {
            queues[i].push(x);
            if (queues.every(function (x) { return x.length > 0; })) {
              var res = queues.map(function (x) { return x.shift(); });
              o.onNext(res);
            } else if (isDone.filter(function (x, j) { return j !== i; }).every(identity)) {
              return o.onCompleted();
            }
          }, function (e) { o.onError(e); }, function () {
            isDone[i] = true;
            isDone.every(identity) && o.onCompleted();
          }));
        })(idx);
      }

      return new CompositeDisposable(subscriptions);
    });
  };

  /**
   *  Hides the identity of an observable sequence.
   * @returns {Observable} An observable sequence that hides the identity of the source sequence.
   */
  observableProto.asObservable = function () {
    var source = this;
    return new AnonymousObservable(function (o) { return source.subscribe(o); }, source);
  };

  /**
   *  Projects each element of an observable sequence into zero or more buffers which are produced based on element count information.
   *
   * @example
   *  var res = xs.bufferWithCount(10);
   *  var res = xs.bufferWithCount(10, 1);
   * @param {Number} count Length of each buffer.
   * @param {Number} [skip] Number of elements to skip between creation of consecutive buffers. If not provided, defaults to the count.
   * @returns {Observable} An observable sequence of buffers.
   */
  observableProto.bufferWithCount = function (count, skip) {
    if (typeof skip !== 'number') {
      skip = count;
    }
    return this.windowWithCount(count, skip).selectMany(function (x) {
      return x.toArray();
    }).where(function (x) {
      return x.length > 0;
    });
  };

  /**
   * Dematerializes the explicit notification values of an observable sequence as implicit notifications.
   * @returns {Observable} An observable sequence exhibiting the behavior corresponding to the source sequence's notification values.
   */
  observableProto.dematerialize = function () {
    var source = this;
    return new AnonymousObservable(function (o) {
      return source.subscribe(function (x) { return x.accept(o); }, function(e) { o.onError(e); }, function () { o.onCompleted(); });
    }, this);
  };

  /**
   *  Returns an observable sequence that contains only distinct contiguous elements according to the keySelector and the comparer.
   *
   *  var obs = observable.distinctUntilChanged();
   *  var obs = observable.distinctUntilChanged(function (x) { return x.id; });
   *  var obs = observable.distinctUntilChanged(function (x) { return x.id; }, function (x, y) { return x === y; });
   *
   * @param {Function} [keySelector] A function to compute the comparison key for each element. If not provided, it projects the value.
   * @param {Function} [comparer] Equality comparer for computed key values. If not provided, defaults to an equality comparer function.
   * @returns {Observable} An observable sequence only containing the distinct contiguous elements, based on a computed key value, from the source sequence.
   */
  observableProto.distinctUntilChanged = function (keySelector, comparer) {
    var source = this;
    comparer || (comparer = defaultComparer);
    return new AnonymousObservable(function (o) {
      var hasCurrentKey = false, currentKey;
      return source.subscribe(function (value) {
        var key = value;
        if (keySelector) {
          key = tryCatch(keySelector)(value);
          if (key === errorObj) { return o.onError(key.e); }
        }
        if (hasCurrentKey) {
          var comparerEquals = tryCatch(comparer)(currentKey, key);
          if (comparerEquals === errorObj) { return o.onError(comparerEquals.e); }
        }
        if (!hasCurrentKey || !comparerEquals) {
          hasCurrentKey = true;
          currentKey = key;
          o.onNext(value);
        }
      }, function (e) { o.onError(e); }, function () { o.onCompleted(); });
    }, this);
  };

  var TapObservable = (function(__super__) {
    inherits(TapObservable,__super__);
    function TapObservable(source, observerOrOnNext, onError, onCompleted) {
      this.source = source;
      this.t = !observerOrOnNext || isFunction(observerOrOnNext) ?
        observerCreate(observerOrOnNext || noop, onError || noop, onCompleted || noop) :
        observerOrOnNext;
      __super__.call(this);
    }

    TapObservable.prototype.subscribeCore = function(o) {
      return this.source.subscribe(new InnerObserver(o, this.t));
    };

    function InnerObserver(o, t) {
      this.o = o;
      this.t = t;
      this.isStopped = false;
    }
    InnerObserver.prototype.onNext = function(x) {
      if (this.isStopped) { return; }
      var res = tryCatch(this.t.onNext).call(this.t, x);
      if (res === errorObj) { this.o.onError(res.e); }
      this.o.onNext(x);
    };
    InnerObserver.prototype.onError = function(err) {
      if (!this.isStopped) {
        this.isStopped = true;
        var res = tryCatch(this.t.onError).call(this.t, err);
        if (res === errorObj) { return this.o.onError(res.e); }
        this.o.onError(err);
      }
    };
    InnerObserver.prototype.onCompleted = function() {
      if (!this.isStopped) {
        this.isStopped = true;
        var res = tryCatch(this.t.onCompleted).call(this.t);
        if (res === errorObj) { return this.o.onError(res.e); }
        this.o.onCompleted();
      }
    };
    InnerObserver.prototype.dispose = function() { this.isStopped = true; };
    InnerObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
        return true;
      }
      return false;
    };

    return TapObservable;
  }(ObservableBase));

  /**
  *  Invokes an action for each element in the observable sequence and invokes an action upon graceful or exceptional termination of the observable sequence.
  *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
  * @param {Function | Observer} observerOrOnNext Action to invoke for each element in the observable sequence or an o.
  * @param {Function} [onError]  Action to invoke upon exceptional termination of the observable sequence. Used if only the observerOrOnNext parameter is also a function.
  * @param {Function} [onCompleted]  Action to invoke upon graceful termination of the observable sequence. Used if only the observerOrOnNext parameter is also a function.
  * @returns {Observable} The source sequence with the side-effecting behavior applied.
  */
  observableProto['do'] = observableProto.tap = observableProto.doAction = function (observerOrOnNext, onError, onCompleted) {
    return new TapObservable(this, observerOrOnNext, onError, onCompleted);
  };

  /**
  *  Invokes an action for each element in the observable sequence.
  *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
  * @param {Function} onNext Action to invoke for each element in the observable sequence.
  * @param {Any} [thisArg] Object to use as this when executing callback.
  * @returns {Observable} The source sequence with the side-effecting behavior applied.
  */
  observableProto.doOnNext = observableProto.tapOnNext = function (onNext, thisArg) {
    return this.tap(typeof thisArg !== 'undefined' ? function (x) { onNext.call(thisArg, x); } : onNext);
  };

  /**
  *  Invokes an action upon exceptional termination of the observable sequence.
  *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
  * @param {Function} onError Action to invoke upon exceptional termination of the observable sequence.
  * @param {Any} [thisArg] Object to use as this when executing callback.
  * @returns {Observable} The source sequence with the side-effecting behavior applied.
  */
  observableProto.doOnError = observableProto.tapOnError = function (onError, thisArg) {
    return this.tap(noop, typeof thisArg !== 'undefined' ? function (e) { onError.call(thisArg, e); } : onError);
  };

  /**
  *  Invokes an action upon graceful termination of the observable sequence.
  *  This method can be used for debugging, logging, etc. of query behavior by intercepting the message stream to run arbitrary actions for messages on the pipeline.
  * @param {Function} onCompleted Action to invoke upon graceful termination of the observable sequence.
  * @param {Any} [thisArg] Object to use as this when executing callback.
  * @returns {Observable} The source sequence with the side-effecting behavior applied.
  */
  observableProto.doOnCompleted = observableProto.tapOnCompleted = function (onCompleted, thisArg) {
    return this.tap(noop, null, typeof thisArg !== 'undefined' ? function () { onCompleted.call(thisArg); } : onCompleted);
  };

  /**
   *  Invokes a specified action after the source observable sequence terminates gracefully or exceptionally.
   * @param {Function} finallyAction Action to invoke after the source observable sequence terminates.
   * @returns {Observable} Source sequence with the action-invoking termination behavior applied.
   */
  observableProto['finally'] = observableProto.ensure = function (action) {
    var source = this;
    return new AnonymousObservable(function (observer) {
      var subscription;
      try {
        subscription = source.subscribe(observer);
      } catch (e) {
        action();
        throw e;
      }
      return disposableCreate(function () {
        try {
          subscription.dispose();
        } catch (e) {
          throw e;
        } finally {
          action();
        }
      });
    }, this);
  };

  /**
   * @deprecated use #finally or #ensure instead.
   */
  observableProto.finallyAction = function (action) {
    //deprecate('finallyAction', 'finally or ensure');
    return this.ensure(action);
  };

  var IgnoreElementsObservable = (function(__super__) {
    inherits(IgnoreElementsObservable, __super__);

    function IgnoreElementsObservable(source) {
      this.source = source;
      __super__.call(this);
    }

    IgnoreElementsObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new InnerObserver(o));
    };

    function InnerObserver(o) {
      this.o = o;
      this.isStopped = false;
    }
    InnerObserver.prototype.onNext = noop;
    InnerObserver.prototype.onError = function (err) {
      if(!this.isStopped) {
        this.isStopped = true;
        this.o.onError(err);
      }
    };
    InnerObserver.prototype.onCompleted = function () {
      if(!this.isStopped) {
        this.isStopped = true;
        this.o.onCompleted();
      }
    };
    InnerObserver.prototype.dispose = function() { this.isStopped = true; };
    InnerObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.observer.onError(e);
        return true;
      }

      return false;
    };

    return IgnoreElementsObservable;
  }(ObservableBase));

  /**
   *  Ignores all elements in an observable sequence leaving only the termination messages.
   * @returns {Observable} An empty observable sequence that signals termination, successful or exceptional, of the source sequence.
   */
  observableProto.ignoreElements = function () {
    return new IgnoreElementsObservable(this);
  };

  /**
   *  Materializes the implicit notifications of an observable sequence as explicit notification values.
   * @returns {Observable} An observable sequence containing the materialized notification values from the source sequence.
   */
  observableProto.materialize = function () {
    var source = this;
    return new AnonymousObservable(function (observer) {
      return source.subscribe(function (value) {
        observer.onNext(notificationCreateOnNext(value));
      }, function (e) {
        observer.onNext(notificationCreateOnError(e));
        observer.onCompleted();
      }, function () {
        observer.onNext(notificationCreateOnCompleted());
        observer.onCompleted();
      });
    }, source);
  };

  /**
   *  Repeats the observable sequence a specified number of times. If the repeat count is not specified, the sequence repeats indefinitely.
   * @param {Number} [repeatCount]  Number of times to repeat the sequence. If not provided, repeats the sequence indefinitely.
   * @returns {Observable} The observable sequence producing the elements of the given sequence repeatedly.
   */
  observableProto.repeat = function (repeatCount) {
    return enumerableRepeat(this, repeatCount).concat();
  };

  /**
   *  Repeats the source observable sequence the specified number of times or until it successfully terminates. If the retry count is not specified, it retries indefinitely.
   *  Note if you encounter an error and want it to retry once, then you must use .retry(2);
   *
   * @example
   *  var res = retried = retry.repeat();
   *  var res = retried = retry.repeat(2);
   * @param {Number} [retryCount]  Number of times to retry the sequence. If not provided, retry the sequence indefinitely.
   * @returns {Observable} An observable sequence producing the elements of the given sequence repeatedly until it terminates successfully.
   */
  observableProto.retry = function (retryCount) {
    return enumerableRepeat(this, retryCount).catchError();
  };

  /**
   *  Repeats the source observable sequence upon error each time the notifier emits or until it successfully terminates. 
   *  if the notifier completes, the observable sequence completes.
   *
   * @example
   *  var timer = Observable.timer(500);
   *  var source = observable.retryWhen(timer);
   * @param {Observable} [notifier] An observable that triggers the retries or completes the observable with onNext or onCompleted respectively.
   * @returns {Observable} An observable sequence producing the elements of the given sequence repeatedly until it terminates successfully.
   */
  observableProto.retryWhen = function (notifier) {
    return enumerableRepeat(this).catchErrorWhen(notifier);
  };
  var ScanObservable = (function(__super__) {
    inherits(ScanObservable, __super__);
    function ScanObservable(source, accumulator, hasSeed, seed) {
      this.source = source;
      this.accumulator = accumulator;
      this.hasSeed = hasSeed;
      this.seed = seed;
      __super__.call(this);
    }

    ScanObservable.prototype.subscribeCore = function(observer) {
      return this.source.subscribe(new ScanObserver(observer,this));
    };

    return ScanObservable;
  }(ObservableBase));

  function ScanObserver(observer, parent) {
    this.observer = observer;
    this.accumulator = parent.accumulator;
    this.hasSeed = parent.hasSeed;
    this.seed = parent.seed;
    this.hasAccumulation = false;
    this.accumulation = null;
    this.hasValue = false;
    this.isStopped = false;
  }
  ScanObserver.prototype.onNext = function (x) {
    if (this.isStopped) { return; }
    !this.hasValue && (this.hasValue = true);
    try {
      if (this.hasAccumulation) {
        this.accumulation = this.accumulator(this.accumulation, x);
      } else {
        this.accumulation = this.hasSeed ? this.accumulator(this.seed, x) : x;
        this.hasAccumulation = true;
      }
    } catch (e) {
      return this.observer.onError(e);
    }
    this.observer.onNext(this.accumulation);
  };
  ScanObserver.prototype.onError = function (e) { 
    if (!this.isStopped) {
      this.isStopped = true;
      this.observer.onError(e);
    }
  };
  ScanObserver.prototype.onCompleted = function () {
    if (!this.isStopped) {
      this.isStopped = true;
      !this.hasValue && this.hasSeed && this.observer.onNext(this.seed);
      this.observer.onCompleted();
    }
  };
  ScanObserver.prototype.dispose = function() { this.isStopped = true; };
  ScanObserver.prototype.fail = function (e) {
    if (!this.isStopped) {
      this.isStopped = true;
      this.observer.onError(e);
      return true;
    }
    return false;
  };

  /**
  *  Applies an accumulator function over an observable sequence and returns each intermediate result. The optional seed value is used as the initial accumulator value.
  *  For aggregation behavior with no intermediate results, see Observable.aggregate.
  * @param {Mixed} [seed] The initial accumulator value.
  * @param {Function} accumulator An accumulator function to be invoked on each element.
  * @returns {Observable} An observable sequence containing the accumulated values.
  */
  observableProto.scan = function () {
    var hasSeed = false, seed, accumulator, source = this;
    if (arguments.length === 2) {
      hasSeed = true;
      seed = arguments[0];
      accumulator = arguments[1];
    } else {
      accumulator = arguments[0];
    }
    return new ScanObservable(this, accumulator, hasSeed, seed);
  };

  /**
   *  Bypasses a specified number of elements at the end of an observable sequence.
   * @description
   *  This operator accumulates a queue with a length enough to store the first `count` elements. As more elements are
   *  received, elements are taken from the front of the queue and produced on the result sequence. This causes elements to be delayed.
   * @param count Number of elements to bypass at the end of the source sequence.
   * @returns {Observable} An observable sequence containing the source sequence elements except for the bypassed ones at the end.
   */
  observableProto.skipLast = function (count) {
    if (count < 0) { throw new ArgumentOutOfRangeError(); }
    var source = this;
    return new AnonymousObservable(function (o) {
      var q = [];
      return source.subscribe(function (x) {
        q.push(x);
        q.length > count && o.onNext(q.shift());
      }, function (e) { o.onError(e); }, function () { o.onCompleted(); });
    }, source);
  };

  /**
   *  Prepends a sequence of values to an observable sequence with an optional scheduler and an argument list of values to prepend.
   *  @example
   *  var res = source.startWith(1, 2, 3);
   *  var res = source.startWith(Rx.Scheduler.timeout, 1, 2, 3);
   * @param {Arguments} args The specified values to prepend to the observable sequence
   * @returns {Observable} The source sequence prepended with the specified values.
   */
  observableProto.startWith = function () {
    var values, scheduler, start = 0;
    if (!!arguments.length && isScheduler(arguments[0])) {
      scheduler = arguments[0];
      start = 1;
    } else {
      scheduler = immediateScheduler;
    }
    for(var args = [], i = start, len = arguments.length; i < len; i++) { args.push(arguments[i]); }
    return enumerableOf([observableFromArray(args, scheduler), this]).concat();
  };

  /**
   *  Returns a specified number of contiguous elements from the end of an observable sequence.
   * @description
   *  This operator accumulates a buffer with a length enough to store elements count elements. Upon completion of
   *  the source sequence, this buffer is drained on the result sequence. This causes the elements to be delayed.
   * @param {Number} count Number of elements to take from the end of the source sequence.
   * @returns {Observable} An observable sequence containing the specified number of elements from the end of the source sequence.
   */
  observableProto.takeLast = function (count) {
    if (count < 0) { throw new ArgumentOutOfRangeError(); }
    var source = this;
    return new AnonymousObservable(function (o) {
      var q = [];
      return source.subscribe(function (x) {
        q.push(x);
        q.length > count && q.shift();
      }, function (e) { o.onError(e); }, function () {
        while (q.length > 0) { o.onNext(q.shift()); }
        o.onCompleted();
      });
    }, source);
  };

  /**
   *  Returns an array with the specified number of contiguous elements from the end of an observable sequence.
   *
   * @description
   *  This operator accumulates a buffer with a length enough to store count elements. Upon completion of the
   *  source sequence, this buffer is produced on the result sequence.
   * @param {Number} count Number of elements to take from the end of the source sequence.
   * @returns {Observable} An observable sequence containing a single array with the specified number of elements from the end of the source sequence.
   */
  observableProto.takeLastBuffer = function (count) {
    var source = this;
    return new AnonymousObservable(function (o) {
      var q = [];
      return source.subscribe(function (x) {
        q.push(x);
        q.length > count && q.shift();
      }, function (e) { o.onError(e); }, function () {
        o.onNext(q);
        o.onCompleted();
      });
    }, source);
  };

  /**
   *  Projects each element of an observable sequence into zero or more windows which are produced based on element count information.
   *
   *  var res = xs.windowWithCount(10);
   *  var res = xs.windowWithCount(10, 1);
   * @param {Number} count Length of each window.
   * @param {Number} [skip] Number of elements to skip between creation of consecutive windows. If not specified, defaults to the count.
   * @returns {Observable} An observable sequence of windows.
   */
  observableProto.windowWithCount = function (count, skip) {
    var source = this;
    +count || (count = 0);
    Math.abs(count) === Infinity && (count = 0);
    if (count <= 0) { throw new ArgumentOutOfRangeError(); }
    skip == null && (skip = count);
    +skip || (skip = 0);
    Math.abs(skip) === Infinity && (skip = 0);

    if (skip <= 0) { throw new ArgumentOutOfRangeError(); }
    return new AnonymousObservable(function (observer) {
      var m = new SingleAssignmentDisposable(),
        refCountDisposable = new RefCountDisposable(m),
        n = 0,
        q = [];

      function createWindow () {
        var s = new Subject();
        q.push(s);
        observer.onNext(addRef(s, refCountDisposable));
      }

      createWindow();

      m.setDisposable(source.subscribe(
        function (x) {
          for (var i = 0, len = q.length; i < len; i++) { q[i].onNext(x); }
          var c = n - count + 1;
          c >= 0 && c % skip === 0 && q.shift().onCompleted();
          ++n % skip === 0 && createWindow();
        },
        function (e) {
          while (q.length > 0) { q.shift().onError(e); }
          observer.onError(e);
        },
        function () {
          while (q.length > 0) { q.shift().onCompleted(); }
          observer.onCompleted();
        }
      ));
      return refCountDisposable;
    }, source);
  };

  function concatMap(source, selector, thisArg) {
    var selectorFunc = bindCallback(selector, thisArg, 3);
    return source.map(function (x, i) {
      var result = selectorFunc(x, i, source);
      isPromise(result) && (result = observableFromPromise(result));
      (isArrayLike(result) || isIterable(result)) && (result = observableFrom(result));
      return result;
    }).concatAll();
  }

  /**
   *  One of the Following:
   *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
   *
   * @example
   *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); });
   *  Or:
   *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
   *
   *  var res = source.concatMap(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
   *  Or:
   *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
   *
   *  var res = source.concatMap(Rx.Observable.fromArray([1,2,3]));
   * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the
   * source sequence onto which could be either an observable or Promise.
   * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
   * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
   */
  observableProto.selectConcat = observableProto.concatMap = function (selector, resultSelector, thisArg) {
    if (isFunction(selector) && isFunction(resultSelector)) {
      return this.concatMap(function (x, i) {
        var selectorResult = selector(x, i);
        isPromise(selectorResult) && (selectorResult = observableFromPromise(selectorResult));
        (isArrayLike(selectorResult) || isIterable(selectorResult)) && (selectorResult = observableFrom(selectorResult));

        return selectorResult.map(function (y, i2) {
          return resultSelector(x, y, i, i2);
        });
      });
    }
    return isFunction(selector) ?
      concatMap(this, selector, thisArg) :
      concatMap(this, function () { return selector; });
  };

  /**
   * Projects each notification of an observable sequence to an observable sequence and concats the resulting observable sequences into one observable sequence.
   * @param {Function} onNext A transform function to apply to each element; the second parameter of the function represents the index of the source element.
   * @param {Function} onError A transform function to apply when an error occurs in the source sequence.
   * @param {Function} onCompleted A transform function to apply when the end of the source sequence is reached.
   * @param {Any} [thisArg] An optional "this" to use to invoke each transform.
   * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function corresponding to each notification in the input sequence.
   */
  observableProto.concatMapObserver = observableProto.selectConcatObserver = function(onNext, onError, onCompleted, thisArg) {
    var source = this,
        onNextFunc = bindCallback(onNext, thisArg, 2),
        onErrorFunc = bindCallback(onError, thisArg, 1),
        onCompletedFunc = bindCallback(onCompleted, thisArg, 0);
    return new AnonymousObservable(function (observer) {
      var index = 0;
      return source.subscribe(
        function (x) {
          var result;
          try {
            result = onNextFunc(x, index++);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
        },
        function (err) {
          var result;
          try {
            result = onErrorFunc(err);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        },
        function () {
          var result;
          try {
            result = onCompletedFunc();
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        });
    }, this).concatAll();
  };

    /**
     *  Returns the elements of the specified sequence or the specified value in a singleton sequence if the sequence is empty.
     *
     *  var res = obs = xs.defaultIfEmpty();
     *  2 - obs = xs.defaultIfEmpty(false);
     *
     * @memberOf Observable#
     * @param defaultValue The value to return if the sequence is empty. If not provided, this defaults to null.
     * @returns {Observable} An observable sequence that contains the specified default value if the source is empty; otherwise, the elements of the source itself.
     */
    observableProto.defaultIfEmpty = function (defaultValue) {
      var source = this;
      defaultValue === undefined && (defaultValue = null);
      return new AnonymousObservable(function (observer) {
        var found = false;
        return source.subscribe(function (x) {
          found = true;
          observer.onNext(x);
        },
        function (e) { observer.onError(e); }, 
        function () {
          !found && observer.onNext(defaultValue);
          observer.onCompleted();
        });
      }, source);
    };

  // Swap out for Array.findIndex
  function arrayIndexOfComparer(array, item, comparer) {
    for (var i = 0, len = array.length; i < len; i++) {
      if (comparer(array[i], item)) { return i; }
    }
    return -1;
  }

  function HashSet(comparer) {
    this.comparer = comparer;
    this.set = [];
  }
  HashSet.prototype.push = function(value) {
    var retValue = arrayIndexOfComparer(this.set, value, this.comparer) === -1;
    retValue && this.set.push(value);
    return retValue;
  };

  /**
   *  Returns an observable sequence that contains only distinct elements according to the keySelector and the comparer.
   *  Usage of this operator should be considered carefully due to the maintenance of an internal lookup structure which can grow large.
   *
   * @example
   *  var res = obs = xs.distinct();
   *  2 - obs = xs.distinct(function (x) { return x.id; });
   *  2 - obs = xs.distinct(function (x) { return x.id; }, function (a,b) { return a === b; });
   * @param {Function} [keySelector]  A function to compute the comparison key for each element.
   * @param {Function} [comparer]  Used to compare items in the collection.
   * @returns {Observable} An observable sequence only containing the distinct elements, based on a computed key value, from the source sequence.
   */
  observableProto.distinct = function (keySelector, comparer) {
    var source = this;
    comparer || (comparer = defaultComparer);
    return new AnonymousObservable(function (o) {
      var hashSet = new HashSet(comparer);
      return source.subscribe(function (x) {
        var key = x;

        if (keySelector) {
          try {
            key = keySelector(x);
          } catch (e) {
            o.onError(e);
            return;
          }
        }
        hashSet.push(key) && o.onNext(x);
      },
      function (e) { o.onError(e); }, function () { o.onCompleted(); });
    }, this);
  };

  var MapObservable = (function (__super__) {
    inherits(MapObservable, __super__);

    function MapObservable(source, selector, thisArg) {
      this.source = source;
      this.selector = bindCallback(selector, thisArg, 3);
      __super__.call(this);
    }
    
    function innerMap(selector, self) {
      return function (x, i, o) { return selector.call(this, self.selector(x, i, o), i, o); }
    }

    MapObservable.prototype.internalMap = function (selector, thisArg) {
      return new MapObservable(this.source, innerMap(selector, this), thisArg);
    };

    MapObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new InnerObserver(o, this.selector, this));
    };
    
    function InnerObserver(o, selector, source) {
      this.o = o;
      this.selector = selector;
      this.source = source;
      this.i = 0;
      this.isStopped = false;
    }
  
    InnerObserver.prototype.onNext = function(x) {
      if (this.isStopped) { return; }
      var result = tryCatch(this.selector)(x, this.i++, this.source);
      if (result === errorObj) {
        return this.o.onError(result.e);
      }
      this.o.onNext(result);
    };
    InnerObserver.prototype.onError = function (e) {
      if(!this.isStopped) { this.isStopped = true; this.o.onError(e); }
    };
    InnerObserver.prototype.onCompleted = function () {
      if(!this.isStopped) { this.isStopped = true; this.o.onCompleted(); }
    };
    InnerObserver.prototype.dispose = function() { this.isStopped = true; };
    InnerObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
        return true;
      }
  
      return false;
    };

    return MapObservable;

  }(ObservableBase));

  /**
  * Projects each element of an observable sequence into a new form by incorporating the element's index.
  * @param {Function} selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
  * @param {Any} [thisArg] Object to use as this when executing callback.
  * @returns {Observable} An observable sequence whose elements are the result of invoking the transform function on each element of source.
  */
  observableProto.map = observableProto.select = function (selector, thisArg) {
    var selectorFn = typeof selector === 'function' ? selector : function () { return selector; };
    return this instanceof MapObservable ?
      this.internalMap(selectorFn, thisArg) :
      new MapObservable(this, selectorFn, thisArg);
  };

  /**
   * Retrieves the value of a specified nested property from all elements in
   * the Observable sequence.
   * @param {Arguments} arguments The nested properties to pluck.
   * @returns {Observable} Returns a new Observable sequence of property values.
   */
  observableProto.pluck = function () {
    var args = arguments, len = arguments.length;
    if (len === 0) { throw new Error('List of properties cannot be empty.'); }
    return this.map(function (x) {
      var currentProp = x;
      for (var i = 0; i < len; i++) {
        var p = currentProp[args[i]];
        if (typeof p !== 'undefined') {
          currentProp = p;
        } else {
          return undefined;
        }
      }
      return currentProp;
    });
  };

  /**
   * Projects each notification of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
   * @param {Function} onNext A transform function to apply to each element; the second parameter of the function represents the index of the source element.
   * @param {Function} onError A transform function to apply when an error occurs in the source sequence.
   * @param {Function} onCompleted A transform function to apply when the end of the source sequence is reached.
   * @param {Any} [thisArg] An optional "this" to use to invoke each transform.
   * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function corresponding to each notification in the input sequence.
   */
  observableProto.flatMapObserver = observableProto.selectManyObserver = function (onNext, onError, onCompleted, thisArg) {
    var source = this;
    return new AnonymousObservable(function (observer) {
      var index = 0;

      return source.subscribe(
        function (x) {
          var result;
          try {
            result = onNext.call(thisArg, x, index++);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
        },
        function (err) {
          var result;
          try {
            result = onError.call(thisArg, err);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        },
        function () {
          var result;
          try {
            result = onCompleted.call(thisArg);
          } catch (e) {
            observer.onError(e);
            return;
          }
          isPromise(result) && (result = observableFromPromise(result));
          observer.onNext(result);
          observer.onCompleted();
        });
    }, source).mergeAll();
  };

  function flatMap(source, selector, thisArg) {
    var selectorFunc = bindCallback(selector, thisArg, 3);
    return source.map(function (x, i) {
      var result = selectorFunc(x, i, source);
      isPromise(result) && (result = observableFromPromise(result));
      (isArrayLike(result) || isIterable(result)) && (result = observableFrom(result));
      return result;
    }).mergeAll();
  }

  /**
   *  One of the Following:
   *  Projects each element of an observable sequence to an observable sequence and merges the resulting observable sequences into one observable sequence.
   *
   * @example
   *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); });
   *  Or:
   *  Projects each element of an observable sequence to an observable sequence, invokes the result selector for the source element and each of the corresponding inner sequence's elements, and merges the results into one observable sequence.
   *
   *  var res = source.selectMany(function (x) { return Rx.Observable.range(0, x); }, function (x, y) { return x + y; });
   *  Or:
   *  Projects each element of the source observable sequence to the other observable sequence and merges the resulting observable sequences into one observable sequence.
   *
   *  var res = source.selectMany(Rx.Observable.fromArray([1,2,3]));
   * @param {Function} selector A transform function to apply to each element or an observable sequence to project each element from the source sequence onto which could be either an observable or Promise.
   * @param {Function} [resultSelector]  A transform function to apply to each element of the intermediate sequence.
   * @param {Any} [thisArg] Object to use as this when executing callback.
   * @returns {Observable} An observable sequence whose elements are the result of invoking the one-to-many transform function collectionSelector on each element of the input sequence and then mapping each of those sequence elements and their corresponding source element to a result element.
   */
  observableProto.selectMany = observableProto.flatMap = function (selector, resultSelector, thisArg) {
    if (isFunction(selector) && isFunction(resultSelector)) {
      return this.flatMap(function (x, i) {
        var selectorResult = selector(x, i);
        isPromise(selectorResult) && (selectorResult = observableFromPromise(selectorResult));
        (isArrayLike(selectorResult) || isIterable(selectorResult)) && (selectorResult = observableFrom(selectorResult));

        return selectorResult.map(function (y, i2) {
          return resultSelector(x, y, i, i2);
        });
      }, thisArg);
    }
    return isFunction(selector) ?
      flatMap(this, selector, thisArg) :
      flatMap(this, function () { return selector; });
  };

  /**
   *  Projects each element of an observable sequence into a new sequence of observable sequences by incorporating the element's index and then
   *  transforms an observable sequence of observable sequences into an observable sequence producing values only from the most recent observable sequence.
   * @param {Function} selector A transform function to apply to each source element; the second parameter of the function represents the index of the source element.
   * @param {Any} [thisArg] Object to use as this when executing callback.
   * @returns {Observable} An observable sequence whose elements are the result of invoking the transform function on each element of source producing an Observable of Observable sequences
   *  and that at any point in time produces the elements of the most recent inner observable sequence that has been received.
   */
  observableProto.selectSwitch = observableProto.flatMapLatest = observableProto.switchMap = function (selector, thisArg) {
    return this.select(selector, thisArg).switchLatest();
  };

  var SkipObservable = (function(__super__) {
    inherits(SkipObservable, __super__);
    function SkipObservable(source, count) {
      this.source = source;
      this.skipCount = count;
      __super__.call(this);
    }
    
    SkipObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new InnerObserver(o, this.skipCount));
    };
    
    function InnerObserver(o, c) {
      this.c = c;
      this.r = c;
      this.o = o;
      this.isStopped = false;
    }
    InnerObserver.prototype.onNext = function (x) {
      if (this.isStopped) { return; }
      if (this.r <= 0) { 
        this.o.onNext(x);
      } else {
        this.r--;
      }
    };
    InnerObserver.prototype.onError = function(e) {
      if (!this.isStopped) { this.isStopped = true; this.o.onError(e); }
    };
    InnerObserver.prototype.onCompleted = function() {
      if (!this.isStopped) { this.isStopped = true; this.o.onCompleted(); }
    };
    InnerObserver.prototype.dispose = function() { this.isStopped = true; };
    InnerObserver.prototype.fail = function(e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
        return true;
      }
      return false;
    };
    
    return SkipObservable;
  }(ObservableBase));  
  
  /**
   * Bypasses a specified number of elements in an observable sequence and then returns the remaining elements.
   * @param {Number} count The number of elements to skip before returning the remaining elements.
   * @returns {Observable} An observable sequence that contains the elements that occur after the specified index in the input sequence.
   */
  observableProto.skip = function (count) {
    if (count < 0) { throw new ArgumentOutOfRangeError(); }
    return new SkipObservable(this, count);
  };
  /**
   *  Bypasses elements in an observable sequence as long as a specified condition is true and then returns the remaining elements.
   *  The element's index is used in the logic of the predicate function.
   *
   *  var res = source.skipWhile(function (value) { return value < 10; });
   *  var res = source.skipWhile(function (value, index) { return value < 10 || index < 10; });
   * @param {Function} predicate A function to test each element for a condition; the second parameter of the function represents the index of the source element.
   * @param {Any} [thisArg] Object to use as this when executing callback.
   * @returns {Observable} An observable sequence that contains the elements from the input sequence starting at the first element in the linear series that does not pass the test specified by predicate.
   */
  observableProto.skipWhile = function (predicate, thisArg) {
    var source = this,
        callback = bindCallback(predicate, thisArg, 3);
    return new AnonymousObservable(function (o) {
      var i = 0, running = false;
      return source.subscribe(function (x) {
        if (!running) {
          try {
            running = !callback(x, i++, source);
          } catch (e) {
            o.onError(e);
            return;
          }
        }
        running && o.onNext(x);
      }, function (e) { o.onError(e); }, function () { o.onCompleted(); });
    }, source);
  };

  /**
   *  Returns a specified number of contiguous elements from the start of an observable sequence, using the specified scheduler for the edge case of take(0).
   *
   *  var res = source.take(5);
   *  var res = source.take(0, Rx.Scheduler.timeout);
   * @param {Number} count The number of elements to return.
   * @param {Scheduler} [scheduler] Scheduler used to produce an OnCompleted message in case <paramref name="count count</paramref> is set to 0.
   * @returns {Observable} An observable sequence that contains the specified number of elements from the start of the input sequence.
   */
  observableProto.take = function (count, scheduler) {
    if (count < 0) { throw new ArgumentOutOfRangeError(); }
    if (count === 0) { return observableEmpty(scheduler); }
    var source = this;
    return new AnonymousObservable(function (o) {
      var remaining = count;
      return source.subscribe(function (x) {
        if (remaining-- > 0) {
          o.onNext(x);
          remaining <= 0 && o.onCompleted();
        }
      }, function (e) { o.onError(e); }, function () { o.onCompleted(); });
    }, source);
  };

  /**
   *  Returns elements from an observable sequence as long as a specified condition is true.
   *  The element's index is used in the logic of the predicate function.
   * @param {Function} predicate A function to test each element for a condition; the second parameter of the function represents the index of the source element.
   * @param {Any} [thisArg] Object to use as this when executing callback.
   * @returns {Observable} An observable sequence that contains the elements from the input sequence that occur before the element at which the test no longer passes.
   */
  observableProto.takeWhile = function (predicate, thisArg) {
    var source = this,
        callback = bindCallback(predicate, thisArg, 3);
    return new AnonymousObservable(function (o) {
      var i = 0, running = true;
      return source.subscribe(function (x) {
        if (running) {
          try {
            running = callback(x, i++, source);
          } catch (e) {
            o.onError(e);
            return;
          }
          if (running) {
            o.onNext(x);
          } else {
            o.onCompleted();
          }
        }
      }, function (e) { o.onError(e); }, function () { o.onCompleted(); });
    }, source);
  };

  var FilterObservable = (function (__super__) {
    inherits(FilterObservable, __super__);

    function FilterObservable(source, predicate, thisArg) {
      this.source = source;
      this.predicate = bindCallback(predicate, thisArg, 3);
      __super__.call(this);
    }

    FilterObservable.prototype.subscribeCore = function (o) {
      return this.source.subscribe(new InnerObserver(o, this.predicate, this));
    };
    
    function innerPredicate(predicate, self) {
      return function(x, i, o) { return self.predicate(x, i, o) && predicate.call(this, x, i, o); }
    }

    FilterObservable.prototype.internalFilter = function(predicate, thisArg) {
      return new FilterObservable(this.source, innerPredicate(predicate, this), thisArg);
    };
    
    function InnerObserver(o, predicate, source) {
      this.o = o;
      this.predicate = predicate;
      this.source = source;
      this.i = 0;
      this.isStopped = false;
    }
  
    InnerObserver.prototype.onNext = function(x) {
      if (this.isStopped) { return; }
      var shouldYield = tryCatch(this.predicate)(x, this.i++, this.source);
      if (shouldYield === errorObj) {
        return this.o.onError(shouldYield.e);
      }
      shouldYield && this.o.onNext(x);
    };
    InnerObserver.prototype.onError = function (e) {
      if(!this.isStopped) { this.isStopped = true; this.o.onError(e); }
    };
    InnerObserver.prototype.onCompleted = function () {
      if(!this.isStopped) { this.isStopped = true; this.o.onCompleted(); }
    };
    InnerObserver.prototype.dispose = function() { this.isStopped = true; };
    InnerObserver.prototype.fail = function (e) {
      if (!this.isStopped) {
        this.isStopped = true;
        this.o.onError(e);
        return true;
      }
      return false;
    };

    return FilterObservable;

  }(ObservableBase));

  /**
  *  Filters the elements of an observable sequence based on a predicate by incorporating the element's index.
  * @param {Function} predicate A function to test each source element for a condition; the second parameter of the function represents the index of the source element.
  * @param {Any} [thisArg] Object to use as this when executing callback.
  * @returns {Observable} An observable sequence that contains elements from the input sequence that satisfy the condition.
  */
  observableProto.filter = observableProto.where = function (predicate, thisArg) {
    return this instanceof FilterObservable ? this.internalFilter(predicate, thisArg) :
      new FilterObservable(this, predicate, thisArg);
  };

  /**
   * Executes a transducer to transform the observable sequence
   * @param {Transducer} transducer A transducer to execute
   * @returns {Observable} An Observable sequence containing the results from the transducer.
   */
  observableProto.transduce = function(transducer) {
    var source = this;

    function transformForObserver(o) {
      return {
        '@@transducer/init': function() {
          return o;
        },
        '@@transducer/step': function(obs, input) {
          return obs.onNext(input);
        },
        '@@transducer/result': function(obs) {
          return obs.onCompleted();
        }
      };
    }

    return new AnonymousObservable(function(o) {
      var xform = transducer(transformForObserver(o));
      return source.subscribe(
        function(v) {
          try {
            xform['@@transducer/step'](o, v);
          } catch (e) {
            o.onError(e);
          }
        },
        function (e) { o.onError(e); },
        function() { xform['@@transducer/result'](o); }
      );
    }, source);
  };

  var AnonymousObservable = Rx.AnonymousObservable = (function (__super__) {
    inherits(AnonymousObservable, __super__);

    // Fix subscriber to check for undefined or function returned to decorate as Disposable
    function fixSubscriber(subscriber) {
      return subscriber && isFunction(subscriber.dispose) ? subscriber :
        isFunction(subscriber) ? disposableCreate(subscriber) : disposableEmpty;
    }

    function setDisposable(s, state) {
      var ado = state[0], subscribe = state[1];
      var sub = tryCatch(subscribe)(ado);

      if (sub === errorObj) {
        if(!ado.fail(errorObj.e)) { return thrower(errorObj.e); }
      }
      ado.setDisposable(fixSubscriber(sub));
    }

    function AnonymousObservable(subscribe, parent) {
      this.source = parent;

      function s(observer) {
        var ado = new AutoDetachObserver(observer), state = [ado, subscribe];

        if (currentThreadScheduler.scheduleRequired()) {
          currentThreadScheduler.scheduleWithState(state, setDisposable);
        } else {
          setDisposable(null, state);
        }
        return ado;
      }

      __super__.call(this, s);
    }

    return AnonymousObservable;

  }(Observable));

  var AutoDetachObserver = (function (__super__) {
    inherits(AutoDetachObserver, __super__);

    function AutoDetachObserver(observer) {
      __super__.call(this);
      this.observer = observer;
      this.m = new SingleAssignmentDisposable();
    }

    var AutoDetachObserverPrototype = AutoDetachObserver.prototype;

    AutoDetachObserverPrototype.next = function (value) {
      var result = tryCatch(this.observer.onNext).call(this.observer, value);
      if (result === errorObj) {
        this.dispose();
        thrower(result.e);
      }
    };

    AutoDetachObserverPrototype.error = function (err) {
      var result = tryCatch(this.observer.onError).call(this.observer, err);
      this.dispose();
      result === errorObj && thrower(result.e);
    };

    AutoDetachObserverPrototype.completed = function () {
      var result = tryCatch(this.observer.onCompleted).call(this.observer);
      this.dispose();
      result === errorObj && thrower(result.e);
    };

    AutoDetachObserverPrototype.setDisposable = function (value) { this.m.setDisposable(value); };
    AutoDetachObserverPrototype.getDisposable = function () { return this.m.getDisposable(); };

    AutoDetachObserverPrototype.dispose = function () {
      __super__.prototype.dispose.call(this);
      this.m.dispose();
    };

    return AutoDetachObserver;
  }(AbstractObserver));

  var InnerSubscription = function (subject, observer) {
    this.subject = subject;
    this.observer = observer;
  };

  InnerSubscription.prototype.dispose = function () {
    if (!this.subject.isDisposed && this.observer !== null) {
      var idx = this.subject.observers.indexOf(this.observer);
      this.subject.observers.splice(idx, 1);
      this.observer = null;
    }
  };

  /**
   *  Represents an object that is both an observable sequence as well as an observer.
   *  Each notification is broadcasted to all subscribed observers.
   */
  var Subject = Rx.Subject = (function (__super__) {
    function subscribe(observer) {
      checkDisposed(this);
      if (!this.isStopped) {
        this.observers.push(observer);
        return new InnerSubscription(this, observer);
      }
      if (this.hasError) {
        observer.onError(this.error);
        return disposableEmpty;
      }
      observer.onCompleted();
      return disposableEmpty;
    }

    inherits(Subject, __super__);

    /**
     * Creates a subject.
     */
    function Subject() {
      __super__.call(this, subscribe);
      this.isDisposed = false,
      this.isStopped = false,
      this.observers = [];
      this.hasError = false;
    }

    addProperties(Subject.prototype, Observer.prototype, {
      /**
       * Indicates whether the subject has observers subscribed to it.
       * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
       */
      hasObservers: function () { return this.observers.length > 0; },
      /**
       * Notifies all subscribed observers about the end of the sequence.
       */
      onCompleted: function () {
        checkDisposed(this);
        if (!this.isStopped) {
          this.isStopped = true;
          for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
            os[i].onCompleted();
          }

          this.observers.length = 0;
        }
      },
      /**
       * Notifies all subscribed observers about the exception.
       * @param {Mixed} error The exception to send to all observers.
       */
      onError: function (error) {
        checkDisposed(this);
        if (!this.isStopped) {
          this.isStopped = true;
          this.error = error;
          this.hasError = true;
          for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
            os[i].onError(error);
          }

          this.observers.length = 0;
        }
      },
      /**
       * Notifies all subscribed observers about the arrival of the specified element in the sequence.
       * @param {Mixed} value The value to send to all observers.
       */
      onNext: function (value) {
        checkDisposed(this);
        if (!this.isStopped) {
          for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
            os[i].onNext(value);
          }
        }
      },
      /**
       * Unsubscribe all observers and release resources.
       */
      dispose: function () {
        this.isDisposed = true;
        this.observers = null;
      }
    });

    /**
     * Creates a subject from the specified observer and observable.
     * @param {Observer} observer The observer used to send messages to the subject.
     * @param {Observable} observable The observable used to subscribe to messages sent from the subject.
     * @returns {Subject} Subject implemented using the given observer and observable.
     */
    Subject.create = function (observer, observable) {
      return new AnonymousSubject(observer, observable);
    };

    return Subject;
  }(Observable));

  /**
   *  Represents the result of an asynchronous operation.
   *  The last value before the OnCompleted notification, or the error received through OnError, is sent to all subscribed observers.
   */
  var AsyncSubject = Rx.AsyncSubject = (function (__super__) {

    function subscribe(observer) {
      checkDisposed(this);

      if (!this.isStopped) {
        this.observers.push(observer);
        return new InnerSubscription(this, observer);
      }

      if (this.hasError) {
        observer.onError(this.error);
      } else if (this.hasValue) {
        observer.onNext(this.value);
        observer.onCompleted();
      } else {
        observer.onCompleted();
      }

      return disposableEmpty;
    }

    inherits(AsyncSubject, __super__);

    /**
     * Creates a subject that can only receive one value and that value is cached for all future observations.
     * @constructor
     */
    function AsyncSubject() {
      __super__.call(this, subscribe);

      this.isDisposed = false;
      this.isStopped = false;
      this.hasValue = false;
      this.observers = [];
      this.hasError = false;
    }

    addProperties(AsyncSubject.prototype, Observer, {
      /**
       * Indicates whether the subject has observers subscribed to it.
       * @returns {Boolean} Indicates whether the subject has observers subscribed to it.
       */
      hasObservers: function () {
        checkDisposed(this);
        return this.observers.length > 0;
      },
      /**
       * Notifies all subscribed observers about the end of the sequence, also causing the last received value to be sent out (if any).
       */
      onCompleted: function () {
        var i, len;
        checkDisposed(this);
        if (!this.isStopped) {
          this.isStopped = true;
          var os = cloneArray(this.observers), len = os.length;

          if (this.hasValue) {
            for (i = 0; i < len; i++) {
              var o = os[i];
              o.onNext(this.value);
              o.onCompleted();
            }
          } else {
            for (i = 0; i < len; i++) {
              os[i].onCompleted();
            }
          }

          this.observers.length = 0;
        }
      },
      /**
       * Notifies all subscribed observers about the error.
       * @param {Mixed} error The Error to send to all observers.
       */
      onError: function (error) {
        checkDisposed(this);
        if (!this.isStopped) {
          this.isStopped = true;
          this.hasError = true;
          this.error = error;

          for (var i = 0, os = cloneArray(this.observers), len = os.length; i < len; i++) {
            os[i].onError(error);
          }

          this.observers.length = 0;
        }
      },
      /**
       * Sends a value to the subject. The last value received before successful termination will be sent to all subscribed and future observers.
       * @param {Mixed} value The value to store in the subject.
       */
      onNext: function (value) {
        checkDisposed(this);
        if (this.isStopped) { return; }
        this.value = value;
        this.hasValue = true;
      },
      /**
       * Unsubscribe all observers and release resources.
       */
      dispose: function () {
        this.isDisposed = true;
        this.observers = null;
        this.exception = null;
        this.value = null;
      }
    });

    return AsyncSubject;
  }(Observable));

  var AnonymousSubject = Rx.AnonymousSubject = (function (__super__) {
    inherits(AnonymousSubject, __super__);

    function subscribe(observer) {
      return this.observable.subscribe(observer);
    }

    function AnonymousSubject(observer, observable) {
      this.observer = observer;
      this.observable = observable;
      __super__.call(this, subscribe);
    }

    addProperties(AnonymousSubject.prototype, Observer.prototype, {
      onCompleted: function () {
        this.observer.onCompleted();
      },
      onError: function (error) {
        this.observer.onError(error);
      },
      onNext: function (value) {
        this.observer.onNext(value);
      }
    });

    return AnonymousSubject;
  }(Observable));

  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    root.Rx = Rx;

    define(function() {
      return Rx;
    });
  } else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = Rx).Rx = Rx;
    } else {
      freeExports.Rx = Rx;
    }
  } else {
    // in a browser or Rhino
    root.Rx = Rx;
  }

  // All code before this point will be filtered from stack traces.
  var rEndingLine = captureLine();

}.call(this));

}).call(this,require(141),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"141":141}]},{},[1]);
