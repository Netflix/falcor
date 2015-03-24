var Observable = Rx.Observable,
    Disposable = Rx.Disposable,
    SENTINEL_SIZE = 50,
    isArray = Array.isArray,
// heh
    GENERATION_GENERATION = 0,
    OBSERVER_GENERATION = 0,
    µTime = 1,
    µRate = 0.25,
    µSize = 0.25,
    MIN_SAFE_INTEGER = -Math.pow(2, 53) - 1;

function PathEvaluator(maxSize, collectRatio, loader, cache, path, now, errorSelector) {
    if (loader != null && typeof loader === 'object') {
        this.loader = loader;
    }
    if (typeof maxSize !== 'number') {
        throw new Error('PathEvaluator: maxSize must be a number.');
    }
    if (typeof collectRatio === 'number') {
        collectRatio = parseFloat(collectRatio);
        if (collectRatio > 1) {
            collectRatio = collectRatio / maxSize;
        }
    } else {
        collectRatio = 0.75;
    }
    this._root = this;
    this._batches = new BatchRequestQueue(this);
    this._maxSize = maxSize;
    this._collectRatio = collectRatio;
    this._cache = cache || {};
    this._path = Array.isArray(path) ? path : [];
    this._now = typeof now === 'function' ? now : defaultNow;
    this._expired = [];
    this._errorSelector = typeof errorSelector === 'function' ? errorSelector : identity;
}
/** @lends PathEvaluator.prototype */
PathEvaluator.prototype = {
    _batched: false,
    _lazy: true,
    _connected: true,
    _streaming: true,
    _refreshing: false,
    _materialized: false,
    loader: {
        get: function () {
            return Observable.create(function (o) {
                o.onCompleted();
                return function () {
                };
            });
        },
        call: function () {
            return Observable.create(function (o) {
                o.onCompleted();
                return function () {
                };
            });
        }
    },
    get: get,
    set: set,
    invalidate: invalidate,
    call: call,
    bind: bind,
    hardBind: hardBind,
    deferBind: deferBind,
    serialize: serialize,
    deserialize: deserialize,
    getValueSync: function () {
        return getPath.apply(this, arguments).value;
    },
    getBoundValue: function () {
        return this._getContext().value;
    },
    setValueSync: function () {
        return setPath.apply(this, arguments).value;
    },
    toBatched: toBatched,
    toIndependent: toIndependent,
    toLazy: toLazy,
    toEager: toEager,
    toRemote: toRemote,
    toLocal: toLocal,
    toProgressive: toProgressive,
    toAggregate: toAggregate,
    toCached: toCached,
    toRefreshed: toRefreshed,
    toMaterialized: toMaterialized,
    toDematerialized: toDematerialized,
    toRoot: toRoot,
    _collapse: collapse,
    _getPaths: getPaths,
    _setPaths: setPaths,
    _setPBF: setPBF,
    _getPathsAsObservable: getPathsAsObservable,
    _setPathsAsObservable: setPathsAsObservable,
    _setPBFAsObservable: setPBFAsObservable,
    _stringify: stringify,
    _pathMapWithObserver: pathMapWithObserver,
    _pathMapWithoutObserver: pathMapWithoutObserver,
    _getContext: getContext,
    _getPath: getPath,
    _setPath: setPath,
    _invalidatePath: invalidatePath
};

function noop() {
}

function defaultNow() {
    return Date.now();
}

function identity(x) {
    return x;
}

function get() {
    var a;
    var i = -1,
        n = arguments.length;
    a = new Array(n);
    while (++i < n) {
        a[i] = arguments[i];
    }
    if (this._lazy) {
        return getPathsAsObservable.call(this, a);
    }
    var onNext = a[a.length - 3],
        onError = a[a.length - 2],
        onCompleted = a[a.length - 1];
    if (onNext !== void 0) {
        a = a.slice(0, -3);
        return getPaths.call(this, a, onNext, onError, onCompleted);
    }
    return getPathsAsPromises.call(this, a);
}

function set() {
    var a;
    var i = -1,
        n = arguments.length;
    a = new Array(n);
    while (++i < n) {
        a[i] = arguments[i];
    }
    if (this._lazy) {
        if (this._streaming) {
            return setPathsAsObservable.call(this, a);
        }
        return setPBFAsObservable.call(this, a[0]);
    }
    var onNext = a[a.length - 3],
        onError = a[a.length - 2],
        onCompleted = a[a.length - 1];
    if (onNext !== void 0) {
        a = a.slice(0, -3);
        if (this._streaming) {
            return setPaths.call(this, a, onNext, onError, onCompleted);
        }
        return setPBF.call(this, a[0], onNext, onError, onCompleted);
    }
    if (this._streaming) {
        return setPathsAsPromises.call(this, a);
    }
    return setPBFAsPromises.call(this, a[0]);
}

function invalidate() {
    var a;
    var i = -1,
        n = arguments.length;
    a = new Array(n);
    while (++i < n) {
        a[i] = arguments[i];
    }
    if (this._lazy) {
        return invalidatePathsAsObservable.call(this, a);
    }
    var onNext = a[a.length - 3],
        onError = a[a.length - 2],
        onCompleted = a[a.length - 1];
    if (onNext !== void 0) {
        a = a.slice(0, -3);
        return invalidatePaths.call(this, a, onNext, onError, onCompleted);
    }
    return invalidatePathsAsPromise.call(this, a);
}

function call() {
    var a;
    var i = -1,
        n = arguments.length;
    a = new Array(n);
    while (++i < n) {
        a[i] = arguments[i];
    }
    if (this._lazy) {
        return callPathAsObservable.apply(this, a);
    }
    var onNext = a[a.length - 3],
        onError = a[a.length - 2],
        onCompleted = a[a.length - 1];
    if (onNext !== void 0) {
        a = a.slice(0, -3);
        return callPath.call(this, a, onNext, onError, onCompleted);
    }
    return callPathAsPromise.call(this, a);
}

function bind(path) {
    if (!Array.isArray(path)) {
        throw new Error('PathEvaluator.bind must be called with an Array path.');
    }
    var pe = Object.create(this);
    pe._path = (this._path || (this._path = [])).concat(path);
    pe.__context = void 0;
    return pe;
}

function hardBind(path) {
    if (!Array.isArray(path)) {
        throw new Error('PathEvaluator.hardBind must be called with an Array path.');
    }
    var branch = this._getPath(path.concat(null)),
        context = branch.value,
        pe = Object.create(this);
    if (context) {
        pe._path = branch.optimized;
        var // create a back reference
            backRefs = context.__refsLength || 0;
        context['__ref' + backRefs] = pe;
        context.__refsLength = backRefs + 1;
        pe.__refIndex = backRefs;
        pe.__context = context;
    } else {
        pe._path = (this._path || (this._path = [])).concat(path);
        pe.__context = null;
    }
    return pe;
}

function deferBind(path) {
    if (!Array.isArray(path)) {
        throw new Error('PathEvaluator.deferBind must be called with an Array path.');
    }
    var self = this;
    return Observable.create(function (observer) {
        observer.onNext(self.hardBind(path));
        observer.onCompleted();
        return noop;
    });
}

function getContext() {
    var self = this,
        context = this.__context,
        pbv;
    if (context == null || context.__parent == null) {
        pbv = this._getPath([null]);
        pbv.path = pbv.optimized;
        pbv.optimized = void 0;
        if (context !== void 0 && (context === null || context.__parent == null) && (context = pbv.context) !== void 0) {
            this._path = pbv.path || [];
            var // create a back reference
                backRefs = context.__refsLength || 0;
            context['__ref' + backRefs] = self;
            context.__refsLength = backRefs + 1;
            self.__refIndex = backRefs;
            self.__context = context;
        }
    } else {
        pbv = {
            path: this._path || (this._path = []),
            value: context
        };
    }
    return pbv;
}

function getPath(path_, cache, parent, bound) {
    var self = this,
        root = self._root,
        connected, materialized, streaming, refreshing, contexts, messages, error, errors, observer, observers, expired, path, key, column, offset, last, index, length, sizeOffset, boundOptimized, original, optimized, pbv, originalMiss, originalMisses, optimizedMiss, optimizedMisses, refs, cols, crossed, depth, batchedOptimizedPathMap, batchedPathMap, batchedPathMaps, contextCache, contextParent, context, contextValue, contextType, contextSize, contextExpires, contextTimestamp, boundContext, messageCache, messageParent, message, messageValue, messageType, messageSize, messageExpires, messageTimestamp;
    bound = bound || self._path;
    path_ = path_ || [];
    cache = cache || self._cache;
    parent = parent || self.__context || (path_ = bound.concat(path_)) && cache;
    path = path_;
    pbv = {
        path: [],
        optimized: []
    };
    refs = [];
    cols = [];
    crossed = [];
    column = 0;
    offset = 0;
    last = path.length - 1;
    contextCache = cache;
    contextParent = parent;
    context = contextParent;
    contextValue = context;
    original = pbv.path;
    optimized = pbv.optimized;
    depth = -1;
    sizeOffset = 0;
    expired = self._expired || (self._expired = []);
    refs[-1] = path;
    cols[-1] = 0;
    getting_path:
        while (true) {
            for (; column < last; ++column) {
                key = path[column];
                if (key != null && typeof key === 'object') {
                    if (Array.isArray(key)) {
                        key = key[key.index || (key.index = 0)];
                        if (key != null && typeof key === 'object') {
                            key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                        }
                    } else {
                        key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                    }
                }
                if (key == null) {
                    continue;
                }
                original[original.length = column] = key;
                optimized[optimized.length = column + offset] = key;
                context = (context = contextParent[key]) && (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now()) ? void 0 : context);
                while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                    // Otherwise, set contextValue to the context.
                    = context && context[ // If the context is a sentinel, get its value.
                    // Otherwise, set contextValue to the context.
                    '$type']) === 'sentinel' ? context.value : context)) {
                    var head = root.__head,
                        tail = root.__tail;
                    if (context && context['$expires'] !== 1) {
                        var next = context.__next,
                            prev = context.__prev;
                        if (context !== head) {
                            next && (next != null && typeof next === 'object') && (next.__prev = prev);
                            prev && (prev != null && typeof prev === 'object') && (prev.__next = next);
                            (next = head) && (next != null && typeof next === 'object') && (head.__prev = context);
                            root.__head = root.__next = head = context;
                            if (head != null && typeof head === 'object') {
                                head.__next = next;
                                head.__prev = void 0;
                            }
                        }
                        if (tail == null || context === tail) {
                            root.__tail = root.__prev = tail = prev || context;
                        }
                    }
                    if ((context = context.__context) !== void 0) {
                        var i = -1,
                            n = optimized.length = contextValue.length || 0;
                        while (++i < n) {
                            optimized[i] = contextValue[i];
                        }
                        offset = n - column - 1;
                    } else {
                        contextParent = contextCache;
                        refs[depth] = path;
                        cols[depth++] = column;
                        path = contextValue;
                        last = path.length - 1;
                        offset = 0;
                        column = 0;
                        expanding:
                            while (true) {
                                for (; column < last; ++column) {
                                    key = path[column];
                                    if (key == null) {
                                        continue;
                                    }
                                    optimized[optimized.length = column + offset] = key;
                                    context = (context = contextParent[key]) && (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now()) ? void 0 : context);
                                    while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                                        // Otherwise, set contextValue to the context.
                                        = context && context[ // If the context is a sentinel, get its value.
                                        // Otherwise, set contextValue to the context.
                                        '$type']) === 'sentinel' ? context.value : context)) {
                                        var head$2 = root.__head,
                                            tail$2 = root.__tail;
                                        if (context && context['$expires'] !== 1) {
                                            var next$2 = context.__next,
                                                prev$2 = context.__prev;
                                            if (context !== head$2) {
                                                next$2 && (next$2 != null && typeof next$2 === 'object') && (next$2.__prev = prev$2);
                                                prev$2 && (prev$2 != null && typeof prev$2 === 'object') && (prev$2.__next = next$2);
                                                (next$2 = head$2) && (next$2 != null && typeof next$2 === 'object') && (head$2.__prev = context);
                                                root.__head = root.__next = head$2 = context;
                                                if (head$2 != null && typeof head$2 === 'object') {
                                                    head$2.__next = next$2;
                                                    head$2.__prev = void 0;
                                                }
                                            }
                                            if (tail$2 == null || context === tail$2) {
                                                root.__tail = root.__prev = tail$2 = prev$2 || context;
                                            }
                                        }
                                        if ((context = context.__context) !== void 0) {
                                            var i$2 = -1,
                                                n$2 = optimized.length = contextValue.length || 0;
                                            while (++i$2 < n$2) {
                                                optimized[i$2] = contextValue[i$2];
                                            }
                                            offset = n$2 - column - 1;
                                        } else {
                                            contextParent = contextCache;
                                            refs[depth] = path;
                                            cols[depth++] = column;
                                            path = contextValue;
                                            last = path.length - 1;
                                            offset = 0;
                                            column = 0;
                                            continue expanding;
                                        }
                                    }
                                    if (context == null || contextType !== void 0) {
                                        optimized.length = column + offset + 1;
                                        // If we short-circuited while following a reference, set
                                        // the column, path, and last variables to the path we were
                                        // following before we started following the broken reference.
                                        // Use this path to build the missing path from the optimized
                                        // path.
                                        column = cols[--depth];
                                        offset = last - column - 1;
                                        path = refs[depth];
                                        last = path.length - 1;
                                        // Append null to the original path so someone can
                                        // call `get` with the path and request beyond the
                                        // reference.
                                        original[original.length] = null;
                                        break getting_path;
                                    }
                                    contextParent = context;
                                }
                                if (column === last) {
                                    key = path[column];
                                    if (key != null) {
                                        optimized[optimized.length = column + offset] = key;
                                        context = (context = contextParent[key]) && (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now()) ? void 0 : context);
                                    }
                                    if (context == null || contextType === 'error') {
                                        optimized.length = column + offset + 1;
                                        // If we short-circuited while following a reference, set
                                        // the column, path, and last variables to the path we were
                                        // following before we started following the broken reference.
                                        // Use this path to build the missing path from the optimized
                                        // path.
                                        column = cols[--depth];
                                        offset = last - column - 1;
                                        path = refs[depth];
                                        last = path.length - 1;
                                        // Append null to the original path so someone can
                                        // call `get` with the path and request beyond the
                                        // reference.
                                        original[original.length] = null;
                                        break getting_path;
                                    }
                                    var refContainer;
                                    if (( // Set up the hard-link so we don't have to do all
                                        // this work the next time we follow this reference.
                                        refContainer = path.__container || path).__context === void 0) {
                                        var backRefs = context.__refsLength || 0;
                                        context['__ref' + backRefs] = refContainer;
                                        context.__refsLength = backRefs + 1;
                                        refContainer.__refIndex = backRefs;
                                        refContainer.__context = context;
                                    }
                                    do {
                                        // Roll back to the path that was interrupted.
                                        // We might have to roll back multiple times,
                                        // as in the case where a reference references
                                        // a reference.
                                        path = refs[--depth];
                                        column = cols[depth];
                                        offset = last - column;
                                        last = path.length - 1;
                                    } while (depth > -1 && column === last);
                                    if ( // If the reference we followed landed on another reference ~and~
                                    // the recursed path has more keys to process, Kanye the path we
                                    // rolled back to -- we're gonna let it finish, but first we gotta
                                    // say that this reference had the best album of ALL. TIME.
                                        column < last) {
                                        while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                                            // Otherwise, set contextValue to the context.
                                            = context && context[ // If the context is a sentinel, get its value.
                                            // Otherwise, set contextValue to the context.
                                            '$type']) === 'sentinel' ? context.value : context)) {
                                            var head$3 = root.__head,
                                                tail$3 = root.__tail;
                                            if (context && context['$expires'] !== 1) {
                                                var next$3 = context.__next,
                                                    prev$3 = context.__prev;
                                                if (context !== head$3) {
                                                    next$3 && (next$3 != null && typeof next$3 === 'object') && (next$3.__prev = prev$3);
                                                    prev$3 && (prev$3 != null && typeof prev$3 === 'object') && (prev$3.__next = next$3);
                                                    (next$3 = head$3) && (next$3 != null && typeof next$3 === 'object') && (head$3.__prev = context);
                                                    root.__head = root.__next = head$3 = context;
                                                    if (head$3 != null && typeof head$3 === 'object') {
                                                        head$3.__next = next$3;
                                                        head$3.__prev = void 0;
                                                    }
                                                }
                                                if (tail$3 == null || context === tail$3) {
                                                    root.__tail = root.__prev = tail$3 = prev$3 || context;
                                                }
                                            }
                                            if ((context = context.__context) !== void 0) {
                                                var i$3 = -1,
                                                    n$3 = optimized.length = contextValue.length || 0;
                                                while (++i$3 < n$3) {
                                                    optimized[i$3] = contextValue[i$3];
                                                }
                                                offset = n$3 - column - 1;
                                            } else {
                                                contextParent = contextCache;
                                                refs[depth] = path;
                                                cols[depth++] = column;
                                                path = contextValue;
                                                last = path.length - 1;
                                                offset = 0;
                                                column = 0;
                                                continue expanding;
                                            }
                                        }
                                    }
                                    if (depth > -1) {
                                        column += 1;
                                        contextParent = context;
                                        continue expanding;
                                    }
                                }
                                break expanding;
                            }
                    }
                }
                if (context == null || contextType !== void 0) {
                    optimized.length = column + offset + 1;
                    break getting_path;
                }
                contextParent = context;
            }
            if (column === last) {
                key = path[column];
                if (key != null && typeof key === 'object') {
                    if (Array.isArray(key)) {
                        key = key[key.index || (key.index = 0)];
                        if (key != null && typeof key === 'object') {
                            key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                        }
                    } else {
                        key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                    }
                }
                original[original.length = column] = key;
                if (key != null) {
                    optimized[optimized.length = column + offset] = key;
                    context = contextParent[key];
                }
                if (context != null) {
                    if (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now())) {
                        if (context.__invalidated === void 0) {
                            context.__invalidated = true;
                            context['$expires'] = 0;
                            expired[expired.length] = context;
                            var head$4 = root.__head,
                                tail$4 = root.__tail;
                            if (context != null && typeof context === 'object') {
                                var next$4 = context.__next,
                                    prev$4 = context.__prev;
                                next$4 && (next$4.__prev = prev$4);
                                prev$4 && (prev$4.__next = next$4);
                                context === head$4 && (root.__head = root.__next = head$4 = next$4);
                                context === tail$4 && (root.__tail = root.__prev = tail$4 = prev$4);
                                context.__next = context.__prev = void 0;
                            }
                        }
                        context = null;
                    }
                }
                // If the context is a sentinel, get its value.
                // Otherwise, set contextValue to the context.
                contextValue = (contextType = context && context['$type']) === 'sentinel' ? context.value : context;
            }
            break getting_path;
        }
    if ( // If the context is null or undefined, the cache
    // doesn't have a value for this path. Append the
    // remaining path keys to the end of the optimized
    // path and signal that the value is missing.
        context == null) {
        var i$4 = -1,
            j = -1,
            n$4 = optimized.length,
            nulls = 0,
            dest = new Array(n$4 + last - column),
            key$2;
        while (++i$4 < n$4) {
            key$2 = optimized[i$4];
            if (key$2 != null) {
                dest[++j] = key$2;
            } else {
                --nulls;
            }
        }
        i$4 = column;
        while (++i$4 <= last) {
            key$2 = path[i$4];
            if (key$2 != null) {
                dest[++j] = key$2;
            } else {
                --nulls;
            }
        }
        dest.length += nulls;
        pbv.optimized = dest;
        pbv.value = void 0;
    } else {
        pbv.value = contextValue;
    }
    return pbv;
}

