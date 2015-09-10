var ModelRoot = require("./ModelRoot");
var ModelDataSourceAdapter = require("./ModelDataSourceAdapter");

var RequestQueue = require("./request/RequestQueueRx");
var ModelResponse = require("./response/ModelResponse");
var SetResponse = require("./response/SetResponse");
var CallResponse = require("./response/CallResponse");
var InvalidateResponse = require("./response/InvalidateResponse");

var ASAPScheduler = require("./schedulers/ASAPScheduler");
var TimeoutScheduler = require("./schedulers/TimeoutScheduler");
var ImmediateScheduler = require("./schedulers/ImmediateScheduler");

var arrayClone = require("./support/array-clone");
var arraySlice = require("./support/array-slice");

var collectLru = require("./lru/collect");
var pathSyntax = require("falcor-path-syntax");

var getSize = require("./support/getSize");
var isObject = require("./support/isObject");
var isFunction = require("./support/isFunction");
var isPrimitive = require("./support/isPrimitive");
var isJSONEnvelope = require("./support/isJSONEnvelope");
var isJSONGraphEnvelope = require("./support/isJSONGraphEnvelope");

var setCache = require("./set/setPathMaps");
var setJSONGraphs = require("./set/setJSONGraphs");
var jsong = require("falcor-json-graph");
var ID = 0;
var validateInput = require("./support/validateInput");
var noOp = function() {};
var getCache = require("./get/getCache");
var get = require("./get");
var SET_VALID_INPUT = {
    pathValue: true,
    pathSyntax: true,
    json: true,
    jsonGraph: true
};
var GET_VALID_INPUT = require("./response/get/validInput");

module.exports = Model;

Model.ref = jsong.ref;
Model.atom = jsong.atom;
Model.error = jsong.error;
Model.pathValue = jsong.pathValue;
/**
 * This callback is invoked when the Model's cache is changed.
 * @callback Model~onChange
 */

 /**
 * This function is invoked on every JSONGraph Error retrieved from the DataSource. This function allows Error objects to be transformed before being stored in the Model's cache.
 * @callback Model~errorSelector
 * @param {Object} jsonGraphError - the JSONGraph Error object to transform before it is stored in the Model's cache.
 * @returns {Object} the JSONGraph Error object to store in the Model cache.
 */

 /**
 * This function is invoked every time a value in the Model cache is about to be replaced with a new value. If the function returns true, the existing value is replaced with a new value and the version flag on all of the value's ancestors in the tree are incremented.
 * @callback Model~comparator
 * @param {Object} existingValue - the current value in the Model cache.
 * @param {Object} newValue - the value about to be set into the Model cache.
 * @returns {Boolean} the Boolean value indicating whether the new value and the existing value are equal.
 */

/**
 * A Model object is used to execute commands against a {@link JSONGraph} object. {@link Model}s can work with a local JSONGraph cache, or it can work with a remote {@link JSONGraph} object through a {@link DataSource}.
 * @constructor
 * @param {?Object} options - a set of options to customize behavior
 * @param {?DataSource} options.source - a data source to retrieve and manage the {@link JSONGraph}
 * @param {?JSONGraph} options.cache - initial state of the {@link JSONGraph}
 * @param {?number} options.maxSize - the maximum size of the cache
 * @param {?number} options.collectRatio - the ratio of the maximum size to collect when the maxSize is exceeded
 * @param {?Model~errorSelector} options.errorSelector - a function used to translate errors before they are returned
 * @param {?Model~onChange} options.onChange - a function called whenever the Model's cache is changed
 * @param {?Model~comparator} options.comparator - a function called whenever a value in the Model's cache is about to be replaced with a new value.
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
 * The get method retrieves several {@link Path}s or {@link PathSet}s from a {@link Model}. The get method loads each value into a JSON object and returns in a ModelResponse.
 * @function
 * @param {...PathSet} path - the path(s) to retrieve
 * @return {ModelResponse.<JSONEnvelope>} - the requested data as JSON
 */
Model.prototype.get = require("./response/get");

