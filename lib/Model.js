var $ref = require("falcor/types/ref");
var $atom = require("falcor/types/atom");
var $error = require("falcor/types/error");

var ModelRoot = require("falcor/ModelRoot");
var ModelDataSourceAdapter = require('falcor/ModelDataSourceAdapter');

var RequestQueue = require("falcor/request/RequestQueue");
var GetResponse = require("falcor/response/GetResponse");
var SetResponse = require("falcor/response/SetResponse");
var CallResponse = require("falcor/response/CallResponse");
var InvalidateResponse = require("falcor/response/InvalidateResponse");

var ASAPScheduler = require("falcor/schedulers/ASAPScheduler");
var TimeoutScheduler = require("falcor/schedulers/TimeoutScheduler");
var ImmediateScheduler = require("falcor/schedulers/ImmediateScheduler");

var identity = require("falcor/support/identity");
var array_clone = require("falcor/support/array-clone");
var array_slice = require("falcor/support/array-slice");

var collect_lru = require("falcor/lru/collect");
var pathSyntax = require("falcor-path-syntax");

var get_size = require("falcor/support/get-size");
var is_object = require("falcor/support/is-object");
var is_function = require("falcor/support/is-function");
var is_path_value = require("falcor/support/is-path-value");
var is_json_envelope = require("falcor/support/is-json-envelope");
var is_json_graph_envelope = require("falcor/support/is-json-graph-envelope");

var set_cache = require("falcor/set/set-cache");
var set_json_graph_as_json_dense = require("falcor/set/set-json-graph-as-json-dense");

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
Model.prototype.bind = require("falcor/bind");

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
Model.prototype.getValueSync = require("falcor/get/sync");

Model.prototype.setValueSync = require("falcor/set/sync");

Model.prototype.bindSync = require("falcor/bind/sync");

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

var get_walk = require("falcor/get/getWalk");

Model.prototype._getBoundValue = require("falcor/get/getBoundValue");
Model.prototype._getGeneration = require("falcor/get/getGeneration");
Model.prototype._getValueSync = require("falcor/get/getValueSync");
Model.prototype._getPathSetsAsValues = require("falcor/get/getAsValues")(get_walk);
Model.prototype._getPathSetsAsJSON = require("falcor/get/getAsJSON")(get_walk);
Model.prototype._getPathSetsAsPathMap = require("falcor/get/getAsPathMap")(get_walk);
Model.prototype._getPathSetsAsJSONG = require("falcor/get/getAsJSONG")(get_walk);
Model.prototype._getPathMapsAsValues = require("falcor/get/getAsValues")(get_walk);
Model.prototype._getPathMapsAsJSON = require("falcor/get/getAsJSON")(get_walk);
Model.prototype._getPathMapsAsPathMap = require("falcor/get/getAsPathMap")(get_walk);
Model.prototype._getPathMapsAsJSONG = require("falcor/get/getAsJSONG")(get_walk);

Model.prototype._setPathValuesAsJSON = require("falcor/set/set-json-values-as-json-dense");
Model.prototype._setPathValuesAsJSONG = require("falcor/set/set-json-values-as-json-graph");
Model.prototype._setPathValuesAsPathMap = require("falcor/set/set-json-values-as-json-sparse");
Model.prototype._setPathValuesAsValues = require("falcor/set/set-json-values-as-json-values");

Model.prototype._setPathMapsAsJSON = require("falcor/set/set-json-sparse-as-json-dense");
Model.prototype._setPathMapsAsJSONG = require("falcor/set/set-json-sparse-as-json-graph");
Model.prototype._setPathMapsAsPathMap = require("falcor/set/set-json-sparse-as-json-sparse");
Model.prototype._setPathMapsAsValues = require("falcor/set/set-json-sparse-as-json-values");

Model.prototype._setJSONGsAsJSON = require("falcor/set/set-json-graph-as-json-dense");
Model.prototype._setJSONGsAsJSONG = require("falcor/set/set-json-graph-as-json-graph");
Model.prototype._setJSONGsAsPathMap = require("falcor/set/set-json-graph-as-json-sparse");
Model.prototype._setJSONGsAsValues = require("falcor/set/set-json-graph-as-json-values");

Model.prototype._setCache = require("falcor/set/set-cache");

Model.prototype._invalidatePathSetsAsJSON = require("falcor/invalidate/invalidate-path-sets-as-json-dense");
Model.prototype._invalidatePathMapsAsJSON = require("falcor/invalidate/invalidate-json-sparse-as-json-dense");