function getPaths(model, paths_, onNext, onError, onCompleted, cache, parent, bound) {
    var self = this,
        root = self._root,
        connected, materialized, streaming, refreshing, contexts, messages, error, errors, observer, observers, expired, paths, path, key, column, offset, last, index, length, sizeOffset, boundOptimized, original, optimized, pbv, originalMiss, originalMisses, optimizedMiss, optimizedMisses, refs, cols, crossed, depth, x, batchedOptimizedPathMap, batchedPathMap, batchedPathMaps, contextCache, contextParent, context, contextValue, contextType, contextSize, contextExpires, contextTimestamp, boundContext, messageCache, messageParent, message, messageValue, messageType, messageSize, messageExpires, messageTimestamp;
    paths = paths_;
    connected = self._connected;
    materialized = self._materialized;
    streaming = self._streaming;
    refreshing = self._refreshing;
    path = bound || self._path;
    contexts = paths.contexts || (paths.contexts = []);
    messages = paths.messages || (paths.messages = []);
    batchedPathMaps = paths.batchedPathMaps || (paths.batchedPathMaps = []);
    originalMisses = paths.originalMisses || (paths.originalMisses = []);
    optimizedMisses = paths.optimizedMisses || (paths.optimizedMisses = []);
    errors = paths.errors || (paths.errors = []);
    refs = paths.refs || (paths.refs = []);
    crossed = paths.crossed || (paths.crossed = []);
    cols = paths.cols || (paths.cols = []);
    pbv = paths.pbv || (paths.pbv = {
        path: [],
        optimized: []
    });
    index = paths.index || (paths.index = 0);
    length = paths.length;
    batchedPathMap = paths.batchedPathMap;
    messageCache = paths.value;
    messageParent = messageCache;
    cache = cache || self._cache;
    bound = path;
    if (parent == null && (parent = self.__context) == null) {
        if (path.length > 0) {
            pbv = self._getContext();
            path = pbv.path;
            pbv.path = [];
            pbv.optimized = [];
            parent = pbv.value || {};
        } else {
            parent = cache;
        }
    }
    contextCache = cache;
    contextParent = parent;
    context = contextParent;
    contextValue = context;
    original = pbv.path;
    optimized = pbv.optimized;
    depth = -1;
    sizeOffset = 0;
    expired = self._expired || (self._expired = []);
    refs[-1] = path;
    cols[-1] = 0;
    crossed[-1] = boundOptimized = path;
    contexts[-1] = contextParent;
    for (; index < length; paths.index = ++index) {
        path = paths[index];
        column = path.index || (path.index = 0);
        last = path.length - 1;
        refs[-1] = path;
        crossed = [];
        crossed[-1] = boundOptimized;
        while (column >= 0) {
            var ref, i, n;
            while (--column >= -1) {
                if ((ref = crossed[column]) != null) {
                    i = -1;
                    n = ref.length;
                    optimized.length = n;
                    offset = n - (column + 1);
                    while (++i < n) {
                        optimized[i] = ref[i];
                    }
                    break;
                }
            }
            ++column;
            cols[depth = -1] = column;
            contextParent = contexts[column - 1];
            getting_path:
                while (true) {
                    for (; column < last; ++column) {
                        key = path[column];
                        if (key != null && typeof key === 'object') {
                            if (Array.isArray(key)) {
                                key = key[key.index || (key.index = 0)];
                                if (key != null && typeof key === 'object') {
                                    key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                                }
                            } else {
                                key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                            }
                        }
                        if (key == null) {
                            continue;
                        }
                        original[original.length = column] = key;
                        optimized[optimized.length = column + offset] = key;
                        context = (context = contextParent[key]) && (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now()) ? void 0 : context);
                        while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                            // Otherwise, set contextValue to the context.
                            = context && context[ // If the context is a sentinel, get its value.
                            // Otherwise, set contextValue to the context.
                            '$type']) === 'sentinel' ? context.value : context)) {
                            var head = root.__head,
                                tail = root.__tail;
                            if (context && context['$expires'] !== 1) {
                                var next = context.__next,
                                    prev = context.__prev;
                                if (context !== head) {
                                    next && (next != null && typeof next === 'object') && (next.__prev = prev);
                                    prev && (prev != null && typeof prev === 'object') && (prev.__next = next);
                                    (next = head) && (next != null && typeof next === 'object') && (head.__prev = context);
                                    root.__head = root.__next = head = context;
                                    if (head != null && typeof head === 'object') {
                                        head.__next = next;
                                        head.__prev = void 0;
                                    }
                                }
                                if (tail == null || context === tail) {
                                    root.__tail = root.__prev = tail = prev || context;
                                }
                            }
                            crossed[column] = contextValue;
                            if ((context = context.__context) !== void 0) {
                                var i$2 = -1,
                                    n$2 = optimized.length = contextValue.length || 0;
                                while (++i$2 < n$2) {
                                    optimized[i$2] = contextValue[i$2];
                                }
                                offset = n$2 - column - 1;
                            } else {
                                contextParent = contextCache;
                                refs[depth] = path;
                                cols[depth++] = column;
                                path = contextValue;
                                last = path.length - 1;
                                offset = 0;
                                column = 0;
                                expanding:
                                    while (true) {
                                        for (; column < last; ++column) {
                                            key = path[column];
                                            if (key == null) {
                                                continue;
                                            }
                                            optimized[optimized.length = column + offset] = key;
                                            context = (context = contextParent[key]) && (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now()) ? void 0 : context);
                                            while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                                                // Otherwise, set contextValue to the context.
                                                = context && context[ // If the context is a sentinel, get its value.
                                                // Otherwise, set contextValue to the context.
                                                '$type']) === 'sentinel' ? context.value : context)) {
                                                var head$2 = root.__head,
                                                    tail$2 = root.__tail;
                                                if (context && context['$expires'] !== 1) {
                                                    var next$2 = context.__next,
                                                        prev$2 = context.__prev;
                                                    if (context !== head$2) {
                                                        next$2 && (next$2 != null && typeof next$2 === 'object') && (next$2.__prev = prev$2);
                                                        prev$2 && (prev$2 != null && typeof prev$2 === 'object') && (prev$2.__next = next$2);
                                                        (next$2 = head$2) && (next$2 != null && typeof next$2 === 'object') && (head$2.__prev = context);
                                                        root.__head = root.__next = head$2 = context;
                                                        if (head$2 != null && typeof head$2 === 'object') {
                                                            head$2.__next = next$2;
                                                            head$2.__prev = void 0;
                                                        }
                                                    }
                                                    if (tail$2 == null || context === tail$2) {
                                                        root.__tail = root.__prev = tail$2 = prev$2 || context;
                                                    }
                                                }
                                                if ((context = context.__context) !== void 0) {
                                                    var i$3 = -1,
                                                        n$3 = optimized.length = contextValue.length || 0;
                                                    while (++i$3 < n$3) {
                                                        optimized[i$3] = contextValue[i$3];
                                                    }
                                                    offset = n$3 - column - 1;
                                                } else {
                                                    contextParent = contextCache;
                                                    refs[depth] = path;
                                                    cols[depth++] = column;
                                                    path = contextValue;
                                                    last = path.length - 1;
                                                    offset = 0;
                                                    column = 0;
                                                    continue expanding;
                                                }
                                            }
                                            if (context == null || contextType !== void 0) {
                                                optimized.length = column + offset + 1;
                                                // If we short-circuited while following a reference, set
                                                // the column, path, and last variables to the path we were
                                                // following before we started following the broken reference.
                                                // Use this path to build the missing path from the optimized
                                                // path.
                                                column = cols[--depth];
                                                offset = last - column - 1;
                                                path = refs[depth];
                                                last = path.length - 1;
                                                // Append null to the original path so someone can
                                                // call `get` with the path and request beyond the
                                                // reference.
                                                original[original.length] = null;
                                                break getting_path;
                                            }
                                            contextParent = context;
                                        }
                                        if (column === last) {
                                            key = path[column];
                                            if (key != null) {
                                                optimized[optimized.length = column + offset] = key;
                                                context = (context = contextParent[key]) && (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now()) ? void 0 : context);
                                            }
                                            if (context == null || contextType === 'error') {
                                                optimized.length = column + offset + 1;
                                                // If we short-circuited while following a reference, set
                                                // the column, path, and last variables to the path we were
                                                // following before we started following the broken reference.
                                                // Use this path to build the missing path from the optimized
                                                // path.
                                                column = cols[--depth];
                                                offset = last - column - 1;
                                                path = refs[depth];
                                                last = path.length - 1;
                                                // Append null to the original path so someone can
                                                // call `get` with the path and request beyond the
                                                // reference.
                                                original[original.length] = null;
                                                break getting_path;
                                            }
                                            var refContainer;
                                            if (( // Set up the hard-link so we don't have to do all
                                                // this work the next time we follow this reference.
                                                refContainer = path.__container || path).__context === void 0) {
                                                var backRefs = context.__refsLength || 0;
                                                context['__ref' + backRefs] = refContainer;
                                                context.__refsLength = backRefs + 1;
                                                refContainer.__refIndex = backRefs;
                                                refContainer.__context = context;
                                            }
                                            do {
                                                // Roll back to the path that was interrupted.
                                                // We might have to roll back multiple times,
                                                // as in the case where a reference references
                                                // a reference.
                                                path = refs[--depth];
                                                column = cols[depth];
                                                offset = last - column;
                                                last = path.length - 1;
                                            } while (depth > -1 && column === last);
                                            if ( // If the reference we followed landed on another reference ~and~
                                            // the recursed path has more keys to process, Kanye the path we
                                            // rolled back to -- we're gonna let it finish, but first we gotta
                                            // say that this reference had the best album of ALL. TIME.
                                                column < last) {
                                                while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                                                    // Otherwise, set contextValue to the context.
                                                    = context && context[ // If the context is a sentinel, get its value.
                                                    // Otherwise, set contextValue to the context.
                                                    '$type']) === 'sentinel' ? context.value : context)) {
                                                    var head$3 = root.__head,
                                                        tail$3 = root.__tail;
                                                    if (context && context['$expires'] !== 1) {
                                                        var next$3 = context.__next,
                                                            prev$3 = context.__prev;
                                                        if (context !== head$3) {
                                                            next$3 && (next$3 != null && typeof next$3 === 'object') && (next$3.__prev = prev$3);
                                                            prev$3 && (prev$3 != null && typeof prev$3 === 'object') && (prev$3.__next = next$3);
                                                            (next$3 = head$3) && (next$3 != null && typeof next$3 === 'object') && (head$3.__prev = context);
                                                            root.__head = root.__next = head$3 = context;
                                                            if (head$3 != null && typeof head$3 === 'object') {
                                                                head$3.__next = next$3;
                                                                head$3.__prev = void 0;
                                                            }
                                                        }
                                                        if (tail$3 == null || context === tail$3) {
                                                            root.__tail = root.__prev = tail$3 = prev$3 || context;
                                                        }
                                                    }
                                                    if ((context = context.__context) !== void 0) {
                                                        var i$4 = -1,
                                                            n$4 = optimized.length = contextValue.length || 0;
                                                        while (++i$4 < n$4) {
                                                            optimized[i$4] = contextValue[i$4];
                                                        }
                                                        offset = n$4 - column - 1;
                                                    } else {
                                                        contextParent = contextCache;
                                                        refs[depth] = path;
                                                        cols[depth++] = column;
                                                        path = contextValue;
                                                        last = path.length - 1;
                                                        offset = 0;
                                                        column = 0;
                                                        continue expanding;
                                                    }
                                                }
                                            }
                                            if (depth > -1) {
                                                column += 1;
                                                contextParent = context;
                                                continue expanding;
                                            }
                                        }
                                        break expanding;
                                    }
                            }
                        }
                        if (context == null || contextType !== void 0) {
                            optimized.length = column + offset + 1;
                            break getting_path;
                        }
                        contexts[column] = contextParent = context;
                    }
                    if (column === last) {
                        key = path[column];
                        if (key != null && typeof key === 'object') {
                            if (Array.isArray(key)) {
                                key = key[key.index || (key.index = 0)];
                                if (key != null && typeof key === 'object') {
                                    key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                                }
                            } else {
                                key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                            }
                        }
                        original[original.length = column] = key;
                        if (key != null) {
                            optimized[optimized.length = column + offset] = key;
                            context = contextParent[key];
                        }
                        if (context != null) {
                            if (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now())) {
                                if (context.__invalidated === void 0) {
                                    context.__invalidated = true;
                                    context['$expires'] = 0;
                                    expired[expired.length] = context;
                                    var head$4 = root.__head,
                                        tail$4 = root.__tail;
                                    if (context != null && typeof context === 'object') {
                                        var next$4 = context.__next,
                                            prev$4 = context.__prev;
                                        next$4 && (next$4.__prev = prev$4);
                                        prev$4 && (prev$4.__next = next$4);
                                        context === head$4 && (root.__head = root.__next = head$4 = next$4);
                                        context === tail$4 && (root.__tail = root.__prev = tail$4 = prev$4);
                                        context.__next = context.__prev = void 0;
                                    }
                                }
                                context = null;
                            }
                        }
                        // If the context is a sentinel, get its value.
                        // Otherwise, set contextValue to the context.
                        contextValue = (contextType = context && context['$type']) === 'sentinel' ? context.value : context;
                    }
                    break getting_path;
                }
            if (context != null) {
                var head$5 = root.__head,
                    tail$5 = root.__tail;
                if (context && context['$expires'] !== 1) {
                    var next$5 = context.__next,
                        prev$5 = context.__prev;
                    if (context !== head$5) {
                        next$5 && (next$5 != null && typeof next$5 === 'object') && (next$5.__prev = prev$5);
                        prev$5 && (prev$5 != null && typeof prev$5 === 'object') && (prev$5.__next = next$5);
                        (next$5 = head$5) && (next$5 != null && typeof next$5 === 'object') && (head$5.__prev = context);
                        root.__head = root.__next = head$5 = context;
                        if (head$5 != null && typeof head$5 === 'object') {
                            head$5.__next = next$5;
                            head$5.__prev = void 0;
                        }
                    }
                    if (tail$5 == null || context === tail$5) {
                        root.__tail = root.__prev = tail$5 = prev$5 || context;
                    }
                }
                pbv.value = contextValue;
                if ( // If the context is null or undefined, the cache
                // doesn't have a value for this path. Append the
                // remaining path keys to the end of the optimized
                // path and signal that the value is missing.
                    contextType === 'error') {
                    error = Array.isArray(pbv) ? [] : pbv != null && typeof pbv === 'object' ? {} : pbv;
                    var val, dst;
                    for (var key$2 in pbv) {
                        if (pbv.hasOwnProperty(key$2)) {
                            val = dst = pbv[key$2];
                            if (Array.isArray(val)) {
                                var i$5 = -1,
                                    n$5 = val.length;
                                dst = new Array(n$5);
                                while (++i$5 < n$5) {
                                    dst[i$5] = val[i$5];
                                }
                            } else if (val != null && typeof val === 'object') {
                                dst = Object.create(val);
                            }
                            error[key$2] = dst;
                        }
                    }
                    errors[errors.length] = error;
                } else if (streaming === true && contextValue !== void 0 || materialized === true) {
                    x = Array.isArray(pbv) ? [] : pbv != null && typeof pbv === 'object' ? {} : pbv;
                    var val$2, dst$2;
                    for (var key$3 in pbv) {
                        if (pbv.hasOwnProperty(key$3)) {
                            val$2 = dst$2 = pbv[key$3];
                            if (Array.isArray(val$2)) {
                                var i$6 = -1,
                                    n$6 = val$2.length;
                                dst$2 = new Array(n$6);
                                while (++i$6 < n$6) {
                                    dst$2[i$6] = val$2[i$6];
                                }
                            } else if (val$2 != null && typeof val$2 === 'object') {
                                dst$2 = Object.create(val$2);
                            }
                            x[key$3] = dst$2;
                        }
                    }
                    onNext(x);
                }
                if (refreshing === true) {
                    originalMisses[originalMisses.length] = bound.concat(original);
                    optimizedMisses[optimizedMisses.length] = optimized.concat();
                }
            } else if (connected === false && streaming === true && materialized === true) {
                var i$7 = -1,
                    j = -1,
                    n$7 = original.length,
                    nulls = 0,
                    dest = new Array(n$7 + last - column),
                    key$4;
                while (++i$7 < n$7) {
                    key$4 = original[i$7];
                    if (key$4 != null) {
                        dest[++j] = key$4;
                    } else {
                        --nulls;
                    }
                }
                i$7 = column;
                while (++i$7 <= last) {
                    key$4 = path[i$7];
                    if (key$4 != null) {
                        dest[++j] = key$4;
                    } else {
                        --nulls;
                    }
                }
                dest.length += nulls;
                originalMiss = dest;
                var i$8 = -1,
                    j$2 = -1,
                    n$8 = optimized.length,
                    nulls$2 = 0,
                    dest$2 = new Array(n$8 + last - column),
                    key$5;
                while (++i$8 < n$8) {
                    key$5 = optimized[i$8];
                    if (key$5 != null) {
                        dest$2[++j$2] = key$5;
                    } else {
                        --nulls$2;
                    }
                }
                i$8 = column;
                while (++i$8 <= last) {
                    key$5 = path[i$8];
                    if (key$5 != null) {
                        dest$2[++j$2] = key$5;
                    } else {
                        --nulls$2;
                    }
                }
                dest$2.length += nulls$2;
                optimizedMiss = dest$2;
                onNext({
                    path: originalMiss,
                    optimized: optimizedMiss,
                    value: void 0
                });
            } else {
                var i$9 = -1,
                    j$3 = -1,
                    n$9 = original.length,
                    nulls$3 = 0,
                    dest$3 = new Array(n$9 + last - column),
                    key$6;
                while (++i$9 < n$9) {
                    key$6 = original[i$9];
                    if (key$6 != null) {
                        dest$3[++j$3] = key$6;
                    } else {
                        --nulls$3;
                    }
                }
                i$9 = column;
                while (++i$9 <= last) {
                    key$6 = path[i$9];
                    if (key$6 != null) {
                        dest$3[++j$3] = key$6;
                    } else {
                        --nulls$3;
                    }
                }
                dest$3.length += nulls$3;
                originalMiss = dest$3;
                var i$10 = -1,
                    j$4 = -1,
                    n$10 = optimized.length,
                    nulls$4 = 0,
                    dest$4 = new Array(n$10 + last - column),
                    key$7;
                while (++i$10 < n$10) {
                    key$7 = optimized[i$10];
                    if (key$7 != null) {
                        dest$4[++j$4] = key$7;
                    } else {
                        --nulls$4;
                    }
                }
                i$10 = column;
                while (++i$10 <= last) {
                    key$7 = path[i$10];
                    if (key$7 != null) {
                        dest$4[++j$4] = key$7;
                    } else {
                        --nulls$4;
                    }
                }
                dest$4.length += nulls$4;
                optimizedMiss = dest$4;
                originalMisses[originalMisses.length] = bound.concat(originalMiss);
                optimizedMisses[optimizedMisses.length] = optimizedMiss.concat();
            }
            ascending:
                for (; column >= 0; --column) {
                    key = path[column];
                    if (key == null || typeof key !== 'object') {
                        continue ascending;
                    }
                    if ( // TODO: replace this with a faster Array check.
                        Array.isArray(key)) {
                        if (++key.index === key.length) {
                            key = key[key.index = 0];
                            if (key == null || typeof key !== 'object') {
                                continue ascending;
                            }
                        } else {
                            break ascending;
                        }
                    }
                    if (++key.offset > (key.to || (key.to = key.from + (key.length || 1) - 1))) {
                        key.offset = key.from;
                        continue ascending;
                    }
                    break ascending;
                }
        }
    }
    paths.index = 0;
    if (false && connected === true && optimizedMisses.length > 0) {
        observer = {
            onNext: onNext || noop,
            onError: onError || noop,
            onCompleted: onCompleted || noop,
            originals: originalMisses.concat(),
            optimized: optimizedMisses.concat(),
            count: 0,
            path: bound,
            errors: [],
            streaming: streaming,
            materialized: materialized
        };
        if (refreshing === true && streaming === false) {
            onNext({
                paths: paths,
                value: contexts[-1]
            });
        }
        return self._batched === true ? self._batches.batch(originalMisses, refreshing && originalMisses || optimizedMisses, observer) : self._batches.flush(originalMisses, refreshing && originalMisses || optimizedMisses, observer);
    } else {
        if (streaming === false) {
            onNext({
                paths: paths,
                value: contexts[-1]
            });
        }
        if (errors.length === 0) {
//            onCompleted();
        } else if (errors.length === 1) {
            onError(errors[0]);
        } else {
            onError({
                innerErrors: errors
            });
        }
        return Disposable.empty;
    }
}

function setPath(pathOrPBV, valueOrCache, cache, parent, bound) {
    var self = this,
        root = self._root,
        generation = GENERATION_GENERATION++,
        connected, materialized, streaming, refreshing, contexts, messages, error, errors, observer, observers, expired, paths, path, key, column, offset, last, index, length, sizeOffset, boundOptimized, original, optimized, pbv, originalMiss, originalMisses, optimizedMiss, optimizedMisses, refs, cols, crossed, depth, batchedOptimizedPathMap, batchedPathMap, batchedPathMaps, contextCache, contextParent, context, contextValue, contextType, contextSize, contextExpires, contextTimestamp, boundContext, messageCache, messageParent, message, messageValue, messageType, messageSize, messageExpires, messageTimestamp;
    if (Array.isArray(pathOrPBV)) {
        path = pathOrPBV;
        message = valueOrCache;
        cache = cache || this._cache;
    } else {
        path = pathOrPBV.path;
        message = pathOrPBV.value;
        cache = valueOrCache || this._cache;
    }
    bound = bound || self._path;
    path = path || [];
    cache = cache || self._cache;
    parent = parent || self.__context || (path = bound.concat(path)) && cache;
    path = path;
    pbv = {
        path: [],
        optimized: []
    };
    refs = [];
    cols = [];
    crossed = [];
    column = 0;
    offset = 0;
    last = path.length - 1;
    contextCache = cache;
    contextParent = parent;
    context = contextParent;
    contextValue = context;
    original = pbv.path;
    optimized = pbv.optimized;
    depth = -1;
    sizeOffset = 0;
    expired = self._expired || (self._expired = []);
    refs[-1] = path;
    cols[-1] = 0;
    setting_path:
        while (true) {
            for (; column < last; ++column) {
                key = path[column];
                if (key != null && typeof key === 'object') {
                    if (Array.isArray(key)) {
                        key = key[key.index || (key.index = 0)];
                        if (key != null && typeof key === 'object') {
                            key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                        }
                    } else {
                        key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                    }
                }
                if (key == null) {
                    continue;
                }
                original[original.length = column] = key;
                optimized[optimized.length = column + offset] = key;
                if ( // Put the message in the cache and migrate generation if needed.
                    context && (contextParent[key] || {
                    '$size': 0
                }) && !context.__generation !== void 0 && ((contextParent[key] || {
                    '$size': 0
                }).__generation === void 0 || context.__generation > (contextParent[key] || {
                    '$size': 0
                }).__generation)) {
                    (contextParent[key] || {
                        '$size': 0
                    }).__generation = context.__generation;
                }
                contextParent[key] = context = contextParent[key] || {
                    '$size': 0
                };
                context.__parent = contextParent;
                context.__key = key;
                while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                    // Otherwise, set contextValue to the context.
                    = context && context[ // If the context is a sentinel, get its value.
                    // Otherwise, set contextValue to the context.
                    '$type']) === 'sentinel' ? context.value : context)) {
                    var head = root.__head,
                        tail = root.__tail;
                    if (context && context['$expires'] !== 1) {
                        var next = context.__next,
                            prev = context.__prev;
                        if (context !== head) {
                            next && (next != null && typeof next === 'object') && (next.__prev = prev);
                            prev && (prev != null && typeof prev === 'object') && (prev.__next = next);
                            (next = head) && (next != null && typeof next === 'object') && (head.__prev = context);
                            root.__head = root.__next = head = context;
                            if (head != null && typeof head === 'object') {
                                head.__next = next;
                                head.__prev = void 0;
                            }
                        }
                        if (tail == null || context === tail) {
                            root.__tail = root.__prev = tail = prev || context;
                        }
                    }
                    if ((context = context.__context) !== void 0) {
                        var i = -1,
                            n = optimized.length = contextValue.length || 0;
                        while (++i < n) {
                            optimized[i] = contextValue[i];
                        }
                        offset = n - column - 1;
                    } else {
                        contextParent = contextCache;
                        refs[depth] = path;
                        cols[depth++] = column;
                        path = contextValue;
                        last = path.length - 1;
                        offset = 0;
                        column = 0;
                        expanding:
                            while (true) {
                                for (; column < last; ++column) {
                                    key = path[column];
                                    if (key == null) {
                                        continue;
                                    }
                                    context = contextParent[key];
                                    optimized[optimized.length = column + offset] = key;
                                    while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                                        // Otherwise, set contextValue to the context.
                                        = context && context[ // If the context is a sentinel, get its value.
                                        // Otherwise, set contextValue to the context.
                                        '$type']) === 'sentinel' ? context.value : context)) {
                                        var head$2 = root.__head,
                                            tail$2 = root.__tail;
                                        if (context && context['$expires'] !== 1) {
                                            var next$2 = context.__next,
                                                prev$2 = context.__prev;
                                            if (context !== head$2) {
                                                next$2 && (next$2 != null && typeof next$2 === 'object') && (next$2.__prev = prev$2);
                                                prev$2 && (prev$2 != null && typeof prev$2 === 'object') && (prev$2.__next = next$2);
                                                (next$2 = head$2) && (next$2 != null && typeof next$2 === 'object') && (head$2.__prev = context);
                                                root.__head = root.__next = head$2 = context;
                                                if (head$2 != null && typeof head$2 === 'object') {
                                                    head$2.__next = next$2;
                                                    head$2.__prev = void 0;
                                                }
                                            }
                                            if (tail$2 == null || context === tail$2) {
                                                root.__tail = root.__prev = tail$2 = prev$2 || context;
                                            }
                                        }
                                        if ((context = context.__context) !== void 0) {
                                            var i$2 = -1,
                                                n$2 = optimized.length = contextValue.length || 0;
                                            while (++i$2 < n$2) {
                                                optimized[i$2] = contextValue[i$2];
                                            }
                                            offset = n$2 - column - 1;
                                        } else {
                                            contextParent = contextCache;
                                            refs[depth] = path;
                                            cols[depth++] = column;
                                            path = contextValue;
                                            last = path.length - 1;
                                            offset = 0;
                                            column = 0;
                                            continue expanding;
                                        }
                                    }
                                    if (context == null || contextType !== void 0) {
                                        optimized.length = column + offset + 1;
                                        // If we short-circuited while following a reference, set
                                        // the column, path, and last variables to the path we were
                                        // following before we started following the broken reference.
                                        // Use this path to build the missing path from the optimized
                                        // path.
                                        column = cols[--depth];
                                        offset = last - column - 1;
                                        path = refs[depth];
                                        last = path.length - 1;
                                        // Append null to the original path so someone can
                                        // call `get` with the path and request beyond the
                                        // reference.
                                        original[original.length] = null;
                                        break setting_path;
                                    }
                                    contextParent = context;
                                }
                                if (column === last) {
                                    key = path[column];
                                    if (key != null) {
                                        optimized[optimized.length = column + offset] = key;
                                        if ( // Put the message in the cache and migrate generation if needed.
                                            context && (contextParent[key] || {
                                            '$size': 0
                                        }) && !context.__generation !== void 0 && ((contextParent[key] || {
                                            '$size': 0
                                        }).__generation === void 0 || context.__generation > (contextParent[key] || {
                                            '$size': 0
                                        }).__generation)) {
                                            (contextParent[key] || {
                                                '$size': 0
                                            }).__generation = context.__generation;
                                        }
                                        contextParent[key] = context = contextParent[key] || {
                                            '$size': 0
                                        };
                                        context.__parent = contextParent;
                                        context.__key = key;
                                    }
                                    if (context == null || contextType === 'error') {
                                        optimized.length = column + offset + 1;
                                        // If we short-circuited while following a reference, set
                                        // the column, path, and last variables to the path we were
                                        // following before we started following the broken reference.
                                        // Use this path to build the missing path from the optimized
                                        // path.
                                        column = cols[--depth];
                                        offset = last - column - 1;
                                        path = refs[depth];
                                        last = path.length - 1;
                                        // Append null to the original path so someone can
                                        // call `get` with the path and request beyond the
                                        // reference.
                                        original[original.length] = null;
                                        break setting_path;
                                    }
                                    var refContainer;
                                    if (( // Set up the hard-link so we don't have to do all
                                        // this work the next time we follow this reference.
                                        refContainer = path.__container || path).__context === void 0) {
                                        var backRefs = context.__refsLength || 0;
                                        context['__ref' + backRefs] = refContainer;
                                        context.__refsLength = backRefs + 1;
                                        refContainer.__refIndex = backRefs;
                                        refContainer.__context = context;
                                    }
                                    do {
                                        // Roll back to the path that was interrupted.
                                        // We might have to roll back multiple times,
                                        // as in the case where a reference references
                                        // a reference.
                                        path = refs[--depth];
                                        column = cols[depth];
                                        offset = last - column;
                                        last = path.length - 1;
                                    } while (depth > -1 && column === last);
                                    if ( // If the reference we followed landed on another reference ~and~
                                    // the recursed path has more keys to process, Kanye the path we
                                    // rolled back to -- we're gonna let it finish, but first we gotta
                                    // say that this reference had the best album of ALL. TIME.
                                        column < last) {
                                        while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                                            // Otherwise, set contextValue to the context.
                                            = context && context[ // If the context is a sentinel, get its value.
                                            // Otherwise, set contextValue to the context.
                                            '$type']) === 'sentinel' ? context.value : context)) {
                                            var head$3 = root.__head,
                                                tail$3 = root.__tail;
                                            if (context && context['$expires'] !== 1) {
                                                var next$3 = context.__next,
                                                    prev$3 = context.__prev;
                                                if (context !== head$3) {
                                                    next$3 && (next$3 != null && typeof next$3 === 'object') && (next$3.__prev = prev$3);
                                                    prev$3 && (prev$3 != null && typeof prev$3 === 'object') && (prev$3.__next = next$3);
                                                    (next$3 = head$3) && (next$3 != null && typeof next$3 === 'object') && (head$3.__prev = context);
                                                    root.__head = root.__next = head$3 = context;
                                                    if (head$3 != null && typeof head$3 === 'object') {
                                                        head$3.__next = next$3;
                                                        head$3.__prev = void 0;
                                                    }
                                                }
                                                if (tail$3 == null || context === tail$3) {
                                                    root.__tail = root.__prev = tail$3 = prev$3 || context;
                                                }
                                            }
                                            if ((context = context.__context) !== void 0) {
                                                var i$3 = -1,
                                                    n$3 = optimized.length = contextValue.length || 0;
                                                while (++i$3 < n$3) {
                                                    optimized[i$3] = contextValue[i$3];
                                                }
                                                offset = n$3 - column - 1;
                                            } else {
                                                contextParent = contextCache;
                                                refs[depth] = path;
                                                cols[depth++] = column;
                                                path = contextValue;
                                                last = path.length - 1;
                                                offset = 0;
                                                column = 0;
                                                continue expanding;
                                            }
                                        }
                                    }
                                    if (depth > -1) {
                                        column += 1;
                                        contextParent = context;
                                        continue expanding;
                                    }
                                }
                                break expanding;
                            }
                    }
                }
                if (context == null || contextType !== void 0) {
                    optimized.length = column + offset + 1;
                    break setting_path;
                }
                contextParent = context;
            }
            if (column === last) {
                key = path[column];
                if (key != null && typeof key === 'object') {
                    if (Array.isArray(key)) {
                        key = key[key.index || (key.index = 0)];
                        if (key != null && typeof key === 'object') {
                            key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                        }
                    } else {
                        key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                    }
                }
                original[original.length = column] = key;
                if (key != null) {
                    optimized[optimized.length = column + offset] = key;
                    context = contextParent[key];
                    var sizeOffset$2 = 0;
                    if (message == null) {
                        messageValue = message;
                        messageSize = 0;
                        messageType = 'primitive';
                        messageTimestamp = void 0;
                        messageExpires = void 0;
                    } else if (!((messageExpires = message['$expires']) == null || messageExpires === 1 || messageExpires !== 0 && messageExpires > Date.now())) {
                        messageExpires = 0;
                        messageTimestamp = void 0;
                        if (message.__invalidated === void 0) {
                            message.__invalidated = true;
                            message['$expires'] = 0;
                            expired[expired.length] = message;
                            var head$4 = root.__head,
                                tail$4 = root.__tail;
                            if (message != null && typeof message === 'object') {
                                var next$4 = message.__next,
                                    prev$4 = message.__prev;
                                next$4 && (next$4.__prev = prev$4);
                                prev$4 && (prev$4.__next = next$4);
                                message === head$4 && (root.__head = root.__next = head$4 = next$4);
                                message === tail$4 && (root.__tail = root.__prev = tail$4 = prev$4);
                                message.__next = message.__prev = void 0;
                            }
                        }
                    } else {
                        messageExpires = message['$expires'];
                        messageTimestamp = message['$timestamp'];
                        messageValue = ( // If the context is a sentinel, get its value.
                            // Otherwise, set contextValue to the context.
                            messageType = message && message['$type']) === 'sentinel' ? message.value : message;
                        if (Array.isArray(messageValue)) {
                            if ((messageSize = message['$size']) == null) {
                                messageSize = (messageType === 'sentinel' && 50 || 0) + messageValue.length;
                            }
                            messageType = 'array';
                        } else if (messageType === 'sentinel') {
                            if ((messageSize = message['$size']) == null) {
                                messageSize = 50 + (typeof messageValue === 'string' && messageValue.length || 1);
                            }
                        } else if (message == null || typeof message !== 'object') {
                            messageSize = typeof messageValue === 'string' ? messageValue.length : 1;
                            messageType = 'primitive';
                        } else {
                            messageSize = message['$size'] || 0;
                            messageType = messageType || 'leaf';
                        }
                    }
                    if (context === message) {
                        contextValue = messageValue;
                        contextSize = messageSize;
                        contextType = messageType;
                        contextTimestamp = messageTimestamp;
                        contextExpires = messageExpires;
                    } else {
                        if (context == null) {
                            contextValue = context;
                            contextSize = 0;
                            contextType = 'primitive';
                            contextTimestamp = void 0;
                            contextExpires = void 0;
                        } else if (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now())) {
                            contextExpires = 0;
                            contextTimestamp = void 0;
                            if (context.__invalidated === void 0) {
                                context.__invalidated = true;
                                context['$expires'] = 0;
                                expired[expired.length] = context;
                                var head$5 = root.__head,
                                    tail$5 = root.__tail;
                                if (context != null && typeof context === 'object') {
                                    var next$5 = context.__next,
                                        prev$5 = context.__prev;
                                    next$5 && (next$5.__prev = prev$5);
                                    prev$5 && (prev$5.__next = next$5);
                                    context === head$5 && (root.__head = root.__next = head$5 = next$5);
                                    context === tail$5 && (root.__tail = root.__prev = tail$5 = prev$5);
                                    context.__next = context.__prev = void 0;
                                }
                            }
                        } else {
                            contextExpires = context['$expires'];
                            contextTimestamp = context['$timestamp'];
                            contextValue = ( // If the context is a sentinel, get its value.
                                // Otherwise, set contextValue to the context.
                                contextType = context && context['$type']) === 'sentinel' ? context.value : context;
                            if (Array.isArray(contextValue)) {
                                if ((contextSize = context['$size']) == null) {
                                    contextSize = (contextType === 'sentinel' && 50 || 0) + contextValue.length;
                                }
                                contextType = 'array';
                            } else if (contextType === 'sentinel') {
                                if ((contextSize = context['$size']) == null) {
                                    contextSize = 50 + (typeof contextValue === 'string' && contextValue.length || 1);
                                }
                            } else if (context == null || typeof context !== 'object') {
                                contextSize = typeof contextValue === 'string' ? contextValue.length : 1;
                                contextType = 'primitive';
                            } else {
                                contextSize = context['$size'] || 0;
                                contextType = contextType || 'leaf';
                            }
                        }
                    }
                    inserting:
                        while ((messageTimestamp < // Return `true` if the message is newer than the
                            // context and the message isn't set to expire now.
                            // Return `false` if the message is older, or if it
                            // expires now.
                            //
                            // If the message is newer than the cache but it's set
                            // to expire now, set the context variable to the message
                            // so we'll onNext the message, but leave the cache alone.
                            contextTimestamp || messageExpires === 0 && ((context = message) || true)) === false) {
                            if (messageType === 'primitive') {
                                messageType = 'sentinel';
                                messageSize = 50 + (messageSize || 1);
                                message = {
                                    '$size': messageSize,
                                    '$type': messageType,
                                    'value': messageValue
                                };
                            } else if (messageType === 'array') {
                                message['$type'] = messageType = message['$type'] || 'leaf';
                            } else {
                                message['$size'] = messageSize;
                                message['$type'] = messageType = messageType || 'leaf';
                            }
                            if (context && context !== message) {
                                if (contextType === // Before we overwrite the cache value, migrate the
                                    // back-references from the context to the message and
                                    // remove the context's hard-link.
                                    'array') {
                                    var dest = context.__context;
                                    if (dest != null) {
                                        var i$4 = (context.__refIndex || 0) - 1,
                                            n$4 = (dest.__refsLength || 0) - 1;
                                        while (++i$4 <= n$4) {
                                            dest['__ref' + i$4] = dest['__ref' + (i$4 + 1)];
                                        }
                                        dest.__refsLength = n$4;
                                        context.__refIndex = void 0;
                                        context.__context = null;
                                    }
                                }
                                if (context.__refsLength) {
                                    var cRefs = context.__refsLength || 0,
                                        mRefs = message.__refsLength || 0,
                                        i$5 = -1,
                                        ref;
                                    while (++i$5 < cRefs) {
                                        if ((ref = context['__ref' + i$5]) !== void 0) {
                                            ref.__context = message;
                                            message['__ref' + (mRefs + i$5)] = ref;
                                            context['__ref' + i$5] = void 0;
                                        }
                                    }
                                    message.__refsLength = mRefs + cRefs;
                                    context.__refsLength = void 0;
                                }
                                var head$6 = root.__head,
                                    tail$6 = root.__tail;
                                if (context != null && typeof context === 'object') {
                                    var next$6 = context.__next,
                                        prev$6 = context.__prev;
                                    next$6 && (next$6.__prev = prev$6);
                                    prev$6 && (prev$6.__next = next$6);
                                    context === head$6 && (root.__head = root.__next = head$6 = next$6);
                                    context === tail$6 && (root.__tail = root.__prev = tail$6 = prev$6);
                                    context.__next = context.__prev = void 0;
                                }
                            }
                            sizeOffset$2 = messageSize - contextSize;
                            message['$size'] = messageSize - sizeOffset$2;
                            if (context && // Put the message in the cache and migrate generation if needed.
                                message && !context.__generation !== void 0 && (message.__generation === void 0 || context.__generation > message.__generation)) {
                                message.__generation = context.__generation;
                            }
                            contextParent[key] = context = message;
                            break inserting;
                        }
                    context.__parent = contextParent;
                    context.__key = key;
                    if (sizeOffset$2 !== 0) {
                        var parent$2, size, context$2 = context,
                            contextValue$2, contextType$2;
                        while (context$1171 !== void 0) {
                            context$1171['$size'] = size = (context$1171['$size'] || 0) + sizeOffset$2;
                            if (context$1171.__genUpdated !== generation) {
                                var context$3 = context$1171,
                                    stack = [],
                                    depth$2 = 0,
                                    references, ref$2, i$6, k, n$5;
                                while (depth$2 >= 0) {
                                    if ((references = stack[depth$2]) === void 0) {
                                        i$6 = k = -1;
                                        n$5 = context$1171.__refsLength || 0;
                                        stack[depth$2] = references = [];
                                        context$1171.__genUpdated = generation;
                                        context$1171.__generation = (context$1171.__generation || 0) + 1;
                                        if ((ref$2 = context$1171.__parent) !== void 0 && ref$2.__genUpdated !== generation) {
                                            references[++k] = ref$2;
                                        }
                                        while (++i$6 < n$5) {
                                            if ((ref$2 = context$1171['__ref' + i$6]) !== void 0 && ref$2.__genUpdated !== generation) {
                                                references[++k] = ref$2;
                                            }
                                        }
                                    }
                                    if ((context$1171 = references.pop()) !== void 0) {
                                        ++depth$2;
                                    } else {
                                        stack[depth$2--] = void 0;
                                    }
                                }
                            }
                            if (( // If this node's size drops to zero or below, add it to the
                                // expired list and remove it from the cache.
                                parent$2 = context$1171.__parent) !== void 0 && size <= 0) {
                                var cRefs$2 = context$1171.__refsLength || 0,
                                    idx = -1,
                                    ref$3;
                                while (++idx < cRefs$2) {
                                    if ((ref$3 = context$1171['__ref' + idx]) !== void 0) {
                                        ref$3.__context = void 0;
                                        context$1171['__ref' + idx] = void 0;
                                    }
                                }
                                context$1171.__refsLength = void 0;
                                if (Array.isArray(contextValue$2 = (contextType$2 // If the context is a sentinel, get its value.
                                    // Otherwise, set contextValue to the context.
                                    = context$1171 && context$1171[ // If the context is a sentinel, get its value.
                                    // Otherwise, set contextValue to the context.
                                    '$type']) === 'sentinel' ? context$1171.value : context$1171)) {
                                    var dest$2 = context$1171.__context;
                                    if (dest$2 != null) {
                                        var i$7 = (context$1171.__refIndex || 0) - 1,
                                            n$6 = (dest$2.__refsLength || 0) - 1;
                                        while (++i$7 <= n$6) {
                                            dest$2['__ref' + i$7] = dest$2['__ref' + (i$7 + 1)];
                                        }
                                        dest$2.__refsLength = n$6;
                                        context$1171.__refIndex = void 0;
                                        context$1171.__context = null;
                                    }
                                }
                                parent$2[context$1171.__key] = context$1171.__parent = void 0;
                                var head$7 = root.__head,
                                    tail$7 = root.__tail;
                                if (context$1171 != null && typeof context$1171 === 'object') {
                                    var next$7 = context$1171.__next,
                                        prev$7 = context$1171.__prev;
                                    next$7 && (next$7.__prev = prev$7);
                                    prev$7 && (prev$7.__next = next$7);
                                    context$1171 === head$7 && (root.__head = root.__next = head$7 = next$7);
                                    context$1171 === tail$7 && (root.__tail = root.__prev = tail$7 = prev$7);
                                    context$1171.__next = context$1171.__prev = void 0;
                                }
                            }
                            context$1171 = parent$2;
                        }
                    } else {
                        var context$4 = context;
                        while (context$1171 !== void 0) {
                            if (context$1171.__genUpdated !== generation) {
                                var context$5 = context$1171,
                                    stack$2 = [],
                                    depth$3 = 0,
                                    references$2, ref$4, i$8, k$2, n$7;
                                while (depth$3 >= 0) {
                                    if ((references$2 = stack$2[depth$3]) === void 0) {
                                        i$8 = k$2 = -1;
                                        n$7 = context$1171.__refsLength || 0;
                                        stack$2[depth$3] = references$2 = [];
                                        context$1171.__genUpdated = generation;
                                        context$1171.__generation = (context$1171.__generation || 0) + 1;
                                        if ((ref$4 = context$1171.__parent) !== void 0 && ref$4.__genUpdated !== generation) {
                                            references$2[++k$2] = ref$4;
                                        }
                                        while (++i$8 < n$7) {
                                            if ((ref$4 = context$1171['__ref' + i$8]) !== void 0 && ref$4.__genUpdated !== generation) {
                                                references$2[++k$2] = ref$4;
                                            }
                                        }
                                    }
                                    if ((context$1171 = references$2.pop()) !== void 0) {
                                        ++depth$3;
                                    } else {
                                        stack$2[depth$3--] = void 0;
                                    }
                                }
                            }
                            context$1171 = context$1171.__parent;
                        }
                    }
                    var head$8 = root.__head,
                        tail$8 = root.__tail;
                    if (context && context['$expires'] !== 1) {
                        var next$8 = context.__next,
                            prev$8 = context.__prev;
                        if (context !== head$8) {
                            next$8 && (next$8 != null && typeof next$8 === 'object') && (next$8.__prev = prev$8);
                            prev$8 && (prev$8 != null && typeof prev$8 === 'object') && (prev$8.__next = next$8);
                            (next$8 = head$8) && (next$8 != null && typeof next$8 === 'object') && (head$8.__prev = context);
                            root.__head = root.__next = head$8 = context;
                            if (head$8 != null && typeof head$8 === 'object') {
                                head$8.__next = next$8;
                                head$8.__prev = void 0;
                            }
                        }
                        if (tail$8 == null || context === tail$8) {
                            root.__tail = root.__prev = tail$8 = prev$8 || context;
                        }
                    }
                }
                // If the context is a sentinel, get its value.
                // Otherwise, set contextValue to the context.
                contextValue = (contextType = context && context['$type']) === 'sentinel' ? context.value : context;
            }
            break setting_path;
        }
    var max = self._maxSize,
        total = cache['$size'],
        targetSize = max * self._collectRatio,
        tail$9, parent$3, size$2, context$6, contextValue$3, contextType$3, i$9 = 0;
    if (total >= max && (root._pendingRequests == null || root._pendingRequests <= 0)) {
        while (total >= targetSize && (context$1463 = expired.pop()) != null) {
            i$9++;
            total -= size$2 = context$1463['$size'] || 0;
            do {
                parent$3 = context$1463.__parent;
                if ((context$1463['$size'] -= size$2) <= 0) {
                    var cRefs$3 = context$1463.__refsLength || 0,
                        idx$2 = -1,
                        ref$5;
                    while (++idx$2 < cRefs$3) {
                        if ((ref$5 = context$1463['__ref' + idx$2]) !== void 0) {
                            ref$5.__context = void 0;
                            context$1463['__ref' + idx$2] = void 0;
                        }
                    }
                    context$1463.__refsLength = void 0;
                    if (Array.isArray(contextValue$3 = (contextType$3 // If the context is a sentinel, get its value.
                        // Otherwise, set contextValue to the context.
                        = context$1463 && context$1463[ // If the context is a sentinel, get its value.
                        // Otherwise, set contextValue to the context.
                        '$type']) === 'sentinel' ? context$1463.value : context$1463)) {
                        var dest$3 = context$1463.__context;
                        if (dest$3 != null) {
                            var i$10 = (context$1463.__refIndex || 0) - 1,
                                n$8 = (dest$3.__refsLength || 0) - 1;
                            while (++i$10 <= n$8) {
                                dest$3['__ref' + i$10] = dest$3['__ref' + (i$10 + 1)];
                            }
                            dest$3.__refsLength = n$8;
                            context$1463.__refIndex = void 0;
                            context$1463.__context = null;
                        }
                    }
                    if (parent$3 !== void 0) {
                        parent$3[context$1463.__key] = context$1463.__parent = void 0;
                    }
                }
                context$1463 = parent$3;
            } while (context$1463 !== void 0);
        }
        if (expired.length <= 0) {
            tail$9 = root.__tail;
            while (total >= targetSize && (context$1463 = tail$9) != null) {
                i$9++;
                tail$9 = tail$9.__prev;
                total -= size$2 = context$1463['$size'] || 0;
                context$1463.__prev = context$1463.__next = void 0;
                do {
                    parent$3 = context$1463.__parent;
                    if ((context$1463['$size'] -= size$2) <= 0) {
                        var cRefs$4 = context$1463.__refsLength || 0,
                            idx$3 = -1,
                            ref$6;
                        while (++idx$3 < cRefs$4) {
                            if ((ref$6 = context$1463['__ref' + idx$3]) !== void 0) {
                                ref$6.__context = void 0;
                                context$1463['__ref' + idx$3] = void 0;
                            }
                        }
                        context$1463.__refsLength = void 0;
                        if (Array.isArray(contextValue$3 = (contextType$3 // If the context is a sentinel, get its value.
                            // Otherwise, set contextValue to the context.
                            = context$1463 && context$1463[ // If the context is a sentinel, get its value.
                            // Otherwise, set contextValue to the context.
                            '$type']) === 'sentinel' ? context$1463.value : context$1463)) {
                            var dest$4 = context$1463.__context;
                            if (dest$4 != null) {
                                var i$11 = (context$1463.__refIndex || 0) - 1,
                                    n$9 = (dest$4.__refsLength || 0) - 1;
                                while (++i$11 <= n$9) {
                                    dest$4['__ref' + i$11] = dest$4['__ref' + (i$11 + 1)];
                                }
                                dest$4.__refsLength = n$9;
                                context$1463.__refIndex = void 0;
                                context$1463.__context = null;
                            }
                        }
                        if (parent$3 !== void 0) {
                            parent$3[context$1463.__key] = context$1463.__parent = void 0;
                        }
                    }
                    context$1463 = parent$3;
                } while (context$1463 !== void 0);
            }
        }
        if ((root.__tail = root.__prev = tail$9) == null) {
            root.__head = root.__next = void 0;
        } else {
            tail$9.__next = void 0;
        }
    }
    return pbv;
}

