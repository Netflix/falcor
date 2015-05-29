var falcor = require('./Falcor');
var ModelRoot = require('./ModelRoot');
var RequestQueue = require('./request/RequestQueue');
var ImmediateScheduler = require('./scheduler/ImmediateScheduler');
var ASAPScheduler = require('./scheduler/ASAPScheduler');
var TimeoutScheduler = require('./scheduler/TimeoutScheduler');
var ERROR = require("../types/error");
var ModelResponse = require('./ModelResponse');
var ModelDataSourceAdapter = require('./ModelDataSourceAdapter');
var call = require('./operations/call');
var operations = require('./operations');
var pathSyntax = require('falcor-path-syntax');
var getBoundValue = require('./../get/getBoundValue');
var collect = require('../lru/collect');
var slice = Array.prototype.slice;
var $ref = require('./../types/path');
var $error = require('./../types/error');
var $atom = require('./../types/atom');
var getGeneration = require('./../get/getGeneration');
var noop = function(){};
var bind = require('./operations/bind/bind');

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
var Model = module.exports = falcor.Model = function Model(options) {

    if (!options) {
        options = {};
    }

    this._materialized = options.materialized || false;
    this._boxed = options.boxed || false;
    this._treatErrorsAsValues = options.treatErrorsAsValues || false;

    this._dataSource = options.source;
    this._maxSize = options.maxSize || Math.pow(2, 53) - 1;
    this._collectRatio = options.collectRatio || 0.75;
    this._scheduler = new ImmediateScheduler();
    this._request = new RequestQueue(this, this._scheduler);
    this._errorSelector = options.errorSelector || Model.prototype._errorSelector;
    this._router = options.router;

    this._root = options.root || new ModelRoot();

    if (options.cache && typeof options.cache === "object") {
        this.setCache(options.cache);
    } else {
        this._cache = {};
    }
    this._path = [];
};

/**
 * The {@link Model}'s error selector is applied to any errors that occur during Model operations.  The return value of the error selector is substituted for the input error, giving clients the opportunity to translate error objects before they are returned from the {@link Model}.
 * @callback Model~errorSelector
 * @param {Object} requestedPath the requested path at which the error was found.
 * @error {Error} error the error that occured during the {@link Model} operation.
 * @returns {Error} the translated error object.
 */

Model.EXPIRES_NOW = falcor.EXPIRES_NOW;
Model.EXPIRES_NEVER = falcor.EXPIRES_NEVER;

Model.REF_TARGET = null;

Model.pathValue = function(path, value) {
    if (typeof path === 'string') {
        path = pathSyntax(path);
    }
    return {path: path, value: value};
};

Model.ref = function(path) {
    if (typeof path === 'string') {
        path = pathSyntax(path);
    }
    return {$type: $ref, value: path};
};

Model.error = function(error) {
    return {$type: $error, value: error};
};

Model.atom = function(value) {
    return {$type: $atom, value: value};
};