/**
 * The get method retrieves several {@link Path}s or {@link PathSet}s from a {@link Model}. The get method loads each value into a JSON object and returns in a ModelResponse.
 * @function
 * @private
 * @param {Array.<PathSet>} paths - the path(s) to retrieve
 * @return {ModelResponse.<JSONEnvelope>} - the requested data as JSON
 */
Model.prototype._getWithPaths = require("./response/get/getWithPaths");

/**
 * Sets the value at one or more places in the JSONGraph model. The set method accepts one or more {@link PathValue}s, each of which is a combination of a location in the document and the value to place there.  In addition to accepting  {@link PathValue}s, the set method also returns the values after the set operation is complete.
 * @function
 * @return {ModelResponse.<JSON>} - an {@link Observable} stream containing the values in the JSONGraph model after the set was attempted
 */
Model.prototype.set = function set() {
    var out = validateInput(arguments, SET_VALID_INPUT, "set");
    if (out !== true) {
        return new ModelResponse(function(o) {
            o.onError(out);
        });
    }
    return this._set.apply(this, arguments);
};

/**
 * The preload method retrieves several {@link Path}s or {@link PathSet}s from a {@link Model} and loads them into the Model cache.
 * @function
 * @param {...PathSet} path - the path(s) to retrieve
 * @return {ModelResponse.<Object>} - a ModelResponse that completes when the data has been loaded into the cache.
 */
Model.prototype.preload = function preload() {
    var out = validateInput(arguments, GET_VALID_INPUT, "preload");
    if (out !== true) {
        return new ModelResponse(function(o) {
            o.onError(out);
        });
    }
    var args = Array.prototype.slice.call(arguments);
    var self = this;
    return new ModelResponse(function(obs) {
        return self.get.apply(self, args).subscribe(function() {
        }, function(err) {
            obs.onError(err);
        }, function() {
            obs.onCompleted();
        });
    });
};