function setPaths(pbvs, onNext, onError, onCompleted, cache, parent, bound) {
    var self = this,
        root = self._root,
        generation = GENERATION_GENERATION++,
        connected, materialized, streaming, refreshing, contexts, messages, error, errors, observer, observers, expired, paths, path, key, column, offset, last, index, length, sizeOffset, boundOptimized, original, optimized, pbv, originalMiss, originalMisses, optimizedMiss, optimizedMisses, refs, cols, crossed, depth, batchedOptimizedPathMap, batchedPathMap, batchedPathMaps, contextCache, contextParent, context, contextValue, contextType, contextSize, contextExpires, contextTimestamp, boundContext, messageCache, messageParent, message, messageValue, messageType, messageSize, messageExpires, messageTimestamp;
    paths = pbvs;
    connected = self._connected;
    materialized = self._materialized;
    streaming = self._streaming;
    refreshing = self._refreshing;
    path = bound || self._path;
    contexts = paths.contexts || (paths.contexts = []);
    messages = paths.messages || (paths.messages = []);
    batchedPathMaps = paths.batchedPathMaps || (paths.batchedPathMaps = []);
    originalMisses = paths.originalMisses || (paths.originalMisses = []);
    optimizedMisses = paths.optimizedMisses || (paths.optimizedMisses = []);
    errors = paths.errors || (paths.errors = []);
    refs = paths.refs || (paths.refs = []);
    crossed = paths.crossed || (paths.crossed = []);
    cols = paths.cols || (paths.cols = []);
    pbv = paths.pbv || (paths.pbv = {
        path: [],
        optimized: []
    });
    index = paths.index || (paths.index = 0);
    length = paths.length;
    batchedPathMap = paths.batchedPathMap;
    messageCache = paths.value;
    messageParent = messageCache;
    cache = cache || self._cache;
    bound = path;
    if (parent == null && (parent = self.__context) == null) {
        if (path.length > 0) {
            pbv = self._getContext();
            path = pbv.path;
            pbv.path = [];
            pbv.optimized = [];
            parent = pbv.value || {};
        } else {
            parent = cache;
        }
    }
    contextCache = cache;
    contextParent = parent;
    context = contextParent;
    contextValue = context;
    original = pbv.path;
    optimized = pbv.optimized;
    depth = -1;
    sizeOffset = 0;
    expired = self._expired || (self._expired = []);
    refs[-1] = path;
    cols[-1] = 0;
    crossed[-1] = boundOptimized = path;
    boundContext = parent;
    for (; index < length; pbvs.index = ++index) {
        pbv = pbvs[index];
        path = pbv.path;
        message = pbv.value;
        column = path.index || (path.index = 0);
        offset = 0;
        last = path.length - 1;
        contextParent = boundContext;
        refs[-1] = path;
        cols[depth = -1] = column;
        crossed = [];
        crossed[-1] = boundOptimized;
        setting_path:
            while (true) {
                for (; column < last; ++column) {
                    key = path[column];
                    if (key != null && typeof key === 'object') {
                        if (Array.isArray(key)) {
                            key = key[key.index || (key.index = 0)];
                            if (key != null && typeof key === 'object') {
                                key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                            }
                        } else {
                            key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                        }
                    }
                    if (key == null) {
                        continue;
                    }
                    original[original.length = column] = key;
                    optimized[optimized.length = column + offset] = key;
                    if ( // Put the message in the cache and migrate generation if needed.
                        context && (contextParent[key] || {
                        '$size': 0
                    }) && !context.__generation !== void 0 && ((contextParent[key] || {
                        '$size': 0
                    }).__generation === void 0 || context.__generation > (contextParent[key] || {
                        '$size': 0
                    }).__generation)) {
                        (contextParent[key] || {
                            '$size': 0
                        }).__generation = context.__generation;
                    }
                    contextParent[key] = context = contextParent[key] || {
                        '$size': 0
                    };
                    context.__parent = contextParent;
                    context.__key = key;
                    while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                        // Otherwise, set contextValue to the context.
                        = context && context[ // If the context is a sentinel, get its value.
                        // Otherwise, set contextValue to the context.
                        '$type']) === 'sentinel' ? context.value : context)) {
                        var head = root.__head,
                            tail = root.__tail;
                        if (context && context['$expires'] !== 1) {
                            var next = context.__next,
                                prev = context.__prev;
                            if (context !== head) {
                                next && (next != null && typeof next === 'object') && (next.__prev = prev);
                                prev && (prev != null && typeof prev === 'object') && (prev.__next = next);
                                (next = head) && (next != null && typeof next === 'object') && (head.__prev = context);
                                root.__head = root.__next = head = context;
                                if (head != null && typeof head === 'object') {
                                    head.__next = next;
                                    head.__prev = void 0;
                                }
                            }
                            if (tail == null || context === tail) {
                                root.__tail = root.__prev = tail = prev || context;
                            }
                        }
                        if ((context = context.__context) !== void 0) {
                            var i = -1,
                                n = optimized.length = contextValue.length || 0;
                            while (++i < n) {
                                optimized[i] = contextValue[i];
                            }
                            offset = n - column - 1;
                        } else {
                            contextParent = contextCache;
                            refs[depth] = path;
                            cols[depth++] = column;
                            path = contextValue;
                            last = path.length - 1;
                            offset = 0;
                            column = 0;
                            expanding:
                                while (true) {
                                    for (; column < last; ++column) {
                                        key = path[column];
                                        if (key == null) {
                                            continue;
                                        }
                                        optimized[optimized.length = column + offset] = key;
                                        if ( // Put the message in the cache and migrate generation if needed.
                                            context && (contextParent[key] || {
                                            '$size': 0
                                        }) && !context.__generation !== void 0 && ((contextParent[key] || {
                                            '$size': 0
                                        }).__generation === void 0 || context.__generation > (contextParent[key] || {
                                            '$size': 0
                                        }).__generation)) {
                                            (contextParent[key] || {
                                                '$size': 0
                                            }).__generation = context.__generation;
                                        }
                                        contextParent[key] = context = contextParent[key] || {
                                            '$size': 0
                                        };
                                        context.__parent = contextParent;
                                        context.__key = key;
                                        while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                                            // Otherwise, set contextValue to the context.
                                            = context && context[ // If the context is a sentinel, get its value.
                                            // Otherwise, set contextValue to the context.
                                            '$type']) === 'sentinel' ? context.value : context)) {
                                            var head$2 = root.__head,
                                                tail$2 = root.__tail;
                                            if (context && context['$expires'] !== 1) {
                                                var next$2 = context.__next,
                                                    prev$2 = context.__prev;
                                                if (context !== head$2) {
                                                    next$2 && (next$2 != null && typeof next$2 === 'object') && (next$2.__prev = prev$2);
                                                    prev$2 && (prev$2 != null && typeof prev$2 === 'object') && (prev$2.__next = next$2);
                                                    (next$2 = head$2) && (next$2 != null && typeof next$2 === 'object') && (head$2.__prev = context);
                                                    root.__head = root.__next = head$2 = context;
                                                    if (head$2 != null && typeof head$2 === 'object') {
                                                        head$2.__next = next$2;
                                                        head$2.__prev = void 0;
                                                    }
                                                }
                                                if (tail$2 == null || context === tail$2) {
                                                    root.__tail = root.__prev = tail$2 = prev$2 || context;
                                                }
                                            }
                                            if ((context = context.__context) !== void 0) {
                                                var i$2 = -1,
                                                    n$2 = optimized.length = contextValue.length || 0;
                                                while (++i$2 < n$2) {
                                                    optimized[i$2] = contextValue[i$2];
                                                }
                                                offset = n$2 - column - 1;
                                            } else {
                                                contextParent = contextCache;
                                                refs[depth] = path;
                                                cols[depth++] = column;
                                                path = contextValue;
                                                last = path.length - 1;
                                                offset = 0;
                                                column = 0;
                                                continue expanding;
                                            }
                                        }
                                        if (context == null || contextType !== void 0) {
                                            optimized.length = column + offset + 1;
                                            // If we short-circuited while following a reference, set
                                            // the column, path, and last variables to the path we were
                                            // following before we started following the broken reference.
                                            // Use this path to build the missing path from the optimized
                                            // path.
                                            column = cols[--depth];
                                            offset = last - column - 1;
                                            path = refs[depth];
                                            last = path.length - 1;
                                            // Append null to the original path so someone can
                                            // call `get` with the path and request beyond the
                                            // reference.
                                            original[original.length] = null;
                                            break setting_path;
                                        }
                                        contextParent = context;
                                    }
                                    if (column === last) {
                                        key = path[column];
                                        if (key != null) {
                                            optimized[optimized.length = column + offset] = key;
                                            if ( // Put the message in the cache and migrate generation if needed.
                                                context && (contextParent[key] || {
                                                '$size': 0
                                            }) && !context.__generation !== void 0 && ((contextParent[key] || {
                                                '$size': 0
                                            }).__generation === void 0 || context.__generation > (contextParent[key] || {
                                                '$size': 0
                                            }).__generation)) {
                                                (contextParent[key] || {
                                                    '$size': 0
                                                }).__generation = context.__generation;
                                            }
                                            contextParent[key] = context = contextParent[key] || {
                                                '$size': 0
                                            };
                                            context.__parent = contextParent;
                                            context.__key = key;
                                        }
                                        if (context == null || contextType === 'error') {
                                            optimized.length = column + offset + 1;
                                            // If we short-circuited while following a reference, set
                                            // the column, path, and last variables to the path we were
                                            // following before we started following the broken reference.
                                            // Use this path to build the missing path from the optimized
                                            // path.
                                            column = cols[--depth];
                                            offset = last - column - 1;
                                            path = refs[depth];
                                            last = path.length - 1;
                                            // Append null to the original path so someone can
                                            // call `get` with the path and request beyond the
                                            // reference.
                                            original[original.length] = null;
                                            break setting_path;
                                        }
                                        var refContainer;
                                        if (( // Set up the hard-link so we don't have to do all
                                            // this work the next time we follow this reference.
                                            refContainer = path.__container || path).__context === void 0) {
                                            var backRefs = context.__refsLength || 0;
                                            context['__ref' + backRefs] = refContainer;
                                            context.__refsLength = backRefs + 1;
                                            refContainer.__refIndex = backRefs;
                                            refContainer.__context = context;
                                        }
                                        do {
                                            // Roll back to the path that was interrupted.
                                            // We might have to roll back multiple times,
                                            // as in the case where a reference references
                                            // a reference.
                                            path = refs[--depth];
                                            column = cols[depth];
                                            offset = last - column;
                                            last = path.length - 1;
                                        } while (depth > -1 && column === last);
                                        if ( // If the reference we followed landed on another reference ~and~
                                        // the recursed path has more keys to process, Kanye the path we
                                        // rolled back to -- we're gonna let it finish, but first we gotta
                                        // say that this reference had the best album of ALL. TIME.
                                            column < last) {
                                            while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                                                // Otherwise, set contextValue to the context.
                                                = context && context[ // If the context is a sentinel, get its value.
                                                // Otherwise, set contextValue to the context.
                                                '$type']) === 'sentinel' ? context.value : context)) {
                                                var head$3 = root.__head,
                                                    tail$3 = root.__tail;
                                                if (context && context['$expires'] !== 1) {
                                                    var next$3 = context.__next,
                                                        prev$3 = context.__prev;
                                                    if (context !== head$3) {
                                                        next$3 && (next$3 != null && typeof next$3 === 'object') && (next$3.__prev = prev$3);
                                                        prev$3 && (prev$3 != null && typeof prev$3 === 'object') && (prev$3.__next = next$3);
                                                        (next$3 = head$3) && (next$3 != null && typeof next$3 === 'object') && (head$3.__prev = context);
                                                        root.__head = root.__next = head$3 = context;
                                                        if (head$3 != null && typeof head$3 === 'object') {
                                                            head$3.__next = next$3;
                                                            head$3.__prev = void 0;
                                                        }
                                                    }
                                                    if (tail$3 == null || context === tail$3) {
                                                        root.__tail = root.__prev = tail$3 = prev$3 || context;
                                                    }
                                                }
                                                if ((context = context.__context) !== void 0) {
                                                    var i$3 = -1,
                                                        n$3 = optimized.length = contextValue.length || 0;
                                                    while (++i$3 < n$3) {
                                                        optimized[i$3] = contextValue[i$3];
                                                    }
                                                    offset = n$3 - column - 1;
                                                } else {
                                                    contextParent = contextCache;
                                                    refs[depth] = path;
                                                    cols[depth++] = column;
                                                    path = contextValue;
                                                    last = path.length - 1;
                                                    offset = 0;
                                                    column = 0;
                                                    continue expanding;
                                                }
                                            }
                                        }
                                        if (depth > -1) {
                                            column += 1;
                                            contextParent = context;
                                            continue expanding;
                                        }
                                    }
                                    break expanding;
                                }
                        }
                    }
                    if (context == null || contextType !== void 0) {
                        optimized.length = column + offset + 1;
                        break setting_path;
                    }
                    contextParent = context;
                }
                if (column === last) {
                    key = path[column];
                    if (key != null && typeof key === 'object') {
                        if (Array.isArray(key)) {
                            key = key[key.index || (key.index = 0)];
                            if (key != null && typeof key === 'object') {
                                key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                            }
                        } else {
                            key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                        }
                    }
                    original[original.length = column] = key;
                    if (key != null) {
                        optimized[optimized.length = column + offset] = key;
                        context = contextParent[key];
                        var sizeOffset$2 = 0;
                        if (message == null) {
                            messageValue = message;
                            messageSize = 0;
                            messageType = 'primitive';
                            messageTimestamp = void 0;
                            messageExpires = void 0;
                        } else if (!((messageExpires = message['$expires']) == null || messageExpires === 1 || messageExpires !== 0 && messageExpires > Date.now())) {
                            messageExpires = 0;
                            messageTimestamp = void 0;
                            if (message.__invalidated === void 0) {
                                message.__invalidated = true;
                                message['$expires'] = 0;
                                expired[expired.length] = message;
                                var head$4 = root.__head,
                                    tail$4 = root.__tail;
                                if (message != null && typeof message === 'object') {
                                    var next$4 = message.__next,
                                        prev$4 = message.__prev;
                                    next$4 && (next$4.__prev = prev$4);
                                    prev$4 && (prev$4.__next = next$4);
                                    message === head$4 && (root.__head = root.__next = head$4 = next$4);
                                    message === tail$4 && (root.__tail = root.__prev = tail$4 = prev$4);
                                    message.__next = message.__prev = void 0;
                                }
                            }
                        } else {
                            messageExpires = message['$expires'];
                            messageTimestamp = message['$timestamp'];
                            messageValue = ( // If the context is a sentinel, get its value.
                                // Otherwise, set contextValue to the context.
                                messageType = message && message['$type']) === 'sentinel' ? message.value : message;
                            if (Array.isArray(messageValue)) {
                                if ((messageSize = message['$size']) == null) {
                                    messageSize = (messageType === 'sentinel' && 50 || 0) + messageValue.length;
                                }
                                messageType = 'array';
                            } else if (messageType === 'sentinel') {
                                if ((messageSize = message['$size']) == null) {
                                    messageSize = 50 + (typeof messageValue === 'string' && messageValue.length || 1);
                                }
                            } else if (message == null || typeof message !== 'object') {
                                messageSize = typeof messageValue === 'string' ? messageValue.length : 1;
                                messageType = 'primitive';
                            } else {
                                messageSize = message['$size'] || 0;
                                messageType = messageType || 'leaf';
                            }
                        }
                        if (context === message) {
                            contextValue = messageValue;
                            contextSize = messageSize;
                            contextType = messageType;
                            contextTimestamp = messageTimestamp;
                            contextExpires = messageExpires;
                        } else {
                            if (context == null) {
                                contextValue = context;
                                contextSize = 0;
                                contextType = 'primitive';
                                contextTimestamp = void 0;
                                contextExpires = void 0;
                            } else if (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now())) {
                                contextExpires = 0;
                                contextTimestamp = void 0;
                                if (context.__invalidated === void 0) {
                                    context.__invalidated = true;
                                    context['$expires'] = 0;
                                    expired[expired.length] = context;
                                    var head$5 = root.__head,
                                        tail$5 = root.__tail;
                                    if (context != null && typeof context === 'object') {
                                        var next$5 = context.__next,
                                            prev$5 = context.__prev;
                                        next$5 && (next$5.__prev = prev$5);
                                        prev$5 && (prev$5.__next = next$5);
                                        context === head$5 && (root.__head = root.__next = head$5 = next$5);
                                        context === tail$5 && (root.__tail = root.__prev = tail$5 = prev$5);
                                        context.__next = context.__prev = void 0;
                                    }
                                }
                            } else {
                                contextExpires = context['$expires'];
                                contextTimestamp = context['$timestamp'];
                                contextValue = ( // If the context is a sentinel, get its value.
                                    // Otherwise, set contextValue to the context.
                                    contextType = context && context['$type']) === 'sentinel' ? context.value : context;
                                if (Array.isArray(contextValue)) {
                                    if ((contextSize = context['$size']) == null) {
                                        contextSize = (contextType === 'sentinel' && 50 || 0) + contextValue.length;
                                    }
                                    contextType = 'array';
                                } else if (contextType === 'sentinel') {
                                    if ((contextSize = context['$size']) == null) {
                                        contextSize = 50 + (typeof contextValue === 'string' && contextValue.length || 1);
                                    }
                                } else if (context == null || typeof context !== 'object') {
                                    contextSize = typeof contextValue === 'string' ? contextValue.length : 1;
                                    contextType = 'primitive';
                                } else {
                                    contextSize = context['$size'] || 0;
                                    contextType = contextType || 'leaf';
                                }
                            }
                        }
                        inserting:
                            while ((messageTimestamp < // Return `true` if the message is newer than the
                                // context and the message isn't set to expire now.
                                // Return `false` if the message is older, or if it
                                // expires now.
                                //
                                // If the message is newer than the cache but it's set
                                // to expire now, set the context variable to the message
                                // so we'll onNext the message, but leave the cache alone.
                                contextTimestamp || messageExpires === 0 && ((context = message) || true)) === false) {
                                if (messageType === 'primitive') {
                                    messageType = 'sentinel';
                                    messageSize = 50 + (messageSize || 1);
                                    message = {
                                        '$size': messageSize,
                                        '$type': messageType,
                                        'value': messageValue
                                    };
                                } else if (messageType === 'array') {
                                    message['$type'] = messageType = message['$type'] || 'leaf';
                                } else {
                                    message['$size'] = messageSize;
                                    message['$type'] = messageType = messageType || 'leaf';
                                }
                                if (context && context !== message) {
                                    if (contextType === // Before we overwrite the cache value, migrate the
                                        // back-references from the context to the message and
                                        // remove the context's hard-link.
                                        'array') {
                                        var dest = context.__context;
                                        if (dest != null) {
                                            var i$4 = (context.__refIndex || 0) - 1,
                                                n$4 = (dest.__refsLength || 0) - 1;
                                            while (++i$4 <= n$4) {
                                                dest['__ref' + i$4] = dest['__ref' + (i$4 + 1)];
                                            }
                                            dest.__refsLength = n$4;
                                            context.__refIndex = void 0;
                                            context.__context = null;
                                        }
                                    }
                                    if (context.__refsLength) {
                                        var cRefs = context.__refsLength || 0,
                                            mRefs = message.__refsLength || 0,
                                            i$5 = -1,
                                            ref;
                                        while (++i$5 < cRefs) {
                                            if ((ref = context['__ref' + i$5]) !== void 0) {
                                                ref.__context = message;
                                                message['__ref' + (mRefs + i$5)] = ref;
                                                context['__ref' + i$5] = void 0;
                                            }
                                        }
                                        message.__refsLength = mRefs + cRefs;
                                        context.__refsLength = void 0;
                                    }
                                    var head$6 = root.__head,
                                        tail$6 = root.__tail;
                                    if (context != null && typeof context === 'object') {
                                        var next$6 = context.__next,
                                            prev$6 = context.__prev;
                                        next$6 && (next$6.__prev = prev$6);
                                        prev$6 && (prev$6.__next = next$6);
                                        context === head$6 && (root.__head = root.__next = head$6 = next$6);
                                        context === tail$6 && (root.__tail = root.__prev = tail$6 = prev$6);
                                        context.__next = context.__prev = void 0;
                                    }
                                }
                                sizeOffset$2 = messageSize - contextSize;
                                message['$size'] = messageSize - sizeOffset$2;
                                if (context && // Put the message in the cache and migrate generation if needed.
                                    message && !context.__generation !== void 0 && (message.__generation === void 0 || context.__generation > message.__generation)) {
                                    message.__generation = context.__generation;
                                }
                                contextParent[key] = context = message;
                                break inserting;
                            }
                        context.__parent = contextParent;
                        context.__key = key;
                        if (sizeOffset$2 !== 0) {
                            var parent$2, size, context$2 = context,
                                contextValue$2, contextType$2;
                            while (context$1171 !== void 0) {
                                context$1171['$size'] = size = (context$1171['$size'] || 0) + sizeOffset$2;
                                if (context$1171.__genUpdated !== generation) {
                                    var context$3 = context$1171,
                                        stack = [],
                                        depth$2 = 0,
                                        references, ref$2, i$6, k, n$5;
                                    while (depth$2 >= 0) {
                                        if ((references = stack[depth$2]) === void 0) {
                                            i$6 = k = -1;
                                            n$5 = context$1171.__refsLength || 0;
                                            stack[depth$2] = references = [];
                                            context$1171.__genUpdated = generation;
                                            context$1171.__generation = (context$1171.__generation || 0) + 1;
                                            if ((ref$2 = context$1171.__parent) !== void 0 && ref$2.__genUpdated !== generation) {
                                                references[++k] = ref$2;
                                            }
                                            while (++i$6 < n$5) {
                                                if ((ref$2 = context$1171['__ref' + i$6]) !== void 0 && ref$2.__genUpdated !== generation) {
                                                    references[++k] = ref$2;
                                                }
                                            }
                                        }
                                        if ((context$1171 = references.pop()) !== void 0) {
                                            ++depth$2;
                                        } else {
                                            stack[depth$2--] = void 0;
                                        }
                                    }
                                }
                                if (( // If this node's size drops to zero or below, add it to the
                                    // expired list and remove it from the cache.
                                    parent$2 = context$1171.__parent) !== void 0 && size <= 0) {
                                    var cRefs$2 = context$1171.__refsLength || 0,
                                        idx = -1,
                                        ref$3;
                                    while (++idx < cRefs$2) {
                                        if ((ref$3 = context$1171['__ref' + idx]) !== void 0) {
                                            ref$3.__context = void 0;
                                            context$1171['__ref' + idx] = void 0;
                                        }
                                    }
                                    context$1171.__refsLength = void 0;
                                    if (Array.isArray(contextValue$2 = (contextType$2 // If the context is a sentinel, get its value.
                                        // Otherwise, set contextValue to the context.
                                        = context$1171 && context$1171[ // If the context is a sentinel, get its value.
                                        // Otherwise, set contextValue to the context.
                                        '$type']) === 'sentinel' ? context$1171.value : context$1171)) {
                                        var dest$2 = context$1171.__context;
                                        if (dest$2 != null) {
                                            var i$7 = (context$1171.__refIndex || 0) - 1,
                                                n$6 = (dest$2.__refsLength || 0) - 1;
                                            while (++i$7 <= n$6) {
                                                dest$2['__ref' + i$7] = dest$2['__ref' + (i$7 + 1)];
                                            }
                                            dest$2.__refsLength = n$6;
                                            context$1171.__refIndex = void 0;
                                            context$1171.__context = null;
                                        }
                                    }
                                    parent$2[context$1171.__key] = context$1171.__parent = void 0;
                                    var head$7 = root.__head,
                                        tail$7 = root.__tail;
                                    if (context$1171 != null && typeof context$1171 === 'object') {
                                        var next$7 = context$1171.__next,
                                            prev$7 = context$1171.__prev;
                                        next$7 && (next$7.__prev = prev$7);
                                        prev$7 && (prev$7.__next = next$7);
                                        context$1171 === head$7 && (root.__head = root.__next = head$7 = next$7);
                                        context$1171 === tail$7 && (root.__tail = root.__prev = tail$7 = prev$7);
                                        context$1171.__next = context$1171.__prev = void 0;
                                    }
                                }
                                context$1171 = parent$2;
                            }
                        } else {
                            var context$4 = context;
                            while (context$1171 !== void 0) {
                                if (context$1171.__genUpdated !== generation) {
                                    var context$5 = context$1171,
                                        stack$2 = [],
                                        depth$3 = 0,
                                        references$2, ref$4, i$8, k$2, n$7;
                                    while (depth$3 >= 0) {
                                        if ((references$2 = stack$2[depth$3]) === void 0) {
                                            i$8 = k$2 = -1;
                                            n$7 = context$1171.__refsLength || 0;
                                            stack$2[depth$3] = references$2 = [];
                                            context$1171.__genUpdated = generation;
                                            context$1171.__generation = (context$1171.__generation || 0) + 1;
                                            if ((ref$4 = context$1171.__parent) !== void 0 && ref$4.__genUpdated !== generation) {
                                                references$2[++k$2] = ref$4;
                                            }
                                            while (++i$8 < n$7) {
                                                if ((ref$4 = context$1171['__ref' + i$8]) !== void 0 && ref$4.__genUpdated !== generation) {
                                                    references$2[++k$2] = ref$4;
                                                }
                                            }
                                        }
                                        if ((context$1171 = references$2.pop()) !== void 0) {
                                            ++depth$3;
                                        } else {
                                            stack$2[depth$3--] = void 0;
                                        }
                                    }
                                }
                                context$1171 = context$1171.__parent;
                            }
                        }
                        var head$8 = root.__head,
                            tail$8 = root.__tail;
                        if (context && context['$expires'] !== 1) {
                            var next$8 = context.__next,
                                prev$8 = context.__prev;
                            if (context !== head$8) {
                                next$8 && (next$8 != null && typeof next$8 === 'object') && (next$8.__prev = prev$8);
                                prev$8 && (prev$8 != null && typeof prev$8 === 'object') && (prev$8.__next = next$8);
                                (next$8 = head$8) && (next$8 != null && typeof next$8 === 'object') && (head$8.__prev = context);
                                root.__head = root.__next = head$8 = context;
                                if (head$8 != null && typeof head$8 === 'object') {
                                    head$8.__next = next$8;
                                    head$8.__prev = void 0;
                                }
                            }
                            if (tail$8 == null || context === tail$8) {
                                root.__tail = root.__prev = tail$8 = prev$8 || context;
                            }
                        }
                    }
                    // If the context is a sentinel, get its value.
                    // Otherwise, set contextValue to the context.
                    contextValue = (contextType = context && context['$type']) === 'sentinel' ? context.value : context;
                }
                break setting_path;
            }
        if (contextType === 'error') {
            error = Array.isArray(pbv) ? [] : pbv != null && typeof pbv === 'object' ? {} : pbv;
            var val, dst;
            for (var key$2 in pbv) {
                if (pbv.hasOwnProperty(key$2)) {
                    val = dst = pbv[key$2];
                    if (Array.isArray(val)) {
                        var i$9 = -1,
                            n$8 = val.length;
                        dst = new Array(n$8);
                        while (++i$9 < n$8) {
                            dst[i$9] = val[i$9];
                        }
                    } else if (val != null && typeof val === 'object') {
                        dst = Object.create(val);
                    }
                    error[key$2] = dst;
                }
            }
            error.value = contextValue;
            errors[errors.length] = error;
        } else if (streaming === true && contextValue !== void 0 || materialized === true) {
            pbv.value = contextValue;
            var x;
            x = Array.isArray(pbv) ? [] : pbv != null && typeof pbv === 'object' ? {} : pbv;
            var val$2, dst$2;
            for (var key$3 in pbv) {
                if (pbv.hasOwnProperty(key$3)) {
                    val$2 = dst$2 = pbv[key$3];
                    if (Array.isArray(val$2)) {
                        var i$10 = -1,
                            n$9 = val$2.length;
                        dst$2 = new Array(n$9);
                        while (++i$10 < n$9) {
                            dst$2[i$10] = val$2[i$10];
                        }
                    } else if (val$2 != null && typeof val$2 === 'object') {
                        dst$2 = Object.create(val$2);
                    }
                    x[key$3] = dst$2;
                }
            }
            onNext(x);
        }
    }
    if (streaming === false) {
        onNext({
            paths: pbvs.map(function (x$2) {
                return x$2.path;
            }),
            value: boundContext
        });
    }
    if (errors.length === 0) {
        onCompleted();
    } else if (errors.length === 1) {
        onError(errors[0]);
    } else {
        onError({
            innerErrors: errors
        });
    }
    var max = self._maxSize,
        total = cache['$size'],
        targetSize = max * self._collectRatio,
        tail$9, parent$3, size$2, context$6, contextValue$3, contextType$3, i$11 = 0;
    if (total >= max && (root._pendingRequests == null || root._pendingRequests <= 0)) {
        while (total >= targetSize && (context$1463 = expired.pop()) != null) {
            i$11++;
            total -= size$2 = context$1463['$size'] || 0;
            do {
                parent$3 = context$1463.__parent;
                if ((context$1463['$size'] -= size$2) <= 0) {
                    var cRefs$3 = context$1463.__refsLength || 0,
                        idx$2 = -1,
                        ref$5;
                    while (++idx$2 < cRefs$3) {
                        if ((ref$5 = context$1463['__ref' + idx$2]) !== void 0) {
                            ref$5.__context = void 0;
                            context$1463['__ref' + idx$2] = void 0;
                        }
                    }
                    context$1463.__refsLength = void 0;
                    if (Array.isArray(contextValue$3 = (contextType$3 // If the context is a sentinel, get its value.
                        // Otherwise, set contextValue to the context.
                        = context$1463 && context$1463[ // If the context is a sentinel, get its value.
                        // Otherwise, set contextValue to the context.
                        '$type']) === 'sentinel' ? context$1463.value : context$1463)) {
                        var dest$3 = context$1463.__context;
                        if (dest$3 != null) {
                            var i$12 = (context$1463.__refIndex || 0) - 1,
                                n$10 = (dest$3.__refsLength || 0) - 1;
                            while (++i$12 <= n$10) {
                                dest$3['__ref' + i$12] = dest$3['__ref' + (i$12 + 1)];
                            }
                            dest$3.__refsLength = n$10;
                            context$1463.__refIndex = void 0;
                            context$1463.__context = null;
                        }
                    }
                    if (parent$3 !== void 0) {
                        parent$3[context$1463.__key] = context$1463.__parent = void 0;
                    }
                }
                context$1463 = parent$3;
            } while (context$1463 !== void 0);
        }
        if (expired.length <= 0) {
            tail$9 = root.__tail;
            while (total >= targetSize && (context$1463 = tail$9) != null) {
                i$11++;
                tail$9 = tail$9.__prev;
                total -= size$2 = context$1463['$size'] || 0;
                context$1463.__prev = context$1463.__next = void 0;
                do {
                    parent$3 = context$1463.__parent;
                    if ((context$1463['$size'] -= size$2) <= 0) {
                        var cRefs$4 = context$1463.__refsLength || 0,
                            idx$3 = -1,
                            ref$6;
                        while (++idx$3 < cRefs$4) {
                            if ((ref$6 = context$1463['__ref' + idx$3]) !== void 0) {
                                ref$6.__context = void 0;
                                context$1463['__ref' + idx$3] = void 0;
                            }
                        }
                        context$1463.__refsLength = void 0;
                        if (Array.isArray(contextValue$3 = (contextType$3 // If the context is a sentinel, get its value.
                            // Otherwise, set contextValue to the context.
                            = context$1463 && context$1463[ // If the context is a sentinel, get its value.
                            // Otherwise, set contextValue to the context.
                            '$type']) === 'sentinel' ? context$1463.value : context$1463)) {
                            var dest$4 = context$1463.__context;
                            if (dest$4 != null) {
                                var i$13 = (context$1463.__refIndex || 0) - 1,
                                    n$11 = (dest$4.__refsLength || 0) - 1;
                                while (++i$13 <= n$11) {
                                    dest$4['__ref' + i$13] = dest$4['__ref' + (i$13 + 1)];
                                }
                                dest$4.__refsLength = n$11;
                                context$1463.__refIndex = void 0;
                                context$1463.__context = null;
                            }
                        }
                        if (parent$3 !== void 0) {
                            parent$3[context$1463.__key] = context$1463.__parent = void 0;
                        }
                    }
                    context$1463 = parent$3;
                } while (context$1463 !== void 0);
            }
        }
        if ((root.__tail = root.__prev = tail$9) == null) {
            root.__head = root.__next = void 0;
        } else {
            tail$9.__next = void 0;
        }
    }
    return Disposable.empty;
}

