var ModelRoot = require("./ModelRoot");
var ModelDataSourceAdapter = require("./ModelDataSourceAdapter");

var RequestQueue = require("./request/RequestQueue");
var GetResponse = require("./response/GetResponse");
var SetResponse = require("./response/SetResponse");
var CallResponse = require("./response/CallResponse");
var InvalidateResponse = require("./response/InvalidateResponse");

var ASAPScheduler = require("./schedulers/ASAPScheduler");
var TimeoutScheduler = require("./schedulers/TimeoutScheduler");
var ImmediateScheduler = require("./schedulers/ImmediateScheduler");

var identity = require("./support/identity");
var arrayClone = require("./support/array-clone");
var arraySlice = require("./support/array-slice");

var collectLru = require("./lru/collect");
var pathSyntax = require("falcor-path-syntax");

var getSize = require("./support/get-size");
var isObject = require("./support/is-object");
var isFunction = require("./support/is-function");
var isPathValue = require("./support/is-path-value");
var isJsonEnvelope = require("./support/is-json-envelope");
var isJsonGraphEnvelope = require("./support/is-json-graph-envelope");

var setCache = require("./set/set-cache");
var setJsonGraphAsJsonDense = require("./set/set-json-graph-as-json-dense");
var jsong = require("falcor-json-graph");
var ID = 0;

module.exports = Model;

Model.ref = jsong.ref;
Model.atom = jsong.atom;
Model.error = jsong.error;
Model.pathValue = jsong.pathValue;

/**
 * A Model object is used to execute commands against a {@link JSONGraph} object. {@link Model}s can work with a local JSONGraph cache, or it can work with a remote {@link JSONGraph} object through a {@link DataSource}.
 * @constructor
 * @param {?Object} options - a set of options to customize behavior
 * @param {?DataSource} options.source - a data source to retrieve and manage the {@link JSONGraph}
 * @param {?JSONGraph} options.cache - initial state of the {@link JSONGraph}
 * @param {?number} options.maxSize - the maximum size of the cache
 * @param {?number} options.collectRatio - the ratio of the maximum size to collect when the maxSize is exceeded
 * @param {?Model~errorSelector} options.errorSelector - a function used to translate errors before they are returned
 */
