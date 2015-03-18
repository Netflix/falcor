falcor.Model = Model;

Model.EXPIRES_NOW = falcor.EXPIRES_NOW;
Model.EXPIRES_NEVER = falcor.EXPIRES_NEVER;

function Model(options) {
    options || (options = {});
    this._dataSource = options.source;
    this._maxSize = options.maxSize || Math.pow(2, 53) - 1;
    this._collectRatio = options.collectRatio || 0.75;
    this._scheduler = new falcor.ImmediateScheduler();
    this._request = new RequestQueue(this, this._scheduler);
    this._errorSelector = options.errorSelector || Model.prototype._errorSelector;
    this._router = options.router;
    this._materialized = options.materialized;
    this._root = options.root || {
        expired: [],
        allowSync: false,
        unsafeMode: true
    };
    if (options.cache && typeof options.cache === "object") {
        this.setCache(options.cache);
    } else {
        this._cache = {};
    }
    this._path = [];
}

Model.prototype = {
    _boxed: false,
    _progressive: false,
    _request: new falcor.RequestQueue(new falcor.ImmediateScheduler()),
    _errorSelector: function(x, y) { return y; },
    get: modelOperation("get"),
    set: modelOperation("set"),
    invalidate: modelOperation("inv"),
    call: call,
    getValue: function(path) {
        return this.get(path, function(x) { return x });
    },
    setValue: function(path, value) {
        return this.set(Array.isArray(path) ?
            {path: path, value: value} :
            path, function(x) { return x; });
    },
    setCache: function(cache) {
        return (this._cache = {}) && setCache(this, cache);
    },
    bind: function(boundPath) {
        
        var model = this, root = model._root,
            paths = new Array(arguments.length - 1),
            i = -1, n = arguments.length - 1;
        
        while(++i < n) {
            paths[i] = arguments[i + 1];
        }
        
        if(n === 0) { throw new Error("Model#bind requires at least one value path."); }
        
        return falcor.Observable.create(function(observer) {
            
            var boundModel;
            
            try {
                root.allowSync = true;
                if(!(boundModel = model.bindSync(model._path.concat(boundPath)))) {
                    throw false;
                }
                root.allowSync = false;
                observer.onNext(boundModel);
                observer.onCompleted();
            } catch (e) {
                root.allowSync = false;
                return model.get.apply(model, paths.map(function(path) {
                    return boundPath.concat(path);
                }).concat(function(){})).subscribe(
                    function onNext() {},
                    function onError(err)  { observer.onError(err); },
                    function onCompleted() {
                        try {
                            if(boundModel = model.bindSync(boundPath)) {
                                observer.onNext(boundModel);
                            }
                            observer.onCompleted();
                        } catch(e) {
                            observer.onError(e);
                        }
                });
            }
        });
    },
    setRetryCount: function(x) {
        return this.clone(["_retryMax", x]);
    },
    getBoundPath: function() {
        return this.syncCheck("getBoundPath") && this._getBoundPath(this);
    },
    getValueSync: function(path) {
        if(Array.isArray(path) === false) {
            throw new Error("Model#getValueSync must be called with an Array path.");
        }
        var value = this.syncCheck("getValueSync") && this._getValueSync(this, this._path.concat(path));
        if(value[$TYPE] === ERROR) {
            throw value;
        }
        return value;
    },
    setValueSync: function(path, value, errorSelector) {
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
        if(this._dataSource) {
            throw new Error("Model#setValueSync can not be invoked on a Model with a DataSource. Please use the withoutDataSource() method followed by setValueSync if you would like to modify only the local cache.");
        }
        var value = this.syncCheck("setValueSync") && this._setValueSync(this, this._path.concat(path), value, errorSelector);
        if(value[$TYPE] === ERROR) {
            throw value;
        }
        return value;
    },
    bindSync: function(path) {
        if(Array.isArray(path) === false) {
            throw new Error("Model#bindSync must be called with an Array path.");
        }
        var boundValue = this.syncCheck("bindSync") && getBoundPath(this, this._path.concat(path));
        if(boundValue.shorted) {
            if(boundValue = boundValue.value) {
                if(boundValue[$TYPE] === ERROR) {
                    throw boundValue;
                    // throw new Error("Model#bindSync can\'t bind to or beyond an error: " + boundValue.toString());
                }
            }
            return undefined;
        } else if(boundValue.value && boundValue.value[$TYPE] === ERROR) {
            throw boundValue.value;
        }
        return this.clone(["_path", boundValue.path]);
    },
    // TODO: This seems like a great place for optimizations
    clone: function() {
        var self = this;
        var clone = new Model();
        
        Object.keys(self).forEach(function(key) {
            clone[key] = self[key];
        });
        
        Array.prototype.slice.call(arguments).forEach(function(tuple) {
            clone[tuple[0]] = tuple[1];
        });
        
        return clone;
    },
    batch: function(schedulerOrDelay) {
        if(typeof schedulerOrDelay === "number") {
            schedulerOrDelay = new falcor.TimeoutScheduler(Math.round(Math.abs(schedulerOrDelay)));
        } else if(!schedulerOrDelay || !schedulerOrDelay.schedule) {
            schedulerOrDelay = new falcor.ImmediateScheduler();
        }
        return this.clone(["_request", new falcor.RequestQueue(this, schedulerOrDelay)]);
    },
    unbatch: function() {
        return this.clone(["_request", new falcor.RequestQueue(this, new ImmediateScheduler())]);
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
    syncCheck: function(name) {
        if(this._root.allowSync === false && this._root.unsafeMode === false) {
            throw new Error("Model#" + name + " may only be called within the context of a request selector.");
        }
        return true;
    },
    addVirtualPaths: function(pathsAndActions) {
        this._virtualPaths = addVirtualPaths(pathsAndActions, this);
    },
    
    _getBoundPath            :            getBoundPath,
    
    _getValueSync            :              getPathSet,
    _setValueSync            :              setPathSet,
    
    _getPath                 :                 getPath,
    _getPathSet              :              getPathSet,
    _getPathSetsAsValues     :     getPathSetsAsValues,
    _getPathSetsAsJSON       :       getPathSetsAsJSON,
    _getPathSetsAsPathMap    :    getPathSetsAsPathMap,
    _getPathSetsAsJSONG      :      getPathSetsAsJSONG,
    
    _getPathMap              :              getPathMap,
    _getPathMapsAsValues     :     getPathMapsAsValues,
    _getPathMapsAsJSON       :       getPathMapsAsJSON,
    _getPathMapsAsPathMap    :    getPathMapsAsPathMap,
    _getPathMapsAsJSONG      :      getPathMapsAsJSONG,
    
    _setCache                :                setCache,
    _setPath                 :                 setPath,
    _setPathSet              :              setPathSet,
    _setPathSetsAsValues     :     setPathSetsAsValues,
    _setPathSetsAsJSON       :       setPathSetsAsJSON,
    _setPathSetsAsPathMap    :    setPathSetsAsPathMap,
    _setPathSetsAsJSONG      :      setPathSetsAsJSONG,
    
    _setPathMap              :              setPathMap,
    _setPathMapsAsValues     :     setPathMapsAsValues,
    _setPathMapsAsJSON       :       setPathMapsAsJSON,
    _setPathMapsAsPathMap    :    setPathMapsAsPathMap,
    _setPathMapsAsJSONG      :      setPathMapsAsJSONG,
    
    _setJSONGsAsValues       :       setJSONGsAsValues,
    _setJSONGsAsJSON         :         setJSONGsAsJSON,
    _setJSONGsAsPathMap      :      setJSONGsAsPathMap,
    _setJSONGsAsJSONG        :        setJSONGsAsJSONG,
    
    _invPathSetsAsValues     :      invalidatePathSets,
    _invPathSetsAsJSON       :      invalidatePathSets,
    _invPathSetsAsPathMap    :      invalidatePathSets,
    _invPathSetsAsJSONG      :      invalidatePathSets,
    
    _invPathMapsAsValues     :      invalidatePathMaps,
    _invPathMapsAsJSON       :      invalidatePathMaps,
    _invPathMapsAsPathMap    :      invalidatePathMaps,
    _invPathMapsAsJSONG      :      invalidatePathMaps
};