function setPBF(pbf, onNext, onError, onCompleted, cache, parent, bound) {
    var self = this,
        root = self._root,
        generation = GENERATION_GENERATION++,
        connected, materialized, streaming, refreshing, contexts, messages, error, errors, observer, observers, expired, paths, path, key, column, offset, last, index, length, sizeOffset, boundOptimized, original, optimized, pbv, originalMiss, originalMisses, optimizedMiss, optimizedMisses, refs, cols, crossed, depth, batchedOptimizedPathMap, batchedPathMap, batchedPathMaps, contextCache, contextParent, context, contextValue, contextType, contextSize, contextExpires, contextTimestamp, boundContext, messageCache, messageParent, message, messageValue, messageType, messageSize, messageExpires, messageTimestamp;
    paths = pbf;
    connected = self._connected;
    materialized = self._materialized;
    streaming = self._streaming;
    refreshing = self._refreshing;
    path = bound || self._path;
    contexts = paths.contexts || (paths.contexts = []);
    messages = paths.messages || (paths.messages = []);
    batchedPathMaps = paths.batchedPathMaps || (paths.batchedPathMaps = []);
    originalMisses = paths.originalMisses || (paths.originalMisses = []);
    optimizedMisses = paths.optimizedMisses || (paths.optimizedMisses = []);
    errors = paths.errors || (paths.errors = []);
    refs = paths.refs || (paths.refs = []);
    crossed = paths.crossed || (paths.crossed = []);
    cols = paths.cols || (paths.cols = []);
    pbv = paths.pbv || (paths.pbv = {
        path: [],
        optimized: []
    });
    index = paths.index || (paths.index = 0);
    length = paths.length;
    batchedPathMap = paths.batchedPathMap;
    messageCache = paths.value;
    messageParent = messageCache;
    cache = cache || self._cache;
    bound = path;
    if (parent == null && (parent = self.__context) == null) {
        if (path.length > 0) {
            pbv = self._getContext();
            path = pbv.path;
            pbv.path = [];
            pbv.optimized = [];
            parent = pbv.value || {};
        } else {
            parent = cache;
        }
    }
    contextCache = cache;
    contextParent = parent;
    context = contextParent;
    contextValue = context;
    original = pbv.path;
    optimized = pbv.optimized;
    depth = -1;
    sizeOffset = 0;
    expired = self._expired || (self._expired = []);
    refs[-1] = path;
    cols[-1] = 0;
    crossed[-1] = boundOptimized = path;
    paths = pbf.paths || (pbf.paths = []);
    if (onNext || onError || onCompleted || batchedPathMap == null) {
        observer = {
            onNext: onNext || noop,
            onError: onError || noop,
            onCompleted: onCompleted || noop,
            originals: paths.concat(),
            optimized: paths.concat(),
            count: 0,
            path: [],
            errors: [],
            streaming: streaming,
            materialized: materialized
        };
        batchedPathMap = self._pathMapWithObserver(paths, observer, batchedPathMap);
    }
    index = pbf.index || (pbf.index = 0);
    length = paths.length;
    contexts[-1] = contextParent;
    messages[-1] = messageParent;
    batchedPathMaps[-1] = batchedPathMap;
    for (; index < length; paths.index = ++index) {
        path = paths[index];
        column = path.index || (path.index = 0);
        offset = path.offset || (path.offset = 0);
        last = path.length - 1;
        depth = -1;
        refs[-1] = path;
        crossed = [];
        crossed[-1] = boundOptimized;
        while (column >= 0) {
            var ref, i, n;
            while (--column >= -1) {
                if ((ref = crossed[column]) != null) {
                    i = -1;
                    n = ref.length;
                    optimized.length = n;
                    offset = n - (column + 1);
                    while (++i < n) {
                        optimized[i] = ref[i];
                    }
                    break;
                }
            }
            ++column;
            cols[depth = -1] = column;
            contextParent = contexts[column - 1];
            messageParent = messages[column - 1];
            batchedPathMap = batchedPathMaps[column - 1];
            setting_pbf:
                while (true) {
                    for (; column < last; ++column) {
                        key = path[column];
                        if (key != null && typeof key === 'object') {
                            if (Array.isArray(key)) {
                                key = key[key.index || (key.index = 0)];
                                if (key != null && typeof key === 'object') {
                                    key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                                }
                            } else {
                                key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                            }
                        }
                        if (key == null) {
                            continue;
                        }
                        original[original.length = column] = key;
                        optimized[optimized.length = column + offset] = key;
                        context = contextParent[key];
                        message = messageParent && messageParent[key];
                        batchedPathMap = batchedPathMap[key];
                        var sizeOffset$2 = 0;
                        if (message == null) {
                            messageValue = message;
                            messageSize = 0;
                            messageType = 'primitive';
                            messageTimestamp = void 0;
                            messageExpires = void 0;
                        } else if (!((messageExpires = message['$expires']) == null || messageExpires === 1 || messageExpires !== 0 && messageExpires > Date.now())) {
                            messageExpires = 0;
                            messageTimestamp = void 0;
                            if (message.__invalidated === void 0) {
                                message.__invalidated = true;
                                message['$expires'] = 0;
                                expired[expired.length] = message;
                                var head = root.__head,
                                    tail = root.__tail;
                                if (message != null && typeof message === 'object') {
                                    var next = message.__next,
                                        prev = message.__prev;
                                    next && (next.__prev = prev);
                                    prev && (prev.__next = next);
                                    message === head && (root.__head = root.__next = head = next);
                                    message === tail && (root.__tail = root.__prev = tail = prev);
                                    message.__next = message.__prev = void 0;
                                }
                            }
                        } else {
                            messageExpires = message['$expires'];
                            messageTimestamp = message['$timestamp'];
                            messageValue = ( // If the context is a sentinel, get its value.
                                // Otherwise, set contextValue to the context.
                                messageType = message && message['$type']) === 'sentinel' ? message.value : message;
                            if (Array.isArray(messageValue)) {
                                if ((messageSize = message['$size']) == null) {
                                    messageSize = (messageType === 'sentinel' && 50 || 0) + messageValue.length;
                                }
                                messageType = 'array';
                            } else if (messageType === 'sentinel') {
                                if ((messageSize = message['$size']) == null) {
                                    messageSize = 50 + (typeof messageValue === 'string' && messageValue.length || 1);
                                }
                            } else if (message == null || typeof message !== 'object') {
                                messageSize = typeof messageValue === 'string' ? messageValue.length : 1;
                                messageType = 'primitive';
                            } else {
                                messageSize = message['$size'] || 0;
                                messageType = messageType || void 0;
                            }
                        }
                        if (context == null || context !== message && messageType === 'array') {
                            if (context === message) {
                                contextValue = messageValue;
                                contextSize = messageSize;
                                contextType = messageType;
                                contextTimestamp = messageTimestamp;
                                contextExpires = messageExpires;
                            } else {
                                if (context == null) {
                                    contextValue = context;
                                    contextSize = 0;
                                    contextType = 'primitive';
                                    contextTimestamp = void 0;
                                    contextExpires = void 0;
                                } else if (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now())) {
                                    contextExpires = 0;
                                    contextTimestamp = void 0;
                                    if (context.__invalidated === void 0) {
                                        context.__invalidated = true;
                                        context['$expires'] = 0;
                                        expired[expired.length] = context;
                                        var head$2 = root.__head,
                                            tail$2 = root.__tail;
                                        if (context != null && typeof context === 'object') {
                                            var next$2 = context.__next,
                                                prev$2 = context.__prev;
                                            next$2 && (next$2.__prev = prev$2);
                                            prev$2 && (prev$2.__next = next$2);
                                            context === head$2 && (root.__head = root.__next = head$2 = next$2);
                                            context === tail$2 && (root.__tail = root.__prev = tail$2 = prev$2);
                                            context.__next = context.__prev = void 0;
                                        }
                                    }
                                } else {
                                    contextExpires = context['$expires'];
                                    contextTimestamp = context['$timestamp'];
                                    contextValue = ( // If the context is a sentinel, get its value.
                                        // Otherwise, set contextValue to the context.
                                        contextType = context && context['$type']) === 'sentinel' ? context.value : context;
                                    if (Array.isArray(contextValue)) {
                                        if ((contextSize = context['$size']) == null) {
                                            contextSize = (contextType === 'sentinel' && 50 || 0) + contextValue.length;
                                        }
                                        contextType = 'array';
                                    } else if (contextType === 'sentinel') {
                                        if ((contextSize = context['$size']) == null) {
                                            contextSize = 50 + (typeof contextValue === 'string' && contextValue.length || 1);
                                        }
                                    } else if (context == null || typeof context !== 'object') {
                                        contextSize = typeof contextValue === 'string' ? contextValue.length : 1;
                                        contextType = 'primitive';
                                    } else {
                                        contextSize = context['$size'] || 0;
                                        contextType = contextType || void 0;
                                    }
                                }
                            }
                            inserting:
                                while ((messageTimestamp < // Return `true` if the message is newer than the
                                    // context and the message isn't set to expire now.
                                    // Return `false` if the message is older, or if it
                                    // expires now.
                                    //
                                    // If the message is newer than the cache but it's set
                                    // to expire now, set the context variable to the message
                                    // so we'll onNext the message, but leave the cache alone.
                                    contextTimestamp || messageExpires === 0 && ((context = message) || true)) === false) {
                                    if (messageType !== void 0) {
                                        if (messageType === 'array') {
                                            message['$type'] = messageType = message['$type'] || 'leaf';
                                            messageValue.__container = message;
                                            message['$size'] = messageSize;
                                            if (contextType === 'array') {
                                                var i$2 = -1,
                                                    n$2; // compare the cache and message references.
                                                // if they're the same, break early so we don't insert.
                                                // if they're different, replace the cache reference.
                                                if (( // compare the cache and message references.
                                                    // if they're the same, break early so we don't insert.
                                                    // if they're different, replace the cache reference.
                                                    // If the reference lengths are equal, we have to check their keys
                                                    // for equality.
                                                    // If their lengths aren't the equal, the references aren't equal.
                                                    // Insert the reference from the message.
                                                    n$2 = contextValue.length) === messageValue.length) {
                                                    checking_refs: while (++i$2 < n$2) {
                                                        if (contextValue[ // If any of their keys are different, replace the reference
                                                            // in the cache with the reference in the message.
                                                            i$2] !== messageValue[i$2]) {
                                                            break checking_refs;
                                                        }
                                                    }
                                                    if (i$2 === n$2) {
                                                        break inserting;
                                                    }
                                                }
                                            }
                                        } else {
                                            if (messageType === 'primitive') {
                                                messageType = 'sentinel';
                                                messageSize = 50 + (messageSize || 1);
                                                message = {
                                                    '$size': messageSize,
                                                    '$type': messageType,
                                                    'value': messageValue
                                                };
                                            } else {
                                                message['$size'] = messageSize;
                                                message['$type'] = messageType = messageType || 'leaf';
                                            }
                                            var head$3 = root.__head,
                                                tail$3 = root.__tail;
                                            if (message && message['$expires'] !== 1) {
                                                var next$3 = message.__next,
                                                    prev$3 = message.__prev;
                                                if (message !== head$3) {
                                                    next$3 && (next$3 != null && typeof next$3 === 'object') && (next$3.__prev = prev$3);
                                                    prev$3 && (prev$3 != null && typeof prev$3 === 'object') && (prev$3.__next = next$3);
                                                    (next$3 = head$3) && (next$3 != null && typeof next$3 === 'object') && (head$3.__prev = message);
                                                    root.__head = root.__next = head$3 = message;
                                                    if (head$3 != null && typeof head$3 === 'object') {
                                                        head$3.__next = next$3;
                                                        head$3.__prev = void 0;
                                                    }
                                                }
                                                if (tail$3 == null || message === tail$3) {
                                                    root.__tail = root.__prev = tail$3 = prev$3 || message;
                                                }
                                            }
                                        }
                                    }
                                    if (context != // Before we overwrite the cache value, migrate the
                                        // back-references from the context to the message and
                                        // remove the context's hard-link.
                                        null) {
                                        if (contextType === 'array') {
                                            var dest = context.__context;
                                            if (dest != null) {
                                                var i$3 = (context.__refIndex || 0) - 1,
                                                    n$3 = (dest.__refsLength || 0) - 1;
                                                while (++i$3 <= n$3) {
                                                    dest['__ref' + i$3] = dest['__ref' + (i$3 + 1)];
                                                }
                                                dest.__refsLength = n$3;
                                                context.__refIndex = void 0;
                                                context.__context = null;
                                            }
                                        }
                                        if (context.__refsLength) {
                                            var cRefs = context.__refsLength || 0,
                                                mRefs = message.__refsLength || 0,
                                                i$4 = -1,
                                                ref$2;
                                            while (++i$4 < cRefs) {
                                                if ((ref$2 = context['__ref' + i$4]) !== void 0) {
                                                    ref$2.__context = message;
                                                    message['__ref' + (mRefs + i$4)] = ref$2;
                                                    context['__ref' + i$4] = void 0;
                                                }
                                            }
                                            message.__refsLength = mRefs + cRefs;
                                            context.__refsLength = void 0;
                                        }
                                        var head$4 = root.__head,
                                            tail$4 = root.__tail;
                                        if (context != null && typeof context === 'object') {
                                            var next$4 = context.__next,
                                                prev$4 = context.__prev;
                                            next$4 && (next$4.__prev = prev$4);
                                            prev$4 && (prev$4.__next = next$4);
                                            context === head$4 && (root.__head = root.__next = head$4 = next$4);
                                            context === tail$4 && (root.__tail = root.__prev = tail$4 = prev$4);
                                            context.__next = context.__prev = void 0;
                                        }
                                    }
                                    sizeOffset$2 = messageSize - contextSize;
                                    message['$size'] = messageSize - sizeOffset$2;
                                    if (context && // Put the message in the cache and migrate generation if needed.
                                        message && !context.__generation !== void 0 && (message.__generation === void 0 || context.__generation > message.__generation)) {
                                        message.__generation = context.__generation;
                                    }
                                    contextParent[key] = context = message;
                                    break inserting;
                                }
                        }
                        context.__parent = contextParent;
                        context.__key = key;
                        if (sizeOffset$2 !== 0) {
                            var parent$2, size, context$2 = context,
                                contextValue$2, contextType$2;
                            while (context$1171 !== void 0) {
                                context$1171['$size'] = size = (context$1171['$size'] || 0) + sizeOffset$2;
                                if (context$1171.__genUpdated !== generation) {
                                    var context$3 = context$1171,
                                        stack = [],
                                        depth$2 = 0,
                                        references, ref$3, i$5, k, n$4;
                                    while (depth$2 >= 0) {
                                        if ((references = stack[depth$2]) === void 0) {
                                            i$5 = k = -1;
                                            n$4 = context$1171.__refsLength || 0;
                                            stack[depth$2] = references = [];
                                            context$1171.__genUpdated = generation;
                                            context$1171.__generation = (context$1171.__generation || 0) + 1;
                                            if ((ref$3 = context$1171.__parent) !== void 0 && ref$3.__genUpdated !== generation) {
                                                references[++k] = ref$3;
                                            }
                                            while (++i$5 < n$4) {
                                                if ((ref$3 = context$1171['__ref' + i$5]) !== void 0 && ref$3.__genUpdated !== generation) {
                                                    references[++k] = ref$3;
                                                }
                                            }
                                        }
                                        if ((context$1171 = references.pop()) !== void 0) {
                                            ++depth$2;
                                        } else {
                                            stack[depth$2--] = void 0;
                                        }
                                    }
                                }
                                if (( // If this node's size drops to zero or below, add it to the
                                    // expired list and remove it from the cache.
                                    parent$2 = context$1171.__parent) !== void 0 && size <= 0) {
                                    var cRefs$2 = context$1171.__refsLength || 0,
                                        idx = -1,
                                        ref$4;
                                    while (++idx < cRefs$2) {
                                        if ((ref$4 = context$1171['__ref' + idx]) !== void 0) {
                                            ref$4.__context = void 0;
                                            context$1171['__ref' + idx] = void 0;
                                        }
                                    }
                                    context$1171.__refsLength = void 0;
                                    if (Array.isArray(contextValue$2 = (contextType$2 // If the context is a sentinel, get its value.
                                        // Otherwise, set contextValue to the context.
                                        = context$1171 && context$1171[ // If the context is a sentinel, get its value.
                                        // Otherwise, set contextValue to the context.
                                        '$type']) === 'sentinel' ? context$1171.value : context$1171)) {
                                        var dest$2 = context$1171.__context;
                                        if (dest$2 != null) {
                                            var i$6 = (context$1171.__refIndex || 0) - 1,
                                                n$5 = (dest$2.__refsLength || 0) - 1;
                                            while (++i$6 <= n$5) {
                                                dest$2['__ref' + i$6] = dest$2['__ref' + (i$6 + 1)];
                                            }
                                            dest$2.__refsLength = n$5;
                                            context$1171.__refIndex = void 0;
                                            context$1171.__context = null;
                                        }
                                    }
                                    parent$2[context$1171.__key] = context$1171.__parent = void 0;
                                    var head$5 = root.__head,
                                        tail$5 = root.__tail;
                                    if (context$1171 != null && typeof context$1171 === 'object') {
                                        var next$5 = context$1171.__next,
                                            prev$5 = context$1171.__prev;
                                        next$5 && (next$5.__prev = prev$5);
                                        prev$5 && (prev$5.__next = next$5);
                                        context$1171 === head$5 && (root.__head = root.__next = head$5 = next$5);
                                        context$1171 === tail$5 && (root.__tail = root.__prev = tail$5 = prev$5);
                                        context$1171.__next = context$1171.__prev = void 0;
                                    }
                                }
                                context$1171 = parent$2;
                            }
                        }
                        while ( // TODO: replace this with a faster Array check.
                            Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                                // Otherwise, set contextValue to the context.
                                = context && context[ // If the context is a sentinel, get its value.
                                // Otherwise, set contextValue to the context.
                                '$type']) === 'sentinel' ? context.value : context)) {
                            var head$6 = root.__head,
                                tail$6 = root.__tail;
                            if (context && context['$expires'] !== 1) {
                                var next$6 = context.__next,
                                    prev$6 = context.__prev;
                                if (context !== head$6) {
                                    next$6 && (next$6 != null && typeof next$6 === 'object') && (next$6.__prev = prev$6);
                                    prev$6 && (prev$6 != null && typeof prev$6 === 'object') && (prev$6.__next = next$6);
                                    (next$6 = head$6) && (next$6 != null && typeof next$6 === 'object') && (head$6.__prev = context);
                                    root.__head = root.__next = head$6 = context;
                                    if (head$6 != null && typeof head$6 === 'object') {
                                        head$6.__next = next$6;
                                        head$6.__prev = void 0;
                                    }
                                }
                                if (tail$6 == null || context === tail$6) {
                                    root.__tail = root.__prev = tail$6 = prev$6 || context;
                                }
                            }
                            crossed[column] = contextValue;
                            contextParent = contextCache;
                            messageParent = messageCache;
                            refs[depth] = path;
                            cols[depth++] = column;
                            path = contextValue;
                            last = path.length - 1;
                            offset = 0;
                            column = 0;
                            expanding:
                                while (true) {
                                    for (; column < last; ++column) {
                                        key = path[column];
                                        if (key == null) {
                                            continue;
                                        }
                                        optimized[optimized.length = column + offset] = key;
                                        context = contextParent[key];
                                        message = messageParent && messageParent[key];
                                        var sizeOffset$3 = 0;
                                        if (message == null) {
                                            messageValue = message;
                                            messageSize = 0;
                                            messageType = 'primitive';
                                            messageTimestamp = void 0;
                                            messageExpires = void 0;
                                        } else if (!((messageExpires = message['$expires']) == null || messageExpires === 1 || messageExpires !== 0 && messageExpires > Date.now())) {
                                            messageExpires = 0;
                                            messageTimestamp = void 0;
                                            if (message.__invalidated === void 0) {
                                                message.__invalidated = true;
                                                message['$expires'] = 0;
                                                expired[expired.length] = message;
                                                var head$7 = root.__head,
                                                    tail$7 = root.__tail;
                                                if (message != null && typeof message === 'object') {
                                                    var next$7 = message.__next,
                                                        prev$7 = message.__prev;
                                                    next$7 && (next$7.__prev = prev$7);
                                                    prev$7 && (prev$7.__next = next$7);
                                                    message === head$7 && (root.__head = root.__next = head$7 = next$7);
                                                    message === tail$7 && (root.__tail = root.__prev = tail$7 = prev$7);
                                                    message.__next = message.__prev = void 0;
                                                }
                                            }
                                        } else {
                                            messageExpires = message['$expires'];
                                            messageTimestamp = message['$timestamp'];
                                            messageValue = ( // If the context is a sentinel, get its value.
                                                // Otherwise, set contextValue to the context.
                                                messageType = message && message['$type']) === 'sentinel' ? message.value : message;
                                            if (Array.isArray(messageValue)) {
                                                if ((messageSize = message['$size']) == null) {
                                                    messageSize = (messageType === 'sentinel' && 50 || 0) + messageValue.length;
                                                }
                                                messageType = 'array';
                                            } else if (messageType === 'sentinel') {
                                                if ((messageSize = message['$size']) == null) {
                                                    messageSize = 50 + (typeof messageValue === 'string' && messageValue.length || 1);
                                                }
                                            } else if (message == null || typeof message !== 'object') {
                                                messageSize = typeof messageValue === 'string' ? messageValue.length : 1;
                                                messageType = 'primitive';
                                            } else {
                                                messageSize = message['$size'] || 0;
                                                messageType = messageType || void 0;
                                            }
                                        }
                                        if (context == null || context !== message && messageType === 'array') {
                                            if (context === message) {
                                                contextValue = messageValue;
                                                contextSize = messageSize;
                                                contextType = messageType;
                                                contextTimestamp = messageTimestamp;
                                                contextExpires = messageExpires;
                                            } else {
                                                if (context == null) {
                                                    contextValue = context;
                                                    contextSize = 0;
                                                    contextType = 'primitive';
                                                    contextTimestamp = void 0;
                                                    contextExpires = void 0;
                                                } else if (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now())) {
                                                    contextExpires = 0;
                                                    contextTimestamp = void 0;
                                                    if (context.__invalidated === void 0) {
                                                        context.__invalidated = true;
                                                        context['$expires'] = 0;
                                                        expired[expired.length] = context;
                                                        var head$8 = root.__head,
                                                            tail$8 = root.__tail;
                                                        if (context != null && typeof context === 'object') {
                                                            var next$8 = context.__next,
                                                                prev$8 = context.__prev;
                                                            next$8 && (next$8.__prev = prev$8);
                                                            prev$8 && (prev$8.__next = next$8);
                                                            context === head$8 && (root.__head = root.__next = head$8 = next$8);
                                                            context === tail$8 && (root.__tail = root.__prev = tail$8 = prev$8);
                                                            context.__next = context.__prev = void 0;
                                                        }
                                                    }
                                                } else {
                                                    contextExpires = context['$expires'];
                                                    contextTimestamp = context['$timestamp'];
                                                    contextValue = ( // If the context is a sentinel, get its value.
                                                        // Otherwise, set contextValue to the context.
                                                        contextType = context && context['$type']) === 'sentinel' ? context.value : context;
                                                    if (Array.isArray(contextValue)) {
                                                        if ((contextSize = context['$size']) == null) {
                                                            contextSize = (contextType === 'sentinel' && 50 || 0) + contextValue.length;
                                                        }
                                                        contextType = 'array';
                                                    } else if (contextType === 'sentinel') {
                                                        if ((contextSize = context['$size']) == null) {
                                                            contextSize = 50 + (typeof contextValue === 'string' && contextValue.length || 1);
                                                        }
                                                    } else if (context == null || typeof context !== 'object') {
                                                        contextSize = typeof contextValue === 'string' ? contextValue.length : 1;
                                                        contextType = 'primitive';
                                                    } else {
                                                        contextSize = context['$size'] || 0;
                                                        contextType = contextType || void 0;
                                                    }
                                                }
                                            }
                                            inserting:
                                                while ((messageTimestamp < // Return `true` if the message is newer than the
                                                    // context and the message isn't set to expire now.
                                                    // Return `false` if the message is older, or if it
                                                    // expires now.
                                                    //
                                                    // If the message is newer than the cache but it's set
                                                    // to expire now, set the context variable to the message
                                                    // so we'll onNext the message, but leave the cache alone.
                                                    contextTimestamp || messageExpires === 0 && ((context = message) || true)) === false) {
                                                    if (messageType !== void 0) {
                                                        if (messageType === 'array') {
                                                            message['$type'] = messageType = message['$type'] || 'leaf';
                                                            messageValue.__container = message;
                                                            message['$size'] = messageSize;
                                                            if (contextType === 'array') {
                                                                var i$7 = -1,
                                                                    n$6; // compare the cache and message references.
                                                                // if they're the same, break early so we don't insert.
                                                                // if they're different, replace the cache reference.
                                                                if (( // compare the cache and message references.
                                                                    // if they're the same, break early so we don't insert.
                                                                    // if they're different, replace the cache reference.
                                                                    // If the reference lengths are equal, we have to check their keys
                                                                    // for equality.
                                                                    // If their lengths aren't the equal, the references aren't equal.
                                                                    // Insert the reference from the message.
                                                                    n$6 = contextValue.length) === messageValue.length) {
                                                                    checking_refs: while (++i$7 < n$6) {
                                                                        if (contextValue[ // If any of their keys are different, replace the reference
                                                                            // in the cache with the reference in the message.
                                                                            i$7] !== messageValue[i$7]) {
                                                                            break checking_refs;
                                                                        }
                                                                    }
                                                                    if (i$7 === n$6) {
                                                                        break inserting;
                                                                    }
                                                                }
                                                            }
                                                        } else {
                                                            if (messageType === 'primitive') {
                                                                messageType = 'sentinel';
                                                                messageSize = 50 + (messageSize || 1);
                                                                message = {
                                                                    '$size': messageSize,
                                                                    '$type': messageType,
                                                                    'value': messageValue
                                                                };
                                                            } else {
                                                                message['$size'] = messageSize;
                                                                message['$type'] = messageType = messageType || 'leaf';
                                                            }
                                                            var head$9 = root.__head,
                                                                tail$9 = root.__tail;
                                                            if (message && message['$expires'] !== 1) {
                                                                var next$9 = message.__next,
                                                                    prev$9 = message.__prev;
                                                                if (message !== head$9) {
                                                                    next$9 && (next$9 != null && typeof next$9 === 'object') && (next$9.__prev = prev$9);
                                                                    prev$9 && (prev$9 != null && typeof prev$9 === 'object') && (prev$9.__next = next$9);
                                                                    (next$9 = head$9) && (next$9 != null && typeof next$9 === 'object') && (head$9.__prev = message);
                                                                    root.__head = root.__next = head$9 = message;
                                                                    if (head$9 != null && typeof head$9 === 'object') {
                                                                        head$9.__next = next$9;
                                                                        head$9.__prev = void 0;
                                                                    }
                                                                }
                                                                if (tail$9 == null || message === tail$9) {
                                                                    root.__tail = root.__prev = tail$9 = prev$9 || message;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    if (context != // Before we overwrite the cache value, migrate the
                                                        // back-references from the context to the message and
                                                        // remove the context's hard-link.
                                                        null) {
                                                        if (contextType === 'array') {
                                                            var dest$3 = context.__context;
                                                            if (dest$3 != null) {
                                                                var i$8 = (context.__refIndex || 0) - 1,
                                                                    n$7 = (dest$3.__refsLength || 0) - 1;
                                                                while (++i$8 <= n$7) {
                                                                    dest$3['__ref' + i$8] = dest$3['__ref' + (i$8 + 1)];
                                                                }
                                                                dest$3.__refsLength = n$7;
                                                                context.__refIndex = void 0;
                                                                context.__context = null;
                                                            }
                                                        }
                                                        if (context.__refsLength) {
                                                            var cRefs$3 = context.__refsLength || 0,
                                                                mRefs$2 = message.__refsLength || 0,
                                                                i$9 = -1,
                                                                ref$5;
                                                            while (++i$9 < cRefs$3) {
                                                                if ((ref$5 = context['__ref' + i$9]) !== void 0) {
                                                                    ref$5.__context = message;
                                                                    message['__ref' + (mRefs$2 + i$9)] = ref$5;
                                                                    context['__ref' + i$9] = void 0;
                                                                }
                                                            }
                                                            message.__refsLength = mRefs$2 + cRefs$3;
                                                            context.__refsLength = void 0;
                                                        }
                                                        var head$10 = root.__head,
                                                            tail$10 = root.__tail;
                                                        if (context != null && typeof context === 'object') {
                                                            var next$10 = context.__next,
                                                                prev$10 = context.__prev;
                                                            next$10 && (next$10.__prev = prev$10);
                                                            prev$10 && (prev$10.__next = next$10);
                                                            context === head$10 && (root.__head = root.__next = head$10 = next$10);
                                                            context === tail$10 && (root.__tail = root.__prev = tail$10 = prev$10);
                                                            context.__next = context.__prev = void 0;
                                                        }
                                                    }
                                                    sizeOffset$3 = messageSize - contextSize;
                                                    message['$size'] = messageSize - sizeOffset$3;
                                                    if (context && // Put the message in the cache and migrate generation if needed.
                                                        message && !context.__generation !== void 0 && (message.__generation === void 0 || context.__generation > message.__generation)) {
                                                        message.__generation = context.__generation;
                                                    }
                                                    contextParent[key] = context = message;
                                                    break inserting;
                                                }
                                        }
                                        context.__parent = contextParent;
                                        context.__key = key;
                                        if (sizeOffset$3 !== 0) {
                                            var parent$3, size$2, context$4 = context,
                                                contextValue$3, contextType$3;
                                            while (context$1171 !== void 0) {
                                                context$1171['$size'] = size$2 = (context$1171['$size'] || 0) + sizeOffset$3;
                                                if (context$1171.__genUpdated !== generation) {
                                                    var context$5 = context$1171,
                                                        stack$2 = [],
                                                        depth$3 = 0,
                                                        references$2, ref$6, i$10, k$2, n$8;
                                                    while (depth$3 >= 0) {
                                                        if ((references$2 = stack$2[depth$3]) === void 0) {
                                                            i$10 = k$2 = -1;
                                                            n$8 = context$1171.__refsLength || 0;
                                                            stack$2[depth$3] = references$2 = [];
                                                            context$1171.__genUpdated = generation;
                                                            context$1171.__generation = (context$1171.__generation || 0) + 1;
                                                            if ((ref$6 = context$1171.__parent) !== void 0 && ref$6.__genUpdated !== generation) {
                                                                references$2[++k$2] = ref$6;
                                                            }
                                                            while (++i$10 < n$8) {
                                                                if ((ref$6 = context$1171['__ref' + i$10]) !== void 0 && ref$6.__genUpdated !== generation) {
                                                                    references$2[++k$2] = ref$6;
                                                                }
                                                            }
                                                        }
                                                        if ((context$1171 = references$2.pop()) !== void 0) {
                                                            ++depth$3;
                                                        } else {
                                                            stack$2[depth$3--] = void 0;
                                                        }
                                                    }
                                                }
                                                if (( // If this node's size drops to zero or below, add it to the
                                                    // expired list and remove it from the cache.
                                                    parent$3 = context$1171.__parent) !== void 0 && size$2 <= 0) {
                                                    var cRefs$4 = context$1171.__refsLength || 0,
                                                        idx$2 = -1,
                                                        ref$7;
                                                    while (++idx$2 < cRefs$4) {
                                                        if ((ref$7 = context$1171['__ref' + idx$2]) !== void 0) {
                                                            ref$7.__context = void 0;
                                                            context$1171['__ref' + idx$2] = void 0;
                                                        }
                                                    }
                                                    context$1171.__refsLength = void 0;
                                                    if (Array.isArray(contextValue$3 = (contextType$3 // If the context is a sentinel, get its value.
                                                        // Otherwise, set contextValue to the context.
                                                        = context$1171 && context$1171[ // If the context is a sentinel, get its value.
                                                        // Otherwise, set contextValue to the context.
                                                        '$type']) === 'sentinel' ? context$1171.value : context$1171)) {
                                                        var dest$4 = context$1171.__context;
                                                        if (dest$4 != null) {
                                                            var i$11 = (context$1171.__refIndex || 0) - 1,
                                                                n$9 = (dest$4.__refsLength || 0) - 1;
                                                            while (++i$11 <= n$9) {
                                                                dest$4['__ref' + i$11] = dest$4['__ref' + (i$11 + 1)];
                                                            }
                                                            dest$4.__refsLength = n$9;
                                                            context$1171.__refIndex = void 0;
                                                            context$1171.__context = null;
                                                        }
                                                    }
                                                    parent$3[context$1171.__key] = context$1171.__parent = void 0;
                                                    var head$11 = root.__head,
                                                        tail$11 = root.__tail;
                                                    if (context$1171 != null && typeof context$1171 === 'object') {
                                                        var next$11 = context$1171.__next,
                                                            prev$11 = context$1171.__prev;
                                                        next$11 && (next$11.__prev = prev$11);
                                                        prev$11 && (prev$11.__next = next$11);
                                                        context$1171 === head$11 && (root.__head = root.__next = head$11 = next$11);
                                                        context$1171 === tail$11 && (root.__tail = root.__prev = tail$11 = prev$11);
                                                        context$1171.__next = context$1171.__prev = void 0;
                                                    }
                                                }
                                                context$1171 = parent$3;
                                            }
                                        }
                                        while ( // TODO: replace this with a faster Array check.
                                            Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                                                // Otherwise, set contextValue to the context.
                                                = context && context[ // If the context is a sentinel, get its value.
                                                // Otherwise, set contextValue to the context.
                                                '$type']) === 'sentinel' ? context.value : context)) {
                                            var head$12 = root.__head,
                                                tail$12 = root.__tail;
                                            if (context && context['$expires'] !== 1) {
                                                var next$12 = context.__next,
                                                    prev$12 = context.__prev;
                                                if (context !== head$12) {
                                                    next$12 && (next$12 != null && typeof next$12 === 'object') && (next$12.__prev = prev$12);
                                                    prev$12 && (prev$12 != null && typeof prev$12 === 'object') && (prev$12.__next = next$12);
                                                    (next$12 = head$12) && (next$12 != null && typeof next$12 === 'object') && (head$12.__prev = context);
                                                    root.__head = root.__next = head$12 = context;
                                                    if (head$12 != null && typeof head$12 === 'object') {
                                                        head$12.__next = next$12;
                                                        head$12.__prev = void 0;
                                                    }
                                                }
                                                if (tail$12 == null || context === tail$12) {
                                                    root.__tail = root.__prev = tail$12 = prev$12 || context;
                                                }
                                            }
                                            contextParent = contextCache;
                                            messageParent = messageCache;
                                            refs[depth] = path;
                                            cols[depth++] = column;
                                            path = contextValue;
                                            last = path.length - 1;
                                            offset = 0;
                                            column = 0;
                                            continue expanding;
                                        }
                                        if (context == null || contextType !== void 0) {
                                            optimized.length = column + offset + 1;
                                            // If we short-circuited while following a reference, set
                                            // the column, path, and last variables to the path we were
                                            // following before we started following the broken reference.
                                            // Use this path to build the missing path from the optimized
                                            // path.
                                            column = cols[--depth];
                                            offset = last - column - 1;
                                            path = refs[depth];
                                            last = path.length - 1;
                                            // Append null to the original path so someone can
                                            // call `get` with the path and request beyond the
                                            // reference.
                                            original[original.length] = null;
                                            break setting_pbf;
                                        }
                                        contextParent = context;
                                        messageParent = message;
                                    }
                                    if (column === last) {
                                        key = path[column];
                                        if (key != null) {
                                            optimized[optimized.length = column + offset] = key;
                                            context = contextParent[key];
                                            message = messageParent && messageParent[key];
                                            var sizeOffset$4 = 0;
                                            if (message == null) {
                                                messageValue = message;
                                                messageSize = 0;
                                                messageType = 'primitive';
                                                messageTimestamp = void 0;
                                                messageExpires = void 0;
                                            } else if (!((messageExpires = message['$expires']) == null || messageExpires === 1 || messageExpires !== 0 && messageExpires > Date.now())) {
                                                messageExpires = 0;
                                                messageTimestamp = void 0;
                                                if (message.__invalidated === void 0) {
                                                    message.__invalidated = true;
                                                    message['$expires'] = 0;
                                                    expired[expired.length] = message;
                                                    var head$13 = root.__head,
                                                        tail$13 = root.__tail;
                                                    if (message != null && typeof message === 'object') {
                                                        var next$13 = message.__next,
                                                            prev$13 = message.__prev;
                                                        next$13 && (next$13.__prev = prev$13);
                                                        prev$13 && (prev$13.__next = next$13);
                                                        message === head$13 && (root.__head = root.__next = head$13 = next$13);
                                                        message === tail$13 && (root.__tail = root.__prev = tail$13 = prev$13);
                                                        message.__next = message.__prev = void 0;
                                                    }
                                                }
                                            } else {
                                                messageExpires = message['$expires'];
                                                messageTimestamp = message['$timestamp'];
                                                messageValue = ( // If the context is a sentinel, get its value.
                                                    // Otherwise, set contextValue to the context.
                                                    messageType = message && message['$type']) === 'sentinel' ? message.value : message;
                                                if (Array.isArray(messageValue)) {
                                                    if ((messageSize = message['$size']) == null) {
                                                        messageSize = (messageType === 'sentinel' && 50 || 0) + messageValue.length;
                                                    }
                                                    messageType = 'array';
                                                } else if (messageType === 'sentinel') {
                                                    if ((messageSize = message['$size']) == null) {
                                                        messageSize = 50 + (typeof messageValue === 'string' && messageValue.length || 1);
                                                    }
                                                } else if (message == null || typeof message !== 'object') {
                                                    messageSize = typeof messageValue === 'string' ? messageValue.length : 1;
                                                    messageType = 'primitive';
                                                } else {
                                                    messageSize = message['$size'] || 0;
                                                    messageType = messageType || void 0;
                                                }
                                            }
                                            if (context == null || context !== message && messageType === 'array') {
                                                if (context === message) {
                                                    contextValue = messageValue;
                                                    contextSize = messageSize;
                                                    contextType = messageType;
                                                    contextTimestamp = messageTimestamp;
                                                    contextExpires = messageExpires;
                                                } else {
                                                    if (context == null) {
                                                        contextValue = context;
                                                        contextSize = 0;
                                                        contextType = 'primitive';
                                                        contextTimestamp = void 0;
                                                        contextExpires = void 0;
                                                    } else if (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now())) {
                                                        contextExpires = 0;
                                                        contextTimestamp = void 0;
                                                        if (context.__invalidated === void 0) {
                                                            context.__invalidated = true;
                                                            context['$expires'] = 0;
                                                            expired[expired.length] = context;
                                                            var head$14 = root.__head,
                                                                tail$14 = root.__tail;
                                                            if (context != null && typeof context === 'object') {
                                                                var next$14 = context.__next,
                                                                    prev$14 = context.__prev;
                                                                next$14 && (next$14.__prev = prev$14);
                                                                prev$14 && (prev$14.__next = next$14);
                                                                context === head$14 && (root.__head = root.__next = head$14 = next$14);
                                                                context === tail$14 && (root.__tail = root.__prev = tail$14 = prev$14);
                                                                context.__next = context.__prev = void 0;
                                                            }
                                                        }
                                                    } else {
                                                        contextExpires = context['$expires'];
                                                        contextTimestamp = context['$timestamp'];
                                                        contextValue = ( // If the context is a sentinel, get its value.
                                                            // Otherwise, set contextValue to the context.
                                                            contextType = context && context['$type']) === 'sentinel' ? context.value : context;
                                                        if (Array.isArray(contextValue)) {
                                                            if ((contextSize = context['$size']) == null) {
                                                                contextSize = (contextType === 'sentinel' && 50 || 0) + contextValue.length;
                                                            }
                                                            contextType = 'array';
                                                        } else if (contextType === 'sentinel') {
                                                            if ((contextSize = context['$size']) == null) {
                                                                contextSize = 50 + (typeof contextValue === 'string' && contextValue.length || 1);
                                                            }
                                                        } else if (context == null || typeof context !== 'object') {
                                                            contextSize = typeof contextValue === 'string' ? contextValue.length : 1;
                                                            contextType = 'primitive';
                                                        } else {
                                                            contextSize = context['$size'] || 0;
                                                            contextType = contextType || void 0;
                                                        }
                                                    }
                                                }
                                                inserting:
                                                    while ((messageTimestamp < // Return `true` if the message is newer than the
                                                        // context and the message isn't set to expire now.
                                                        // Return `false` if the message is older, or if it
                                                        // expires now.
                                                        //
                                                        // If the message is newer than the cache but it's set
                                                        // to expire now, set the context variable to the message
                                                        // so we'll onNext the message, but leave the cache alone.
                                                        contextTimestamp || messageExpires === 0 && ((context = message) || true)) === false) {
                                                        if (messageType !== void 0) {
                                                            if (messageType === 'array') {
                                                                message['$type'] = messageType = message['$type'] || 'leaf';
                                                                messageValue.__container = message;
                                                                message['$size'] = messageSize;
                                                                if (contextType === 'array') {
                                                                    var i$12 = -1,
                                                                        n$10; // compare the cache and message references.
                                                                    // if they're the same, break early so we don't insert.
                                                                    // if they're different, replace the cache reference.
                                                                    if (( // compare the cache and message references.
                                                                        // if they're the same, break early so we don't insert.
                                                                        // if they're different, replace the cache reference.
                                                                        // If the reference lengths are equal, we have to check their keys
                                                                        // for equality.
                                                                        // If their lengths aren't the equal, the references aren't equal.
                                                                        // Insert the reference from the message.
                                                                        n$10 = contextValue.length) === messageValue.length) {
                                                                        checking_refs: while (++i$12 < n$10) {
                                                                            if (contextValue[ // If any of their keys are different, replace the reference
                                                                                // in the cache with the reference in the message.
                                                                                i$12] !== messageValue[i$12]) {
                                                                                break checking_refs;
                                                                            }
                                                                        }
                                                                        if (i$12 === n$10) {
                                                                            break inserting;
                                                                        }
                                                                    }
                                                                }
                                                            } else {
                                                                if (messageType === 'primitive') {
                                                                    messageType = 'sentinel';
                                                                    messageSize = 50 + (messageSize || 1);
                                                                    message = {
                                                                        '$size': messageSize,
                                                                        '$type': messageType,
                                                                        'value': messageValue
                                                                    };
                                                                } else {
                                                                    message['$size'] = messageSize;
                                                                    message['$type'] = messageType = messageType || 'leaf';
                                                                }
                                                                var head$15 = root.__head,
                                                                    tail$15 = root.__tail;
                                                                if (message && message['$expires'] !== 1) {
                                                                    var next$15 = message.__next,
                                                                        prev$15 = message.__prev;
                                                                    if (message !== head$15) {
                                                                        next$15 && (next$15 != null && typeof next$15 === 'object') && (next$15.__prev = prev$15);
                                                                        prev$15 && (prev$15 != null && typeof prev$15 === 'object') && (prev$15.__next = next$15);
                                                                        (next$15 = head$15) && (next$15 != null && typeof next$15 === 'object') && (head$15.__prev = message);
                                                                        root.__head = root.__next = head$15 = message;
                                                                        if (head$15 != null && typeof head$15 === 'object') {
                                                                            head$15.__next = next$15;
                                                                            head$15.__prev = void 0;
                                                                        }
                                                                    }
                                                                    if (tail$15 == null || message === tail$15) {
                                                                        root.__tail = root.__prev = tail$15 = prev$15 || message;
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        if (context != // Before we overwrite the cache value, migrate the
                                                            // back-references from the context to the message and
                                                            // remove the context's hard-link.
                                                            null) {
                                                            if (contextType === 'array') {
                                                                var dest$5 = context.__context;
                                                                if (dest$5 != null) {
                                                                    var i$13 = (context.__refIndex || 0) - 1,
                                                                        n$11 = (dest$5.__refsLength || 0) - 1;
                                                                    while (++i$13 <= n$11) {
                                                                        dest$5['__ref' + i$13] = dest$5['__ref' + (i$13 + 1)];
                                                                    }
                                                                    dest$5.__refsLength = n$11;
                                                                    context.__refIndex = void 0;
                                                                    context.__context = null;
                                                                }
                                                            }
                                                            if (context.__refsLength) {
                                                                var cRefs$5 = context.__refsLength || 0,
                                                                    mRefs$3 = message.__refsLength || 0,
                                                                    i$14 = -1,
                                                                    ref$8;
                                                                while (++i$14 < cRefs$5) {
                                                                    if ((ref$8 = context['__ref' + i$14]) !== void 0) {
                                                                        ref$8.__context = message;
                                                                        message['__ref' + (mRefs$3 + i$14)] = ref$8;
                                                                        context['__ref' + i$14] = void 0;
                                                                    }
                                                                }
                                                                message.__refsLength = mRefs$3 + cRefs$5;
                                                                context.__refsLength = void 0;
                                                            }
                                                            var head$16 = root.__head,
                                                                tail$16 = root.__tail;
                                                            if (context != null && typeof context === 'object') {
                                                                var next$16 = context.__next,
                                                                    prev$16 = context.__prev;
                                                                next$16 && (next$16.__prev = prev$16);
                                                                prev$16 && (prev$16.__next = next$16);
                                                                context === head$16 && (root.__head = root.__next = head$16 = next$16);
                                                                context === tail$16 && (root.__tail = root.__prev = tail$16 = prev$16);
                                                                context.__next = context.__prev = void 0;
                                                            }
                                                        }
                                                        sizeOffset$4 = messageSize - contextSize;
                                                        message['$size'] = messageSize - sizeOffset$4;
                                                        if (context && // Put the message in the cache and migrate generation if needed.
                                                            message && !context.__generation !== void 0 && (message.__generation === void 0 || context.__generation > message.__generation)) {
                                                            message.__generation = context.__generation;
                                                        }
                                                        contextParent[key] = context = message;
                                                        break inserting;
                                                    }
                                            }
                                            context.__parent = contextParent;
                                            context.__key = key;
                                            if (sizeOffset$4 !== 0) {
                                                var parent$4, size$3, context$6 = context,
                                                    contextValue$4, contextType$4;
                                                while (context$1171 !== void 0) {
                                                    context$1171['$size'] = size$3 = (context$1171['$size'] || 0) + sizeOffset$4;
                                                    if (context$1171.__genUpdated !== generation) {
                                                        var context$7 = context$1171,
                                                            stack$3 = [],
                                                            depth$4 = 0,
                                                            references$3, ref$9, i$15, k$3, n$12;
                                                        while (depth$4 >= 0) {
                                                            if ((references$3 = stack$3[depth$4]) === void 0) {
                                                                i$15 = k$3 = -1;
                                                                n$12 = context$1171.__refsLength || 0;
                                                                stack$3[depth$4] = references$3 = [];
                                                                context$1171.__genUpdated = generation;
                                                                context$1171.__generation = (context$1171.__generation || 0) + 1;
                                                                if ((ref$9 = context$1171.__parent) !== void 0 && ref$9.__genUpdated !== generation) {
                                                                    references$3[++k$3] = ref$9;
                                                                }
                                                                while (++i$15 < n$12) {
                                                                    if ((ref$9 = context$1171['__ref' + i$15]) !== void 0 && ref$9.__genUpdated !== generation) {
                                                                        references$3[++k$3] = ref$9;
                                                                    }
                                                                }
                                                            }
                                                            if ((context$1171 = references$3.pop()) !== void 0) {
                                                                ++depth$4;
                                                            } else {
                                                                stack$3[depth$4--] = void 0;
                                                            }
                                                        }
                                                    }
                                                    if (( // If this node's size drops to zero or below, add it to the
                                                        // expired list and remove it from the cache.
                                                        parent$4 = context$1171.__parent) !== void 0 && size$3 <= 0) {
                                                        var cRefs$6 = context$1171.__refsLength || 0,
                                                            idx$3 = -1,
                                                            ref$10;
                                                        while (++idx$3 < cRefs$6) {
                                                            if ((ref$10 = context$1171['__ref' + idx$3]) !== void 0) {
                                                                ref$10.__context = void 0;
                                                                context$1171['__ref' + idx$3] = void 0;
                                                            }
                                                        }
                                                        context$1171.__refsLength = void 0;
                                                        if (Array.isArray(contextValue$4 = (contextType$4 // If the context is a sentinel, get its value.
                                                            // Otherwise, set contextValue to the context.
                                                            = context$1171 && context$1171[ // If the context is a sentinel, get its value.
                                                            // Otherwise, set contextValue to the context.
                                                            '$type']) === 'sentinel' ? context$1171.value : context$1171)) {
                                                            var dest$6 = context$1171.__context;
                                                            if (dest$6 != null) {
                                                                var i$16 = (context$1171.__refIndex || 0) - 1,
                                                                    n$13 = (dest$6.__refsLength || 0) - 1;
                                                                while (++i$16 <= n$13) {
                                                                    dest$6['__ref' + i$16] = dest$6['__ref' + (i$16 + 1)];
                                                                }
                                                                dest$6.__refsLength = n$13;
                                                                context$1171.__refIndex = void 0;
                                                                context$1171.__context = null;
                                                            }
                                                        }
                                                        parent$4[context$1171.__key] = context$1171.__parent = void 0;
                                                        var head$17 = root.__head,
                                                            tail$17 = root.__tail;
                                                        if (context$1171 != null && typeof context$1171 === 'object') {
                                                            var next$17 = context$1171.__next,
                                                                prev$17 = context$1171.__prev;
                                                            next$17 && (next$17.__prev = prev$17);
                                                            prev$17 && (prev$17.__next = next$17);
                                                            context$1171 === head$17 && (root.__head = root.__next = head$17 = next$17);
                                                            context$1171 === tail$17 && (root.__tail = root.__prev = tail$17 = prev$17);
                                                            context$1171.__next = context$1171.__prev = void 0;
                                                        }
                                                    }
                                                    context$1171 = parent$4;
                                                }
                                            }
                                        }
                                        if (context == null || contextType === 'error') {
                                            optimized.length = column + offset + 1;
                                            // If we short-circuited while following a reference, set
                                            // the column, path, and last variables to the path we were
                                            // following before we started following the broken reference.
                                            // Use this path to build the missing path from the optimized
                                            // path.
                                            column = cols[--depth];
                                            offset = last - column - 1;
                                            path = refs[depth];
                                            last = path.length - 1;
                                            // Append null to the original path so someone can
                                            // call `get` with the path and request beyond the
                                            // reference.
                                            original[original.length] = null;
                                            break setting_pbf;
                                        }
                                        var refContainer;
                                        if (( // Set up the hard-link so we don't have to do all
                                            // this work the next time we follow this reference.
                                            refContainer = path.__container || path).__context === void 0) {
                                            var backRefs = context.__refsLength || 0;
                                            context['__ref' + backRefs] = refContainer;
                                            context.__refsLength = backRefs + 1;
                                            refContainer.__refIndex = backRefs;
                                            refContainer.__context = context;
                                        }
                                        do {
                                            // Roll back to the path that was interrupted.
                                            // We might have to roll back multiple times,
                                            // as in the case where a reference references
                                            // a reference.
                                            path = refs[--depth];
                                            column = cols[depth];
                                            offset = last - column;
                                            last = path.length - 1;
                                        } while (depth > -1 && column === last);
                                        if ( // If the reference we followed landed on another reference ~and~
                                        // the recursed path has more keys to process, Kanye the path we
                                        // rolled back to -- we're gonna let it finish, but first we gotta
                                        // say that this reference had the best album of ALL. TIME.
                                            column < last) {
                                            while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                                                // Otherwise, set contextValue to the context.
                                                = context && context[ // If the context is a sentinel, get its value.
                                                // Otherwise, set contextValue to the context.
                                                '$type']) === 'sentinel' ? context.value : context)) {
                                                var head$18 = root.__head,
                                                    tail$18 = root.__tail;
                                                if (context && context['$expires'] !== 1) {
                                                    var next$18 = context.__next,
                                                        prev$18 = context.__prev;
                                                    if (context !== head$18) {
                                                        next$18 && (next$18 != null && typeof next$18 === 'object') && (next$18.__prev = prev$18);
                                                        prev$18 && (prev$18 != null && typeof prev$18 === 'object') && (prev$18.__next = next$18);
                                                        (next$18 = head$18) && (next$18 != null && typeof next$18 === 'object') && (head$18.__prev = context);
                                                        root.__head = root.__next = head$18 = context;
                                                        if (head$18 != null && typeof head$18 === 'object') {
                                                            head$18.__next = next$18;
                                                            head$18.__prev = void 0;
                                                        }
                                                    }
                                                    if (tail$18 == null || context === tail$18) {
                                                        root.__tail = root.__prev = tail$18 = prev$18 || context;
                                                    }
                                                }
                                                contextParent = contextCache;
                                                messageParent = messageCache;
                                                refs[depth] = path;
                                                cols[depth++] = column;
                                                path = contextValue;
                                                last = path.length - 1;
                                                offset = 0;
                                                column = 0;
                                                continue expanding;
                                            }
                                        }
                                        if (depth > -1) {
                                            column += 1;
                                            contextParent = context;
                                            messageParent = message;
                                            continue expanding;
                                        }
                                    }
                                    break expanding;
                                }
                        }
                        if (context == null || contextType !== void 0) {
                            optimized.length = column + offset + 1;
                            break setting_pbf;
                        }
                        contexts[column] = contextParent = context;
                        messages[column] = messageParent = message;
                        batchedPathMaps[column] = batchedPathMap;
                    }
                    if (column === last) {
                        key = path[column];
                        if (key != null && typeof key === 'object') {
                            if (Array.isArray(key)) {
                                key = key[key.index || (key.index = 0)];
                                if (key != null && typeof key === 'object') {
                                    key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                                }
                            } else {
                                key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                            }
                        }
                        original[original.length = column] = key;
                        if (key != null) {
                            optimized[optimized.length = column + offset] = key;
                            context = contextParent[key];
                            message = messageParent && messageParent[key];
                            batchedPathMap = batchedPathMap[key];
                            var sizeOffset$5 = 0;
                            if (message == null) {
                                messageValue = message;
                                messageSize = 0;
                                messageType = 'primitive';
                                messageTimestamp = void 0;
                                messageExpires = void 0;
                            } else if (!((messageExpires = message['$expires']) == null || messageExpires === 1 || messageExpires !== 0 && messageExpires > Date.now())) {
                                messageExpires = 0;
                                messageTimestamp = void 0;
                                if (message.__invalidated === void 0) {
                                    message.__invalidated = true;
                                    message['$expires'] = 0;
                                    expired[expired.length] = message;
                                    var head$19 = root.__head,
                                        tail$19 = root.__tail;
                                    if (message != null && typeof message === 'object') {
                                        var next$19 = message.__next,
                                            prev$19 = message.__prev;
                                        next$19 && (next$19.__prev = prev$19);
                                        prev$19 && (prev$19.__next = next$19);
                                        message === head$19 && (root.__head = root.__next = head$19 = next$19);
                                        message === tail$19 && (root.__tail = root.__prev = tail$19 = prev$19);
                                        message.__next = message.__prev = void 0;
                                    }
                                }
                            } else {
                                messageExpires = message['$expires'];
                                messageTimestamp = message['$timestamp'];
                                messageValue = ( // If the context is a sentinel, get its value.
                                    // Otherwise, set contextValue to the context.
                                    messageType = message && message['$type']) === 'sentinel' ? message.value : message;
                                if (Array.isArray(messageValue)) {
                                    if ((messageSize = message['$size']) == null) {
                                        messageSize = (messageType === 'sentinel' && 50 || 0) + messageValue.length;
                                    }
                                    messageType = 'array';
                                } else if (messageType === 'sentinel') {
                                    if ((messageSize = message['$size']) == null) {
                                        messageSize = 50 + (typeof messageValue === 'string' && messageValue.length || 1);
                                    }
                                } else if (message == null || typeof message !== 'object') {
                                    messageSize = typeof messageValue === 'string' ? messageValue.length : 1;
                                    messageType = 'primitive';
                                } else {
                                    messageSize = message['$size'] || 0;
                                    messageType = messageType || 'leaf';
                                }
                            }
                            if (context === message) {
                                contextValue = messageValue;
                                contextSize = messageSize;
                                contextType = messageType;
                                contextTimestamp = messageTimestamp;
                                contextExpires = messageExpires;
                            } else {
                                if (context == null) {
                                    contextValue = context;
                                    contextSize = 0;
                                    contextType = 'primitive';
                                    contextTimestamp = void 0;
                                    contextExpires = void 0;
                                } else if (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now())) {
                                    contextExpires = 0;
                                    contextTimestamp = void 0;
                                    if (context.__invalidated === void 0) {
                                        context.__invalidated = true;
                                        context['$expires'] = 0;
                                        expired[expired.length] = context;
                                        var head$20 = root.__head,
                                            tail$20 = root.__tail;
                                        if (context != null && typeof context === 'object') {
                                            var next$20 = context.__next,
                                                prev$20 = context.__prev;
                                            next$20 && (next$20.__prev = prev$20);
                                            prev$20 && (prev$20.__next = next$20);
                                            context === head$20 && (root.__head = root.__next = head$20 = next$20);
                                            context === tail$20 && (root.__tail = root.__prev = tail$20 = prev$20);
                                            context.__next = context.__prev = void 0;
                                        }
                                    }
                                } else {
                                    contextExpires = context['$expires'];
                                    contextTimestamp = context['$timestamp'];
                                    contextValue = ( // If the context is a sentinel, get its value.
                                        // Otherwise, set contextValue to the context.
                                        contextType = context && context['$type']) === 'sentinel' ? context.value : context;
                                    if (Array.isArray(contextValue)) {
                                        if ((contextSize = context['$size']) == null) {
                                            contextSize = (contextType === 'sentinel' && 50 || 0) + contextValue.length;
                                        }
                                        contextType = 'array';
                                    } else if (contextType === 'sentinel') {
                                        if ((contextSize = context['$size']) == null) {
                                            contextSize = 50 + (typeof contextValue === 'string' && contextValue.length || 1);
                                        }
                                    } else if (context == null || typeof context !== 'object') {
                                        contextSize = typeof contextValue === 'string' ? contextValue.length : 1;
                                        contextType = 'primitive';
                                    } else {
                                        contextSize = context['$size'] || 0;
                                        contextType = contextType || 'leaf';
                                    }
                                }
                            }
                            inserting:
                                while ((messageTimestamp < // Return `true` if the message is newer than the
                                    // context and the message isn't set to expire now.
                                    // Return `false` if the message is older, or if it
                                    // expires now.
                                    //
                                    // If the message is newer than the cache but it's set
                                    // to expire now, set the context variable to the message
                                    // so we'll onNext the message, but leave the cache alone.
                                    contextTimestamp || messageExpires === 0 && ((context = message) || true)) === false) {
                                    if (messageType === 'primitive') {
                                        messageType = 'sentinel';
                                        messageSize = 50 + (messageSize || 1);
                                        message = {
                                            '$size': messageSize,
                                            '$type': messageType,
                                            'value': messageValue
                                        };
                                    } else if (messageType === 'array') {
                                        message['$type'] = messageType = message['$type'] || 'leaf';
                                    } else {
                                        message['$size'] = messageSize;
                                        message['$type'] = messageType = messageType || 'leaf';
                                    }
                                    if (context && context !== message) {
                                        if (contextType === // Before we overwrite the cache value, migrate the
                                            // back-references from the context to the message and
                                            // remove the context's hard-link.
                                            'array') {
                                            var dest$7 = context.__context;
                                            if (dest$7 != null) {
                                                var i$17 = (context.__refIndex || 0) - 1,
                                                    n$14 = (dest$7.__refsLength || 0) - 1;
                                                while (++i$17 <= n$14) {
                                                    dest$7['__ref' + i$17] = dest$7['__ref' + (i$17 + 1)];
                                                }
                                                dest$7.__refsLength = n$14;
                                                context.__refIndex = void 0;
                                                context.__context = null;
                                            }
                                        }
                                        if (context.__refsLength) {
                                            var cRefs$7 = context.__refsLength || 0,
                                                mRefs$4 = message.__refsLength || 0,
                                                i$18 = -1,
                                                ref$11;
                                            while (++i$18 < cRefs$7) {
                                                if ((ref$11 = context['__ref' + i$18]) !== void 0) {
                                                    ref$11.__context = message;
                                                    message['__ref' + (mRefs$4 + i$18)] = ref$11;
                                                    context['__ref' + i$18] = void 0;
                                                }
                                            }
                                            message.__refsLength = mRefs$4 + cRefs$7;
                                            context.__refsLength = void 0;
                                        }
                                        var head$21 = root.__head,
                                            tail$21 = root.__tail;
                                        if (context != null && typeof context === 'object') {
                                            var next$21 = context.__next,
                                                prev$21 = context.__prev;
                                            next$21 && (next$21.__prev = prev$21);
                                            prev$21 && (prev$21.__next = next$21);
                                            context === head$21 && (root.__head = root.__next = head$21 = next$21);
                                            context === tail$21 && (root.__tail = root.__prev = tail$21 = prev$21);
                                            context.__next = context.__prev = void 0;
                                        }
                                    }
                                    sizeOffset$5 = messageSize - contextSize;
                                    message['$size'] = messageSize - sizeOffset$5;
                                    if (context && // Put the message in the cache and migrate generation if needed.
                                        message && !context.__generation !== void 0 && (message.__generation === void 0 || context.__generation > message.__generation)) {
                                        message.__generation = context.__generation;
                                    }
                                    contextParent[key] = context = message;
                                    break inserting;
                                }
                            context.__parent = contextParent;
                            context.__key = key;
                            if (sizeOffset$5 !== 0) {
                                var parent$5, size$4, context$8 = context,
                                    contextValue$5, contextType$5;
                                while (context$1171 !== void 0) {
                                    context$1171['$size'] = size$4 = (context$1171['$size'] || 0) + sizeOffset$5;
                                    if (context$1171.__genUpdated !== generation) {
                                        var context$9 = context$1171,
                                            stack$4 = [],
                                            depth$5 = 0,
                                            references$4, ref$12, i$19, k$4, n$15;
                                        while (depth$5 >= 0) {
                                            if ((references$4 = stack$4[depth$5]) === void 0) {
                                                i$19 = k$4 = -1;
                                                n$15 = context$1171.__refsLength || 0;
                                                stack$4[depth$5] = references$4 = [];
                                                context$1171.__genUpdated = generation;
                                                context$1171.__generation = (context$1171.__generation || 0) + 1;
                                                if ((ref$12 = context$1171.__parent) !== void 0 && ref$12.__genUpdated !== generation) {
                                                    references$4[++k$4] = ref$12;
                                                }
                                                while (++i$19 < n$15) {
                                                    if ((ref$12 = context$1171['__ref' + i$19]) !== void 0 && ref$12.__genUpdated !== generation) {
                                                        references$4[++k$4] = ref$12;
                                                    }
                                                }
                                            }
                                            if ((context$1171 = references$4.pop()) !== void 0) {
                                                ++depth$5;
                                            } else {
                                                stack$4[depth$5--] = void 0;
                                            }
                                        }
                                    }
                                    if (( // If this node's size drops to zero or below, add it to the
                                        // expired list and remove it from the cache.
                                        parent$5 = context$1171.__parent) !== void 0 && size$4 <= 0) {
                                        var cRefs$8 = context$1171.__refsLength || 0,
                                            idx$4 = -1,
                                            ref$13;
                                        while (++idx$4 < cRefs$8) {
                                            if ((ref$13 = context$1171['__ref' + idx$4]) !== void 0) {
                                                ref$13.__context = void 0;
                                                context$1171['__ref' + idx$4] = void 0;
                                            }
                                        }
                                        context$1171.__refsLength = void 0;
                                        if (Array.isArray(contextValue$5 = (contextType$5 // If the context is a sentinel, get its value.
                                            // Otherwise, set contextValue to the context.
                                            = context$1171 && context$1171[ // If the context is a sentinel, get its value.
                                            // Otherwise, set contextValue to the context.
                                            '$type']) === 'sentinel' ? context$1171.value : context$1171)) {
                                            var dest$8 = context$1171.__context;
                                            if (dest$8 != null) {
                                                var i$20 = (context$1171.__refIndex || 0) - 1,
                                                    n$16 = (dest$8.__refsLength || 0) - 1;
                                                while (++i$20 <= n$16) {
                                                    dest$8['__ref' + i$20] = dest$8['__ref' + (i$20 + 1)];
                                                }
                                                dest$8.__refsLength = n$16;
                                                context$1171.__refIndex = void 0;
                                                context$1171.__context = null;
                                            }
                                        }
                                        parent$5[context$1171.__key] = context$1171.__parent = void 0;
                                        var head$22 = root.__head,
                                            tail$22 = root.__tail;
                                        if (context$1171 != null && typeof context$1171 === 'object') {
                                            var next$22 = context$1171.__next,
                                                prev$22 = context$1171.__prev;
                                            next$22 && (next$22.__prev = prev$22);
                                            prev$22 && (prev$22.__next = next$22);
                                            context$1171 === head$22 && (root.__head = root.__next = head$22 = next$22);
                                            context$1171 === tail$22 && (root.__tail = root.__prev = tail$22 = prev$22);
                                            context$1171.__next = context$1171.__prev = void 0;
                                        }
                                    }
                                    context$1171 = parent$5;
                                }
                            } else {
                                var context$10 = context;
                                while (context$1171 !== void 0) {
                                    if (context$1171.__genUpdated !== generation) {
                                        var context$11 = context$1171,
                                            stack$5 = [],
                                            depth$6 = 0,
                                            references$5, ref$14, i$21, k$5, n$17;
                                        while (depth$6 >= 0) {
                                            if ((references$5 = stack$5[depth$6]) === void 0) {
                                                i$21 = k$5 = -1;
                                                n$17 = context$1171.__refsLength || 0;
                                                stack$5[depth$6] = references$5 = [];
                                                context$1171.__genUpdated = generation;
                                                context$1171.__generation = (context$1171.__generation || 0) + 1;
                                                if ((ref$14 = context$1171.__parent) !== void 0 && ref$14.__genUpdated !== generation) {
                                                    references$5[++k$5] = ref$14;
                                                }
                                                while (++i$21 < n$17) {
                                                    if ((ref$14 = context$1171['__ref' + i$21]) !== void 0 && ref$14.__genUpdated !== generation) {
                                                        references$5[++k$5] = ref$14;
                                                    }
                                                }
                                            }
                                            if ((context$1171 = references$5.pop()) !== void 0) {
                                                ++depth$6;
                                            } else {
                                                stack$5[depth$6--] = void 0;
                                            }
                                        }
                                    }
                                    context$1171 = context$1171.__parent;
                                }
                            }
                            var head$23 = root.__head,
                                tail$23 = root.__tail;
                            if (context && context['$expires'] !== 1) {
                                var next$23 = context.__next,
                                    prev$23 = context.__prev;
                                if (context !== head$23) {
                                    next$23 && (next$23 != null && typeof next$23 === 'object') && (next$23.__prev = prev$23);
                                    prev$23 && (prev$23 != null && typeof prev$23 === 'object') && (prev$23.__next = next$23);
                                    (next$23 = head$23) && (next$23 != null && typeof next$23 === 'object') && (head$23.__prev = context);
                                    root.__head = root.__next = head$23 = context;
                                    if (head$23 != null && typeof head$23 === 'object') {
                                        head$23.__next = next$23;
                                        head$23.__prev = void 0;
                                    }
                                }
                                if (tail$23 == null || context === tail$23) {
                                    root.__tail = root.__prev = tail$23 = prev$23 || context;
                                }
                            }
                        }
                        // If the context is a sentinel, get its value.
                        // Otherwise, set contextValue to the context.
                        contextValue = (contextType = context && context['$type']) === 'sentinel' ? context.value : context;
                    }
                    break setting_pbf;
                }
            if (context != null) {
                pbv.value = contextValue;
                if ( // If the context is null or undefined, the cache
                // doesn't have a value for this path. Append the
                // remaining path keys to the end of the optimized
                // path and signal that the value is missing.
                    contextType === 'error') {
                    var x, xs = batchedPathMap.__observers.concat(),
                        y, ys, z, i$22 = -1,
                        n$18 = xs.length,
                        key$2, column$2, last$2, count;
                    while (++i$22 < n$18) {
                        count = 1;
                        if (column < last) {
                            column$2 = column;
                            last$2 = last;
                            while (++column$2 <= last$2) {
                                if ((key$2 = path[column$2]) != null) {
                                    if (Array.isArray(key$2)) {
                                        count *= key$2.length || 1;
                                    } else if (key$2 != null && typeof key$2 === 'object') {
                                        count *= key$2.to - (key$2.offset || key$2.from || 0) + 1;
                                    }
                                }
                            }
                        }
                        (x = xs[i$22]).count = (x.count || 0) - count;
                        y = Array.isArray(pbv) ? [] : pbv != null && typeof pbv === 'object' ? {} : pbv;
                        var val, dst;
                        for (var key$3 in pbv) {
                            if (pbv.hasOwnProperty(key$3)) {
                                val = dst = pbv[key$3];
                                if (Array.isArray(val)) {
                                    var i$23 = -1,
                                        n$19 = val.length;
                                    dst = new Array(n$19);
                                    while (++i$23 < n$19) {
                                        dst[i$23] = val[i$23];
                                    }
                                } else if (val != null && typeof val === 'object') {
                                    dst = Object.create(val);
                                }
                                y[key$3] = dst;
                            }
                        }
                        z = Array.isArray(contextValue) ? [] : contextValue != null && typeof contextValue === 'object' ? {} : contextValue;
                        var val$2, dst$2;
                        for (var key$4 in contextValue) {
                            if (contextValue.hasOwnProperty(key$4) && key$4[0] !== '_') {
                                val$2 = dst$2 = contextValue[key$4];
                                if (Array.isArray(val$2)) {
                                    var i$24 = -1,
                                        n$20 = val$2.length;
                                    dst$2 = new Array(n$20);
                                    while (++i$24 < n$20) {
                                        dst$2[i$24] = val$2[i$24];
                                    }
                                } else if (val$2 != null && typeof val$2 === 'object') {
                                    dst$2 = Object.create(val$2);
                                }
                                z[key$4] = dst$2;
                            }
                        }
                        y.path = y.path.slice(x.path.length);
                        y.value = z;
                        (ys = x.errors)[ys.length] = y;
                    }
                } else {
                    var x$2, xs$2 = batchedPathMap.__observers.concat(),
                        y$2, i$25 = -1,
                        n$21 = xs$2.length,
                        key$5, column$3, last$3, count$2;
                    while (++i$25 < n$21) {
                        count$2 = 1;
                        if (contextValue === void 0 && column < last) {
                            column$3 = column;
                            last$3 = last;
                            while (++column$3 <= last$3) {
                                if ((key$5 = path[column$3]) != null) {
                                    if (Array.isArray(key$5)) {
                                        count$2 *= key$5.length || 1;
                                    } else if (key$5 != null && typeof key$5 === 'object') {
                                        count$2 *= key$5.to - (key$5.offset || key$5.from || 0) + 1;
                                    }
                                }
                            }
                        }
                        (x$2 = xs$2[i$25]).count = (x$2.count || 0) - count$2;
                        if (x$2.streaming === true && (contextValue !== void 0 || x$2.materialized === true)) {
                            y$2 = Array.isArray(pbv) ? [] : pbv != null && typeof pbv === 'object' ? {} : pbv;
                            var val$3, dst$3;
                            for (var key$6 in pbv) {
                                if (pbv.hasOwnProperty(key$6)) {
                                    val$3 = dst$3 = pbv[key$6];
                                    if (Array.isArray(val$3)) {
                                        var i$26 = -1,
                                            n$22 = val$3.length;
                                        dst$3 = new Array(n$22);
                                        while (++i$26 < n$22) {
                                            dst$3[i$26] = val$3[i$26];
                                        }
                                    } else if (val$3 != null && typeof val$3 === 'object') {
                                        dst$3 = Object.create(val$3);
                                    }
                                    y$2[key$6] = dst$3;
                                }
                            }
                            y$2.path = y$2.path.slice(x$2.path.length);
                            x$2.onNext(y$2);
                        }
                    }
                }
            }
            ascending:
                for (; column >= 0; --column) {
                    key = path[column];
                    if (key == null || typeof key !== 'object') {
                        continue ascending;
                    }
                    if ( // TODO: replace this with a faster Array check.
                        Array.isArray(key)) {
                        if (++key.index === key.length) {
                            key = key[key.index = 0];
                            if (key == null || typeof key !== 'object') {
                                continue ascending;
                            }
                        } else {
                            break ascending;
                        }
                    }
                    if (++key.offset > (key.to || (key.to = key.from + (key.length || 1) - 1))) {
                        key.offset = key.from;
                        continue ascending;
                    }
                    break ascending;
                }
        }
    }
    batchedPathMap = batchedPathMaps[-1];
    var x$3, xs$3 = batchedPathMap.__observers.concat(),
        i$27 = -1,
        n$23 = xs$3.length,
        ys$2;
    while (++i$27 < n$23) {
        if ((x$3 = xs$3[i$27]).count <= 0) {
            if (x$3.streaming === false) {
                /* jshint ignore:start */
                x$3.onNext({
                    paths: x$3.originals.map(function (path$2) {
                        return path$2.slice(x$3.path.length);
                    }),
                    value: self.getValueSync(x$3.path, contextCache, contextCache)
                });
            }
            if ((ys$2 = x$3.errors).length === 0) {
                x$3.onCompleted && x$3.onCompleted();
            } else if (ys$2.length === 1) {
                x$3.onError && x$3.onError(ys$2[0]);
            } else {
                x$3.onError && x$3.onError({
                    innerErrors: ys$2
                });
            }
        }
    }
    var max = self._maxSize,
        total = cache['$size'],
        targetSize = max * self._collectRatio,
        tail$24, parent$6, size$5, context$12, contextValue$6, contextType$6, i$28 = 0;
    if (total >= max && (root._pendingRequests == null || root._pendingRequests <= 0)) {
        while (total >= targetSize && (context$1463 = expired.pop()) != null) {
            i$28++;
            total -= size$5 = context$1463['$size'] || 0;
            do {
                parent$6 = context$1463.__parent;
                if ((context$1463['$size'] -= size$5) <= 0) {
                    var cRefs$9 = context$1463.__refsLength || 0,
                        idx$5 = -1,
                        ref$15;
                    while (++idx$5 < cRefs$9) {
                        if ((ref$15 = context$1463['__ref' + idx$5]) !== void 0) {
                            ref$15.__context = void 0;
                            context$1463['__ref' + idx$5] = void 0;
                        }
                    }
                    context$1463.__refsLength = void 0;
                    if (Array.isArray(contextValue$6 = (contextType$6 // If the context is a sentinel, get its value.
                        // Otherwise, set contextValue to the context.
                        = context$1463 && context$1463[ // If the context is a sentinel, get its value.
                        // Otherwise, set contextValue to the context.
                        '$type']) === 'sentinel' ? context$1463.value : context$1463)) {
                        var dest$9 = context$1463.__context;
                        if (dest$9 != null) {
                            var i$29 = (context$1463.__refIndex || 0) - 1,
                                n$24 = (dest$9.__refsLength || 0) - 1;
                            while (++i$29 <= n$24) {
                                dest$9['__ref' + i$29] = dest$9['__ref' + (i$29 + 1)];
                            }
                            dest$9.__refsLength = n$24;
                            context$1463.__refIndex = void 0;
                            context$1463.__context = null;
                        }
                    }
                    if (parent$6 !== void 0) {
                        parent$6[context$1463.__key] = context$1463.__parent = void 0;
                    }
                }
                context$1463 = parent$6;
            } while (context$1463 !== void 0);
        }
        if (expired.length <= 0) {
            tail$24 = root.__tail;
            while (total >= targetSize && (context$1463 = tail$24) != null) {
                i$28++;
                tail$24 = tail$24.__prev;
                total -= size$5 = context$1463['$size'] || 0;
                context$1463.__prev = context$1463.__next = void 0;
                do {
                    parent$6 = context$1463.__parent;
                    if ((context$1463['$size'] -= size$5) <= 0) {
                        var cRefs$10 = context$1463.__refsLength || 0,
                            idx$6 = -1,
                            ref$16;
                        while (++idx$6 < cRefs$10) {
                            if ((ref$16 = context$1463['__ref' + idx$6]) !== void 0) {
                                ref$16.__context = void 0;
                                context$1463['__ref' + idx$6] = void 0;
                            }
                        }
                        context$1463.__refsLength = void 0;
                        if (Array.isArray(contextValue$6 = (contextType$6 // If the context is a sentinel, get its value.
                            // Otherwise, set contextValue to the context.
                            = context$1463 && context$1463[ // If the context is a sentinel, get its value.
                            // Otherwise, set contextValue to the context.
                            '$type']) === 'sentinel' ? context$1463.value : context$1463)) {
                            var dest$10 = context$1463.__context;
                            if (dest$10 != null) {
                                var i$30 = (context$1463.__refIndex || 0) - 1,
                                    n$25 = (dest$10.__refsLength || 0) - 1;
                                while (++i$30 <= n$25) {
                                    dest$10['__ref' + i$30] = dest$10['__ref' + (i$30 + 1)];
                                }
                                dest$10.__refsLength = n$25;
                                context$1463.__refIndex = void 0;
                                context$1463.__context = null;
                            }
                        }
                        if (parent$6 !== void 0) {
                            parent$6[context$1463.__key] = context$1463.__parent = void 0;
                        }
                    }
                    context$1463 = parent$6;
                } while (context$1463 !== void 0);
            }
        }
        if ((root.__tail = root.__prev = tail$24) == null) {
            root.__head = root.__next = void 0;
        } else {
            tail$24.__next = void 0;
        }
    }
    return Disposable.empty;
}