function Model(o) {

    var options = o || {};
    this._root = options._root || new ModelRoot(options);
    this._path = options.path || options._path || [];
    this._scheduler = options.scheduler || options._scheduler || new ImmediateScheduler();
    this._source = options.source || options._source;
    this._request = options.request || options._request || new RequestQueue(this, this._scheduler);
    this._ID = ID++;

    if (typeof options.maxSize === "number") {
        this._maxSize = options.maxSize;
    } else {
        this._maxSize = options._maxSize || Model.prototype._maxSize;
    }

    if (typeof options.collectRatio === "number") {
        this._collectRatio = options.collectRatio;
    } else {
        this._collectRatio = options._collectRatio || Model.prototype._collectRatio;
    }

    if (options.boxed || options.hasOwnProperty("_boxed")) {
        this._boxed = options.boxed || options._boxed;
    }

    if (options.materialized || options.hasOwnProperty("_materialized")) {
        this._materialized = options.materialized || options._materialized;
    }

    if (typeof options.treatErrorsAsValues === "boolean") {
        this._treatErrorsAsValues = options.treatErrorsAsValues;
    } else if (options.hasOwnProperty("_treatErrorsAsValues")) {
        this._treatErrorsAsValues = options._treatErrorsAsValues;
    }

    if (options.cache) {
        this.setCache(options.cache);
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
 * @param {...PathSet} path - the path(s) to retrieve
 * @param {?Function} selector - the callback to execute once all of the paths have been retrieved
 * @return {ModelResponse.<JSONEnvelope>|Observable} - the requested data as JSON, or the result of the optional selector function
 */
Model.prototype.get = function get() {
    var args;
    var argsIdx = -1;
    var argsLen = arguments.length;
    var selector = arguments[argsLen - 1];
    if (isFunction(selector)) {
        argsLen = argsLen - 1;
    } else {
        selector = void 0;
    }
    args = new Array(argsLen);
    while (++argsIdx < argsLen) {
        args[argsIdx] = arguments[argsIdx];
    }
    return GetResponse.create(this, args, selector);
};

/**
 * Sets the value at one or more places in the JSONGraph model. The set method accepts one or more {@link PathValue}s, each of which is a combination of a location in the document and the value to place there.  In addition to accepting  {@link PathValue}s, the set method also returns the values after the set operation is complete.
 * @function
 * @param {...(PathValue | JSONGraphEnvelope | JSONEnvelope)} value - a value or collection of values to set into the Model.
 * @return {ModelResponse.<JSON> | Observable} - an {@link Observable} stream containing the values in the JSONGraph model after the set was attempted
 */
Model.prototype.set = function set() {
    var args;
    var argsIdx = -1;
    var argsLen = arguments.length;
    var selector = arguments[argsLen - 1];
    if (isFunction(selector)) {
        argsLen = argsLen - 1;
    } else {
        selector = void 0;
    }
    args = new Array(argsLen);
    while (++argsIdx < argsLen) {
        args[argsIdx] = arguments[argsIdx];
    }
    return SetResponse.create(this, args, selector);
};

/*
 * Invoke a function
 * @function
 * @param {Path} functionPath - the path to the function to invoke
 * @param {Array.<Object>} args - the arguments to pass to the function
 * @param {Array.<PathSet>} pathSuffixes - the paths to retrieve from objects returned from the function
 * @param {Array.<PathSet>} calleePaths - the paths to retrieve from function callee after successful function execution
 * @param {Function} selector the selector function
 * @returns {ModelResponse.<*> | Observable} the {JSONGraph} fragment and associated metadata returned from the invoked function
 */
Model.prototype.call = function call() {
    var args;
    var argsIdx = -1;
    var argsLen = arguments.length;
    var selector = arguments[argsLen - 1];
    if (isFunction(selector)) {
        argsLen = argsLen - 1;
    } else {
        selector = void 0;
    }
    args = new Array(argsLen);
    while (++argsIdx < argsLen) {
        args[argsIdx] = arguments[argsIdx];
    }
    return CallResponse.create(this, args, selector);
};

Model.prototype.invalidate = function invalidate() {
    var args;
    var argsIdx = -1;
    var argsLen = arguments.length;
    var selector = arguments[argsLen - 1];
    if (isFunction(selector)) {
        argsLen = argsLen - 1;
    } else {
        selector = void 0;
    }
    args = new Array(argsLen);
    while (++argsIdx < argsLen) {
        args[argsIdx] = arguments[argsIdx];
    }
    InvalidateResponse.create(this, args, selector).subscribe();
    return this;
};

/**
 * Returns a clone of the {@link Model} bound to a location within the {@link JSONGraph}. The bound location is never a {@link Reference}: any {@link Reference}s encountered while resolving the bound {@link Path} are always replaced with the {@link Reference}s target value. For subsequent operations on the {@link Model}, all paths will be evaluated relative to the bound path. Deref allows you to:
 * - Expose only a fragment of the {@link JSONGraph} to components, rather than the entire graph
 * - Hide the location of a {@link JSONGraph} fragment from components
 * - Optimize for executing multiple operations and path looksup at/below the same location in the {@link JSONGraph}
 * @method
 * @param {Path} boundPath - the path to bind to
 * @param {...PathSet} relativePathsToPreload - paths (relative to the bound path) to preload before Model is created
 * @return {Observable.<Model>} - an Observable stream with a single value, the bound {@link Model}, or an empty stream if nothing is found at the path
 */
Model.prototype.deref = require("./deref");

/**
 * Get data for a single {@link Path}.
 * @param {Path} path - the path to retrieve
 * @return {Observable.<*>} - the value for the path
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

Model.prototype.setValue = function setValue(pathArg, valueArg) {
    var path = pathSyntax.fromPath(pathArg);
    var value = isPathValue(path) ? path : Model.pathValue(path, valueArg);
    return this.set(value, identity);
};

// TODO: Does not throw if given a PathSet rather than a Path, not sure if it should or not.
// TODO: Doc not accurate? I was able to invoke directly against the Model, perhaps because I don't have a data source?
// TODO: Not clear on what it means to "retrieve objects in addition to JSONGraph values"
/**
 * Synchronously retrieves a single path from the local {@link Model} only and will not retrieve missing paths from the {@link DataSource}. This method can only be invoked when the {@link Model} does not have a {@link DataSource} or from within a selector function. See {@link Model.prototype.get}. The getValueSync method differs from the asynchronous get methods (ex. get, getValues) in that it can be used to retrieve objects in addition to JSONGraph values.
 * @method
 * @arg {Path} path - the path to retrieve
 * @return {*} - the value for the specified path
 */
Model.prototype.getValueSync = require("./get/sync");

Model.prototype.setValueSync = require("./set/sync");

Model.prototype.derefSync = require("./deref/sync");

/**
 * Set the local cache to a {@link JSONGraph} fragment. This method can be a useful way of mocking a remote document, or restoring the local cache from a previously stored state.
 * @param {JSONGraph} jsonGraph - the {@link JSONGraph} fragment to use as the local cache
 */
Model.prototype.setCache = function modelSetCache(cacheOrJSONGraphEnvelope) {
    var cache = this._root.cache;
    if (cacheOrJSONGraphEnvelope !== cache) {
        var modelRoot = this._root;
        this._root.cache = {};
        if (typeof cache !== "undefined") {
            collectLru(modelRoot, modelRoot.expired, getSize(cache), 0);
        }
        if (isJsonGraphEnvelope(cacheOrJSONGraphEnvelope)) {
            setJsonGraphAsJsonDense(this, [cacheOrJSONGraphEnvelope], []);
        } else if (isJsonEnvelope(cacheOrJSONGraphEnvelope)) {
            setCache(this, cacheOrJSONGraphEnvelope.json);
        } else if (isObject(cacheOrJSONGraphEnvelope)) {
            setCache(this, cacheOrJSONGraphEnvelope);
        }
    } else if (typeof cache === "undefined") {
        this._root.cache = {};
    }
    return this;
};

/**
 * Get the local {@link JSONGraph} cache. This method can be a useful to store the state of the cache.
 * @param {...Array.<PathSet>} [pathSets] - The path(s) to retrieve. If no paths are specified, the entire {@link JSONGraph} is returned.
 * @return {JSONGraph} jsonGraph - a {@link JSONGraph} fragment
 * @example
 // Storing the boxshot of the first 10 titles in the first 10 genreLists to local storage.
 localStorage.setItem('cache', JSON.stringify(model.getCache("genreLists[0...10][0...10].boxshot")));
 */
Model.prototype.getCache = function getCache() {
    var paths = arraySlice(arguments);
    if (paths.length === 0) {
        paths[0] = {
            json: this._root.cache
        };
    }
    var result;
    this.get.apply(this.withoutDataSource().boxValues().treatErrorsAsValues().materialize(), paths).
    toJSONG().
    subscribe(function(envelope) {
        result = envelope.jsonGraph || envelope.jsong;
    });
    return result;
};

Model.prototype.getVersion = function getVersion(pathArg) {
    var path = pathArg && pathSyntax.fromPath(pathArg) || [];
    if (Array.isArray(path) === false) {
        throw new Error("Model#getVersion must be called with an Array path.");
    }
    if (this._path.length) {
        path = this._path.concat(path);
    }
    return this._getVersion(this, path);
};

Model.prototype.syncCheck = function syncCheck(name) {
    if (Boolean(this._source) && this._root.syncRefCount <= 0 && this._root.unsafeMode === false) {
        throw new Error("Model#" + name + " may only be called within the context of a request selector.");
    }
    return true;
};

/* eslint-disable guard-for-in */
Model.prototype.clone = function cloneModel(opts) {
    var clone = new Model(this);
    for (var key in opts) {
        var value = opts[key];
        if (value === "delete") {
            delete clone[key];
        } else {
            clone[key] = value;
        }
    }
    clone.setCache = void 0;
    return clone;
};
/* eslint-enable */

// TODO: Should we be clearer this only applies to "get" operations? I'm assuming that is true
/**
 * Returns a clone of the {@link Model} that eanbles batching. Within the configured time period, paths for operations of the same type are collected and executed on the {@link DataSource} in a batch. Batching can make more efficient use of the {@link DataSource} depending on its implementation, for example, reducing the number of HTTP requests to the server.
 * @param {?Scheduler|number} schedulerOrDelay - Either a {@link Scheduler} that determines when to send a batch to the {@link DataSource}, or the number in milliseconds to collect a batch before sending to the {@link DataSource}. If this parameter is omitted, then batch collection ends at the end of the next tick.
 * @return {Model}
 */
Model.prototype.batch = function batch(schedulerOrDelayArg) {
    var schedulerOrDelay = schedulerOrDelayArg;
    if (typeof schedulerOrDelay === "number") {
        schedulerOrDelay = new TimeoutScheduler(Math.round(Math.abs(schedulerOrDelay)));
    } else if (!schedulerOrDelay || !schedulerOrDelay.schedule) {
        schedulerOrDelay = new ASAPScheduler();
    }
    var clone = this.clone();
    clone._request = new RequestQueue(clone, schedulerOrDelay);

    return clone;
};

/**
 * Returns a clone of the {@link Model} that disables batching. This is the default mode. Each operation will be executed on the {@link DataSource} separately.
 * @name unbatch
 * @memberof Model.prototype
 * @function
 * @return {Model} A {@link Model} that batches requests of the same type and sends them to the data source together
 */
Model.prototype.unbatch = function unbatch() {
    var clone = this.clone();
    clone._request = new RequestQueue(clone, new ImmediateScheduler());
    return clone;
};

// TODO: Add example of treatErrorsAsValues
/**
 * Returns a clone of the {@link Model} that treats errors as values. Errors will be reported in the same callback used to report data. Errors will appear as objects in responses, rather than being sent to the {@link Observable~onErrorCallback} callback of the {@link ModelResponse}.
 * @return {Model}
 */
Model.prototype.treatErrorsAsValues = function treatErrorsAsValues() {
    return this.clone({
        _treatErrorsAsValues: true
    });
};

Model.prototype.asDataSource = function asDataSource() {
    return new ModelDataSourceAdapter(this);
};

Model.prototype.materialize = function materialize() {
    return this.clone({
        _materialized: true
    });
};

Model.prototype.dematerialize = function dematerialize() {
    return this.clone({
        _materialized: "delete"
    });
};

/**
 * Returns a clone of the {@link Model} that boxes values returning the wrapper ({@link Atom}, {@link Reference}, or {@link Error}), rather than the value inside it. This allows any metadata attached to the wrapper to be inspected.
 * @return {Model}
 */
Model.prototype.boxValues = function boxValues() {
    return this.clone({
        _boxed: true
    });
};

/**
 * Returns a clone of the {@link Model} that unboxes values, returning the value inside of the wrapper ({@link Atom}, {@link Reference}, or {@link Error}), rather than the wrapper itself. This is the default mode.
 * @return {Model}
 */
Model.prototype.unboxValues = function unboxValues() {
    return this.clone({
        _boxed: "delete"
    });
};

/**
 * Returns a clone of the {@link Model} that only uses the local {@link JSONGraph} and never uses a {@link DataSource} to retrieve missing paths.
 * @return {Model}
 */
Model.prototype.withoutDataSource = function withoutDataSource() {
    return this.clone({
        _source: "delete"
    });
};

Model.prototype.toJSON = function toJSON() {
    return {
        $type: "ref",
        value: this._path
    };
};

Model.prototype.getPath = function getPath() {
    return arrayClone(this._path);
};

var getWalk = require("./get/getWalk");

Model.prototype._getBoundValue = require("./get/getBoundValue");
Model.prototype._getVersion = require("./get/getVersion");
Model.prototype._getValueSync = require("./get/getValueSync");
Model.prototype._getPathSetsAsValues = require("./get/getAsValues")(getWalk);
Model.prototype._getPathSetsAsJSON = require("./get/getAsJSON")(getWalk);
Model.prototype._getPathSetsAsPathMap = require("./get/getAsPathMap")(getWalk);
Model.prototype._getPathSetsAsJSONG = require("./get/getAsJSONG")(getWalk);
Model.prototype._getPathMapsAsValues = require("./get/getAsValues")(getWalk);
Model.prototype._getPathMapsAsJSON = require("./get/getAsJSON")(getWalk);
Model.prototype._getPathMapsAsPathMap = require("./get/getAsPathMap")(getWalk);
Model.prototype._getPathMapsAsJSONG = require("./get/getAsJSONG")(getWalk);

Model.prototype._setPathValuesAsJSON = require("./set/set-json-values-as-json-dense");
Model.prototype._setPathValuesAsJSONG = require("./set/set-json-values-as-json-graph");
Model.prototype._setPathValuesAsPathMap = require("./set/set-json-values-as-json-sparse");
Model.prototype._setPathValuesAsValues = require("./set/set-json-values-as-json-values");

Model.prototype._setPathMapsAsJSON = require("./set/set-json-sparse-as-json-dense");
Model.prototype._setPathMapsAsJSONG = require("./set/set-json-sparse-as-json-graph");
Model.prototype._setPathMapsAsPathMap = require("./set/set-json-sparse-as-json-sparse");
Model.prototype._setPathMapsAsValues = require("./set/set-json-sparse-as-json-values");

Model.prototype._setJSONGsAsJSON = require("./set/set-json-graph-as-json-dense");
Model.prototype._setJSONGsAsJSONG = require("./set/set-json-graph-as-json-graph");
Model.prototype._setJSONGsAsPathMap = require("./set/set-json-graph-as-json-sparse");
Model.prototype._setJSONGsAsValues = require("./set/set-json-graph-as-json-values");

Model.prototype._setCache = require("./set/set-cache");

Model.prototype._invalidatePathSetsAsJSON = require("./invalidate/invalidate-path-sets-as-json-dense");
Model.prototype._invalidatePathMapsAsJSON = require("./invalidate/invalidate-json-sparse-as-json-dense");