Model.prototype = {
    _boxed: false,
    _progressive: false,
    _errorSelector: function(x, y) { return y; },
    _comparator: function(a, b) {
        if (Boolean(a) && typeof a === "object" && a.hasOwnProperty("value") &&
            Boolean(b) && typeof b === "object" && b.hasOwnProperty("value")) {
            return a.value === b.value;
        }
        return a === b;
    },
    /**
     * The get method retrieves several {@link Path}s or {@link PathSet}s from a {@link Model}. The get method is versatile and may be called in several different ways, allowing you to make different trade-offs between performance and expressiveness. The simplest invocation returns an ModelResponse stream that contains a JSON object with all of the requested values. An optional selector function can also be passed in order to translate the retrieved data before it appears in the Observable stream. If a selector function is provided, the output will be an Observable stream with the result of the selector function invocation instead of a ModelResponse stream.
     If you intend to transform the JSON data into another form, specifying a selector function may be more efficient. The selector function is run once all of the requested path values are available. In the body of the selector function, you can read data from the Model's cache using {@link Model.prototype.getValueSync} and transform it directly into its final representation (ex. an HTML string). This technique can reduce allocations by preventing the get method from copying the data in {@link Model}'s cache into an intermediary JSON representation.
     Instead of directly accessing the cache within the selector function, you can optionally pass arguments to the selector function and they will be automatically bound to the corresponding {@link Path} or {@link PathSet} passed to the get method. If a {@link Path} is bound to a selector function argument, the function argument will contain the value found at that path. However if a {@link PathSet} is bound to a selector function argument, the function argument will be a JSON structure containing all of the path values. Using argument binding can provide a good balance between allocations and expressiveness. For more detail on how {@link Path}s and {@link PathSet}s are bound to selector function arguments, see the examples below.
     * @function
     * @param {...PathSet} path - The path(s) to retrieve
     * @param {?Function} selector - The callback to execute once all of the paths have been retrieved
     * @return {ModelResponse.<JSONEnvelope>|Observable} - The requested data as JSON, or the result of the optional selector function.
     */
    get: operations("get"),
    /**
     * Sets the value at one or more places in the JSONGraph model. The set method accepts one or more {@link PathValue}s, each of which is a combination of a location in the document and the value to place there.  In addition to accepting  {@link PathValue}s, the set method also returns the values after the set operation is complete.
     * @function
     * @param {...(PathValue | JSONGraphEnvelope | JSONEnvelope)} value - A value or collection of values to set into the Model.
     * @return {ModelResponse.<JSON> | Observable} - An {@link Observable} stream containing the values in the JSONGraph model after the set was attempted.
     */
    set: operations("set"),
    invalidate: operations("invalidate"),
    // TODO: Document selector function
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
    call: call,
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
    getValue: function(path) {
        return this.get(path, function(x) { return x; });
    },
    setValue: function(path, value) {
        path = pathSyntax.fromPath(path);
        return this.set(Array.isArray(path) ?
        {path: path, value: value} :
            path, function(x) { return x; });
    },
    
    /**
     * Returns a clone of the {@link Model} bound to a location within the {@link JSONGraph}. The bound location is never a {@link Reference}: any {@link Reference}s encountered while resolving the bound {@link Path} are always replaced with the {@link Reference}s target value. For subsequent operations on the {@link Model}, all paths will be evaluated relative to the bound path. Bind allows you to:
     * - Expose only a fragment of the {@link JSONGraph} to components, rather than the entire graph
     * - Hide the location of a {@link JSONGraph} fragment from components
     * - Optimize for executing multiple operations and path looksup at/below the same location in the {@link JSONGraph}
     * @param {Path} boundPath - The path to bind to
     * @param {...PathSet} relativePathsToPreload - Paths to preload before Model is created. These paths are relative to the bound path.
     * @return {Observable.<Model>} - An Observable stream with a single value, the bound {@link Model}, or an empty stream if nothing is found at the path
    */
    bind: bind,

    /**
     * Set the local cache to a {@link JSONGraph} fragment. This method can be a useful way of mocking a remote document, or restoring the local cache from a previously stored state
     * @param {JSONGraph} jsonGraph - The {@link JSONGraph} fragment to use as the local cache
     */
    setCache: function(cache) {
        var size = this._cache && this._cache.$size || 0;
        var lru = this._root;
        var expired = lru.expired;
        this._cache = {};
        collect(lru, expired, -1, size, 0, 0);
        if(Array.isArray(cache.paths) && cache.jsong && typeof cache.jsong === "object") {
            this._setJSONGsAsJSON(this, [cache], []);
        } else {
            this._setCache(this, cache);
        }
        return this;
    },
    /**
     * Get the local {@link JSONGraph} cache. This method can be a useful to store the state of the cache
     * @param {...Array.<PathSet>} [pathSets] - The path(s) to retrieve. If no paths are specified, the entire {@link JSONGraph} is returned
     * @return {JSONGraph} jsonGraph - A {@link JSONGraph} fragment
     * @example
     // Storing the boxshot of the first 10 titles in the first 10 genreLists to local storage.
     localStorage.setItem('cache', JSON.stringify(model.getCache("genreLists[0...10][0...10].boxshot")));
     */
    getCache: function() {
        var paths = slice.call(arguments);
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
    },
    getGeneration: function(path) {
        path = path && pathSyntax.fromPath(path) || [];
        if (Array.isArray(path) === false) {
            throw new Error("Model#getGenerationSync must be called with an Array path.");
        }
        if (this._path.length) {
            path = this._path.concat(path);
        }
        return this._getGeneration(this, path);
    },
    _getGeneration: getGeneration,
    // TODO: Does not throw if given a PathSet rather than a Path, not sure if it should or not.
    // TODO: Doc not accurate? I was able to invoke directly against the Model, perhaps because I don't have a data source?
    // TODO: Not clear on what it means to "retrieve objects in addition to JSONGraph values"
    /**
     * Synchronously retrieves a single path from the local {@link Model} only and will not retrieve missing paths from the {@link DataSource}. This method can only be invoked when the {@link Model} does not have a {@link DataSource} or from within a selector function. See {@link Model.prototype.get}. The getValueSync method differs from the asynchronous get methods (ex. get, getValues) in that it can be used to retrieve objects in addition to JSONGraph values.
     * @arg {Path} path - The path to retrieve
     * @return {*} - The value for the specified path
     */
    getValueSync: function(path) {
        path = pathSyntax.fromPath(path);
        if (Array.isArray(path) === false) {
            throw new Error("Model#getValueSync must be called with an Array path.");
        }
        if (this._path.length) {
            path = this._path.concat(path);
        }
        return this.syncCheck("getValueSync") && this._getValueSync(this, path).value;
    },
    setValueSync: function(path, value, errorSelector) {
        path = pathSyntax.fromPath(path);

        if(Array.isArray(path) === false) {
            if(typeof errorSelector !== "function") {
                errorSelector = value || this._errorSelector;
            }
            value = path.value;
            path  = path.path;
        }

        if(Array.isArray(path) === false) {
            throw new Error("Model#setValueSync must be called with an Array path.");
        }

        if(this.syncCheck("setValueSync")) {

            var json = {};
            var tEeAV = this._treatErrorsAsValues;
            var boxed = this._boxed;

            this._treatErrorsAsValues = true;
            this._boxed = true;

            this._setPathSetsAsJSON(this, [{path: path, value: value}], [json], errorSelector);

            this._treatErrorsAsValues = tEeAV;
            this._boxed = boxed;

            json = json.json;

            if(json && json.$type === ERROR && !this._treatErrorsAsValues) {
                if(this._boxed) {
                    throw json;
                } else {
                    throw json.value;
                }
            } else if(this._boxed) {
                return json;
            }

            return json && json.value;
        }
    },
    // TODO: Document selector function elsewhere and link
    /**
     * Synchronously returns a clone of the {@link Model} bound to a location within the {@link JSONGraph}. The bound location is never a {@link Reference}: any {@link Reference}s encountered while resolving the bound {@link Path} are always replaced with the {@link Reference}s target value. For subsequent operations on the {@link Model}, all paths will be evaluated relative to the bound path. This method can only be invoked when the {@link Model} does not have a {@link DataSource} or from within a selector function. Bind allows you to:
     * - Expose only a fragment of the {@link JSONGraph} to components, rather than the entire graph
     * - Hide the location of a {@link JSONGraph} fragment from components
     * - Optimize for executing multiple operations and path looksup at/below the same location in the {@link JSONGraph}
     * @param {Path} path - The path to bind to
     * @return {Model}
     */
    bindSync: function(path) {
        path = pathSyntax.fromPath(path);
        if(Array.isArray(path) === false) {
            throw new Error("Model#bindSync must be called with an Array path.");
        }
        var boundValue = this.syncCheck("bindSync") && getBoundValue(this, this._path.concat(path));
        var node = boundValue.value;
        path = boundValue.path;
        if(boundValue.shorted) {
            if(Boolean(node)) {
                if(node.$type === ERROR) {
                    if(this._boxed) {
                        throw node;
                    }
                    throw node.value;
                    // throw new Error("Model#bindSync can\'t bind to or beyond an error: " + boundValue.toString());
                }
            }
            return undefined;
        } else if(Boolean(node) && node.$type === ERROR) {
            if(this._boxed) {
                throw node;
            }
            throw node.value;
        }
        return this.clone(["_path", boundValue.path]);
    },
    /**
     * Synchronously returns a clone of the {@link Model} bound to a location within the {@link JSONGraph}. Unlike bind or bindSync, softBind never optimizes its path.  Soft bind is ideal if you want to retrieve the bound path every time, rather than retrieve the optimized path once and then always retrieve paths from that object in the JSON Graph. For example, if you always wanted to retrieve the name from the first item in a list you could softBind to the path "list[0]".
     * @param {Path} path - The path prefix to retrieve every time an operation is executed on a Model.
     * @return {Model}
     */
    softBind: function(path) {
        path = pathSyntax.fromPath(path);
        if(Array.isArray(path) === false) {
            throw new Error("Model#softBind must be called with an Array path.");
        }
        return this.clone(["_path", path]);
    },
    clone: function() {

        var self = this;
        var clone = new Model();

        var key, keyValue;

        var keys = Object.keys(self);
        var keysIdx = -1;
        var keysLen = keys.length;
        while(++keysIdx < keysLen) {
            key = keys[keysIdx];
            clone[key] = self[key];
        }

        var argsIdx = -1;
        var argsLen = arguments.length;
        while(++argsIdx < argsLen) {
            keyValue = arguments[argsIdx];
            clone[keyValue[0]] = keyValue[1];
        }

        return clone;
    },
    // TODO: Should we be clearer this only applies to "get" operations? I'm assuming that is true
    /**
     * Returns a clone of the {@link Model} that eanbles batching. Within the configured time period, paths for operations of the same type are collected and executed on the {@link DataSource} in a batch. Batching can make more efficient use of the {@link DataSource} depending on its implementation, for example, reducing the number of HTTP requests to the server
     * @param {?Scheduler|number} schedulerOrDelay - Either a {@link Scheduler} that determines when to send a batch to the {@link DataSource}, or the number in milliseconds to collect a batch before sending to the {@link DataSource}. If this parameter is omitted, then batch collection ends at the end of the next tick.
     * @return {Model}
     */
    batch: function(schedulerOrDelay) {
        if(typeof schedulerOrDelay === "number") {
            schedulerOrDelay = new TimeoutScheduler(Math.round(Math.abs(schedulerOrDelay)));
        } else if(!schedulerOrDelay || !schedulerOrDelay.schedule) {
            schedulerOrDelay = new ASAPScheduler();
        }
        return this.clone(["_request", new RequestQueue(this, schedulerOrDelay)]);
    },
    /**
     * Returns a clone of the {@link Model} that disables batching. This is the default mode. Each operation will be executed on the {@link DataSource} separately
     * @name unbatch
     * @memberof Model.prototype
     * @function
     * @return {Model} a {@link Model} that batches requests of the same type and sends them to the data source together.
     */
    unbatch: function() {
        return this.clone(["_request", new RequestQueue(this, new ImmediateScheduler())]);
    },
    // TODO: Add example of treatErrorsAsValues
    /**
     * Returns a clone of the {@link Model} that treats errors as values. Errors will be reported in the same callback used to report data. Errors will appear as objects in responses, rather than being sent to the {@link Observable~onErrorCallback} callback of the {@link ModelResponse}.
     * @return {Model}
     */
    treatErrorsAsValues: function() {
        return this.clone(["_treatErrorsAsValues", true]);
    },
    asDataSource: function() {
        return new ModelDataSourceAdapter(this);
    },
    materialize: function() {
        return this.clone(["_materialized", true]);
    },
    /**
     * Returns a clone of the {@link Model} that boxes values returning the wrapper ({@link Atom}, {@link Reference}, or {@link Error}), rather than the value inside it. This allows any metadata attached to the wrapper to be inspected
     * @return {Model}
     */
    boxValues: function() {
        return this.clone(["_boxed", true]);
    },
    /**
     * Returns a clone of the {@link Model} that unboxes values, returning the value inside of the wrapper ({@link Atom}, {@link Reference}, or {@link Error}), rather than the wrapper itself. This is the default mode.
     * @return {Model}
     */
    unboxValues: function() {
        return this.clone(["_boxed", false]);
    },
    /**
     * Returns a clone of the {@link Model} that only uses the local {@link JSONGraph} and never uses a {@link DataSource} to retrieve missing paths
     * @return {Model}
     */
    withoutDataSource: function() {
        return this.clone(["_dataSource", null]);
    },
    withComparator: function(compare) {
        return this.clone(["_comparator", compare]);
    },
    withoutComparator: function(compare) {
        return this.clone(["_comparator", Model.prototype._comparator]);
    },
    syncCheck: function(name) {
        if (Boolean(this._dataSource) && this._root.allowSync <= 0 && this._root.unsafeMode === false) {
            throw new Error("Model#" + name + " may only be called within the context of a request selector.");
        }
        return true;
    },
    toJSON: function() {
        return { $type: "ref", value: this._path };
    }
};