function invalidatePath(path_, cache, parent, bound) {
    var self = this,
        root = self._root,
        generation = GENERATION_GENERATION++,
        connected, materialized, streaming, refreshing, contexts, messages, errors, observer, observers, expired, path, key, column, offset, last, index, length, sizeOffset, boundOptimized, original, optimized, pbv, originalMiss, originalMisses, optimizedMiss, optimizedMisses, refs, cols, crossed, depth, batchedOptimizedPathMap, batchedPathMap, batchedPathMaps, contextCache, contextParent, context, contextValue, contextType, contextSize, contextExpires, contextTimestamp, boundContext, messageCache, messageParent, message, messageValue, messageType, messageSize, messageExpires, messageTimestamp;
    bound = bound || self._path;
    path_ = path_ || [];
    cache = cache || self._cache;
    parent = parent || self.__context || (path_ = bound.concat(path_)) && cache;
    path = path_;
    pbv = {
        path: [],
        optimized: []
    };
    refs = [];
    cols = [];
    crossed = [];
    column = 0;
    offset = 0;
    last = path.length - 1;
    contextCache = cache;
    contextParent = parent;
    context = contextParent;
    contextValue = context;
    original = pbv.path;
    optimized = pbv.optimized;
    depth = -1;
    sizeOffset = 0;
    expired = self._expired || (self._expired = []);
    refs[-1] = path;
    cols[-1] = 0;
    invalidating_path:
        while (true) {
            for (; column < last; ++column) {
                key = path[column];
                if (key != null && typeof key === 'object') {
                    if (Array.isArray(key)) {
                        key = key[key.index || (key.index = 0)];
                        if (key != null && typeof key === 'object') {
                            key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                        }
                    } else {
                        key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                    }
                }
                if (key == null) {
                    continue;
                }
                context = (context = contextParent[key]) && (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now()) ? void 0 : context);
                while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                    // Otherwise, set contextValue to the context.
                    = context && context[ // If the context is a sentinel, get its value.
                    // Otherwise, set contextValue to the context.
                    '$type']) === 'sentinel' ? context.value : context)) {
                    var head = root.__head,
                        tail = root.__tail;
                    if (context && context['$expires'] !== 1) {
                        var next = context.__next,
                            prev = context.__prev;
                        if (context !== head) {
                            next && (next != null && typeof next === 'object') && (next.__prev = prev);
                            prev && (prev != null && typeof prev === 'object') && (prev.__next = next);
                            (next = head) && (next != null && typeof next === 'object') && (head.__prev = context);
                            root.__head = root.__next = head = context;
                            if (head != null && typeof head === 'object') {
                                head.__next = next;
                                head.__prev = void 0;
                            }
                        }
                        if (tail == null || context === tail) {
                            root.__tail = root.__prev = tail = prev || context;
                        }
                    }
                    if ((context = context.__context) !== void 0) {
                    } else {
                        contextParent = contextCache;
                        refs[depth] = path;
                        cols[depth++] = column;
                        path = contextValue;
                        last = path.length - 1;
                        offset = 0;
                        column = 0;
                        expanding:
                            while (true) {
                                for (; column < last; ++column) {
                                    key = path[column];
                                    if (key == null) {
                                        continue;
                                    }
                                    context = (context = contextParent[key]) && (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now()) ? void 0 : context);
                                    while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                                        // Otherwise, set contextValue to the context.
                                        = context && context[ // If the context is a sentinel, get its value.
                                        // Otherwise, set contextValue to the context.
                                        '$type']) === 'sentinel' ? context.value : context)) {
                                        var head$2 = root.__head,
                                            tail$2 = root.__tail;
                                        if (context && context['$expires'] !== 1) {
                                            var next$2 = context.__next,
                                                prev$2 = context.__prev;
                                            if (context !== head$2) {
                                                next$2 && (next$2 != null && typeof next$2 === 'object') && (next$2.__prev = prev$2);
                                                prev$2 && (prev$2 != null && typeof prev$2 === 'object') && (prev$2.__next = next$2);
                                                (next$2 = head$2) && (next$2 != null && typeof next$2 === 'object') && (head$2.__prev = context);
                                                root.__head = root.__next = head$2 = context;
                                                if (head$2 != null && typeof head$2 === 'object') {
                                                    head$2.__next = next$2;
                                                    head$2.__prev = void 0;
                                                }
                                            }
                                            if (tail$2 == null || context === tail$2) {
                                                root.__tail = root.__prev = tail$2 = prev$2 || context;
                                            }
                                        }
                                        if ((context = context.__context) !== void 0) {
                                        } else {
                                            contextParent = contextCache;
                                            refs[depth] = path;
                                            cols[depth++] = column;
                                            path = contextValue;
                                            last = path.length - 1;
                                            offset = 0;
                                            column = 0;
                                            continue expanding;
                                        }
                                    }
                                    if (context == null || contextType !== void 0) {
                                        break invalidating_path;
                                    }
                                    contextParent = context;
                                }
                                if (column === last) {
                                    key = path[column];
                                    if (key != null) {
                                        context = (context = contextParent[key]) && (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now()) ? void 0 : context);
                                    }
                                    if (context == null || contextType === 'error') {
                                        break invalidating_path;
                                    }
                                    var refContainer;
                                    if (( // Set up the hard-link so we don't have to do all
                                        // this work the next time we follow this reference.
                                        refContainer = path.__container || path).__context === void 0) {
                                        var backRefs = context.__refsLength || 0;
                                        context['__ref' + backRefs] = refContainer;
                                        context.__refsLength = backRefs + 1;
                                        refContainer.__refIndex = backRefs;
                                        refContainer.__context = context;
                                    }
                                    do {
                                        // Roll back to the path that was interrupted.
                                        // We might have to roll back multiple times,
                                        // as in the case where a reference references
                                        // a reference.
                                        path = refs[--depth];
                                        column = cols[depth];
                                        offset = last - column;
                                        last = path.length - 1;
                                    } while (depth > -1 && column === last);
                                    if ( // If the reference we followed landed on another reference ~and~
                                    // the recursed path has more keys to process, Kanye the path we
                                    // rolled back to -- we're gonna let it finish, but first we gotta
                                    // say that this reference had the best album of ALL. TIME.
                                        column < last) {
                                        while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                                            // Otherwise, set contextValue to the context.
                                            = context && context[ // If the context is a sentinel, get its value.
                                            // Otherwise, set contextValue to the context.
                                            '$type']) === 'sentinel' ? context.value : context)) {
                                            var head$3 = root.__head,
                                                tail$3 = root.__tail;
                                            if (context && context['$expires'] !== 1) {
                                                var next$3 = context.__next,
                                                    prev$3 = context.__prev;
                                                if (context !== head$3) {
                                                    next$3 && (next$3 != null && typeof next$3 === 'object') && (next$3.__prev = prev$3);
                                                    prev$3 && (prev$3 != null && typeof prev$3 === 'object') && (prev$3.__next = next$3);
                                                    (next$3 = head$3) && (next$3 != null && typeof next$3 === 'object') && (head$3.__prev = context);
                                                    root.__head = root.__next = head$3 = context;
                                                    if (head$3 != null && typeof head$3 === 'object') {
                                                        head$3.__next = next$3;
                                                        head$3.__prev = void 0;
                                                    }
                                                }
                                                if (tail$3 == null || context === tail$3) {
                                                    root.__tail = root.__prev = tail$3 = prev$3 || context;
                                                }
                                            }
                                            if ((context = context.__context) !== void 0) {
                                            } else {
                                                contextParent = contextCache;
                                                refs[depth] = path;
                                                cols[depth++] = column;
                                                path = contextValue;
                                                last = path.length - 1;
                                                offset = 0;
                                                column = 0;
                                                continue expanding;
                                            }
                                        }
                                    }
                                    if (depth > -1) {
                                        column += 1;
                                        contextParent = context;
                                        continue expanding;
                                    }
                                }
                                break expanding;
                            }
                    }
                }
                if (context == null || contextType !== void 0) {
                    break invalidating_path;
                }
                contextParent = context;
            }
            if (column === last) {
                key = path[column];
                if (key != null && typeof key === 'object') {
                    if (Array.isArray(key)) {
                        key = key[key.index || (key.index = 0)];
                        if (key != null && typeof key === 'object') {
                            key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                        }
                    } else {
                        key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                    }
                }
                if (key != null) {
                    context = contextParent[key];
                }
                contextSize = (context && context['$size'] || 0) * -1;
                var parent$2, size, context$2 = context,
                    contextValue$2, contextType$2;
                while (context$1171 !== void 0) {
                    context$1171['$size'] = size = (context$1171['$size'] || 0) + contextSize;
                    if (context$1171.__genUpdated !== generation) {
                        var context$3 = context$1171,
                            stack = [],
                            depth$2 = 0,
                            references, ref, i, k, n;
                        while (depth$2 >= 0) {
                            if ((references = stack[depth$2]) === void 0) {
                                i = k = -1;
                                n = context$1171.__refsLength || 0;
                                stack[depth$2] = references = [];
                                context$1171.__genUpdated = generation;
                                context$1171.__generation = (context$1171.__generation || 0) + 1;
                                if ((ref = context$1171.__parent) !== void 0 && ref.__genUpdated !== generation) {
                                    references[++k] = ref;
                                }
                                while (++i < n) {
                                    if ((ref = context$1171['__ref' + i]) !== void 0 && ref.__genUpdated !== generation) {
                                        references[++k] = ref;
                                    }
                                }
                            }
                            if ((context$1171 = references.pop()) !== void 0) {
                                ++depth$2;
                            } else {
                                stack[depth$2--] = void 0;
                            }
                        }
                    }
                    if (( // If this node's size drops to zero or below, add it to the
                        // expired list and remove it from the cache.
                        parent$2 = context$1171.__parent) !== void 0 && size <= 0) {
                        var cRefs = context$1171.__refsLength || 0,
                            idx = -1,
                            ref$2;
                        while (++idx < cRefs) {
                            if ((ref$2 = context$1171['__ref' + idx]) !== void 0) {
                                ref$2.__context = void 0;
                                context$1171['__ref' + idx] = void 0;
                            }
                        }
                        context$1171.__refsLength = void 0;
                        if (Array.isArray(contextValue$2 = (contextType$2 // If the context is a sentinel, get its value.
                            // Otherwise, set contextValue to the context.
                            = context$1171 && context$1171[ // If the context is a sentinel, get its value.
                            // Otherwise, set contextValue to the context.
                            '$type']) === 'sentinel' ? context$1171.value : context$1171)) {
                            var dest = context$1171.__context;
                            if (dest != null) {
                                var i$2 = (context$1171.__refIndex || 0) - 1,
                                    n$2 = (dest.__refsLength || 0) - 1;
                                while (++i$2 <= n$2) {
                                    dest['__ref' + i$2] = dest['__ref' + (i$2 + 1)];
                                }
                                dest.__refsLength = n$2;
                                context$1171.__refIndex = void 0;
                                context$1171.__context = null;
                            }
                        }
                        parent$2[context$1171.__key] = context$1171.__parent = void 0;
                        var head$4 = root.__head,
                            tail$4 = root.__tail;
                        if (context$1171 != null && typeof context$1171 === 'object') {
                            var next$4 = context$1171.__next,
                                prev$4 = context$1171.__prev;
                            next$4 && (next$4.__prev = prev$4);
                            prev$4 && (prev$4.__next = next$4);
                            context$1171 === head$4 && (root.__head = root.__next = head$4 = next$4);
                            context$1171 === tail$4 && (root.__tail = root.__prev = tail$4 = prev$4);
                            context$1171.__next = context$1171.__prev = void 0;
                        }
                    }
                    context$1171 = parent$2;
                }
            }
            break invalidating_path;
        }
    pbv.value = contextValue;
    return pbv;
}