Model.prototype._set = function _set() {
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

/**
 * Invokes a function in the JSON Graph.
 * @function
 * @param {Path} functionPath - the path to the function to invoke
 * @param {Array.<Object>} args - the arguments to pass to the function
 * @param {Array.<PathSet>} refPaths - the paths to retrieve from the JSON Graph References in the message returned from the function
 * @param {Array.<PathSet>} thisPaths - the paths to retrieve from function's this object after successful function execution
 * @returns {ModelResponse.<JSONEnvelope> - a JSONEnvelope contains the values returned from the function
 */
Model.prototype.call = function call() {
    var args;
    var argsIdx = -1;
    var argsLen = arguments.length;
    args = new Array(argsLen);
    while (++argsIdx < argsLen) {
        var arg = arguments[argsIdx];
        args[argsIdx] = arg;
        var argType = typeof arg;
        if (argsIdx > 1 && !Array.isArray(arg) ||
            argsIdx === 0 && !Array.isArray(arg) && argType !== "string" ||
            argsIdx === 1 && !Array.isArray(arg) && !isPrimitive(arg)) {
            /* eslint-disable no-loop-func */
            return new ModelResponse(function(o) {
                o.onError(new Error("Invalid argument"));
            });
            /* eslint-enable no-loop-func */
        }
    }

    return CallResponse.create(this, args);
};

/**
 * The invalidate method synchronously removes several {@link Path}s or {@link PathSet}s from a {@link Model} cache.
 * @function
 * @param {...PathSet} path - the  paths to remove from the {@link Model}'s cache.
 */
Model.prototype.invalidate = function invalidate() {
    var args;
    var argsIdx = -1;
    var argsLen = arguments.length;
    var selector = arguments[argsLen - 1];
    args = new Array(argsLen);
    while (++argsIdx < argsLen) {
        args[argsIdx] = pathSyntax.fromPath(arguments[argsIdx]);
        if (typeof args[argsIdx] !== "object") {
            throw new Error("Invalid argument");
        }
    }

    // creates the obs, subscribes and will throw the errors if encountered.
    InvalidateResponse.
        create(this, args, selector).
        subscribe(noOp, function(e) {
            throw e;
        });
};

/**
 * Returns a new {@link Model} bound to a location within the {@link JSONGraph}. The bound location is never a {@link Reference}: any {@link Reference}s encountered while resolving the bound {@link Path} are always replaced with the {@link Reference}s target value. For subsequent operations on the {@link Model}, all paths will be evaluated relative to the bound path. Deref allows you to:
 * - Expose only a fragment of the {@link JSONGraph} to components, rather than the entire graph
 * - Hide the location of a {@link JSONGraph} fragment from components
 * - Optimize for executing multiple operations and path looksup at/below the same location in the {@link JSONGraph}
 * @method
 * @param {Path} derefPath - the path to the object that the new Model should refer to
 * @param {...PathSet} relativePathsToPreload - paths (relative to the dereference path) to preload before Model is created
 * @return {Observable.<Model>} - an Observable stream with a single value, the dereferenced {@link Model}, or an empty stream if nothing is found at the path
 * @example
var model = new falcor.Model({
  cache: {
    users: [
      { $type: "ref", value: ["usersById", 32] }
    ],
    usersById: {
      32: {
	name: "Steve",
        surname: "McGuire"
      }
    }
  }
});
model.deref(["users", 0], "name").subscribe(function(userModel){
  console.log(userModel.getPath());
});

// prints ["usersById", 32] because userModel refers to target of reference at ["users", 0]
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
Model.prototype.getValue = require("./get/getValue");

/**
 * Set value for a single {@link Path}.
 * @param {Path} path - the path to set
 * @param {Object} value - the value to set
 * @return {Observable.<*>} - the value for the path
 * @example
 var model = new falcor.Model({source: new falcor.HttpDataSource("/model.json") });

 model.
     setValue('user.name', 'Jim').
     subscribe(function(name) {
         console.log(name);
     });

 // The code above prints "Jim" to the console.
 */
Model.prototype.setValue = require("./set/setValue");

// TODO: Does not throw if given a PathSet rather than a Path, not sure if it should or not.
// TODO: Doc not accurate? I was able to invoke directly against the Model, perhaps because I don't have a data source?
// TODO: Not clear on what it means to "retrieve objects in addition to JSONGraph values"
/**
 * Synchronously retrieves a single path from the local {@link Model} only and will not retrieve missing paths from the {@link DataSource}. This method can only be invoked when the {@link Model} does not have a {@link DataSource} or from within a selector function. See {@link Model.prototype.get}. The getValueSync method differs from the asynchronous get methods (ex. get, getValues) in that it can be used to retrieve objects in addition to JSONGraph values.
 * @method
 * @private
 * @arg {Path} path - the path to retrieve
 * @return {*} - the value for the specified path
 */
Model.prototype._getValueSync = require("./get/sync");

Model.prototype._setValueSync = require("./set/sync");

Model.prototype._derefSync = require("./deref/sync");

/**
 * Set the local cache to a {@link JSONGraph} fragment. This method can be a useful way of mocking a remote document, or restoring the local cache from a previously stored state.
 * @param {JSONGraph} jsonGraph - the {@link JSONGraph} fragment to use as the local cache
 */
Model.prototype.setCache = function modelSetCache(cacheOrJSONGraphEnvelope) {
    var cache = this._root.cache;
    if (cacheOrJSONGraphEnvelope !== cache) {
        var modelRoot = this._root;
        var boundPath = this._path;
        this._path = [];
        this._root.cache = {};
        if (typeof cache !== "undefined") {
            collectLru(modelRoot, modelRoot.expired, getSize(cache), 0);
        }
        if (isJSONGraphEnvelope(cacheOrJSONGraphEnvelope)) {
            setJSONGraphs(this, [cacheOrJSONGraphEnvelope]);
        } else if (isJSONEnvelope(cacheOrJSONGraphEnvelope)) {
            setCache(this, [cacheOrJSONGraphEnvelope]);
        } else if (isObject(cacheOrJSONGraphEnvelope)) {
            setCache(this, [{ json: cacheOrJSONGraphEnvelope }]);
        }
        this._path = boundPath;
    } else if (typeof cache === "undefined") {
        this._root.cache = {};
    }
    return this;
};

/**
 * Get the local {@link JSONGraph} cache. This method can be a useful to store the state of the cache.
 * @param {...Array.<PathSet>} [pathSets] - The path(s) to retrieve. If no paths are specified, the entire {@link JSONGraph} is returned.
 * @return {JSONGraph} all of the {@link JSONGraph} data in the {@link Model} cache.
 * @example
 // Storing the boxshot of the first 10 titles in the first 10 genreLists to local storage.
 localStorage.setItem('cache', JSON.stringify(model.getCache("genreLists[0...10][0...10].boxshot")));
 */
Model.prototype.getCache = function _getCache() {
    var paths = arraySlice(arguments);
    if (paths.length === 0) {
        return getCache(this._root.cache);
    }

    var result = [{}];
    var path = this._path;
    get.getWithPathsAsJSONGraph(this, paths, result);
    this._path = path;
    return result[0].jsonGraph;
};

/**
 * Retrieves a number which is incremented every single time a value is changed underneath the Model or the object at an optionally-provided Path beneath the Model.
 * @param {Path?} path - a path at which to retrieve the version number
 * @return {Number} a version number which changes whenever a value is changed underneath the Model or provided Path
 */
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

Model.prototype._syncCheck = function syncCheck(name) {
    if (Boolean(this._source) && this._root.syncRefCount <= 0 && this._root.unsafeMode === false) {
        throw new Error("Model#" + name + " may only be called within the context of a request selector.");
    }
    return true;
};

/* eslint-disable guard-for-in */
Model.prototype._clone = function cloneModel(opts) {
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

/**
 * Returns a clone of the {@link Model} that enables batching. Within the configured time period, paths for get operations are collected and sent to the {@link DataSource} in a batch. Batching can be more efficient if the {@link DataSource} access the network, potentially reducing the number of HTTP requests to the server.
 * @param {?Scheduler|number} schedulerOrDelay - Either a {@link Scheduler} that determines when to send a batch to the {@link DataSource}, or the number in milliseconds to collect a batch before sending to the {@link DataSource}. If this parameter is omitted, then batch collection ends at the end of the next tick.
 * @return {Model} a Model which schedules a batch of get requests to the DataSource.
 */
Model.prototype.batch = function batch(schedulerOrDelayArg) {
    var schedulerOrDelay = schedulerOrDelayArg;
    if (typeof schedulerOrDelay === "number") {
        schedulerOrDelay = new TimeoutScheduler(Math.round(Math.abs(schedulerOrDelay)));
    } else if (!schedulerOrDelay || !schedulerOrDelay.schedule) {
        schedulerOrDelay = new ASAPScheduler();
    }
    var clone = this._clone();
    clone._request = new RequestQueue(clone, schedulerOrDelay);

    return clone;
};

/**
 * Returns a clone of the {@link Model} that disables batching. This is the default mode. Each get operation will be executed on the {@link DataSource} separately.
 * @name unbatch
 * @memberof Model.prototype
 * @function
 * @return {Model} a {@link Model} that batches requests of the same type and sends them to the data source together
 */
Model.prototype.unbatch = function unbatch() {
    var clone = this._clone();
    clone._request = new RequestQueue(clone, new ImmediateScheduler());
    return clone;
};

/**
 * Returns a clone of the {@link Model} that treats errors as values. Errors will be reported in the same callback used to report data. Errors will appear as objects in responses, rather than being sent to the {@link Observable~onErrorCallback} callback of the {@link ModelResponse}.
 * @return {Model}
 */
Model.prototype.treatErrorsAsValues = function treatErrorsAsValues() {
    return this._clone({
        _treatErrorsAsValues: true
    });
};

/**
 * Adapts a Model to the {@link DataSource} interface.
 * @return {DataSource}
 * @example
var model =
    new falcor.Model({
        cache: {
            user: {
                name: "Steve",
                surname: "McGuire"
            }
        }
    }),
    proxyModel = new falcor.Model({ source: model.asDataSource() });

// Prints "Steve"
proxyModel.getValue("user.name").
    then(function(name) {
        console.log(name);
    });
 */
Model.prototype.asDataSource = function asDataSource() {
    return new ModelDataSourceAdapter(this);
};

Model.prototype._materialize = function materialize() {
    return this._clone({
        _materialized: true
    });
};

Model.prototype._dematerialize = function dematerialize() {
    return this._clone({
        _materialized: "delete"
    });
};

/**
 * Returns a clone of the {@link Model} that boxes values returning the wrapper ({@link Atom}, {@link Reference}, or {@link Error}), rather than the value inside it. This allows any metadata attached to the wrapper to be inspected.
 * @return {Model}
 */
Model.prototype.boxValues = function boxValues() {
    return this._clone({
        _boxed: true
    });
};

/**
 * Returns a clone of the {@link Model} that unboxes values, returning the value inside of the wrapper ({@link Atom}, {@link Reference}, or {@link Error}), rather than the wrapper itself. This is the default mode.
 * @return {Model}
 */
Model.prototype.unboxValues = function unboxValues() {
    return this._clone({
        _boxed: "delete"
    });
};

/**
 * Returns a clone of the {@link Model} that only uses the local {@link JSONGraph} and never uses a {@link DataSource} to retrieve missing paths.
 * @return {Model}
 */
Model.prototype.withoutDataSource = function withoutDataSource() {
    return this._clone({
        _source: "delete"
    });
};

Model.prototype.toJSON = function toJSON() {
    return {
        $type: "ref",
        value: this._path
    };
};

/**
 * Returns the {@link Path} to the object within the JSON Graph that this Model references.
 * @return {Path}
 * @example
var model = new falcor.Model({
  cache: {
    users: [
      { $type: "ref", value: ["usersById", 32] }
    ],
    usersById: {
      32: {
	name: "Steve",
        surname: "McGuire"
      }
    }
  }
});
model.deref(["users", 0], "name").subscribe(function(userModel){
  console.log(userModel.getPath());
});

// prints ["usersById", 32] because userModel refers to target of reference at ["users", 0]
 */
Model.prototype.getPath = function getPath() {
    return arrayClone(this._path);
};

Model.prototype._getBoundValue = require("./get/getBoundValue");
Model.prototype._getVersion = require("./get/getVersion");
Model.prototype._getValueSync = require("./get/getValueSync");

Model.prototype._getPathValuesAsPathMap = get.getWithPathsAsPathMap;
Model.prototype._getPathValuesAsJSONG = get.getWithPathsAsJSONGraph;

Model.prototype._setPathValuesAsJSON = require("./set/setPathValues");
Model.prototype._setPathValuesAsJSONG = require("./set/setPathValues");
Model.prototype._setPathValuesAsPathMap = require("./set/setPathValues");
Model.prototype._setPathValuesAsValues = require("./set/setPathValues");

Model.prototype._setPathMapsAsJSON = require("./set/setPathMaps");
Model.prototype._setPathMapsAsJSONG = require("./set/setPathMaps");
Model.prototype._setPathMapsAsPathMap = require("./set/setPathMaps");
Model.prototype._setPathMapsAsValues = require("./set/setPathMaps");

Model.prototype._setJSONGsAsJSON = require("./set/setJSONGraphs");
Model.prototype._setJSONGsAsJSONG = require("./set/setJSONGraphs");
Model.prototype._setJSONGsAsPathMap = require("./set/setJSONGraphs");
Model.prototype._setJSONGsAsValues = require("./set/setJSONGraphs");

Model.prototype._setCache = require("./set/setPathMaps");

Model.prototype._invalidatePathValuesAsJSON = require("./invalidate/invalidatePathSets");
Model.prototype._invalidatePathMapsAsJSON = require("./invalidate/invalidatePathMaps");
