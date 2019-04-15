/*!
 * Copyright 2015 Netflix, Inc
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
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.falcor = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var falcor = require(34);
var jsong = require(128);

falcor.atom = jsong.atom;
falcor.ref = jsong.ref;
falcor.error = jsong.error;
falcor.pathValue = jsong.pathValue;

falcor.HttpDataSource = require(123);

module.exports = falcor;

},{"123":123,"128":128,"34":34}],2:[function(require,module,exports){
var ModelRoot = require(4);
var ModelDataSourceAdapter = require(3);

var RequestQueue = require(44);
var ModelResponse = require(52);
var CallResponse = require(50);
var InvalidateResponse = require(51);

var ASAPScheduler = require(65);
var TimeoutScheduler = require(67);
var ImmediateScheduler = require(66);

var arrayClone = require(73);
var arraySlice = require(77);

var collectLru = require(40);
var pathSyntax = require(132);

var getSize = require(83);
var isObject = require(95);
var isPrimitive = require(97);
var isJSONEnvelope = require(93);
var isJSONGraphEnvelope = require(94);

var setCache = require(69);
var setJSONGraphs = require(68);
var jsong = require(128);
var ID = 0;
var validateInput = require(111);
var noOp = function() {};
var getCache = require(18);
var get = require(23);
var GET_VALID_INPUT = require(59);

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
 * @param {?number} options.maxSize - the maximum size of the cache. This value roughly correlates to item count (where itemCount = maxSize / 50). Each item by default is given a metadata `$size` of 50 (or its length when it's an array or string). You can get better control of falcor's memory usage by tweaking `$size`
 * @param {?number} options.maxRetries - the maximum number of times that the Model will attempt to retrieve the value from the server.
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

    if (typeof options.maxRetries === "number") {
        this._maxRetries = options.maxRetries;
    } else {
        this._maxRetries = options._maxRetries || Model.prototype._maxRetries;
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

    this._useServerPaths = options._useServerPaths || false;

    this._allowFromWhenceYouCame = options.allowFromWhenceYouCame ||
        options._allowFromWhenceYouCame || false;

    this._treatDataSourceErrorsAsJSONGraphErrors = options._treatDataSourceErrorsAsJSONGraphErrors || false;

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
Model.prototype._maxRetries = 3;
Model.prototype._collectRatio = 0.75;

/**
 * The get method retrieves several {@link Path}s or {@link PathSet}s from a {@link Model}. The get method loads each value into a JSON object and returns in a ModelResponse.
 * @function
 * @param {...PathSet} path - the path(s) to retrieve
 * @return {ModelResponse.<JSONEnvelope>} - the requested data as JSON
 */
Model.prototype.get = require(58);

/**
 * _getOptimizedBoundPath is an extension point for internal users to polyfill
 * legacy soft-bind behavior, as opposed to deref (hardBind). Current falcor
 * only supports deref, and assumes _path to be a fully optimized path.
 * @function
 * @private
 * @return {Path} - fully optimized bound path for the model
 */
Model.prototype._getOptimizedBoundPath = function _getOptimizedBoundPath() {
    return arrayClone(this._path);
};

/**
 * The get method retrieves several {@link Path}s or {@link PathSet}s from a {@link Model}. The get method loads each value into a JSON object and returns in a ModelResponse.
 * @function
 * @private
 * @param {Array.<PathSet>} paths - the path(s) to retrieve
 * @return {ModelResponse.<JSONEnvelope>} - the requested data as JSON
 */
Model.prototype._getWithPaths = require(57);

/**
 * Sets the value at one or more places in the JSONGraph model. The set method accepts one or more {@link PathValue}s, each of which is a combination of a location in the document and the value to place there.  In addition to accepting  {@link PathValue}s, the set method also returns the values after the set operation is complete.
 * @function
 * @return {ModelResponse.<JSONEnvelope>} - an {@link Observable} stream containing the values in the JSONGraph model after the set was attempted
 */
Model.prototype.set = require(61);

/**
 * The preload method retrieves several {@link Path}s or {@link PathSet}s from a {@link Model} and loads them into the Model cache.
 * @function
 * @param {...PathSet} path - the path(s) to retrieve
 * @return {ModelResponse.<JSONEnvelope>} - a ModelResponse that completes when the data has been loaded into the cache.
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

/**
 * Invokes a function in the JSON Graph.
 * @function
 * @param {Path} functionPath - the path to the function to invoke
 * @param {Array.<Object>} args - the arguments to pass to the function
 * @param {Array.<PathSet>} refPaths - the paths to retrieve from the JSON Graph References in the message returned from the function
 * @param {Array.<PathSet>} thisPaths - the paths to retrieve from function's this object after successful function execution
 * @return {ModelResponse.<JSONEnvelope> - a JSONEnvelope contains the values returned from the function
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

    return new CallResponse(this, args[0], args[1], args[2], args[3]);
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
    args = [];
    while (++argsIdx < argsLen) {
        args[argsIdx] = pathSyntax.fromPath(arguments[argsIdx]);
        if (!Array.isArray(args[argsIdx]) || !args[argsIdx].length) {
            throw new Error("Invalid argument");
        }
    }

    // creates the obs, subscribes and will throw the errors if encountered.
    (new InvalidateResponse(this, args)).
        subscribe(noOp, function(e) {
            throw e;
        });
};

/**
 * Returns a new {@link Model} bound to a location within the {@link
 * JSONGraph}. The bound location is never a {@link Reference}: any {@link
 * Reference}s encountered while resolving the bound {@link Path} are always
 * replaced with the {@link Reference}s target value. For subsequent operations
 * on the {@link Model}, all paths will be evaluated relative to the bound
 * path. Deref allows you to:
 * - Expose only a fragment of the {@link JSONGraph} to components, rather than
 *   the entire graph
 * - Hide the location of a {@link JSONGraph} fragment from components
 * - Optimize for executing multiple operations and path looksup at/below the
 *   same location in the {@link JSONGraph}
 * @method
 * @param {Object} responseObject - an object previously retrieved from the
 * Model
 * @return {Model} - the dereferenced {@link Model}
 * @example
var Model = falcor.Model;
var model = new Model({
  cache: {
    users: [
      Model.ref(["usersById", 32])
    ],
    usersById: {
      32: {
        name: "Steve",
        surname: "McGuire"
      }
    }
  }
});

model.
    get(['users', 0, 'name']).
    subscribe(function(jsonEnv) {
        var userModel = model.deref(jsonEnv.json.users[0]);
        console.log(model.getPath());
        console.log(userModel.getPath());
   });
});

// prints the following:
// []
// ["usersById", 32] - because userModel refers to target of reference at ["users", 0]
 */
Model.prototype.deref = require(6);

/**
 * A dereferenced model can become invalid when the reference from which it was
 * built has been removed/collected/expired/etc etc.  To fix the issue, a from
 * the parent request should be made (no parent, then from the root) for a valid
 * path and re-dereference performed to update what the model is bound too.
 *
 * @method
 * @private
 * @return {Boolean} - If the currently deref'd model is still considered a
 * valid deref.
 */
Model.prototype._hasValidParentReference = require(5);

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
Model.prototype.getValue = require(20);

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
Model.prototype.setValue = require(71);

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
Model.prototype._getValueSync = require(28);

/**
 * @private
 */
Model.prototype._setValueSync = require(72);

/**
 * @private
 */
Model.prototype._derefSync = require(7);

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
        var out;
        if (isJSONGraphEnvelope(cacheOrJSONGraphEnvelope)) {
            out = setJSONGraphs(this, [cacheOrJSONGraphEnvelope])[0];
        } else if (isJSONEnvelope(cacheOrJSONGraphEnvelope)) {
            out = setCache(this, [cacheOrJSONGraphEnvelope])[0];
        } else if (isObject(cacheOrJSONGraphEnvelope)) {
            out = setCache(this, [{ json: cacheOrJSONGraphEnvelope }])[0];
        }

        // performs promotion without producing output.
        if (out) {
            get.getWithPathsAsPathMap(this, out, []);
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
 * Reset cache maxSize. When the new maxSize is smaller than the old force a collect.
 * @param {Number} maxSize - the new maximum cache size
 */
Model.prototype._setMaxSize = function setMaxSize(maxSize) {
    var oldMaxSize = this._maxSize;
    this._maxSize = maxSize;
    if (maxSize < oldMaxSize) {
        var modelRoot = this._root;
        var modelCache = modelRoot.cache;
        // eslint-disable-next-line no-cond-assign
        var currentVersion = modelCache.$_version;
        collectLru(modelRoot, modelRoot.expired, getSize(modelCache),
                this._maxSize, this._collectRatio, currentVersion);
    }
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
    var clone = new this.constructor(this);
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
var Model = falcor.Model;
var model = new Model({
  cache: {
    users: [
      Model.ref(["usersById", 32])
    ],
    usersById: {
      32: {
        name: "Steve",
        surname: "McGuire"
      }
    }
  }
});

model.
    get(['users', 0, 'name']).
    subscribe(function(jsonEnv) {
        var userModel = model.deref(jsonEnv.json.users[0]);
        console.log(model.getPath());
        console.log(userModel.getPath());
   });
});

// prints the following:
// []
// ["usersById", 32] - because userModel refers to target of reference at ["users", 0]
 */
Model.prototype.getPath = function getPath() {
    return arrayClone(this._path);
};

/**
 * This one is actually private.  I would not use this without talking to
 * jhusain, sdesai, or michaelbpaulson (github).
 * @private
 */
Model.prototype._fromWhenceYouCame = function fromWhenceYouCame(allow) {
    return this._clone({
        _allowFromWhenceYouCame: allow === undefined ? true : allow
    });
};

Model.prototype._getBoundValue = require(17);
Model.prototype._getVersion = require(22);

Model.prototype._getPathValuesAsPathMap = get.getWithPathsAsPathMap;
Model.prototype._getPathValuesAsJSONG = get.getWithPathsAsJSONGraph;

Model.prototype._setPathValues = require(70);
Model.prototype._setPathMaps = require(69);
Model.prototype._setJSONGs = require(68);
Model.prototype._setCache = require(69);