function invalidatePaths(paths_, onNext, onError, onCompleted, cache, parent, bound) {
    var self = this,
        root = self._root,
        generation = GENERATION_GENERATION++,
        connected, materialized, streaming, refreshing, contexts, messages, error, errors, observer, observers, expired, paths, path, key, column, offset, last, index, length, sizeOffset, boundOptimized, original, optimized, pbv, originalMiss, originalMisses, optimizedMiss, optimizedMisses, refs, cols, crossed, depth, batchedOptimizedPathMap, batchedPathMap, batchedPathMaps, contextCache, contextParent, context, contextValue, contextType, contextSize, contextExpires, contextTimestamp, boundContext, messageCache, messageParent, message, messageValue, messageType, messageSize, messageExpires, messageTimestamp;
    paths = paths_;
    connected = self._connected;
    materialized = self._materialized;
    streaming = self._streaming;
    refreshing = self._refreshing;
    path = bound || self._path;
    contexts = paths.contexts || (paths.contexts = []);
    messages = paths.messages || (paths.messages = []);
    batchedPathMaps = paths.batchedPathMaps || (paths.batchedPathMaps = []);
    originalMisses = paths.originalMisses || (paths.originalMisses = []);
    optimizedMisses = paths.optimizedMisses || (paths.optimizedMisses = []);
    errors = paths.errors || (paths.errors = []);
    refs = paths.refs || (paths.refs = []);
    crossed = paths.crossed || (paths.crossed = []);
    cols = paths.cols || (paths.cols = []);
    pbv = paths.pbv || (paths.pbv = {
        path: [],
        optimized: []
    });
    index = paths.index || (paths.index = 0);
    length = paths.length;
    batchedPathMap = paths.batchedPathMap;
    messageCache = paths.value;
    messageParent = messageCache;
    cache = cache || self._cache;
    bound = path;
    if (parent == null && (parent = self.__context) == null) {
        if (path.length > 0) {
            pbv = self._getContext();
            path = pbv.path;
            pbv.path = [];
            pbv.optimized = [];
            parent = pbv.value || {};
        } else {
            parent = cache;
        }
    }
    contextCache = cache;
    contextParent = parent;
    context = contextParent;
    contextValue = context;
    original = pbv.path;
    optimized = pbv.optimized;
    depth = -1;
    sizeOffset = 0;
    expired = self._expired || (self._expired = []);
    refs[-1] = path;
    cols[-1] = 0;
    crossed[-1] = boundOptimized = path;
    contexts[-1] = contextParent;
    for (; index < length; paths.index = ++index) {
        path = paths[index];
        column = path.index || (path.index = 0);
        offset = path.offset || (path.offset = 0);
        last = path.length - 1;
        depth = -1;
        refs[-1] = path;
        crossed = [];
        crossed[-1] = boundOptimized;
        while (column >= 0) {
            cols[depth = -1] = column;
            contextParent = contexts[column - 1];
            invalidating_path:
                while (true) {
                    for (; column < last; ++column) {
                        key = path[column];
                        if (key != null && typeof key === 'object') {
                            if (Array.isArray(key)) {
                                key = key[key.index || (key.index = 0)];
                                if (key != null && typeof key === 'object') {
                                    key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                                }
                            } else {
                                key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                            }
                        }
                        if (key == null) {
                            continue;
                        }
                        context = (context = contextParent[key]) && (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now()) ? void 0 : context);
                        while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                            // Otherwise, set contextValue to the context.
                            = context && context[ // If the context is a sentinel, get its value.
                            // Otherwise, set contextValue to the context.
                            '$type']) === 'sentinel' ? context.value : context)) {
                            var head = root.__head,
                                tail = root.__tail;
                            if (context && context['$expires'] !== 1) {
                                var next = context.__next,
                                    prev = context.__prev;
                                if (context !== head) {
                                    next && (next != null && typeof next === 'object') && (next.__prev = prev);
                                    prev && (prev != null && typeof prev === 'object') && (prev.__next = next);
                                    (next = head) && (next != null && typeof next === 'object') && (head.__prev = context);
                                    root.__head = root.__next = head = context;
                                    if (head != null && typeof head === 'object') {
                                        head.__next = next;
                                        head.__prev = void 0;
                                    }
                                }
                                if (tail == null || context === tail) {
                                    root.__tail = root.__prev = tail = prev || context;
                                }
                            }
                            if ((context = context.__context) !== void 0) {
                            } else {
                                contextParent = contextCache;
                                refs[depth] = path;
                                cols[depth++] = column;
                                path = contextValue;
                                last = path.length - 1;
                                offset = 0;
                                column = 0;
                                expanding:
                                    while (true) {
                                        for (; column < last; ++column) {
                                            key = path[column];
                                            if (key == null) {
                                                continue;
                                            }
                                            context = (context = contextParent[key]) && (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now()) ? void 0 : context);
                                            while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                                                // Otherwise, set contextValue to the context.
                                                = context && context[ // If the context is a sentinel, get its value.
                                                // Otherwise, set contextValue to the context.
                                                '$type']) === 'sentinel' ? context.value : context)) {
                                                var head$2 = root.__head,
                                                    tail$2 = root.__tail;
                                                if (context && context['$expires'] !== 1) {
                                                    var next$2 = context.__next,
                                                        prev$2 = context.__prev;
                                                    if (context !== head$2) {
                                                        next$2 && (next$2 != null && typeof next$2 === 'object') && (next$2.__prev = prev$2);
                                                        prev$2 && (prev$2 != null && typeof prev$2 === 'object') && (prev$2.__next = next$2);
                                                        (next$2 = head$2) && (next$2 != null && typeof next$2 === 'object') && (head$2.__prev = context);
                                                        root.__head = root.__next = head$2 = context;
                                                        if (head$2 != null && typeof head$2 === 'object') {
                                                            head$2.__next = next$2;
                                                            head$2.__prev = void 0;
                                                        }
                                                    }
                                                    if (tail$2 == null || context === tail$2) {
                                                        root.__tail = root.__prev = tail$2 = prev$2 || context;
                                                    }
                                                }
                                                if ((context = context.__context) !== void 0) {
                                                } else {
                                                    contextParent = contextCache;
                                                    refs[depth] = path;
                                                    cols[depth++] = column;
                                                    path = contextValue;
                                                    last = path.length - 1;
                                                    offset = 0;
                                                    column = 0;
                                                    continue expanding;
                                                }
                                            }
                                            if (context == null || contextType !== void 0) {
                                                break invalidating_path;
                                            }
                                            contextParent = context;
                                        }
                                        if (column === last) {
                                            key = path[column];
                                            if (key != null) {
                                                context = (context = contextParent[key]) && (!((contextExpires = context['$expires']) == null || contextExpires === 1 || contextExpires !== 0 && contextExpires > Date.now()) ? void 0 : context);
                                            }
                                            if (context == null || contextType === 'error') {
                                                break invalidating_path;
                                            }
                                            var refContainer;
                                            if (( // Set up the hard-link so we don't have to do all
                                                // this work the next time we follow this reference.
                                                refContainer = path.__container || path).__context === void 0) {
                                                var backRefs = context.__refsLength || 0;
                                                context['__ref' + backRefs] = refContainer;
                                                context.__refsLength = backRefs + 1;
                                                refContainer.__refIndex = backRefs;
                                                refContainer.__context = context;
                                            }
                                            do {
                                                // Roll back to the path that was interrupted.
                                                // We might have to roll back multiple times,
                                                // as in the case where a reference references
                                                // a reference.
                                                path = refs[--depth];
                                                column = cols[depth];
                                                offset = last - column;
                                                last = path.length - 1;
                                            } while (depth > -1 && column === last);
                                            if ( // If the reference we followed landed on another reference ~and~
                                            // the recursed path has more keys to process, Kanye the path we
                                            // rolled back to -- we're gonna let it finish, but first we gotta
                                            // say that this reference had the best album of ALL. TIME.
                                                column < last) {
                                                while (Array.isArray(contextValue = (contextType // If the context is a sentinel, get its value.
                                                    // Otherwise, set contextValue to the context.
                                                    = context && context[ // If the context is a sentinel, get its value.
                                                    // Otherwise, set contextValue to the context.
                                                    '$type']) === 'sentinel' ? context.value : context)) {
                                                    var head$3 = root.__head,
                                                        tail$3 = root.__tail;
                                                    if (context && context['$expires'] !== 1) {
                                                        var next$3 = context.__next,
                                                            prev$3 = context.__prev;
                                                        if (context !== head$3) {
                                                            next$3 && (next$3 != null && typeof next$3 === 'object') && (next$3.__prev = prev$3);
                                                            prev$3 && (prev$3 != null && typeof prev$3 === 'object') && (prev$3.__next = next$3);
                                                            (next$3 = head$3) && (next$3 != null && typeof next$3 === 'object') && (head$3.__prev = context);
                                                            root.__head = root.__next = head$3 = context;
                                                            if (head$3 != null && typeof head$3 === 'object') {
                                                                head$3.__next = next$3;
                                                                head$3.__prev = void 0;
                                                            }
                                                        }
                                                        if (tail$3 == null || context === tail$3) {
                                                            root.__tail = root.__prev = tail$3 = prev$3 || context;
                                                        }
                                                    }
                                                    if ((context = context.__context) !== void 0) {
                                                    } else {
                                                        contextParent = contextCache;
                                                        refs[depth] = path;
                                                        cols[depth++] = column;
                                                        path = contextValue;
                                                        last = path.length - 1;
                                                        offset = 0;
                                                        column = 0;
                                                        continue expanding;
                                                    }
                                                }
                                            }
                                            if (depth > -1) {
                                                column += 1;
                                                contextParent = context;
                                                continue expanding;
                                            }
                                        }
                                        break expanding;
                                    }
                            }
                        }
                        if (context == null || contextType !== void 0) {
                            break invalidating_path;
                        }
                        contexts[column] = contextParent = context;
                    }
                    if (column === last) {
                        key = path[column];
                        if (key != null && typeof key === 'object') {
                            if (Array.isArray(key)) {
                                key = key[key.index || (key.index = 0)];
                                if (key != null && typeof key === 'object') {
                                    key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                                }
                            } else {
                                key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                            }
                        }
                        if (key != null) {
                            context = contextParent[key];
                        }
                        contextSize = (context && context['$size'] || 0) * -1;
                        var parent$2, size, context$2 = context,
                            contextValue$2, contextType$2;
                        while (context$1171 !== void 0) {
                            context$1171['$size'] = size = (context$1171['$size'] || 0) + contextSize;
                            if (context$1171.__genUpdated !== generation) {
                                var context$3 = context$1171,
                                    stack = [],
                                    depth$2 = 0,
                                    references, ref, i, k, n;
                                while (depth$2 >= 0) {
                                    if ((references = stack[depth$2]) === void 0) {
                                        i = k = -1;
                                        n = context$1171.__refsLength || 0;
                                        stack[depth$2] = references = [];
                                        context$1171.__genUpdated = generation;
                                        context$1171.__generation = (context$1171.__generation || 0) + 1;
                                        if ((ref = context$1171.__parent) !== void 0 && ref.__genUpdated !== generation) {
                                            references[++k] = ref;
                                        }
                                        while (++i < n) {
                                            if ((ref = context$1171['__ref' + i]) !== void 0 && ref.__genUpdated !== generation) {
                                                references[++k] = ref;
                                            }
                                        }
                                    }
                                    if ((context$1171 = references.pop()) !== void 0) {
                                        ++depth$2;
                                    } else {
                                        stack[depth$2--] = void 0;
                                    }
                                }
                            }
                            if (( // If this node's size drops to zero or below, add it to the
                                // expired list and remove it from the cache.
                                parent$2 = context$1171.__parent) !== void 0 && size <= 0) {
                                var cRefs = context$1171.__refsLength || 0,
                                    idx = -1,
                                    ref$2;
                                while (++idx < cRefs) {
                                    if ((ref$2 = context$1171['__ref' + idx]) !== void 0) {
                                        ref$2.__context = void 0;
                                        context$1171['__ref' + idx] = void 0;
                                    }
                                }
                                context$1171.__refsLength = void 0;
                                if (Array.isArray(contextValue$2 = (contextType$2 // If the context is a sentinel, get its value.
                                    // Otherwise, set contextValue to the context.
                                    = context$1171 && context$1171[ // If the context is a sentinel, get its value.
                                    // Otherwise, set contextValue to the context.
                                    '$type']) === 'sentinel' ? context$1171.value : context$1171)) {
                                    var dest = context$1171.__context;
                                    if (dest != null) {
                                        var i$2 = (context$1171.__refIndex || 0) - 1,
                                            n$2 = (dest.__refsLength || 0) - 1;
                                        while (++i$2 <= n$2) {
                                            dest['__ref' + i$2] = dest['__ref' + (i$2 + 1)];
                                        }
                                        dest.__refsLength = n$2;
                                        context$1171.__refIndex = void 0;
                                        context$1171.__context = null;
                                    }
                                }
                                parent$2[context$1171.__key] = context$1171.__parent = void 0;
                                var head$4 = root.__head,
                                    tail$4 = root.__tail;
                                if (context$1171 != null && typeof context$1171 === 'object') {
                                    var next$4 = context$1171.__next,
                                        prev$4 = context$1171.__prev;
                                    next$4 && (next$4.__prev = prev$4);
                                    prev$4 && (prev$4.__next = next$4);
                                    context$1171 === head$4 && (root.__head = root.__next = head$4 = next$4);
                                    context$1171 === tail$4 && (root.__tail = root.__prev = tail$4 = prev$4);
                                    context$1171.__next = context$1171.__prev = void 0;
                                }
                            }
                            context$1171 = parent$2;
                        }
                    }
                    break invalidating_path;
                }
            ascending:
                for (; column >= 0; --column) {
                    key = path[column];
                    if (key == null || typeof key !== 'object') {
                        continue ascending;
                    }
                    if ( // TODO: replace this with a faster Array check.
                        Array.isArray(key)) {
                        if (++key.index === key.length) {
                            key = key[key.index = 0];
                            if (key == null || typeof key !== 'object') {
                                continue ascending;
                            }
                        } else {
                            break ascending;
                        }
                    }
                    if (++key.offset > (key.to || (key.to = key.from + (key.length || 1) - 1))) {
                        key.offset = key.from;
                        continue ascending;
                    }
                    break ascending;
                }
        }
    }
    if (onNext) {
        onNext(this);
    }
    if (onCompleted) {
        onCompleted();
    }
    return Disposable.empty;
}

