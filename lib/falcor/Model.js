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
                // Bug 129: if user code throws in onNext, they get onNexted again in the catch block instead of getting onErrored. Presumably we only want to do this catch block if bindSync encounters error?
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
        return { $type: "ref", value: this._path };
    }
};