Model.prototype._invalidatePathValues = require(39);
Model.prototype._invalidatePathMaps = require(38);

},{"111":111,"128":128,"132":132,"17":17,"18":18,"20":20,"22":22,"23":23,"28":28,"3":3,"38":38,"39":39,"4":4,"40":40,"44":44,"5":5,"50":50,"51":51,"52":52,"57":57,"58":58,"59":59,"6":6,"61":61,"65":65,"66":66,"67":67,"68":68,"69":69,"7":7,"70":70,"71":71,"72":72,"73":73,"77":77,"83":83,"93":93,"94":94,"95":95,"97":97}],3:[function(require,module,exports){
function ModelDataSourceAdapter(model) {
    this._model = model._materialize().treatErrorsAsValues();
}

ModelDataSourceAdapter.prototype.get = function get(pathSets) {
    return this._model.get.apply(this._model, pathSets)._toJSONG();
};

ModelDataSourceAdapter.prototype.set = function set(jsongResponse) {
    return this._model.set(jsongResponse)._toJSONG();
};

ModelDataSourceAdapter.prototype.call = function call(path, args, suffixes, paths) {
    var params = [path, args, suffixes].concat(paths);
    return this._model.call.apply(this._model, params)._toJSONG();
};

module.exports = ModelDataSourceAdapter;

},{}],4:[function(require,module,exports){
var isFunction = require(91);
var hasOwn = require(86);
var ImmediateScheduler = require(66);

function ModelRoot(o) {

    var options = o || {};

    this.syncRefCount = 0;
    this.expired = options.expired || [];
    this.unsafeMode = options.unsafeMode || false;
    this.collectionScheduler = options.collectionScheduler || new ImmediateScheduler();
    this.cache = {};

    if (isFunction(options.comparator)) {
        this.comparator = options.comparator;
    }

    if (isFunction(options.errorSelector)) {
        this.errorSelector = options.errorSelector;
    }

    if (isFunction(options.onChange)) {
        this.onChange = options.onChange;
    }
}

ModelRoot.prototype.errorSelector = function errorSelector(x, y) {
    return y;
};
ModelRoot.prototype.comparator = function comparator(cacheNode, messageNode) {
    if (hasOwn(cacheNode, "value") && hasOwn(messageNode, "value")) {
        // They are the same only if the following fields are the same.
        return cacheNode.value === messageNode.value &&
            cacheNode.$type === messageNode.$type &&
            cacheNode.$expires === messageNode.$expires;
    }
    return cacheNode === messageNode;
};

module.exports = ModelRoot;

},{"66":66,"86":86,"91":91}],5:[function(require,module,exports){
module.exports = function fromWhenceYeCame() {
    var reference = this._referenceContainer;

    // Always true when this mode is false.
    if (!this._allowFromWhenceYouCame) {
        return true;
    }

    // If fromWhenceYouCame is true and the first set of keys did not have
    // a reference, this case can happen.  They are always valid.
    if (reference === true) {
        return true;
    }

    // was invalid before even derefing.
    if (reference === false) {
        return false;
    }

    // Its been disconnected (set over or collected) from the graph.
    // eslint-disable-next-line camelcase
    if (reference && reference.$_parent === undefined) {
        return false;
    }

    // The reference has expired but has not been collected from the graph.
    // eslint-disable-next-line camelcase
    if (reference && reference.$_invalidated) {
        return false;
    }

    return true;
};

},{}],6:[function(require,module,exports){
var InvalidDerefInputError = require(9);
var getCachePosition = require(19);
var CONTAINER_DOES_NOT_EXIST = "e";
var $ref = require(116);

module.exports = function deref(boundJSONArg) {

    var absolutePath = boundJSONArg && boundJSONArg.$__path;
    var refPath = boundJSONArg && boundJSONArg.$__refPath;
    var toReference = boundJSONArg && boundJSONArg.$__toReference;
    var referenceContainer;

    // We deref and then ensure that the reference container is attached to
    // the model.
    if (absolutePath) {
        var validContainer = CONTAINER_DOES_NOT_EXIST;

        if (toReference) {
            validContainer = false;
            referenceContainer = getCachePosition(this, toReference);

            // If the reference container is still a sentinel value then compare
            // the reference value with refPath.  If they are the same, then the
            // model is still valid.
            if (refPath && referenceContainer &&
                referenceContainer.$type === $ref) {

                var containerPath = referenceContainer.value;
                var i = 0;
                var len = refPath.length;

                validContainer = true;
                for (; validContainer && i < len; ++i) {
                    if (containerPath[i] !== refPath[i]) {
                        validContainer = false;
                    }
                }
            }
        }

        // Signal to the deref'd model that it has been disconnected from the
        // graph or there is no _fromWhenceYouCame
        if (!validContainer) {
            referenceContainer = false;
        }

        // The container did not exist, therefore there is no reference
        // container and fromWhenceYouCame should always return true.
        else if (validContainer === CONTAINER_DOES_NOT_EXIST) {
            referenceContainer = true;
        }

        return this._clone({
            _path: absolutePath,
            _referenceContainer: referenceContainer
        });
    }

    throw new InvalidDerefInputError();
};

},{"116":116,"19":19,"9":9}],7:[function(require,module,exports){
var pathSyntax = require(132);
var getBoundValue = require(17);
var InvalidModelError = require(10);

module.exports = function derefSync(boundPathArg) {

    var boundPath = pathSyntax.fromPath(boundPathArg);

    if (!Array.isArray(boundPath)) {
        throw new Error("Model#derefSync must be called with an Array path.");
    }

    var boundValue = getBoundValue(this, this._path.concat(boundPath), false);

    var path = boundValue.path;
    var node = boundValue.value;
    var found = boundValue.found;

    // If the node is not found or the node is found but undefined is returned,
    // this happens when a reference is expired.
    if (!found || node === undefined) {
        return undefined;
    }

    if (node.$type) {
        throw new InvalidModelError(path, path);
    }

    return this._clone({ _path: path });
};

},{"10":10,"132":132,"17":17}],8:[function(require,module,exports){
var applyErrorPrototype = require(14);

/**
 * When a bound model attempts to retrieve JSONGraph it should throw an
 * error.
 *
 * @private
 */
function BoundJSONGraphModelError() {
    var instance = new Error("It is not legal to use the JSON Graph " +
    "format from a bound Model. JSON Graph format" +
    " can only be used from a root model.");

    instance.name = "BoundJSONGraphModelError";

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    }

    if (Error.captureStackTrace) {
        Error.captureStackTrace(instance, BoundJSONGraphModelError);
    }

    return instance;
}

applyErrorPrototype(BoundJSONGraphModelError);

module.exports = BoundJSONGraphModelError;

},{"14":14}],9:[function(require,module,exports){
var applyErrorPrototype = require(14);

/**
 * An invalid deref input is when deref is used with input that is not generated
 * from a get, set, or a call.
 *
 * @private
 */
function InvalidDerefInputError() {
    var instance = new Error("Deref can only be used with a non-primitive object from get, set, or call.");

    instance.name = "InvalidDerefInputError";

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    }

    if (Error.captureStackTrace) {
        Error.captureStackTrace(instance, InvalidDerefInputError);
    }

    return instance;
}

applyErrorPrototype(InvalidDerefInputError);

module.exports = InvalidDerefInputError;

},{"14":14}],10:[function(require,module,exports){
var applyErrorPrototype = require(14);

/**
 * An InvalidModelError can only happen when a user binds, whether sync
 * or async to shorted value.  See the unit tests for examples.
 *
 * @param {*} boundPath
 * @param {*} shortedPath
 *
 * @private
 */
function InvalidModelError(boundPath, shortedPath) {
    var instance = new Error("The boundPath of the model is not valid since a value or error was found before the path end.");

    instance.name = "InvalidModelError";
    instance.boundPath = boundPath;
    instance.shortedPath = shortedPath;

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    }

    if (Error.captureStackTrace) {
        Error.captureStackTrace(instance, InvalidModelError);
    }

    return instance;
}

applyErrorPrototype(InvalidModelError);

module.exports = InvalidModelError;

},{"14":14}],11:[function(require,module,exports){
var applyErrorPrototype = require(14);

/**
 * InvalidSourceError happens when a dataSource syncronously throws
 * an exception during a get/set/call operation.
 *
 * @param {Error} error - The error that was thrown.
 *
 * @private
 */
function InvalidSourceError(error) {
    var instance = new Error("An exception was thrown when making a request.");

    instance.name = "InvalidSourceError";
    instance.innerError = error;

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    }

    if (Error.captureStackTrace) {
        Error.captureStackTrace(instance, InvalidSourceError);
    }

    return instance;
}

applyErrorPrototype(InvalidSourceError);

module.exports = InvalidSourceError;

},{"14":14}],12:[function(require,module,exports){
var applyErrorPrototype = require(14);

/**
 * A request can only be retried up to a specified limit.  Once that
 * limit is exceeded, then an error will be thrown.
 *
 * @param {*} missingOptimizedPaths
 *
 * @private
 */
function MaxRetryExceededError(missingOptimizedPaths) {
    var instance = new Error("The allowed number of retries have been exceeded.");

    instance.name = "MaxRetryExceededError";
    instance.missingOptimizedPaths = missingOptimizedPaths || [];

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    }

    if (Error.captureStackTrace) {
        Error.captureStackTrace(instance, MaxRetryExceededError);
    }

    return instance;
}

applyErrorPrototype(MaxRetryExceededError);

MaxRetryExceededError.is = function(e) {
    return e && e.name === "MaxRetryExceededError";
};

module.exports = MaxRetryExceededError;

},{"14":14}],13:[function(require,module,exports){
var applyErrorPrototype = require(14);

/**
 * Does not allow null in path
 *
 * @private
 */
function NullInPathError() {
    var instance = new Error("`null` and `undefined` are not allowed in branch key positions");

    instance.name = "NullInPathError";

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    }

    if (Error.captureStackTrace) {
        Error.captureStackTrace(instance, NullInPathError);
    }

    return instance;
}

applyErrorPrototype(NullInPathError);

module.exports = NullInPathError;

},{"14":14}],14:[function(require,module,exports){
function applyErrorPrototype(errorType) {
    errorType.prototype = Object.create(Error.prototype, {
        constructor: {
        value: Error,
        enumerable: false,
        writable: true,
        configurable: true
        }
    });

    if (Object.setPrototypeOf) {
        Object.setPrototypeOf(errorType, Error);
    } else {
        // eslint-disable-next-line
        errorType.__proto__ = Error;
    }
}

module.exports = applyErrorPrototype;

},{}],15:[function(require,module,exports){
var createHardlink = require(79);
var onValue = require(26);
var isExpired = require(30);
var $ref = require(116);
var promote = require(41);

/* eslint-disable no-constant-condition */
function followReference(model, root, nodeArg, referenceContainerArg,
                         referenceArg, seed, isJSONG) {

    var node = nodeArg;
    var reference = referenceArg;
    var referenceContainer = referenceContainerArg;
    var depth = 0;
    var k, next;

    while (true) {
        if (depth === 0 && referenceContainer.$_context) {
            depth = reference.length;
            next = referenceContainer.$_context;
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

                if (!referenceContainer.$_context) {
                    createHardlink(referenceContainer, next);
                }

                // Restart the reference follower.
                if (type === $ref) {

                    // Nulls out the depth, outerResults,
                    if (isJSONG) {
                        onValue(model, next, seed, null, null, null, null,
                                reference, reference.length, isJSONG);
                    } else {
                        promote(model._root, next);
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
            node = void 0;
        }
        break;
    }


    if (depth < reference.length && node !== void 0) {
        var ref = [];
        for (var i = 0; i < depth; i++) {
            ref[i] = reference[i];
        }
        reference = ref;
    }

    return [node, reference, referenceContainer];
}
/* eslint-enable */

module.exports = followReference;

},{"116":116,"26":26,"30":30,"41":41,"79":79}],16:[function(require,module,exports){
var getCachePosition = require(19);
var InvalidModelError = require(10);
var BoundJSONGraphModelError = require(8);

function mergeInto(target, obj) {
    /* eslint guard-for-in: 0 */
    if (target === obj) {
        return;
    }
    if (target === null || typeof target !== "object" || target.$type) {
        return;
    }
    if (obj === null || typeof obj !== "object" || obj.$type) {
        return;
    }

    for (var key in obj) {
        // When merging over a temporary branch structure (for example, as produced by an error selector)
        // with references, we don't want to mutate the path, particularly because it's also $_absolutePath
        // on cache nodes
        if (key === "$__path") {
            continue;
        }

        var targetValue = target[key];
        if (targetValue === undefined) {
            target[key] = obj[key];
        } else {
            mergeInto(targetValue, obj[key]);
        }
    }
}

function defaultEnvelope(isJSONG) {
    return isJSONG ? {jsonGraph: {}, paths: []} : {json: {}};
}

module.exports = function get(walk, isJSONG) {
    return function innerGet(model, paths, seed) {
        // Result valueNode not immutable for isJSONG.
        var nextSeed = isJSONG ? seed : [{}];
        var valueNode = nextSeed[0];
        var results = {
            values: nextSeed,
            optimizedPaths: []
        };
        var cache = model._root.cache;
        var boundPath = model._path;
        var currentCachePosition = cache;
        var optimizedPath, optimizedLength;
        var i, len;
        var requestedPath = [];
        var derefInfo = [];
        var referenceContainer;

        // If the model is bound, then get that cache position.
        if (boundPath.length) {

            // JSONGraph output cannot ever be bound or else it will
            // throw an error.
            if (isJSONG) {
                return {
                    criticalError: new BoundJSONGraphModelError()
                };
            }

            // using _getOptimizedPath because that's a point of extension
            // for polyfilling legacy falcor
            optimizedPath = model._getOptimizedBoundPath();
            optimizedLength = optimizedPath.length;

            // We need to get the new cache position path.
            currentCachePosition = getCachePosition(model, optimizedPath);

            // If there was a short, then we 'throw an error' to the outside
            // calling function which will onError the observer.
            if (currentCachePosition && currentCachePosition.$type) {
                return {
                    criticalError: new InvalidModelError(boundPath, optimizedPath)
                };
            }

            referenceContainer = model._referenceContainer;
        }

        // Update the optimized path if we
        else {
            optimizedPath = [];
            optimizedLength = 0;
        }

        for (i = 0, len = paths.length; i < len; i++) {
            walk(model, cache, currentCachePosition, paths[i], 0,
                 valueNode, results, derefInfo, requestedPath, optimizedPath,
                 optimizedLength, isJSONG, false, referenceContainer);
        }

        // Merge in existing results.
        // Default to empty envelope if no results were emitted
        mergeInto(valueNode, paths.length ? seed[0] : defaultEnvelope(isJSONG));

        return results;
    };
};

},{"10":10,"19":19,"8":8}],17:[function(require,module,exports){
var getValueSync = require(21);
var InvalidModelError = require(10);

module.exports = function getBoundValue(model, pathArg, materialized) {

    var path = pathArg;
    var boundPath = pathArg;
    var boxed, treatErrorsAsValues,
        value, shorted, found;

    boxed = model._boxed;
    materialized = model._materialized;
    treatErrorsAsValues = model._treatErrorsAsValues;

    model._boxed = true;
    model._materialized = materialized === undefined || materialized;
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

    if (found && shorted) {
        throw new InvalidModelError(boundPath, path);
    }

    return {
        path: path,
        value: value,
        shorted: shorted,
        found: found
    };
};

},{"10":10,"21":21}],18:[function(require,module,exports){
var isInternalKey = require(92);

/**
 * decends and copies the cache.
 */
module.exports = function getCache(cache) {
    var out = {};
    _copyCache(cache, out);

    return out;
};

function cloneBoxedValue(boxedValue) {
    var clonedValue = {};

    var keys = Object.keys(boxedValue);
    var key;
    var i;
    var l;

    for (i = 0, l = keys.length; i < l; i++) {
        key = keys[i];

        if (!isInternalKey(key)) {
            clonedValue[key] = boxedValue[key];
        }
    }

    return clonedValue;
}

function _copyCache(node, out, fromKey) {
    // copy and return

    Object.
        keys(node).
        filter(function(k) {
            // Its not an internal key and the node has a value.  In the cache
            // there are 3 possibilities for values.
            // 1: A branch node.
            // 2: A $type-value node.
            // 3: undefined
            // We will strip out 3
            return !isInternalKey(k) && node[k] !== undefined;
        }).
        forEach(function(key) {
            var cacheNext = node[key];
            var outNext = out[key];

            if (!outNext) {
                outNext = out[key] = {};
            }

            // Paste the node into the out cache.
            if (cacheNext.$type) {
                var isObject = cacheNext.value && typeof cacheNext.value === "object";
                var isUserCreatedcacheNext = !cacheNext.$_modelCreated;
                var value;
                if (isObject || isUserCreatedcacheNext) {
                    value = cloneBoxedValue(cacheNext);
                } else {
                    value = cacheNext.value;
                }

                out[key] = value;
                return;
            }

            _copyCache(cacheNext, outNext, key);
        });
}

},{"92":92}],19:[function(require,module,exports){
/**
 * getCachePosition makes a fast walk to the bound value since all bound
 * paths are the most possible optimized path.
 *
 * @param {Model} model -
 * @param {Array} path -
 * @returns {Mixed} - undefined if there is nothing in this position.
 * @private
 */
module.exports = function getCachePosition(model, path) {
    var currentCachePosition = model._root.cache;
    var depth = -1;
    var maxDepth = path.length;

    // The loop is simple now, we follow the current cache position until
    //
    while (++depth < maxDepth &&
           currentCachePosition && !currentCachePosition.$type) {

        currentCachePosition = currentCachePosition[path[depth]];
    }

    return currentCachePosition;
};

},{}],20:[function(require,module,exports){
var ModelResponse = require(52);
var pathSyntax = require(132);

module.exports = function getValue(path) {
    var parsedPath = pathSyntax.fromPath(path);
    var pathIdx = 0;
    var pathLen = parsedPath.length;
    while (++pathIdx < pathLen) {
        if (typeof parsedPath[pathIdx] === "object") {
            /* eslint-disable no-loop-func */
            return new ModelResponse(function(o) {
                o.onError(new Error("Paths must be simple paths"));
            });
            /* eslint-enable no-loop-func */
        }
    }

    var self = this;
    return new ModelResponse(function(obs) {
        return self.get(parsedPath).subscribe(function(data) {
            var curr = data.json;
            var depth = -1;
            var length = parsedPath.length;

            while (curr && ++depth < length) {
                curr = curr[parsedPath[depth]];
            }
            obs.onNext(curr);
        }, function(err) {
            obs.onError(err);
        }, function() {
            obs.onCompleted();
        });
    });
};

},{"132":132,"52":52}],21:[function(require,module,exports){
var followReference = require(15);
var clone = require(29);
var isExpired = require(30);
var promote = require(41);
var $ref = require(116);
var $atom = require(114);
var $error = require(115);

module.exports = function getValueSync(model, simplePath, noClone) {
    var root = model._root.cache;
    var len = simplePath.length;
    var optimizedPath = [];
    var shorted = false, shouldShort = false;
    var depth = 0;
    var key, i, next = root, curr = root, out = root, type, ref, refNode;
    var found = true;
    var expired = false;

    while (next && depth < len) {
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

        // A materialized item.  There is nothing to deref to.
        if (type === $atom && next.value === undefined) {
            out = undefined;
            found = false;
            shorted = depth < len;
            break;
        }

        // Up to the last key we follow references, ensure that they are not
        // expired either.
        if (depth < len) {
            if (type === $ref) {

                // If the reference is expired then we need to set expired to
                // true.
                if (isExpired(next)) {
                    expired = true;
                    out = undefined;
                    break;
                }

                ref = followReference(model, root, root, next, next.value);
                refNode = ref[0];

                // The next node is also set to undefined because nothing
                // could be found, this reference points to nothing, so
                // nothing must be returned.
                if (!refNode) {
                    out = void 0;
                    next = void 0;
                    found = false;
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
    }

    if (depth < len && !expired) {
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
            out = void 0;
        } else {
            out = next;
        }

        for (i = depth; i < len; ++i) {
            if (simplePath[i] !== null) {
                optimizedPath[optimizedPath.length] = simplePath[i];
            }
        }
    }

    // promotes if not expired
    if (out && type) {
        if (isExpired(out)) {
            out = void 0;
        } else {
            promote(model._root, out);
        }
    }

    // if (out && out.$type === $error && !model._treatErrorsAsValues) {
    if (out && type === $error && !model._treatErrorsAsValues) {
        /* eslint-disable no-throw-literal */
        throw {
            path: depth === len ? simplePath : simplePath.slice(0, depth),
            value: out.value
        };
        /* eslint-enable no-throw-literal */
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

},{"114":114,"115":115,"116":116,"15":15,"29":29,"30":30,"41":41}],22:[function(require,module,exports){
var getValueSync = require(21);

module.exports = function _getVersion(model, path) {
    // ultra fast clone for boxed values.
    var gen = getValueSync({
        _boxed: true,
        _root: model._root,
        _treatErrorsAsValues: model._treatErrorsAsValues
    }, path, true).value;
    var version = gen && gen.$_version;
    return (version == null) ? -1 : version;
};

},{"21":21}],23:[function(require,module,exports){
var get = require(16);
var walkPath = require(33);

var getWithPathsAsPathMap = get(walkPath, false);
var getWithPathsAsJSONGraph = get(walkPath, true);

module.exports = {
    getValueSync: require(21),
    getBoundValue: require(17),
    getWithPathsAsPathMap: getWithPathsAsPathMap,
    getWithPathsAsJSONGraph: getWithPathsAsJSONGraph
};

},{"16":16,"17":17,"21":21,"33":33}],24:[function(require,module,exports){
var promote = require(41);
var clone = require(29);

module.exports = function onError(model, node, depth,
                                  requestedPath, outerResults) {
    var value = node.value;
    if (!outerResults.errors) {
        outerResults.errors = [];
    }

    if (model._boxed) {
        value = clone(node);
    }
    outerResults.errors.push({
        path: requestedPath.slice(0, depth),
        value: value
    });
    promote(model._root, node);
};

},{"29":29,"41":41}],25:[function(require,module,exports){
var support = require(32);
var fastCopy = support.fastCopy;
var fastCat = support.fastCat;
var arraySlice = require(77);

module.exports = function onMissing(model, path, depth,
                                    outerResults, requestedPath,
                                    optimizedPath, optimizedLength) {
    var pathSlice;
    if (!outerResults.requestedMissingPaths) {
        outerResults.requestedMissingPaths = [];
        outerResults.optimizedMissingPaths = [];
    }

    if (depth < path.length) {
        // If part of path has not been traversed, we need to ensure that there
        // are no empty paths (range(1, 0) or empyt array)
        var isEmpty = false;
        for (var i = depth; i < path.length && !isEmpty; ++i) {
            if (isEmptyAtom(path[i])) {
                return;
            }
        }

        pathSlice = fastCopy(path, depth);
    } else {
        pathSlice = [];
    }

    concatAndInsertMissing(model, pathSlice, depth, requestedPath,
                           optimizedPath, optimizedLength, outerResults);
};

function concatAndInsertMissing(model, remainingPath, depth, requestedPath,
                                optimizedPath, optimizedLength, results) {
    results.requestedMissingPaths[results.requestedMissingPaths.length] =
        fastCat(arraySlice(requestedPath, 0, depth), remainingPath);

    results.optimizedMissingPaths[results.optimizedMissingPaths.length] =
        fastCat(arraySlice(optimizedPath, 0, optimizedLength), remainingPath);
}

function isEmptyAtom(atom) {
    if (atom === null || typeof atom !== "object") {
        return false;
    }

    var isArray = Array.isArray(atom);
    if (isArray && atom.length) {
        return false;
    }

    // Empty array
    else if (isArray) {
        return true;
    }

    var from = atom.from;
    var to = atom.to;
    if (from === undefined || from <= to) {
        return false;
    }

    return true;
}

},{"32":32,"77":77}],26:[function(require,module,exports){
var promote = require(41);
var clone = require(29);
var $ref = require(116);
var $atom = require(114);
var $error = require(115);

module.exports = function onValue(model, node, seed, depth, outerResults,
                                  branchInfo, requestedPath, optimizedPath,
                                  optimizedLength, isJSONG) {
    // Promote first.  Even if no output is produced we should still promote.
    if (node) {
        promote(model._root, node);
    }

    // Preload
    if (!seed) {
        return;
    }

    var i, len, k, key, curr, prev = null, prevK;
    var materialized = false, valueNode, nodeType = node && node.$type, nodeValue = node && node.value;

    if (nodeValue === undefined) {
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

    // We don't want to emit references in json output
    else if (!isJSONG && nodeType === $ref) {
        valueNode = undefined;
    }

    // JSONG always clones the node.
    else if (nodeType === $ref || nodeType === $error) {
        if (isJSONG) {
            valueNode = clone(node);
        } else {
            valueNode = nodeValue;
        }
    }

    else if (isJSONG) {
        var isObject = nodeValue && typeof nodeValue === "object";
        var isUserCreatedNode = !node || !node.$_modelCreated;
        if (isObject || isUserCreatedNode) {
            valueNode = clone(node);
        } else {
            valueNode = nodeValue;
        }
    }

    else if (node && nodeType === undefined && nodeValue === undefined) {
        // Include an empty value for branch nodes
        valueNode = {};
    } else {
        valueNode = nodeValue;
    }

    var hasValues = false;

    if (isJSONG) {
        curr = seed.jsonGraph;
        if (!curr) {
            hasValues = true;
            curr = seed.jsonGraph = {};
            seed.paths = [];
        }
        for (i = 0, len = optimizedLength - 1; i < len; i++) {
            key = optimizedPath[i];

            if (!curr[key]) {
                hasValues = true;
                curr[key] = {};
            }
            curr = curr[key];
        }

        // assign the last
        key = optimizedPath[i];

        // TODO: Special case? do string comparisons make big difference?
        curr[key] = materialized ? {$type: $atom} : valueNode;
        if (requestedPath) {
            seed.paths.push(requestedPath.slice(0, depth));
        }
    }

    // The output is pathMap and the depth is 0.  It is just a
    // value report it as the found JSON
    else if (depth === 0) {
        hasValues = true;
        seed.json = valueNode;
    }

    // The output is pathMap but we need to build the pathMap before
    // reporting the value.
    else {
        curr = seed.json;
        if (!curr) {
            hasValues = true;
            curr = seed.json = {};
        }
        for (i = 0; i < depth - 1; i++) {
            k = requestedPath[i];

            // The branch info is already generated output from the walk algo
            // with the required __path information on it.
            if (!curr[k]) {
                hasValues = true;
                curr[k] = branchInfo[i];
            }

            prev = curr;
            prevK = k;
            curr = curr[k];
        }
        k = requestedPath[i];
        if (valueNode !== undefined) {
          if (k != null) {
              hasValues = true;
              curr[k] = valueNode;
          } else {
              // We are protected from reaching here when depth is 1 and prev is
              // undefined by the InvalidModelError and NullInPathError checks.
              prev[prevK] = valueNode;
          }
        }
    }
    if (outerResults) {
        outerResults.hasValues = hasValues;
    }
};

},{"114":114,"115":115,"116":116,"29":29,"41":41}],27:[function(require,module,exports){
var isExpired = require(30);
var $error = require(115);
var onError = require(24);
var onValue = require(26);
var onMissing = require(25);
var isMaterialized = require(31);
var expireNode = require(81);
var currentCacheVersion = require(80);


/**
 * When we land on a valueType (or nothing) then we need to report it out to
 * the outerResults through errors, missing, or values.
 *
 * @private
 */
module.exports = function onValueType(
    model, node, path, depth, seed, outerResults, branchInfo,
    requestedPath, optimizedPath, optimizedLength, isJSONG, fromReference) {

    var currType = node && node.$type;

    // There are is nothing here, ether report value, or report the value
    // that is missing.  If there is no type then report the missing value.
    if (!node || !currType) {
        var materialized = isMaterialized(model);
        if (materialized || !isJSONG) {
            onValue(model, node, seed, depth, outerResults, branchInfo,
                    requestedPath, optimizedPath, optimizedLength,
                    isJSONG);
        }

        if (!materialized) {
            onMissing(model, path, depth,
                      outerResults, requestedPath,
                      optimizedPath, optimizedLength);
        }
        return;
    }

    // If there are expired value, then report it as missing
    else if (isExpired(node) &&
        !(node.$_version === currentCacheVersion.getVersion() &&
            node.$expires === 0)) {
        if (!node.$_invalidated) {
            expireNode(node, model._root.expired, model._root);
        }
        onMissing(model, path, depth,
                  outerResults, requestedPath,
                  optimizedPath, optimizedLength);
    }

    // If there is an error, then report it as a value if
    else if (currType === $error) {
        if (fromReference) {
            requestedPath[depth] = null;
            depth += 1;
        }
        if (isJSONG || model._treatErrorsAsValues) {
            onValue(model, node, seed, depth, outerResults, branchInfo,
                    requestedPath, optimizedPath, optimizedLength,
                    isJSONG);
        } else {
            onValue(model, undefined, seed, depth, outerResults, branchInfo,
                    requestedPath, optimizedPath, optimizedLength,
                    isJSONG);
            onError(model, node, depth, requestedPath, outerResults);
        }
    }

    // Report the value
    else {
        if (fromReference) {
            requestedPath[depth] = null;
            depth += 1;
        }
        onValue(model, node, seed, depth, outerResults, branchInfo,
                requestedPath, optimizedPath, optimizedLength, isJSONG);
    }
};

},{"115":115,"24":24,"25":25,"26":26,"30":30,"31":31,"80":80,"81":81}],28:[function(require,module,exports){
var pathSyntax = require(132);
var getValueSync = require(21);

module.exports = function _getValueSync(pathArg) {
    var path = pathSyntax.fromPath(pathArg);
    if (Array.isArray(path) === false) {
        throw new Error("Model#_getValueSync must be called with an Array path.");
    }
    if (this._path.length) {
        path = this._path.concat(path);
    }
    this._syncCheck("getValueSync");
    return getValueSync(this, path).value;
};

},{"132":132,"21":21}],29:[function(require,module,exports){
// Copies the node
var privatePrefix = require(35);

module.exports = function clone(node) {
    if (node === undefined) {
        return node;
    }

    var outValue, i, len;
    var keys = Object.keys(node);
    outValue = {};
    for (i = 0, len = keys.length; i < len; i++) {
        var k = keys[i];
        var k0 = k.substr(0, 2);
        if (k0 === privatePrefix) {
            continue;
        }
        outValue[k] = node[k];
    }
    return outValue;
};

},{"35":35}],30:[function(require,module,exports){
module.exports = require(90);

},{"90":90}],31:[function(require,module,exports){
module.exports = function isMaterialized(model) {
    return model._materialized && !model._source;
};

},{}],32:[function(require,module,exports){
function fastCopy(arr, iArg) {
    var a = [], len, j, i;
    for (j = 0, i = iArg || 0, len = arr.length; i < len; j++, i++) {
        a[j] = arr[i];
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
    fastCopy: fastCopy
};

},{}],33:[function(require,module,exports){
var followReference = require(15);
var onValueType = require(27);
var onValue = require(26);
var isExpired = require(30);
var iterateKeySet = require(144).iterateKeySet;
var $ref = require(116);
var NullInPathError = require(13);
var promote = require(41);

module.exports = function walkPath(model, root, curr, path, depth, seed,
                                   outerResults, branchInfo, requestedPath,
                                   optimizedPathArg, optimizedLength, isJSONG,
                                   fromReferenceArg, referenceContainerArg) {

    var fromReference = fromReferenceArg;
    var optimizedPath = optimizedPathArg;
    var referenceContainer = referenceContainerArg;

    // The walk is finished when:
    // - there is no value in the current cache position
    // - there is a JSONG leaf node in the current cache position
    // - we've reached the end of the path
    if (!curr || curr.$type || depth === path.length) {
        onValueType(model, curr, path, depth, seed, outerResults, branchInfo,
                requestedPath, optimizedPath, optimizedLength,
                isJSONG, fromReference);
        return;
    }

    var keySet = path[depth];
    var isKeySet = keySet !== null && typeof keySet === "object";
    var iteratorNote = false;
    var key = keySet;

    if (isKeySet) {
        iteratorNote = {};
        key = iterateKeySet(keySet, iteratorNote);
    }

    // Avoid iterating on empty keysets
    if (isKeySet && iteratorNote.done) {
        onValueType(model, curr, path, depth, seed, outerResults, branchInfo,
            requestedPath, optimizedPath, optimizedLength,
            isJSONG, fromReference);
    return;
}

    var allowFromWhenceYouCame = model._allowFromWhenceYouCame;
    var optimizedLengthPlus1 = optimizedLength + 1;
    var nextDepth = depth + 1;
    var refPath;
    var i;

    // loop over every key in the key set
    do {
        if (key == null) {
            throw new NullInPathError();
        }

        fromReference = false;
        optimizedPath[optimizedLength] = key;
        requestedPath[depth] = key;

        var next = curr[key];
        var nextOptimizedPath = optimizedPath;
        var nextOptimizedLength = optimizedLengthPlus1;

        // If there is the next position we need to consider references.
        if (next) {
            var nType = next.$type;
            var value = nType && next.value || next;

            // If next is a reference follow it.  If we are in JSONG mode,
            // report that value into the seed without passing the requested
            // path.  If a requested path is passed to onValueType then it
            // will add that path to the JSONGraph envelope under `paths`
            if (nextDepth < path.length && nType &&
                nType === $ref && !isExpired(next)) {

                // promote the node so that the references don't get cleaned up.
                promote(model._root, next);

                if (isJSONG) {
                    onValue(model, next, seed, nextDepth, outerResults, null,
                            null, optimizedPath, nextOptimizedLength, isJSONG);
                }

                var ref = followReference(model, root, root, next,
                                          value, seed, isJSONG);
                fromReference = true;
                next = ref[0];
                refPath = ref[1];
                referenceContainer = ref[2];
                nextOptimizedPath = [];
                nextOptimizedLength = refPath.length;
                for (i = 0; i < nextOptimizedLength; ++i) {
                    nextOptimizedPath[i] = refPath[i];
                }
            }

            // The next can be set to undefined by following a reference that
            // does not exist.
            if (next) {
                var obj;

                // There was a reference container.
                if (referenceContainer && allowFromWhenceYouCame) {
                    obj = {
                        // eslint-disable-next-line camelcase
                        $__path: next.$_absolutePath,
                        // eslint-disable-next-line camelcase
                        $__refPath: referenceContainer.value,
                        // eslint-disable-next-line camelcase
                        $__toReference: referenceContainer.$_absolutePath
                    };
                }

                // There is no reference container meaning this request was
                // neither from a model and/or the first n (depth) keys do not
                // contain references.
                else {
                    obj = {
                        // eslint-disable-next-line camelcase
                        $__path: next.$_absolutePath
                    };
                }

                branchInfo[depth] = obj;
            }
        }

        // Recurse to the next level.
        walkPath(model, root, next, path, nextDepth, seed, outerResults,
                 branchInfo, requestedPath, nextOptimizedPath,
                 nextOptimizedLength, isJSONG,
                 fromReference, referenceContainer);

        // If the iteratorNote is not done, get the next key.
        if (iteratorNote && !iteratorNote.done) {
            key = iterateKeySet(keySet, iteratorNote);
        }
    } while (iteratorNote && !iteratorNote.done);
};

},{"116":116,"13":13,"144":144,"15":15,"26":26,"27":27,"30":30,"41":41}],34:[function(require,module,exports){
"use strict";

function falcor(opts) {
    return new falcor.Model(opts);
}

/**
 * A filtering method for keys from a falcor json response.  The only gotcha
 * to this method is when the incoming json is undefined, then undefined will
 * be returned.
 *
 * @public
 * @param {Object} json - The json response from a falcor model.
 * @returns {Array} - the keys that are in the model response minus the deref
 * _private_ meta data.
 */
falcor.keys = function getJSONKeys(json) {
    if (!json) {
        return undefined;
    }

    return Object.
        keys(json).
        filter(function(key) {
            return key !== "$__path";
        });
};

module.exports = falcor;

falcor.Model = require(2);

},{"2":2}],35:[function(require,module,exports){
var reservedPrefix = require(37);

module.exports = reservedPrefix + "_";

},{"37":37}],36:[function(require,module,exports){
module.exports = require(35) + "ref";

},{"35":35}],37:[function(require,module,exports){
module.exports = "$";

},{}],38:[function(require,module,exports){
var createHardlink = require(79);
var __prefix = require(37);

var $ref = require(116);

var getBoundValue = require(17);

var promote = require(41);
var getSize = require(83);
var hasOwn = require(86);
var isObject = require(95);
var isExpired = require(90);
var isFunction = require(91);
var isPrimitive = require(97);
var expireNode = require(81);
var incrementVersion = require(87);
var updateNodeAncestors = require(110);
var removeNodeAndDescendants = require(104);

/**
 * Sets a list of PathMaps into a JSON Graph.
 * @function
 * @param {Object} model - the Model for which to insert the PathMaps.
 * @param {Array.<PathMapEnvelope>} pathMapEnvelopes - the a list of @PathMapEnvelopes to set.
 */

module.exports = function invalidatePathMaps(model, pathMapEnvelopes) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = incrementVersion();
    var comparator = modelRoot._comparator;
    var errorSelector = modelRoot._errorSelector;
    var bound = model._path;
    var cache = modelRoot.cache;
    var node = bound.length ? getBoundValue(model, bound).value : cache;
    var parent = node.$_parent || cache;
    var initialVersion = cache.$_version;

    var pathMapIndex = -1;
    var pathMapCount = pathMapEnvelopes.length;

    while (++pathMapIndex < pathMapCount) {

        var pathMapEnvelope = pathMapEnvelopes[pathMapIndex];

        invalidatePathMap(
            pathMapEnvelope.json, 0, cache, parent, node,
            version, expired, lru, comparator, errorSelector
        );
    }

    var newVersion = cache.$_version;
    var rootChangeHandler = modelRoot.onChange;

    if (isFunction(rootChangeHandler) && initialVersion !== newVersion) {
        rootChangeHandler();
    }
};

function invalidatePathMap(pathMap, depth, root, parent, node, version, expired, lru, comparator, errorSelector) {

    if (isPrimitive(pathMap) || pathMap.$type) {
        return;
    }

    for (var key in pathMap) {
        if (key[0] !== __prefix && hasOwn(pathMap, key)) {
            var child = pathMap[key];
            var branch = isObject(child) && !child.$type;
            var results = invalidateNode(
                root, parent, node,
                key, child, branch, false,
                version, expired, lru, comparator, errorSelector
            );
            var nextNode = results[0];
            var nextParent = results[1];
            if (nextNode) {
                if (branch) {
                    invalidatePathMap(
                        child, depth + 1,
                        root, nextParent, nextNode,
                        version, expired, lru, comparator, errorSelector
                    );
                } else if (removeNodeAndDescendants(nextNode, nextParent, key, lru)) {
                    updateNodeAncestors(nextParent, getSize(nextNode), lru, version);
                }
            }
        }
    }
}

function invalidateReference(value, root, node, version, expired, lru, comparator, errorSelector) {

    if (isExpired(node)) {
        expireNode(node, expired, lru);
        return [undefined, root];
    }

    promote(lru, node);

    var container = node;
    var reference = node.value;
    var parent = root;

    node = node.$_context;

    if (node != null) {
        parent = node.$_parent || root;
    } else {

        var index = 0;
        var count = reference.length - 1;

        parent = node = root;

        do {
            var key = reference[index];
            var branch = index < count;
            var results = invalidateNode(
                root, parent, node,
                key, value, branch, true,
                version, expired, lru, comparator, errorSelector
            );
            node = results[0];
            if (isPrimitive(node)) {
                return results;
            }
            parent = results[1];
        } while (index++ < count);

        if (container.$_context !== node) {
            createHardlink(container, node);
        }
    }

    return [node, parent];
}

function invalidateNode(
    root, parent, node,
    key, value, branch, reference,
    version, expired, lru, comparator, errorSelector) {

    var type = node.$type;

    while (type === $ref) {

        var results = invalidateReference(value, root, node, version, expired, lru, comparator, errorSelector);

        node = results[0];

        if (isPrimitive(node)) {
            return results;
        }

        parent = results[1];
        type = node && node.$type;
    }

    if (type !== void 0) {
        return [node, parent];
    }

    if (key == null) {
        if (branch) {
            throw new Error("`null` is not allowed in branch key positions.");
        } else if (node) {
            key = node.$_key;
        }
    } else {
        parent = node;
        node = parent[key];
    }

    return [node, parent];
}

},{"104":104,"110":110,"116":116,"17":17,"37":37,"41":41,"79":79,"81":81,"83":83,"86":86,"87":87,"90":90,"91":91,"95":95,"97":97}],39:[function(require,module,exports){
var __ref = require(36);

var $ref = require(116);

var getBoundValue = require(17);

var promote = require(41);
var getSize = require(83);
var isExpired = require(90);
var isFunction = require(91);
var isPrimitive = require(97);
var expireNode = require(81);
var iterateKeySet = require(144).iterateKeySet;
var incrementVersion = require(87);
var updateNodeAncestors = require(110);
var removeNodeAndDescendants = require(104);

/**
 * Invalidates a list of Paths in a JSON Graph.
 * @function
 * @param {Object} model - the Model for which to insert the PathValues.
 * @param {Array.<PathValue>} paths - the PathValues to set.
 */

module.exports = function invalidatePathSets(model, paths) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = incrementVersion();
    var bound = model._path;
    var cache = modelRoot.cache;
    var node = bound.length ? getBoundValue(model, bound).value : cache;
    // eslint-disable-next-line camelcase
    var parent = node.$_parent || cache;
    // eslint-disable-next-line camelcase
    var initialVersion = cache.$_version;

    var pathIndex = -1;
    var pathCount = paths.length;

    while (++pathIndex < pathCount) {

        var path = paths[pathIndex];

        invalidatePathSet(
            path, 0, cache, parent, node,
            version, expired, lru
        );
    }

    // eslint-disable-next-line camelcase
    var newVersion = cache.$_version;
    var rootChangeHandler = modelRoot.onChange;

    if (isFunction(rootChangeHandler) && initialVersion !== newVersion) {
        rootChangeHandler();
    }
};

function invalidatePathSet(
    path, depth, root, parent, node,
    version, expired, lru) {

    var note = {};
    var branch = depth < path.length - 1;
    var keySet = path[depth];
    var key = iterateKeySet(keySet, note);

    do {
        var results = invalidateNode(
            root, parent, node,
            key, branch, false,
            version, expired, lru
        );
        var nextNode = results[0];
        var nextParent = results[1];
        if (nextNode) {
            if (branch) {
                invalidatePathSet(
                    path, depth + 1,
                    root, nextParent, nextNode,
                    version, expired, lru
                );
            } else if (removeNodeAndDescendants(nextNode, nextParent, key, lru, undefined)) {
                updateNodeAncestors(nextParent, getSize(nextNode), lru, version);
            }
        }
        key = iterateKeySet(keySet, note);
    } while (!note.done);
}

function invalidateReference(root, node, version, expired, lru) {

    if (isExpired(node)) {
        expireNode(node, expired, lru);
        return [undefined, root];
    }

    promote(lru, node);

    var container = node;
    var reference = node.value;
    var parent = root;

    // eslint-disable-next-line camelcase
    node = node.$_context;

    if (node != null) {
        // eslint-disable-next-line camelcase
        parent = node.$_parent || root;
    } else {

        var index = 0;
        var count = reference.length - 1;

        parent = node = root;

        do {
            var key = reference[index];
            var branch = index < count;
            var results = invalidateNode(
                root, parent, node,
                key, branch, true,
                version, expired, lru
            );
            node = results[0];
            if (isPrimitive(node)) {
                return results;
            }
            parent = results[1];
        } while (index++ < count);

        // eslint-disable-next-line camelcase
        if (container.$_context !== node) {
            // eslint-disable-next-line camelcase
            var backRefs = node.$_refsLength || 0;
            // eslint-disable-next-line camelcase
            node.$_refsLength = backRefs + 1;
            node[__ref + backRefs] = container;
            // eslint-disable-next-line camelcase
            container.$_context = node;
            // eslint-disable-next-line camelcase
            container.$_refIndex = backRefs;
        }
    }

    return [node, parent];
}

function invalidateNode(
    root, parent, node,
    key, branch, reference,
    version, expired, lru) {

    var type = node.$type;

    while (type === $ref) {

        var results = invalidateReference(root, node, version, expired, lru);

        node = results[0];

        if (isPrimitive(node)) {
            return results;
        }

        parent = results[1];
        type = node.$type;
    }

    if (type !== void 0) {
        return [node, parent];
    }

    if (key == null) {
        if (branch) {
            throw new Error("`null` is not allowed in branch key positions.");
        } else if (node) {
            key = node.$_key;
        }
    } else {
        parent = node;
        node = parent[key];
    }

    return [node, parent];
}

},{"104":104,"110":110,"116":116,"144":144,"17":17,"36":36,"41":41,"81":81,"83":83,"87":87,"90":90,"91":91,"97":97}],40:[function(require,module,exports){
var removeNode = require(103);
var updateNodeAncestors = require(110);

module.exports = function collect(lru, expired, totalArg, max, ratioArg, version) {

    var total = totalArg;
    var ratio = ratioArg;

    if (typeof ratio !== "number") {
        ratio = 0.75;
    }

    var shouldUpdate = typeof version === "number";
    var targetSize = max * ratio;
    var parent, node, size;

    node = expired.pop();

    while (node) {
        size = node.$size || 0;
        total -= size;
        if (shouldUpdate === true) {
            updateNodeAncestors(node, size, lru, version);
            // eslint-disable-next-line camelcase
        } else if (parent = node.$_parent) { // eslint-disable-line no-cond-assign
            // eslint-disable-next-line camelcase
            removeNode(node, parent, node.$_key, lru);
        }
        node = expired.pop();
    }

    if (total >= max) {
        // eslint-disable-next-line camelcase
        var prev = lru.$_tail;
        node = prev;
        while ((total >= targetSize) && node) {
            // eslint-disable-next-line camelcase
            prev = prev.$_prev;
            size = node.$size || 0;
            total -= size;
            if (shouldUpdate === true) {
                updateNodeAncestors(node, size, lru, version);
            }
            node = prev;
        }

        // eslint-disable-next-line camelcase
        lru.$_tail = lru.$_prev = node;
        if (node == null) {
            // eslint-disable-next-line camelcase
            lru.$_head = lru.$_next = undefined;
        } else {
            // eslint-disable-next-line camelcase
            node.$_next = undefined;
        }
    }
};

},{"103":103,"110":110}],41:[function(require,module,exports){
var EXPIRES_NEVER = require(117);

// [H] -> Next -> ... -> [T]
// [T] -> Prev -> ... -> [H]
module.exports = function lruPromote(root, object) {
    // Never promote node.$expires === 1.  They cannot expire.
    if (object.$expires === EXPIRES_NEVER) {
        return;
    }

    // eslint-disable-next-line camelcase
    var head = root.$_head;

    // Nothing is in the cache.
    if (!head) {
        // eslint-disable-next-line camelcase
        root.$_head = root.$_tail = object;
        return;
    }

    if (head === object) {
        return;
    }

    // The item always exist in the cache since to get anything in the
    // cache it first must go through set.
    // eslint-disable-next-line camelcase
    var prev = object.$_prev;
    // eslint-disable-next-line camelcase
    var next = object.$_next;
    if (next) {
        // eslint-disable-next-line camelcase
        next.$_prev = prev;
    }
    if (prev) {
        // eslint-disable-next-line camelcase
        prev.$_next = next;
    }
    // eslint-disable-next-line camelcase
    object.$_prev = undefined;

    // Insert into head position
    // eslint-disable-next-line camelcase
    root.$_head = object;
    // eslint-disable-next-line camelcase
    object.$_next = head;
    // eslint-disable-next-line camelcase
    head.$_prev = object;

    // If the item we promoted was the tail, then set prev to tail.
    // eslint-disable-next-line camelcase
    if (object === root.$_tail) {
        // eslint-disable-next-line camelcase
        root.$_tail = prev;
    }
};

},{"117":117}],42:[function(require,module,exports){
module.exports = function lruSplice(root, object) {

    // Its in the cache.  Splice out.
    // eslint-disable-next-line camelcase
    var prev = object.$_prev;
    // eslint-disable-next-line camelcase
    var next = object.$_next;
    if (next) {
        // eslint-disable-next-line camelcase
        next.$_prev = prev;
    }
    if (prev) {
        // eslint-disable-next-line camelcase
        prev.$_next = next;
    }
    // eslint-disable-next-line camelcase
    object.$_prev = object.$_next = undefined;

    // eslint-disable-next-line camelcase
    if (object === root.$_head) {
        // eslint-disable-next-line camelcase
        root.$_head = next;
    }
    // eslint-disable-next-line camelcase
    if (object === root.$_tail) {
        // eslint-disable-next-line camelcase
        root.$_tail = prev;
    }
};

},{}],43:[function(require,module,exports){
var complement = require(46);
var flushGetRequest = require(47);
var incrementVersion = require(87);
var currentCacheVersion = require(80);

var REQUEST_ID = 0;
var GetRequestType = require(45).GetRequest;
var setJSONGraphs = require(68);
var setPathValues = require(70);
var $error = require(115);
var emptyArray = [];
var InvalidSourceError = require(11);

/**
 * Creates a new GetRequest.  This GetRequest takes a scheduler and
 * the request queue.  Once the scheduler fires, all batched requests
 * will be sent to the server.  Upon request completion, the data is
 * merged back into the cache and all callbacks are notified.
 *
 * @param {Scheduler} scheduler -
 * @param {RequestQueueV2} requestQueue -
 */
var GetRequestV2 = function(scheduler, requestQueue) {
    this.sent = false;
    this.scheduled = false;
    this.requestQueue = requestQueue;
    this.id = ++REQUEST_ID;
    this.type = GetRequestType;

    this._scheduler = scheduler;
    this._pathMap = {};
    this._optimizedPaths = [];
    this._requestedPaths = [];
    this._callbacks = [];
    this._count = 0;
    this._disposable = null;
    this._collapsed = null;
    this._disposed = false;
};

GetRequestV2.prototype = {
    /**
     * batches the paths that are passed in.  Once the request is complete,
     * all callbacks will be called and the request will be removed from
     * parent queue.
     * @param {Array} requestedPaths -
     * @param {Array} optimizedPaths -
     * @param {Function} callback -
     */
    batch: function(requestedPaths, optimizedPaths, callback) {
        var self = this;
        var oPaths = self._optimizedPaths;
        var rPaths = self._requestedPaths;
        var callbacks = self._callbacks;
        var idx = oPaths.length;

        // If its not sent, simply add it to the requested paths
        // and callbacks.
        oPaths[idx] = optimizedPaths;
        rPaths[idx] = requestedPaths;
        callbacks[idx] = callback;
        ++self._count;

        // If it has not been scheduled, then schedule the action
        if (!self.scheduled) {
            self.scheduled = true;

            var flushedDisposable;
            var scheduleDisposable = self._scheduler.schedule(function() {
                flushedDisposable = flushGetRequest(self, oPaths, function(err, data) {
                    var i, fn, len;
                    var model = self.requestQueue.model;
                    self.requestQueue.removeRequest(self);
                    self._disposed = true;

                    if (model._treatDataSourceErrorsAsJSONGraphErrors ? err instanceof InvalidSourceError : !!err) {
                        for (i = 0, len = callbacks.length; i < len; ++i) {
                            fn = callbacks[i];
                            if (fn) {
                                fn(err);
                            }
                        }
                        return;
                    }

                    // If there is at least one callback remaining, then
                    // callback the callbacks.
                    if (self._count) {
                        // currentVersion will get added to each inserted
                        // node as node.$_version inside of self._merge.
                        //
                        // atom values just downloaded with $expires: 0
                        // (now-expired) will get assigned $_version equal
                        // to currentVersion, and checkCacheAndReport will
                        // later consider those nodes to not have expired
                        // for the duration of current event loop tick
                        //
                        // we unset currentCacheVersion after all callbacks
                        // have been called, to ensure that only these
                        // particular callbacks and any synchronous model.get
                        // callbacks inside of these, get the now-expired
                        // values
                        var currentVersion = incrementVersion.getCurrentVersion();
                        currentCacheVersion.setVersion(currentVersion);
                        var mergeContext = { hasInvalidatedResult: false };

                        var pathsErr = model._useServerPaths && data && data.paths === undefined ?
                            new Error("Server responses must include a 'paths' field when Model._useServerPaths === true") : undefined;

                        if (!pathsErr) {
                            self._merge(rPaths, err, data, mergeContext);
                        }

                        // Call the callbacks.  The first one inserts all
                        // the data so that the rest do not have consider
                        // if their data is present or not.
                        for (i = 0, len = callbacks.length; i < len; ++i) {
                            fn = callbacks[i];
                            if (fn) {
                                fn(pathsErr || err, data, mergeContext.hasInvalidatedResult);
                            }
                        }
                        currentCacheVersion.setVersion(null);
                    }
                });
                self._disposable = flushedDisposable;
            });

            // If the scheduler is sync then `flushedDisposable` will be
            // defined, and we want to use it, because that's what aborts an
            // in-flight XHR request, for example.
            // But if the scheduler is async, then `flushedDisposable` won't be
            // defined yet, and so we must use the scheduler's disposable until
            // `flushedDisposable` is defined. Since we want to still use
            // `flushedDisposable` once it is defined (to be able to abort in-
            // flight XHR requests), hence the reassignment of `_disposable`
            // above.
            self._disposable = flushedDisposable || scheduleDisposable;
        }

        // Disposes this batched request.  This does not mean that the
        // entire request has been disposed, but just the local one, if all
        // requests are disposed, then the outer disposable will be removed.
        return createDisposable(self, idx);
    },

    /**
     * Attempts to add paths to the outgoing request.  If there are added
     * paths then the request callback will be added to the callback list.
     * Handles adding partial paths as well
     *
     * @returns {Array} - whether new requested paths were inserted in this
     *                    request, the remaining paths that could not be added,
     *                    and disposable for the inserted requested paths.
     */
    add: function(requested, optimized, callback) {
        // uses the length tree complement calculator.
        var self = this;
        var complementResult = complement(requested, optimized, self._pathMap);

        var inserted = false;
        var disposable = false;

        // If we found an intersection, then just add new callback
        // as one of the dependents of that request
        if (complementResult.intersection.length) {
            inserted = true;
            var idx = self._callbacks.length;
            self._callbacks[idx] = callback;
            self._requestedPaths[idx] = complementResult.intersection;
            self._optimizedPaths[idx] = [];
            ++self._count;

            disposable = createDisposable(self, idx);
        }

        return [inserted, complementResult.requestedComplement, complementResult.optimizedComplement, disposable];
    },

    /**
     * merges the response into the model"s cache.
     */
    _merge: function(requested, err, data, mergeContext) {
        var self = this;
        var model = self.requestQueue.model;
        var modelRoot = model._root;
        var errorSelector = modelRoot.errorSelector;
        var comparator = modelRoot.comparator;
        var boundPath = model._path;

        model._path = emptyArray;

        // flatten all the requested paths, adds them to the
        var nextPaths = model._useServerPaths ? data.paths : flattenRequestedPaths(requested);

        // Insert errors in every requested position.
        if (err && model._treatDataSourceErrorsAsJSONGraphErrors) {
            var error = err;

            // Converts errors to objects, a more friendly storage
            // of errors.
            if (error instanceof Error) {
                error = {
                    message: error.message
                };
            }

            // Not all errors are value $types.
            if (!error.$type) {
                error = {
                    $type: $error,
                    value: error
                };
            }

            var pathValues = nextPaths.map(function(x) {
                return {
                    path: x,
                    value: error
                };
            });
            setPathValues(model, pathValues, null, errorSelector, comparator, mergeContext);
        }

        // Insert the jsonGraph from the dataSource.
        else {
            setJSONGraphs(model, [{
                paths: nextPaths,
                jsonGraph: data.jsonGraph
            }], null, errorSelector, comparator, mergeContext);
        }

        // return the model"s boundPath
        model._path = boundPath;
    }
};

// Creates a more efficient closure of the things that are
// needed.  So the request and the idx.  Also prevents code
// duplication.
function createDisposable(request, idx) {
    var disposed = false;
    return function() {
        if (disposed || request._disposed) {
            return;
        }

        disposed = true;
        request._callbacks[idx] = null;
        request._optimizedPaths[idx] = [];
        request._requestedPaths[idx] = [];

        // If there are no more requests, then dispose all of the request.
        var count = --request._count;
        var disposable = request._disposable;
        if (count === 0) {
            // looking for unsubscribe here to support more data sources (Rx)
            if (disposable.unsubscribe) {
                disposable.unsubscribe();
            } else {
                disposable.dispose();
            }
            request.requestQueue.removeRequest(request);
        }
    };
}

function flattenRequestedPaths(requested) {
    var out = [];
    var outLen = -1;
    for (var i = 0, len = requested.length; i < len; ++i) {
        var paths = requested[i];
        for (var j = 0, innerLen = paths.length; j < innerLen; ++j) {
            out[++outLen] = paths[j];
        }
    }
    return out;
}

module.exports = GetRequestV2;

},{"11":11,"115":115,"45":45,"46":46,"47":47,"68":68,"70":70,"80":80,"87":87}],44:[function(require,module,exports){
var RequestTypes = require(45);
var sendSetRequest = require(48);
var GetRequest = require(43);
var falcorPathUtils = require(144);

/**
 * The request queue is responsible for queuing the operations to
 * the model"s dataSource.
 *
 * @param {Model} model -
 * @param {Scheduler} scheduler -
 */
function RequestQueueV2(model, scheduler) {
    this.model = model;
    this.scheduler = scheduler;
    this.requests = this._requests = [];
}

RequestQueueV2.prototype = {
    /**
     * Sets the scheduler, but will not affect any current requests.
     */
    setScheduler: function(scheduler) {
        this.scheduler = scheduler;
    },

    /**
     * performs a set against the dataSource.  Sets, though are not batched
     * currently could be batched potentially in the future.  Since no batching
     * is required the setRequest action is simplified significantly.
     *
     * @param {JSONGraphEnvelope) jsonGraph -
     */
    set: function(jsonGraph, cb) {
        jsonGraph.paths = falcorPathUtils.collapse(jsonGraph.paths);
        return sendSetRequest(jsonGraph, this.model, cb);
    },

    /**
     * Creates a get request to the dataSource.  Depending on the current
     * scheduler is how the getRequest will be flushed.
     * @param {Array} requestedPaths -
     * @param {Array} optimizedPaths -
     * @param {Function} cb -
     */
    get: function(requestedPaths, optimizedPaths, cb) {
        var self = this;
        var disposables = [];
        var count = 0;
        var requests = self._requests;
        var i, len;
        var oRemainingPaths = optimizedPaths;
        var rRemainingPaths = requestedPaths;
        var disposed = false;
        var request;

        for (i = 0, len = requests.length; i < len; ++i) {
            request = requests[i];
            if (request.type !== RequestTypes.GetRequest) {
                continue;
            }

            // The request has been sent, attempt to jump on the request
            // if possible.
            if (request.sent) {
                var results = request.add(rRemainingPaths, oRemainingPaths, refCountCallback);

                // Checks to see if the results were successfully inserted
                // into the outgoing results.  Then our paths will be reduced
                // to the complement.
                if (results[0]) {
                    rRemainingPaths = results[1];
                    oRemainingPaths = results[2];
                    disposables[disposables.length] = results[3];
                    ++count;
                }
            }

            // If there is a non sent request, then we can batch and leave.
            else {
                request.batch(rRemainingPaths, oRemainingPaths, refCountCallback);
                oRemainingPaths = [];
                rRemainingPaths = [];
                ++count;
            }

            // If there are no more remaining paths then exit the loop.
            if (!oRemainingPaths.length) {
                break;
            }
        }

        // After going through all the available requests if there are more
        // paths to process then a new request must be made.
        if (oRemainingPaths.length) {
            request = new GetRequest(self.scheduler, self);
            requests[requests.length] = request;
            ++count;
            var disposable = request.batch(rRemainingPaths, oRemainingPaths, refCountCallback);
            disposables[disposables.length] = disposable;
        }

        // This is a simple refCount callback.
        function refCountCallback(err, data, hasInvalidatedResult) {
            if (disposed) {
                return;
            }

            --count;

            // If the count becomes 0, then its time to notify the
            // listener that the request is done.
            if (count === 0) {
                cb(err, data, hasInvalidatedResult);
            }
        }

        // When disposing the request all of the outbound requests will be
        // disposed of.
        return function() {
            if (disposed || count === 0) {
                return;
            }

            disposed = true;
            var length = disposables.length;
            for (var idx = 0; idx < length; ++idx) {
                disposables[idx]();
            }
        };
    },

    /**
     * Removes the request from the request
     */
    removeRequest: function(request) {
        var requests = this._requests;
        var i = requests.length;
        while (--i >= 0) {
            if (requests[i].id === request.id) {
                requests.splice(i, 1);
                break;
            }
        }
    }
};

module.exports = RequestQueueV2;

},{"144":144,"43":43,"45":45,"48":48}],45:[function(require,module,exports){
module.exports = {
    GetRequest: "GET"
};

},{}],46:[function(require,module,exports){
var arraySlice = require(77);
var arrayConcat = require(74);
var iterateKeySet = require(144).iterateKeySet;

/**
 * Calculates what paths in requested path sets can be deduplicated based on an existing optimized path tree.
 *
 * For path sets with ranges or key sets, if some expanded paths can be found in the path tree, only matching paths are
 * returned as intersection. The non-matching expanded paths are returned as complement.
 *
 * The function returns an object consisting of:
 * - intersection: requested paths that were matched to the path tree
 * - optimizedComplement: optimized paths that were not found in the path tree
 * - requestedComplement: requested paths for the optimized paths that were not found in the path tree
 */
module.exports = function complement(requested, optimized, tree) {
    var optimizedComplement = [];
    var requestedComplement = [];
    var intersection = [];
    var i, iLen;

    for (i = 0, iLen = optimized.length; i < iLen; ++i) {
        var oPath = optimized[i];
        var rPath = requested[i];
        var subTree = tree[oPath.length];

        var intersectionData = findPartialIntersections(rPath, oPath, subTree);
        intersection = arrayConcat(intersection, intersectionData[0]);
        optimizedComplement = arrayConcat(optimizedComplement, intersectionData[1]);
        requestedComplement = arrayConcat(requestedComplement, intersectionData[2]);
    }

    return {
        intersection: intersection,
        optimizedComplement: optimizedComplement,
        requestedComplement: requestedComplement
    };
};

/**
 * Recursive function to calculate intersection and complement paths in 2 given pathsets at a given depth.
 *
 * Parameters:
 *  - requestedPath: full requested path set (can include ranges)
 *  - optimizedPath: corresponding optimized path (can include ranges)
 *  - requestTree: path tree for in-flight request, against which to dedupe
 *
 * Returns a 3-tuple consisting of
 *  - the intersection of requested paths with requestTree
 *  - the complement of optimized paths with requestTree
 *  - the complement of corresponding requested paths with requestTree
 *
 * Example scenario:
 *  - requestedPath: ['lolomo', 0, 0, 'tags', { from: 0, to: 2 }]
 *  - optimizedPath: ['videosById', 11, 'tags', { from: 0, to: 2 }]
 *  - requestTree: { videosById: 11: { tags: { 0: null, 1: null }}}
 *
 * This returns:
 * [
 *   [['lolomo', 0, 0, 'tags', 0], ['lolomo', 0, 0, 'tags', 1]],
 *   [['videosById', 11, 'tags', 2]],
 *   [['lolomo', 0, 0, 'tags', 2]]
 * ]
 *
 */
function findPartialIntersections(requestedPath, optimizedPath, requestTree) {
    var depthDiff = requestedPath.length - optimizedPath.length;
    var i;

    // Descend into the request path tree for the optimized-path prefix (when the optimized path is longer than the
    // requested path)
    for (i = 0; requestTree && i < -depthDiff; i++) {
        requestTree = requestTree[optimizedPath[i]];
    }

    // There is no matching path in the request path tree, thus no candidates for deduplication
    if (!requestTree) {
        return [[], [optimizedPath], [requestedPath]];
    }

    if (depthDiff === 0) {
        return recurse(requestTree, 0, [], []);
    } else if (depthDiff > 0) {
        return recurse(requestTree, 0, arraySlice(requestedPath, 0, depthDiff), []);
    } else {
        return recurse(requestTree, -depthDiff, [], arraySlice(optimizedPath, 0, -depthDiff));
    }

    function recurse(currentTree, depth, rCurrentPath, oCurrentPath) {
        var intersections = [];
        var rComplementPaths = [];
        var oComplementPaths = [];
        var oPathLen = optimizedPath.length;

        // Loop over the optimized path, looking for deduplication opportunities
        for (; depth < oPathLen; ++depth) {
            var key = optimizedPath[depth];
            var keyType = typeof key;

            if (key && keyType === "object") {
                // If a range key is found, start an inner loop to iterate over all keys in the range, and add
                // intersections and complements from each iteration separately.
                //
                // Range keys branch out this way, providing individual deduping opportunities for each inner key.
                var note = {};
                var innerKey = iterateKeySet(key, note);

                while (!note.done) {
                    var nextTree = currentTree[innerKey];
                    if (nextTree === undefined) {
                        // If no next sub tree exists for an inner key, it's a dead-end and we can add this to
                        // complement paths
                        oComplementPaths[oComplementPaths.length] = oCurrentPath.concat(
                            innerKey,
                            arraySlice(optimizedPath, depth + 1)
                        );
                        rComplementPaths[rComplementPaths.length] = rCurrentPath.concat(
                            innerKey,
                            arraySlice(requestedPath, depth + 1 + depthDiff)
                        );
                    } else if (depth === oPathLen - 1) {
                        // Reaching the end of the optimized path means that we found the entire path in the path tree,
                        // so add it to intersections
                        intersections[intersections.length] = arrayConcat(rCurrentPath, [innerKey]);
                    } else {
                        // Otherwise keep trying to find further partial deduping opportunities in the remaining path
                        var intersectionData = recurse(
                            nextTree,
                            depth + 1,
                            arrayConcat(rCurrentPath, [innerKey]),
                            arrayConcat(oCurrentPath, [innerKey])
                        );

                        intersections = arrayConcat(intersections, intersectionData[0]);
                        oComplementPaths = arrayConcat(oComplementPaths, intersectionData[1]);
                        rComplementPaths = arrayConcat(rComplementPaths, intersectionData[2]);
                    }
                    innerKey = iterateKeySet(key, note);
                }

                // The remainder of the path was handled by the recursive call, terminate the loop
                break;
            } else {
                // For simple keys, we don't need to branch out. Loop over `depth` instead of iterating over a range.
                currentTree = currentTree[key];
                oCurrentPath[oCurrentPath.length] = optimizedPath[depth];
                rCurrentPath[rCurrentPath.length] = requestedPath[depth + depthDiff];

                if (currentTree === undefined) {
                    // The path was not found in the tree, add this to complements
                    oComplementPaths[oComplementPaths.length] = arrayConcat(
                        oCurrentPath,
                        arraySlice(optimizedPath, depth + 1)
                    );
                    rComplementPaths[rComplementPaths.length] = arrayConcat(
                        rCurrentPath,
                        arraySlice(requestedPath, depth + depthDiff + 1)
                    );

                    break;
                } else if (depth === oPathLen - 1) {
                    // The end of optimized path was reached, add to intersections
                    intersections[intersections.length] = rCurrentPath;
                }
            }
        }

        // Return accumulated intersection and complement paths
        return [intersections, oComplementPaths, rComplementPaths];
    }
}

// Exported for unit testing.
module.exports.__test = { findPartialIntersections: findPartialIntersections };

},{"144":144,"74":74,"77":77}],47:[function(require,module,exports){
var pathUtils = require(144);
var toTree = pathUtils.toTree;
var toPaths = pathUtils.toPaths;
var InvalidSourceError = require(11);

/**
 * Flushes the current set of requests.  This will send the paths to the
 * dataSource.  * The results of the dataSource will be sent to callback which
 * should perform the zip of all callbacks.
 * @param {GetRequest} request -
 * @param {Array} listOfPaths -
 * @param {Function} callback -
 * @private
 */
module.exports = function flushGetRequest(request, listOfPaths, callback) {
    if (request._count === 0) {
        request.requestQueue.removeRequest(request);
        return null;
    }

    request.sent = true;
    request.scheduled = false;

    // TODO: Move this to the collapse algorithm,
    // TODO: we should have a collapse that returns the paths and
    // TODO: the trees.

    // Take all the paths and add them to the pathMap by length.
    // Since its a list of paths
    var pathMap = request._pathMap;
    var listKeys = Object.keys(listOfPaths);
    var listIdx = 0, listLen = listKeys.length;
    for (; listIdx < listLen; ++listIdx) {
        var paths = listOfPaths[listIdx];
        for (var j = 0, pathLen = paths.length; j < pathLen; ++j) {
            var pathSet = paths[j];
            var len = pathSet.length;

            if (!pathMap[len]) {
                pathMap[len] = [pathSet];
            } else {
                var pathSetsByLength = pathMap[len];
                pathSetsByLength[pathSetsByLength.length] = pathSet;
            }
        }
    }

    // now that we have them all by length, convert each to a tree.
    var pathMapKeys = Object.keys(pathMap);
    var pathMapIdx = 0, pathMapLen = pathMapKeys.length;
    for (; pathMapIdx < pathMapLen; ++pathMapIdx) {
        var pathMapKey = pathMapKeys[pathMapIdx];
        pathMap[pathMapKey] = toTree(pathMap[pathMapKey]);
    }

    // Take the pathMapTree and create the collapsed paths and send those
    // off to the server.
    var collapsedPaths = request._collasped = toPaths(pathMap);
    var jsonGraphData;

    // Make the request.
    // You are probably wondering why this is not cancellable.  If a request
    // goes out, and all the requests are removed, the request should not be
    // cancelled.  The reasoning is that another request could come in, after
    // all callbacks have been removed and be deduped.  Might as well keep this
    // around until it comes back.  If at that point there are no requests then
    // we cancel at the callback above.
    var getRequest;
    try {
        getRequest = request.
            requestQueue.
            model._source.
            get(collapsedPaths);
    } catch (e) {
        callback(new InvalidSourceError());
        return null;
    }

    // Ensures that the disposable is available for the outside to cancel.
    var disposable = getRequest.
        subscribe(function(data) {
            jsonGraphData = data;
        }, function(err) {
            callback(err, jsonGraphData);
        }, function() {
            callback(null, jsonGraphData);
        });

    return disposable;
};


},{"11":11,"144":144}],48:[function(require,module,exports){
var arrayMap = require(76);
var setJSONGraphs = require(68);
var setPathValues = require(70);
var InvalidSourceError = require(11);

var emptyArray = [];
var emptyDisposable = {dispose: function() {}};

/**
 * A set request is not an object like GetRequest.  It simply only needs to
 * close over a couple values and its never batched together (at least not now).
 *
 * @private
 * @param {JSONGraphEnvelope} jsonGraph -
 * @param {Model} model -
 * @param {Function} callback -
 */
var sendSetRequest = function(originalJsonGraph, model, callback) {
    var paths = originalJsonGraph.paths;
    var modelRoot = model._root;
    var errorSelector = modelRoot.errorSelector;
    var comparator = modelRoot.comparator;
    var boundPath = model._path;
    var resultingJsonGraphEnvelope;

    // This is analogous to GetRequest _merge / flushGetRequest
    // SetRequests are just considerably simplier.
    var setObservable;
    try {
        setObservable = model._source.
            set(originalJsonGraph);
    } catch (e) {
        callback(new InvalidSourceError());
        return emptyDisposable;
    }

    var disposable = setObservable.
        subscribe(function onNext(jsonGraphEnvelope) {
            // When disposed, no data is inserted into.  This can sync resolve
            // and if thats the case then its undefined.
            if (disposable && disposable.disposed) {
                return;
            }

            // onNext will insert all data into the model then save the json
            // envelope from the incoming result.
            model._path = emptyArray;

            var successfulPaths = setJSONGraphs(model, [{
                paths: paths,
                jsonGraph: jsonGraphEnvelope.jsonGraph
            }], null, errorSelector, comparator);

            jsonGraphEnvelope.paths = successfulPaths[1];

            model._path = boundPath;
            resultingJsonGraphEnvelope = jsonGraphEnvelope;
        }, function onError(dataSourceError) {
            if (disposable && disposable.disposed) {
                return;
            }
            model._path = emptyArray;

            setPathValues(model, arrayMap(paths, function(path) {
                return {
                    path: path,
                    value: dataSourceError
                };
            }), null, errorSelector, comparator);

            model._path = boundPath;

            callback(dataSourceError);
        }, function onCompleted() {
            callback(null, resultingJsonGraphEnvelope);
        });

    return disposable;
};

module.exports = sendSetRequest;

},{"11":11,"68":68,"70":70,"76":76}],49:[function(require,module,exports){
/**
 * Will allow for state tracking of the current disposable.  Also fulfills the
 * disposable interface.
 * @private
 */
var AssignableDisposable = function AssignableDisposable(disosableCallback) {
    this.disposed = false;
    this.currentDisposable = disosableCallback;
};


AssignableDisposable.prototype = {

    /**
     * Disposes of the current disposable.  This would be the getRequestCycle
     * disposable.
     */
    dispose: function dispose() {
        if (this.disposed || !this.currentDisposable) {
            return;
        }
        this.disposed = true;

        // If the current disposable fulfills the disposable interface or just
        // a disposable function.
        var currentDisposable = this.currentDisposable;
        if (currentDisposable.dispose) {
            currentDisposable.dispose();
        }

        else {
            currentDisposable();
        }
    }
};


module.exports = AssignableDisposable;

},{}],50:[function(require,module,exports){
var ModelResponse = require(52);
var InvalidSourceError = require(11);

var pathSyntax = require(132);

/**
 * @private
 * @augments ModelResponse
 */
function CallResponse(model, callPath, args, suffix, paths) {
    this.callPath = pathSyntax.fromPath(callPath);
    this.args = args;

    if (paths) {
        this.paths = paths.map(pathSyntax.fromPath);
    }
    if (suffix) {
        this.suffix = suffix.map(pathSyntax.fromPath);
    }
    this.model = model;
}

CallResponse.prototype = Object.create(ModelResponse.prototype);
CallResponse.prototype._subscribe = function _subscribe(observer) {
    var callPath = this.callPath;
    var callArgs = this.args;
    var suffixes = this.suffix;
    var extraPaths = this.paths;
    var model = this.model;
    var rootModel = model._clone({
        _path: []
    });
    var boundPath = model._path;
    var boundCallPath = boundPath.concat(callPath);

    /* eslint-disable consistent-return */
    // Precisely the same error as the router when a call function does not
    // exist.
    if (!model._source) {
        observer.onError(new Error("function does not exist"));
        return;
    }


    var response, obs;
    try {
        obs = model._source.
            call(boundCallPath, callArgs, suffixes, extraPaths);
    } catch (e) {
        observer.onError(new InvalidSourceError(e));
        return;
    }

    return obs.
        subscribe(function(res) {
            response = res;
        }, function(err) {
            observer.onError(err);
        }, function() {

            // Run the invalidations first then the follow up JSONGraph set.
            var invalidations = response.invalidated;
            if (invalidations && invalidations.length) {
                rootModel.invalidate.apply(rootModel, invalidations);
            }

            // The set
            rootModel.
                withoutDataSource().
                set(response).subscribe(function(x) {
                    observer.onNext(x);
                }, function(err) {
                    observer.onError(err);
                }, function() {
                    observer.onCompleted();
                });
        });
    /* eslint-enable consistent-return */
};

module.exports = CallResponse;

},{"11":11,"132":132,"52":52}],51:[function(require,module,exports){
var isArray = Array.isArray;
var ModelResponse = require(52);
var isPathValue = require(96);
var isJSONEnvelope = require(93);
var empty = {dispose: function() {}};

function InvalidateResponse(model, args) {
    // TODO: This should be removed.  There should only be 1 type of arguments
    // coming in, but we have strayed from documentation.
    this._model = model;

    var groups = [];
    var group, groupType;
    var argIndex = -1;
    var argCount = args.length;

    // Validation of arguments have been moved out of this function.
    while (++argIndex < argCount) {
        var arg = args[argIndex];
        var argType;
        if (isArray(arg)) {
            argType = "PathValues";
        } else if (isPathValue(arg)) {
            argType = "PathValues";
        } else if (isJSONEnvelope(arg)) {
            argType = "PathMaps";
        } else {
            throw new Error("Invalid Input");
        }

        if (groupType !== argType) {
            groupType = argType;
            group = {
                inputType: argType,
                arguments: []
            };
            groups.push(group);
        }

        group.arguments.push(arg);
    }

    this._groups = groups;
}

InvalidateResponse.prototype = Object.create(ModelResponse.prototype);
InvalidateResponse.prototype.progressively = function progressively() {
    return this;
};
InvalidateResponse.prototype._toJSONG = function _toJSONG() {
    return this;
};

InvalidateResponse.prototype._subscribe = function _subscribe(observer) {

    var model = this._model;
    this._groups.forEach(function(group) {
        var inputType = group.inputType;
        var methodArgs = group.arguments;
        var operationName = "_invalidate" + inputType;
        var operationFunc = model[operationName];
        operationFunc(model, methodArgs);
    });
    observer.onCompleted();

    return empty;
};

module.exports = InvalidateResponse;

},{"52":52,"93":93,"96":96}],52:[function(require,module,exports){
(function (Promise){
var ModelResponseObserver = require(53);
var $$observable = require(166).default;
var toEsObservable = require(113);

/**
 * A ModelResponse is a container for the results of a get, set, or call operation performed on a Model. The ModelResponse provides methods which can be used to specify the output format of the data retrieved from a Model, as well as how that data is delivered.
 * @constructor ModelResponse
 * @augments Observable
*/
function ModelResponse(subscribe) {
    this._subscribe = subscribe;
}

ModelResponse.prototype[$$observable] = function SymbolObservable() {
    return toEsObservable(this);
};

ModelResponse.prototype._toJSONG = function toJSONG() {
    return this;
};

/**
 * The progressively method breaks the response up into two parts: the data immediately available in the Model cache, and the data in the Model cache after the missing data has been retrieved from the DataSource.
 * The progressively method creates a ModelResponse that immediately returns the requested data that is available in the Model cache. If any requested paths are not available in the cache, the ModelResponse will send another JSON message with all of the requested data after it has been retrieved from the DataSource.
 * @name progressively
 * @memberof ModelResponse.prototype
 * @function
 * @return {ModelResponse.<JSONEnvelope>} the values found at the requested paths.
 * @example
var dataSource = (new falcor.Model({
  cache: {
    user: {
      name: "Steve",
      surname: "McGuire",
      age: 31
    }
  }
})).asDataSource();

var model = new falcor.Model({
  source: dataSource,
  cache: {
    user: {
      name: "Steve",
      surname: "McGuire"
    }
  }
});

model.
  get(["user",["name", "surname", "age"]]).
  progressively().
  // this callback will be invoked twice, once with the data in the
  // Model cache, and again with the additional data retrieved from the DataSource.
  subscribe(function(json){
    console.log(JSON.stringify(json,null,4));
  });

// prints...
// {
//     "json": {
//         "user": {
//             "name": "Steve",
//             "surname": "McGuire"
//         }
//     }
// }
// ...and then prints...
// {
//     "json": {
//         "user": {
//             "name": "Steve",
//             "surname": "McGuire",
//             "age": 31
//         }
//     }
// }
*/
ModelResponse.prototype.progressively = function progressively() {
    return this;
};

ModelResponse.prototype.subscribe =
ModelResponse.prototype.forEach = function subscribe(a, b, c) {
    var observer = new ModelResponseObserver(a, b, c);
    var subscription = this._subscribe(observer);
    switch (typeof subscription) {
        case "function":
            return {
                dispose: function() {
                    if (observer._closed) {
                        return;
                    }
                    observer._closed = true;
                    subscription();
                }
             };
        case "object":
            return {
                dispose: function() {
                    if (observer._closed) {
                        return;
                    }
                    observer._closed = true;
                    if (subscription !== null) {
                        subscription.dispose();
                    }
                }
             };
        default:
            return {
                dispose: function() {
                    observer._closed = true;
                }
             };
    }
};

ModelResponse.prototype.then = function then(onNext, onError) {
    /* global Promise */
    var self = this;
    if (!self._promise) {
        self._promise = new Promise(function(resolve, reject) {
            var rejected = false;
            var values = [];
            self.subscribe(
                function(value) {
                    values[values.length] = value;
                },
                function(errors) {
                    rejected = true;
                    reject(errors);
                },
                function() {
                    var value = values;
                    if (values.length <= 1) {
                        value = values[0];
                    }

                    if (rejected === false) {
                        resolve(value);
                    }
                }
            );
        });
    }
    return self._promise.then(onNext, onError);
};

module.exports = ModelResponse;

}).call(this,typeof Promise === "function" ? Promise : require(158))
},{"113":113,"158":158,"166":166,"53":53}],53:[function(require,module,exports){
var noop = require(100);

/**
 * A ModelResponseObserver conform to the Observable's Observer contract. It accepts either an Observer or three optional callbacks which correspond to the Observer methods onNext, onError, and onCompleted.
 * The ModelResponseObserver wraps an Observer to enforce a variety of different invariants including:
 * 1. onError callback is only called once.
 * 2. onCompleted callback is only called once.
 * @constructor ModelResponseObserver
*/
function ModelResponseObserver(
    onNextOrObserver,
    onErrorFn,
    onCompletedFn
) {
    // if callbacks are passed, construct an Observer from them. Create a NOOP function for any missing callbacks.
    if (!onNextOrObserver || typeof onNextOrObserver !== "object") {
        this._observer = {
            onNext: (
                typeof onNextOrObserver === "function"
                    ? onNextOrObserver
                    : noop
            ),
            onError: (
                typeof onErrorFn === "function"
                    ? onErrorFn
                    : noop
            ),
            onCompleted: (
                typeof onCompletedFn === "function"
                    ? onCompletedFn
                    : noop
            )
        };
    }
    // if an Observer is passed
    else {
        this._observer = {
            onNext: typeof onNextOrObserver.onNext === "function" ? function(value) { onNextOrObserver.onNext(value); } : noop,
            onError: typeof onNextOrObserver.onError === "function" ? function(error) { onNextOrObserver.onError(error); } : noop,
            onCompleted: (
                typeof onNextOrObserver.onCompleted === "function"
                    ? function() { onNextOrObserver.onCompleted(); }
                    : noop
            )
        };
    }
}

ModelResponseObserver.prototype = {
    onNext: function(v) {
        if (!this._closed) {
            this._observer.onNext(v);
        }
    },
    onError: function(e) {
        if (!this._closed) {
            this._closed = true;
            this._observer.onError(e);
        }
    },
    onCompleted: function() {
        if (!this._closed) {
            this._closed = true;
            this._observer.onCompleted();
        }
    }
};

module.exports = ModelResponseObserver;

},{"100":100}],54:[function(require,module,exports){
var ModelResponse = require(52);
var checkCacheAndReport = require(55);
var getRequestCycle = require(56);
var empty = {dispose: function() {}};
var collectLru = require(40);
var getSize = require(83);

/**
 * The get response.  It takes in a model and paths and starts
 * the request cycle.  It has been optimized for cache first requests
 * and closures.
 * @param {Model} model -
 * @param {Array} paths -
 * @augments ModelResponse
 * @private
 */
var GetResponse = module.exports = function GetResponse(model, paths,
                                                        isJSONGraph,
                                                        isProgressive,
                                                        forceCollect) {
    this.model = model;
    this.currentRemainingPaths = paths;
    this.isJSONGraph = isJSONGraph || false;
    this.isProgressive = isProgressive || false;
    this.forceCollect = forceCollect || false;
};

GetResponse.prototype = Object.create(ModelResponse.prototype);

/**
 * Makes the output of a get response JSONGraph instead of json.
 * @private
 */
GetResponse.prototype._toJSONG = function _toJSONGraph() {
    return new GetResponse(this.model, this.currentRemainingPaths,
                           true, this.isProgressive, this.forceCollect);
};

/**
 * Progressively responding to data in the cache instead of once the whole
 * operation is complete.
 * @public
 */
GetResponse.prototype.progressively = function progressively() {
    return new GetResponse(this.model, this.currentRemainingPaths,
                           this.isJSONGraph, true, this.forceCollect);
};

/**
 * purely for the purposes of closure creation other than the initial
 * prototype created closure.
 *
 * @private
 */
GetResponse.prototype._subscribe = function _subscribe(observer) {
    var seed = [{}];
    var errors = [];
    var model = this.model;
    var isJSONG = observer.isJSONG = this.isJSONGraph;
    var isProgressive = this.isProgressive;
    var results = checkCacheAndReport(model, this.currentRemainingPaths,
                                      observer, isProgressive, isJSONG, seed,
                                      errors);

    // If there are no results, finish.
    if (!results) {
        if (this.forceCollect) {
            var modelRoot = model._root;
            var modelCache = modelRoot.cache;
            var currentVersion = modelCache.$_version;

            collectLru(modelRoot, modelRoot.expired, getSize(modelCache),
                    model._maxSize, model._collectRatio, currentVersion);
        }
        return empty;
    }

    // Starts the async request cycle.
    return getRequestCycle(this, model, results,
                           observer, errors, 1);
};

},{"40":40,"52":52,"55":55,"56":56,"83":83}],55:[function(require,module,exports){
var gets = require(23);
var getWithPathsAsJSONGraph = gets.getWithPathsAsJSONGraph;
var getWithPathsAsPathMap = gets.getWithPathsAsPathMap;

/**
 * Checks cache for the paths and reports if in progressive mode.  If
 * there are missing paths then return the cache hit results.
 *
 * Return value (`results`) stores missing path information as 3 index-linked arrays:
 * `requestedMissingPaths` holds requested paths that were not found in cache
 * `optimizedMissingPaths` holds optimized versions of requested paths
 *
 * Note that requestedMissingPaths is not necessarily the list of paths requested by
 * user in model.get. It does not contain those paths that were found in
 * cache. It also breaks some path sets out into separate paths, those which
 * resolve to different optimized lengths after walking through any references in
 * cache.
 * This helps maintain a 1:1 correspondence between requested and optimized missing,
 * as well as their depth differences (or, length offsets).
 *
 * Example: Given cache: `{ lolomo: { 0: $ref('vid'), 1: $ref('a.b.c.d') }}`,
 * `model.get('lolomo[0..2].name').subscribe()` will result in the following
 * corresponding values:
 *    index   requestedMissingPaths   optimizedMissingPaths
 *      0     ['lolomo', 0, 'name']   ['vid', 'name']
 *      1     ['lolomo', 1, 'name']   ['a', 'b', 'c', 'd', 'name']
 *      2     ['lolomo', 2, 'name']   ['lolomo', 2, 'name']
 *
 * @param {Model} model - The model that the request was made with.
 * @param {Array} requestedMissingPaths -
 * @param {Boolean} progressive -
 * @param {Boolean} isJSONG -
 * @param {Function} onNext -
 * @param {Function} onError -
 * @param {Function} onCompleted -
 * @param {Object} seed - The state of the output
 * @returns {Object} results -
 *
 * @private
 */
module.exports = function checkCacheAndReport(model, requestedPaths, observer,
                                              progressive, isJSONG, seed,
                                              errors) {

    // checks the cache for the data.
    var results = isJSONG ? getWithPathsAsJSONGraph(model, requestedPaths, seed)
                          : getWithPathsAsPathMap(model, requestedPaths, seed);

    // We are done when there are no missing paths or the model does not
    // have a dataSource to continue on fetching from.
    var valueNode = results.values && results.values[0];
    var completed = !results.requestedMissingPaths ||
                    !results.requestedMissingPaths.length ||
                    !model._source;

    // Copy the errors into the total errors array.
    if (results.errors) {
        var errs = results.errors;
        var errorsLength = errors.length;
        for (var i = 0, len = errs.length; i < len; ++i, ++errorsLength) {
            errors[errorsLength] = errs[i];
        }
    }

    // Report locally available values if:
    // - the request is in progressive mode, or
    // - the request is complete and values were found
    if (progressive || (completed && valueNode !== undefined)) {
        observer.onNext(valueNode);
    }

    // We must communicate critical errors from get that are critical
    // errors such as bound path is broken or this is a JSONGraph request
    // with a bound path.
    if (results.criticalError) {
        observer.onError(results.criticalError);
        return null;
    }

    // if there are missing paths, then lets return them.
    if (completed) {
        if (errors.length) {
            observer.onError(errors);
        } else {
            observer.onCompleted();
        }

        return null;
    }

    // Return the results object.
    return results;
};

},{"23":23}],56:[function(require,module,exports){
var checkCacheAndReport = require(55);
var MaxRetryExceededError = require(12);
var fastCat = require(32).fastCat;
var collectLru = require(40);
var getSize = require(83);
var AssignableDisposable = require(49);
var InvalidSourceError = require(11);

/**
 * The get request cycle for checking the cache and reporting
 * values.  If there are missing paths then the async request cycle to
 * the data source is performed until all paths are resolved or max
 * requests are made.
 * @param {GetResponse} getResponse -
 * @param {Model} model - The model that the request was made with.
 * @param {Object} results -
 * @param {Function} onNext -
 * @param {Function} onError -
 * @param {Function} onCompleted -
 * @private
 */
module.exports = function getRequestCycle(getResponse, model, results, observer,
                                          errors, count) {
    // we have exceeded the maximum retry limit.
    if (count > model._maxRetries) {
        observer.onError(new MaxRetryExceededError(results.optimizedMissingPaths));
        return {
            dispose: function() {}
        };
    }

    var requestQueue = model._request;
    var requestedMissingPaths = results.requestedMissingPaths;
    var optimizedMissingPaths = results.optimizedMissingPaths;
    var disposable = new AssignableDisposable();

    // We need to prepend the bound path to all requested missing paths and
    // pass those into the requestQueue.
    var boundRequestedMissingPaths = [];
    var boundPath = model._path;
    if (boundPath.length) {
        for (var i = 0, len = requestedMissingPaths.length; i < len; ++i) {
            boundRequestedMissingPaths[i] =
                fastCat(boundPath, requestedMissingPaths[i]);
        }
    }

    // No bound path, no array copy and concat.
    else {
        boundRequestedMissingPaths = requestedMissingPaths;
    }

    var currentRequestDisposable = requestQueue.
        get(boundRequestedMissingPaths, optimizedMissingPaths, function(err, data, hasInvalidatedResult) {
            if (model._treatDataSourceErrorsAsJSONGraphErrors ? err instanceof InvalidSourceError : !!err) {
                if (results.hasValues) {
                    observer.onNext(results.values && results.values[0]);
                }
                observer.onError(err);
                return;
            }

            var nextRequestedMissingPaths;
            var nextSeed;

            // If merging over an existing branch structure with refs has invalidated our intermediate json,
            // we want to start over and re-get all requested paths with a fresh seed
            if (hasInvalidatedResult) {
                nextRequestedMissingPaths = getResponse.currentRemainingPaths;
                nextSeed = [{}];
            } else {
                nextRequestedMissingPaths = requestedMissingPaths;
                nextSeed = results.values;
            }

             // Once the request queue finishes, check the cache and bail if
             // we can.
            var nextResults = checkCacheAndReport(model, nextRequestedMissingPaths,
                                                  observer,
                                                  getResponse.isProgressive,
                                                  getResponse.isJSONGraph,
                                                  nextSeed, errors);

            // If there are missing paths coming back form checkCacheAndReport
            // the its reported from the core cache check method.
            if (nextResults) {

                // update the which disposable to use.
                disposable.currentDisposable =
                    getRequestCycle(getResponse, model, nextResults, observer,
                                    errors, count + 1);
            }

            // We have finished.  Since we went to the dataSource, we must
            // collect on the cache.
            else {

                var modelRoot = model._root;
                var modelCache = modelRoot.cache;
                var currentVersion = modelCache.$_version;

                collectLru(modelRoot, modelRoot.expired, getSize(modelCache),
                        model._maxSize, model._collectRatio, currentVersion);
            }

        });
    disposable.currentDisposable = currentRequestDisposable;
    return disposable;
};

},{"11":11,"12":12,"32":32,"40":40,"49":49,"55":55,"83":83}],57:[function(require,module,exports){
var GetResponse = require(54);

/**
 * Performs a get on the cache and if there are missing paths
 * then the request will be forwarded to the get request cycle.
 * @private
 */
module.exports = function getWithPaths(paths) {
    return new GetResponse(this, paths);
};

},{"54":54}],58:[function(require,module,exports){
var pathSyntax = require(132);
var ModelResponse = require(52);
var GET_VALID_INPUT = require(59);
var validateInput = require(111);
var GetResponse = require(54);

/**
 * Performs a get on the cache and if there are missing paths
 * then the request will be forwarded to the get request cycle.
 * @private
 */
module.exports = function get() {
    // Validates the input.  If the input is not pathSets or strings then we
    // will onError.
    var out = validateInput(arguments, GET_VALID_INPUT, "get");
    if (out !== true) {
        return new ModelResponse(function(o) {
            o.onError(out);
        });
    }

    var paths = pathSyntax.fromPathsOrPathValues(arguments);
    return new GetResponse(this, paths);
};

},{"111":111,"132":132,"52":52,"54":54,"59":59}],59:[function(require,module,exports){
module.exports = {
    path: true,
    pathSyntax: true
};

},{}],60:[function(require,module,exports){
var ModelResponse = require(52);
var pathSyntax = require(132);
var isArray = Array.isArray;
var isPathValue = require(96);
var isJSONGraphEnvelope = require(94);
var isJSONEnvelope = require(93);
var setRequestCycle = require(63);

/**
 *  The set response is responsible for doing the request loop for the set
 * operation and subscribing to the follow up get.
 *
 * The constructors job is to parse out the arguments and put them in their
 * groups.  The following subscribe will do the actual cache set and dataSource
 * operation remoting.
 *
 * @param {Model} model -
 * @param {Array} args - The array of arguments that can be JSONGraph, JSON, or
 * pathValues.
 * @param {Boolean} isJSONGraph - if the request is a jsonGraph output format.
 * @param {Boolean} isProgressive - progressive output.
 * @augments ModelResponse
 * @private
 */
var SetResponse = module.exports = function SetResponse(model, args,
                                                        isJSONGraph,
                                                        isProgressive) {

    // The response properties.
    this._model = model;
    this._isJSONGraph = isJSONGraph || false;
    this._isProgressive = isProgressive || false;
    this._initialArgs = args;
    this._value = [{}];

    var groups = [];
    var group, groupType;
    var argIndex = -1;
    var argCount = args.length;

    // Validation of arguments have been moved out of this function.
    while (++argIndex < argCount) {
        var arg = args[argIndex];
        var argType;
        if (isArray(arg) || typeof arg === "string") {
            arg = pathSyntax.fromPath(arg);
            argType = "PathValues";
        } else if (isPathValue(arg)) {
            arg.path = pathSyntax.fromPath(arg.path);
            argType = "PathValues";
        } else if (isJSONGraphEnvelope(arg)) {
            argType = "JSONGs";
        } else if (isJSONEnvelope(arg)) {
            argType = "PathMaps";
        }

        if (groupType !== argType) {
            groupType = argType;
            group = {
                inputType: argType,
                arguments: []
            };
            groups.push(group);
        }

        group.arguments.push(arg);
    }

    this._groups = groups;
};

SetResponse.prototype = Object.create(ModelResponse.prototype);

/**
 * The subscribe function will setup the remoting of the operation and cache
 * setting.
 *
 * @private
 */
SetResponse.prototype._subscribe = function _subscribe(observer) {
    var groups = this._groups;
    var model = this._model;
    var isJSONGraph = this._isJSONGraph;
    var isProgressive = this._isProgressive;

    // Starts the async request cycle.
    return setRequestCycle(
        model, observer, groups, isJSONGraph, isProgressive, 0);
};

/**
 * Makes the output of a get response JSONGraph instead of json.
 * @private
 */
SetResponse.prototype._toJSONG = function _toJSONGraph() {
    return new SetResponse(this._model, this._initialArgs,
                           true, this._isProgressive);
};

/**
 * Progressively responding to data in the cache instead of once the whole
 * operation is complete.
 * @public
 */
SetResponse.prototype.progressively = function progressively() {
    return new SetResponse(this._model, this._initialArgs,
                           this._isJSONGraph, true);
};

},{"132":132,"52":52,"63":63,"93":93,"94":94,"96":96}],61:[function(require,module,exports){
var setValidInput = require(64);
var validateInput = require(111);
var SetResponse = require(60);
var ModelResponse = require(52);

module.exports = function set() {
    var out = validateInput(arguments, setValidInput, "set");
    if (out !== true) {
        return new ModelResponse(function(o) {
            o.onError(out);
        });
    }

    var argsIdx = -1;
    var argsLen = arguments.length;
    var args = [];
    while (++argsIdx < argsLen) {
        args[argsIdx] = arguments[argsIdx];
    }
    return new SetResponse(this, args);
};

},{"111":111,"52":52,"60":60,"64":64}],62:[function(require,module,exports){
var arrayFlatMap = require(75);

/**
 * Takes the groups that are created in the SetResponse constructor and sets
 * them into the cache.
 */
module.exports = function setGroupsIntoCache(model, groups) {
    var modelRoot = model._root;
    var errorSelector = modelRoot.errorSelector;
    var groupIndex = -1;
    var groupCount = groups.length;
    var requestedPaths = [];
    var optimizedPaths = [];
    var returnValue = {
        requestedPaths: requestedPaths,
        optimizedPaths: optimizedPaths
    };

    // Takes each of the groups and normalizes their input into
    // requested paths and optimized paths.
    while (++groupIndex < groupCount) {

        var group = groups[groupIndex];
        var inputType = group.inputType;
        var methodArgs = group.arguments;

        if (methodArgs.length > 0) {
            var operationName = "_set" + inputType;
            var operationFunc = model[operationName];
            var successfulPaths = operationFunc(model, methodArgs, null, errorSelector);

            optimizedPaths.push.apply(optimizedPaths, successfulPaths[1]);

            if (inputType === "PathValues") {
                requestedPaths.push.apply(requestedPaths, methodArgs.map(pluckPath));
            } else if (inputType === "JSONGs") {
                requestedPaths.push.apply(requestedPaths, arrayFlatMap(methodArgs, pluckEnvelopePaths));
            } else {
                requestedPaths.push.apply(requestedPaths, successfulPaths[0]);
            }
        }
    }

    return returnValue;
};

function pluckPath(pathValue) {
    return pathValue.path;
}

function pluckEnvelopePaths(jsonGraphEnvelope) {
    return jsonGraphEnvelope.paths;
}

},{"75":75}],63:[function(require,module,exports){
var emptyArray = [];
var AssignableDisposable = require(49);
var GetResponse = require(54);
var setGroupsIntoCache = require(62);
var getWithPathsAsPathMap = require(23).getWithPathsAsPathMap;
var InvalidSourceError = require(11);
var MaxRetryExceededError = require(12);

/**
 * The request cycle for set.  This is responsible for requesting to dataSource
 * and allowing disposing inflight requests.
 */
module.exports = function setRequestCycle(model, observer, groups,
                                          isJSONGraph, isProgressive, count) {
    var requestedAndOptimizedPaths = setGroupsIntoCache(model, groups);
    var optimizedPaths = requestedAndOptimizedPaths.optimizedPaths;
    var requestedPaths = requestedAndOptimizedPaths.requestedPaths;

    // we have exceeded the maximum retry limit.
    if (count === model._maxRetries) {
        observer.onError(new MaxRetryExceededError(optimizedPaths));
        return {
            dispose: function() {}
        };
    }

    var isMaster = model._source === undefined;

    // Local set only.  We perform a follow up get.  If performance is ever
    // a requirement simply requiring in checkCacheAndReport and use get request
    // internals.  Figured this is more "pure".
    if (isMaster) {
        return subscribeToFollowupGet(model, observer, requestedPaths,
                              isJSONGraph, isProgressive);
    }


    // Progressively output the data from the first set.
    var prevVersion;
    if (isProgressive) {
        var results = getWithPathsAsPathMap(model, requestedPaths, [{}]);
        if (results.criticalError) {
            observer.onError(results.criticalError);
            return null;
        }
        observer.onNext(results.values[0]);

        prevVersion = model._root.cache.$_version;
    }

    var currentJSONGraph = getJSONGraph(model, optimizedPaths);
    var disposable = new AssignableDisposable();

    // Sends out the setRequest.  The Queue will call the callback with the
    // JSONGraph envelope / error.
    var requestDisposable = model._request.
        // TODO: There is error handling that has not been addressed yet.

        // If disposed before this point then the sendSetRequest will not
        // further any callbacks.  Therefore, if we are at this spot, we are
        // not disposed yet.
        set(currentJSONGraph, function(error, jsonGraphEnv) {
            if (error instanceof InvalidSourceError) {
                observer.onError(error);
                return;
            }

            // TODO: This seems like there are errors with this approach, but
            // for sanity sake I am going to keep this logic in here until a
            // rethink can be done.
            var isCompleted = false;
            if (error || optimizedPaths.length === jsonGraphEnv.paths.length) {
                isCompleted = true;
            }

            // If we're in progressive mode and nothing changed in the meantime, we're done
            if (isProgressive) {
                var nextVersion = model._root.cache.$_version;
                var versionChanged = nextVersion !== prevVersion;

                if (!versionChanged) {
                    observer.onCompleted();
                    return;
                }
            }

            // Happy case.  One request to the dataSource will fulfill the
            // required paths.
            if (isCompleted) {
                disposable.currentDisposable =
                    subscribeToFollowupGet(model, observer, requestedPaths,
                                          isJSONGraph, isProgressive);
            }

            // TODO: The unhappy case.  I am unsure how this can even be
            // achieved.
            else {
                // We need to restart the setRequestCycle.
                setRequestCycle(model, observer, groups, isJSONGraph,
                                isProgressive, count + 1);
            }
        });

    // Sets the current disposable as the requestDisposable.
    disposable.currentDisposable = requestDisposable;

    return disposable;
};

function getJSONGraph(model, optimizedPaths) {
    var boundPath = model._path;
    var envelope = {};
    model._path = emptyArray;
    model._getPathValuesAsJSONG(model._materialize().withoutDataSource(), optimizedPaths, [envelope]);
    model._path = boundPath;

    return envelope;
}

function subscribeToFollowupGet(model, observer, requestedPaths, isJSONGraph,
                               isProgressive) {

    // Creates a new response and subscribes to it with the original observer.
    // Also sets forceCollect to true, incase the operation is synchronous and
    // exceeds the cache limit size
    var response = new GetResponse(model, requestedPaths, isJSONGraph,
                                   isProgressive, true);
    return response.subscribe(observer);
}

},{"11":11,"12":12,"23":23,"49":49,"54":54,"62":62}],64:[function(require,module,exports){
module.exports = {
    pathValue: true,
    pathSyntax: true,
    json: true,
    jsonGraph: true
};


},{}],65:[function(require,module,exports){
var asap = require(121);
var empty = {dispose: function() {}};

function ASAPScheduler() {}

ASAPScheduler.prototype.schedule = function schedule(action) {
    asap(action);
    return empty;
};

ASAPScheduler.prototype.scheduleWithState = function scheduleWithState(state, action) {
    var self = this;
    asap(function() {
        action(self, state);
    });
    return empty;
};

module.exports = ASAPScheduler;

},{"121":121}],66:[function(require,module,exports){
var empty = {dispose: function() {}};

function ImmediateScheduler() {}

ImmediateScheduler.prototype.schedule = function schedule(action) {
    action();
    return empty;
};

ImmediateScheduler.prototype.scheduleWithState = function scheduleWithState(state, action) {
    action(this, state);
    return empty;
};

module.exports = ImmediateScheduler;

},{}],67:[function(require,module,exports){
function TimeoutScheduler(delay) {
    this.delay = delay;
}

var TimerDisposable = function TimerDisposable(id) {
    this.id = id;
    this.disposed = false;
};

TimeoutScheduler.prototype.schedule = function schedule(action) {
    var id = setTimeout(action, this.delay);
    return new TimerDisposable(id);
};

TimeoutScheduler.prototype.scheduleWithState = function scheduleWithState(state, action) {
    var self = this;
    var id = setTimeout(function() {
        action(self, state);
    }, this.delay);
    return new TimerDisposable(id);
};

TimerDisposable.prototype.dispose = function() {
    if (this.disposed) {
        return;
    }

    clearTimeout(this.id);
    this.disposed = true;
};

module.exports = TimeoutScheduler;

},{}],68:[function(require,module,exports){
var createHardlink = require(79);
var $ref = require(116);

var isExpired = require(89);
var isFunction = require(91);
var isPrimitive = require(97);
var expireNode = require(81);
var iterateKeySet = require(144).iterateKeySet;
var incrementVersion = require(87);
var mergeJSONGraphNode = require(98);
var NullInPathError = require(13);

/**
 * Merges a list of {@link JSONGraphEnvelope}s into a {@link JSONGraph}.
 * @function
 * @param {Object} model - the Model for which to merge the {@link JSONGraphEnvelope}s.
 * @param {Array.<PathValue>} jsonGraphEnvelopes - the {@link JSONGraphEnvelope}s to merge.
 * @return {Array.<Array.<Path>>} - an Array of Arrays where each inner Array is a list of requested and optimized paths (respectively) for the successfully set values.
 */

module.exports = function setJSONGraphs(model, jsonGraphEnvelopes, x, errorSelector, comparator, replacedPaths) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = incrementVersion();
    var cache = modelRoot.cache;
    var initialVersion = cache.$_version;

    var requestedPath = [];
    var optimizedPath = [];
    var requestedPaths = [];
    var optimizedPaths = [];
    var jsonGraphEnvelopeIndex = -1;
    var jsonGraphEnvelopeCount = jsonGraphEnvelopes.length;

    while (++jsonGraphEnvelopeIndex < jsonGraphEnvelopeCount) {

        var jsonGraphEnvelope = jsonGraphEnvelopes[jsonGraphEnvelopeIndex];
        var paths = jsonGraphEnvelope.paths;
        var jsonGraph = jsonGraphEnvelope.jsonGraph;

        var pathIndex = -1;
        var pathCount = paths.length;

        while (++pathIndex < pathCount) {

            var path = paths[pathIndex];
            optimizedPath.index = 0;

            setJSONGraphPathSet(
                path, 0,
                cache, cache, cache,
                jsonGraph, jsonGraph, jsonGraph,
                requestedPaths, optimizedPaths, requestedPath, optimizedPath,
                version, expired, lru, comparator, errorSelector, replacedPaths
            );
        }
    }

    var newVersion = cache.$_version;
    var rootChangeHandler = modelRoot.onChange;

    if (isFunction(rootChangeHandler) && initialVersion !== newVersion) {
        rootChangeHandler();
    }

    return [requestedPaths, optimizedPaths];
};

/* eslint-disable no-constant-condition */
function setJSONGraphPathSet(
    path, depth, root, parent, node,
    messageRoot, messageParent, message,
    requestedPaths, optimizedPaths, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, replacedPaths) {

    var note = {};
    var branch = depth < path.length - 1;
    var keySet = path[depth];
    var key = iterateKeySet(keySet, note);
    var optimizedIndex = optimizedPath.index;

    do {

        requestedPath.depth = depth;

        var results = setNode(
            root, parent, node, messageRoot, messageParent, message,
            key, branch, false, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector, replacedPaths
        );

        requestedPath[depth] = key;
        requestedPath.index = depth;
        optimizedPath[optimizedPath.index++] = key;
        var nextNode = results[0];
        var nextParent = results[1];
        if (nextNode) {
            if (branch) {
                setJSONGraphPathSet(
                    path, depth + 1, root, nextParent, nextNode,
                    messageRoot, results[3], results[2],
                    requestedPaths, optimizedPaths, requestedPath, optimizedPath,
                    version, expired, lru, comparator, errorSelector, replacedPaths
                );
            } else {
                requestedPaths.push(requestedPath.slice(0, requestedPath.index + 1));
                optimizedPaths.push(optimizedPath.slice(0, optimizedPath.index));
            }
        }
        key = iterateKeySet(keySet, note);
        if (note.done) {
            break;
        }
        optimizedPath.index = optimizedIndex;
    } while (true);
}
/* eslint-enable */

function setReference(
    root, node, messageRoot, message, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, replacedPaths) {

    var reference = node.value;
    optimizedPath.splice(0, optimizedPath.length);
    optimizedPath.push.apply(optimizedPath, reference);

    if (isExpired(node)) {
        optimizedPath.index = reference.length;
        expireNode(node, expired, lru);
        return [undefined, root, message, messageRoot];
    }

    var index = 0;
    var container = node;
    var count = reference.length - 1;
    var parent = node = root;
    var messageParent = message = messageRoot;

    do {
        var key = reference[index];
        var branch = index < count;
        optimizedPath.index = index;

        var results = setNode(
            root, parent, node, messageRoot, messageParent, message,
            key, branch, true, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector, replacedPaths
        );
        node = results[0];
        if (isPrimitive(node)) {
            optimizedPath.index = index;
            return results;
        }
        parent = results[1];
        message = results[2];
        messageParent = results[3];
    } while (index++ < count);

    optimizedPath.index = index;

    if (container.$_context !== node) {
        createHardlink(container, node);
    }

    return [node, parent, message, messageParent];
}

function setNode(
    root, parent, node, messageRoot, messageParent, message,
    key, branch, reference, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, replacedPaths) {

    var type = node.$type;

    while (type === $ref) {

        var results = setReference(
            root, node, messageRoot, message, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector, replacedPaths
        );

        node = results[0];

        if (isPrimitive(node)) {
            return results;
        }

        parent = results[1];
        message = results[2];
        messageParent = results[3];
        type = node.$type;
    }

    if (type !== void 0) {
        return [node, parent, message, messageParent];
    }

    if (key == null) {
        if (branch) {
            throw new NullInPathError();
        } else if (node) {
            key = node.$_key;
        }
    } else {
        parent = node;
        messageParent = message;
        node = parent[key];
        message = messageParent && messageParent[key];
    }

    node = mergeJSONGraphNode(
        parent, node, message, key, requestedPath, optimizedPath,
        version, expired, lru, comparator, errorSelector, replacedPaths
    );

    return [node, parent, message, messageParent];
}

},{"116":116,"13":13,"144":144,"79":79,"81":81,"87":87,"89":89,"91":91,"97":97,"98":98}],69:[function(require,module,exports){
var createHardlink = require(79);
var __prefix = require(37);
var $ref = require(116);

var getBoundValue = require(17);

var isArray = Array.isArray;
var hasOwn = require(86);
var isObject = require(95);
var isExpired = require(90);
var isFunction = require(91);
var isPrimitive = require(97);
var expireNode = require(81);
var incrementVersion = require(87);
var mergeValueOrInsertBranch = require(99);
var NullInPathError = require(13);

/**
 * Sets a list of {@link PathMapEnvelope}s into a {@link JSONGraph}.
 * @function
 * @param {Object} model - the Model for which to insert the PathMaps.
 * @param {Array.<PathMapEnvelope>} pathMapEnvelopes - the a list of {@link PathMapEnvelope}s to set.
 * @return {Array.<Array.<Path>>} - an Array of Arrays where each inner Array is a list of requested and optimized paths (respectively) for the successfully set values.
 */

module.exports = function setPathMaps(model, pathMapEnvelopes, x, errorSelector, comparator) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = incrementVersion();
    var bound = model._path;
    var cache = modelRoot.cache;
    var node = bound.length ? getBoundValue(model, bound).value : cache;
    var parent = node.$_parent || cache;
    var initialVersion = cache.$_version;

    var requestedPath = [];
    var requestedPaths = [];
    var optimizedPaths = [];
    var optimizedIndex = bound.length;
    var pathMapIndex = -1;
    var pathMapCount = pathMapEnvelopes.length;

    while (++pathMapIndex < pathMapCount) {

        var pathMapEnvelope = pathMapEnvelopes[pathMapIndex];
        var optimizedPath = bound.slice(0);
        optimizedPath.index = optimizedIndex;

        setPathMap(
            pathMapEnvelope.json, 0, cache, parent, node,
            requestedPaths, optimizedPaths, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector
        );
    }

    var newVersion = cache.$_version;
    var rootChangeHandler = modelRoot.onChange;

    if (isFunction(rootChangeHandler) && initialVersion !== newVersion) {
        rootChangeHandler();
    }

    return [requestedPaths, optimizedPaths];
};

/* eslint-disable no-constant-condition */
function setPathMap(
    pathMap, depth, root, parent, node,
    requestedPaths, optimizedPaths, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector) {

    var keys = getKeys(pathMap);

    if (keys && keys.length) {

        var keyIndex = 0;
        var keyCount = keys.length;
        var optimizedIndex = optimizedPath.index;

        do {
            var key = keys[keyIndex];
            var child = pathMap[key];
            var branch = isObject(child) && !child.$type;

            requestedPath.depth = depth;

            var results = setNode(
                root, parent, node, key, child,
                branch, false, requestedPath, optimizedPath,
                version, expired, lru, comparator, errorSelector
            );

            requestedPath[depth] = key;
            requestedPath.index = depth;

            optimizedPath[optimizedPath.index++] = key;
            var nextNode = results[0];
            var nextParent = results[1];
            if (nextNode) {
                if (branch) {
                    setPathMap(
                        child, depth + 1,
                        root, nextParent, nextNode,
                        requestedPaths, optimizedPaths, requestedPath, optimizedPath,
                        version, expired, lru, comparator, errorSelector
                    );
                } else {
                    requestedPaths.push(requestedPath.slice(0, requestedPath.index + 1));
                    optimizedPaths.push(optimizedPath.slice(0, optimizedPath.index));
                }
            }
            if (++keyIndex >= keyCount) {
                break;
            }
            optimizedPath.index = optimizedIndex;
        } while (true);
    }
}
/* eslint-enable */

function setReference(
    value, root, node, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector) {

    var reference = node.value;
    optimizedPath.splice(0, optimizedPath.length);
    optimizedPath.push.apply(optimizedPath, reference);

    if (isExpired(node)) {
        optimizedPath.index = reference.length;
        expireNode(node, expired, lru);
        return [undefined, root];
    }

    var container = node;
    var parent = root;

    node = node.$_context;

    if (node != null) {
        parent = node.$_parent || root;
        optimizedPath.index = reference.length;
    } else {

        var index = 0;
        var count = reference.length - 1;
        optimizedPath.index = index;

        parent = node = root;

        do {
            var key = reference[index];
            var branch = index < count;
            var results = setNode(
                root, parent, node, key, value,
                branch, true, requestedPath, optimizedPath,
                version, expired, lru, comparator, errorSelector
            );
            node = results[0];
            if (isPrimitive(node)) {
                optimizedPath.index = index;
                return results;
            }
            parent = results[1];
        } while (index++ < count);

        optimizedPath.index = index;

        if (container.$_context !== node) {
            createHardlink(container, node);
        }
    }

    return [node, parent];
}

function setNode(
    root, parent, node, key, value,
    branch, reference, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector) {

    var type = node.$type;

    while (type === $ref) {

        var results = setReference(
            value, root, node, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector);

        node = results[0];

        if (isPrimitive(node)) {
            return results;
        }

        parent = results[1];
        type = node && node.$type;
    }

    if (type !== void 0) {
        return [node, parent];
    }

    if (key == null) {
        if (branch) {
            throw new NullInPathError();
        } else if (node) {
            key = node.$_key;
        }
    } else {
        parent = node;
        node = parent[key];
    }

    node = mergeValueOrInsertBranch(
        parent, node, key, value,
        branch, reference, requestedPath, optimizedPath,
        version, expired, lru, comparator, errorSelector
    );

    return [node, parent];
}

function getKeys(pathMap) {

    if (isObject(pathMap) && !pathMap.$type) {
        var keys = [];
        var itr = 0;
        if (isArray(pathMap)) {
            keys[itr++] = "length";
        }
        for (var key in pathMap) {
            if (key[0] === __prefix || !hasOwn(pathMap, key)) {
                continue;
            }
            keys[itr++] = key;
        }
        return keys;
    }

    return void 0;
}

},{"116":116,"13":13,"17":17,"37":37,"79":79,"81":81,"86":86,"87":87,"90":90,"91":91,"95":95,"97":97,"99":99}],70:[function(require,module,exports){
var createHardlink = require(79);
var $ref = require(116);

var getBoundValue = require(17);

var isExpired = require(90);
var isFunction = require(91);
var isPrimitive = require(97);
var expireNode = require(81);
var iterateKeySet = require(144).iterateKeySet;
var incrementVersion = require(87);
var mergeValueOrInsertBranch = require(99);
var NullInPathError = require(13);

/**
 * Sets a list of {@link PathValue}s into a {@link JSONGraph}.
 * @function
 * @param {Object} model - the Model for which to insert the {@link PathValue}s.
 * @param {Array.<PathValue>} pathValues - the list of {@link PathValue}s to set.
 * @return {Array.<Array.<Path>>} - an Array of Arrays where each inner Array is a list of requested and optimized paths (respectively) for the successfully set values.
 */

module.exports = function setPathValues(model, pathValues, x, errorSelector, comparator) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = incrementVersion();
    var bound = model._path;
    var cache = modelRoot.cache;
    var node = bound.length ? getBoundValue(model, bound).value : cache;
    var parent = node.$_parent || cache;
    var initialVersion = cache.$_version;

    var requestedPath = [];
    var requestedPaths = [];
    var optimizedPaths = [];
    var optimizedIndex = bound.length;
    var pathValueIndex = -1;
    var pathValueCount = pathValues.length;

    while (++pathValueIndex < pathValueCount) {

        var pathValue = pathValues[pathValueIndex];
        var path = pathValue.path;
        var value = pathValue.value;
        var optimizedPath = bound.slice(0);
        optimizedPath.index = optimizedIndex;

        setPathSet(
            value, path, 0, cache, parent, node,
            requestedPaths, optimizedPaths, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector
        );
    }

    var newVersion = cache.$_version;
    var rootChangeHandler = modelRoot.onChange;

    if (isFunction(rootChangeHandler) && initialVersion !== newVersion) {
        rootChangeHandler();
    }

    return [requestedPaths, optimizedPaths];
};

/* eslint-disable no-constant-condition */
function setPathSet(
    value, path, depth, root, parent, node,
    requestedPaths, optimizedPaths, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, replacedPaths) {

    var note = {};
    var branch = depth < path.length - 1;
    var keySet = path[depth];
    var key = iterateKeySet(keySet, note);
    var optimizedIndex = optimizedPath.index;

    do {

        requestedPath.depth = depth;

        var results = setNode(
            root, parent, node, key, value,
            branch, false, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector, replacedPaths
        );
        requestedPath[depth] = key;
        requestedPath.index = depth;
        optimizedPath[optimizedPath.index++] = key;
        var nextNode = results[0];
        var nextParent = results[1];
        if (nextNode) {
            if (branch) {
                setPathSet(
                    value, path, depth + 1,
                    root, nextParent, nextNode,
                    requestedPaths, optimizedPaths, requestedPath, optimizedPath,
                    version, expired, lru, comparator, errorSelector
                );
            } else {
                requestedPaths.push(requestedPath.slice(0, requestedPath.index + 1));
                optimizedPaths.push(optimizedPath.slice(0, optimizedPath.index));
            }
        }
        key = iterateKeySet(keySet, note);
        if (note.done) {
            break;
        }
        optimizedPath.index = optimizedIndex;
    } while (true);
}
/* eslint-enable */

function setReference(
    value, root, node, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, replacedPaths) {

    var reference = node.value;
    optimizedPath.splice(0, optimizedPath.length);
    optimizedPath.push.apply(optimizedPath, reference);

    if (isExpired(node)) {
        optimizedPath.index = reference.length;
        expireNode(node, expired, lru);
        return [undefined, root];
    }

    var container = node;
    var parent = root;

    node = node.$_context;

    if (node != null) {
        parent = node.$_parent || root;
        optimizedPath.index = reference.length;
    } else {

        var index = 0;
        var count = reference.length - 1;

        parent = node = root;

        do {
            var key = reference[index];
            var branch = index < count;
            optimizedPath.index = index;

            var results = setNode(
                root, parent, node, key, value,
                branch, true, requestedPath, optimizedPath,
                version, expired, lru, comparator, errorSelector, replacedPaths
            );
            node = results[0];
            if (isPrimitive(node)) {
                optimizedPath.index = index;
                return results;
            }
            parent = results[1];
        } while (index++ < count);

        optimizedPath.index = index;

        if (container.$_context !== node) {
            createHardlink(container, node);
        }
    }

    return [node, parent];
}

function setNode(
    root, parent, node, key, value,
    branch, reference, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, replacedPaths) {

    var type = node.$type;

    while (type === $ref) {

        var results = setReference(
            value, root, node, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector, replacedPaths
        );

        node = results[0];

        if (isPrimitive(node)) {
            return results;
        }

        parent = results[1];
        type = node.$type;
    }

    if (branch && type !== void 0) {
        return [node, parent];
    }

    if (key == null) {
        if (branch) {
            throw new NullInPathError();
        } else if (node) {
            key = node.$_key;
        }
    } else {
        parent = node;
        node = parent[key];
    }

    node = mergeValueOrInsertBranch(
        parent, node, key, value,
        branch, reference, requestedPath, optimizedPath,
        version, expired, lru, comparator, errorSelector, replacedPaths
    );

    return [node, parent];
}

},{"116":116,"13":13,"144":144,"17":17,"79":79,"81":81,"87":87,"90":90,"91":91,"97":97,"99":99}],71:[function(require,module,exports){
var jsong = require(128);
var ModelResponse = require(52);
var isPathValue = require(96);

module.exports = function setValue(pathArg, valueArg) {
    var value = isPathValue(pathArg) ? pathArg : jsong.pathValue(pathArg, valueArg);
    var pathIdx = 0;
    var path = value.path;
    var pathLen = path.length;
    while (++pathIdx < pathLen) {
        if (typeof path[pathIdx] === "object") {
            /* eslint-disable no-loop-func */
            return new ModelResponse(function(o) {
                o.onError(new Error("Paths must be simple paths"));
            });
            /* eslint-enable no-loop-func */
        }
    }
    var self = this;
    return new ModelResponse(function(obs) {
        return self.set(value).subscribe(function(data) {
            var curr = data.json;
            var depth = -1;
            var length = path.length;

            while (curr && ++depth < length) {
                curr = curr[path[depth]];
            }
            obs.onNext(curr);
        }, function(err) {
            obs.onError(err);
        }, function() {
            obs.onCompleted();
        });
    });
};

},{"128":128,"52":52,"96":96}],72:[function(require,module,exports){
var pathSyntax = require(132);
var isPathValue = require(96);
var setPathValues = require(70);

module.exports = function setValueSync(pathArg, valueArg, errorSelectorArg, comparatorArg) {

    var path = pathSyntax.fromPath(pathArg);
    var value = valueArg;
    var errorSelector = errorSelectorArg;
    // XXX comparator is never used.
    var comparator = comparatorArg;

    if (isPathValue(path)) {
        comparator = errorSelector;
        errorSelector = value;
        value = path;
    } else {
        value = {
            path: path,
            value: value
        };
    }

    if (isPathValue(value) === false) {
        throw new Error("Model#setValueSync must be called with an Array path.");
    }

    if (typeof errorSelector !== "function") {
        errorSelector = this._root._errorSelector;
    }

    if (typeof comparator !== "function") {
        comparator = this._root._comparator;
    }

    this._syncCheck("setValueSync");
    setPathValues(this, [value]);
    return this._getValueSync(value.path);
};

},{"132":132,"70":70,"96":96}],73:[function(require,module,exports){
module.exports = function arrayClone(array) {
    if (!array) {
        return array;
    }
    var i = -1;
    var n = array.length;
    var array2 = [];
    while (++i < n) {
        array2[i] = array[i];
    }
    return array2;
};

},{}],74:[function(require,module,exports){
module.exports = function arrayConcat(array, other) {
    if (!array) {
        return other;
    }
    var i = -1,
        j = -1;
    var n = array.length;
    var m = other.length;
    var array2 = new Array(n + m);
    while (++i < n) {
        array2[i] = array[i];
    }
    while (++j < m) {
        array2[i++] = other[j];
    }
    return array2;
};

},{}],75:[function(require,module,exports){
module.exports = function arrayFlatMap(array, selector) {
    var index = -1;
    var i = -1;
    var n = array.length;
    var array2 = [];
    while (++i < n) {
        var array3 = selector(array[i], i, array);
        var j = -1;
        var k = array3.length;
        while (++j < k) {
            array2[++index] = array3[j];
        }
    }
    return array2;
};

},{}],76:[function(require,module,exports){
module.exports = function arrayMap(array, selector) {
    var i = -1;
    var n = array.length;
    var array2 = new Array(n);
    while (++i < n) {
        array2[i] = selector(array[i], i, array);
    }
    return array2;
};

},{}],77:[function(require,module,exports){
module.exports = function arraySlice(array, indexArg, endArg) {
    var index = indexArg || 0;
    var i = -1;
    var n = array.length - index;

    if (n < 0) {
        n = 0;
    }

    if (endArg > 0 && n > endArg) {
        n = endArg;
    }

    var array2 = new Array(n);
    while (++i < n) {
        array2[i] = array[i + index];
    }
    return array2;
};

},{}],78:[function(require,module,exports){
var privatePrefix = require(35);
var hasOwn = require(86);
var isArray = Array.isArray;
var isObject = require(95);

module.exports = function clone(value) {
    var dest = value;
    if (isObject(dest)) {
        dest = isArray(value) ? [] : {};
        var src = value;
        for (var key in src) {
            if (key.substr(0, 2) === privatePrefix || !hasOwn(src, key)) {
                continue;
            }
            dest[key] = src[key];
        }
    }
    return dest;
};

},{"35":35,"86":86,"95":95}],79:[function(require,module,exports){
var __ref = require(36);

module.exports = function createHardlink(from, to) {

    // create a back reference
    // eslint-disable-next-line camelcase
    var backRefs = to.$_refsLength || 0;
    to[__ref + backRefs] = from;
    // eslint-disable-next-line camelcase
    to.$_refsLength = backRefs + 1;

    // create a hard reference
    // eslint-disable-next-line camelcase
    from.$_refIndex = backRefs;
    // eslint-disable-next-line camelcase
    from.$_context = to;
};

},{"36":36}],80:[function(require,module,exports){
var version = null;
exports.setVersion = function setCacheVersion(newVersion) {
    version = newVersion;
};
exports.getVersion = function getCacheVersion() {
    return version;
};


},{}],81:[function(require,module,exports){
var splice = require(42);

module.exports = function expireNode(node, expired, lru) {
    // eslint-disable-next-line camelcase
    if (!node.$_invalidated) {
        // eslint-disable-next-line camelcase
        node.$_invalidated = true;
        expired.push(node);
        splice(lru, node);
    }
    return node;
};

},{"42":42}],82:[function(require,module,exports){
var isObject = require(95);
module.exports = function getSize(node) {
    return isObject(node) && node.$expires || undefined;
};

},{"95":95}],83:[function(require,module,exports){
var isObject = require(95);
module.exports = function getSize(node) {
    return isObject(node) && node.$size || 0;
};

},{"95":95}],84:[function(require,module,exports){
var isObject = require(95);
module.exports = function getTimestamp(node) {
    return isObject(node) && node.$timestamp || undefined;
};

},{"95":95}],85:[function(require,module,exports){
var isObject = require(95);

module.exports = function getType(node, anyType) {
    var type = isObject(node) && node.$type || void 0;
    if (anyType && type) {
        return "branch";
    }
    return type;
};

},{"95":95}],86:[function(require,module,exports){
var isObject = require(95);
var hasOwn = Object.prototype.hasOwnProperty;

module.exports = function(obj, prop) {
  return isObject(obj) && hasOwn.call(obj, prop);
};

},{"95":95}],87:[function(require,module,exports){
var version = 1;
module.exports = function incrementVersion() {
    return version++;
};
module.exports.getCurrentVersion = function getCurrentVersion() {
    return version;
};

},{}],88:[function(require,module,exports){
module.exports = function insertNode(node, parent, key, version, optimizedPath) {
    // eslint-disable-next-line camelcase
    node.$_key = key;
    // eslint-disable-next-line camelcase
    node.$_parent = parent;

    if (version !== undefined) {
        // eslint-disable-next-line camelcase
        node.$_version = version;
    }
    // eslint-disable-next-line camelcase
    if (!node.$_absolutePath) {
        // eslint-disable-next-line camelcase
        node.$_absolutePath = optimizedPath.slice(0, optimizedPath.index).concat(key);
    }

    parent[key] = node;

    return node;
};

},{}],89:[function(require,module,exports){
var now = require(101);
var $now = require(118);
var $never = require(117);

module.exports = function isAlreadyExpired(node) {
    var exp = node.$expires;
    return (exp != null) && (
        exp !== $never) && (
        exp !== $now) && (
        exp < now());
};

},{"101":101,"117":117,"118":118}],90:[function(require,module,exports){
var now = require(101);
var $now = require(118);
var $never = require(117);

module.exports = function isExpired(node) {
    var exp = node.$expires;
    return (exp != null) && (
        exp !== $never ) && (
        exp === $now || exp < now());
};

},{"101":101,"117":117,"118":118}],91:[function(require,module,exports){
var functionTypeof = "function";

module.exports = function isFunction(func) {
    return Boolean(func) && typeof func === functionTypeof;
};

},{}],92:[function(require,module,exports){
var privatePrefix = require(35);

/**
 * Determined if the key passed in is an internal key.
 *
 * @param {String} x The key
 * @private
 * @returns {Boolean}
 */
module.exports = function isInternalKey(x) {
    return x === "$size" ||
        x.substr(0, 2) === privatePrefix;
};

},{"35":35}],93:[function(require,module,exports){
var isObject = require(95);

module.exports = function isJSONEnvelope(envelope) {
    return isObject(envelope) && ("json" in envelope);
};

},{"95":95}],94:[function(require,module,exports){
var isArray = Array.isArray;
var isObject = require(95);

module.exports = function isJSONGraphEnvelope(envelope) {
    return isObject(envelope) && isArray(envelope.paths) && (
        isObject(envelope.jsonGraph) ||
        isObject(envelope.jsong) ||
        isObject(envelope.json) ||
        isObject(envelope.values) ||
        isObject(envelope.value)
    );
};

},{"95":95}],95:[function(require,module,exports){
var objTypeof = "object";
module.exports = function isObject(value) {
    return value !== null && typeof value === objTypeof;
};

},{}],96:[function(require,module,exports){
var isArray = Array.isArray;
var isObject = require(95);

module.exports = function isPathValue(pathValue) {
    return isObject(pathValue) && (
        isArray(pathValue.path) || (
            typeof pathValue.path === "string"
        ));
};

},{"95":95}],97:[function(require,module,exports){
var objTypeof = "object";
module.exports = function isPrimitive(value) {
    return value == null || typeof value !== objTypeof;
};

},{}],98:[function(require,module,exports){
var $ref = require(116);
var $error = require(115);
var getSize = require(83);
var getTimestamp = require(84);
var isObject = require(95);
var isExpired = require(90);
var isFunction = require(91);

var wrapNode = require(112);
var insertNode = require(88);
var expireNode = require(81);
var replaceNode = require(105);
var updateNodeAncestors = require(110);
var reconstructPath = require(102);

module.exports = function mergeJSONGraphNode(
    parent, node, message, key, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, replacedPaths) {

    var sizeOffset;

    var cType, mType,
        cIsObject, mIsObject,
        cTimestamp, mTimestamp;

    var nodeValue = node && node.value !== undefined ? node.value : node;

    // If the cache and message are the same, we can probably return early:
    // - If they're both nullsy,
    //   - If null then the node needs to be wrapped in an atom and inserted.
    //     This happens from whole branch merging when a leaf is just a null value
    //     instead of being wrapped in an atom.
    //   - If undefined then return null (previous behavior).
    // - If they're both branches, return the branch.
    // - If they're both edges, continue below.
    if (nodeValue === message) {
        // There should not be undefined values.  Those should always be
        // wrapped in an $atom
        if (message === null) {
            node = wrapNode(message, undefined, message);
            parent = updateNodeAncestors(parent, -node.$size, lru, version);
            node = insertNode(node, parent, key, undefined, optimizedPath);
            return node;
        }

        // The messange and cache are both undefined, therefore return null.
        else if (message === undefined) {
            return message;
        }

        else {
            cIsObject = isObject(node);
            if (cIsObject) {
                // Is the cache node a branch? If so, return the cache branch.
                cType = node.$type;
                if (cType == null) {
                    // Has the branch been introduced to the cache yet? If not,
                    // give it a parent, key, and absolute path.
                    if (node.$_parent == null) {
                        insertNode(node, parent, key, version, optimizedPath);
                    }
                    return node;
                }
            }
        }
    } else {
        cIsObject = isObject(node);
        if (cIsObject) {
            cType = node.$type;
        }
    }

    // If the cache isn't a reference, we might be able to return early.
    if (cType !== $ref) {
        mIsObject = isObject(message);
        if (mIsObject) {
            mType = message.$type;
        }
        if (cIsObject && !cType) {
            // If the cache is a branch and the message is empty or
            // also a branch, continue with the cache branch.
            if (message == null || (mIsObject && !mType)) {
                return node;
            }
        }
    }
    // If the cache is a reference, we might not need to replace it.
    else {
        // If the cache is a reference, but the message is empty, leave the cache alone...
        if (message == null) {
            // ...unless the cache is an expired reference. In that case, expire
            // the cache node and return undefined.
            if (isExpired(node)) {
                expireNode(node, expired, lru);
                return void 0;
            }
            return node;
        }
        mIsObject = isObject(message);
        if (mIsObject) {
            mType = message.$type;
            // If the cache and the message are both references,
            // check if we need to replace the cache reference.
            if (mType === $ref) {
                if (node === message) {
                    // If the cache and message are the same reference,
                    // we performed a whole-branch merge of one of the
                    // grandparents. If we've previously graphed this
                    // reference, break early. Otherwise, continue to
                    // leaf insertion below.
                    if (node.$_parent != null) {
                        return node;
                    }
                } else {

                    cTimestamp = node.$timestamp;
                    mTimestamp = message.$timestamp;

                    // - If either the cache or message reference is expired,
                    //   replace the cache reference with the message.
                    // - If neither of the references are expired, compare their
                    //   timestamps. If either of them don't have a timestamp,
                    //   or the message's timestamp is newer, replace the cache
                    //   reference with the message reference.
                    // - If the message reference is older than the cache
                    //   reference, short-circuit.
                    if (!isExpired(node) && !isExpired(message) && mTimestamp < cTimestamp) {
                        return void 0;
                    }
                }
            }
        }
    }

    // If the cache is a leaf but the message is a branch, merge the branch over the leaf.
    if (cType && mIsObject && !mType) {
        return insertNode(replaceNode(node, message, parent, key, lru, replacedPaths), parent, key, undefined, optimizedPath);
    }
    // If the message is a sentinel or primitive, insert it into the cache.
    else if (mType || !mIsObject) {
        // If the cache and the message are the same value, we branch-merged one
        // of the message's ancestors. If this is the first time we've seen this
        // leaf, give the message a $size and $type, attach its graph pointers,
        // and update the cache sizes and versions.

        if (mType === $error && isFunction(errorSelector)) {
            message = errorSelector(reconstructPath(requestedPath, key), message);
            mType = message.$type || mType;
        }

        if (mType && node === message) {
            if (node.$_parent == null) {
                node = wrapNode(node, mType, node.value);
                parent = updateNodeAncestors(parent, -node.$size, lru, version);
                node = insertNode(node, parent, key, version, optimizedPath);
            }
        }
        // If the cache and message are different, the cache value is expired,
        // or the message is a primitive, replace the cache with the message value.
        // If the message is a sentinel, clone and maintain its type.
        // If the message is a primitive value, wrap it in an atom.
        else {
            var isDistinct = true;
            // If the cache is a branch, but the message is a leaf, replace the
            // cache branch with the message leaf.
            if ((cType && !isExpired(node)) || !cIsObject) {
                // Compare the current cache value with the new value. If either of
                // them don't have a timestamp, or the message's timestamp is newer,
                // replace the cache value with the message value. If a comparator
                // is specified, the comparator takes precedence over timestamps.
                //
                // Comparing either Number or undefined to undefined always results in false.
                isDistinct = (getTimestamp(message) < getTimestamp(node)) === false;

                // If at least one of the cache/message are sentinels, compare them.
                if (isDistinct && (cType || mType) && isFunction(comparator)) {
                    isDistinct = !comparator(nodeValue, message, optimizedPath.slice(0, optimizedPath.index));
                }
            }
            if (isDistinct) {
                message = wrapNode(message, mType, mType ? message.value : message);
                sizeOffset = getSize(node) - getSize(message);
                node = replaceNode(node, message, parent, key, lru, replacedPaths);
                parent = updateNodeAncestors(parent, sizeOffset, lru, version);
                node = insertNode(node, parent, key, version, optimizedPath);
            }
        }

        // Promote the message edge in the LRU.
        if (isExpired(node)) {
            expireNode(node, expired, lru);
        }
    }
    else if (node == null) {
        node = insertNode({}, parent, key, undefined, optimizedPath);
    }

    return node;
};

},{"102":102,"105":105,"110":110,"112":112,"115":115,"116":116,"81":81,"83":83,"84":84,"88":88,"90":90,"91":91,"95":95}],99:[function(require,module,exports){
var $ref = require(116);
var $error = require(115);
var getType = require(85);
var getSize = require(83);
var getTimestamp = require(84);

var isExpired = require(90);
var isPrimitive = require(97);
var isFunction = require(91);

var wrapNode = require(112);
var expireNode = require(81);
var insertNode = require(88);
var replaceNode = require(105);
var updateNodeAncestors = require(110);
var updateBackReferenceVersions = require(109);
var reconstructPath = require(102);

module.exports = function mergeValueOrInsertBranch(
    parent, node, key, value,
    branch, reference, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, replacedPaths) {

    var type = getType(node, reference);

    if (branch || reference) {
        if (type && isExpired(node)) {
            type = "expired";
            expireNode(node, expired, lru);
        }
        if ((type && type !== $ref) || isPrimitive(node)) {
            node = replaceNode(node, {}, parent, key, lru, replacedPaths);
            node = insertNode(node, parent, key, version, optimizedPath);
            node = updateBackReferenceVersions(node, version);
        }
    } else {
        var message = value;
        var mType = getType(message);
        // Compare the current cache value with the new value. If either of
        // them don't have a timestamp, or the message's timestamp is newer,
        // replace the cache value with the message value. If a comparator
        // is specified, the comparator takes precedence over timestamps.
        //
        // Comparing either Number or undefined to undefined always results in false.
        var isDistinct = (getTimestamp(message) < getTimestamp(node)) === false;
        // If at least one of the cache/message are sentinels, compare them.
        if ((type || mType) && isFunction(comparator)) {
            isDistinct = !comparator(node, message, optimizedPath.slice(0, optimizedPath.index));
        }
        if (isDistinct) {

            if (mType === $error && isFunction(errorSelector)) {
                message = errorSelector(reconstructPath(requestedPath, key), message);
                mType = message.$type || mType;
            }

            message = wrapNode(message, mType, mType ? message.value : message);

            var sizeOffset = getSize(node) - getSize(message);

            node = replaceNode(node, message, parent, key, lru, replacedPaths);
            parent = updateNodeAncestors(parent, sizeOffset, lru, version);
            node = insertNode(node, parent, key, version, optimizedPath);
        }
    }

    return node;
};

},{"102":102,"105":105,"109":109,"110":110,"112":112,"115":115,"116":116,"81":81,"83":83,"84":84,"85":85,"88":88,"90":90,"91":91,"97":97}],100:[function(require,module,exports){
module.exports = function noop() {};

},{}],101:[function(require,module,exports){
module.exports = Date.now;

},{}],102:[function(require,module,exports){
/**
 * Reconstructs the path for the current key, from currentPath (requestedPath)
 * state maintained during set/merge walk operations.
 *
 * During the walk, since the requestedPath array is updated after we attempt to
 * merge/insert nodes during a walk (it reflects the inserted node's parent branch)
 * we need to reconstitute a path from it.
 *
 * @param  {Array} currentPath The current requestedPath state, during the walk
 * @param  {String} key        The current key value, during the walk
 * @return {Array} A new array, with the path which represents the node we're about
 * to insert
 */
module.exports = function reconstructPath(currentPath, key) {

    var path = currentPath.slice(0, currentPath.depth);
    path[path.length] = key;

    return path;
};

},{}],103:[function(require,module,exports){
var $ref = require(116);
var splice = require(42);
var isObject = require(95);
var unlinkBackReferences = require(107);
var unlinkForwardReference = require(108);

module.exports = function removeNode(node, parent, key, lru) {
    if (isObject(node)) {
        var type = node.$type;
        if (type) {
            if (type === $ref) {
                unlinkForwardReference(node);
            }
            splice(lru, node);
        }
        unlinkBackReferences(node);
        // eslint-disable-next-line camelcase
        parent[key] = node.$_parent = void 0;
        return true;
    }
    return false;
};

},{"107":107,"108":108,"116":116,"42":42,"95":95}],104:[function(require,module,exports){
var hasOwn = require(86);
var prefix = require(37);
var removeNode = require(103);

module.exports = function removeNodeAndDescendants(node, parent, key, lru, mergeContext) {
    if (removeNode(node, parent, key, lru)) {
        if (node.$type !== undefined && mergeContext && node.$_absolutePath) {
            mergeContext.hasInvalidatedResult = true;
        }

        if (node.$type == null) {
            for (var key2 in node) {
                if (key2[0] !== prefix && hasOwn(node, key2)) {
                    removeNodeAndDescendants(node[key2], node, key2, lru, mergeContext);
                }
            }
        }
        return true;
    }
    return false;
};

},{"103":103,"37":37,"86":86}],105:[function(require,module,exports){
var isObject = require(95);
var transferBackReferences = require(106);
var removeNodeAndDescendants = require(104);

module.exports = function replaceNode(node, replacement, parent, key, lru, mergeContext) {
    if (node === replacement) {
        return node;
    } else if (isObject(node)) {
        transferBackReferences(node, replacement);
        removeNodeAndDescendants(node, parent, key, lru, mergeContext);
    }

    parent[key] = replacement;
    return replacement;
};

},{"104":104,"106":106,"95":95}],106:[function(require,module,exports){
var __ref = require(36);

module.exports = function transferBackReferences(fromNode, destNode) {
    // eslint-disable-next-line camelcase
    var fromNodeRefsLength = fromNode.$_refsLength || 0,
        // eslint-disable-next-line camelcase
        destNodeRefsLength = destNode.$_refsLength || 0,
        i = -1;
    while (++i < fromNodeRefsLength) {
        var ref = fromNode[__ref + i];
        if (ref !== void 0) {
            // eslint-disable-next-line camelcase
            ref.$_context = destNode;
            destNode[__ref + (destNodeRefsLength + i)] = ref;
            fromNode[__ref + i] = void 0;
        }
    }
    // eslint-disable-next-line camelcase
    destNode.$_refsLength = fromNodeRefsLength + destNodeRefsLength;
    // eslint-disable-next-line camelcase
    fromNode.$_refsLength = void 0;
    return destNode;
};

},{"36":36}],107:[function(require,module,exports){
var __ref = require(36);

module.exports = function unlinkBackReferences(node) {
    // eslint-disable-next-line camelcase
    var i = -1, n = node.$_refsLength || 0;
    while (++i < n) {
        var ref = node[__ref + i];
        if (ref != null) {
            // eslint-disable-next-line camelcase
            ref.$_context = ref.$_refIndex = node[__ref + i] = void 0;
        }
    }
    // eslint-disable-next-line camelcase
    node.$_refsLength = void 0;
    return node;
};

},{"36":36}],108:[function(require,module,exports){
var __ref = require(36);

module.exports = function unlinkForwardReference(reference) {
    // eslint-disable-next-line camelcase
    var destination = reference.$_context;
    if (destination) {
        // eslint-disable-next-line camelcase
        var i = (reference.$_refIndex || 0) - 1,
            // eslint-disable-next-line camelcase
            n = (destination.$_refsLength || 0) - 1;
        while (++i <= n) {
            destination[__ref + i] = destination[__ref + (i + 1)];
        }
        // eslint-disable-next-line camelcase
        destination.$_refsLength = n;
        // eslint-disable-next-line camelcase
        reference.$_refIndex = reference.$_context = destination = void 0;
    }
    return reference;
};

},{"36":36}],109:[function(require,module,exports){
var __ref = require(36);

module.exports = function updateBackReferenceVersions(nodeArg, version) {
    var stack = [nodeArg];
    var count = 0;
    do {
        var node = stack[count];
        // eslint-disable-next-line camelcase
        if (node && node.$_version !== version) {
            // eslint-disable-next-line camelcase
            node.$_version = version;
            // eslint-disable-next-line camelcase
            stack[count++] = node.$_parent;
            var i = -1;
            // eslint-disable-next-line camelcase
            var n = node.$_refsLength || 0;
            while (++i < n) {
                stack[count++] = node[__ref + i];
            }
        }
    } while (--count > -1);
    return nodeArg;
};

},{"36":36}],110:[function(require,module,exports){
var removeNode = require(103);
var updateBackReferenceVersions = require(109);

module.exports = function updateNodeAncestors(nodeArg, offset, lru, version) {
    var child = nodeArg;
    do {
        var node = child.$_parent;
        var size = child.$size = (child.$size || 0) - offset;
        if (size <= 0 && node != null) {
            removeNode(child, node, child.$_key, lru);
        } else if (child.$_version !== version) {
            updateBackReferenceVersions(child, version);
        }
        child = node;
    } while (child);
    return nodeArg;
};

},{"103":103,"109":109}],111:[function(require,module,exports){
var isArray = Array.isArray;
var isPathValue = require(96);
var isJSONGraphEnvelope = require(94);
var isJSONEnvelope = require(93);
var pathSyntax = require(132);

/**
 *
 * @param {Object} allowedInput - allowedInput is a map of input styles
 * that are allowed
 * @private
 */
module.exports = function validateInput(args, allowedInput, method) {
    for (var i = 0, len = args.length; i < len; ++i) {
        var arg = args[i];
        var valid = false;

        // Path
        if (isArray(arg) && allowedInput.path) {
            valid = true;
        }

        // Path Syntax
        else if (typeof arg === "string" && allowedInput.pathSyntax) {
            valid = true;
        }

        // Path Value
        else if (isPathValue(arg) && allowedInput.pathValue) {
            arg.path = pathSyntax.fromPath(arg.path);
            valid = true;
        }

        // jsonGraph {jsonGraph: { ... }, paths: [ ... ]}
        else if (isJSONGraphEnvelope(arg) && allowedInput.jsonGraph) {
            valid = true;
        }

        // json env {json: {...}}
        else if (isJSONEnvelope(arg) && allowedInput.json) {
            valid = true;
        }

        // selector functions
        else if (typeof arg === "function" &&
                 i + 1 === len &&
                 allowedInput.selector) {
            valid = true;
        }

        if (!valid) {
            return new Error("Unrecognized argument " + (typeof arg) + " [" + String(arg) + "] " + "to Model#" + method + "");
        }
    }
    return true;
};

},{"132":132,"93":93,"94":94,"96":96}],112:[function(require,module,exports){
var now = require(101);
var expiresNow = require(118);

var atomSize = 50;

var clone = require(78);
var isArray = Array.isArray;
var getSize = require(83);
var getExpires = require(82);
var atomType = require(114);

module.exports = function wrapNode(nodeArg, typeArg, value) {

    var size = 0;
    var node = nodeArg;
    var type = typeArg;

    if (type) {
        var modelCreated = node.$_modelCreated;
        node = clone(node);
        size = getSize(node);
        node.$type = type;
        // eslint-disable-next-line camelcase
        node.$_prev = undefined;
        // eslint-disable-next-line camelcase
        node.$_next = undefined;
        // eslint-disable-next-line camelcase
        node.$_modelCreated = modelCreated || false;
    } else {
        node = {
            $type: atomType,
            value: value,
            // eslint-disable-next-line camelcase
            $_prev: undefined,
            // eslint-disable-next-line camelcase
            $_next: undefined,
            // eslint-disable-next-line camelcase
            $_modelCreated: true
        };
    }

    if (value == null) {
        size = atomSize + 1;
    } else if (size == null || size <= 0) {
        switch (typeof value) {
            case "object":
                if (isArray(value)) {
                    size = atomSize + value.length;
                } else {
                    size = atomSize + 1;
                }
                break;
            case "string":
                size = atomSize + value.length;
                break;
            default:
                size = atomSize + 1;
                break;
        }
    }

    var expires = getExpires(node);

    if (typeof expires === "number" && expires < expiresNow) {
        node.$expires = now() + (expires * -1);
    }

    node.$size = size;

    return node;
};

},{"101":101,"114":114,"118":118,"78":78,"82":82,"83":83}],113:[function(require,module,exports){
/**
 * FromEsObserverAdapter is an adpater from an ES Observer to an Rx 2 Observer
 * @constructor FromEsObserverAdapter
*/
function FromEsObserverAdapter(esObserver) {
    this.esObserver = esObserver;
}

FromEsObserverAdapter.prototype = {
    onNext: function onNext(value) {
        if (typeof this.esObserver.next === "function") {
            this.esObserver.next(value);
        }
    },
    onError: function onError(error) {
        if (typeof this.esObserver.error === "function") {
            this.esObserver.error(error);
        }
    },
    onCompleted: function onCompleted() {
        if (typeof this.esObserver.complete === "function") {
            this.esObserver.complete();
        }
    }
};

/**
 * ToEsSubscriptionAdapter is an adpater from the Rx 2 subscription to the ES subscription
 * @constructor ToEsSubscriptionAdapter
*/
function ToEsSubscriptionAdapter(subscription) {
    this.subscription = subscription;
}

ToEsSubscriptionAdapter.prototype.unsubscribe = function unsubscribe() {
    this.subscription.dispose();
};


function toEsObservable(_self) {
    return {
        subscribe: function subscribe(observer) {
            return new ToEsSubscriptionAdapter(_self.subscribe(new FromEsObserverAdapter(observer)));
        }
    };
}

module.exports = toEsObservable;

},{}],114:[function(require,module,exports){
module.exports = "atom";

},{}],115:[function(require,module,exports){
module.exports = "error";

},{}],116:[function(require,module,exports){
module.exports = "ref";

},{}],117:[function(require,module,exports){
module.exports = 1;

},{}],118:[function(require,module,exports){
module.exports = 0;

},{}],119:[function(require,module,exports){
"use strict";

// rawAsap provides everything we need except exception management.
var rawAsap = require(120);
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

},{"120":120}],120:[function(require,module,exports){
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
// Must use `global` or `self` instead of `window` to work in both frames and web
// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.

/* globals self */
var scope = typeof global !== "undefined" ? global : self;
var BrowserMutationObserver = scope.MutationObserver || scope.WebKitMutationObserver;

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
},{}],121:[function(require,module,exports){
"use strict";

// rawAsap provides everything we need except exception management.
var rawAsap = require(122);
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

},{"122":122}],122:[function(require,module,exports){
arguments[4][120][0].apply(exports,arguments)
},{"120":120}],123:[function(require,module,exports){
'use strict';
var request = require(127);
var buildQueryObject = require(124);
var isArray = Array.isArray;

function simpleExtend(obj, obj2) {
  var prop;
  for (prop in obj2) {
    obj[prop] = obj2[prop];
  }
  return obj;
}

function XMLHttpSource(jsongUrl, config) {
  this._jsongUrl = jsongUrl;
  if (typeof config === 'number') {
    var newConfig = {
      timeout: config
    };
    config = newConfig;
  }
  this._config = simpleExtend({
    timeout: 15000,
    headers: {}
  }, config || {});
}

XMLHttpSource.prototype = {
  // because javascript
  constructor: XMLHttpSource,
  /**
   * buildQueryObject helper
   */
  buildQueryObject: buildQueryObject,

  /**
   * @inheritDoc DataSource#get
   */
  get: function httpSourceGet(pathSet) {
    var method = 'POST';
    var queryObject = this.buildQueryObject(this._jsongUrl, method, {
      paths: pathSet,
      method: 'get'
    });
    var config = simpleExtend(queryObject, this._config);
    config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    
    // pass context for onBeforeRequest callback
    var context = this;
    return request(method, config, context);
  },

  /**
   * @inheritDoc DataSource#set
   */
  set: function httpSourceSet(jsongEnv) {
    var method = 'POST';
    var config, queryObject;
    if (!this._config.headers || !this._config.headers["Content-Type"] || !this._config.headers["Content-Type"].match(/application\/json/)) {
      queryObject = this.buildQueryObject(this._jsongUrl, method, {
        jsonGraph: jsongEnv,
        method: 'set'
      });
      config = simpleExtend(queryObject, this._config);
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    } else {
      config = simpleExtend({
        url: this._jsongUrl,
        data: JSON.stringify({
          jsonGraph: JSON.stringify(jsongEnv),
          method: 'set'
        })
      }, this._config);
    }
    // pass context for onBeforeRequest callback
    var context = this;
    return request(method, config, context);

  },

  /**
   * @inheritDoc DataSource#call
   */
  call: function httpSourceCall(callPath, args, pathSuffix, paths) {
    // arguments defaults
    args = args || [];
    pathSuffix = pathSuffix || [];
    paths = paths || [];

    var method = 'POST';
    var config, queryData = [], queryObject;
    if (!this._config.headers || !this._config.headers["Content-Type"] || !this._config.headers["Content-Type"].match(/application\/json/)) {
      queryData.push('method=call');
      queryData.push('callPath=' + encodeURIComponent(JSON.stringify(callPath)));
      queryData.push('arguments=' + encodeURIComponent(JSON.stringify(args)));
      queryData.push('pathSuffixes=' + encodeURIComponent(JSON.stringify(pathSuffix)));
      queryData.push('paths=' + encodeURIComponent(JSON.stringify(paths)));

      queryObject = this.buildQueryObject(this._jsongUrl, method, queryData.join('&'));
      config = simpleExtend(queryObject, this._config);
      config.headers["Content-Type"] = "application/x-www-form-urlencoded";
    } else {
      config = simpleExtend({
        url: this._jsongUrl,
        data: JSON.stringify({
          method: 'call',
          callPath: JSON.stringify(callPath),
          arguments: JSON.stringify(args),
          pathSuffixes: JSON.stringify(pathSuffix),
          paths: JSON.stringify(paths)
        })
      }, this._config);
    }
    // pass context for onBeforeRequest callback
    var context = this;
    return request(method, config, context);
  }
};
// ES6 modules
XMLHttpSource.XMLHttpSource = XMLHttpSource;
XMLHttpSource['default'] = XMLHttpSource;
// commonjs
module.exports = XMLHttpSource;

},{"124":124,"127":127}],124:[function(require,module,exports){
'use strict';
module.exports = function buildQueryObject(url, method, queryData) {
  var qData = [];
  var keys;
  var data = {url: url};
  var isQueryParamUrl = url.indexOf('?') !== -1;
  var startUrl = (isQueryParamUrl) ? '&' : '?';

  if (typeof queryData === 'string') {
    qData.push(queryData);
  } else {

    keys = Object.keys(queryData);
    keys.forEach(function (k) {
      var value = (typeof queryData[k] === 'object') ? JSON.stringify(queryData[k]) : queryData[k];
      qData.push(k + '=' + encodeURIComponent(value));
    });
  }

  if (method === 'GET') {
    data.url += startUrl + qData.join('&');
  } else {
    data.data = qData.join('&');
  }

  return data;
};

},{}],125:[function(require,module,exports){
(function (global){
'use strict';
// Get CORS support even for older IE
module.exports = function getCORSRequest() {
    var xhr = new global.XMLHttpRequest();
    if ('withCredentials' in xhr) {
        return xhr;
    } else if (!!global.XDomainRequest) {
        return new XDomainRequest();
    } else {
        throw new Error('CORS is not supported by your browser');
    }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],126:[function(require,module,exports){
(function (global){
'use strict';
module.exports = function getXMLHttpRequest() {
  var progId,
    progIds,
    i;
  if (global.XMLHttpRequest) {
    return new global.XMLHttpRequest();
  } else {
    try {
    progIds = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];
    for (i = 0; i < 3; i++) {
      try {
        progId = progIds[i];
        if (new global.ActiveXObject(progId)) {
          break;
        }
      } catch(e) { }
    }
    return new global.ActiveXObject(progId);
    } catch (e) {
    throw new Error('XMLHttpRequest is not supported by your browser');
    }
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],127:[function(require,module,exports){
'use strict';
var getXMLHttpRequest = require(126);
var getCORSRequest = require(125);
var hasOwnProp = Object.prototype.hasOwnProperty;

var noop = function() {};

function Observable() {}

Observable.create = function(subscribe) {
  var o = new Observable();

  o.subscribe = function(onNext, onError, onCompleted) {

    var observer;
    var disposable;

    if (typeof onNext === 'function') {
        observer = {
            onNext: onNext,
            onError: (onError || noop),
            onCompleted: (onCompleted || noop)
        };
    } else {
        observer = onNext;
    }

    disposable = subscribe(observer);

    if (typeof disposable === 'function') {
      return {
        dispose: disposable
      };
    } else {
      return disposable;
    }
  };

  return o;
};

function request(method, options, context) {
  return Observable.create(function requestObserver(observer) {

    var config = {
      method: method || 'GET',
      crossDomain: false,
      async: true,
      headers: {},
      responseType: 'json'
    };

    var xhr,
      isDone,
      headers,
      header,
      prop;

    for (prop in options) {
      if (hasOwnProp.call(options, prop)) {
        config[prop] = options[prop];
      }
    }

    // Add request with Headers
    if (!config.crossDomain && !config.headers['X-Requested-With']) {
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    // allow the user to mutate the config open
    if (context.onBeforeRequest != null) {
      context.onBeforeRequest(config);
    }

    // create xhr
    try {
      xhr = config.crossDomain ? getCORSRequest() : getXMLHttpRequest();
    } catch (err) {
      observer.onError(err);
    }
    try {
      // Takes the url and opens the connection
      if (config.user) {
        xhr.open(config.method, config.url, config.async, config.user, config.password);
      } else {
        xhr.open(config.method, config.url, config.async);
      }

      // Sets timeout information
      xhr.timeout = config.timeout;

      // Anything but explicit false results in true.
      xhr.withCredentials = config.withCredentials !== false;

      // Fills the request headers
      headers = config.headers;
      for (header in headers) {
        if (hasOwnProp.call(headers, header)) {
          xhr.setRequestHeader(header, headers[header]);
        }
      }

      if (config.responseType) {
        try {
          xhr.responseType = config.responseType;
        } catch (e) {
          // WebKit added support for the json responseType value on 09/03/2013
          // https://bugs.webkit.org/show_bug.cgi?id=73648. Versions of Safari prior to 7 are
          // known to throw when setting the value "json" as the response type. Other older
          // browsers implementing the responseType
          //
          // The json response type can be ignored if not supported, because JSON payloads are
          // parsed on the client-side regardless.
          if (config.responseType !== 'json') {
            throw e;
          }
        }
      }

      xhr.onreadystatechange = function onreadystatechange(e) {
        // Complete
        if (xhr.readyState === 4) {
          if (!isDone) {
            isDone = true;
            onXhrLoad(observer, xhr, e);
          }
        }
      };

      // Timeout
      xhr.ontimeout = function ontimeout(e) {
        if (!isDone) {
          isDone = true;
          onXhrError(observer, xhr, 'timeout error', e);
        }
      };

      // Send Request
      xhr.send(config.data);

    } catch (e) {
      observer.onError(e);
    }
    // Dispose
    return function dispose() {
      // Doesn't work in IE9
      if (!isDone && xhr.readyState !== 4) {
        isDone = true;
        xhr.abort();
      }
    };//Dispose
  });
}

/*
 * General handling of ultimate failure (after appropriate retries)
 */
function _handleXhrError(observer, textStatus, errorThrown) {
  // IE9: cross-domain request may be considered errors
  if (!errorThrown) {
    errorThrown = new Error(textStatus);
  }

  observer.onError(errorThrown);
}

function onXhrLoad(observer, xhr, e) {
  var responseData,
    responseObject,
    responseType;

  // If there's no observer, the request has been (or is being) cancelled.
  if (xhr && observer) {
    responseType = xhr.responseType;
    // responseText is the old-school way of retrieving response (supported by IE8 & 9)
    // response/responseType properties were introduced in XHR Level2 spec (supported by IE10)
    responseData = ('response' in xhr) ? xhr.response : xhr.responseText;

    // normalize IE9 bug (http://bugs.jquery.com/ticket/1450)
    var status = (xhr.status === 1223) ? 204 : xhr.status;

    if (status >= 200 && status <= 399) {
      try {
        if (responseType !== 'json') {
          responseData = JSON.parse(responseData || '');
        }
        if (typeof responseData === 'string') {
          responseData = JSON.parse(responseData || '');
        }
      } catch (e) {
        _handleXhrError(observer, 'invalid json', e);
      }
      observer.onNext(responseData);
      observer.onCompleted();
      return;

    } else if (status === 401 || status === 403 || status === 407) {

      return _handleXhrError(observer, responseData);

    } else if (status === 410) {
      // TODO: Retry ?
      return _handleXhrError(observer, responseData);

    } else if (status === 408 || status === 504) {
      // TODO: Retry ?
      return _handleXhrError(observer, responseData);

    } else {

      return _handleXhrError(observer, responseData || ('Response code ' + status));

    }//if
  }//if
}//onXhrLoad

function onXhrError(observer, xhr, status, e) {
  _handleXhrError(observer, status || xhr.statusText || 'request error', e);
}

module.exports = request;

},{"125":125,"126":126}],128:[function(require,module,exports){
var pathSyntax = require(132);

function sentinel(type, value, props) {
    var copy = Object.create(null);
    if (props != null) {
        for(var key in props) {
            copy[key] = props[key];
        }
        
        copy["$type"] = type;
        copy.value = value;
        return copy;
    }
    else {
        return { $type: type, value: value };
    }    
}

module.exports = {
    ref: function ref(path, props) {
        return sentinel("ref", pathSyntax.fromPath(path), props);
    },
    atom: function atom(value, props) {
        return sentinel("atom", value, props);        
    },
    undefined: function() {
        return sentinel("atom");
    },    
    error: function error(errorValue, props) {
        return sentinel("error", errorValue, props);        
    },
    pathValue: function pathValue(path, value) {
        return { path: pathSyntax.fromPath(path), value: value };
    },
    pathInvalidation: function pathInvalidation(path) {
        return { path: pathSyntax.fromPath(path), invalidated: true };
    }    
};

},{"132":132}],129:[function(require,module,exports){
module.exports = {
    integers: 'integers',
    ranges: 'ranges',
    keys: 'keys'
};

},{}],130:[function(require,module,exports){
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

},{}],131:[function(require,module,exports){
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


},{}],132:[function(require,module,exports){
var Tokenizer = require(138);
var head = require(133);
var RoutedTokens = require(129);

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
    for (var i = 0, len = paths.length; i < len; i++) {

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

},{"129":129,"133":133,"138":138}],133:[function(require,module,exports){
var TokenTypes = require(130);
var E = require(131);
var indexer = require(134);

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


},{"130":130,"131":131,"134":134}],134:[function(require,module,exports){
var TokenTypes = require(130);
var E = require(131);
var idxE = E.indexer;
var range = require(136);
var quote = require(135);
var routed = require(137);

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


},{"130":130,"131":131,"135":135,"136":136,"137":137}],135:[function(require,module,exports){
var TokenTypes = require(130);
var E = require(131);
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


},{"130":130,"131":131}],136:[function(require,module,exports){
var Tokenizer = require(138);
var TokenTypes = require(130);
var E = require(131);

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


},{"130":130,"131":131,"138":138}],137:[function(require,module,exports){
var TokenTypes = require(130);
var RoutedTokens = require(129);
var E = require(131);
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


},{"129":129,"130":130,"131":131}],138:[function(require,module,exports){
var TokenTypes = require(130);
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
    var done;

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



},{"130":130}],139:[function(require,module,exports){
var toPaths = require(155);
var toTree = require(156);

module.exports = function collapse(paths) {
    var collapseMap = paths.
        reduce(function(acc, path) {
            var len = path.length;
            if (!acc[len]) {
                acc[len] = [];
            }
            acc[len].push(path);
            return acc;
        }, {});

    Object.
        keys(collapseMap).
        forEach(function(collapseKey) {
            collapseMap[collapseKey] = toTree(collapseMap[collapseKey]);
        });

    return toPaths(collapseMap);
};

},{"155":155,"156":156}],140:[function(require,module,exports){
/*eslint-disable*/
module.exports = {
    innerReferences: 'References with inner references are not allowed.',
    circularReference: 'There appears to be a circular reference, maximum reference following exceeded.'
};


},{}],141:[function(require,module,exports){
/**
 * Escapes a string by prefixing it with "_". This function should be used on
 * untrusted input before it is embedded into paths. The goal is to ensure that
 * no reserved words (ex. "$type") make their way into paths and consequently
 * JSON Graph objects.
 */
module.exports = function escape(str) {
    return "_" + str;
};

},{}],142:[function(require,module,exports){
var errors = require(140);

/**
 * performs the simplified cache reference follow.  This
 * differs from get as there is just following and reporting,
 * not much else.
 *
 * @param {Object} cacheRoot
 * @param {Array} ref
 */
function followReference(cacheRoot, ref, maxRefFollow) {
    if (typeof maxRefFollow === "undefined") {
        maxRefFollow = 5;
    }
    var branch = cacheRoot;
    var node = branch;
    var refPath = ref;
    var depth = -1;
    var referenceCount = 0;

    while (++depth < refPath.length) {
        var key = refPath[depth];
        node = branch[key];

        if (
            node === null ||
            typeof node !== "object" ||
            (node.$type && node.$type !== "ref")
        ) {
            break;
        }

        if (node.$type === "ref") {
            // Show stopper exception.  This route is malformed.
            if (depth + 1 < refPath.length) {
                return { error: new Error(errors.innerReferences) };
            }
            if (referenceCount >= maxRefFollow) {
                return { error: new Error(errors.circularReference) };
            }

            refPath = node.value;
            depth = -1;
            branch = cacheRoot;
            referenceCount++;
        } else {
            branch = node;
        }
    }
    return { node: node, refPath: refPath };
}

module.exports = followReference;

},{"140":140}],143:[function(require,module,exports){
var iterateKeySet = require(146);

/**
 * Tests to see if the intersection should be stripped from the
 * total paths.  The only way this happens currently is if the entirety
 * of the path is contained in the tree.
 * @private
 */
module.exports = function hasIntersection(tree, path, depth) {
    var current = tree;
    var intersects = true;

    // Continue iteratively going down a path until a complex key is
    // encountered, then recurse.
    for (;intersects && depth < path.length; ++depth) {
        var key = path[depth];
        var keyType = typeof key;

        // We have to iterate key set
        if (key && keyType === 'object') {
            var note = {};
            var innerKey = iterateKeySet(key, note);
            var nextDepth = depth + 1;

            // Loop through the innerKeys setting the intersects flag
            // to each result.  Break out on false.
            do {
                var next = current[innerKey];
                intersects = next !== undefined;

                if (intersects) {
                    intersects = hasIntersection(next, path, nextDepth);
                }
                innerKey = iterateKeySet(key, note);
            } while (intersects && !note.done);

            // Since we recursed, we shall not pass any further!
            break;
        }

        // Its a simple key, just move forward with the testing.
        current = current[key];
        intersects = current !== undefined;
    }

    return intersects;
};

},{"146":146}],144:[function(require,module,exports){
// @flow
/*::
import type { Key, KeySet, PathSet, Path, JsonGraph, JsonGraphNode, JsonMap } from "falcor-json-graph";
export type PathTree = { [key: string]: PathTree | null | void };
export type LengthTree = { [key: number]: PathTree | void };
export type IteratorNote = { done?: boolean };
type FalcorPathUtils = {
    iterateKeySet(keySet: KeySet, note: IteratorNote): Key;
    toTree(paths: PathSet[]): PathTree;
    pathsComplementFromTree(paths: PathSet[], tree: PathTree): PathSet[];
    pathsComplementFromLengthTree(paths: PathSet[], tree: LengthTree): PathSet[];
    toJsonKey(obj: JsonMap): string;
    isJsonKey(key: Key): boolean;
    maybeJsonKey(key: Key): JsonMap | void;
    hasIntersection(tree: PathTree, path: PathSet, depth: number): boolean;
    toPaths(lengths: LengthTree): PathSet[];
    isIntegerKey(key: Key): boolean;
    maybeIntegerKey(key: Key): number | void;
    collapse(paths: PathSet[]): PathSet[];
    followReference(
        cacheRoot: JsonGraph,
        ref: Path,
        maxRefFollow?: number
    ): { error: Error } | { error?: empty, node: ?JsonGraphNode, refPath: Path };
    optimizePathSets(
        cache: JsonGraph,
        paths: PathSet[],
        maxRefFollow?: number
    ): { error: Error } | { error?: empty, paths: PathSet[] };
    pathCount(path: PathSet): number;
    escape(key: string): string;
    unescape(key: string): string;
    materialize(pathSet: PathSet, value: JsonGraphNode): JsonGraphNode;
};
*/
module.exports = ({
    iterateKeySet: require(146),
    toTree: require(156),
    pathsComplementFromTree: require(152),
    pathsComplementFromLengthTree: require(151),
    toJsonKey: require(147).toJsonKey,
    isJsonKey: require(147).isJsonKey,
    maybeJsonKey: require(147).maybeJsonKey,
    hasIntersection: require(143),
    toPaths: require(155),
    isIntegerKey: require(145).isIntegerKey,
    maybeIntegerKey: require(145).maybeIntegerKey,
    collapse: require(139),
    followReference: require(142),
    optimizePathSets: require(149),
    pathCount: require(150),
    escape: require(141),
    unescape: require(157),
    materialize: require(148)
}/*: FalcorPathUtils*/);

},{"139":139,"141":141,"142":142,"143":143,"145":145,"146":146,"147":147,"148":148,"149":149,"150":150,"151":151,"152":152,"155":155,"156":156,"157":157}],145:[function(require,module,exports){
"use strict";
var MAX_SAFE_INTEGER = 9007199254740991; // Number.MAX_SAFE_INTEGER in es6
var abs = Math.abs;
var isSafeInteger = Number.isSafeInteger || function isSafeInteger(num) {
    return typeof num === "number" && num % 1 === 0 && abs(num) <= MAX_SAFE_INTEGER;
}

/**
 * Return number if argument is a number or can be cast to a number which
 * roundtrips to the same string, otherwise return undefined.
 */
function maybeIntegerKey(val) {
    if (typeof val === "string") {
        var num = Number(val);
        if(isSafeInteger(num) && String(num) === val) {
            return num;
        }
    } else if (isSafeInteger(val)) {
        return val;
    }
}

/**
 * Return true if argument is a number or can be cast to a number which
 * roundtrips to the same string.
 */
function isIntegerKey(val) {
    if (typeof val === "string") {
        var num = Number(val);
        return isSafeInteger(num) && String(num) === val;
    }
    return isSafeInteger(val);
}

module.exports.isIntegerKey = isIntegerKey;
module.exports.maybeIntegerKey = maybeIntegerKey;

},{}],146:[function(require,module,exports){
var isArray = Array.isArray;

/**
 * Takes in a keySet and a note attempts to iterate over it.
 * If the value is a primitive, the key will be returned and the note will
 * be marked done
 * If the value is an object, then each value of the range will be returned
 * and when finished the note will be marked done.
 * If the value is an array, each value will be iterated over, if any of the
 * inner values are ranges, those will be iterated over.  When fully done,
 * the note will be marked done.
 *
 * @param {Object|Array|String|Number} keySet -
 * @param {Object} note - The non filled note
 * @returns {String|Number|undefined} - The current iteration value.
 * If undefined, then the keySet is empty
 * @public
 */
module.exports = function iterateKeySet(keySet, note) {
    if (note.isArray === undefined) {
        initializeNote(keySet, note);
    }

    // Array iteration
    if (note.isArray) {
        var nextValue;

        // Cycle through the array and pluck out the next value.
        do {
            if (note.loaded && note.rangeOffset > note.to) {
                ++note.arrayOffset;
                note.loaded = false;
            }

            var idx = note.arrayOffset, length = keySet.length;
            if (idx >= length) {
                note.done = true;
                break;
            }

            var el = keySet[note.arrayOffset];

            // Inner range iteration.
            if (el !== null && typeof el === 'object') {
                if (!note.loaded) {
                    initializeRange(el, note);
                }

                // Empty to/from
                if (note.empty) {
                    continue;
                }

                nextValue = note.rangeOffset++;
            }

            // Primitive iteration in array.
            else {
                ++note.arrayOffset;
                nextValue = el;
            }
        } while (nextValue === undefined);

        return nextValue;
    }

    // Range iteration
    else if (note.isObject) {
        if (!note.loaded) {
            initializeRange(keySet, note);
        }
        if (note.rangeOffset > note.to) {
            note.done = true;
            return undefined;
        }

        return note.rangeOffset++;
    }

    // Primitive value
    else {
        if (!note.loaded) {
            note.loaded = true;
            return keySet;
        }
        note.done = true;
        return undefined;
    }
};

function initializeRange(key, memo) {
    var from = memo.from = key.from || 0;
    var to = memo.to = key.to ||
        (typeof key.length === 'number' &&
        memo.from + key.length - 1 || 0);
    memo.rangeOffset = memo.from;
    memo.loaded = true;
    if (from > to) {
        memo.empty = true;
    }
}

function initializeNote(key, note) {
    note.done = false;
    var isObject = note.isObject = !!(key && typeof key === 'object');
    note.isArray = isObject && isArray(key);
    note.arrayOffset = 0;
}

},{}],147:[function(require,module,exports){
"use strict";

/**
 * Helper for getting a reproducible, key-sorted string representation of object.
 * Used to interpret an object as a falcor key.
 * @function
 * @param {Object} obj
 * @return stringified object with sorted keys.
 */
function toJsonKey(obj) {
    if (Object.prototype.toString.call(obj) === "[object Object]") {
        var key = JSON.stringify(obj, replacer);
        if (key[0] === "{") {
            return key;
        }
    }
    throw new TypeError("Only plain objects can be converted to JSON keys")
}

function replacer(key, value) {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return value;
    }
    return Object.keys(value)
        .sort()
        .reduce(function (acc, k) {
            acc[k] = value[k];
            return acc;
        }, {});
}

function maybeJsonKey(key) {
    if (typeof key !== 'string' || key[0] !== '{') {
        return;
    }
    var parsed;
    try {
        parsed = JSON.parse(key);
    } catch (e) {
        return;
    }
    if (JSON.stringify(parsed, replacer) !== key) {
        return;
    }
    return parsed;
}

function isJsonKey(key) {
    return typeof maybeJsonKey(key) !== "undefined";
}

module.exports.toJsonKey = toJsonKey;
module.exports.isJsonKey = isJsonKey;
module.exports.maybeJsonKey = maybeJsonKey;

},{}],148:[function(require,module,exports){
'use strict';
var iterateKeySet = require(146);

/**
 * Construct a jsonGraph from a pathSet and a value.
 *
 * @param {PathSet} pathSet - pathSet of paths at which to materialize value.
 * @param {JsonGraphNode} value - value to materialize at pathSet paths.
 * @returns {JsonGraphNode} - JsonGraph of value at pathSet paths.
 * @public
 */

module.exports = function materialize(pathSet, value) {
  return pathSet.reduceRight(function materializeInner(acc, keySet) {
    var branch = {};
    if (typeof keySet !== 'object' || keySet === null) {
      branch[keySet] = acc;
      return branch;
    }
    var iteratorNote = {};
    var key = iterateKeySet(keySet, iteratorNote);
    while (!iteratorNote.done) {
      branch[key] = acc;
      key = iterateKeySet(keySet, iteratorNote);
    }
    return branch;
  }, value);
};

},{"146":146}],149:[function(require,module,exports){
var iterateKeySet = require(146);
var cloneArray = require(154);
var catAndSlice = require(153);
var followReference = require(142);

/**
 * The fastest possible optimize of paths.
 *
 * What it does:
 * - Any atom short-circuit / found value will be removed from the path.
 * - All paths will be exploded which means that collapse will need to be
 *   ran afterwords.
 * - Any missing path will be optimized as much as possible.
 */
module.exports = function optimizePathSets(cache, paths, maxRefFollow) {
    if (typeof maxRefFollow === "undefined") {
        maxRefFollow = 5;
    }
    var optimized = [];
    for (var i = 0, len = paths.length; i < len; ++i) {
        var error = optimizePathSet(cache, cache, paths[i], 0, optimized, [], maxRefFollow);
        if (error) {
            return { error: error };
        }
    }
    return { paths: optimized };
};


/**
 * optimizes one pathSet at a time.
 */
function optimizePathSet(cache, cacheRoot, pathSet,
                         depth, out, optimizedPath, maxRefFollow) {

    // at missing, report optimized path.
    if (cache === undefined) {
        out[out.length] = catAndSlice(optimizedPath, pathSet, depth);
        return;
    }

    // all other sentinels are short circuited.
    // Or we found a primitive (which includes null)
    if (cache === null || (cache.$type && cache.$type !== "ref") ||
            (typeof cache !== 'object')) {
        return;
    }

    // If the reference is the last item in the path then do not
    // continue to search it.
    if (cache.$type === "ref" && depth === pathSet.length) {
        return;
    }

    var keySet = pathSet[depth];
    var isKeySet = typeof keySet === 'object' && keySet !== null;
    var nextDepth = depth + 1;
    var iteratorNote = false;
    var key = keySet;
    if (isKeySet) {
        iteratorNote = {};
        key = iterateKeySet(keySet, iteratorNote);
    }
    var next, nextOptimized;
    do {
        next = cache[key];
        var optimizedPathLength = optimizedPath.length;
        optimizedPath[optimizedPathLength] = key;

        if (next && next.$type === "ref" && nextDepth < pathSet.length) {
            var refResults =
                followReference(cacheRoot, next.value, maxRefFollow);
            if (refResults.error) {
                return refResults.error;
            }
            next = refResults.node;
            // must clone to avoid the mutation from above destroying the cache.
            nextOptimized = cloneArray(refResults.refPath);
        } else {
            nextOptimized = optimizedPath;
        }

        var error = optimizePathSet(next, cacheRoot, pathSet, nextDepth,
                        out, nextOptimized, maxRefFollow);
        if (error) {
            return error;
        }
        optimizedPath.length = optimizedPathLength;

        if (iteratorNote && !iteratorNote.done) {
            key = iterateKeySet(keySet, iteratorNote);
        }
    } while (iteratorNote && !iteratorNote.done);
}

},{"142":142,"146":146,"153":153,"154":154}],150:[function(require,module,exports){
"use strict";

/**
 * Helper for getPathCount. Used to determine the size of a key or range.
 * @function
 * @param {Object} rangeOrKey
 * @return The size of the key or range passed in.
 */
function getRangeOrKeySize(rangeOrKey) {
    if (rangeOrKey == null) {
        return 1;
    } else if (Array.isArray(rangeOrKey)) {
        throw new Error("Unexpected Array found in keySet: " + JSON.stringify(rangeOrKey));
    } else if (typeof rangeOrKey === "object") {
        return getRangeSize(rangeOrKey);
    } else {
        return 1;
    }
}

/**
 * Returns the size (number of items) in a Range,
 * @function
 * @param {Object} range The Range with both "from" and "to", or just "to"
 * @return The number of items in the range.
 */
function getRangeSize(range) {

    var to = range.to;
    var length = range.length;

    if (to != null) {
        if (isNaN(to) || parseInt(to, 10) !== to) {
            throw new Error("Invalid range, 'to' is not an integer: " + JSON.stringify(range));
        }
        var from = range.from || 0;
        if (isNaN(from) || parseInt(from, 10) !== from) {
            throw new Error("Invalid range, 'from' is not an integer: " + JSON.stringify(range));
        }
        if (from <= to) {
            return (to - from) + 1;
        } else {
            return 0;
        }
    } else if (length != null) {
        if (isNaN(length) || parseInt(length, 10) !== length) {
            throw new Error("Invalid range, 'length' is not an integer: " + JSON.stringify(range));
        } else {
            return length;
        }
    } else {
        throw new Error("Invalid range, expected 'to' or 'length': " + JSON.stringify(range));
    }
}

/**
 * Returns a count of the number of paths this pathset
 * represents.
 *
 * For example, ["foo", {"from":0, "to":10}, "bar"],
 * would represent 11 paths (0 to 10, inclusive), and
 * ["foo, ["baz", "boo"], "bar"] would represent 2 paths.
 *
 * @function
 * @param {Object[]} pathSet the path set.
 *
 * @return The number of paths this represents
 */
function getPathCount(pathSet) {
    if (pathSet.length === 0) {
        throw new Error("All paths must have length larger than zero.");
    }

    var numPaths = 1;

    for (var i = 0; i < pathSet.length; i++) {
        var segment = pathSet[i];

        if (Array.isArray(segment)) {

            var numKeys = 0;

            for (var j = 0; j < segment.length; j++) {
                var keySet = segment[j];

                numKeys += getRangeOrKeySize(keySet);
            }

            numPaths *= numKeys;

        } else {
            numPaths *= getRangeOrKeySize(segment);
        }
    }

    return numPaths;
}


module.exports = getPathCount;

},{}],151:[function(require,module,exports){
var hasIntersection = require(143);

/**
 * Compares the paths passed in with the tree.  Any of the paths that are in
 * the tree will be stripped from the paths.
 *
 * **Does not mutate** the incoming paths object.
 * **Proper subset** only matching.
 *
 * @param {Array} paths - A list of paths (complex or simple) to strip the
 * intersection
 * @param {Object} tree -
 * @public
 */
module.exports = function pathsComplementFromLengthTree(paths, tree) {
    var out = [];
    var outLength = -1;

    for (var i = 0, len = paths.length; i < len; ++i) {
        // If this does not intersect then add it to the output.
        var path = paths[i];
        if (!hasIntersection(tree[path.length], path, 0)) {
            out[++outLength] = path;
        }
    }
    return out;
};


},{"143":143}],152:[function(require,module,exports){
var hasIntersection = require(143);

/**
 * Compares the paths passed in with the tree.  Any of the paths that are in
 * the tree will be stripped from the paths.
 *
 * **Does not mutate** the incoming paths object.
 * **Proper subset** only matching.
 *
 * @param {Array} paths - A list of paths (complex or simple) to strip the
 * intersection
 * @param {Object} tree -
 * @public
 */
module.exports = function pathsComplementFromTree(paths, tree) {
    var out = [];
    var outLength = -1;

    for (var i = 0, len = paths.length; i < len; ++i) {
        // If this does not intersect then add it to the output.
        if (!hasIntersection(tree, paths[i], 0)) {
            out[++outLength] = paths[i];
        }
    }
    return out;
};


},{"143":143}],153:[function(require,module,exports){
module.exports = function catAndSlice(a, b, slice) {
    var next = [], i, j, len;
    for (i = 0, len = a.length; i < len; ++i) {
        next[i] = a[i];
    }

    for (j = slice || 0, len = b.length; j < len; ++j, ++i) {
        next[i] = b[j];
    }

    return next;
};


},{}],154:[function(require,module,exports){
function cloneArray(arr, index) {
    var a = [];
    var len = arr.length;
    for (var i = index || 0; i < len; i++) {
        a[i] = arr[i];
    }
    return a;
}

module.exports = cloneArray;


},{}],155:[function(require,module,exports){
var maybeIntegerKey = require(145).maybeIntegerKey;
var isIntegerKey = require(145).isIntegerKey;
var isArray = Array.isArray;
var typeOfObject = "object";
var typeOfString = "string";
var typeOfNumber = "number";

/* jshint forin: false */
module.exports = function toPaths(lengths) {
    var pathmap;
    var allPaths = [];
    var allPathsLength = 0;
    for (var length in lengths) {
        var num = maybeIntegerKey(length);
        if (typeof num === typeOfNumber && isObject(pathmap = lengths[length])) {
            var paths = collapsePathMap(pathmap, 0, num).sets;
            var pathsIndex = -1;
            var pathsCount = paths.length;
            while (++pathsIndex < pathsCount) {
                allPaths[allPathsLength++] = collapsePathSetIndexes(paths[pathsIndex]);
            }
        }
    }
    return allPaths;
};

function isObject(value) {
    return value !== null && typeof value === typeOfObject;
}

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

        subKeysCount = getKeys(pathmap, subKeys);

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
            var num = maybeIntegerKey(key);
            subPath.keys.push(typeof num === typeOfNumber ? num : key);
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
        subKeysCount = getKeys(pathmap, subKeys);
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
        if (isArray(keyset)) {
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
 * @private
 */
function collapseIndex(keyset) {

    // Do we need to dedupe an indexer keyset if they're duplicate consecutive integers?
    // var hash = {};
    var keyIndex = -1;
    var keyCount = keyset.length - 1;
    var isSparseRange = keyCount > 0;

    while (++keyIndex <= keyCount) {

        var key = keyset[keyIndex];

        if (!isIntegerKey(key) /* || hash[key] === true*/ ) {
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
function getKeys(map, keys, sort) {
    var len = 0;

    for (var key in map) {
        keys[len++] = key;
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

// backwards-compatibility (temporary)
module.exports._isSafeNumber = isIntegerKey;

},{"145":145}],156:[function(require,module,exports){
var iterateKeySet = require(146);
var isArray = Array.isArray;

/**
 * @param {Array} paths -
 * @returns {Object} -
 */
module.exports = function toTree(paths) {
    return paths.reduce(function(acc, path) {
        innerToTree(acc, path, 0);
        return acc;
    }, {});
};

function innerToTree(seed, path, depth) {
    var keySet = path[depth];
    var iteratorNote = {};
    var key;
    var nextDepth = depth + 1;

    key = iterateKeySet(keySet, iteratorNote);

    while (!iteratorNote.done) {

        var next = seed[key];
        if (!next) {
            if (nextDepth === path.length) {
                seed[key] = null;
            } else {
                next = seed[key] = {};
            }
        }

        if (nextDepth < path.length) {
            innerToTree(next, path, nextDepth);
        }

        key = iterateKeySet(keySet, iteratorNote);
    }
}


},{"146":146}],157:[function(require,module,exports){
/**
 * Unescapes a string by removing the leading "_". This function is the inverse
 * of escape, which is used to encode untrusted input to ensure it
 * does not contain reserved JSON Graph keywords (ex. "$type").
 */
module.exports = function unescape(str) {
    if (str.slice(0, 1) === "_") {
        return str.slice(1);
    } else {
        throw SyntaxError("Expected \"_\".");
    }
};

},{}],158:[function(require,module,exports){
'use strict';

module.exports = require(163)

},{"163":163}],159:[function(require,module,exports){
(function (Promise){
'use strict';

var asap = require(120);

function noop() {}

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
  if (typeof this !== 'object') {
    throw new TypeError('Promises must be constructed via new');
  }
  if (typeof fn !== 'function') {
    throw new TypeError('Promise constructor\'s argument is not a function');
  }
  this._75 = 0;
  this._83 = 0;
  this._18 = null;
  this._38 = null;
  if (fn === noop) return;
  doResolve(fn, this);
}
Promise._47 = null;
Promise._71 = null;
Promise._44 = noop;

Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.constructor !== Promise) {
    return safeThen(this, onFulfilled, onRejected);
  }
  var res = new Promise(noop);
  handle(this, new Handler(onFulfilled, onRejected, res));
  return res;
};

function safeThen(self, onFulfilled, onRejected) {
  return new self.constructor(function (resolve, reject) {
    var res = new Promise(noop);
    res.then(resolve, reject);
    handle(self, new Handler(onFulfilled, onRejected, res));
  });
}
function handle(self, deferred) {
  while (self._83 === 3) {
    self = self._18;
  }
  if (Promise._47) {
    Promise._47(self);
  }
  if (self._83 === 0) {
    if (self._75 === 0) {
      self._75 = 1;
      self._38 = deferred;
      return;
    }
    if (self._75 === 1) {
      self._75 = 2;
      self._38 = [self._38, deferred];
      return;
    }
    self._38.push(deferred);
    return;
  }
  handleResolved(self, deferred);
}

function handleResolved(self, deferred) {
  asap(function() {
    var cb = self._83 === 1 ? deferred.onFulfilled : deferred.onRejected;
    if (cb === null) {
      if (self._83 === 1) {
        resolve(deferred.promise, self._18);
      } else {
        reject(deferred.promise, self._18);
      }
      return;
    }
    var ret = tryCallOne(cb, self._18);
    if (ret === IS_ERROR) {
      reject(deferred.promise, LAST_ERROR);
    } else {
      resolve(deferred.promise, ret);
    }
  });
}
function resolve(self, newValue) {
  // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  if (newValue === self) {
    return reject(
      self,
      new TypeError('A promise cannot be resolved with itself.')
    );
  }
  if (
    newValue &&
    (typeof newValue === 'object' || typeof newValue === 'function')
  ) {
    var then = getThen(newValue);
    if (then === IS_ERROR) {
      return reject(self, LAST_ERROR);
    }
    if (
      then === self.then &&
      newValue instanceof Promise
    ) {
      self._83 = 3;
      self._18 = newValue;
      finale(self);
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), self);
      return;
    }
  }
  self._83 = 1;
  self._18 = newValue;
  finale(self);
}

function reject(self, newValue) {
  self._83 = 2;
  self._18 = newValue;
  if (Promise._71) {
    Promise._71(self, newValue);
  }
  finale(self);
}
function finale(self) {
  if (self._75 === 1) {
    handle(self, self._38);
    self._38 = null;
  }
  if (self._75 === 2) {
    for (var i = 0; i < self._38.length; i++) {
      handle(self, self._38[i]);
    }
    self._38 = null;
  }
}

function Handler(onFulfilled, onRejected, promise){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
  this.onRejected = typeof onRejected === 'function' ? onRejected : null;
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
    if (done) return;
    done = true;
    resolve(promise, value);
  }, function (reason) {
    if (done) return;
    done = true;
    reject(promise, reason);
  });
  if (!done && res === IS_ERROR) {
    done = true;
    reject(promise, LAST_ERROR);
  }
}

}).call(this,typeof Promise === "function" ? Promise : require(158))
},{"120":120,"158":158}],160:[function(require,module,exports){
'use strict';

var Promise = require(159);

module.exports = Promise;
Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this;
  self.then(null, function (err) {
    setTimeout(function () {
      throw err;
    }, 0);
  });
};

},{"159":159}],161:[function(require,module,exports){
'use strict';

//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = require(159);

module.exports = Promise;

/* Static Functions */

var TRUE = valuePromise(true);
var FALSE = valuePromise(false);
var NULL = valuePromise(null);
var UNDEFINED = valuePromise(undefined);
var ZERO = valuePromise(0);
var EMPTYSTRING = valuePromise('');

function valuePromise(value) {
  var p = new Promise(Promise._44);
  p._83 = 1;
  p._18 = value;
  return p;
}
Promise.resolve = function (value) {
  if (value instanceof Promise) return value;

  if (value === null) return NULL;
  if (value === undefined) return UNDEFINED;
  if (value === true) return TRUE;
  if (value === false) return FALSE;
  if (value === 0) return ZERO;
  if (value === '') return EMPTYSTRING;

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then;
      if (typeof then === 'function') {
        return new Promise(then.bind(value));
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex);
      });
    }
  }
  return valuePromise(value);
};

Promise.all = function (arr) {
  var args = Array.prototype.slice.call(arr);

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([]);
    var remaining = args.length;
    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        if (val instanceof Promise && val.then === Promise.prototype.then) {
          while (val._83 === 3) {
            val = val._18;
          }
          if (val._83 === 1) return res(i, val._18);
          if (val._83 === 2) reject(val._18);
          val.then(function (val) {
            res(i, val);
          }, reject);
          return;
        } else {
          var then = val.then;
          if (typeof then === 'function') {
            var p = new Promise(then.bind(val));
            p.then(function (val) {
              res(i, val);
            }, reject);
            return;
          }
        }
      }
      args[i] = val;
      if (--remaining === 0) {
        resolve(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i]);
    }
  });
};

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) {
    reject(value);
  });
};