function pathMapWithObserver(paths_, observer_, parent) {
    var self = this,
        root = self._root,
        connected, materialized, streaming, refreshing, contexts, messages, error, errors, observer, observers, expired, paths, path, key, column, offset, last, index, length, sizeOffset, boundOptimized, original, optimized, pbv, originalMiss, originalMisses, optimizedMiss, optimizedMisses, refs, cols, crossed, depth, batchedOptimizedPathMap, batchedPathMap, batchedPathMaps, contextCache, contextParent, context, contextValue, contextType, contextSize, contextExpires, contextTimestamp, boundContext, messageCache, messageParent, message, messageValue, messageType, messageSize, messageExpires, messageTimestamp;
    observer = observer_;
    paths = paths_;
    index = 0;
    length = paths.length;
    observers = ((contexts = [])[-1] = context = parent || (parent = {
        __observers: []
    })).__observers;
    if (observer && observers.indexOf(observer) === -1) {
        observers[observers.length] = observer;
    }
    for (; index < length; paths.index = ++index) {
        path = paths[index];
        column = 0;
        offset = 0;
        last = path.length - 1;
        while (column >= 0) {
            contextParent = contexts[column - 1];
            building_pathmap:
                while (true) {
                    for (; column < last; ++column) {
                        key = path[column];
                        if (key != null && typeof key === 'object') {
                            if (Array.isArray(key)) {
                                key = key[key.index || (key.index = 0)];
                                if (key != null && typeof key === 'object') {
                                    key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                                }
                            } else {
                                key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                            }
                        }
                        if (key == null) {
                            continue;
                        }
                        observers = (context = contextParent[key] || (contextParent[key] = {
                            __observers: []
                        })).__observers;
                        if (observer && observers.indexOf(observer) === -1) {
                            observers[observers.length] = observer;
                        }
                        contexts[column] = contextParent = context;
                    }
                    if (column === last) {
                        key = path[column];
                        if (key != null && typeof key === 'object') {
                            if (Array.isArray(key)) {
                                key = key[key.index || (key.index = 0)];
                                if (key != null && typeof key === 'object') {
                                    key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                                }
                            } else {
                                key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                            }
                        }
                        if (key != null) {
                            observers = (context = contextParent[key] || (contextParent[key] = {
                                __observers: []
                            })).__observers;
                            if (observer && observers.indexOf(observer) === -1) {
                                observers[observers.length] = observer;
                                observer.count = (observer.count || 0) + 1;
                            }
                        }
                    }
                    break building_pathmap;
                }
            ascending:
                for (; column >= 0; --column) {
                    key = path[column];
                    if (key == null || typeof key !== 'object') {
                        continue ascending;
                    }
                    if ( // TODO: replace this with a faster Array check.
                        Array.isArray(key)) {
                        if (++key.index === key.length) {
                            key = key[key.index = 0];
                            if (key == null || typeof key !== 'object') {
                                continue ascending;
                            }
                        } else {
                            break ascending;
                        }
                    }
                    if (++key.offset > (key.to || (key.to = key.from + (key.length || 1) - 1))) {
                        key.offset = key.from;
                        continue ascending;
                    }
                    break ascending;
                }
        }
    }
    return parent;
}

