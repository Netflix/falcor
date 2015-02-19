
jsong.Model = Model;

Model.EXPIRES_NOW = jsong.EXPIRES_NOW;
Model.EXPIRES_NEVER = jsong.EXPIRES_NEVER;

function Model(options) {
    options || (options = {});
    this._dataSource = options.dataSource;
    this._maxSize = options.maxSize || Math.pow(2, 53) - 1;
    this._collectRatio = options.collectRatio || 0.75;
    this._scheduler = new jsong.ImmediateScheduler();
    this._request = new RequestQueue(this, this._scheduler);
    this._errorSelector = options.errorSelector || Model.prototype._errorSelector;
    this._cache = {};
    if(options.cache && typeof options.cache === "object") {
        this.setCache(options.cache);
    }
    this._retryCount = 3;
}

Model.prototype = {
    _root: {
        expired: [],
        allowSync: false,
        unsafeMode: true
    },
    _path: [],
    _boxed: false,
    _progressive: false,
    _request: new jsong.RequestQueue(new jsong.ImmediateScheduler()),
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
    bind: function(boundPath) {
        
        var model = this, root = model._root,
            paths = new Array(arguments.length - 1),
            i = -1, n = arguments.length - 1;
        
        while(++i < n) {
            paths[i] = arguments[i + 1];
        }
        
        if(n === 0) { throw new Error("Model#bind requires at least one value path."); }
        
        return Rx.Observable.create(function(observer) {
            
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
    setCache: function(cache) {
        return this._setPathMapsAsValues(this, [cache], undefined, this._errorSelector, []);
    },
    getBoundValue: function() {
        return this.syncCheck("getBoundValue") && this._getBoundValue(this);
    },
    getBoundContext: function() {
        return this.syncCheck("getBoundContext") && this._getBoundContext(this);
    },
    getValueSync: function(path) {
        if(Array.isArray(path) === false) {
            throw new Error("Model#getValueSync must be called with an Array path.");
        }
        var value = this.syncCheck("getValueSync") && this._getValueSync(this, this._path.concat(path)).value;
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
        var boundValue = this.syncCheck("bindSync") && getBoundValue(this, this._path.concat(path));
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
    clone: function() {
        var self = this,
            clone =  Array.prototype.slice.call(arguments).reduce(function(model, tuple) {
                return (model[tuple[0]] = tuple[1]) && model || model;
            }, Object.keys(self).reduce(function(model, key) {
                return (model[key] = self[key]) && model || model;
            }, new Model(
                self._dataSource,
                self._maxSize,
                self._collectRatio,
                self._errorSelector,
                self._cache
            )));
        clone._root = self._root;
        return clone;
    },
    batch: function(schedulerOrDelay) {
        if(typeof schedulerOrDelay === "number") {
            schedulerOrDelay = new jsong.TimeoutScheduler(Math.round(Math.abs(schedulerOrDelay)));
        } else if(!schedulerOrDelay || !schedulerOrDelay.schedule) {
            schedulerOrDelay = new jsong.ImmediateScheduler();
        }
        return this.clone(["_request", new jsong.RequestQueue(this, schedulerOrDelay)]);
    },
    unbatch: function() {
        return this.clone(["_request", new jsong.RequestQueue(this, new ImmediateScheduler())]);
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
    
    _getBoundContext         :       getBoundContext,
    _getBoundValue           :         getBoundValue,
    
    _getValueSync            :          getValueSync,
    _setValueSync            :          setValueSync,
    
    _getPathsAsValues        :      getPathsAsValues,
    _getPathsAsJSON          :        getPathsAsJSON,
    _getPathsAsPathMap       :     getPathsAsPathMap,
    _getPathsAsJSONG         :       getPathsAsJSONG,
    
    _getPathMapsAsValues     :   getPathMapsAsValues,
    _getPathMapsAsJSON       :     getPathMapsAsJSON,
    _getPathMapsAsPathMap    :  getPathMapsAsPathMap,
    _getPathMapsAsJSONG      :    getPathMapsAsJSONG,
    
    _setPathsAsValues        :      setPathsAsValues,
    _setPathsAsJSON          :        setPathsAsJSON,
    _setPathsAsPathMap       :     setPathsAsPathMap,
    _setPathsAsJSONG         :       setPathsAsJSONG,
    
    _setPathMapsAsValues     :   setPathMapsAsValues,
    _setPathMapsAsJSON       :     setPathMapsAsJSON,
    _setPathMapsAsPathMap    :  setPathMapsAsPathMap,
    _setPathMapsAsJSONG      :    setPathMapsAsJSONG,
    
    _setJSONGsAsValues       :     setJSONGsAsValues,
    _setJSONGsAsJSON         :       setJSONGsAsJSON,
    _setJSONGsAsPathMap      :    setJSONGsAsPathMap,
    _setJSONGsAsJSONG        :      setJSONGsAsJSONG,
    
    _invPathsAsValues        :       invalidatePaths,
    _invPathsAsJSON          :       invalidatePaths,
    _invPathsAsPathMap       :       invalidatePaths,
    _invPathsAsJSONG         :       invalidatePaths,
    
    _invPathMapsAsValues     :    invalidatePathMaps,
    _invPathMapsAsJSON       :    invalidatePathMaps,
    _invPathMapsAsPathMap    :    invalidatePathMaps,
    _invPathMapsAsJSONG      :    invalidatePathMaps
};

function modelOperation(name) {
    return function() {
        
        var model = this, root = model._root,
            args = Array.prototype.slice.call(arguments),
            selector = args[args.length - 1];

        selector = typeof selector === "function" ? args.pop() : undefined;
        
        return ModelResponse.create(function(options) {
            
            var onNext = options.onNext.bind(options),
                onError = options.onError.bind(options),
                onCompleted = options.onCompleted.bind(options),
                isProgressive = options.isProgressive,
                valuesCount = selector && selector.length || 0;
            var operationalName = name;
            var disposed = false;
            var hasSelector = !!selector;
            var format = hasSelector && 'AsJSON' || options.format || 'AsPathMap';
            var isJSONG = format === 'AsJSONG';
            var seedRequired = isSeedRequired(format);
            var isValues = format === 'AsValues';
            var pathSetValues = [];
            var errors = [];
            var indices = [];
            var undefineds = [];
            var jsongPaths = [];
            var errorSelector = options.errorSelector || model._errorSelector;
            var atLeastOneValue = false;
            var shouldRequest = true;

            // TODO: Should be defined on the model.
            var retryMax = model._retryCount;

            if (hasSelector) {
                for (var i = 0; i < args.length; i++) {
                    if (i < valuesCount) {
                        pathSetValues[pathSetValues.length] = Object.create(null);
                    }
                    undefineds[undefineds.length] = false;
                    indices[indices.length] = i;
                }
            } else if (seedRequired) {
                pathSetValues[0] = Object.create(null);
                undefineds[0] = true;
            }

            function recurse(requested, relativePathSetValues) {
                var operations = getOperationArgGroups(requested, operationalName, format, relativePathSetValues, hasSelector, isValues && onNext, errorSelector);
                var results = processOperations(model, operations);
                
                errors = errors.concat(results.errors);
                atLeastOneValue = atLeastOneValue || results.valuesReceived;

                // from each of the operations, the results must be remerged back into the values array
                operations.forEach(function(op) {
                    if (hasSelector) {
                        var absoluteIndex;
                        var hasIndex;
                        op.values.forEach(function(valueObject, i) {
                            absoluteIndex = indices[i + op.valuesOffset];
                            hasIndex = typeof absoluteIndex === 'number';
                            if (hasIndex) {
                                if (valueObject) {
                                    if (valueObject.json !== undefined) {
                                        pathSetValues[absoluteIndex] = valueObject;
                                    } else {
                                        pathSetValues[absoluteIndex] = {json: valueObject};
                                    }
                                    undefineds[absoluteIndex] = false;
                                } else {
                                    undefineds[absoluteIndex] = undefineds[absoluteIndex] && true;
                                }
                            }
                        });
                    } else if (seedRequired) {
                        if (op.values[0]) {
                            pathSetValues = op.values;
                            undefineds[0] = false;
                            if (isJSONG) {
                                jsongPaths = jsongPaths.concat(op.values[0].paths);
                            }
                        } else {
                            undefineds[0] = true;
                        }
                    }
                });
                var nextRequest = results.requestedMissingPaths;
                var missingLength = nextRequest.length;
                var incomingValues;

                // no need to inform the user of the current state if in value mode
                if (isProgressive && missingLength && !isValues) {
                    emitValues();
                }

                if (missingLength &&
                    operationalName !== 'set' && // TODO: When we set externally
                    shouldRequest && model._dataSource) {
                    model._request.request(nextRequest, results.optimizedMissingPaths, {
                        onNext: function(jsongEnvelop) {
                            incomingValues = jsongEnvelop;
                        },
                        onError: function(err) {
                            // When an error is thrown, all currently requested paths are
                            // inserted as errors and the output format is not needed.
                            // TODO: There must be a way to make this more efficient.
                            var out = model._setPathsAsValues.apply(null, [model].concat(
                                nextRequest.
                                    reduce(function(acc, r) {
                                        acc[0].push({
                                            path: r,
                                            value: err
                                        });
                                        return acc;
                                    }, [[]]),
                                undefined,
                                model._errorSelector
                            ));
                            errors = errors.concat(out.errors);

                            // there could still be values within the cache
                            emitValues();
                            executeOnErrorOrCompleted();
                        },
                        onCompleted: function() {
                            // Note: processing the requested missing paths
                            var newOperations = [];
                            var previousIndices = indices;
                            var newSelectorIndex = 0;
                            indices = [];

                            nextRequest.forEach(function (r) {
                                var op = newOperations[newOperations.length - 1];
                                var boundPath = r.boundPath;
                                if (!op) {
                                    op = newOperations[newOperations.length] = {jsong: incomingValues.jsong, paths: []};
                                }
                                if (hasSelector) {
                                    if (typeof r.pathSetIndex !== 'undefined') {
                                        var pathSetIndex = r.pathSetIndex;
                                        var absoluteIndex = previousIndices[pathSetIndex];
                                        var hasIndex = typeof absoluteIndex === 'number' && absoluteIndex < valuesCount;
                                        if (op && op.pathSetIndex !== pathSetIndex && typeof op.pathSetIndex !== 'undefined') {
                                            if (op && op.paths.length > 1) {
                                                op.paths = fastCollapse(op.paths);
                                            }
                                            op = newOperations[newOperations.length] = {jsong: incomingValues.jsong, paths: []};
                                            op.pathSetIndex = pathSetIndex;
                                            hasIndex && (indices[indices.length] = absoluteIndex);
                                        } else if (typeof op.pathSetIndex === 'undefined') {
                                            hasIndex && (op.pathSetIndex = pathSetIndex);
                                            hasIndex && (indices[indices.length] = absoluteIndex);
                                        }
                                    }
                                } else if (seedRequired) {
                                    // single seed white board
                                } else {
                                    // isValues
                                }
                                op.paths[op.paths.length] = r;
                                op.boundPath = op.boundPath || boundPath.length && boundPath || undefined;
                            });

                            // Note: We fast collapse all hasSelector ops.
                            if (hasSelector) {
                                var op = newOperations[newOperations.length - 1];
                                if (op && op.paths.length > 1) {
                                    op.paths = fastCollapse(op.paths);
                                }
                            }
                            operationalName = 'set';

                            // Note: We do not request missing paths again.
                            shouldRequest = false;
                            if (hasSelector) {
                                var arr = [];
                                for (var i = 0; i < indices.length; i++) {
                                    arr[arr.length] = relativePathSetValues[indices[i]];
                                }
                                recurse(newOperations, arr);
                            } else if (seedRequired) {
                                recurse(newOperations, pathSetValues);
                            } else {
                                recurse(newOperations, []);
                            }
                        }
                    });
                } else {
                    emitValues();
                    executeOnErrorOrCompleted();
                }
            }

            try {
                recurse(args, pathSetValues);
            } catch(e) {
                errors = [e];
                executeOnErrorOrCompleted();
            }

            function emitValues() {
                if (disposed) {
                    return;
                }

                root.allowSync = true;
                if (atLeastOneValue) {
                    if (hasSelector) {
                        if (valuesCount > 0) {
                            // they should be wrapped in json items
                            onNext(selector.apply(model, pathSetValues.map(function(x, i) {
                                if (undefineds[i]) {
                                    return undefined;
                                }

                                return x && x.json;
                            })));
                        } else {
                            onNext(selector.call(model));
                        }
                    } else if (!isValues && !model._progressive) {
                        // this means there is an onNext function that is not AsValues or progressive,
                        // therefore there must only be one onNext call, which should only be the 0
                        // index of the values of the array
                        if (isJSONG) {
                            pathSetValues[0].paths = jsongPaths;
                        }
                        onNext(pathSetValues[0]);
                    }
                    root.allowSync = false;
                }
            }

            function executeOnErrorOrCompleted() {
                if (disposed) {
                    return;
                }

                root.allowSync = true;
                if (errors.length) {
                    onError(errors);
                } else {
                    onCompleted();
                }
                root.allowSync = false;
            }

            return {
                dispose: function() {
                    disposed = true;
                }
            };
        });
    }
}

function fastCollapse(paths) {
    return paths.reduce(function(acc, p) {
        var curr = acc[0];
        if (!curr) {
            acc[0] = p;
        } else {
            p.forEach(function(v, i) {
                // i think
                if (typeof v === 'object') {
                    curr[curr[i].length] = v[0];
                }
            });
        }
        return acc;
    }, []);
}

function getOperationArgGroups(ops, name, format, values, hasSelector, onNext, errorSelector) {
    var seedRequired = isSeedRequired(format);
    var isValues = !seedRequired;
    var valuesIndex = 0, valueEnvelope;
    return ops.
        map(cloneIfPathOrPathValue).
        reduce(function(groups, argument, index) {
            var group = groups[groups.length - 1],
                type  = isPathOrPathValue(argument) ? "Paths" :
                        isJSONG(argument) ? "JSONGs" : "PathMaps",
                groupType = group && group.type,
                op = Model.prototype['_' + name + type + format];

            if (type !== groupType) {
                group = groups[groups.length] = [];
            }

            group.boundPath = type === "JSONGs" && argument.boundPath || undefined;

            if (groupType === null || type !== groupType) {
                group.methodName = name + type + format;
                group.format = format;
                group.type = type;
                group.op = op;
                group.isSeedRequired = seedRequired;
                group.isValues = isValues;
                group.values = [];
                group.onNext = onNext;
                group.valuesOffset = valuesIndex;
                group.errorSelector = errorSelector;
            }
            group[group.length] = argument;
            valueEnvelope = values[valuesIndex];
            if (seedRequired && hasSelector && valuesIndex < values.length && valueEnvelope) {
                // This is the relative offset into the values array
                group.values[group.values.length] = valueEnvelope.json || valueEnvelope.jsong || valueEnvelope;
                valuesIndex++;
            } else if (!hasSelector && seedRequired && valueEnvelope) {
                // no need to know the value index
                group.values[group.values.length] = valueEnvelope.json || valueEnvelope.jsong || valueEnvelope;
            }

            return groups;
        }, []);
}

function processOperations(model, operations) {
    // no value has to be kept track of since its all in the 'values' array that is attached
    // to each operation
    return operations.reduce(function(memo, operation) {
        
        var boundPath = model._path;
        
        if(boundPath.length > 0 && operation.format === "AsJSONG") {
            throw new Error("It is not legal to use the JSON Graph format from a bound Model. JSON Graph format can only be used from a root model.");
        }

        var results = operation.isValues ?
            operation.op(model, operation, operation.onNext, operation.errorSelector, operation.boundPath) :
            operation.op(model, operation, operation.values, operation.errorSelector, operation.boundPath);
        var missing = results.requestedMissingPaths;
        var offset = operation.valuesOffset;

        for (var i = 0, len = missing.length; i < len; i++) {
            missing[i].boundPath = boundPath;
            missing[i].pathSetIndex += offset;
        }

        memo.requestedMissingPaths = memo.requestedMissingPaths.concat(missing);
        memo.optimizedMissingPaths = memo.optimizedMissingPaths.concat(results.optimizedMissingPaths);
        memo.errors = memo.errors.concat(results.errors);
        memo.valuesReceived = memo.valuesReceived || results.requestedPaths.length > 0;

        return memo;
    }, {
        errors: [],
        requestedMissingPaths: [],
        optimizedMissingPaths: [],
        valuesReceived: false
    });
}

function not() {
    var fns = Array.prototype.slice.call(arguments);
    return function() {
        var args = arguments;
        return !fns.every(function(fn) {
            return fn.apply(null, args);
        });
    }
}

function isPathOrPathValue(x) {
    return !!(Array.isArray(x)) || (
        x.hasOwnProperty("path") && x.hasOwnProperty("value"));
}

function isJSONG(x) {
    return x.hasOwnProperty("jsong");
}

function isSeedRequired(format) {
    return format === 'AsJSON' || format === 'AsJSONG' || format === 'AsPathMap';
}

function cloneIfPathOrPathValue(x) {
    return (Array.isArray(x) && x.concat()) || (
        x.hasOwnProperty("path") && x.hasOwnProperty("value") && (
        x.path = x.path.concat()) && x || x) || x;
}