Promise.race = function (values) {
  return new Promise(function (resolve, reject) {
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    });
  });
};

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
};

},{"159":159}],162:[function(require,module,exports){
'use strict';

var Promise = require(159);

module.exports = Promise;
Promise.prototype['finally'] = function (f) {
  return this.then(function (value) {
    return Promise.resolve(f()).then(function () {
      return value;
    });
  }, function (err) {
    return Promise.resolve(f()).then(function () {
      throw err;
    });
  });
};

},{"159":159}],163:[function(require,module,exports){
'use strict';

module.exports = require(159);
require(160);
require(162);
require(161);
require(164);
require(165);

},{"159":159,"160":160,"161":161,"162":162,"164":164,"165":165}],164:[function(require,module,exports){
'use strict';

// This file contains then/promise specific extensions that are only useful
// for node.js interop

var Promise = require(159);
var asap = require(119);

module.exports = Promise;

/* Static Functions */

Promise.denodeify = function (fn, argumentCount) {
  if (
    typeof argumentCount === 'number' && argumentCount !== Infinity
  ) {
    return denodeifyWithCount(fn, argumentCount);
  } else {
    return denodeifyWithoutCount(fn);
  }
};

var callbackFn = (
  'function (err, res) {' +
  'if (err) { rj(err); } else { rs(res); }' +
  '}'
);
function denodeifyWithCount(fn, argumentCount) {
  var args = [];
  for (var i = 0; i < argumentCount; i++) {
    args.push('a' + i);
  }
  var body = [
    'return function (' + args.join(',') + ') {',
    'var self = this;',
    'return new Promise(function (rs, rj) {',
    'var res = fn.call(',
    ['self'].concat(args).concat([callbackFn]).join(','),
    ');',
    'if (res &&',
    '(typeof res === "object" || typeof res === "function") &&',
    'typeof res.then === "function"',
    ') {rs(res);}',
    '});',
    '};'
  ].join('');
  return Function(['Promise', 'fn'], body)(Promise, fn);
}
function denodeifyWithoutCount(fn) {
  var fnLength = Math.max(fn.length - 1, 3);
  var args = [];
  for (var i = 0; i < fnLength; i++) {
    args.push('a' + i);
  }
  var body = [
    'return function (' + args.join(',') + ') {',
    'var self = this;',
    'var args;',
    'var argLength = arguments.length;',
    'if (arguments.length > ' + fnLength + ') {',
    'args = new Array(arguments.length + 1);',
    'for (var i = 0; i < arguments.length; i++) {',
    'args[i] = arguments[i];',
    '}',
    '}',
    'return new Promise(function (rs, rj) {',
    'var cb = ' + callbackFn + ';',
    'var res;',
    'switch (argLength) {',
    args.concat(['extra']).map(function (_, index) {
      return (
        'case ' + (index) + ':' +
        'res = fn.call(' + ['self'].concat(args.slice(0, index)).concat('cb').join(',') + ');' +
        'break;'
      );
    }).join(''),
    'default:',
    'args[argLength] = cb;',
    'res = fn.apply(self, args);',
    '}',
    
    'if (res &&',
    '(typeof res === "object" || typeof res === "function") &&',
    'typeof res.then === "function"',
    ') {rs(res);}',
    '});',
    '};'
  ].join('');

  return Function(
    ['Promise', 'fn'],
    body
  )(Promise, fn);
}

Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    var callback =
      typeof args[args.length - 1] === 'function' ? args.pop() : null;
    var ctx = this;
    try {
      return fn.apply(this, arguments).nodeify(callback, ctx);
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) {
          reject(ex);
        });
      } else {
        asap(function () {
          callback.call(ctx, ex);
        })
      }
    }
  }
};