function pathMapWithoutObserver(paths_, observer_, pathMap) {
    var self = this,
        root = self._root,
        connected, materialized, streaming, refreshing, contexts, messages, error, errors, observer, observers, expired, paths, path, key, column, offset, last, index, length, sizeOffset, boundOptimized, original, optimized, pbv, originalMiss, originalMisses, optimizedMiss, optimizedMisses, refs, cols, crossed, depth, batchedOptimizedPathMap, batchedPathMap, batchedPathMaps, contextCache, contextParent, context, contextValue, contextType, contextSize, contextExpires, contextTimestamp, boundContext, messageCache, messageParent, message, messageValue, messageType, messageSize, messageExpires, messageTimestamp;
    observer = observer_;
    paths = paths_;
    index = 0;
    length = paths.length;
    observers = ((contexts = [])[-1] = context = pathMap).__observers;
    if (observer != null) {
        var a, i;
        a = observers;
        if ((i = a.indexOf(observer)) !== -1) {
            a.splice(i, 1);
        }
    }
    for (; index < length; paths.index = ++index) {
        path = paths[index];
        column = 0;
        offset = 0;
        last = path.length - 1;
        while (column >= 0) {
            contextParent = contexts[column - 1];
            building_pathmap:
                while (true) {
                    for (; column < last; ++column) {
                        key = path[column];
                        if (key != null && typeof key === 'object') {
                            if (Array.isArray(key)) {
                                key = key[key.index || (key.index = 0)];
                                if (key != null && typeof key === 'object') {
                                    key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                                }
                            } else {
                                key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                            }
                        }
                        if (key == null) {
                            continue;
                        }
                        observers = (context = contextParent[key]).__observers;
                        if (observer != null) {
                            var a$2, i$2;
                            a$2 = observers;
                            if ((i$2 = a$2.indexOf(observer)) !== -1) {
                                a$2.splice(i$2, 1);
                            }
                        }
                        contexts[column] = contextParent = context;
                    }
                    if (column === last) {
                        key = path[column];
                        if (key != null && typeof key === 'object') {
                            if (Array.isArray(key)) {
                                key = key[key.index || (key.index = 0)];
                                if (key != null && typeof key === 'object') {
                                    key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                                }
                            } else {
                                key = key.offset === void 0 && (key.offset = key.from || (key.from = 0)) || key.offset;
                            }
                        }
                        if (key != null) {
                            observers = (context = contextParent[key]).__observers;
                            if (observer != null) {
                                var a$3, i$3;
                                a$3 = observers;
                                if ((i$3 = a$3.indexOf(observer)) !== -1) {
                                    a$3.splice(i$3, 1);
                                }
                                observer.count = (observer.count || 0) - 1;
                            }
                        }
                    }
                    break building_pathmap;
                }
            ascending:
                for (; column >= 0; --column) {
                    key = path[column];
                    if (key == null || typeof key !== 'object') {
                        continue ascending;
                    }
                    if ( // TODO: replace this with a faster Array check.
                        Array.isArray(key)) {
                        if (++key.index === key.length) {
                            key = key[key.index = 0];
                            if (key == null || typeof key !== 'object') {
                                continue ascending;
                            }
                        } else {
                            break ascending;
                        }
                    }
                    if (++key.offset > (key.to || (key.to = key.from + (key.length || 1) - 1))) {
                        key.offset = key.from;
                        continue ascending;
                    }
                    break ascending;
                }
        }
    }
    return pathMap;
}

function callPath(path, onNext, onError, onCompleted, callArgs, suffixes, paths) {
    if (!Array.isArray(path)) {
        throw new Error('PathEvaluator.call must be called with an Array path.');
    }
    callArgs = callArgs || [];
    suffixes = suffixes || [];
    paths = paths || [];
    var self = this,
        bound = this._path,
        extras = paths.map(function (x) {
            return bound.concat(x);
        }),
        disposable = this.loader.call(bound.concat(path), callArgs, suffixes, extras).subscribe(function (pbf) {
            var invalidated = pbf.invalidated || [];
            if (invalidated.length > 0) {
                // remove elements at the invalidated paths
                disposable = invalidatePaths.call(self, invalidated, function () {
                    var serverErrors$2 = [pbf.error],
                        error$2, projectError$2 = self._errorSelector;
                    while (( // TODO: retry certain errors
                        error$2 = serverErrors$2.pop()) !== void 0) {
                        if (error$2.innerErrors) {
                            serverErrors$2.push.apply(serverErrors$2, error$2.innerErrors);
                        } else {
                            error$2['$type'] = 'error';
                            self._setPath(error$2.path || error$2.pql, projectError$2(error$2), pbf.value);
                        }
                    }
                    pbf.batchedPathMap = null;
                    disposable = self._setPBF(pbf, onNext, onError, onCompleted, self._cache, self._cache, []);
                }, onError, noop, self._cache, self._cache);
            } else {
                var serverErrors = [pbf.error],
                    error, projectError = self._errorSelector;
                while (( // TODO: retry certain errors
                    error = serverErrors.pop()) !== void 0) {
                    if (error.innerErrors) {
                        serverErrors.push.apply(serverErrors, error.innerErrors);
                    } else {
                        error['$type'] = 'error';
                        self._setPath(error.path || error.pql, projectError(error), pbf.value);
                    }
                }
                pbf.batchedPathMap = null;
                disposable = self._setPBF(pbf, onNext, onError, onCompleted, self._cache, self._cache, []);
            }
        }, onError, noop);
    return Disposable.create(function (x) {
        disposable.dispose();
    });
}

function getPathsAsObservable() {
    var fn = getPaths,
        self = this,
        args;
    var i = -1,
        n = arguments.length;
    args = new Array(n);
    while (++i < n) {
        args[i] = arguments[i];
    }
    return Observable.createWithDisposable(function (observer) {
        var a;
        var i$2 = -1,
            n$2 = args.length;
        a = new Array(n$2);
        while (++i$2 < n$2) {
            a[i$2] = args[i$2];
        }
        a.splice(1, 0, onNext, onError, onCompleted);
        return fn.apply(self, a);

        function onNext(pbvf) {
            observer.onNext(pbvf);
        }

        function onError(e) {
            observer.onError(e);
        }

        function onCompleted() {
            observer.onCompleted();
        }
    });
}

function setPathsAsObservable() {
    var fn = setPaths,
        self = this,
        args;
    var i = -1,
        n = arguments.length;
    args = new Array(n);
    while (++i < n) {
        args[i] = arguments[i];
    }
    return Observable.createWithDisposable(function (observer) {
        var a;
        var i$2 = -1,
            n$2 = args.length;
        a = new Array(n$2);
        while (++i$2 < n$2) {
            a[i$2] = args[i$2];
        }
        a.splice(1, 0, onNext, onError, onCompleted);
        return fn.apply(self, a);

        function onNext(pbvf) {
            observer.onNext(pbvf);
        }

        function onError(e) {
            observer.onError(e);
        }

        function onCompleted() {
            observer.onCompleted();
        }
    });
}

function setPBFAsObservable() {
    var fn = setPBF,
        self = this,
        args;
    var i = -1,
        n = arguments.length;
    args = new Array(n);
    while (++i < n) {
        args[i] = arguments[i];
    }
    return Observable.createWithDisposable(function (observer) {
        var a;
        var i$2 = -1,
            n$2 = args.length;
        a = new Array(n$2);
        while (++i$2 < n$2) {
            a[i$2] = args[i$2];
        }
        a.splice(1, 0, onNext, onError, onCompleted);
        return fn.apply(self, a);

        function onNext(pbvf) {
            observer.onNext(pbvf);
        }

        function onError(e) {
            observer.onError(e);
        }

        function onCompleted() {
            observer.onCompleted();
        }
    });
}

function invalidatePathsAsObservable() {
    var fn = invalidatePaths,
        self = this,
        args;
    var i = -1,
        n = arguments.length;
    args = new Array(n);
    while (++i < n) {
        args[i] = arguments[i];
    }
    return Observable.createWithDisposable(function (observer) {
        var a;
        var i$2 = -1,
            n$2 = args.length;
        a = new Array(n$2);
        while (++i$2 < n$2) {
            a[i$2] = args[i$2];
        }
        a.splice(1, 0, onNext, onError, onCompleted);
        return fn.apply(self, a);

        function onNext(pbvf) {
            observer.onNext(pbvf);
        }

        function onError(e) {
            observer.onError(e);
        }

        function onCompleted() {
            observer.onCompleted();
        }
    });
}

function callPathAsObservable() {
    var fn = callPath,
        self = this,
        args;
    var i = -1,
        n = arguments.length;
    args = new Array(n);
    while (++i < n) {
        args[i] = arguments[i];
    }
    return Observable.createWithDisposable(function (observer) {
        var a;
        var i$2 = -1,
            n$2 = args.length;
        a = new Array(n$2);
        while (++i$2 < n$2) {
            a[i$2] = args[i$2];
        }
        a.splice(1, 0, onNext, onError, onCompleted);
        return fn.apply(self, a);

        function onNext(pbvf) {
            observer.onNext(pbvf);
        }

        function onError(e) {
            observer.onError(e);
        }

        function onCompleted() {
            observer.onCompleted();
        }
    });
}

function getPathsAsPromises() {
    // todo
    return [];
}

function setPathsAsPromises() {
    // todo
    return [];
}

function setPBFAsPromises() {
    // todo
    return [];
}

function invalidatePathsAsPromise() {
    // todo
    return [];
}

function callPathAsPromise() {
    // todo
    return [];
}

function toBatched() {
    if (this['_batched'] === true) {
        return this;
    }
    var pe = Object.create(this);
    pe['_batched'] = true;
    return pe;
}

function toIndependent() {
    if (this['_batched'] === false) {
        return this;
    }
    var pe = Object.create(this);
    pe['_batched'] = false;
    return pe;
}

function toLazy() {
    if (this['_lazy'] === true) {
        return this;
    }
    var pe = Object.create(this);
    pe['_lazy'] = true;
    return pe;
}

function toEager() {
    if (this['_lazy'] === false) {
        return this;
    }
    var pe = Object.create(this);
    pe['_lazy'] = false;
    return pe;
}

function toProgressive() {
    if (this['_streaming'] === true) {
        return this;
    }
    var pe = Object.create(this);
    pe['_streaming'] = true;
    return pe;
}

function toAggregate() {
    if (this['_streaming'] === false) {
        return this;
    }
    var pe = Object.create(this);
    pe['_streaming'] = false;
    return pe;
}

function toRemote() {
    if (this['_connected'] === true) {
        return this;
    }
    var pe = Object.create(this);
    pe['_connected'] = true;
    return pe;
}

function toLocal() {
    if (this['_connected'] === false) {
        return this;
    }
    var pe = Object.create(this);
    pe['_connected'] = false;
    return pe;
}

function toRefreshed() {
    if (this['_refreshing'] === true) {
        return this;
    }
    var pe = Object.create(this);
    pe['_refreshing'] = true;
    return pe;
}

function toCached() {
    if (this['_refreshing'] === false) {
        return this;
    }
    var pe = Object.create(this);
    pe['_refreshing'] = false;
    return pe;
}

function toMaterialized() {
    if (this['_materialized'] === true) {
        return this;
    }
    var pe = Object.create(this);
    pe['_materialized'] = true;
    return pe;
}

function toDematerialized() {
    if (this['_materialized'] === false) {
        return this;
    }
    var pe = Object.create(this);
    pe['_materialized'] = false;
    return pe;
}

function toRoot() {
    return this._root._root = this;
}

function serialize(cache) {
    var frame, keys, key, context = cache || this._cache,
        message = {},
        depth = 0,
        stack = [];
    recursing:
        while (depth >= 0) {
            frame = stack[depth] || (stack[depth] = {
                context: context,
                message: message,
                keys: Object.keys(context).filter(internalKeys)
            });
            context = frame.context;
            message = frame.message;
            keys = frame.keys;
            while ((key = keys.pop()) != null) {
                context = context[key];
                if (context == null || typeof context !== 'object') {
                    message[key] = context;
                    context = frame.context;
                } else if ( // TODO: replace this with a faster Array check.
                    Array.isArray(context)) {
                    message = message[key] || (message[key] = []);
                    ++depth;
                    continue recursing;
                } else {
                    message = message[key] || (message[key] = {});
                    ++depth;
                    continue recursing;
                }
            }
            stack[depth--] = void 0;
        }
    return message;

    function internalKeys(x) {
        return x[0] !== '_' || x[1] !== '_';
    }
}

function deserialize(cache) {
    var frame, keys, key, context = cache,
        depth = 0,
        stack = [],
        path = [],
        paths = [];
    recursing:
        while (depth >= 0) {
            frame = stack[depth] || (stack[depth] = {
                context: context,
                keys: Object.keys(context).filter(internalKeys)
            });
            context = frame.context;
            keys = frame.keys;
            while ((key = keys.pop()) != null) {
                path[depth] = key;
                context = context[key];
                if (context == null || typeof context !== 'object' || context.$type !== void 0 || Array.isArray(context)) {
                    paths.push(path.slice(0, depth + 1));
                    context = frame.context;
                } else {
                    ++depth;
                    continue recursing;
                }
            }
            stack[depth--] = void 0;
        }
    setPBF.call(this, {
        paths: paths,
        value: cache
    }, null, null, null, this._cache, this._cache);
    return this;

    function internalKeys(x) {
        return x[0] !== '$' && (x[0] !== '_' || x[1] !== '_');
    }
}

function stringify(obj, replacer, space) {
    return JSON.stringify(flatten(obj), replacer, space);
}

function flatten(obj) {
    var flattenedObject, keys, keyCount, key;
    if (obj === null || typeof obj !== 'object') {
        return obj;
    } else if (obj instanceof Array) {
        flattenedObject = [];
        for (keyCount = 0; keyCount < obj.length; keyCount++) {
            flattenedObject.push(flatten(obj[keyCount]));
        }
        return flattenedObject;
    } else {
        flattenedObject = {};
        do {
            keys = Object.keys(obj);
            keys.sort();
            for (keyCount = 0; keyCount < keys.length; keyCount++) {
                key = keys[keyCount];
                if (key[0] !== '_' || key[1] !== '_') {
                    flattenedObject[key] = flatten(obj[key]);
                }
            }
            obj = Object.getPrototypeOf(obj);
        } while (obj != null);
        return flattenedObject;
    }
}

function collapse(pathMap) {
    return rangeCollapse(buildQueries(pathMap));
}

function rangeCollapse(paths) {
    paths.forEach(function (path) {
        path.forEach(function (elt, index) {
            var range;
            if (Array.isArray(elt) && elt.every(isNumber) && allUnique(elt)) {
                elt.sort(function (a, b) {
                    return a - b;
                });
                if (elt[elt.length - 1] - elt[0] === elt.length - 1) {
                    // create range
                    range = {};
                    range.from = elt[0];
                    range.to = elt[elt.length - 1];
                    path[index] = range;
                }
            }
        });
    });
    return paths;
}

function isNumber(val) {
    return typeof val === 'number';
}

function allUnique(arr) {
    var hash = {},
        index, len;
    for (index = 0, len = arr.length; index < len; index++) {
        if (hash[arr[index]]) {
            return false;
        }
        hash[arr[index]] = true;
    }
    return true;
}

function sortLol(lol) {
    return lol.reduce(function (result, curr) {
        if (curr instanceof Array) {
            result.push(sortLol(curr).slice(0).sort());
            return result;
        }
        return result.concat(curr);
    }, []).slice(0).sort();
}

function createKey(list) {
    return JSON.stringify(sortLol(list));
}

function notPathMapInternalKeys(key) {
    return key !== '__observers' && key !== '__pending' && key !== '__batchID';
}
/**
 * Builds the set of collapsed
 * queries by traversing the tree
 * once
 */
var charPattern = /\D/i;

function buildQueries(root) {
    var children = Object.keys(root).filter(notPathMapInternalKeys),
        child, memo, paths, key, childIsNum, list, head, tail, clone, results, i = -1,
        n = children.length,
        j, k, x;
    if (n === 0 || Array.isArray(root) === true) {
        return [
            []
        ];
    }
    memo = {};
    while (++i < n) {
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
    for (x in memo) {
        head = (list = memo[x]).head;
        tail = list.tail;
        i = -1;
        n = tail.length;
        while (++i < n) {
            list = tail[i];
            j = -1;
            k = list.length;
            if (head[0] === '') {
                clone = [];
            } else {
                clone = [head.length === 1 ? head[0] : head];
                while (++j < k) {
                    clone[j + 1] = list[j];
                }
            }
            results[results.length] = clone;
        }
    }
    return results;
}

function BatchRequestQueue(rootPE) {
    this.rootPE = rootPE;
    this.requests = [];
}
BatchRequestQueue.prototype.get = function () {
    var xs = this.requests,
        n = xs.length,
        i = n,
        batch;
    while (--i > -1) {
        if ((batch = xs[i]) != null && batch.pending !== true) {
            return batch;
        }
    }
    return xs[n] = new BatchRequest(this.rootPE, this);
};
BatchRequestQueue.prototype.remove = function (request) {
    var a, i;
    a = this.requests;
    if ((i = a.indexOf(request)) !== -1) {
        a.splice(i, 1);
    }
};
BatchRequestQueue.prototype.batch = function (originalPaths, optimizedPaths, observer) {
    return this.get().batch(originalPaths, optimizedPaths, observer);
};
BatchRequestQueue.prototype.flush = function (originalPaths, optimizedPaths, observer) {
    return new BatchRequest(this.rootPE, this).flush(originalPaths, optimizedPaths, observer);
};

function BatchRequest(rootPE, queue) {
    this.rootPE = rootPE;
    this.requestQueue = queue;
    this.originalsSet = {
        __observers: []
    };
    this.optimizedSet = {
        __observers: []
    };
    this.observers = 0;
    this.pending = false;
    this.operation = null;
}
BatchRequest.prototype.batch = function (originalPaths, optimizedPaths, observer) {
    var self = this,
        rootPE = self.rootPE,
        originalsSet = self.originalsSet,
        optimizedSet = self.optimizedSet,
        requestQueue = self.requestQueue;
    originalsSet = rootPE._pathMapWithObserver(originalPaths, observer, originalsSet);
    optimizedSet = rootPE._pathMapWithObserver(optimizedPaths, null, optimizedSet);
    self.originalsSet = originalsSet;
    self.optimizedSet = optimizedSet;
    if (++self.observers === 1) {
        var pendingID = setTimeout(function () {
            pendingID = -1;
            self.flush();
        }, 16);
        self.operation = {
            dispose: function () {
                if (pendingID !== -1) {
                    clearTimeout(pendingID);
                }
                pendingID = -1;
                requestQueue.remove(self);
            }
        };
    }
    return {
        dispose: function () {
            var operation;
            originalsSet = rootPE._pathMapWithoutObserver(originalPaths, observer, originalsSet);
            optimizedSet = rootPE._pathMapWithoutObserver(optimizedPaths, null, optimizedSet);
            self.originalsSet = originalsSet;
            self.optimizedSet = optimizedSet;
            if (--self.observers <= 0) {
                requestQueue.remove(self);
                (operation = self.operation) && operation.dispose();
                self.operation = null;
                self.pending = false;
            }
        }
    };
};
BatchRequest.prototype.flush = function (originalPaths, optimizedPaths, observer) {
    var self = this,
        rootPE = self.rootPE,
        originalsSet = self.originalsSet,
        optimizedSet = self.optimizedSet;
    self.pending = true;
    if (originalPaths && optimizedPaths && observer) {
        originalsSet = rootPE._pathMapWithObserver(originalPaths, observer, originalsSet);
        optimizedSet = rootPE._pathMapWithObserver(optimizedPaths, null, optimizedSet);
        self.observers++;
    }
    self.originalsSet = originalsSet;
    self.optimizedSet = optimizedSet;
    var paths, pbf, collapseDelayID, operation, getOperation, pendingRequestDecremented = false;
    collapseDelayID = setTimeout(function () {
        collapseDelayID = -1;
        paths = rootPE._collapse(self.originalsSet);
    }, 16);
    rootPE._pendingRequests = (rootPE._pendingRequests || 0) + 1;
    self.operation = {
        dispose: function () {
            if (operation) {
                if (typeof operation === 'function') {
                    operation();
                } else if (operation.dispose) {
                    operation.dispose();
                }
            }
        }
    };
    operation = {
        dispose: function () {
            if (getOperation) {
                if (typeof getOperation === 'function') {
                    getOperation();
                } else if (getOperation.dispose) {
                    getOperation.dispose();
                }
            }
            if (pendingRequestDecremented === false) {
                pendingRequestDecremented = true;
                rootPE._pendingRequests -= 1;
            }
            if (collapseDelayID !== -1) {
                clearTimeout(collapseDelayID);
                collapseDelayID = -1;
            }
        }
    };
    getOperation = rootPE.loader.get(rootPE._collapse(self.optimizedSet)).subscribe(function onNext(x) {
        pbf = x;
    }, function onError(e) {
        operation.dispose();
        var x, xs = self.originalsSet.__observers.concat(),
            i = -1,
            n = xs.length;
        while (++i < n) {
            (x = xs[i]).onError && x.onError(e);
        }
    }, function onCompleted() {
        if (pendingRequestDecremented === false) {
            pendingRequestDecremented = true;
            rootPE._pendingRequests -= 1;
        }
        if (pbf != null) {
            if (collapseDelayID !== -1) {
                clearTimeout(collapseDelayID);
                collapseDelayID = -1;
                paths = rootPE._collapse(self.originalsSet);
            }
            pbf.paths = paths;
            var serverErrors = [pbf.error],
                error, projectError = rootPE._errorSelector;
            while (( // TODO: retry certain errors
                error = serverErrors.pop()) !== void 0) {
                if (error.innerErrors) {
                    serverErrors.push.apply(serverErrors, error.innerErrors);
                } else {
                    error['$type'] = 'error';
                    rootPE._setPath(error.path || error.pql, projectError(error), pbf.value);
                }
            }
            pbf.batchedPathMap = self.originalsSet;
            operation = rootPE._setPBF(pbf, null, null, null, rootPE._cache, rootPE._cache, []);
        } else {
            var x, xs = self.originalsSet.__observers.concat(),
                i = -1,
                n = xs.length;
            while (++i < n) {
                (x = xs[i]).onCompleted && x.onCompleted();
            }
        }
    });
    return self.operation;
};
module.exports = PathEvaluator;