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
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.falcor=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var falcor = _dereq_('./index');
var HttpDataSource = _dereq_('falcor-browser');
falcor.HttpDataSource = HttpDataSource;
module.exports = falcor;

},{"./index":2,"falcor-browser":297}],2:[function(_dereq_,module,exports){
var falcor = _dereq_('./lib/falcor');
var get = _dereq_('./lib/get');
var set = _dereq_('./lib/set');
var inv = _dereq_('./lib/invalidate');
var prototype = falcor.Model.prototype;

prototype._getBoundValue = get.getBoundValue;
prototype._getValueSync = get.getValueSync;
prototype._getPathSetsAsValues = get.getAsValues;
prototype._getPathSetsAsJSON = get.getAsJSON;
prototype._getPathSetsAsPathMap = get.getAsPathMap;
prototype._getPathSetsAsJSONG = get.getAsJSONG;
prototype._getPathMapsAsValues = get.getAsValues;
prototype._getPathMapsAsJSON = get.getAsJSON;
prototype._getPathMapsAsPathMap = get.getAsPathMap;
prototype._getPathMapsAsJSONG = get.getAsJSONG;

prototype._setPathSetsAsJSON = set.setPathSetsAsJSON;
prototype._setPathSetsAsJSONG = set.setPathSetsAsJSONG;
prototype._setPathSetsAsPathMap = set.setPathSetsAsPathMap;
prototype._setPathSetsAsValues = set.setPathSetsAsValues;

prototype._setPathMapsAsJSON = set.setPathMapsAsJSON;
prototype._setPathMapsAsJSONG = set.setPathMapsAsJSONG;
prototype._setPathMapsAsPathMap = set.setPathMapsAsPathMap;
prototype._setPathMapsAsValues = set.setPathMapsAsValues;

prototype._setJSONGsAsJSON = set.setJSONGsAsJSON;
prototype._setJSONGsAsJSONG = set.setJSONGsAsJSONG;
prototype._setJSONGsAsPathMap = set.setJSONGsAsPathMap;
prototype._setJSONGsAsValues = set.setJSONGsAsValues;

prototype._invPathSetsAsJSON = inv.invPathSetsAsJSON;
prototype._invPathSetsAsJSONG = inv.invPathSetsAsJSONG;
prototype._invPathSetsAsPathMap = inv.invPathSetsAsPathMap;
prototype._invPathSetsAsValues = inv.invPathSetsAsValues;

prototype._setCache = set.setCache;

module.exports = falcor;


},{"./lib/falcor":7,"./lib/get":52,"./lib/invalidate":80,"./lib/set":88}],3:[function(_dereq_,module,exports){
if (typeof falcor === 'undefined') {
    var falcor = {};
}
var Rx = _dereq_('falcor-observable');

falcor.__Internals = {};
falcor.Observable = Rx.Observable;
falcor.EXPIRES_NOW = 0;
falcor.EXPIRES_NEVER = 1;
/**
 * The current semVer'd data version of falcor.
 */
falcor.dataVersion = '0.1.0';

falcor.now = function now() {
    return Date.now();
};
falcor.NOOP = function() {};

module.exports = falcor;

},{"falcor-observable":305}],4:[function(_dereq_,module,exports){
var falcor = _dereq_('./Falcor');
var RequestQueue = _dereq_('./request/RequestQueue');
var ImmediateScheduler = _dereq_('./scheduler/ImmediateScheduler');
var ASAPScheduler = _dereq_('./scheduler/ASAPScheduler');
var TimeoutScheduler = _dereq_('./scheduler/TimeoutScheduler');
var ERROR = _dereq_("../types/error");
var ModelResponse = _dereq_('./ModelResponse');
var ModelDataSourceAdapter = _dereq_('./ModelDataSourceAdapter');
var call = _dereq_('./operations/call');
var operations = _dereq_('./operations');
var pathSyntax = _dereq_('falcor-path-syntax');
var getBoundValue = _dereq_('./../get/getBoundValue');
var collect = _dereq_('../lru/collect');
var slice = Array.prototype.slice;
var $ref = _dereq_('./../types/path');
var $error = _dereq_('./../types/error');
var $atom = _dereq_('./../types/atom');
var getGeneration = _dereq_('./../get/getGeneration');

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

    this._root = options.root || {
        expired: [],
        allowSync: 0,
        unsafeMode: false
    };
    if (options.cache && typeof options.cache === "object") {
        this.setCache(options.cache);
    } else {
        this._cache = {};
    }
    this._path = [];
};

Model.EXPIRES_NOW = falcor.EXPIRES_NOW;
Model.EXPIRES_NEVER = falcor.EXPIRES_NEVER;

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
    get: operations("get"),
    set: operations("set"),
    invalidate: operations("invalidate"),
    call: call,
    getValue: function(path) {
        return this.get(path, function(x) { return x; });
    },
    setValue: function(path, value) {
        path = pathSyntax.fromPath(path);
        return this.set(Array.isArray(path) ?
        {path: path, value: value} :
            path, function(x) { return x; });
    },
    bind: function(boundPath) {

        var model = this, root = model._root,
            paths = new Array(arguments.length - 1),
            i = -1, n = arguments.length - 1;

        boundPath = pathSyntax.fromPath(boundPath);

        while(++i < n) {
            paths[i] = pathSyntax.fromPath(arguments[i + 1]);
        }

        if(n === 0) { throw new Error("Model#bind requires at least one value path."); }

        return falcor.Observable.create(function(observer) {

            var boundModel;
            root.allowSync++;
            try {
                boundModel = model.bindSync(model._path.concat(boundPath));

                if (!boundModel) {
                    throw false;
                }
                observer.onNext(boundModel);
                observer.onCompleted();
            } catch (e) {
                return model.get.apply(model, paths.map(function(path) {
                    return boundPath.concat(path);
                }).concat(function(){})).subscribe(
                    function onNext() {},
                    function onError(err)  { observer.onError(err); },
                    function onCompleted() {
                        root.allowSync++;
                        try {

                            boundModel = model.bindSync(boundPath);
                            if(boundModel) {
                                observer.onNext(boundModel);
                            }
                            observer.onCompleted();
                        } catch(e) {
                            observer.onError(e);
                        }

                        // remove the inc
                        finally {
                            root.allowSync--;
                        }
                    });
            }

            // remove the inc
            finally {
                root.allowSync--;
            }
        });
    },
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
    getCache: function() {
        var paths = slice.call(arguments);
        if(paths.length == 0) {
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
    batch: function(schedulerOrDelay) {
        if(typeof schedulerOrDelay === "number") {
            schedulerOrDelay = new TimeoutScheduler(Math.round(Math.abs(schedulerOrDelay)));
        } else if(!schedulerOrDelay || !schedulerOrDelay.schedule) {
            schedulerOrDelay = new ASAPScheduler();
        }
        return this.clone(["_request", new RequestQueue(this, schedulerOrDelay)]);
    },
    unbatch: function() {
        return this.clone(["_request", new RequestQueue(this, new ImmediateScheduler())]);
    },
    treatErrorsAsValues: function() {
        return this.clone(["_treatErrorsAsValues", true]);
    },
    asDataSource: function() {
        return new ModelDataSourceAdapter(this);
    },
    materialize: function() {
        return this.clone(["_materialized", true]);
    },
    boxValues: function() {
        return this.clone(["_boxed", true]);
    },
    unboxValues: function() {
        return this.clone(["_boxed", false]);
    },
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
        return this._path;
    }
};

},{"../lru/collect":85,"../types/error":138,"./../get/getBoundValue":48,"./../get/getGeneration":49,"./../types/atom":137,"./../types/error":138,"./../types/path":139,"./Falcor":3,"./ModelDataSourceAdapter":5,"./ModelResponse":6,"./operations":13,"./operations/call":8,"./request/RequestQueue":39,"./scheduler/ASAPScheduler":40,"./scheduler/ImmediateScheduler":41,"./scheduler/TimeoutScheduler":42,"falcor-path-syntax":317}],5:[function(_dereq_,module,exports){
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
},{}],6:[function(_dereq_,module,exports){
var falcor = _dereq_('./Falcor');
var pathSyntax = _dereq_('falcor-path-syntax');

if(typeof Promise !== "undefined" && Promise) {
    falcor.Promise = Promise;
} else {
    falcor.Promise = _dereq_("promise");
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

},{"./Falcor":3,"falcor-path-syntax":317,"promise":324}],7:[function(_dereq_,module,exports){
var falcor = _dereq_('./Falcor');
var Model = _dereq_('./Model');
falcor.Model = Model;

module.exports = falcor;

},{"./Falcor":3,"./Model":4}],8:[function(_dereq_,module,exports){
module.exports = call;

var falcor = _dereq_("../../Falcor");
var ModelResponse = _dereq_('./../../ModelResponse');

function call(path, args, suffixes, paths, selector) {

    var model = this;
    args && Array.isArray(args) || (args = []);
    suffixes && Array.isArray(suffixes) || (suffixes = []);
    paths = Array.prototype.slice.call(arguments, 3);
    if (typeof (selector = paths[paths.length - 1]) !== "function") {
        selector = undefined;
    } else {
        paths = paths.slice(0, -1);
    }

    return ModelResponse.create(function (options) {

        var rootModel = model.clone(["_path", []]),
            localRoot = rootModel.withoutDataSource(),
            dataSource = model._dataSource,
            boundPath = model._path,
            callPath = boundPath.concat(path),
            thisPath = callPath.slice(0, -1);

        var disposable = model.
            getValue(path).
            flatMap(function (localFn) {
                if (typeof localFn === "function") {
                    return falcor.Observable.return(localFn.
                        apply(rootModel.bindSync(thisPath), args).
                        map(function (pathValue) {
                            return {
                                path: thisPath.concat(pathValue.path),
                                value: pathValue.value
                            };
                        }).
                        toArray().
                        flatMap(function (pathValues) {
                            return localRoot.set.
                                apply(localRoot, pathValues).
                                toJSONG();
                        }).
                        flatMap(function (envelope) {
                            return rootModel.get.apply(rootModel,
                                envelope.paths.reduce(function (paths, path) {
                                    return paths.concat(suffixes.map(function (suffix) {
                                        return path.concat(suffix);
                                    }));
                                }, []).
                                    concat(paths.reduce(function (paths, path) {
                                        return paths.concat(thisPath.concat(path));
                                    }, []))).
                                toJSONG();
                        }));
                }
                return falcor.Observable.empty();
            }).
            defaultIfEmpty(dataSource && dataSource.call(path, args, suffixes, paths) || falcor.Observable.empty()).
            mergeAll().
            subscribe(function (envelope) {
                var invalidated = envelope.invalidated;
                if (invalidated && invalidated.length) {
                    invalidatePaths(rootModel, invalidated, undefined, model._errorSelector);
                }
                disposable = localRoot.
                    set(envelope, function () {
                        return model;
                    }).
                    subscribe(function (model) {
                        var getPaths = envelope.paths.map(function (path) {
                            return path.slice(boundPath.length);
                        });
                        if (selector) {
                            getPaths[getPaths.length] = function () {
                                return selector.call(model, getPaths);
                            };
                        }
                        disposable = model.get.apply(model, getPaths).subscribe(options);
                    });
            });

        return {
            dispose: function () {
                disposable && disposable.dispose();
                disposable = undefined;
            }
        };
    });
}

},{"../../Falcor":3,"./../../ModelResponse":6}],9:[function(_dereq_,module,exports){
var combineOperations = _dereq_('./../support/combineOperations');
var setSeedsOrOnNext = _dereq_('./../support/setSeedsOrOnNext');

/**
 * The initial args that are passed into the async request pipeline.
 * @see lib/falcor/operations/request.js for how initialArgs are used
 */
module.exports = function getInitialArgs(options, seeds, onNext) {
    var seedRequired = options.format !== 'AsValues';
    var isProgressive = options.operationIsProgressive;
    var spreadOperations = false;
    var operations =
        combineOperations(
            options.operationArgs, options.format, 'get',
            spreadOperations, isProgressive);
    setSeedsOrOnNext(
        operations, seedRequired, seeds, onNext, options.operationSelector);
    var requestOptions;
    return [operations];
};

},{"./../support/combineOperations":25,"./../support/setSeedsOrOnNext":38}],10:[function(_dereq_,module,exports){
var getSourceObserver = _dereq_('./../support/getSourceObserever');
var partitionOperations = _dereq_('./../support/partitionOperations');
var mergeBoundPath = _dereq_('./../support/mergeBoundPath');

module.exports = getSourceRequest;

function getSourceRequest(
    options, onNext, seeds, combinedResults, requestOptions, cb) {

    var model = options.operationModel;
    var boundPath = model._path;
    var missingPaths = combinedResults.requestedMissingPaths;
    if (boundPath.length) {
        for (var i = 0; i < missingPaths.length; ++i) {
            var pathSetIndex = missingPaths[i].pathSetIndex;
            var path = missingPaths[i] = boundPath.concat(missingPaths[i]);
            path.pathSetIndex = pathSetIndex;
        }
    }

    return model._request.get(
        missingPaths,
        combinedResults.optimizedMissingPaths,
        getSourceObserver(
            model,
            missingPaths,
            function getSourceCallback(err, results) {
                if (err) {
                    cb(err);
                    return;
                }

                // partitions the operations by their pathSetIndex
                var partitionOperationsAndSeeds = partitionOperations(
                    results,
                    seeds,
                    options.format,
                    onNext);

                // We allow for the rerequesting to happen.
                cb(null, partitionOperationsAndSeeds);
            }));
}


},{"./../support/getSourceObserever":26,"./../support/mergeBoundPath":30,"./../support/partitionOperations":33}],11:[function(_dereq_,module,exports){
var getInitialArgs = _dereq_('./getInitialArgs');
var getSourceRequest = _dereq_('./getSourceRequest');
var shouldRequest = _dereq_('./shouldRequest');
var request = _dereq_('./../request');
var processOperations = _dereq_('./../support/processOperations');
var get = request(
    getInitialArgs,
    getSourceRequest,
    processOperations,
    shouldRequest);

module.exports = get;

},{"./../request":16,"./../support/processOperations":35,"./getInitialArgs":9,"./getSourceRequest":10,"./shouldRequest":12}],12:[function(_dereq_,module,exports){
module.exports = function(model, combinedResults) {
    return model._dataSource && combinedResults.requestedMissingPaths.length > 0;
};

},{}],13:[function(_dereq_,module,exports){
var ModelResponse = _dereq_('../ModelResponse');
var get = _dereq_('./get');
var set = _dereq_('./set');
var invalidate = _dereq_('./invalidate');

module.exports = function modelOperation(name) {
    return function() {
        var model = this, root = model._root,
            args = Array.prototype.slice.call(arguments),
            selector = args[args.length - 1];
        if (typeof selector === 'function') {
            args.pop();
        } else {
            selector = false;
        }

        var modelResponder;
        switch (name) {
            case 'get':
                modelResponder = get;
                break;
            case 'set':
                modelResponder = set;
                break;
            case 'invalidate':
                modelResponder = invalidate;
                break;
        }
        return ModelResponse.fromOperation(
            model,
            args,
            selector,
            modelResponder);
    };
};

},{"../ModelResponse":6,"./get":11,"./invalidate":14,"./set":18}],14:[function(_dereq_,module,exports){
var invalidateInitialArgs = _dereq_('./invalidateInitialArgs');
var request = _dereq_('./../request');
var processOperations = _dereq_('./../support/processOperations');
var invalidate = request(
    invalidateInitialArgs,
    null,
    processOperations);

module.exports = invalidate;

},{"./../request":16,"./../support/processOperations":35,"./invalidateInitialArgs":15}],15:[function(_dereq_,module,exports){
var combineOperations = _dereq_('./../support/combineOperations');
var setSeedsOrOnNext = _dereq_('./../support/setSeedsOrOnNext');
module.exports = function getInitialArgs(options, seeds, onNext) {
    var seedRequired = options.format !== 'AsValues';
    var operations = combineOperations(
        options.operationArgs, options.format, 'inv');
    setSeedsOrOnNext(
        operations, seedRequired, seeds,
        onNext, options.operationSelector);

    return [operations, seeds];
};

},{"./../support/combineOperations":25,"./../support/setSeedsOrOnNext":38}],16:[function(_dereq_,module,exports){
var setSeedsOrOnNext = _dereq_('./support/setSeedsOrOnNext');
var onNextValues = _dereq_('./support/onNextValue');
var onCompletedOrError = _dereq_('./support/onCompletedOrError');
var primeSeeds = _dereq_('./support/primeSeeds');
var autoFalse = function() { return false; };

module.exports = request;

function request(initialArgs, sourceRequest, processOperations, shouldRequestFn, finalize) {
    if (!shouldRequestFn) {
        shouldRequestFn = autoFalse;
    }
    if(!finalize) {
        finalize = onCompletedOrError;
    }
    return function innerRequest(options) {
        var selector = options.operationSelector;
        var model = options.operationModel;
        var args = options.operationArgs;
        var onNext = options.onNext.bind(options);
        var onError = options.onError.bind(options);
        var onCompleted = options.onCompleted.bind(options);
        var isProgressive = options.operationIsProgressive;
        var errorSelector = options.errorSelector || model._errorSelector;
        var comparator = options.comparator || model._comparator;
        var selectorLength = selector && selector.length || 0;

        // State variables
        var errors = [];
        var format = options.format = selector && 'AsJSON' ||
            options.format || 'AsPathMap';
        var toJSONG = format === 'AsJSONG';
        var toJSON = format === 'AsPathMap';
        var toPathValues = format === 'AsValues';
        var seedRequired = toJSON || toJSONG || selector;
        var boundPath = model._path;
        var i, len;
        var foundValue = false;
        var seeds = primeSeeds(selector, selectorLength);
        var loopCount = 0;

        function recurse(operations, opts) {
            if (loopCount > 50) {
                throw 'Loop Kill switch thrown.';
            }
            var combinedResults = processOperations(
                model,
                operations,
                errorSelector,
                loopCount > 0 ? comparator : null,
                opts);

            foundValue = foundValue || combinedResults.valuesReceived;
            if (combinedResults.errors.length) {
                errors = errors.concat(combinedResults.errors);
            }

            // if in progressiveMode, values are emitted
            // each time through the recurse loop.  This may have
            // to change when the router is considered.
            if (isProgressive && !toPathValues) {
                onNextValues(model, onNext, seeds, selector);
            }

            // Performs the recursing via dataSource
            if (shouldRequestFn(model, combinedResults, loopCount)) {
                sourceRequest(
                    options,
                    onNext,
                    seeds,
                    combinedResults,
                    opts,
                    function onCompleteFromSourceSet(err, results) {
                        if (err) {
                            errors = errors.concat(err);
                            recurse([], seeds);
                            return;
                        }
                        ++loopCount;

                        // We continue to string the opts through
                        recurse(results, opts);
                    });
            }

            // Else we need to onNext values and complete/error.
            else {
                if (!toPathValues && !isProgressive && foundValue) {
                    onNextValues(model, onNext, seeds, selector);
                }
                finalize(model, onCompleted, onError, errors);
            }
        }

        try {
            recurse.apply(null,
                initialArgs(options, seeds, onNext));
        } catch(e) {
            errors = [e];
            finalize(model, onCompleted, onError, errors);
        }
    };
}

},{"./support/onCompletedOrError":31,"./support/onNextValue":32,"./support/primeSeeds":34,"./support/setSeedsOrOnNext":38}],17:[function(_dereq_,module,exports){
var collect = _dereq_('../../../lru/collect');
var onCompletedOrError = _dereq_('../support/onCompletedOrError');

module.exports = function finalizeAndCollect(model, onCompleted, onError, errors) {
    onCompletedOrError(model, onCompleted, onError, errors);
    collect(
        model._root,
        model._root.expired,
        model._version,
        model._cache.$size || 0,
        model._maxSize,
        model._collectRatio
    );
};

},{"../../../lru/collect":85,"../support/onCompletedOrError":31}],18:[function(_dereq_,module,exports){
var setInitialArgs = _dereq_('./setInitialArgs');
var setSourceRequest = _dereq_('./setSourceRequest');
var request = _dereq_('./../request');
var setProcessOperations = _dereq_('./setProcessOperations');
var shouldRequest = _dereq_('./shouldRequest');
var finalize = _dereq_('./finalizeAndCollect');
var set = request(
    setInitialArgs,
    setSourceRequest,
    setProcessOperations,
    shouldRequest,
    finalize
);

module.exports = set;

},{"./../request":16,"./finalizeAndCollect":17,"./setInitialArgs":19,"./setProcessOperations":20,"./setSourceRequest":21,"./shouldRequest":22}],19:[function(_dereq_,module,exports){
var combineOperations = _dereq_('./../support/combineOperations');
var setSeedsOrOnNext = _dereq_('./../support/setSeedsOrOnNext');
var Formats = _dereq_('./../support/Formats');
var toPathValues = Formats.toPathValues;
var toJSONG = Formats.toJSONG;
module.exports = function setInitialArgs(options, seeds, onNext) {
    var isPathValues = options.format === toPathValues;
    var seedRequired = !isPathValues;
    var shouldRequest = Boolean(options.operationModel._dataSource);
    var format = options.format;
    var args = options.operationArgs;
    var selector = options.operationSelector;
    var isProgressive = options.operationIsProgressive;
    var firstSeeds, operations;
    var requestOptions = {
        removeBoundPath: shouldRequest
    };

    // If Model is a slave, in shouldRequest mode,
    // a single seed is required to accumulate the jsong results.
    if (shouldRequest) {
        operations =
            combineOperations(args, toJSONG, 'set', selector, false);
        firstSeeds = [{}];
        setSeedsOrOnNext(
            operations, true, firstSeeds, false, options.selector);

        // we must keep track of the set seeds.
        requestOptions.requestSeed = firstSeeds[0];
    }

    // This model is the master, therefore a regular set can be performed.
    else {
        firstSeeds = seeds;
        operations = combineOperations(args, format, 'set');
        setSeedsOrOnNext(
            operations, seedRequired, seeds, onNext, options.operationSelector);
    }

    // We either have to construct the master operations if
    // the ModelResponse is isProgressive
    // the ModelResponse is toPathValues
    // but luckily we can just perform a get for the progressive or
    // toPathValues mode.
    if (isProgressive || isPathValues) {
        var getOps = combineOperations(
            args, format, 'get', selector, true);
        setSeedsOrOnNext(
            getOps, seedRequired, seeds, onNext, options.operationSelector);
        operations = operations.concat(getOps);

        requestOptions.isProgressive = true;
    }

    return [operations, requestOptions];
};

},{"./../support/Formats":23,"./../support/combineOperations":25,"./../support/setSeedsOrOnNext":38}],20:[function(_dereq_,module,exports){
var processOperations = _dereq_('./../support/processOperations');
var combineOperations = _dereq_('./../support/combineOperations');
var mergeBoundPath = _dereq_('./../support/mergeBoundPath');
var Formats = _dereq_('./../support/Formats');
var toPathValues = Formats.toPathValues;

module.exports = setProcessOperations;

function setProcessOperations(model, operations, errorSelector, comparator, requestOptions) {

    var boundPath = model._path;
    var hasBoundPath = boundPath.length > 0;
    var removeBoundPath = requestOptions && requestOptions.removeBoundPath;
    var isProgressive = requestOptions && requestOptions.isProgressive;
    var progressiveOperations;

    // if in progressive mode, then the progressive operations
    // need to be executed but the bound path must stay intact.
    if (isProgressive && removeBoundPath && hasBoundPath) {
        progressiveOperations = operations.filter(function(op) {
            return op.isProgressive;
        });
        operations = operations.filter(function(op) {
            return !op.isProgressive;
        });
    }

    if (removeBoundPath && hasBoundPath) {
        model._path = [];

        // For every operations arguments, the bound path must be adjusted.
        for (var i = 0, opLen = operations.length; i < opLen; i++) {
            var args = operations[i].args;
            for (var j = 0, argsLen = args.length; j < argsLen; j++) {
                args[j] = mergeBoundPath(args[j], boundPath);
            }
        }
    }

    var results = processOperations(model, operations, errorSelector, comparator);

    // We need to set the requestSeed to be the optimizedPaths only.
    // The bound path must be removed for this to work.
    if (removeBoundPath && model._dataSource && results.optimizedPaths) {
        var requestSeed = requestOptions.requestSeed = {};
        model._getPathSetsAsJSONG(model, results.optimizedPaths, [requestSeed]);
    }

    // Undo what we have done to the model's bound path.
    if (removeBoundPath && hasBoundPath) {
        model._path = boundPath;
    }

    // executes the progressive ops
    if (progressiveOperations) {
        processOperations(model, progressiveOperations, errorSelector, comparator);
    }

    return results;
}

},{"./../support/Formats":23,"./../support/combineOperations":25,"./../support/mergeBoundPath":30,"./../support/processOperations":35}],21:[function(_dereq_,module,exports){
var getSourceObserver = _dereq_('./../support/getSourceObserever');
var combineOperations = _dereq_('./../support/combineOperations');
var setSeedsOrOnNext = _dereq_('./../support/setSeedsOrOnNext');
var toPathValues = _dereq_('./../support/Formats').toPathValues;

module.exports = setSourceRequest;

function setSourceRequest(
        options, onNext, seeds, combinedResults, requestOptions, cb) {
    var model = options.operationModel;
    var seedRequired = options.format !== toPathValues;
    var requestSeed = requestOptions.requestSeed;
    return model._request.set(
        requestSeed,
        getSourceObserver(
            model,
            requestSeed.paths,
            function setSourceRequestCB(err, results) {
                if (err) {
                    cb(err);
                }

                // Sets the results into the model.
                model._setJSONGsAsJSON(model, [results], []);

                // Gets the original paths / maps back out.
                var operations = combineOperations(
                        options.operationArgs, options.format, 'get');
                setSeedsOrOnNext(
                    operations, seedRequired,
                    seeds, onNext, options.operationSelector);

                // unset the removeBoundPath.
                requestOptions.removeBoundPath = false;

                cb(null, operations);
            }));
}


},{"./../support/Formats":23,"./../support/combineOperations":25,"./../support/getSourceObserever":26,"./../support/setSeedsOrOnNext":38}],22:[function(_dereq_,module,exports){
// Set differs from get in the sense that the first time through
// the recurse loop a server operation must be performed if it can be.
module.exports = function(model, combinedResults, loopCount) {
    return model._dataSource && (
        combinedResults.requestedMissingPaths.length > 0 ||
        loopCount === 0);
};

},{}],23:[function(_dereq_,module,exports){
module.exports = {
    toPathValues: 'AsValues',
    toJSON: 'AsPathMap',
    toJSONG: 'AsJSONG',
    selector: 'AsJSON'
};

},{}],24:[function(_dereq_,module,exports){
module.exports = function buildJSONGOperation(format, seeds, jsongOp, seedOffset, onNext) {
    return {
        methodName: '_setJSONGs' + format,
        format: format,
        isValues: format === 'AsValues',
        onNext: onNext,
        seeds: seeds,
        seedsOffset: seedOffset,
        args: [jsongOp]
    };
};

},{}],25:[function(_dereq_,module,exports){
var isSeedRequired = _dereq_('./seedRequired');
var isJSONG = _dereq_('./isJSONG');
var isPathOrPathValue = _dereq_('./isPathOrPathValue');
var Formats = _dereq_('./Formats');
var toSelector = Formats.selector;
module.exports = function combineOperations(args, format, name, spread, isProgressive) {
    var seedRequired = isSeedRequired(format);
    var isValues = !seedRequired;
    var hasSelector = seedRequired && format === toSelector;
    var seedsOffset = 0;

    return args.
        reduce(function(groups, argument) {
            var group = groups[groups.length - 1];
            var type  = isPathOrPathValue(argument) ? "PathSets" :
                isJSONG(argument) ? "JSONGs" : "PathMaps";
            var groupType = group && group.type;
            var methodName = '_' + name + type + format;

            if (!groupType || type !== groupType || spread) {
                group = {
                    methodName: methodName,
                    format: format,
                    operation: name,
                    isValues: isValues,
                    seeds: [],
                    onNext: null,
                    seedsOffset: seedsOffset,
                    isProgressive: isProgressive,
                    type: type,
                    args: []
                };
                groups.push(group);
            }
            if (hasSelector) {
                ++seedsOffset;
            }
            group.args.push(argument);
            return groups;
        }, []);
};

},{"./Formats":23,"./isJSONG":28,"./isPathOrPathValue":29,"./seedRequired":36}],26:[function(_dereq_,module,exports){
var insertErrors = _dereq_('./insertErrors.js');
/**
 * creates the model source observer
 * @param {Model} model
 * @param {Array.<Array>} requestedMissingPaths
 * @param {Function} cb
 */
function getSourceObserver(model, requestedMissingPaths, cb) {
    var incomingValues;
    return {
        onNext: function(jsongEnvelop) {
            incomingValues = {
                jsong: jsongEnvelop.jsong,
                paths: requestedMissingPaths
            };
        },
        onError: function(err) {
            cb(insertErrors(model, requestedMissingPaths, err));
        },
        onCompleted: function() {
            cb(false, incomingValues);
        }
    };
}

module.exports = getSourceObserver;

},{"./insertErrors.js":27}],27:[function(_dereq_,module,exports){
/**
 * will insert the error provided for every requestedPath.
 * @param {Model} model
 * @param {Array.<Array>} requestedPaths
 * @param {Object} err
 */
module.exports = function insertErrors(model, requestedPaths, err) {
    var out = model._setPathSetsAsJSON.apply(null, [model].concat(
        requestedPaths.
            reduce(function(acc, r) {
                acc[0].push({
                    path: r,
                    value: err
                });
                return acc;
            }, [[]]),
        [[]],
        model._errorSelector,
        model._comparator
    ));
    return out.errors;
};


},{}],28:[function(_dereq_,module,exports){
module.exports = function isJSONG(x) {
    return x.hasOwnProperty("jsong");
};

},{}],29:[function(_dereq_,module,exports){
module.exports = function isPathOrPathValue(x) {
    return Array.isArray(x) || (
        x.hasOwnProperty("path") && x.hasOwnProperty("value"));
};

},{}],30:[function(_dereq_,module,exports){
var isJSONG = _dereq_('./isJSONG');
var isPathValue = _dereq_('./isPathOrPathValue');

module.exports =  mergeBoundPath;

function mergeBoundPath(arg, boundPath) {
    return isJSONG(arg) && mergeBoundPathIntoJSONG(arg, boundPath) ||
        isPathValue(arg) && mergeBoundPathIntoPathValue(arg, boundPath) ||
        mergeBoundPathIntoJSON(arg, boundPath);
}

function mergeBoundPathIntoJSONG(jsongEnv, boundPath) {
    var newJSONGEnv = {jsong: jsongEnv.jsong, paths: jsongEnv.paths};
    if (boundPath.length) {
        var paths = [];
        for (i = 0, len = jsongEnv.paths.length; i < len; i++) {
            paths[i] = boundPath.concat(jsongEnv.paths[i]);
        }
        newJSONGEnv.paths = paths;
    }

    return newJSONGEnv;
}

function mergeBoundPathIntoJSON(arg, boundPath) {
    var newArg = arg;
    if (boundPath.length) {
        newArg = {};
        for (var i = 0, len = boundPath.length - 1; i < len; i++) {
            newArg[boundPath[i]] = {};
        }
        newArg[boundPath[i]] = arg;
    }

    return newArg;
}

function mergeBoundPathIntoPathValue(arg, boundPath) {
    return {
        path: boundPath.concat(arg.path),
        value: arg.value
    };
}

},{"./isJSONG":28,"./isPathOrPathValue":29}],31:[function(_dereq_,module,exports){
module.exports = function onCompletedOrError(model, onCompleted, onError, errors) {
    if (errors.length) {
        onError(errors);
    } else {
        onCompleted();
    }
};

},{}],32:[function(_dereq_,module,exports){
/**
 * will onNext the observer with the seeds provided.
 * @param {Model} model
 * @param {Function} onNext
 * @param {Array.<Object>} seeds
 * @param {Function} [selector]
 */
module.exports = function onNextValues(model, onNext, seeds, selector) {
    var root = model._root;

    root.allowSync++;
    try {
        if (selector) {
            if (seeds.length) {
                // they should be wrapped in json items
                onNext(selector.apply(model, seeds.map(function(x, i) {
                    return x.json;
                })));
            } else {
                onNext(selector.call(model));
            }
        } else {
            // this means there is an onNext function that is not AsValues or progressive,
            // therefore there must only be one onNext call, which should only be the 0
            // index of the values of the array
            onNext(seeds[0]);
        }
    } catch (err) {
        throw err;
    } finally {
        root.allowSync--;
    }
};

},{}],33:[function(_dereq_,module,exports){
var buildJSONGOperation = _dereq_('./buildJSONGOperation');

/**
 * It performs the opposite of combine operations.  It will take a JSONG
 * response and partition them into the required amount of operations.
 * @param {{jsong: {}, paths:[]}} jsongResponse
 */
module.exports = partitionOperations;

function partitionOperations(
        jsongResponse, seeds, format, onNext) {

    var partitionedOps = [];
    var requestedMissingPaths = jsongResponse.paths;

    if (format === 'AsJSON') {
        // fast collapse ass the requestedMissingPaths into their
        // respective groups
        var opsFromRequestedMissingPaths = [];
        var op = null;
        for (var i = 0, len = requestedMissingPaths.length; i < len; i++) {
            var missingPath = requestedMissingPaths[i];
            if (!op || op.idx !== missingPath.pathSetIndex) {
                op = {
                    idx: missingPath.pathSetIndex,
                    paths: []
                };
                opsFromRequestedMissingPaths.push(op);
            }
            op.paths.push(missingPath);
        }
        opsFromRequestedMissingPaths.forEach(function(op, i) {
            var seed = [seeds[op.idx]];
            var jsong = {
                jsong: jsongResponse.jsong,
                paths: op.paths
            };
            partitionedOps.push(buildJSONGOperation(
                format,
                seed,
                jsong,
                op.idx,
                onNext));
        });
    } else {
        partitionedOps[0] = buildJSONGOperation(format, seeds, jsongResponse, 0, onNext);
    }
    return partitionedOps;
}


},{"./buildJSONGOperation":24}],34:[function(_dereq_,module,exports){
module.exports = function primeSeeds(selector, selectorLength) {
    var seeds = [];
    if (selector) {
        for (i = 0; i < selectorLength; i++) {
            seeds.push({});
        }
    } else {
        seeds[0] = {};
    }
    return seeds;
};

},{}],35:[function(_dereq_,module,exports){
module.exports = function processOperations(model, operations, errorSelector, comparator, boundPath) {
    return operations.reduce(function(memo, operation) {

        var jsonGraphOperation = model[operation.methodName];
        var seedsOrFunction = operation.isValues ?
            operation.onNext : operation.seeds;
        var results = jsonGraphOperation(
            model,
            operation.args,
            seedsOrFunction,
            errorSelector,
            comparator,
            boundPath);
        var missing = results.requestedMissingPaths;
        var offset = operation.seedsOffset;

        for (var i = 0, len = missing.length; i < len; i++) {
            missing[i].boundPath = boundPath;
            missing[i].pathSetIndex += offset;
        }

        memo.requestedMissingPaths = memo.requestedMissingPaths.concat(missing);
        memo.optimizedMissingPaths = memo.optimizedMissingPaths.concat(results.optimizedMissingPaths);
        memo.optimizedPaths = memo.optimizedPaths.concat(results.optimizedPaths);
        memo.errors = memo.errors.concat(results.errors);
        memo.valuesReceived = memo.valuesReceived || results.requestedPaths.length > 0;

        return memo;
    }, {
        errors: [],
        requestedMissingPaths: [],
        optimizedMissingPaths: [],
        optimizedPaths: [],
        valuesReceived: false
    });
}

},{}],36:[function(_dereq_,module,exports){
module.exports = function isSeedRequired(format) {
    return format === 'AsJSON' || format === 'AsJSONG' || format === 'AsPathMap';
};

},{}],37:[function(_dereq_,module,exports){
module.exports = function setSeedsOnGroups(groups, seeds, hasSelector) {
    var valueIndex = 0;
    var seedsLength = seeds.length;
    var j, i, len = groups.length, gLen, group;
    if (hasSelector) {
        for (i = 0; i < len && valueIndex < seedsLength; i++) {
            group = groups[i];
            gLen = gLen = group.args.length;
            for (j = 0; j < gLen && valueIndex < seedsLength; j++, valueIndex++) {
                group.seeds.push(seeds[valueIndex]);
            }
        }
    } else {
        for (i = 0; i < len && valueIndex < seedsLength; i++) {
            groups[i].seeds = seeds;
        }
    }
}

},{}],38:[function(_dereq_,module,exports){
var setSeedsOnGroups = _dereq_('./setSeedsOnGroups');
module.exports = function setSeedsOrOnNext(operations, seedRequired, seeds, onNext, selector) {
    if (seedRequired) {
        setSeedsOnGroups(operations, seeds, selector);
    } else {
        for (i = 0; i < operations.length; i++) {
            operations[i].onNext = onNext;
        }
    }
};

},{"./setSeedsOnGroups":37}],39:[function(_dereq_,module,exports){
var falcor = _dereq_('./../Falcor');
var NOOP = falcor.NOOP;
var RequestQueue = function(jsongModel, scheduler) {
    this._scheduler = scheduler;
    this._jsongModel = jsongModel;

    this._scheduled = false;
    this._requests = [];
};

RequestQueue.prototype = {
    _get: function() {
        var i = -1;
        var requests = this._requests;
        while (++i < requests.length) {
            if (!requests[i].pending && requests[i].isGet) {
                return requests[i];
            }
        }
        return requests[requests.length] = new GetRequest(this._jsongModel, this);
    },
    _set: function() {
        var i = -1;
        var requests = this._requests;

        // TODO: Set always sends off a request immediately, so there is no batching.
        while (++i < requests.length) {
            if (!requests[i].pending && requests[i].isSet) {
                return requests[i];
            }
        }
        return requests[requests.length] = new SetRequest(this._jsongModel, this);
    },

    remove: function(request) {
        for (var i = this._requests.length - 1; i > -1; i--) {
            if (this._requests[i].id === request.id && this._requests.splice(i, 1)) {
                break;
            }
        }
    },

    set: function(jsongEnv, observer) {
        var self = this;
        var disposable = self._set().batch(jsongEnv, observer).flush();

        return {
            dispose: function() {
                disposable.dispose();
            }
        };
    },

    get: function(requestedPaths, optimizedPaths, observer) {
        var self = this;
        var disposable = null;

        // TODO: get does not batch across requests.
        self._get().batch(requestedPaths, optimizedPaths, observer);

        if (!self._scheduled) {
            self._scheduled = true;
            disposable = self._scheduler.schedule(self._flush.bind(self));
        }

        return {
            dispose: function() {
                disposable.dispose();
            }
        };
    },

    _flush: function() {
        this._scheduled = false;

        var requests = this._requests, i = -1;
        var disposables = [];
        while (++i < requests.length) {
            if (!requests[i].pending) {
                disposables[disposables.length] = requests[i].flush();
            }
        }

        return {
            dispose: function() {
                disposables.forEach(function(d) { d.dispose(); });
            }
        };
    }
};

var REQUEST_ID = 0;

var SetRequest = function(model, queue) {
    var self = this;
    self._jsongModel = model;
    self._queue = queue;
    self.observers = [];
    self.jsongEnvs = [];
    self.pending = false;
    self.id = ++REQUEST_ID;
    self.isSet = true;
};

SetRequest.prototype = {
    batch: function(jsongEnv, observer) {
        var self = this;
        observer.onNext = observer.onNext || NOOP;
        observer.onError = observer.onError || NOOP;
        observer.onCompleted = observer.onCompleted || NOOP;

        if (!observer.__observerId) {
            observer.__observerId = ++REQUEST_ID;
        }
        observer._requestId = self.id;

        self.observers[self.observers.length] = observer;
        self.jsongEnvs[self.jsongEnvs.length] = jsongEnv;

        return self;
    },
    flush: function() {
        var incomingValues, query, op, len;
        var self = this;
        var jsongs = self.jsongEnvs;
        var observers = self.observers;
        var model = self._jsongModel;
        self.pending = true;

        // TODO: Set does not batch.
        return model._dataSource.
            set(jsongs[0]).
            subscribe(function(response) {
                incomingValues = response;
            }, function(err) {
                var i = -1;
                var n = observers.length;
                while (++i < n) {
                    obs = observers[i];
                    obs.onError && obs.onError(err);
                }
            }, function() {
                var i, n, obs;
                self._queue.remove(self);
                i = -1;
                n = observers.length;
                while (++i < n) {
                    obs = observers[i];
                    obs.onNext && obs.onNext({
                        jsong: incomingValues.jsong || incomingValues.value,
                        paths: incomingValues.paths
                    });
                    obs.onCompleted && obs.onCompleted();
                }
            });
    }
};



var GetRequest = function(jsongModel, queue) {
    var self = this;
    self._jsongModel = jsongModel;
    self._queue = queue;
    self.observers = [];
    self.optimizedPaths = [];
    self.requestedPaths = [];
    self.pending = false;
    self.id = ++REQUEST_ID;
    self.isGet = true;
};

GetRequest.prototype = {

    batch: function(requestedPaths, optimizedPaths, observer) {
        // TODO: Do we need to gap fill?
        var self = this;
        observer.onNext = observer.onNext || NOOP;
        observer.onError = observer.onError || NOOP;
        observer.onCompleted = observer.onCompleted || NOOP;

        if (!observer.__observerId) {
            observer.__observerId = ++REQUEST_ID;
        }
        observer._requestId = self.id;

        self.observers[self.observers.length] = observer;
        self.optimizedPaths[self.optimizedPaths.length] = optimizedPaths;
        self.requestedPaths[self.requestedPaths.length] = requestedPaths;

        return self;
    },

    flush: function() {
        var incomingValues, query, op, len;
        var self = this;
        var requested = self.requestedPaths;
        var optimized = self.optimizedPaths;
        var observers = self.observers;
        var disposables = [];
        var results = [];
        var model = self._jsongModel;
        self._scheduled = false;
        self.pending = true;

        var optimizedMaps = {};
        var requestedMaps = {};
        var r, o, i, j, obs, resultIndex;
        for (i = 0, len = requested.length; i < len; i++) {
            r = requested[i];
            o = optimized[i];
            obs = observers[i];
            for (j = 0; j < r.length; j++) {
                pathsToMapWithObservers(r[j], 0, readyNode(requestedMaps, null, obs), obs);
                pathsToMapWithObservers(o[j], 0, readyNode(optimizedMaps, null, obs), obs);
            }
        }
        return model._dataSource.
            get(collapse(optimizedMaps)).
            subscribe(function(response) {
                incomingValues = response;
            }, function(err) {
                var i = -1;
                var n = observers.length;
                while (++i < n) {
                    obs = observers[i];
                    obs.onError && obs.onError(err);
                }
            }, function() {
                var i, n, obs;
                self._queue.remove(self);
                i = -1;
                n = observers.length;
                while (++i < n) {
                    obs = observers[i];
                    obs.onNext && obs.onNext({
                        jsong: incomingValues.jsong || incomingValues.value,
                        paths: incomingValues.paths
                    });
                    obs.onCompleted && obs.onCompleted();
                }
            });
    },
    // Returns the paths that are contained within this request.
    contains: function(requestedPaths, optimizedPaths) {
        // TODO:
    }
};

function pathsToMapWithObservers(path, idx, branch, observer) {
    var curr = path[idx];

    // Object / Array
    if (typeof curr === 'object') {
        if (Array.isArray(curr)) {
            curr.forEach(function(v) {
                readyNode(branch, v, observer);
                if (path.length > idx + 1) {
                    pathsToMapWithObservers(path, idx + 1, branch[v], observer);
                }
            });
        } else {
            var from = curr.from || 0;
            var to = curr.to >= 0 ? curr.to : curr.length;
            for (var i = from; i <= to; i++) {
                readyNode(branch, i, observer);
                if (path.length > idx + 1) {
                    pathsToMapWithObservers(path, idx + 1, branch[i], observer);
                }
            }
        }
    } else {
        readyNode(branch, curr, observer);
        if (path.length > idx + 1) {
            pathsToMapWithObservers(path, idx + 1, branch[curr], observer);
        }
    }
}

/**
 * Builds the set of collapsed
 * queries by traversing the tree
 * once
 */
var charPattern = /\D/i;

function readyNode(branch, key, observer) {
    if (key === null) {
        branch.__observers = branch.__observers || [];
        !containsObserver(branch.__observers, observer) && branch.__observers.push(observer);
        return branch;
    }

    if (!branch[key]) {
        branch[key] = {__observers: []};
    }

    !containsObserver(branch[key].__observers, observer) && branch[key].__observers.push(observer);
    return branch;
}

function containsObserver(observers, observer) {
    if (!observer) {
        return;
    }
    return observers.reduce(function(acc, x) {
        return acc || x.__observerId === observer.__observerId;
    }, false);
}

function collapse(pathMap) {
    return rangeCollapse(buildQueries(pathMap));
}

/**
 * Collapse ranges, e.g. when there is a continuous range
 * in an array, turn it into an object instead
 *
 * [1,2,3,4,5,6] => {"from":1, "to":6}
 *
 */
function rangeCollapse(paths) {
    paths.forEach(function (path) {
        path.forEach(function (elt, index) {
            var range;
            if (Array.isArray(elt) && elt.every(isNumber) && allUnique(elt)) {
                elt.sort(function(a, b) {
                    return a - b;
                });
                if (elt[elt.length-1] - elt[0] === elt.length-1) {
                    // create range
                    range = {};
                    range.from = elt[0];
                    range.to = elt[elt.length-1];
                    path[index] = range;
                }
            }
        });
    });
    return paths;
}

/* jshint forin: false */
function buildQueries(root) {

    if (root == null || typeof root !== 'object') {
        return [ [] ];
    }

    var children = Object.keys(root).filter(notPathMapInternalKeys),
        child, memo, paths, key, childIsNum,
        list, head, tail, clone, results,
        i = -1, n = children.length,
        j, k, x;

    if (n === 0 || Array.isArray(root) === true) {
        return [ [] ];
    }

    memo = {};
    while(++i < n) {
        child = children[i];
        paths = buildQueries(root[child]);
        key = createKey(paths);

        childIsNum = typeof child === 'string' && !charPattern.test(child);

        if ((list = memo[key]) && (head = list.head)) {
            head[head.length] = childIsNum ? parseInt(child, 10) : child;
        } else {
            memo[key] = {
                head: [childIsNum ? parseInt(child, 10) : child],
                tail: paths
            };
        }
    }

    results = [];
    for(x in memo) {
        head = (list = memo[x]).head;
        tail = list.tail;
        i = -1;
        n = tail.length;
        while(++i < n) {
            list = tail[i];
            j = -1;
            k = list.length;
            if(head[0] === '') {
                clone = [];
            } else {
                clone = [head.length === 1 ? head[0] : head];
                while(++j < k) {
                    clone[j + 1] = list[j];
                }
            }
            results[results.length] = clone;
        }
    }
    return results;
}

function notPathMapInternalKeys(key) {
    return (
        key !== "__observers" &&
        key !== "__pending" &&
        key !== "__batchID"
        );
}

/**
 * Return true if argument is a number
 */
function isNumber(val) {
    return typeof val === "number";
}

/**
 * allUnique
 * return true if every number in an array is unique
 */
function allUnique(arr) {
    var hash = {},
        index,
        len;

    for (index = 0, len = arr.length; index < len; index++) {
        if (hash[arr[index]]) {
            return false;
        }
        hash[arr[index]] = true;
    }
    return true;
}

/**
 * Sort a list-of-lists
 * Used for generating a unique hash
 * key for each subtree; used by the
 * memoization
 */
function sortLol(lol) {
    return lol.reduce(function (result, curr) {
        if (curr instanceof Array) {
            result.push(sortLol(curr).slice(0).sort());
            return result;
        }
        return result.concat(curr);
    }, []).slice(0).sort();
}

/**
 * Create a unique hash key for a set
 * of paths
 */
function createKey(list) {
    return JSON.stringify(sortLol(list));
}
// Note: For testing
falcor.__Internals.buildQueries = buildQueries;

module.exports = RequestQueue;

},{"./../Falcor":3}],40:[function(_dereq_,module,exports){
var asap = _dereq_('asap');


function ASAPScheduler() {
}

ASAPScheduler.prototype = {
    schedule: function(action) {
        asap(action);
    }
};

module.exports = ASAPScheduler;

},{"asap":147}],41:[function(_dereq_,module,exports){
function ImmediateScheduler() {
}

ImmediateScheduler.prototype = {
    schedule: function(action) {
        action();
    }
};

module.exports = ImmediateScheduler;

},{}],42:[function(_dereq_,module,exports){
function TimeoutScheduler(delay) {
    this.delay = delay;
}

TimeoutScheduler.prototype = {
    schedule: function(action) {
        setTimeout(action, this.delay);
    }
};

module.exports = TimeoutScheduler;

},{}],43:[function(_dereq_,module,exports){
var hardLink = _dereq_('./util/hardlink');
var createHardlink = hardLink.create;
var onValue = _dereq_('./onValue');
var isExpired = _dereq_('./util/isExpired');
var $path = _dereq_('./../types/path.js');
var __context = _dereq_("../internal/context");
var promote = _dereq_('./util/lru').promote;

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
                if (type === $path) {
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

},{"../internal/context":65,"./../types/path.js":139,"./onValue":55,"./util/hardlink":57,"./util/isExpired":58,"./util/lru":61}],44:[function(_dereq_,module,exports){
var getBoundValue = _dereq_('./getBoundValue');
var isPathValue = _dereq_('./util/isPathValue');
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


},{"./getBoundValue":48,"./util/isPathValue":60}],45:[function(_dereq_,module,exports){
var getBoundValue = _dereq_('./getBoundValue');
var isPathValue = _dereq_('./util/isPathValue');
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


},{"./getBoundValue":48,"./util/isPathValue":60}],46:[function(_dereq_,module,exports){
var getBoundValue = _dereq_('./getBoundValue');
var isPathValue = _dereq_('./util/isPathValue');
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

},{"./getBoundValue":48,"./util/isPathValue":60}],47:[function(_dereq_,module,exports){
var getBoundValue = _dereq_('./getBoundValue');
var isPathValue = _dereq_('./util/isPathValue');
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


},{"./getBoundValue":48,"./util/isPathValue":60}],48:[function(_dereq_,module,exports){
var getValueSync = _dereq_('./getValueSync');
module.exports = function getBoundValue(model, path) {
    var boxed, value, shorted;

    boxed = model._boxed;
    model._boxed = true;
    value = getValueSync(model, path.concat(null));
    model._boxed = boxed;
    path = value.optimizedPath;
    shorted = value.shorted;
    value = value.value;
    while (path.length && path[path.length - 1] === null) {
        path.pop();
    }

    return {
        path: path,
        value: value,
        shorted: shorted
    };
};


},{"./getValueSync":50}],49:[function(_dereq_,module,exports){
var __generation = _dereq_('./../internal/generation');

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

},{"./../internal/generation":66}],50:[function(_dereq_,module,exports){
var followReference = _dereq_('./followReference');
var clone = _dereq_('./util/clone');
var isExpired = _dereq_('./util/isExpired');
var promote = _dereq_('./util/lru').promote;
var $path = _dereq_('./../types/path.js');
var $atom = _dereq_('./../types/atom.js');
var $error = _dereq_('./../types/error.js');

module.exports = function getValueSync(model, simplePath, noClone) {
    var root = model._cache;
    var len = simplePath.length;
    var optimizedPath = [];
    var shorted = false, shouldShort = false;
    var depth = 0;
    var key, i, next = root, type, curr = root, out, ref, refNode;
    do {
        key = simplePath[depth++];
        if (key !== null) {
            next = curr[key];
            optimizedPath[optimizedPath.length] = key;
        }

        if (!next) {
            out = undefined;
            shorted = true;
            break;
        }

        type = next.$type;

        // Up to the last key we follow references
        if (depth < len) {
            if (type === $path) {
                ref = followReference(model, root, root, next, next.value);
                refNode = ref[0];

                if (!refNode) {
                    out = undefined;
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
        throw {path: simplePath, value: out.value};
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
        optimizedPath: optimizedPath
    };
};

},{"./../types/atom.js":137,"./../types/error.js":138,"./../types/path.js":139,"./followReference":43,"./util/clone":56,"./util/isExpired":58,"./util/lru":61}],51:[function(_dereq_,module,exports){
var followReference = _dereq_('./followReference');
var onError = _dereq_('./onError');
var onMissing = _dereq_('./onMissing');
var onValue = _dereq_('./onValue');
var lru = _dereq_('./util/lru');
var hardLink = _dereq_('./util/hardlink');
var isMaterialized = _dereq_('./util/isMaterialzed');
var removeHardlink = hardLink.remove;
var splice = lru.splice;
var isExpired = _dereq_('./util/isExpired');
var permuteKey = _dereq_('./util/permuteKey');
var $path = _dereq_('./../types/path');
var $error = _dereq_('./../types/error');
var __invalidated = _dereq_("../internal/invalidated");
var prefix = _dereq_("./../internal/prefix");

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

                    if (nType && nType === $path && !isExpired(next)) {
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

},{"../internal/invalidated":68,"./../internal/prefix":73,"./../types/error":138,"./../types/path":139,"./followReference":43,"./onError":53,"./onMissing":54,"./onValue":55,"./util/hardlink":57,"./util/isExpired":58,"./util/isMaterialzed":59,"./util/lru":61,"./util/permuteKey":62}],52:[function(_dereq_,module,exports){
var walk = _dereq_('./getWalk');
module.exports = {
    getAsJSON: _dereq_('./getAsJSON')(walk),
    getAsJSONG: _dereq_('./getAsJSONG')(walk),
    getAsValues: _dereq_('./getAsValues')(walk),
    getAsPathMap: _dereq_('./getAsPathMap')(walk),
    getValueSync: _dereq_('./getValueSync'),
    getBoundValue: _dereq_('./getBoundValue')
};


},{"./getAsJSON":44,"./getAsJSONG":45,"./getAsPathMap":46,"./getAsValues":47,"./getBoundValue":48,"./getValueSync":50,"./getWalk":51}],53:[function(_dereq_,module,exports){
var lru = _dereq_('./util/lru');
var clone = _dereq_('./util/clone');
var promote = lru.promote;
module.exports = function onError(model, node, permuteRequested, permuteOptimized, outerResults) {
    outerResults.errors.push({path: permuteRequested, value: node.value});
    promote(model, node);
};


},{"./util/clone":56,"./util/lru":61}],54:[function(_dereq_,module,exports){
var support = _dereq_('./util/support');
var fastCat = support.fastCat,
    fastCatSkipNulls = support.fastCatSkipNulls,
    fastCopy = support.fastCopy;
var isExpired = _dereq_('./util/isExpired');
var spreadJSON = _dereq_('./util/spreadJSON');
var clone = _dereq_('./util/clone');

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


},{"./util/clone":56,"./util/isExpired":58,"./util/spreadJSON":63,"./util/support":64}],55:[function(_dereq_,module,exports){
var lru = _dereq_('./util/lru');
var clone = _dereq_('./util/clone');
var promote = lru.promote;
var $path = _dereq_('./../types/path');
var $atom = _dereq_('./../types/atom');
var $error = _dereq_('./../types/error');
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
    else if (node.$type === $path || node.$type === $error) {
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



},{"./../types/atom":137,"./../types/error":138,"./../types/path":139,"./util/clone":56,"./util/lru":61}],56:[function(_dereq_,module,exports){
// Copies the node
var prefix = _dereq_("../../internal/prefix");
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


},{"../../internal/prefix":73}],57:[function(_dereq_,module,exports){
var __ref = _dereq_("../../internal/ref");
var __context = _dereq_("../../internal/context");
var __ref_index = _dereq_("../../internal/ref-index");
var __refs_length = _dereq_("../../internal/refs-length");

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
            context[__ref + idx] = context[__REF + idx + 1];
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

},{"../../internal/context":65,"../../internal/ref":76,"../../internal/ref-index":75,"../../internal/refs-length":77}],58:[function(_dereq_,module,exports){
var now = _dereq_('../../support/now');
module.exports = function isExpired(node) {
    var $expires = node.$expires === undefined && -1 || node.$expires;
    return $expires !== -1 && $expires !== 1 && ($expires === 0 || $expires < now());
};

},{"../../support/now":123}],59:[function(_dereq_,module,exports){
module.exports = function isMaterialized(model) {
    return model._materialized && !(model._router || model._dataSource);
};

},{}],60:[function(_dereq_,module,exports){
module.exports = function(x) {
    return x.path && x.value;
};
},{}],61:[function(_dereq_,module,exports){
var __head = _dereq_("../../internal/head");
var __tail = _dereq_("../../internal/tail");
var __next = _dereq_("../../internal/next");
var __prev = _dereq_("../../internal/prev");
var __invalidated = _dereq_("../../internal/invalidated");

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
},{"../../internal/head":67,"../../internal/invalidated":68,"../../internal/next":70,"../../internal/prev":74,"../../internal/tail":78}],62:[function(_dereq_,module,exports){
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


},{}],63:[function(_dereq_,module,exports){
var fastCopy = _dereq_('./support').fastCopy;
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

},{"./support":64}],64:[function(_dereq_,module,exports){


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

},{}],65:[function(_dereq_,module,exports){
module.exports = _dereq_("./prefix") + "context";
},{"./prefix":73}],66:[function(_dereq_,module,exports){
module.exports = _dereq_("./prefix") + "generation";
},{"./prefix":73}],67:[function(_dereq_,module,exports){
module.exports = _dereq_("./prefix") + "head";
},{"./prefix":73}],68:[function(_dereq_,module,exports){
module.exports = _dereq_("./prefix") + "invalidated";
},{"./prefix":73}],69:[function(_dereq_,module,exports){
module.exports = _dereq_("./prefix") + "key";
},{"./prefix":73}],70:[function(_dereq_,module,exports){
module.exports = _dereq_("./prefix") + "next";
},{"./prefix":73}],71:[function(_dereq_,module,exports){
module.exports = _dereq_("./prefix") + "offset";
},{"./prefix":73}],72:[function(_dereq_,module,exports){
module.exports = _dereq_("./prefix") + "parent";
},{"./prefix":73}],73:[function(_dereq_,module,exports){
// This may look like an empty string, but it's actually a single zero-width-space character.
module.exports = "​";
},{}],74:[function(_dereq_,module,exports){
module.exports = _dereq_("./prefix") + "prev";
},{"./prefix":73}],75:[function(_dereq_,module,exports){
module.exports = _dereq_("./prefix") + "ref-index";
},{"./prefix":73}],76:[function(_dereq_,module,exports){
module.exports = _dereq_("./prefix") + "ref";
},{"./prefix":73}],77:[function(_dereq_,module,exports){
module.exports = _dereq_("./prefix") + "refs-length";
},{"./prefix":73}],78:[function(_dereq_,module,exports){
module.exports = _dereq_("./prefix") + "tail";
},{"./prefix":73}],79:[function(_dereq_,module,exports){
module.exports = _dereq_("./prefix") + "version";
},{"./prefix":73}],80:[function(_dereq_,module,exports){
module.exports = {
    invPathSetsAsJSON: _dereq_("./invalidate-path-sets-as-json-dense"),
    invPathSetsAsJSONG: _dereq_("./invalidate-path-sets-as-json-graph"),
    invPathSetsAsPathMap: _dereq_("./invalidate-path-sets-as-json-sparse"),
    invPathSetsAsValues: _dereq_("./invalidate-path-sets-as-json-values")
};
},{"./invalidate-path-sets-as-json-dense":81,"./invalidate-path-sets-as-json-graph":82,"./invalidate-path-sets-as-json-sparse":83,"./invalidate-path-sets-as-json-values":84}],81:[function(_dereq_,module,exports){
module.exports = invalidate_path_sets_as_json_dense;

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");
var array_slice = _dereq_("../support/array-slice");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var update_graph = _dereq_("../support/update-graph");
var invalidate_node = _dereq_("../support/invalidate-node");

var collect = _dereq_("../lru/collect");

var positions = _dereq_("../support/positions");
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

    collect(
        roots.lru,
        roots.expired,
        roots.version,
        roots.root.$size || 0,
        model._maxSize,
        model._collectRatio
    );

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

    if (is_branch) {
        parents[_cache] = nodes[_cache] = node;
        if (is_keyset && Boolean(parents[_json] = json)) {
            nodes[_json] = json[keyset] || (json[keyset] = {});
        }
        return;
    }

    nodes[_cache] = node;

    if (Boolean(json)) {
        var type = is_object(node) && node.$type || undefined;
        var jsonkey = keyset;
        if (jsonkey == null) {
            json = roots;
            jsonkey = 3;
        }
        json[jsonkey] = clone(roots, node, type, node && node.value);
    }

    var lru = roots.lru;
    var size = node.$size || 0;
    var version = roots.version;
    invalidate_node(parent, node, key, roots.lru);
    update_graph(parent, size, version, lru);
}

function onEdge(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset) {
    roots.json = roots[_json];
    roots.hasValue = true;
    roots.requestedPaths.push(array_slice(requested, roots.offset));
}
},{"../lru/collect":85,"../support/array-clone":103,"../support/array-slice":104,"../support/clone-dense-json":105,"../support/get-valid-key":113,"../support/invalidate-node":117,"../support/is-object":119,"../support/options":124,"../support/positions":126,"../support/update-graph":135,"../walk/walk-path-set":145}],82:[function(_dereq_,module,exports){
module.exports = invalidate_path_sets_as_json_graph;

var $path = _dereq_("../types/path");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set-soft-link");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var update_graph = _dereq_("../support/update-graph");
var invalidate_node = _dereq_("../support/invalidate-node");
var clone_success = _dereq_("../support/set-successful-paths");
var collect = _dereq_("../lru/collect");

var positions = _dereq_("../support/positions");
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function invalidate_path_sets_as_json_graph(model, pathsets, values) {

    var roots = options([], model);
    var index = -1;
    var count = pathsets.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];
    var json = values[0];

    roots[_cache] = roots.root;
    roots[_jsong] = parents[_jsong] = nodes[_jsong] = json.jsong || (json.jsong = {});
    roots.requestedPaths = json.paths || (json.paths = roots.requestedPaths);

    while (++index < count) {
        var pathset = pathsets[index];
        walk_path_set(onNode, onEdge, pathset, 0, roots, parents, nodes, requested, optimized);
    }

    collect(
        roots.lru,
        roots.expired,
        roots.version,
        roots.root.$size || 0,
        model._maxSize,
        model._collectRatio
    );

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
        json = parents[_jsong];
        parent = parents[_cache];
    } else {
        json = nodes[_jsong];
        parent = nodes[_cache];
    }

    var jsonkey = key;
    var node = parent[key];

    if (is_reference) {
        parents[_cache] = parent;
        nodes[_cache] = node;
        parents[_jsong] = json;
        nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        return;
    }

    var type = is_object(node) && node.$type || undefined;
    
    if (is_branch) {
        parents[_cache] = nodes[_cache] = node;
        parents[_jsong] = json;
        if (type == $path) {
            json[jsonkey] = clone(roots, node, type, node.value);
        } else {
            nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    nodes[_cache] = node;

    json[jsonkey] = clone(roots, node, type, node && node.value);

    var lru = roots.lru;
    var size = node.$size || 0;
    var version = roots.version;
    invalidate_node(parent, node, key, roots.lru);
    update_graph(parent, size, version, lru);
}

function onEdge(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset) {
    clone_success(roots, requested, optimized);
    roots.json = roots[_jsong];
    roots.hasValue = true;
}

},{"../lru/collect":85,"../support/array-clone":103,"../support/clone-dense-json":105,"../support/get-valid-key":113,"../support/invalidate-node":117,"../support/is-object":119,"../support/options":124,"../support/positions":126,"../support/set-successful-paths":129,"../support/update-graph":135,"../types/path":139,"../walk/walk-path-set-soft-link":144}],83:[function(_dereq_,module,exports){
module.exports = invalidate_path_sets_as_json_sparse;

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");
var array_slice = _dereq_("../support/array-slice");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var update_graph = _dereq_("../support/update-graph");
var invalidate_node = _dereq_("../support/invalidate-node");

var collect = _dereq_("../lru/collect");

var positions = _dereq_("../support/positions");
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function invalidate_path_sets_as_json_sparse(model, pathsets, values) {

    var roots = options([], model);
    var index = -1;
    var count = pathsets.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];
    var json = values[0];

    roots[_cache] = roots.root;
    roots[_json] = parents[_json] = nodes[_json] = json.json || (json.json = {});

    while (++index < count) {
        var pathset = pathsets[index];
        walk_path_set(onNode, onEdge, pathset, 0, roots, parents, nodes, requested, optimized);
    }

    collect(
        roots.lru,
        roots.expired,
        roots.version,
        roots.root.$size || 0,
        model._maxSize,
        model._collectRatio
    );

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

    var node = parent[key];

    if (is_reference) {
        parents[_cache] = parent;
        nodes[_cache] = node;
        return;
    }

    if (is_branch) {
        parents[_cache] = nodes[_cache] = node;
        parents[_json] = json;
        nodes[_json] = json[jsonkey] || (json[jsonkey] = {});
        return;
    }

    nodes[_cache] = node;

    var type = is_object(node) && node.$type || undefined;
    json[jsonkey] = clone(roots, node, type, node && node.value);

    var lru = roots.lru;
    var size = node.$size || 0;
    var version = roots.version;
    invalidate_node(parent, node, key, roots.lru);
    update_graph(parent, size, version, lru);
}

function onEdge(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset) {
    roots.json = roots[_json];
    roots.hasValue = true;
    roots.requestedPaths.push(array_slice(requested, roots.offset));
}
},{"../lru/collect":85,"../support/array-clone":103,"../support/array-slice":104,"../support/clone-dense-json":105,"../support/get-valid-key":113,"../support/invalidate-node":117,"../support/is-object":119,"../support/options":124,"../support/positions":126,"../support/update-graph":135,"../walk/walk-path-set":145}],84:[function(_dereq_,module,exports){
module.exports = invalidate_path_sets_as_json_values;

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");
var array_slice = _dereq_("../support/array-slice");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var update_graph = _dereq_("../support/update-graph");
var invalidate_node = _dereq_("../support/invalidate-node");

var collect = _dereq_("../lru/collect");

var positions = _dereq_("../support/positions");
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function invalidate_path_sets_as_json_values(model, pathsets, onNext) {

    var roots = options([], model);
    var index = -1;
    var count = pathsets.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];

    roots[_cache] = roots.root;
    roots.onNext = onNext;

    while (++index < count) {
        var pathset = pathsets[index];
        walk_path_set(onNode, onEdge, pathset, 0, roots, parents, nodes, requested, optimized);
    }

    collect(
        roots.lru,
        roots.expired,
        roots.version,
        roots.root.$size || 0,
        model._maxSize,
        model._collectRatio
    );

    return {
        values: null,
        errors: roots.errors,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

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

    var node = parent[key];

    if (is_reference) {
        parents[_cache] = parent;
        nodes[_cache] = node;
        return;
    }

    if (is_branch) {
        parents[_cache] = nodes[_cache] = node;
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
    var node = nodes[_cache];
    var type = is_object(node) && node.$type || undefined;
    var onNext = roots.onNext;
    if (Boolean(type) && onNext) {
        onNext({
            path: array_clone(requested),
            value: clone(roots, node, type, node && node.value)
        });
    }
    roots.requestedPaths.push(array_slice(requested, roots.offset));
}
},{"../lru/collect":85,"../support/array-clone":103,"../support/array-slice":104,"../support/clone-dense-json":105,"../support/get-valid-key":113,"../support/invalidate-node":117,"../support/is-object":119,"../support/options":124,"../support/positions":126,"../support/update-graph":135,"../walk/walk-path-set":145}],85:[function(_dereq_,module,exports){
var __head = _dereq_("../internal/head");
var __tail = _dereq_("../internal/tail");
var __next = _dereq_("../internal/next");
var __prev = _dereq_("../internal/prev");

var update_graph = _dereq_("../support/update-graph");
module.exports = function(lru, expired, version, total, max, ratio) {

    var targetSize = max * ratio;
    var node, size;

    while(Boolean(node = expired.pop())) {
        size = node.$size || 0;
        total -= size;
        update_graph(node, size, version, lru);
    }

    if(total >= max) {
        var prev = lru[__tail];
        while((total >= targetSize) && Boolean(node = prev)) {
            prev = prev[__prev];
            size = node.$size || 0;
            total -= size;
            update_graph(node, size, version, lru);
        }

        if((lru[__tail] = lru[__prev] = prev) == null) {
            lru[__head] = lru[__next] = undefined;
        } else {
            prev[__next] = undefined;
        }
    }
};
},{"../internal/head":67,"../internal/next":70,"../internal/prev":74,"../internal/tail":78,"../support/update-graph":135}],86:[function(_dereq_,module,exports){
var $expires_never = _dereq_("../values/expires-never");
var __head = _dereq_("../internal/head");
var __tail = _dereq_("../internal/tail");
var __next = _dereq_("../internal/next");
var __prev = _dereq_("../internal/prev");

var is_object = _dereq_("../support/is-object");
module.exports = function(root, node) {
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
},{"../internal/head":67,"../internal/next":70,"../internal/prev":74,"../internal/tail":78,"../support/is-object":119,"../values/expires-never":140}],87:[function(_dereq_,module,exports){
var __head = _dereq_("../internal/head");
var __tail = _dereq_("../internal/tail");
var __next = _dereq_("../internal/next");
var __prev = _dereq_("../internal/prev");

module.exports = function(root, node) {
    var head = root[__head], tail = root[__tail],
        next = node[__next], prev = node[__prev];
    (next != null && typeof next === "object") && (next[__prev] = prev);
    (prev != null && typeof prev === "object") && (prev[__next] = next);
    (node === head) && (root[__head] = root[__next] = next);
    (node === tail) && (root[__tail] = root[__prev] = prev);
    node[__next] = node[__prev] = undefined;
    head = tail = next = prev = undefined;
};
},{"../internal/head":67,"../internal/next":70,"../internal/prev":74,"../internal/tail":78}],88:[function(_dereq_,module,exports){
module.exports = {
    setPathSetsAsJSON: _dereq_('./set-json-values-as-json-dense'),
    setPathSetsAsJSONG: _dereq_('./set-json-values-as-json-graph'),
    setPathSetsAsPathMap: _dereq_('./set-json-values-as-json-sparse'),
    setPathSetsAsValues: _dereq_('./set-json-values-as-json-values'),
    
    setPathMapsAsJSON: _dereq_('./set-json-sparse-as-json-dense'),
    setPathMapsAsJSONG: _dereq_('./set-json-sparse-as-json-graph'),
    setPathMapsAsPathMap: _dereq_('./set-json-sparse-as-json-sparse'),
    setPathMapsAsValues: _dereq_('./set-json-sparse-as-json-values'),
    
    setJSONGsAsJSON: _dereq_('./set-json-graph-as-json-dense'),
    setJSONGsAsJSONG: _dereq_('./set-json-graph-as-json-graph'),
    setJSONGsAsPathMap: _dereq_('./set-json-graph-as-json-sparse'),
    setJSONGsAsValues: _dereq_('./set-json-graph-as-json-values'),
    
    setCache: _dereq_('./set-cache')
};

},{"./set-cache":89,"./set-json-graph-as-json-dense":90,"./set-json-graph-as-json-graph":91,"./set-json-graph-as-json-sparse":92,"./set-json-graph-as-json-values":93,"./set-json-sparse-as-json-dense":94,"./set-json-sparse-as-json-graph":95,"./set-json-sparse-as-json-sparse":96,"./set-json-sparse-as-json-values":97,"./set-json-values-as-json-dense":98,"./set-json-values-as-json-graph":99,"./set-json-values-as-json-sparse":100,"./set-json-values-as-json-values":101}],89:[function(_dereq_,module,exports){
module.exports = set_cache;

var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_map = _dereq_("../walk/walk-path-map");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var create_branch = _dereq_("../support/create-branch");
var wrap_node = _dereq_("../support/wrap-node");
var replace_node = _dereq_("../support/replace-node");
var graph_node = _dereq_("../support/graph-node");
var update_back_refs = _dereq_("../support/update-back-refs");
var update_graph = _dereq_("../support/update-graph");
var inc_generation = _dereq_("../support/inc-generation");

var promote = _dereq_("../lru/promote");

var positions = _dereq_("../support/positions");
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

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
    promote(roots.lru, nodes[_cache]);
}
},{"../lru/promote":86,"../support/array-clone":103,"../support/clone-dense-json":105,"../support/create-branch":111,"../support/get-valid-key":113,"../support/graph-node":114,"../support/inc-generation":115,"../support/is-object":119,"../support/options":124,"../support/positions":126,"../support/replace-node":128,"../support/update-back-refs":134,"../support/update-graph":135,"../support/wrap-node":136,"../types/atom":137,"../types/error":138,"../walk/walk-path-map":143}],90:[function(_dereq_,module,exports){
module.exports = set_json_graph_as_json_dense;

var $path = _dereq_("../types/path");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set-soft-link");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var merge_node = _dereq_("../support/merge-node");

var set_node_if_missing_path = _dereq_("../support/treat-node-as-missing-path-set");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var positions = _dereq_("../support/positions");
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
        var jsong = envelope.jsong || envelope.values || envelope.value;
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
},{"../support/array-clone":103,"../support/clone-dense-json":105,"../support/get-valid-key":113,"../support/is-object":119,"../support/merge-node":122,"../support/options":124,"../support/positions":126,"../support/set-successful-paths":129,"../support/treat-node-as-error":131,"../support/treat-node-as-missing-path-set":132,"../types/path":139,"../walk/walk-path-set-soft-link":144}],91:[function(_dereq_,module,exports){
module.exports = set_json_graph_as_json_graph;

var $path = _dereq_("../types/path");

var clone = _dereq_("../support/clone-graph-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set-soft-link");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var merge_node = _dereq_("../support/merge-node");

var set_node_if_missing_path = _dereq_("../support/treat-node-as-missing-path-set");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var promote = _dereq_("../lru/promote");

var positions = _dereq_("../support/positions");
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
        var jsong = envelope.jsong || envelope.values || envelope.value;
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

    if (is_reference) {
        parents[_cache] = parent;
        parents[_message] = messageParent;
        parents[_jsong] = json;
        nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        return;
    }

    var type = is_object(node) && node.$type || undefined;

    if (is_branch) {
        parents[_cache] = node;
        parents[_message] = message;
        parents[_jsong] = json;
        if (type == $path) {
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
},{"../lru/promote":86,"../support/array-clone":103,"../support/clone-graph-json":106,"../support/get-valid-key":113,"../support/is-object":119,"../support/merge-node":122,"../support/options":124,"../support/positions":126,"../support/set-successful-paths":129,"../support/treat-node-as-error":131,"../support/treat-node-as-missing-path-set":132,"../types/path":139,"../walk/walk-path-set-soft-link":144}],92:[function(_dereq_,module,exports){
module.exports = set_json_graph_as_json_sparse;

var $path = _dereq_("../types/path");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set-soft-link");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var merge_node = _dereq_("../support/merge-node");

var set_node_if_missing_path = _dereq_("../support/treat-node-as-missing-path-set");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var positions = _dereq_("../support/positions");
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
        var jsong = envelope.jsong || envelope.values || envelope.value;
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
        if ((length > offset) && (!type || type == $path)) {
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
},{"../support/array-clone":103,"../support/clone-dense-json":105,"../support/get-valid-key":113,"../support/is-object":119,"../support/merge-node":122,"../support/options":124,"../support/positions":126,"../support/set-successful-paths":129,"../support/treat-node-as-error":131,"../support/treat-node-as-missing-path-set":132,"../types/path":139,"../walk/walk-path-set-soft-link":144}],93:[function(_dereq_,module,exports){
module.exports = set_json_graph_as_json_values;

var $path = _dereq_("../types/path");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");
var array_slice = _dereq_("../support/array-slice");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set-soft-link");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var merge_node = _dereq_("../support/merge-node");

var set_node_if_missing_path = _dereq_("../support/treat-node-as-missing-path-set");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var positions = _dereq_("../support/positions");
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
        var jsong = envelope.jsong || envelope.values || envelope.value;
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
},{"../support/array-clone":103,"../support/array-slice":104,"../support/clone-dense-json":105,"../support/get-valid-key":113,"../support/is-object":119,"../support/merge-node":122,"../support/options":124,"../support/positions":126,"../support/set-successful-paths":129,"../support/treat-node-as-error":131,"../support/treat-node-as-missing-path-set":132,"../types/path":139,"../walk/walk-path-set-soft-link":144}],94:[function(_dereq_,module,exports){
module.exports = set_json_sparse_as_json_dense;

var $path = _dereq_("../types/path");
var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_map = _dereq_("../walk/walk-path-map");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var create_branch = _dereq_("../support/create-branch");
var wrap_node = _dereq_("../support/wrap-node");
var replace_node = _dereq_("../support/replace-node");
var graph_node = _dereq_("../support/graph-node");
var update_back_refs = _dereq_("../support/update-back-refs");
var update_graph = _dereq_("../support/update-graph");
var inc_generation = _dereq_("../support/inc-generation");

var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var positions = _dereq_("../support/positions");
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
    var optimized = [];
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
},{"../support/array-clone":103,"../support/clone-dense-json":105,"../support/create-branch":111,"../support/get-valid-key":113,"../support/graph-node":114,"../support/inc-generation":115,"../support/is-object":119,"../support/options":124,"../support/positions":126,"../support/replace-node":128,"../support/set-successful-paths":129,"../support/treat-node-as-error":131,"../support/update-back-refs":134,"../support/update-graph":135,"../support/wrap-node":136,"../types/atom":137,"../types/error":138,"../types/path":139,"../walk/walk-path-map":143}],95:[function(_dereq_,module,exports){
module.exports = set_json_sparse_as_json_graph;

var $path = _dereq_("../types/path");
var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var clone = _dereq_("../support/clone-graph-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_map = _dereq_("../walk/walk-path-map-soft-link");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var create_branch = _dereq_("../support/create-branch");
var wrap_node = _dereq_("../support/wrap-node");
var replace_node = _dereq_("../support/replace-node");
var graph_node = _dereq_("../support/graph-node");
var update_back_refs = _dereq_("../support/update-back-refs");
var update_graph = _dereq_("../support/update-graph");
var inc_generation = _dereq_("../support/inc-generation");

var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var promote = _dereq_("../lru/promote");

var positions = _dereq_("../support/positions");
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
    var optimized = [];
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
        if (type == $path) {
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
        if (type == $path) {
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
},{"../lru/promote":86,"../support/array-clone":103,"../support/clone-graph-json":106,"../support/create-branch":111,"../support/get-valid-key":113,"../support/graph-node":114,"../support/inc-generation":115,"../support/is-object":119,"../support/options":124,"../support/positions":126,"../support/replace-node":128,"../support/set-successful-paths":129,"../support/treat-node-as-error":131,"../support/update-back-refs":134,"../support/update-graph":135,"../support/wrap-node":136,"../types/atom":137,"../types/error":138,"../types/path":139,"../walk/walk-path-map-soft-link":142}],96:[function(_dereq_,module,exports){
module.exports = set_json_sparse_as_json_sparse;

var $path = _dereq_("../types/path");
var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_map = _dereq_("../walk/walk-path-map");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var create_branch = _dereq_("../support/create-branch");
var wrap_node = _dereq_("../support/wrap-node");
var replace_node = _dereq_("../support/replace-node");
var graph_node = _dereq_("../support/graph-node");
var update_back_refs = _dereq_("../support/update-back-refs");
var update_graph = _dereq_("../support/update-graph");
var inc_generation = _dereq_("../support/inc-generation");

var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var positions = _dereq_("../support/positions");
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
    var optimized = [];
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
},{"../support/array-clone":103,"../support/clone-dense-json":105,"../support/create-branch":111,"../support/get-valid-key":113,"../support/graph-node":114,"../support/inc-generation":115,"../support/is-object":119,"../support/options":124,"../support/positions":126,"../support/replace-node":128,"../support/set-successful-paths":129,"../support/treat-node-as-error":131,"../support/update-back-refs":134,"../support/update-graph":135,"../support/wrap-node":136,"../types/atom":137,"../types/error":138,"../types/path":139,"../walk/walk-path-map":143}],97:[function(_dereq_,module,exports){
module.exports = set_path_map_as_json_values;

var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_map = _dereq_("../walk/walk-path-map");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var create_branch = _dereq_("../support/create-branch");
var wrap_node = _dereq_("../support/wrap-node");
var replace_node = _dereq_("../support/replace-node");
var graph_node = _dereq_("../support/graph-node");
var update_back_refs = _dereq_("../support/update-back-refs");
var update_graph = _dereq_("../support/update-graph");
var inc_generation = _dereq_("../support/inc-generation");

var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var positions = _dereq_("../support/positions");
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
    var optimized = [];
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
},{"../support/array-clone":103,"../support/clone-dense-json":105,"../support/create-branch":111,"../support/get-valid-key":113,"../support/graph-node":114,"../support/inc-generation":115,"../support/is-object":119,"../support/options":124,"../support/positions":126,"../support/replace-node":128,"../support/set-successful-paths":129,"../support/treat-node-as-error":131,"../support/update-back-refs":134,"../support/update-graph":135,"../support/wrap-node":136,"../types/atom":137,"../types/error":138,"../walk/walk-path-map":143}],98:[function(_dereq_,module,exports){
module.exports = set_json_values_as_json_dense;

var $path = _dereq_("../types/path");
var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var create_branch = _dereq_("../support/create-branch");
var wrap_node = _dereq_("../support/wrap-node");
var invalidate_node = _dereq_("../support/invalidate-node");
var replace_node = _dereq_("../support/replace-node");
var graph_node = _dereq_("../support/graph-node");
var update_back_refs = _dereq_("../support/update-back-refs");
var update_graph = _dereq_("../support/update-graph");
var inc_generation = _dereq_("../support/inc-generation");

var set_node_if_missing_path = _dereq_("../support/treat-node-as-missing-path-set");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var positions = _dereq_("../support/positions");
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
    var optimized = [];
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
},{"../support/array-clone":103,"../support/clone-dense-json":105,"../support/create-branch":111,"../support/get-valid-key":113,"../support/graph-node":114,"../support/inc-generation":115,"../support/invalidate-node":117,"../support/is-object":119,"../support/options":124,"../support/positions":126,"../support/replace-node":128,"../support/set-successful-paths":129,"../support/treat-node-as-error":131,"../support/treat-node-as-missing-path-set":132,"../support/update-back-refs":134,"../support/update-graph":135,"../support/wrap-node":136,"../types/atom":137,"../types/error":138,"../types/path":139,"../walk/walk-path-set":145}],99:[function(_dereq_,module,exports){
module.exports = set_json_values_as_json_graph;

var $path = _dereq_("../types/path");
var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var clone = _dereq_("../support/clone-graph-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set-soft-link");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var create_branch = _dereq_("../support/create-branch");
var wrap_node = _dereq_("../support/wrap-node");
var invalidate_node = _dereq_("../support/invalidate-node");
var replace_node = _dereq_("../support/replace-node");
var graph_node = _dereq_("../support/graph-node");
var update_back_refs = _dereq_("../support/update-back-refs");
var update_graph = _dereq_("../support/update-graph");
var inc_generation = _dereq_("../support/inc-generation");

var set_node_if_missing_path = _dereq_("../support/treat-node-as-missing-path-set");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var promote = _dereq_("../lru/promote");

var positions = _dereq_("../support/positions");
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
    var optimized = [];
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
        if (type == $path) {
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
        if (type == $path) {
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
},{"../lru/promote":86,"../support/array-clone":103,"../support/clone-graph-json":106,"../support/create-branch":111,"../support/get-valid-key":113,"../support/graph-node":114,"../support/inc-generation":115,"../support/invalidate-node":117,"../support/is-object":119,"../support/options":124,"../support/positions":126,"../support/replace-node":128,"../support/set-successful-paths":129,"../support/treat-node-as-error":131,"../support/treat-node-as-missing-path-set":132,"../support/update-back-refs":134,"../support/update-graph":135,"../support/wrap-node":136,"../types/atom":137,"../types/error":138,"../types/path":139,"../walk/walk-path-set-soft-link":144}],100:[function(_dereq_,module,exports){
module.exports = set_json_values_as_json_sparse;

var $path = _dereq_("../types/path");
var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var create_branch = _dereq_("../support/create-branch");
var wrap_node = _dereq_("../support/wrap-node");
var invalidate_node = _dereq_("../support/invalidate-node");
var replace_node = _dereq_("../support/replace-node");
var graph_node = _dereq_("../support/graph-node");
var update_back_refs = _dereq_("../support/update-back-refs");
var update_graph = _dereq_("../support/update-graph");
var inc_generation = _dereq_("../support/inc-generation");

var set_node_if_missing_path = _dereq_("../support/treat-node-as-missing-path-set");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var positions = _dereq_("../support/positions");
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
    var optimized = [];
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
},{"../support/array-clone":103,"../support/clone-dense-json":105,"../support/create-branch":111,"../support/get-valid-key":113,"../support/graph-node":114,"../support/inc-generation":115,"../support/invalidate-node":117,"../support/is-object":119,"../support/options":124,"../support/positions":126,"../support/replace-node":128,"../support/set-successful-paths":129,"../support/treat-node-as-error":131,"../support/treat-node-as-missing-path-set":132,"../support/update-back-refs":134,"../support/update-graph":135,"../support/wrap-node":136,"../types/atom":137,"../types/error":138,"../types/path":139,"../walk/walk-path-set":145}],101:[function(_dereq_,module,exports){
module.exports = set_json_values_as_json_values;

var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var create_branch = _dereq_("../support/create-branch");
var wrap_node = _dereq_("../support/wrap-node");
var invalidate_node = _dereq_("../support/invalidate-node");
var replace_node = _dereq_("../support/replace-node");
var graph_node = _dereq_("../support/graph-node");
var update_back_refs = _dereq_("../support/update-back-refs");
var update_graph = _dereq_("../support/update-graph");
var inc_generation = _dereq_("../support/inc-generation");

var set_node_if_missing_path = _dereq_("../support/treat-node-as-missing-path-set");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var positions = _dereq_("../support/positions");
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
    var optimizedPath = [];

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
},{"../support/array-clone":103,"../support/clone-dense-json":105,"../support/create-branch":111,"../support/get-valid-key":113,"../support/graph-node":114,"../support/inc-generation":115,"../support/invalidate-node":117,"../support/is-object":119,"../support/options":124,"../support/positions":126,"../support/replace-node":128,"../support/set-successful-paths":129,"../support/treat-node-as-error":131,"../support/treat-node-as-missing-path-set":132,"../support/update-back-refs":134,"../support/update-graph":135,"../support/wrap-node":136,"../types/atom":137,"../types/error":138,"../walk/walk-path-set":145}],102:[function(_dereq_,module,exports){
module.exports = function(array, value) {
    var i = -1;
    var n = array.length;
    var array2 = new Array(n + 1);
    while(++i < n) { array2[i] = array[i]; }
    array2[i] = value;
    return array2;
};
},{}],103:[function(_dereq_,module,exports){
module.exports = function(array) {
    var i = -1;
    var n = array.length;
    var array2 = new Array(n);
    while(++i < n) { array2[i] = array[i]; }
    return array2;
};
},{}],104:[function(_dereq_,module,exports){
module.exports = function(array, index) {
    var i = -1;
    var n = Math.max(array.length - index, 0);
    var array2 = new Array(n);
    while(++i < n) { array2[i] = array[i + index]; }
    return array2;
};
},{}],105:[function(_dereq_,module,exports){
var $atom = _dereq_("../types/atom");
var clone = _dereq_("./clone");
module.exports = function(roots, node, type, value) {

    if(node == null || value === undefined) {
        return { $type: $atom };
    }

    if(roots.boxed == true) {
        return Boolean(type) && clone(node) || node;
    }

    return value;
}

},{"../types/atom":137,"./clone":110}],106:[function(_dereq_,module,exports){
var $atom = _dereq_("../types/atom");
var clone = _dereq_("./clone");
var is_primitive = _dereq_("./is-primitive");
module.exports = function(roots, node, type, value) {

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
}

},{"../types/atom":137,"./clone":110,"./is-primitive":120}],107:[function(_dereq_,module,exports){
var clone_requested_path = _dereq_("./clone-requested-path");
var clone_optimized_path = _dereq_("./clone-optimized-path");
module.exports = function clone_missing_path_sets(roots, pathset, depth, requested, optimized) {
    roots.requestedMissingPaths.push(clone_requested_path(roots.bound, requested, pathset, depth, roots.index));
    roots.optimizedMissingPaths.push(clone_optimized_path(optimized, pathset, depth));
}
},{"./clone-optimized-path":108,"./clone-requested-path":109}],108:[function(_dereq_,module,exports){
module.exports = function(optimized, pathset, depth) {
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
}
},{}],109:[function(_dereq_,module,exports){
var is_object = _dereq_("./is-object");
module.exports = function(bound, requested, pathset, depth, index) {
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
}
},{"./is-object":119}],110:[function(_dereq_,module,exports){
var is_object = _dereq_("./is-object");
var prefix = _dereq_("../internal/prefix");

module.exports = function(value) {
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
}
},{"../internal/prefix":73,"./is-object":119}],111:[function(_dereq_,module,exports){
// TODO: rename path to ref
var $ref = _dereq_("../types/path");
var $expired = "expired";
var replace_node = _dereq_("./replace-node");
var graph_node = _dereq_("./graph-node");
var update_back_refs = _dereq_("./update-back-refs");
var is_primitive = _dereq_("./is-primitive");
var is_expired = _dereq_("./is-expired");

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
},{"../types/path":139,"./graph-node":114,"./is-expired":118,"./is-primitive":120,"./replace-node":128,"./update-back-refs":134}],112:[function(_dereq_,module,exports){
var __ref = _dereq_("../internal/ref");
var __context = _dereq_("../internal/context");
var __ref_index = _dereq_("../internal/ref-index");
var __refs_length = _dereq_("../internal/refs-length");

module.exports = function(node) {
    var ref, i = -1, n = node[__refs_length] || 0;
    while(++i < n) {
        if((ref = node[__ref + i]) !== undefined) {
            ref[__context] = ref[__ref_index] = node[__ref + i] = undefined;
        }
    }
    node[__refs_length] = undefined
}
},{"../internal/context":65,"../internal/ref":76,"../internal/ref-index":75,"../internal/refs-length":77}],113:[function(_dereq_,module,exports){
module.exports = function(path) {
    var key, index = path.length - 1;
    do {
        if((key = path[index]) != null) {
            return key;
        }
    } while(--index > -1);
    return null;
}
},{}],114:[function(_dereq_,module,exports){
var __parent = _dereq_("../internal/parent");
var __key = _dereq_("../internal/key");
var __generation = _dereq_("../internal/generation");

module.exports = function(root, parent, node, key, generation) {
    node[__parent] = parent;
    node[__key] = key;
    node[__generation] = generation;
    return node;
}
},{"../internal/generation":66,"../internal/key":69,"../internal/parent":72}],115:[function(_dereq_,module,exports){
var generation = 0;
module.exports = function() { return generation++; }
},{}],116:[function(_dereq_,module,exports){
var version = 0;
module.exports = function() { return version++; }
},{}],117:[function(_dereq_,module,exports){
module.exports = invalidate;

var is_object = _dereq_("./is-object");
var remove_node = _dereq_("./remove-node");
var prefix = _dereq_("../internal/prefix");

function invalidate(parent, node, key, lru) {
    if(remove_node(parent, node, key, lru)) {
        var type = is_object(node) && node.$type || undefined;
        if(type == null) {
            var keys = Object.keys(node);
            for(var i = -1, n = keys.length; ++i < n;) {
                var key = keys[i];
                if(key[0] !== prefix && key[0] !== "$") {
                    invalidate(node, node[key], key, lru);
                }
            }
        }
        return true;
    }
    return false;
}
},{"../internal/prefix":73,"./is-object":119,"./remove-node":127}],118:[function(_dereq_,module,exports){
var $expires_now = _dereq_("../values/expires-now");
var $expires_never = _dereq_("../values/expires-never");
var __invalidated = _dereq_("../internal/invalidated");
var now = _dereq_("./now");
var splice = _dereq_("../lru/splice");

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

},{"../internal/invalidated":68,"../lru/splice":87,"../values/expires-never":140,"../values/expires-now":141,"./now":123}],119:[function(_dereq_,module,exports){
var obj_typeof = "object";
module.exports = function(value) {
    return value != null && typeof value == obj_typeof;
}
},{}],120:[function(_dereq_,module,exports){
var obj_typeof = "object";
module.exports = function(value) {
    return value == null || typeof value != obj_typeof;
}
},{}],121:[function(_dereq_,module,exports){
module.exports = key_to_keyset;

var __offset = _dereq_("../internal/offset");
var is_array = Array.isArray;
var is_object = _dereq_("./is-object");

function key_to_keyset(key, iskeyset) {
    if(iskeyset) {
        if(is_array(key)) {
            key = key[key[__offset]];
            return key_to_keyset(key, is_object(key));
        } else {
            return key[__offset];
        }
    }
    return key;
}


},{"../internal/offset":71,"./is-object":119}],122:[function(_dereq_,module,exports){

var $self = "./";
var $path = _dereq_("../types/path");
var $atom = _dereq_("../types/atom");
var $expires_now = _dereq_("../values/expires-now");

var is_object = _dereq_("./is-object");
var is_primitive = _dereq_("./is-primitive");
var is_expired = _dereq_("./is-expired");
var promote = _dereq_("../lru/promote");
var wrap_node = _dereq_("./wrap-node");
var graph_node = _dereq_("./graph-node");
var replace_node = _dereq_("../support/replace-node");
var update_graph  = _dereq_("../support/update-graph");
var inc_generation = _dereq_("./inc-generation");
var invalidate_node = _dereq_("./invalidate-node");

module.exports = function(roots, parent, node, messageParent, message, key, requested) {

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
                if(node[$self] == null) {
                    return graph_node(roots[0], parent, node, key, 0);
                }
                return node;
            }
        }
    } else if((node_is_object = is_object(node))) {
        type = node.$type;
    }

    var value, messageValue;

    if(type == $path) {
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
            if(messageType == $path) {
                if(node === message) {
                    // If the cache and message are the same reference,
                    // we performed a whole-branch merge of one of the
                    // grandparents. If we've previously graphed this
                    // reference, break early.
                    if(node[$self] != null) {
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
    if(Boolean(messageType) && Boolean(message[$self]) && is_expired(roots, message)) {
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
        else if(node_is_object && node[$self] == null) {
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

},{"../lru/promote":86,"../support/replace-node":128,"../support/update-graph":135,"../types/atom":137,"../types/path":139,"../values/expires-now":141,"./graph-node":114,"./inc-generation":115,"./invalidate-node":117,"./is-expired":118,"./is-object":119,"./is-primitive":120,"./wrap-node":136}],123:[function(_dereq_,module,exports){
module.exports = Date.now;
},{}],124:[function(_dereq_,module,exports){
var inc_version = _dereq_("../support/inc-version");
var getBoundValue = _dereq_('../get/getBoundValue');

/**
 * TODO: more options state tracking comments.
 */
module.exports = function(options, model, error_selector, comparator) {
    
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
    options.no_data_source = model._dataSource == null;
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
},{"../get/getBoundValue":48,"../support/inc-version":116}],125:[function(_dereq_,module,exports){
module.exports = permute_keyset;

var __offset = _dereq_("../internal/offset");
var is_array = Array.isArray;
var is_object = _dereq_("./is-object");

function permute_keyset(key) {
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
}


},{"../internal/offset":71,"./is-object":119}],126:[function(_dereq_,module,exports){
module.exports = {
    cache: 0,
    message: 1,
    jsong: 2,
    json: 3
};
},{}],127:[function(_dereq_,module,exports){
var $path = _dereq_("../types/path");
var __parent = _dereq_("../internal/parent");
var unlink = _dereq_("./unlink");
var delete_back_refs = _dereq_("./delete-back-refs");
var splice = _dereq_("../lru/splice");
var is_object = _dereq_("./is-object");

module.exports = function(parent, node, key, lru) {
    if(is_object(node)) {
        var type  = node.$type;
        if(Boolean(type)) {
            if(type == $path) { unlink(node); }
            splice(lru, node);
        }
        delete_back_refs(node);
        parent[key] = node[__parent] = undefined;
        return true;
    }
    return false;
}

},{"../internal/parent":72,"../lru/splice":87,"../types/path":139,"./delete-back-refs":112,"./is-object":119,"./unlink":133}],128:[function(_dereq_,module,exports){
var transfer_back_refs = _dereq_("./transfer-back-refs");
var invalidate_node = _dereq_("./invalidate-node");

module.exports = function(parent, node, replacement, key, lru) {
    if(node != null && node !== replacement && typeof node == "object") {
        transfer_back_refs(node, replacement);
        invalidate_node(parent, node, key, lru);
    }
    return parent[key] = replacement;
}
},{"./invalidate-node":117,"./transfer-back-refs":130}],129:[function(_dereq_,module,exports){
var array_slice = _dereq_("./array-slice");
var array_clone = _dereq_("./array-clone");
module.exports = function cloneSuccessPaths(roots, requested, optimized) {
    roots.requestedPaths.push(array_slice(requested, roots.offset));
    roots.optimizedPaths.push(array_clone(optimized));
}
},{"./array-clone":103,"./array-slice":104}],130:[function(_dereq_,module,exports){
var __ref = _dereq_("../internal/ref");
var __context = _dereq_("../internal/context");
var __refs_length = _dereq_("../internal/refs-length");

module.exports = function(node, dest) {
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
},{"../internal/context":65,"../internal/ref":76,"../internal/refs-length":77}],131:[function(_dereq_,module,exports){
var $error = _dereq_("../types/error");
var promote = _dereq_("../lru/promote");
var array_clone = _dereq_("./array-clone");
module.exports = function treatNodeAsError(roots, node, type, path) {
    if(node == null) {
        return false;
    }
    promote(roots.lru, node);
    if(type != $error || roots.errorsAsValues) {
        return false;
    }
    roots.errors.push({ path: array_clone(path), value: node.value });
    return true;
};

},{"../lru/promote":86,"../types/error":138,"./array-clone":103}],132:[function(_dereq_,module,exports){
var $atom = _dereq_("../types/atom");
var clone_misses = _dereq_("./clone-missing-path-sets");
var is_expired = _dereq_("./is-expired");

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

},{"../types/atom":137,"./clone-missing-path-sets":107,"./is-expired":118}],133:[function(_dereq_,module,exports){
var __ref = _dereq_("../internal/ref");
var __context = _dereq_("../internal/context");
var __ref_index = _dereq_("../internal/ref-index");
var __refs_length = _dereq_("../internal/refs-length");

module.exports = function(ref) {
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
},{"../internal/context":65,"../internal/ref":76,"../internal/ref-index":75,"../internal/refs-length":77}],134:[function(_dereq_,module,exports){
module.exports = update_back_refs;

var __ref = _dereq_("../internal/ref");
var __parent = _dereq_("../internal/parent");
var __version = _dereq_("../internal/version");
var __generation = _dereq_("../internal/generation");
var __refs_length = _dereq_("../internal/refs-length");

var generation = _dereq_("./inc-generation");

function update_back_refs(node, version) {
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

},{"../internal/generation":66,"../internal/parent":72,"../internal/ref":76,"../internal/refs-length":77,"../internal/version":79,"./inc-generation":115}],135:[function(_dereq_,module,exports){
var __key = _dereq_("../internal/key");
var __version = _dereq_("../internal/version");
var __parent = _dereq_("../internal/parent");
var remove_node = _dereq_("./remove-node");
var update_back_refs = _dereq_("./update-back-refs");

module.exports = function(node, offset, version, lru) {
    var child;
    while((child = node)) {
        node = child[__parent];
        if((child.$size = (child.$size || 0) - offset) <= 0 && node != null) {
            remove_node(node, child, child[__key], lru);
        } else if(child[__version] !== version) {
            update_back_refs(child, version);
        }
    }
}
},{"../internal/key":69,"../internal/parent":72,"../internal/version":79,"./remove-node":127,"./update-back-refs":134}],136:[function(_dereq_,module,exports){
var $path = _dereq_("../types/path");
var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var now = _dereq_("./now");
var clone = _dereq_("./clone");
var is_array = Array.isArray;
var is_object = _dereq_("./is-object");

// TODO: CR Wraps a node for insertion.
// TODO: CR Define default atom size values.
module.exports = function wrap_node(node, type, value) {

    var dest = node, size = 0;

    if(Boolean(type)) {
        dest = clone(node);
        size = dest.$size;
    // }
    // if(type == $path) {
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

},{"../types/atom":137,"../types/error":138,"../types/path":139,"./clone":110,"./is-object":119,"./now":123}],137:[function(_dereq_,module,exports){
module.exports = "atom";
},{}],138:[function(_dereq_,module,exports){
module.exports = "error";
},{}],139:[function(_dereq_,module,exports){
module.exports = "ref";
},{}],140:[function(_dereq_,module,exports){
module.exports = 1;
},{}],141:[function(_dereq_,module,exports){
module.exports = 0;
},{}],142:[function(_dereq_,module,exports){
module.exports = walk_path_map;

var prefix = _dereq_("../internal/prefix");
var $path = _dereq_("../types/path");

var walk_reference = _dereq_("./walk-reference");

var array_slice = _dereq_("../support/array-slice");
var array_clone    = _dereq_("../support/array-clone");
var array_append   = _dereq_("../support/array-append");

var is_expired = _dereq_("../support/is-expired");
var is_primitive = _dereq_("../support/is-primitive");
var is_object = _dereq_("../support/is-object");
var is_array = Array.isArray;

var promote = _dereq_("../lru/promote");

var positions = _dereq_("../support/positions");
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

    while(type === $path) {

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
        } else if(is_primitive(node) || ((type = node.$type) && type != $path)) {
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
            onValueType(pathmap2, keys_stack, depth, roots, parents2, nodes2, requested2, optimized2, inner_key, inner_keyset);
        }
    }
}

},{"../internal/prefix":73,"../lru/promote":86,"../support/array-append":102,"../support/array-clone":103,"../support/array-slice":104,"../support/is-expired":118,"../support/is-object":119,"../support/is-primitive":120,"../support/positions":126,"../types/path":139,"./walk-reference":146}],143:[function(_dereq_,module,exports){
module.exports = walk_path_map;

var prefix = _dereq_("../internal/prefix");
var __context = _dereq_("../internal/context");
var $path = _dereq_("../types/path");

var walk_reference = _dereq_("./walk-reference");

var array_slice = _dereq_("../support/array-slice");
var array_clone    = _dereq_("../support/array-clone");
var array_append   = _dereq_("../support/array-append");

var is_expired = _dereq_("../support/is-expired");
var is_primitive = _dereq_("../support/is-primitive");
var is_object = _dereq_("../support/is-object");
var is_array = Array.isArray;

var promote = _dereq_("../lru/promote");

var positions = _dereq_("../support/positions");
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

    while(type === $path) {

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
            } else if(is_primitive(node) || ((type = node.$type) && type != $path)) {
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
            onValueType(pathmap2, keys_stack, depth, roots, parents2, nodes2, requested2, optimized2, inner_key, inner_keyset);
        }
    }
}

},{"../internal/context":65,"../internal/prefix":73,"../lru/promote":86,"../support/array-append":102,"../support/array-clone":103,"../support/array-slice":104,"../support/is-expired":118,"../support/is-object":119,"../support/is-primitive":120,"../support/positions":126,"../types/path":139,"./walk-reference":146}],144:[function(_dereq_,module,exports){
module.exports = walk_path_set;

var $path = _dereq_("../types/path");
var empty_array = new Array(0);

var walk_reference = _dereq_("./walk-reference");

var array_slice    = _dereq_("../support/array-slice");
var array_clone    = _dereq_("../support/array-clone");
var array_append   = _dereq_("../support/array-append");

var is_expired = _dereq_("../support/is-expired");
var is_primitive = _dereq_("../support/is-primitive");
var is_object = _dereq_("../support/is-object");

var keyset_to_key  = _dereq_("../support/keyset-to-key");
var permute_keyset = _dereq_("../support/permute-keyset");

var promote = _dereq_("../lru/promote");

var positions = _dereq_("../support/positions");
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

    while(type === $path) {

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
        } else if(is_primitive(node) || ((type = node.$type) && type != $path)) {
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

},{"../lru/promote":86,"../support/array-append":102,"../support/array-clone":103,"../support/array-slice":104,"../support/is-expired":118,"../support/is-object":119,"../support/is-primitive":120,"../support/keyset-to-key":121,"../support/permute-keyset":125,"../support/positions":126,"../types/path":139,"./walk-reference":146}],145:[function(_dereq_,module,exports){
module.exports = walk_path_set;

var __context = _dereq_("../internal/context");
var $path = _dereq_("../types/path");

var walk_reference = _dereq_("./walk-reference");

var array_slice    = _dereq_("../support/array-slice");
var array_clone    = _dereq_("../support/array-clone");
var array_append   = _dereq_("../support/array-append");

var is_expired = _dereq_("../support/is-expired");
var is_primitive = _dereq_("../support/is-primitive");
var is_object = _dereq_("../support/is-object");

var keyset_to_key  = _dereq_("../support/keyset-to-key");
var permute_keyset = _dereq_("../support/permute-keyset");

var promote = _dereq_("../lru/promote");

var positions = _dereq_("../support/positions");
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

    while(type === $path) {

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
            } else if(is_primitive(node) || ((type = node.$type) && type != $path)) {
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

},{"../internal/context":65,"../lru/promote":86,"../support/array-append":102,"../support/array-clone":103,"../support/array-slice":104,"../support/is-expired":118,"../support/is-object":119,"../support/is-primitive":120,"../support/keyset-to-key":121,"../support/permute-keyset":125,"../support/positions":126,"../types/path":139,"./walk-reference":146}],146:[function(_dereq_,module,exports){
module.exports = walk_reference;

var prefix = _dereq_("../internal/prefix");
var __ref = _dereq_("../internal/ref");
var __context = _dereq_("../internal/context");
var __ref_index = _dereq_("../internal/ref-index");
var __refs_length = _dereq_("../internal/refs-length");

var is_object      = _dereq_("../support/is-object");
var is_primitive   = _dereq_("../support/is-primitive");
var array_slice    = _dereq_("../support/array-slice");
var array_append   = _dereq_("../support/array-append");

var positions = _dereq_("../support/positions");
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

},{"../internal/context":65,"../internal/prefix":73,"../internal/ref":76,"../internal/ref-index":75,"../internal/refs-length":77,"../support/array-append":102,"../support/array-slice":104,"../support/is-object":119,"../support/is-primitive":120,"../support/positions":126}],147:[function(_dereq_,module,exports){
"use strict";

// rawAsap provides everything we need except exception management.
var rawAsap = _dereq_("./raw");
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

},{"./raw":148}],148:[function(_dereq_,module,exports){
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

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],149:[function(_dereq_,module,exports){
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
            domain = _dereq_("domain");
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

}).call(this,_dereq_("FWaASH"))
},{"FWaASH":152,"domain":150}],150:[function(_dereq_,module,exports){
/*global define:false require:false */
module.exports = (function(){
	// Import Events
	var events = _dereq_('events')

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
},{"events":151}],151:[function(_dereq_,module,exports){
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

},{}],152:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

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
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],153:[function(_dereq_,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"./lib/falcor":158,"./lib/get":202,"./lib/invalidate":230,"./lib/set":238}],154:[function(_dereq_,module,exports){
module.exports=_dereq_(3)
},{"falcor-observable":305}],155:[function(_dereq_,module,exports){
var falcor = _dereq_('./Falcor');
var RequestQueue = _dereq_('./request/RequestQueue');
var ImmediateScheduler = _dereq_('./scheduler/ImmediateScheduler');
var ASAPScheduler = _dereq_('./scheduler/ASAPScheduler');
var TimeoutScheduler = _dereq_('./scheduler/TimeoutScheduler');
var ERROR = _dereq_("../types/error");
var ModelResponse = _dereq_('./ModelResponse');
var ModelDataSourceAdapter = _dereq_('./ModelDataSourceAdapter');
var call = _dereq_('./operations/call');
var operations = _dereq_('./operations');
var pathSyntax = _dereq_('falcor-path-syntax');
var getBoundValue = _dereq_('./../get/getBoundValue');
var collect = _dereq_('../lru/collect');
var slice = Array.prototype.slice;
var $ref = _dereq_('./../types/path');
var $error = _dereq_('./../types/error');
var $atom = _dereq_('./../types/atom');

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

    this._root = options.root || {
        expired: [],
        allowSync: 0,
        unsafeMode: false
    };
    if (options.cache && typeof options.cache === "object") {
        this.setCache(options.cache);
    } else {
        this._cache = {};
    }
    this._path = [];
};

Model.EXPIRES_NOW = falcor.EXPIRES_NOW;
Model.EXPIRES_NEVER = falcor.EXPIRES_NEVER;

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
    _comparator: function(a, b) { return false; },
    get: operations("get"),
    set: operations("set"),
    invalidate: operations("invalidate"),
    call: call,
    getValue: function(path) {
        return this.get(path, function(x) { return x; });
    },
    setValue: function(path, value) {
        path = pathSyntax.fromPath(path);
        return this.set(Array.isArray(path) ?
        {path: path, value: value} :
            path, function(x) { return x; });
    },
    bind: function(boundPath) {

        var model = this, root = model._root,
            paths = new Array(arguments.length - 1),
            i = -1, n = arguments.length - 1;

        boundPath = pathSyntax.fromPath(boundPath);

        while(++i < n) {
            paths[i] = pathSyntax.fromPath(arguments[i + 1]);
        }

        if(n === 0) { throw new Error("Model#bind requires at least one value path."); }

        return falcor.Observable.create(function(observer) {

            var boundModel;
            root.allowSync++;
            try {
                boundModel = model.bindSync(model._path.concat(boundPath));

                if (!boundModel) {
                    throw false;
                }
                observer.onNext(boundModel);
                observer.onCompleted();
            } catch (e) {
                return model.get.apply(model, paths.map(function(path) {
                    return boundPath.concat(path);
                }).concat(function(){})).subscribe(
                    function onNext() {},
                    function onError(err)  { observer.onError(err); },
                    function onCompleted() {
                        root.allowSync++;
                        try {

                            boundModel = model.bindSync(boundPath);
                            if(boundModel) {
                                observer.onNext(boundModel);
                            }
                            observer.onCompleted();
                        } catch(e) {
                            observer.onError(e);
                        }

                        // remove the inc
                        finally {
                            root.allowSync--;
                        }
                    });
            }

            // remove the inc
            finally {
                root.allowSync--;
            }
        });
    },
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
    getCache: function() {
        var paths = slice.call(arguments);
        if(paths.length == 0) {
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
    bindSync: function(path) {
        path = pathSyntax.fromPath(path);
        if(Array.isArray(path) === false) {
            throw new Error("Model#bindSync must be called with an Array path.");
        }
        var boundValue = this.syncCheck("bindSync") && getBoundValue(this, this._path.concat(path));
        var node = boundValue.value;
        path = boundValue.path;
        if(boundValue.shorted) {
            if(!!node) {
                if(node.$type === ERROR) {
                    if(this._boxed) {
                        throw node;
                    }
                    throw node.value;
                    // throw new Error("Model#bindSync can\'t bind to or beyond an error: " + boundValue.toString());
                }
            }
            return undefined;
        } else if(!!node && node.$type === ERROR) {
            if(this._boxed) {
                throw node;
            }
            throw node.value;
        }
        return this.clone(["_path", boundValue.path]);
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
    batch: function(schedulerOrDelay) {
        if(typeof schedulerOrDelay === "number") {
            schedulerOrDelay = new TimeoutScheduler(Math.round(Math.abs(schedulerOrDelay)));
        } else if(!schedulerOrDelay || !schedulerOrDelay.schedule) {
            schedulerOrDelay = new ASAPScheduler();
        }
        return this.clone(["_request", new RequestQueue(this, schedulerOrDelay)]);
    },
    unbatch: function() {
        return this.clone(["_request", new RequestQueue(this, new ImmediateScheduler())]);
    },
    treatErrorsAsValues: function() {
        return this.clone(["_treatErrorsAsValues", true]);
    },
    asDataSource: function() {
        return new ModelDataSourceAdapter(this);
    },
    materialize: function() {
        return this.clone(["_materialized", true]);
    },
    boxValues: function() {
        return this.clone(["_boxed", true]);
    },
    unboxValues: function() {
        return this.clone(["_boxed", false]);
    },
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
        if (!!this._dataSource && this._root.allowSync <= 0 && this._root.unsafeMode === false) {
            throw new Error("Model#" + name + " may only be called within the context of a request selector.");
        }
        return true;
    },
    toJSON: function() {
        return this._path;
    }
};

},{"../lru/collect":235,"../types/error":288,"./../get/getBoundValue":199,"./../types/atom":287,"./../types/error":288,"./../types/path":289,"./Falcor":154,"./ModelDataSourceAdapter":156,"./ModelResponse":157,"./operations":164,"./operations/call":159,"./request/RequestQueue":190,"./scheduler/ASAPScheduler":191,"./scheduler/ImmediateScheduler":192,"./scheduler/TimeoutScheduler":193,"falcor-path-syntax":317}],156:[function(_dereq_,module,exports){
module.exports=_dereq_(5)
},{}],157:[function(_dereq_,module,exports){
var falcor = _dereq_('./Falcor');
var pathSyntax = _dereq_('falcor-path-syntax');

if(typeof Promise !== "undefined" && Promise) {
    falcor.Promise = Promise;
} else {
    falcor.Promise = _dereq_("promise");
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
ModelResponse.prototype.withErrorSelector = function(project) {
    return mixin(this, { errorSelector: { value: project } });
};
ModelResponse.prototype.withComparator = function(compare) {
    return mixin(this, { comparator: { value: compare } });
};
ModelResponse.prototype.then = function(onNext, onError) {
    var self = this;
    return new falcor.Promise(function(resolve, reject) {
        setTimeout(function() {
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
                    if(!!resolve) {
                        resolve(value);
                    }
                }
            );
        }, 0);
    }).then(onNext, onError);
};

module.exports = ModelResponse;

},{"./Falcor":154,"falcor-path-syntax":317,"promise":324}],158:[function(_dereq_,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"./Falcor":154,"./Model":155}],159:[function(_dereq_,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"../../Falcor":154,"./../../ModelResponse":157}],160:[function(_dereq_,module,exports){
arguments[4][9][0].apply(exports,arguments)
},{"./../support/combineOperations":176,"./../support/setSeedsOrOnNext":189}],161:[function(_dereq_,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"./../support/getSourceObserever":177,"./../support/mergeBoundPath":181,"./../support/partitionOperations":184}],162:[function(_dereq_,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"./../request":167,"./../support/processOperations":186,"./getInitialArgs":160,"./getSourceRequest":161,"./shouldRequest":163}],163:[function(_dereq_,module,exports){
module.exports=_dereq_(12)
},{}],164:[function(_dereq_,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"../ModelResponse":157,"./get":162,"./invalidate":165,"./set":169}],165:[function(_dereq_,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"./../request":167,"./../support/processOperations":186,"./invalidateInitialArgs":166}],166:[function(_dereq_,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"./../support/combineOperations":176,"./../support/setSeedsOrOnNext":189}],167:[function(_dereq_,module,exports){
var setSeedsOrOnNext = _dereq_('./support/setSeedsOrOnNext');
var onNextValues = _dereq_('./support/onNextValue');
var onCompletedOrError = _dereq_('./support/onCompletedOrError');
var primeSeeds = _dereq_('./support/primeSeeds');
var autoFalse = function() { return false; };

module.exports = request;

function request(initialArgs, sourceRequest, processOperations, shouldRequestFn, finalize) {
    if (!shouldRequestFn) {
        shouldRequestFn = autoFalse;
    }
    if(!finalize) {
        finalize = onCompletedOrError;
    }
    return function innerRequest(options) {
        var selector = options.operationSelector;
        var model = options.operationModel;
        var args = options.operationArgs;
        var onNext = options.onNext.bind(options);
        var onError = options.onError.bind(options);
        var onCompleted = options.onCompleted.bind(options);
        var isProgressive = options.operationIsProgressive;
        var errorSelector = options.errorSelector || model._errorSelector;
        var comparator = options.comparator || model._comparator;
        var selectorLength = selector && selector.length || 0;

        // State variables
        var errors = [];
        var format = options.format = selector && 'AsJSON' ||
            options.format || 'AsPathMap';
        var toJSONG = format === 'AsJSONG';
        var toJSON = format === 'AsPathMap';
        var toPathValues = format === 'AsValues';
        var seedRequired = toJSON || toJSONG || selector;
        var boundPath = model._path;
        var i, len;
        var foundValue = false;
        var seeds = primeSeeds(selector, selectorLength);
        var loopCount = 0;

        function recurse(operations, opts) {
            if (loopCount > 50) {
                throw 'Loop Kill switch thrown.';
            }
            var combinedResults = processOperations(
                model,
                operations,
                errorSelector,
                comparator,
                opts);

            foundValue = foundValue || combinedResults.valuesReceived;
            if (combinedResults.errors.length) {
                errors = errors.concat(combinedResults.errors);
            }

            // if in progressiveMode, values are emitted
            // each time through the recurse loop.  This may have
            // to change when the router is considered.
            if (isProgressive && !toPathValues) {
                onNextValues(model, onNext, seeds, selector);
            }

            // Performs the recursing via dataSource
            if (shouldRequestFn(model, combinedResults, loopCount)) {
                sourceRequest(
                    options,
                    onNext,
                    seeds,
                    combinedResults,
                    opts,
                    function onCompleteFromSourceSet(err, results) {
                        if (err) {
                            errors = errors.concat(err);
                            recurse([], seeds);
                            return;
                        }
                        ++loopCount;

                        // We continue to string the opts through
                        recurse(results, opts);
                    });
            }

            // Else we need to onNext values and complete/error.
            else {
                if (!toPathValues && !isProgressive && foundValue) {
                    onNextValues(model, onNext, seeds, selector);
                }
                finalize(model, onCompleted, onError, errors);
            }
        }

        try {
            recurse.apply(null,
                initialArgs(options, seeds, onNext));
        } catch(e) {
            errors = [e];
            finalize(model, onCompleted, onError, errors);
        }
    };
}

},{"./support/onCompletedOrError":182,"./support/onNextValue":183,"./support/primeSeeds":185,"./support/setSeedsOrOnNext":189}],168:[function(_dereq_,module,exports){
arguments[4][17][0].apply(exports,arguments)
},{"../../../lru/collect":235,"../support/onCompletedOrError":182}],169:[function(_dereq_,module,exports){
arguments[4][18][0].apply(exports,arguments)
},{"./../request":167,"./finalizeAndCollect":168,"./setInitialArgs":170,"./setProcessOperations":171,"./setSourceRequest":172,"./shouldRequest":173}],170:[function(_dereq_,module,exports){
var combineOperations = _dereq_('./../support/combineOperations');
var setSeedsOrOnNext = _dereq_('./../support/setSeedsOrOnNext');
var Formats = _dereq_('./../support/Formats');
var toPathValues = Formats.toPathValues;
var toJSONG = Formats.toJSONG;
module.exports = function setInitialArgs(options, seeds, onNext) {
    var isPathValues = options.format === toPathValues;
    var seedRequired = !isPathValues;
    var shouldRequest = !!options.operationModel._dataSource;
    var format = options.format;
    var args = options.operationArgs;
    var selector = options.operationSelector;
    var isProgressive = options.operationIsProgressive;
    var firstSeeds, operations;
    var requestOptions = {
        removeBoundPath: shouldRequest
    };

    // If Model is a slave, in shouldRequest mode,
    // a single seed is required to accumulate the jsong results.
    if (shouldRequest) {
        operations =
            combineOperations(args, toJSONG, 'set', selector, false);
        firstSeeds = [{}];
        setSeedsOrOnNext(
            operations, true, firstSeeds, false, options.selector);

        // we must keep track of the set seeds.
        requestOptions.requestSeed = firstSeeds[0];
    }

    // This model is the master, therefore a regular set can be performed.
    else {
        firstSeeds = seeds;
        operations = combineOperations(args, format, 'set');
        setSeedsOrOnNext(
            operations, seedRequired, seeds, onNext, options.operationSelector);
    }

    // We either have to construct the master operations if
    // the ModelResponse is isProgressive
    // the ModelResponse is toPathValues
    // but luckily we can just perform a get for the progressive or
    // toPathValues mode.
    if (isProgressive || isPathValues) {
        var getOps = combineOperations(
            args, format, 'get', selector, true);
        setSeedsOrOnNext(
            getOps, seedRequired, seeds, onNext, options.operationSelector);
        operations = operations.concat(getOps);

        requestOptions.isProgressive = true;
    }

    return [operations, requestOptions];
};

},{"./../support/Formats":174,"./../support/combineOperations":176,"./../support/setSeedsOrOnNext":189}],171:[function(_dereq_,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"./../support/Formats":174,"./../support/combineOperations":176,"./../support/mergeBoundPath":181,"./../support/processOperations":186}],172:[function(_dereq_,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"./../support/Formats":174,"./../support/combineOperations":176,"./../support/getSourceObserever":177,"./../support/setSeedsOrOnNext":189}],173:[function(_dereq_,module,exports){
module.exports=_dereq_(22)
},{}],174:[function(_dereq_,module,exports){
module.exports=_dereq_(23)
},{}],175:[function(_dereq_,module,exports){
module.exports=_dereq_(24)
},{}],176:[function(_dereq_,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"./Formats":174,"./isJSONG":179,"./isPathOrPathValue":180,"./seedRequired":187}],177:[function(_dereq_,module,exports){
module.exports=_dereq_(26)
},{"./insertErrors.js":178}],178:[function(_dereq_,module,exports){
module.exports=_dereq_(27)
},{}],179:[function(_dereq_,module,exports){
module.exports=_dereq_(28)
},{}],180:[function(_dereq_,module,exports){
module.exports = function isPathOrPathValue(x) {
    return !!(Array.isArray(x)) || (
        x.hasOwnProperty("path") && x.hasOwnProperty("value"));
};

},{}],181:[function(_dereq_,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"./isJSONG":179,"./isPathOrPathValue":180}],182:[function(_dereq_,module,exports){
module.exports=_dereq_(31)
},{}],183:[function(_dereq_,module,exports){
/**
 * will onNext the observer with the seeds provided.
 * @param {Model} model
 * @param {Function} onNext
 * @param {Array.<Object>} seeds
 * @param {Function} [selector]
 */
module.exports = function onNextValues(model, onNext, seeds, selector) {
    var root = model._root;

    root.allowSync++;
    try {
        if (selector) {
            if (seeds.length) {
                // they should be wrapped in json items
                onNext(selector.apply(model, seeds.map(function(x, i) {
                    return x.json;
                })));
            } else {
                onNext(selector.call(model));
            }
        } else {
            // this means there is an onNext function that is not AsValues or progressive,
            // therefore there must only be one onNext call, which should only be the 0
            // index of the values of the array
            onNext(seeds[0]);
        }
    } finally {
        root.allowSync--;
    }
};

},{}],184:[function(_dereq_,module,exports){
module.exports=_dereq_(33)
},{"./buildJSONGOperation":175}],185:[function(_dereq_,module,exports){
module.exports=_dereq_(34)
},{}],186:[function(_dereq_,module,exports){
module.exports=_dereq_(35)
},{}],187:[function(_dereq_,module,exports){
module.exports=_dereq_(36)
},{}],188:[function(_dereq_,module,exports){
module.exports=_dereq_(37)
},{}],189:[function(_dereq_,module,exports){
module.exports=_dereq_(38)
},{"./setSeedsOnGroups":188}],190:[function(_dereq_,module,exports){
module.exports=_dereq_(39)
},{"./../Falcor":154}],191:[function(_dereq_,module,exports){
module.exports=_dereq_(40)
},{"asap":147}],192:[function(_dereq_,module,exports){
module.exports=_dereq_(41)
},{}],193:[function(_dereq_,module,exports){
module.exports=_dereq_(42)
},{}],194:[function(_dereq_,module,exports){
var hardLink = _dereq_('./util/hardlink');
var createHardlink = hardLink.create;
var onValue = _dereq_('./onValue');
var isExpired = _dereq_('./util/isExpired');
var $path = _dereq_('./../types/path.js');
var __context = _dereq_("../internal/context");

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
                if (type === $path) {
                    if (outputFormat === 'JSONG') {
                        onValue(model, next, seed, null, null, reference, null, outputFormat);
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

},{"../internal/context":215,"./../types/path.js":289,"./onValue":205,"./util/hardlink":207,"./util/isExpired":208}],195:[function(_dereq_,module,exports){
arguments[4][44][0].apply(exports,arguments)
},{"./getBoundValue":199,"./util/isPathValue":210}],196:[function(_dereq_,module,exports){
arguments[4][45][0].apply(exports,arguments)
},{"./getBoundValue":199,"./util/isPathValue":210}],197:[function(_dereq_,module,exports){
arguments[4][46][0].apply(exports,arguments)
},{"./getBoundValue":199,"./util/isPathValue":210}],198:[function(_dereq_,module,exports){
arguments[4][47][0].apply(exports,arguments)
},{"./getBoundValue":199,"./util/isPathValue":210}],199:[function(_dereq_,module,exports){
arguments[4][48][0].apply(exports,arguments)
},{"./getValueSync":200}],200:[function(_dereq_,module,exports){
var followReference = _dereq_('./followReference');
var clone = _dereq_('./util/clone');
var isExpired = _dereq_('./util/isExpired');
var promote = _dereq_('./util/lru').promote;
var $path = _dereq_('./../types/path.js');
var $atom = _dereq_('./../types/atom.js');
var $error = _dereq_('./../types/error.js');

module.exports = function getValueSync(model, simplePath) {
    var root = model._cache;
    var len = simplePath.length;
    var optimizedPath = [];
    var shorted = false, shouldShort = false;
    var depth = 0;
    var key, i, next = root, type, curr = root, out, ref, refNode;
    do {
        key = simplePath[depth++];
        if (key !== null) {
            next = curr[key];
            optimizedPath.push(key);
        }

        if (!next) {
            out = undefined;
            shorted = true;
            break;
        }

        type = next.$type;

        // Up to the last key we follow references
        if (depth < len) {
            if (type === $path) {
                ref = followReference(model, root, root, next, next.value);
                refNode = ref[0];

                if (!refNode) {
                    out = undefined;
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
        throw {path: simplePath, value: out.value};
    } else if (out && model._boxed) {
        out = !!type ? clone(out) : out;
    } else if (!out && model._materialized) {
        out = {$type: $atom};
    } else if (out) {
        out = out.value;
    }

    return {
        value: out,
        shorted: shorted,
        optimizedPath: optimizedPath
    };
};

},{"./../types/atom.js":287,"./../types/error.js":288,"./../types/path.js":289,"./followReference":194,"./util/clone":206,"./util/isExpired":208,"./util/lru":211}],201:[function(_dereq_,module,exports){
var followReference = _dereq_('./followReference');
var onError = _dereq_('./onError');
var onMissing = _dereq_('./onMissing');
var onValue = _dereq_('./onValue');
var lru = _dereq_('./util/lru');
var hardLink = _dereq_('./util/hardlink');
var isMaterialized = _dereq_('./util/isMaterialzed');
var removeHardlink = hardLink.remove;
var splice = lru.splice;
var isExpired = _dereq_('./util/isExpired');
var permuteKey = _dereq_('./util/permuteKey');
var $path = _dereq_('./../types/path');
var $error = _dereq_('./../types/error');
var __invalidated = _dereq_("../internal/invalidated");
var prefix = _dereq_("./../internal/prefix");

function walk(model, root, curr, pathOrJSON, depth, seedOrFunction, positionalInfo, outerResults, optimizedPath, requestedPath, inputFormat, outputFormat, fromReference) {
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

                    if (nType && nType === $path && !isExpired(next)) {
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
            walk(model, root, next, nextPathOrPathMap, depth, seedOrFunction, permutePosition, outerResults, permuteOptimized, permuteRequested, inputFormat, outputFormat, fromReference);

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

module.exports = walk;

},{"../internal/invalidated":218,"./../internal/prefix":223,"./../types/error":288,"./../types/path":289,"./followReference":194,"./onError":203,"./onMissing":204,"./onValue":205,"./util/hardlink":207,"./util/isExpired":208,"./util/isMaterialzed":209,"./util/lru":211,"./util/permuteKey":212}],202:[function(_dereq_,module,exports){
arguments[4][52][0].apply(exports,arguments)
},{"./getAsJSON":195,"./getAsJSONG":196,"./getAsPathMap":197,"./getAsValues":198,"./getBoundValue":199,"./getValueSync":200,"./getWalk":201}],203:[function(_dereq_,module,exports){
var lru = _dereq_('./util/lru');
var clone = _dereq_('./util/clone');
var promote = lru.promote;
module.exports = function onError(model, node, permuteRequested, permuteOptimized, outerResults) {
    outerResults.errors.push({path: permuteRequested, value: node.value});

    promote(model, node);
    
    if (permuteOptimized) {
        outerResults.requestedPaths.push(permuteRequested);
        outerResults.optimizedPaths.push(permuteOptimized);
    }
};


},{"./util/clone":206,"./util/lru":211}],204:[function(_dereq_,module,exports){
module.exports=_dereq_(54)
},{"./util/clone":206,"./util/isExpired":208,"./util/spreadJSON":213,"./util/support":214}],205:[function(_dereq_,module,exports){
module.exports=_dereq_(55)
},{"./../types/atom":287,"./../types/error":288,"./../types/path":289,"./util/clone":206,"./util/lru":211}],206:[function(_dereq_,module,exports){
module.exports=_dereq_(56)
},{"../../internal/prefix":223}],207:[function(_dereq_,module,exports){
module.exports=_dereq_(57)
},{"../../internal/context":215,"../../internal/ref":226,"../../internal/ref-index":225,"../../internal/refs-length":227}],208:[function(_dereq_,module,exports){
module.exports=_dereq_(58)
},{"../../support/now":273}],209:[function(_dereq_,module,exports){
module.exports=_dereq_(59)
},{}],210:[function(_dereq_,module,exports){
module.exports=_dereq_(60)
},{}],211:[function(_dereq_,module,exports){
module.exports=_dereq_(61)
},{"../../internal/head":217,"../../internal/invalidated":218,"../../internal/next":220,"../../internal/prev":224,"../../internal/tail":228}],212:[function(_dereq_,module,exports){
module.exports=_dereq_(62)
},{}],213:[function(_dereq_,module,exports){
module.exports=_dereq_(63)
},{"./support":214}],214:[function(_dereq_,module,exports){
module.exports=_dereq_(64)
},{}],215:[function(_dereq_,module,exports){
module.exports=_dereq_(65)
},{"./prefix":223}],216:[function(_dereq_,module,exports){
module.exports=_dereq_(66)
},{"./prefix":223}],217:[function(_dereq_,module,exports){
module.exports=_dereq_(67)
},{"./prefix":223}],218:[function(_dereq_,module,exports){
module.exports=_dereq_(68)
},{"./prefix":223}],219:[function(_dereq_,module,exports){
module.exports=_dereq_(69)
},{"./prefix":223}],220:[function(_dereq_,module,exports){
module.exports=_dereq_(70)
},{"./prefix":223}],221:[function(_dereq_,module,exports){
module.exports=_dereq_(71)
},{"./prefix":223}],222:[function(_dereq_,module,exports){
module.exports=_dereq_(72)
},{"./prefix":223}],223:[function(_dereq_,module,exports){
module.exports=_dereq_(73)
},{}],224:[function(_dereq_,module,exports){
module.exports=_dereq_(74)
},{"./prefix":223}],225:[function(_dereq_,module,exports){
module.exports=_dereq_(75)
},{"./prefix":223}],226:[function(_dereq_,module,exports){
module.exports=_dereq_(76)
},{"./prefix":223}],227:[function(_dereq_,module,exports){
module.exports=_dereq_(77)
},{"./prefix":223}],228:[function(_dereq_,module,exports){
module.exports=_dereq_(78)
},{"./prefix":223}],229:[function(_dereq_,module,exports){
module.exports=_dereq_(79)
},{"./prefix":223}],230:[function(_dereq_,module,exports){
arguments[4][80][0].apply(exports,arguments)
},{"./invalidate-path-sets-as-json-dense":231,"./invalidate-path-sets-as-json-graph":232,"./invalidate-path-sets-as-json-sparse":233,"./invalidate-path-sets-as-json-values":234}],231:[function(_dereq_,module,exports){
module.exports = invalidate_path_sets_as_json_dense;

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");
var array_slice = _dereq_("../support/array-slice");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var update_graph = _dereq_("../support/update-graph");
var invalidate_node = _dereq_("../support/invalidate-node");

var collect = _dereq_("../lru/collect");

var positions = _dereq_("../support/positions");
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

    collect(
        roots.lru,
        roots.expired,
        roots.version,
        roots.root.$size || 0,
        model._maxSize,
        model._collectRatio
    );

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

    if (is_branch) {
        parents[_cache] = nodes[_cache] = node;
        if (is_keyset && !!(parents[_json] = json)) {
            nodes[_json] = json[keyset] || (json[keyset] = {});
        }
        return;
    }

    nodes[_cache] = node;

    if (!!json) {
        var type = is_object(node) && node.$type || undefined;
        var jsonkey = keyset;
        if (jsonkey == null) {
            json = roots;
            jsonkey = 3;
        }
        json[jsonkey] = clone(roots, node, type, node && node.value);
    }

    var lru = roots.lru;
    var size = node.$size || 0;
    var version = roots.version;
    invalidate_node(parent, node, key, roots.lru);
    update_graph(parent, size, version, lru);
}

function onEdge(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset) {
    roots.json = roots[_json];
    roots.hasValue = true;
    roots.requestedPaths.push(array_slice(requested, roots.offset));
}
},{"../lru/collect":235,"../support/array-clone":253,"../support/array-slice":254,"../support/clone-dense-json":255,"../support/get-valid-key":263,"../support/invalidate-node":267,"../support/is-object":269,"../support/options":274,"../support/positions":276,"../support/update-graph":285,"../walk/walk-path-set":295}],232:[function(_dereq_,module,exports){
arguments[4][82][0].apply(exports,arguments)
},{"../lru/collect":235,"../support/array-clone":253,"../support/clone-dense-json":255,"../support/get-valid-key":263,"../support/invalidate-node":267,"../support/is-object":269,"../support/options":274,"../support/positions":276,"../support/set-successful-paths":279,"../support/update-graph":285,"../types/path":289,"../walk/walk-path-set-soft-link":294}],233:[function(_dereq_,module,exports){
arguments[4][83][0].apply(exports,arguments)
},{"../lru/collect":235,"../support/array-clone":253,"../support/array-slice":254,"../support/clone-dense-json":255,"../support/get-valid-key":263,"../support/invalidate-node":267,"../support/is-object":269,"../support/options":274,"../support/positions":276,"../support/update-graph":285,"../walk/walk-path-set":295}],234:[function(_dereq_,module,exports){
module.exports = invalidate_path_sets_as_json_values;

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");
var array_slice = _dereq_("../support/array-slice");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var update_graph = _dereq_("../support/update-graph");
var invalidate_node = _dereq_("../support/invalidate-node");

var collect = _dereq_("../lru/collect");

var positions = _dereq_("../support/positions");
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

function invalidate_path_sets_as_json_values(model, pathsets, onNext) {

    var roots = options([], model);
    var index = -1;
    var count = pathsets.length;
    var nodes = roots.nodes;
    var parents = array_clone(nodes);
    var requested = [];
    var optimized = [];

    roots[_cache] = roots.root;
    roots.onNext = onNext;

    while (++index < count) {
        var pathset = pathsets[index];
        walk_path_set(onNode, onEdge, pathset, 0, roots, parents, nodes, requested, optimized);
    }

    collect(
        roots.lru,
        roots.expired,
        roots.version,
        roots.root.$size || 0,
        model._maxSize,
        model._collectRatio
    );

    return {
        values: null,
        errors: roots.errors,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

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

    var node = parent[key];

    if (is_reference) {
        parents[_cache] = parent;
        nodes[_cache] = node;
        return;
    }

    if (is_branch) {
        parents[_cache] = nodes[_cache] = node;
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
    var node = nodes[_cache];
    var type = is_object(node) && node.$type || undefined;
    var onNext = roots.onNext;
    if (!!type && onNext) {
        onNext({
            path: array_clone(requested),
            value: clone(roots, node, type, node && node.value)
        });
    }
    roots.requestedPaths.push(array_slice(requested, roots.offset));
}
},{"../lru/collect":235,"../support/array-clone":253,"../support/array-slice":254,"../support/clone-dense-json":255,"../support/get-valid-key":263,"../support/invalidate-node":267,"../support/is-object":269,"../support/options":274,"../support/positions":276,"../support/update-graph":285,"../walk/walk-path-set":295}],235:[function(_dereq_,module,exports){
var __head = _dereq_("../internal/head");
var __tail = _dereq_("../internal/tail");
var __next = _dereq_("../internal/next");
var __prev = _dereq_("../internal/prev");

var update_graph = _dereq_("../support/update-graph");
module.exports = function(lru, expired, version, total, max, ratio) {
    
    var targetSize = max * ratio;
    var node, size;
    
    while(!!(node = expired.pop())) {
        size = node.$size || 0;
        total -= size;
        update_graph(node, size, version, lru);
    }
    
    if(total >= max) {
        var prev = lru[__tail];
        while((total >= targetSize) && !!(node = prev)) {
            prev = prev[__prev];
            size = node.$size || 0;
            total -= size;
            update_graph(node, size, version, lru);
        }
        
        if((lru[__tail] = lru[__prev] = prev) == null) {
            lru[__head] = lru[__next] = undefined;
        } else {
            prev[__next] = undefined;
        }
    }
};
},{"../internal/head":217,"../internal/next":220,"../internal/prev":224,"../internal/tail":228,"../support/update-graph":285}],236:[function(_dereq_,module,exports){
module.exports=_dereq_(86)
},{"../internal/head":217,"../internal/next":220,"../internal/prev":224,"../internal/tail":228,"../support/is-object":269,"../values/expires-never":290}],237:[function(_dereq_,module,exports){
module.exports=_dereq_(87)
},{"../internal/head":217,"../internal/next":220,"../internal/prev":224,"../internal/tail":228}],238:[function(_dereq_,module,exports){
arguments[4][88][0].apply(exports,arguments)
},{"./set-cache":239,"./set-json-graph-as-json-dense":240,"./set-json-graph-as-json-graph":241,"./set-json-graph-as-json-sparse":242,"./set-json-graph-as-json-values":243,"./set-json-sparse-as-json-dense":244,"./set-json-sparse-as-json-graph":245,"./set-json-sparse-as-json-sparse":246,"./set-json-sparse-as-json-values":247,"./set-json-values-as-json-dense":248,"./set-json-values-as-json-graph":249,"./set-json-values-as-json-sparse":250,"./set-json-values-as-json-values":251}],239:[function(_dereq_,module,exports){
module.exports = set_cache;

var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_map = _dereq_("../walk/walk-path-map");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var create_branch = _dereq_("../support/create-branch");
var wrap_node = _dereq_("../support/wrap-node");
var replace_node = _dereq_("../support/replace-node");
var graph_node = _dereq_("../support/graph-node");
var update_back_refs = _dereq_("../support/update-back-refs");
var update_graph = _dereq_("../support/update-graph");
var inc_generation = _dereq_("../support/inc-generation");

var positions = _dereq_("../support/positions");
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;
var _json = positions.json;

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
    mess = wrap_node(mess, type, !!type ? mess.value : mess);
    type || (type = $atom);

    if (type == $error && !!selector) {
        mess = selector(requested, mess);
    }

    node = replace_node(parent, node, mess, key, roots.lru);
    node = graph_node(root, parent, node, key, inc_generation());
    update_graph(parent, size - node.$size, roots.version, roots.lru);
    nodes[_cache] = node;
}

function onEdge(pathmap, keys_stack, depth, roots, parents, nodes, requested, optimized, key, keyset) {

}
},{"../support/array-clone":253,"../support/clone-dense-json":255,"../support/create-branch":261,"../support/get-valid-key":263,"../support/graph-node":264,"../support/inc-generation":265,"../support/is-object":269,"../support/options":274,"../support/positions":276,"../support/replace-node":278,"../support/update-back-refs":284,"../support/update-graph":285,"../support/wrap-node":286,"../types/atom":287,"../types/error":288,"../walk/walk-path-map":293}],240:[function(_dereq_,module,exports){
module.exports = set_json_graph_as_json_dense;

var $path = _dereq_("../types/path");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set-soft-link");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var merge_node = _dereq_("../support/merge-node");

var set_node_if_missing_path = _dereq_("../support/treat-node-as-missing-path-set");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var positions = _dereq_("../support/positions");
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
        var jsong = envelope.jsong || envelope.values || envelope.value;
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
            if (!!hasValue) {
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
    nodes[_cache] = node = merge_node(roots, parent, node, messageParent, message, key, optimized);

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
        if ((length > offset) && is_keyset && !!json) {
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

    // TODO: CR Explain what's happening here.
    set_successful_paths(roots, requested, optimized);

    var isError = set_node_if_error(roots, node, type, requested);

    if (isError) {
        return;
    }

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        if (keyset == null) {
            roots.json = clone(roots, node, type, node && node.value);
        } else if (!!(json = parents[_json])) {
            json[keyset] = clone(roots, node, type, node && node.value);
        }
        roots.hasValue = true;
    }
}
},{"../support/array-clone":253,"../support/clone-dense-json":255,"../support/get-valid-key":263,"../support/is-object":269,"../support/merge-node":272,"../support/options":274,"../support/positions":276,"../support/set-successful-paths":279,"../support/treat-node-as-error":281,"../support/treat-node-as-missing-path-set":282,"../types/path":289,"../walk/walk-path-set-soft-link":294}],241:[function(_dereq_,module,exports){
module.exports = set_json_graph_as_json_graph;

var $path = _dereq_("../types/path");

var clone = _dereq_("../support/clone-graph-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set-soft-link");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var merge_node = _dereq_("../support/merge-node");

var set_node_if_missing_path = _dereq_("../support/treat-node-as-missing-path-set");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var promote = _dereq_("../lru/promote");

var positions = _dereq_("../support/positions");
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
        var jsong = envelope.jsong || envelope.values || envelope.value;
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
    nodes[_cache] = node = merge_node(roots, parent, node, messageParent, message, key, optimized);

    if (is_reference) {
        parents[_cache] = parent;
        parents[_message] = messageParent;
        parents[_jsong] = json;
        nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        return;
    }

    var type = is_object(node) && node.$type || undefined;

    if (is_branch) {
        parents[_cache] = node;
        parents[_message] = message;
        parents[_jsong] = json;
        if (type == $path) {
            json[jsonkey] = clone(roots, node, type, node.value);
            roots.hasValue = true;
        } else {
            nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    if (roots.is_distinct === true) {
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
},{"../lru/promote":236,"../support/array-clone":253,"../support/clone-graph-json":256,"../support/get-valid-key":263,"../support/is-object":269,"../support/merge-node":272,"../support/options":274,"../support/positions":276,"../support/set-successful-paths":279,"../support/treat-node-as-error":281,"../support/treat-node-as-missing-path-set":282,"../types/path":289,"../walk/walk-path-set-soft-link":294}],242:[function(_dereq_,module,exports){
module.exports = set_json_graph_as_json_sparse;

var $path = _dereq_("../types/path");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set-soft-link");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var merge_node = _dereq_("../support/merge-node");

var set_node_if_missing_path = _dereq_("../support/treat-node-as-missing-path-set");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var positions = _dereq_("../support/positions");
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
        var jsong = envelope.jsong || envelope.values || envelope.value;
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
    nodes[_cache] = node = merge_node(roots, parent, node, messageParent, message, key, optimized);

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
        if ((length > offset) && (!type || type == $path)) {
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

    // TODO: CR Explain what's happening here.
    set_successful_paths(roots, requested, optimized);

    var isError = set_node_if_error(roots, node, type, requested);

    if (isError) {
        return;
    }

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
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
},{"../support/array-clone":253,"../support/clone-dense-json":255,"../support/get-valid-key":263,"../support/is-object":269,"../support/merge-node":272,"../support/options":274,"../support/positions":276,"../support/set-successful-paths":279,"../support/treat-node-as-error":281,"../support/treat-node-as-missing-path-set":282,"../types/path":289,"../walk/walk-path-set-soft-link":294}],243:[function(_dereq_,module,exports){
module.exports = set_json_graph_as_json_values;

var $path = _dereq_("../types/path");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");
var array_slice = _dereq_("../support/array-slice");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set-soft-link");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var merge_node = _dereq_("../support/merge-node");

var set_node_if_missing_path = _dereq_("../support/treat-node-as-missing-path-set");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var positions = _dereq_("../support/positions");
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
        var jsong = envelope.jsong || envelope.values || envelope.value;
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
    nodes[_cache] = node = merge_node(roots, parent, node, messageParent, message, key, optimized);

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

    set_successful_paths(roots, requested, optimized);

    var isError = set_node_if_error(roots, node, type, requested);

    if (isError) {
        return;
    }

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        roots.onNext({
            path: array_slice(requested, roots.offset),
            value: clone(roots, node, type, node && node.value)
        });
    }
}
},{"../support/array-clone":253,"../support/array-slice":254,"../support/clone-dense-json":255,"../support/get-valid-key":263,"../support/is-object":269,"../support/merge-node":272,"../support/options":274,"../support/positions":276,"../support/set-successful-paths":279,"../support/treat-node-as-error":281,"../support/treat-node-as-missing-path-set":282,"../types/path":289,"../walk/walk-path-set-soft-link":294}],244:[function(_dereq_,module,exports){
module.exports = set_json_sparse_as_json_dense;

var $path = _dereq_("../types/path");
var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_map = _dereq_("../walk/walk-path-map");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var create_branch = _dereq_("../support/create-branch");
var wrap_node = _dereq_("../support/wrap-node");
var replace_node = _dereq_("../support/replace-node");
var graph_node = _dereq_("../support/graph-node");
var update_back_refs = _dereq_("../support/update-back-refs");
var update_graph = _dereq_("../support/update-graph");
var inc_generation = _dereq_("../support/inc-generation");

// var set_node_if_missing_path = require("../support/treat-node-as-missing-path-map");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var positions = _dereq_("../support/positions");
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
    var optimized = [];
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
        if (!!hasValue) {
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
        if (is_keyset && !!json) {
            nodes[_json] = json[keyset] || (json[keyset] = {});
        }
        return;
    }

    var selector = roots.error_selector;
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var message = pathmap;

    type = is_object(message) && message.$type || undefined;
    message = wrap_node(message, type, !!type ? message.value : message);
    type || (type = $atom);

    if (type == $error && !!selector) {
        message = selector(requested, message);
    }

    var is_distinct = roots.is_distinct = !roots.comparator(optimized, node, message);

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

    set_successful_paths(roots, requested, optimized);

    var isError = set_node_if_error(roots, node, type, requested);

    if (isError) {
        return;
    }

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        if (keyset == null) {
            roots.json = clone(roots, node, type, node && node.value);
        } else if (!!(json = parents[_json])) {
            json[keyset] = clone(roots, node, type, node && node.value);
        }
        roots.hasValue = true;
    }
}
},{"../support/array-clone":253,"../support/clone-dense-json":255,"../support/create-branch":261,"../support/get-valid-key":263,"../support/graph-node":264,"../support/inc-generation":265,"../support/is-object":269,"../support/options":274,"../support/positions":276,"../support/replace-node":278,"../support/set-successful-paths":279,"../support/treat-node-as-error":281,"../support/update-back-refs":284,"../support/update-graph":285,"../support/wrap-node":286,"../types/atom":287,"../types/error":288,"../types/path":289,"../walk/walk-path-map":293}],245:[function(_dereq_,module,exports){
module.exports = set_json_sparse_as_json_graph;

var $path = _dereq_("../types/path");
var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var clone = _dereq_("../support/clone-graph-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_map = _dereq_("../walk/walk-path-map-soft-link");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var create_branch = _dereq_("../support/create-branch");
var wrap_node = _dereq_("../support/wrap-node");
var replace_node = _dereq_("../support/replace-node");
var graph_node = _dereq_("../support/graph-node");
var update_back_refs = _dereq_("../support/update-back-refs");
var update_graph = _dereq_("../support/update-graph");
var inc_generation = _dereq_("../support/inc-generation");

// var set_node_if_missing_path = require("../support/treat-node-as-missing-path-map");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var promote = _dereq_("../lru/promote");

var positions = _dereq_("../support/positions");
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
    var optimized = [];
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
        if (type == $path) {
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
        if (type == $path) {
            json[jsonkey] = clone(roots, node, type, node.value);
            roots.hasValue = true;
        } else {
            nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    var selector = roots.error_selector;
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var message = pathmap;

    type = is_object(message) && message.$type || undefined;
    message = wrap_node(message, type, !!type ? message.value : message);
    type || (type = $atom);

    if (type == $error && !!selector) {
        message = selector(requested, message);
    }

    var is_distinct = roots.is_distinct = !roots.comparator(optimized, node, message);

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

    set_successful_paths(roots, requested, optimized);

    if (keyset == null && !roots.hasValue && (keyset = get_valid_key(optimized)) == null) {
        node = clone(roots, node, type, node && node.value);
        json = roots[_jsong];
        json.$type = node.$type;
        json.value = node.value;
    }
    roots.hasValue = true;
}
},{"../lru/promote":236,"../support/array-clone":253,"../support/clone-graph-json":256,"../support/create-branch":261,"../support/get-valid-key":263,"../support/graph-node":264,"../support/inc-generation":265,"../support/is-object":269,"../support/options":274,"../support/positions":276,"../support/replace-node":278,"../support/set-successful-paths":279,"../support/treat-node-as-error":281,"../support/update-back-refs":284,"../support/update-graph":285,"../support/wrap-node":286,"../types/atom":287,"../types/error":288,"../types/path":289,"../walk/walk-path-map-soft-link":292}],246:[function(_dereq_,module,exports){
module.exports = set_json_sparse_as_json_sparse;

var $path = _dereq_("../types/path");
var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_map = _dereq_("../walk/walk-path-map");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var create_branch = _dereq_("../support/create-branch");
var wrap_node = _dereq_("../support/wrap-node");
var replace_node = _dereq_("../support/replace-node");
var graph_node = _dereq_("../support/graph-node");
var update_back_refs = _dereq_("../support/update-back-refs");
var update_graph = _dereq_("../support/update-graph");
var inc_generation = _dereq_("../support/inc-generation");

// var set_node_if_missing_path = require("../support/treat-node-as-missing-path-map");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var positions = _dereq_("../support/positions");
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
    var optimized = [];
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
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var message = pathmap;

    type = is_object(message) && message.$type || undefined;
    message = wrap_node(message, type, !!type ? message.value : message);
    type || (type = $atom);

    if (type == $error && !!selector) {
        message = selector(requested, message);
    }

    var is_distinct = roots.is_distinct = !roots.comparator(optimized, node, message);

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

    set_successful_paths(roots, requested, optimized);

    var isError = set_node_if_error(roots, node, type, requested);

    if(isError) {
        return;
    }

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
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
},{"../support/array-clone":253,"../support/clone-dense-json":255,"../support/create-branch":261,"../support/get-valid-key":263,"../support/graph-node":264,"../support/inc-generation":265,"../support/is-object":269,"../support/options":274,"../support/positions":276,"../support/replace-node":278,"../support/set-successful-paths":279,"../support/treat-node-as-error":281,"../support/update-back-refs":284,"../support/update-graph":285,"../support/wrap-node":286,"../types/atom":287,"../types/error":288,"../types/path":289,"../walk/walk-path-map":293}],247:[function(_dereq_,module,exports){
module.exports = set_path_map_as_json_values;

var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_map = _dereq_("../walk/walk-path-map");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var create_branch = _dereq_("../support/create-branch");
var wrap_node = _dereq_("../support/wrap-node");
var replace_node = _dereq_("../support/replace-node");
var graph_node = _dereq_("../support/graph-node");
var update_back_refs = _dereq_("../support/update-back-refs");
var update_graph = _dereq_("../support/update-graph");
var inc_generation = _dereq_("../support/inc-generation");

// var set_node_if_missing_path = require("../support/treat-node-as-missing-path-map");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var positions = _dereq_("../support/positions");
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
    var optimized = [];
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
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var message = pathmap;

    type = is_object(message) && message.$type || undefined;
    message = wrap_node(message, type, !!type ? message.value : message);
    type || (type = $atom);

    if (type == $error && !!selector) {
        message = selector(requested, message);
    }

    var is_distinct = roots.is_distinct = !roots.comparator(optimized, node, message);

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

    set_successful_paths(roots, requested, optimized);

    var isError = set_node_if_error(roots, node, type, requested);

    if(isError) {
        return;
    }

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        roots.onNext({
            path: array_clone(requested),
            value: clone(roots, node, type, node && node.value)
        });
    }
}
},{"../support/array-clone":253,"../support/clone-dense-json":255,"../support/create-branch":261,"../support/get-valid-key":263,"../support/graph-node":264,"../support/inc-generation":265,"../support/is-object":269,"../support/options":274,"../support/positions":276,"../support/replace-node":278,"../support/set-successful-paths":279,"../support/treat-node-as-error":281,"../support/update-back-refs":284,"../support/update-graph":285,"../support/wrap-node":286,"../types/atom":287,"../types/error":288,"../walk/walk-path-map":293}],248:[function(_dereq_,module,exports){
module.exports = set_json_values_as_json_dense;

var $path = _dereq_("../types/path");
var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var create_branch = _dereq_("../support/create-branch");
var wrap_node = _dereq_("../support/wrap-node");
var invalidate_node = _dereq_("../support/invalidate-node");
var replace_node = _dereq_("../support/replace-node");
var graph_node = _dereq_("../support/graph-node");
var update_back_refs = _dereq_("../support/update-back-refs");
var update_graph = _dereq_("../support/update-graph");
var inc_generation = _dereq_("../support/inc-generation");

var set_node_if_missing_path = _dereq_("../support/treat-node-as-missing-path-set");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var positions = _dereq_("../support/positions");
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
    var optimized = [];
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
        if (!!hasValue) {
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
        if (is_keyset && !!json) {
            nodes[_json] = json[keyset] || (json[keyset] = {});
        }
        return;
    }

    var selector = roots.error_selector;
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var message = roots.value;

    if (message === undefined && roots.no_data_source) {
        invalidate_node(parent, node, key, roots.lru);
        update_graph(parent, size, roots.version, roots.lru);
        node = undefined;
    } else {
        type = is_object(message) && message.$type || undefined;
        message = wrap_node(message, type, !!type ? message.value : message);
        type || (type = $atom);

        if (type == $error && !!selector) {
            message = selector(requested, message);
        }

        var is_distinct = roots.is_distinct = !roots.comparator(optimized, node, message);

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

    set_successful_paths(roots, requested, optimized);
    
    var isError = set_node_if_error(roots, node, type, requested);

    if(isError) {
        return;
    }

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        if (keyset == null) {
            roots.json = clone(roots, node, type, node && node.value);
        } else if (!!(json = parents[_json])) {
            json[keyset] = clone(roots, node, type, node && node.value);
        }
        roots.hasValue = true;
    }
}
},{"../support/array-clone":253,"../support/clone-dense-json":255,"../support/create-branch":261,"../support/get-valid-key":263,"../support/graph-node":264,"../support/inc-generation":265,"../support/invalidate-node":267,"../support/is-object":269,"../support/options":274,"../support/positions":276,"../support/replace-node":278,"../support/set-successful-paths":279,"../support/treat-node-as-error":281,"../support/treat-node-as-missing-path-set":282,"../support/update-back-refs":284,"../support/update-graph":285,"../support/wrap-node":286,"../types/atom":287,"../types/error":288,"../types/path":289,"../walk/walk-path-set":295}],249:[function(_dereq_,module,exports){
module.exports = set_json_values_as_json_graph;

var $path = _dereq_("../types/path");
var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var clone = _dereq_("../support/clone-graph-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set-soft-link");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var create_branch = _dereq_("../support/create-branch");
var wrap_node = _dereq_("../support/wrap-node");
var invalidate_node = _dereq_("../support/invalidate-node");
var replace_node = _dereq_("../support/replace-node");
var graph_node = _dereq_("../support/graph-node");
var update_back_refs = _dereq_("../support/update-back-refs");
var update_graph = _dereq_("../support/update-graph");
var inc_generation = _dereq_("../support/inc-generation");

var set_node_if_missing_path = _dereq_("../support/treat-node-as-missing-path-set");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var promote = _dereq_("../lru/promote");

var positions = _dereq_("../support/positions");
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
    var optimized = [];
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
        if (type == $path) {
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
        if (type == $path) {
            json[jsonkey] = clone(roots, node, type, node.value);
            roots.hasValue = true;
        } else {
            nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    var selector = roots.error_selector;
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var message = roots.value;

    if (message === undefined && roots.no_data_source) {
        invalidate_node(parent, node, key, roots.lru);
        update_graph(parent, size, roots.version, roots.lru);
        node = undefined;
    } else {
        type = is_object(message) && message.$type || undefined;
        message = wrap_node(message, type, !!type ? message.value : message);
        type || (type = $atom);

        if (type == $error && !!selector) {
            message = selector(requested, message);
        }

        var is_distinct = roots.is_distinct = !roots.comparator(optimized, node, message);

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

    set_successful_paths(roots, requested, optimized);

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        if (keyset == null && !roots.hasValue && (keyset = get_valid_key(optimized)) == null) {
            node = clone(roots, node, type, node && node.value);
            json = roots[_jsong];
            json.$type = node.$type;
            json.value = node.value;
        }
        roots.hasValue = true;
    }
}
},{"../lru/promote":236,"../support/array-clone":253,"../support/clone-graph-json":256,"../support/create-branch":261,"../support/get-valid-key":263,"../support/graph-node":264,"../support/inc-generation":265,"../support/invalidate-node":267,"../support/is-object":269,"../support/options":274,"../support/positions":276,"../support/replace-node":278,"../support/set-successful-paths":279,"../support/treat-node-as-error":281,"../support/treat-node-as-missing-path-set":282,"../support/update-back-refs":284,"../support/update-graph":285,"../support/wrap-node":286,"../types/atom":287,"../types/error":288,"../types/path":289,"../walk/walk-path-set-soft-link":294}],250:[function(_dereq_,module,exports){
module.exports = set_json_values_as_json_sparse;

var $path = _dereq_("../types/path");
var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var create_branch = _dereq_("../support/create-branch");
var wrap_node = _dereq_("../support/wrap-node");
var invalidate_node = _dereq_("../support/invalidate-node");
var replace_node = _dereq_("../support/replace-node");
var graph_node = _dereq_("../support/graph-node");
var update_back_refs = _dereq_("../support/update-back-refs");
var update_graph = _dereq_("../support/update-graph");
var inc_generation = _dereq_("../support/inc-generation");

var set_node_if_missing_path = _dereq_("../support/treat-node-as-missing-path-set");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var positions = _dereq_("../support/positions");
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
    var optimized = [];
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
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var message = roots.value;

    if (message === undefined && roots.no_data_source) {
        invalidate_node(parent, node, key, roots.lru);
        update_graph(parent, size, roots.version, roots.lru);
        node = undefined;
    } else {
        type = is_object(message) && message.$type || undefined;
        message = wrap_node(message, type, !!type ? message.value : message);
        type || (type = $atom);

        if (type == $error && !!selector) {
            message = selector(requested, message);
        }

        var is_distinct = roots.is_distinct = !roots.comparator(optimized, node, message);

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
    
    set_successful_paths(roots, requested, optimized);
    
    var isError = set_node_if_error(roots, node, type, requested);
    
    if(isError) {
        return;
    }
    
    if (roots.is_distinct === true) {
        roots.is_distinct = false;
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
},{"../support/array-clone":253,"../support/clone-dense-json":255,"../support/create-branch":261,"../support/get-valid-key":263,"../support/graph-node":264,"../support/inc-generation":265,"../support/invalidate-node":267,"../support/is-object":269,"../support/options":274,"../support/positions":276,"../support/replace-node":278,"../support/set-successful-paths":279,"../support/treat-node-as-error":281,"../support/treat-node-as-missing-path-set":282,"../support/update-back-refs":284,"../support/update-graph":285,"../support/wrap-node":286,"../types/atom":287,"../types/error":288,"../types/path":289,"../walk/walk-path-set":295}],251:[function(_dereq_,module,exports){
module.exports = set_json_values_as_json_values;

var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var clone = _dereq_("../support/clone-dense-json");
var array_clone = _dereq_("../support/array-clone");

var options = _dereq_("../support/options");
var walk_path_set = _dereq_("../walk/walk-path-set");

var is_object = _dereq_("../support/is-object");

var get_valid_key = _dereq_("../support/get-valid-key");
var create_branch = _dereq_("../support/create-branch");
var wrap_node = _dereq_("../support/wrap-node");
var invalidate_node = _dereq_("../support/invalidate-node");
var replace_node = _dereq_("../support/replace-node");
var graph_node = _dereq_("../support/graph-node");
var update_back_refs = _dereq_("../support/update-back-refs");
var update_graph = _dereq_("../support/update-graph");
var inc_generation = _dereq_("../support/inc-generation");

var set_node_if_missing_path = _dereq_("../support/treat-node-as-missing-path-set");
var set_node_if_error = _dereq_("../support/treat-node-as-error");
var set_successful_paths = _dereq_("../support/set-successful-paths");

var positions = _dereq_("../support/positions");
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
    var optimizedPath = [];

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
    var root = roots[_cache];
    var size = is_object(node) && node.$size || 0;
    var message = roots.value;

    if (message === undefined && roots.no_data_source) {
        invalidate_node(parent, node, key, roots.lru);
        update_graph(parent, size, roots.version, roots.lru);
        node = undefined;
    } else {
        type = is_object(message) && message.$type || undefined;
        message = wrap_node(message, type, !!type ? message.value : message);
        type || (type = $atom);

        if (type == $error && !!selector) {
            message = selector(requested, message);
        }

        var is_distinct = roots.is_distinct = !roots.comparator(optimized, node, message);

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

    // TODO: CR Explain what's happening here.
    set_successful_paths(roots, requested, optimized);

    var isError = set_node_if_error(roots, node, type, requested);

    if (isError) {
        return;
    }

    if (roots.is_distinct === true) {
        roots.is_distinct = false;
        roots.onNext({
            path: array_clone(requested),
            value: clone(roots, node, type, node && node.value)
        });
    }
}
},{"../support/array-clone":253,"../support/clone-dense-json":255,"../support/create-branch":261,"../support/get-valid-key":263,"../support/graph-node":264,"../support/inc-generation":265,"../support/invalidate-node":267,"../support/is-object":269,"../support/options":274,"../support/positions":276,"../support/replace-node":278,"../support/set-successful-paths":279,"../support/treat-node-as-error":281,"../support/treat-node-as-missing-path-set":282,"../support/update-back-refs":284,"../support/update-graph":285,"../support/wrap-node":286,"../types/atom":287,"../types/error":288,"../walk/walk-path-set":295}],252:[function(_dereq_,module,exports){
module.exports=_dereq_(102)
},{}],253:[function(_dereq_,module,exports){
module.exports=_dereq_(103)
},{}],254:[function(_dereq_,module,exports){
module.exports=_dereq_(104)
},{}],255:[function(_dereq_,module,exports){
var $atom = _dereq_("../types/atom");
var clone = _dereq_("./clone");
module.exports = function(roots, node, type, value) {

    if(node == null || value === undefined) {
        return { $type: $atom };
    }

    if(roots.boxed == true) {
        return !!type && clone(node) || node;
    }

    return value;
}

},{"../types/atom":287,"./clone":260}],256:[function(_dereq_,module,exports){
var $atom = _dereq_("../types/atom");
var clone = _dereq_("./clone");
var is_primitive = _dereq_("./is-primitive");
module.exports = function(roots, node, type, value) {

    if(node == null || value === undefined) {
        return { $type: $atom };
    }

    if(roots.boxed == true) {
        return !!type && clone(node) || node;
    }

    if(!type || (type === $atom && is_primitive(value))) {
        return value;
    }

    return clone(node);
}

},{"../types/atom":287,"./clone":260,"./is-primitive":270}],257:[function(_dereq_,module,exports){
module.exports=_dereq_(107)
},{"./clone-optimized-path":258,"./clone-requested-path":259}],258:[function(_dereq_,module,exports){
module.exports=_dereq_(108)
},{}],259:[function(_dereq_,module,exports){
module.exports=_dereq_(109)
},{"./is-object":269}],260:[function(_dereq_,module,exports){
module.exports=_dereq_(110)
},{"../internal/prefix":223,"./is-object":269}],261:[function(_dereq_,module,exports){
// TODO: rename path to ref
var $ref = _dereq_("../types/path");
var $expired = "expired";
var replace_node = _dereq_("./replace-node");
var graph_node = _dereq_("./graph-node");
var update_back_refs = _dereq_("./update-back-refs");
var is_primitive = _dereq_("./is-primitive");
var is_expired = _dereq_("./is-expired");

// TODO: comment about what happens if node is a branch vs leaf.
module.exports = function create_branch(roots, parent, node, type, key) {

    if(!!type && is_expired(roots, node)) {
        type = $expired;
    }

    if((!!type && type != $ref) || is_primitive(node)) {
        node = replace_node(parent, node, {}, key, roots.lru);
        node = graph_node(roots[0], parent, node, key, 0);
        node = update_back_refs(node, roots.version);
    }
    return node;
}
},{"../types/path":289,"./graph-node":264,"./is-expired":268,"./is-primitive":270,"./replace-node":278,"./update-back-refs":284}],262:[function(_dereq_,module,exports){
module.exports=_dereq_(112)
},{"../internal/context":215,"../internal/ref":226,"../internal/ref-index":225,"../internal/refs-length":227}],263:[function(_dereq_,module,exports){
module.exports=_dereq_(113)
},{}],264:[function(_dereq_,module,exports){
module.exports=_dereq_(114)
},{"../internal/generation":216,"../internal/key":219,"../internal/parent":222}],265:[function(_dereq_,module,exports){
module.exports=_dereq_(115)
},{}],266:[function(_dereq_,module,exports){
module.exports=_dereq_(116)
},{}],267:[function(_dereq_,module,exports){
arguments[4][117][0].apply(exports,arguments)
},{"../internal/prefix":223,"./is-object":269,"./remove-node":277}],268:[function(_dereq_,module,exports){
module.exports=_dereq_(118)
},{"../internal/invalidated":218,"../lru/splice":237,"../values/expires-never":290,"../values/expires-now":291,"./now":273}],269:[function(_dereq_,module,exports){
module.exports=_dereq_(119)
},{}],270:[function(_dereq_,module,exports){
module.exports=_dereq_(120)
},{}],271:[function(_dereq_,module,exports){
module.exports=_dereq_(121)
},{"../internal/offset":221,"./is-object":269}],272:[function(_dereq_,module,exports){

var $self = "./";
var $path = _dereq_("../types/path");
var $atom = _dereq_("../types/atom");
var $expires_now = _dereq_("../values/expires-now");

var is_object = _dereq_("./is-object");
var is_primitive = _dereq_("./is-primitive");
var is_expired = _dereq_("./is-expired");
var promote = _dereq_("../lru/promote");
var wrap_node = _dereq_("./wrap-node");
var graph_node = _dereq_("./graph-node");
var replace_node = _dereq_("../support/replace-node");
var update_graph  = _dereq_("../support/update-graph");
var inc_generation = _dereq_("./inc-generation");
var invalidate_node = _dereq_("./invalidate-node");

module.exports = function(roots, parent, node, messageParent, message, key, optimized) {

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
                if(node[$self] == null) {
                    return graph_node(roots[0], parent, node, key, 0);
                }
                return node;
            }
        }
    } else if((node_is_object = is_object(node))) {
        type = node.$type;
    }

    var value, messageValue;

    if(type == $path) {
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
            if(messageType == $path) {
                if(node === message) {
                    // If the cache and message are the same reference,
                    // we performed a whole-branch merge of one of the
                    // grandparents. If we've previously graphed this
                    // reference, break early.
                    if(node[$self] != null) {
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
    if(!!messageType && !!message[$self] && is_expired(roots, message)) {
        if(node_is_object && node != message) {
            invalidate_node(parent, node, key, roots.lru);
        }
        return message;
    }
    // If the cache is a value, but the message is a branch, merge the branch over the value.
    else if(!!type && message_is_object && !messageType) {
        node = replace_node(parent, node, message, key, roots.lru);
        return graph_node(roots[0], parent, node, key, 0);
    }
    // If the message is a value, insert it into the cache.
    else if(!message_is_object || !!messageType) {
        var offset = 0;
        // If we've arrived at this message value, but didn't perform a whole-branch merge
        // on one of its ancestors, replace the cache node with the message value.
        if(node != message) {
            messageValue || (messageValue = !!messageType ? message.value : message);
            message = wrap_node(message, messageType, messageValue);
            var is_distinct = roots.is_distinct = !roots.comparator(optimized, node, message);
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
        else if(node_is_object && node[$self] == null) {
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

},{"../lru/promote":236,"../support/replace-node":278,"../support/update-graph":285,"../types/atom":287,"../types/path":289,"../values/expires-now":291,"./graph-node":264,"./inc-generation":265,"./invalidate-node":267,"./is-expired":268,"./is-object":269,"./is-primitive":270,"./wrap-node":286}],273:[function(_dereq_,module,exports){
module.exports=_dereq_(123)
},{}],274:[function(_dereq_,module,exports){
var inc_version = _dereq_("../support/inc-version");
var getBoundValue = _dereq_('../get/getBoundValue');

/**
 * TODO: more options state tracking comments.
 */
module.exports = function(options, model, error_selector, comparator) {
    
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
    options.no_data_source = model._dataSource == null;
    options.version = model._version = inc_version();
    
    options.offset || (options.offset = 0);
    options.error_selector = error_selector || model._errorSelector;
    options.comparator = comparator || model._comparator;
    
    if(bound.length) {
        nodes[0] = getBoundValue(model, bound).value;
    } else {
        nodes[0] = root;
    }
    
    return options;
};
},{"../get/getBoundValue":199,"../support/inc-version":266}],275:[function(_dereq_,module,exports){
module.exports=_dereq_(125)
},{"../internal/offset":221,"./is-object":269}],276:[function(_dereq_,module,exports){
module.exports=_dereq_(126)
},{}],277:[function(_dereq_,module,exports){
var $path = _dereq_("../types/path");
var __parent = _dereq_("../internal/parent");
var unlink = _dereq_("./unlink");
var delete_back_refs = _dereq_("./delete-back-refs");
var splice = _dereq_("../lru/splice");
var is_object = _dereq_("./is-object");

module.exports = function(parent, node, key, lru) {
    if(is_object(node)) {
        var type  = node.$type;
        if(!!type) {
            if(type == $path) { unlink(node); }
            splice(lru, node);
        }
        delete_back_refs(node);
        parent[key] = node[__parent] = undefined;
        return true;
    }
    return false;
}

},{"../internal/parent":222,"../lru/splice":237,"../types/path":289,"./delete-back-refs":262,"./is-object":269,"./unlink":283}],278:[function(_dereq_,module,exports){
arguments[4][128][0].apply(exports,arguments)
},{"./invalidate-node":267,"./transfer-back-refs":280}],279:[function(_dereq_,module,exports){
module.exports=_dereq_(129)
},{"./array-clone":253,"./array-slice":254}],280:[function(_dereq_,module,exports){
module.exports=_dereq_(130)
},{"../internal/context":215,"../internal/ref":226,"../internal/refs-length":227}],281:[function(_dereq_,module,exports){
module.exports=_dereq_(131)
},{"../lru/promote":236,"../types/error":288,"./array-clone":253}],282:[function(_dereq_,module,exports){
var $atom = _dereq_("../types/atom");
var clone_misses = _dereq_("./clone-missing-path-sets");
var is_expired = _dereq_("./is-expired");

module.exports = function treatNodeAsMissingPathSet(roots, node, type, pathset, depth, requested, optimized) {
    var dematerialized = !roots.materialized;
    if(node == null && dematerialized) {
        clone_misses(roots, pathset, depth, requested, optimized);
        return true;
    } else if(!!type) {
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

},{"../types/atom":287,"./clone-missing-path-sets":257,"./is-expired":268}],283:[function(_dereq_,module,exports){
module.exports=_dereq_(133)
},{"../internal/context":215,"../internal/ref":226,"../internal/ref-index":225,"../internal/refs-length":227}],284:[function(_dereq_,module,exports){
module.exports=_dereq_(134)
},{"../internal/generation":216,"../internal/parent":222,"../internal/ref":226,"../internal/refs-length":227,"../internal/version":229,"./inc-generation":265}],285:[function(_dereq_,module,exports){
arguments[4][135][0].apply(exports,arguments)
},{"../internal/key":219,"../internal/parent":222,"../internal/version":229,"./remove-node":277,"./update-back-refs":284}],286:[function(_dereq_,module,exports){
var $path = _dereq_("../types/path");
var $error = _dereq_("../types/error");
var $atom = _dereq_("../types/atom");

var now = _dereq_("./now");
var clone = _dereq_("./clone");
var is_array = Array.isArray;
var is_object = _dereq_("./is-object");

// TODO: CR Wraps a node for insertion.
// TODO: CR Define default atom size values.
module.exports = function wrap_node(node, type, value) {

    var dest = node, size = 0;

    if(!!type) {
        dest = clone(node);
        size = dest.$size;
    // }
    // if(type == $path) {
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

},{"../types/atom":287,"../types/error":288,"../types/path":289,"./clone":260,"./is-object":269,"./now":273}],287:[function(_dereq_,module,exports){
module.exports=_dereq_(137)
},{}],288:[function(_dereq_,module,exports){
module.exports=_dereq_(138)
},{}],289:[function(_dereq_,module,exports){
module.exports=_dereq_(139)
},{}],290:[function(_dereq_,module,exports){
module.exports=_dereq_(140)
},{}],291:[function(_dereq_,module,exports){
module.exports=_dereq_(141)
},{}],292:[function(_dereq_,module,exports){
module.exports=_dereq_(142)
},{"../internal/prefix":223,"../lru/promote":236,"../support/array-append":252,"../support/array-clone":253,"../support/array-slice":254,"../support/is-expired":268,"../support/is-object":269,"../support/is-primitive":270,"../support/positions":276,"../types/path":289,"./walk-reference":296}],293:[function(_dereq_,module,exports){
module.exports=_dereq_(143)
},{"../internal/context":215,"../internal/prefix":223,"../lru/promote":236,"../support/array-append":252,"../support/array-clone":253,"../support/array-slice":254,"../support/is-expired":268,"../support/is-object":269,"../support/is-primitive":270,"../support/positions":276,"../types/path":289,"./walk-reference":296}],294:[function(_dereq_,module,exports){
module.exports=_dereq_(144)
},{"../lru/promote":236,"../support/array-append":252,"../support/array-clone":253,"../support/array-slice":254,"../support/is-expired":268,"../support/is-object":269,"../support/is-primitive":270,"../support/keyset-to-key":271,"../support/permute-keyset":275,"../support/positions":276,"../types/path":289,"./walk-reference":296}],295:[function(_dereq_,module,exports){
module.exports=_dereq_(145)
},{"../internal/context":215,"../lru/promote":236,"../support/array-append":252,"../support/array-clone":253,"../support/array-slice":254,"../support/is-expired":268,"../support/is-object":269,"../support/is-primitive":270,"../support/keyset-to-key":271,"../support/permute-keyset":275,"../support/positions":276,"../types/path":289,"./walk-reference":296}],296:[function(_dereq_,module,exports){
module.exports=_dereq_(146)
},{"../internal/context":215,"../internal/prefix":223,"../internal/ref":226,"../internal/ref-index":225,"../internal/refs-length":227,"../support/array-append":252,"../support/array-slice":254,"../support/is-object":269,"../support/is-primitive":270,"../support/positions":276}],297:[function(_dereq_,module,exports){
var falcor = _dereq_('falcor');
Observable = falcor.Observable;

function XMLHttpSource(jsongUrl, timeout) {
    this._jsongUrl = jsongUrl;
    this._timeout = timeout || 15000;
}

XMLHttpSource.prototype = {
    /**
     * @inheritDoc DataSource#get
     */
    get: function (pathSet) {
        var method = 'GET';
        var config = buildQueryObject(this._jsongUrl, method, {
            path: pathSet,
            method: 'get'
        });
        return request(method, config);
    },
    /**
     * @inheritDoc DataSource#set
     */
    set: function (jsongEnv) {
        var method = 'POST';
        var config = buildQueryObject(this._jsongUrl, method, {
            path: jsongEnv,
            method: 'set'
        });
        return request(method, config);
    },

    /**
     * @inheritDoc DataSource#call
     */
    call: function (callPath, args, pathSuffix, paths) {
        var method = 'GET';
        var queryData = [];
        args = args || [];
        pathSuffix = pathSuffix || [];
        paths = paths || [];
        paths.forEach(function (path) {
            queryData.push('path=' + encodeURIComponent(JSON.stringify(path)));
        });

        queryData.push('method=call');
        queryData.push('callPath=' + encodeURIComponent(JSON.stringify(callPath)));

        if (Array.isArray(args)) {
            args.forEach(function (value) {
                queryData.push('param=' + encodeURIComponent(JSON.stringify(value)));
            });
        }

        if (Array.isArray(pathSuffix)) {
            pathSuffix.forEach(function (value) {
                queryData.push('pathSuffix=' + encodeURIComponent(JSON.stringify(value)));
            });
        }

        var config = buildQueryObject(this._jsongUrl, method, queryData.join('&'));
        return request(method, config);
    }
};

function request(method, config) {
    return Observable.create(function (observer) {
        // i have to actual work now :(
        var xhr = new XMLHttpRequest();

        // Link the response methods
        xhr.onload = onXhrLoad.bind(null, observer, xhr);
        xhr.onerror = onXhrError.bind(null, observer, xhr);
        xhr.ontimeout = onXhrTimeout.bind(null, observer, xhr);

        // Sets information
        xhr.timeout = config.timeout;

        // Anything but explicit false results in true.
        xhr.withCredentials = !(config.withCredentials === false);
        xhr.responseType = 'json';

        // Takes the url and opens the connection
        xhr.open(method, config.url);

        // Fills the request headers
        var requestHeaders = config.requestHeaders || {};
        var keys = Object.keys(requestHeaders);
        keys.forEach(function (k) {
            xhr.setRequestHeader(k, requestHeaders[k]);
        });

        // Sends the request.
        xhr.send(config.data);

        return function () {
            // TODO: Dispose of request.
        };
    });
}

/*
 * General handling of a successfully completed request (that had a 200 response code)
 */
function _handleXhrComplete(observer, data) {
    observer.onNext(data);
    observer.onCompleted();
}

/*
 * General handling of ultimate failure (after appropriate retries)
 */
function _handleXhrError(observer, textStatus, errorThrown) {
    if (!errorThrown) {
        errorThrown = new Error(textStatus);
    }

    observer.onError(errorThrown);
}

function onXhrLoad(observer, xhr) {
    var status,
        responseData,
        repsonseType,
        responseObject;

    // If there's no observer, the request has been (or is being) cancelled.
    if (xhr && observer) {
        status = xhr.status;
        responseType = xhr.responseType;

        if (status >= 200 && status <= 399) {
            try {
                if (responseType === 'text') {
                    responseData = JSON.parse(xhr.responseText || '');
                } else if(typeof xhr.response !== "undefined") {
                    responseData = xhr.response;
                } else if(typeof xhr.responseText !== "undefined") {
                    responseData = JSON.parse(xhr.responseText || '');
                }
            } catch (e) {
                _handleXhrError(observer, 'invalid json', e);
            }
            _handleXhrComplete(observer, responseData);
        } else if (status === 401 || status === 403 || status === 407) {
            _handleXhrError(observer, responseData);
        } else if (status === 410) {
            // TODO: Retry ?
            _handleXhrError(observer, responseData);
        } else if (status === 408 || status === 504) {
            // TODO: Retry ?
            _handleXhrError(observer, responseData);
        } else {
            _handleXhrError(observer, responseData || ('Response code ' + status));
        }
    }
}

function onXhrError(observer, xhr) {
    _handleXhrError(observer, xhr.statusText || 'request error');
}

function onXhrTimeout(observer) {
    _handleXhrError(observer, 'request timeout');
}

function buildQueryObject(url, method, queryData) {
    var qData = [];
    var keys;
    var data = {url: url};

    if (typeof queryData === 'string') {
        qData.push(queryData);
    } else {
        keys = Object.keys(queryData);
        keys.forEach(function (k) {
            var value = typeof queryData[k] === 'object' ? JSON.stringify(queryData[k]) : queryData[k];
            qData.push(k + '=' + value);
        });
    }

    if (method === 'GET') {
        data.url += '?' + qData.join('&');
    } else {
        data.data = qData.join('&');
    }

    return data;
}
module.exports = XMLHttpSource;

},{"falcor":153}],298:[function(_dereq_,module,exports){
module.exports = function(x) {
    return x;
};

},{}],299:[function(_dereq_,module,exports){
var Observer = _dereq_('./Observer');
var Disposable = _dereq_('./disposable/Disposable');

function Observable(s) {
    this._subscribe = s;
};

Observable.create = Observable.createWithDisposable = function(s) {
    return new Observable(s);
};

Observable.fastCreateWithDisposable = Observable.create;

Observable.fastReturnValue = function fastReturnValue(value) {
    return Observable.create(function(observer) {
        observer.onNext(value);
        observer.onCompleted();
    });
};

Observable.empty = function empty() {
    return Observable.create(function(observer) {
        observer.onCompleted();
    });
};

Observable.of = function of() {
    var len = arguments.length, args = new Array(len);
    for(var i = 0; i < len; i++) { args[i] = arguments[i]; }
    return Observable.create(function(observer) {
        var errorOcurred = false;
        try {
            for(var i = 0; i < len; ++i) {
                observer.onNext(args[i]);
            }
        } catch(e) {
            errorOcurred = true;
            observer.onError(e);
        }
        if (errorOcurred !== true) {
            observer.onCompleted();
        }
    });
};

Observable.from = function from(x) {
    if (Array.isArray(x)) {
        return Observable.create(function(observer) {
            var err = false;
            x.forEach(function(el) {
                try {
                    observer.onNext(el);
                } catch (e) {
                    err = true;
                    observer.onError(e);
                }
            });

            if (!err) {
                observer.onCompleted();
            }
        });
    }
};

Observable.prototype.subscribe = function subscribe(n, e, c) {
    return fixDisposable(this._subscribe(
        (n && typeof n === 'object') ?
        n :
        Observer.create(n, e, c)
    ));
};

function fixDisposable(disposable) {
    switch(typeof disposable) {
        case "function":
            return new Disposable(disposable);
        case "object":
            return disposable || Disposable.empty;
        default:
            return Disposable.empty;
    }
}

module.exports = Observable;
},{"./Observer":300,"./disposable/Disposable":303}],300:[function(_dereq_,module,exports){
var I = _dereq_('./I');
var Observer = module.exports = function Observer(n, e, c) {
    this.onNext =       n || I;
    this.onError =      e || I;
    this.onCompleted =  c || I;
};

Observer.create = function(n, e, c) {
    return new Observer(n, e, c);
};


},{"./I":298}],301:[function(_dereq_,module,exports){
var Subject = module.exports = function Subject() {
    this.observers = [];
};
Subject.prototype.subscribe = function(subscriber) {
    var a = this.observers,
        n = a.length;
    a[n] = subscriber;
    return {
        dispose: function() {
            a.splice(n, 1);
        }
    };
};
Subject.prototype.onNext = function(x) {
    var listeners = this.observers.concat(),
        i = -1, n = listeners.length;
    while(++i < n) {
        listeners[i].onNext(x);
    }
};
Subject.prototype.onError = function(e) {
    var listeners = this.observers.concat(),
        i  = -1, n = listeners.length;
    this.observers.length = 0;
    while(++i < n) {
        listeners[i].onError(e);
    }
};
Subject.prototype.onCompleted = function() {
    var listeners = this.observers.concat(),
        i  = -1, n = listeners.length;
    this.observers.length = 0;
    while(++i < n) {
        listeners[i].onCompleted();
    }
};

},{}],302:[function(_dereq_,module,exports){
var Disposable = _dereq_("./Disposable");

function CompositeDisposable() {
    this.length = 0;
    this.disposables = [];
    if(arguments.length) {
        this.add.apply(this, arguments);
    }
}

CompositeDisposable.prototype = Object.create(Disposable.prototype);

CompositeDisposable.prototype.add = function() {
    var disposables = this.disposables;
    var args = [];
    var argsLen = arguments.length;
    var argsIdx = -1;
    while(++argsIdx < argsLen) {
        args[argsIdx] = arguments[argsIdx];
    }
    if(argsLen > 0) {
        argsIdx = -1;
        argsLen = args.length;
        while(++argsIdx < argsLen) {
            var disposable = args[argsIdx];
            if(Array.isArray(disposable)) {
                argsLen = args.push.apply(args, disposable);
            } else if(!!disposable) {
                switch(typeof disposable) {
                    case "function":
                        disposables.push(new Disposable(disposable));
                        break;
                    case "object":
                        if(typeof disposable.dispose === "function") {
                            disposables.push(disposable);
                        }
                        break;
                }
            }
        }
    }
    if(this.disposed) {
        this.action();
    }
    this.length = disposables.length;
    return this;
};

CompositeDisposable.prototype.remove = function() {
    var disposables = this.disposables;
    var args = [];
    var argsLen = arguments.length;
    var argsIdx = -1;
    while(++argsIdx < argsLen) {
        args[argsIdx] = arguments[argsIdx];
    }
    if(argsLen > 0) {
        argsIdx = -1;
        argsLen = args.length;
        while(++argsIdx < argsLen) {
            var disposable = args[argsIdx];
            if(Array.isArray(disposable)) {
                argsLen = args.push.apply(args, disposable);
            } else if(!!disposable) {
                var disposableIndex = disposables.indexOf(disposable);
                if(~disposableIndex) {
                    disposables.splice(disposableIndex, 1);
                }
            }
        }
    }
    this.length = disposables.length;
    return this;
}

CompositeDisposable.prototype.action = function() {
    this.disposed = true;
    var disposables = this.disposables;
    var disposablesCount = disposables.length;
    while(--disposablesCount > -1) {
        var disposable = disposables[disposablesCount];
        disposables.length = disposablesCount;
        disposable.dispose();
    }
};

module.exports = CompositeDisposable;
},{"./Disposable":303}],303:[function(_dereq_,module,exports){
function Disposable(a) {
    this.action = a;
};

Disposable.create = function(a) {
    return new Disposable(a);
};

Disposable.empty = new Disposable(function(){});

Disposable.prototype.dispose = function() {
    if(typeof this.action === 'function') {
        this.action();
    }
};

module.exports = Disposable;
},{}],304:[function(_dereq_,module,exports){
var Disposable = _dereq_("./Disposable");

function SerialDisposable() {
    if(arguments.length > 0) {
        this.setDisposable(arguments[0]);
    }
}

SerialDisposable.prototype = Object.create(Disposable.prototype);

SerialDisposable.prototype.action = function() {
    if(this.disposable) {
        this.disposable.dispose();
        this.disposable = undefined;
    }
    this.disposed = true;
};

SerialDisposable.prototype.setDisposable = function(d) {
    if(this.disposed) {
        d.dispose();
    } else {
        if(this.disposable) {
            this.disposable.dispose();
        }
        this.disposable = d;
    }
};

module.exports = SerialDisposable;
},{"./Disposable":303}],305:[function(_dereq_,module,exports){
(function (global){
var Rx;

if (typeof window !== "undefined" && typeof window["Rx"] !== "undefined") {
    // Browser environment
    Rx = window["Rx"];
} else if (typeof global !== "undefined" && typeof global["Rx"] !== "undefined") {
    // Node.js environment
    Rx = global["Rx"];
} else if (typeof _dereq_ !== 'undefined' || typeof window !== 'undefined' && window.require) {
    var r = typeof _dereq_ !== 'undefined' && _dereq_ || window.require;
    try {
        // CommonJS environment with rx module
        Rx = r("rx");
    } catch(e) {
        Rx = undefined;
    }
}

if (Rx === undefined) {
    
    var Observable = _dereq_("./Observable");
    
    Observable.prototype.materialize = _dereq_("./operators/materialize");
    Observable.prototype.reduce = _dereq_("./operators/reduce");
    Observable.prototype.catchException = _dereq_("./operators/catch");
    Observable.prototype.toArray = _dereq_("./operators/to-array");
    Observable.prototype.mergeAll = _dereq_("./operators/merge-all");
    Observable.prototype.map = _dereq_("./operators/map");
    Observable.prototype.flatMap = _dereq_("./operators/flat-map");
    Observable.prototype.defaultIfEmpty = _dereq_("./operators/default-if-empty");
    
    Observable.prototype.forEach = Observable.prototype.subscribe;
    Observable.prototype.select = Observable.prototype.map;
    Observable.prototype.selectMany = Observable.prototype.flatMap;
    
    Rx = {
        Disposable: _dereq_('./disposable/Disposable'),
        CompositeDisposable: _dereq_('./disposable/CompositeDisposable'),
        SerialDisposable: _dereq_('./disposable/SerialDisposable'),
        Observable: Observable,
        Observer: _dereq_('./Observer'),
        Subject: _dereq_('./Subject'),
    };
}

module.exports = Rx;

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./Observable":299,"./Observer":300,"./Subject":301,"./disposable/CompositeDisposable":302,"./disposable/Disposable":303,"./disposable/SerialDisposable":304,"./operators/catch":306,"./operators/default-if-empty":307,"./operators/flat-map":308,"./operators/map":309,"./operators/materialize":310,"./operators/merge-all":311,"./operators/reduce":312,"./operators/to-array":313}],306:[function(_dereq_,module,exports){
var Observable = _dereq_("../Observable");
var CompositeDisposable = _dereq_("../disposable/CompositeDisposable");
var SerialDisposable = _dereq_("../disposable/SerialDisposable");

module.exports = function catchException(next) {
    var source = this;
    return Observable.create(function(o) {
        var m = new SerialDisposable();
        m.setDisposable(source.subscribe(
            function(x) { o.onNext(x); },
            function(e) {
                m.setDisposable(((typeof next === 'function') ? next(e) : next).subscribe(o));
            },
            function() { o.onCompleted(); }
        ))
        return m;
    });
}
},{"../Observable":299,"../disposable/CompositeDisposable":302,"../disposable/SerialDisposable":304}],307:[function(_dereq_,module,exports){
var Observable = _dereq_("../Observable");

module.exports = function defaultIfEmpty(value) {
    var source = this;
    return Observable.create(function(observer) {
        var hasValue = false;
        return source.subscribe(function(x) {
            hasValue = true;
            observer.onNext(x);
        },
        function(e) { observer.onError(e); },
        function( ) {
            if(!hasValue) {
                observer.onNext(value);
            }
            observer.onCompleted();
        })
    });
};
},{"../Observable":299}],308:[function(_dereq_,module,exports){
var Observable = _dereq_("../Observable");
module.exports = function flatMap(selector) {
    if(Boolean(selector) && typeof selector === "object") {
        var obs = selector;
        selector = function() { return obs; };
    }
    return this.map(selector).mergeAll();
}
},{"../Observable":299}],309:[function(_dereq_,module,exports){
var Observable = _dereq_("../Observable");

module.exports = function map(selector) {
    var source = this;
    return Observable.create(function(observer) {
        return source.subscribe(
            function(x) {
                try {
                    var errored = false;
                    var value = selector(x);
                } catch(e) {
                    errored = true;
                    observer.onError(e);
                } finally {
                    if(errored === false) {
                        observer.onNext(value);
                    }
                }
            },
            function(e) { observer.onError(e); },
            function( ) { observer.onCompleted(); }
        )
    });
};
},{"../Observable":299}],310:[function(_dereq_,module,exports){
var Observable = _dereq_("../Observable");

module.exports = function materialize() {
    var source = this;
    return Observable.create(function(observer) {
        source.subscribe(function(x) {
            try {
                observer.onNext({kind: 'N', value: x});
            } catch(e) {
                observer.onError(e);
            }
        }, function(err) {
            observer.onNext({kind: 'E', value: err});
            observer.onCompleted();
        }, function() {
            observer.onNext({kind: 'C'});
            observer.onCompleted();
        });
    });
}
},{"../Observable":299}],311:[function(_dereq_,module,exports){
var Observable = _dereq_("../Observable");
var Disposable = _dereq_("../disposable/Disposable");
var CompositeDisposable = _dereq_("../disposable/CompositeDisposable");
var SerialDisposable = _dereq_("../disposable/SerialDisposable");

module.exports = function mergeAll() {
    var source = this;
    return Observable.create(function(observer) {
        var m = new SerialDisposable();
        var group = new CompositeDisposable(m);
        var isStopped = false;
        m.setDisposable(source.subscribe(function(innerObs) {
            var innerDisposable = new SerialDisposable();
            group.add(innerDisposable);
            innerDisposable.setDisposable(innerObs.subscribe(
                function(x) { observer.onNext(x); },
                function(e) { observer.onError(e); },
                function( ) {
                    group.remove(innerDisposable);
                    if(isStopped && group.length === 1) {
                        observer.onCompleted();
                    }
                }));
        },
        function(e) { observer.onError(e); },
        function( ) {
            isStopped = true;
            if(group.length === 1) {
                observer.onCompleted();
            }
        }));
        return group;
    });
};
},{"../Observable":299,"../disposable/CompositeDisposable":302,"../disposable/Disposable":303,"../disposable/SerialDisposable":304}],312:[function(_dereq_,module,exports){
var Observable = _dereq_("../Observable");

module.exports = function reduce(selector, seedValue) {
    var source = this;
    var hasSeed = arguments.length > 1;
    return Observable.create(function(observer) {
        var accValue = seedValue;
        var hasValue = false;
        return source.subscribe(
            function(x) {
                try {
                    if(hasValue || (hasValue = hasSeed)) {
                        accValue = selector(accValue, x);
                        return;
                    }
                    accValue = x;
                    hasValue = true;
                } catch (e) {
                    observer.onError(e);
                }
            },
            function(e) { observer.onError(e); },
            function( ) {
                if(hasValue || hasSeed) {
                    observer.onNext(accValue);
                }
                observer.onCompleted();
            });
    });
}
},{"../Observable":299}],313:[function(_dereq_,module,exports){
var Observable = _dereq_("../Observable");

module.exports = function toArray() {
    var source = this;
    return Observable.create(function(observer) {
        var list = [];
        return source.subscribe(
            function(x) { list.push(x); },
            function(e) { observer.onError(e); },
            function( ) {
                observer.onNext(list);
                observer.onCompleted();
            });
    });
};
},{"../Observable":299}],314:[function(_dereq_,module,exports){
module.exports = {
    integers: 'integers',
    ranges: 'ranges',
    keys: 'keys'
};

},{}],315:[function(_dereq_,module,exports){
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

},{}],316:[function(_dereq_,module,exports){
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


},{}],317:[function(_dereq_,module,exports){
var Tokenizer = _dereq_('./tokenizer');
var head = _dereq_('./parse-tree/head');
var RoutedTokens = _dereq_('./RoutedTokens');

var parser = function parser(string, extendedRules) {
    return head(new Tokenizer(string, extendedRules));
};

module.exports = parser;

// Constructs the paths from paths / pathValues that have strings.
// If it does not have a string, just moves the value into the return
// results.
parser.fromPathsOrPathValues = function(paths, ext) {
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
    if (typeof path === 'string') {
        return parser(path, ext);
    }
    return path;
};

// Potential routed tokens.
parser.RoutedTokens = RoutedTokens;

},{"./RoutedTokens":314,"./parse-tree/head":318,"./tokenizer":323}],318:[function(_dereq_,module,exports){
var TokenTypes = _dereq_('./../TokenTypes');
var E = _dereq_('./../exceptions');
var indexer = _dereq_('./indexer');

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


},{"./../TokenTypes":315,"./../exceptions":316,"./indexer":319}],319:[function(_dereq_,module,exports){
var TokenTypes = _dereq_('./../TokenTypes');
var E = _dereq_('./../exceptions');
var idxE = E.indexer;
var range = _dereq_('./range');
var quote = _dereq_('./quote');
var routed = _dereq_('./routed');

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
                E.throwError(idxE.unexpectedToken, tokenizer);
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


},{"./../TokenTypes":315,"./../exceptions":316,"./quote":320,"./range":321,"./routed":322}],320:[function(_dereq_,module,exports){
var TokenTypes = _dereq_('./../TokenTypes');
var E = _dereq_('./../exceptions');
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


},{"./../TokenTypes":315,"./../exceptions":316}],321:[function(_dereq_,module,exports){
var Tokenizer = _dereq_('./../tokenizer');
var TokenTypes = _dereq_('./../TokenTypes');
var E = _dereq_('./../exceptions');

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


},{"./../TokenTypes":315,"./../exceptions":316,"./../tokenizer":323}],322:[function(_dereq_,module,exports){
var TokenTypes = _dereq_('./../TokenTypes');
var RoutedTokens = _dereq_('./../RoutedTokens');
var E = _dereq_('./../exceptions');
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


},{"./../RoutedTokens":314,"./../TokenTypes":315,"./../exceptions":316}],323:[function(_dereq_,module,exports){
var TokenTypes = _dereq_('./../TokenTypes');
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



},{"./../TokenTypes":315}],324:[function(_dereq_,module,exports){
'use strict';

module.exports = _dereq_('./lib')

},{"./lib":329}],325:[function(_dereq_,module,exports){
'use strict';

var asap = _dereq_('asap/raw')

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
},{"asap/raw":149}],326:[function(_dereq_,module,exports){
'use strict';

var Promise = _dereq_('./core.js')

module.exports = Promise
Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this
  self.then(null, function (err) {
    setTimeout(function () {
      throw err
    }, 0)
  })
}
},{"./core.js":325}],327:[function(_dereq_,module,exports){
'use strict';

//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = _dereq_('./core.js')
var asap = _dereq_('asap/raw')

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

},{"./core.js":325,"asap/raw":149}],328:[function(_dereq_,module,exports){
'use strict';

var Promise = _dereq_('./core.js')

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

},{"./core.js":325}],329:[function(_dereq_,module,exports){
'use strict';

module.exports = _dereq_('./core.js')
_dereq_('./done.js')
_dereq_('./finally.js')
_dereq_('./es6-extensions.js')
_dereq_('./node-extensions.js')

},{"./core.js":325,"./done.js":326,"./es6-extensions.js":327,"./finally.js":328,"./node-extensions.js":330}],330:[function(_dereq_,module,exports){
'use strict';

//This file contains then/promise specific extensions that are only useful for node.js interop

var Promise = _dereq_('./core.js')
var asap = _dereq_('asap')

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

},{"./core.js":325,"asap":147}]},{},[1])
(1)
});