Promise.prototype.nodeify = function (callback, ctx) {
  if (typeof callback != 'function') return this;

  this.then(function (value) {
    asap(function () {
      callback.call(ctx, null, value);
    });
  }, function (err) {
    asap(function () {
      callback.call(ctx, err);
    });
  });
};

},{"119":119,"159":159}],165:[function(require,module,exports){
'use strict';

var Promise = require(159);

module.exports = Promise;
Promise.enableSynchronous = function () {
  Promise.prototype.isPending = function() {
    return this.getState() == 0;
  };

  Promise.prototype.isFulfilled = function() {
    return this.getState() == 1;
  };

  Promise.prototype.isRejected = function() {
    return this.getState() == 2;
  };

  Promise.prototype.getValue = function () {
    if (this._83 === 3) {
      return this._18.getValue();
    }

    if (!this.isFulfilled()) {
      throw new Error('Cannot get a value of an unfulfilled promise.');
    }

    return this._18;
  };

  Promise.prototype.getReason = function () {
    if (this._83 === 3) {
      return this._18.getReason();
    }

    if (!this.isRejected()) {
      throw new Error('Cannot get a rejection reason of a non-rejected promise.');
    }

    return this._18;
  };

  Promise.prototype.getState = function () {
    if (this._83 === 3) {
      return this._18.getState();
    }
    if (this._83 === -1 || this._83 === -2) {
      return 0;
    }

    return this._83;
  };
};

Promise.disableSynchronous = function() {
  Promise.prototype.isPending = undefined;
  Promise.prototype.isFulfilled = undefined;
  Promise.prototype.isRejected = undefined;
  Promise.prototype.getValue = undefined;
  Promise.prototype.getReason = undefined;
  Promise.prototype.getState = undefined;
};

},{"159":159}],166:[function(require,module,exports){
(function (global){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ponyfill = require(167);

var _ponyfill2 = _interopRequireDefault(_ponyfill);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var root; /* global window */


if (typeof self !== 'undefined') {
  root = self;
} else if (typeof window !== 'undefined') {
  root = window;
} else if (typeof global !== 'undefined') {
  root = global;
} else if (typeof module !== 'undefined') {
  root = module;
} else {
  root = Function('return this')();
}

var result = (0, _ponyfill2['default'])(root);
exports['default'] = result;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"167":167}],167:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports['default'] = symbolObservablePonyfill;
function symbolObservablePonyfill(root) {
	var result;
	var _Symbol = root.Symbol;

	if (typeof _Symbol === 'function') {
		if (_Symbol.observable) {
			result = _Symbol.observable;
		} else {
			result = _Symbol('observable');
			_Symbol.observable = result;
		}
	} else {
		result = '@@observable';
	}

	return result;
};
},{}]},{},[1])(1)
});
