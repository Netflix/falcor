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
var Rx = {Observable: {}};
var Observable = Rx.Observable;

var falcor = {},
    __GENERATION_GUID = 0,
    __GENERATION_VERSION = 0,
    __CONTAINER = "__reference_container",
    __CONTEXT = "__context",
    __GENERATION = "__generation",
    __GENERATION_UPDATED = "__generation_updated",
    __INVALIDATED = "__invalidated",
    __KEY = "__key",
    __KEYS = "__keys",
    __IS_KEY_SET = "__is_key_set",
    __NULL = "__null",
    __SELF = "./",
    __PARENT = "../",
    __REF = "__ref",
    __REF_INDEX = "__ref_index",
    __REFS_LENGTH = "__refs_length",
    __ROOT = "/",
    __OFFSET = "__offset",
    __FALKOR_EMPTY_OBJECT = '__FALKOR_EMPTY_OBJECT',
    __INTERNAL_KEYS = [
        __CONTAINER, __CONTEXT, __GENERATION, __GENERATION_UPDATED,
        __INVALIDATED, __KEY, __KEYS, __IS_KEY_SET, __NULL, __SELF,
        __PARENT, __REF, __REF_INDEX, __REFS_LENGTH, __OFFSET, __ROOT
    ];

var $TYPE = "$type",
    $SIZE = "$size",
    $EXPIRES = "$expires",
    $TIMESTAMP = "$timestamp";
 
var SENTINEL = "sentinel",
    ERROR = "error",
    VALUE = "value",
    EXPIRED = "expired",
    LEAF = "leaf";

function now() {
    return Date.now();
}

function NOOP() {};

falcor.__Internals = {};
falcor.Observable = Rx.Observable;
falcor.EXPIRES_NOW = 0;
falcor.EXPIRES_NEVER = 1;

falcor.Model = Model;

Model.EXPIRES_NOW = falcor.EXPIRES_NOW;
Model.EXPIRES_NEVER = falcor.EXPIRES_NEVER;

function Model(options) {
    options || (options = {});
    this._dataSource = options.source;
    this._cache = {};
    if(options.cache && typeof options.cache === "object") {
        this.setCache(options.cache);
    }
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
    _errorSelector: function(x, y) { return y; },
    setCache: function(cache) {
        return this._setPathMapsAsValues(this, [cache], undefined, this._errorSelector, []);
    },
    _getPathsAsValues        :      getPathsAsValues,
    _getPathsAsPathMap:      getPathsAsPathMap,
    _setPathMapsAsValues     :   setPathMapsAsValues
};
function getPathsAsPathMap(model, pathSets, values, errorSelector, boundPath) {
    var boundLength = 0, nodeRoot = model._cache || (model._cache = {}), nodeParent, node;
    if (Array.isArray(boundPath)) {
        nodeParent = nodeRoot;
        boundLength = boundPath.length;
    } else {
        nodeParent = getBoundContext(model);
        boundPath = model._path || [];
    }
    var root = model._root || model, boxed = model._boxed || false, expired = root.expired || (root.expired = []), refreshing = model._refreshing || false, appendNullKey = false;
    typeof errorSelector === 'function' || (errorSelector = model._errorSelector) || (errorSelector = function (x$6, y) {
        return y;
    });
    var nodes = pathSets.nodes || (pathSets.nodes = []);
    var jsons = pathSets.jsons || (pathSets.jsons = []);
    var errors = pathSets.errors || (pathSets.errors = []);
    var refs = pathSets.refs || (pathSets.refs = []);
    var depth = pathSets.depth || (pathSets.depth = 0);
    var refIndex = pathSets.refIndex || (pathSets.refIndex = 0);
    var refDepth = pathSets.refDepth || (pathSets.refDepth = 0);
    var requestedPath = pathSets.requestedPath || (pathSets.requestedPath = []);
    var optimizedPath = pathSets.optimizedPath || (pathSets.optimizedPath = []);
    var requestedPaths = pathSets.requestedPaths || (pathSets.requestedPaths = []);
    var optimizedPaths = pathSets.optimizedPaths || (pathSets.optimizedPaths = []);
    var requestedMissingPaths = pathSets.requestedMissingPaths || (pathSets.requestedMissingPaths = []);
    var optimizedMissingPaths = pathSets.optimizedMissingPaths || (pathSets.optimizedMissingPaths = []);
    var hasValue = pathSets.hasValue || (pathSets.hasValue = false);
    var jsonRoot = pathSets.jsonRoot || (pathSets.jsonRoot = values && values[0]);
    var jsonParent = pathSets.jsonParent || (pathSets.jsonParent = jsonRoot);
    var jsonNode = pathSets.jsonNode || (pathSets.jsonNode = jsonParent);
    var path, length = 0, height = 0, reference, refLength = 0, refHeight = 0, nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires;
    refs[-1] = boundPath;
    nodes[-1] = nodeParent;
    jsons[-1] = jsonParent;
    jsons[-2] = jsons;
    var index = -1, count = pathSets.length;
    while (++index < count) {
        path = pathSets[index];
        depth = 0;
        length = path.length;
        height = length - 1;
        var ref;
        refs.length = 0;
        while (depth > -1) {
            refIndex = depth;
            while (--refIndex >= -1) {
                if (!!(ref = refs[refIndex])) {
                    refLength = ref.length;
                    var i = -1, j = 0;
                    while (++i < refLength) {
                        optimizedPath[j++] = ref[i];
                    }
                    i = ++refIndex;
                    while (i < depth) {
                        optimizedPath[j++] = requestedPath[i++];
                    }
                    optimizedPath.length = j;
                    break;
                }
            }
            var key, isKeySet;
            path = path;
            height = (length = path.length) - 1;
            nodeParent = nodes[depth - 1];
            nodeType = nodeParent && nodeParent[$TYPE] || void 0;
            nodeValue = nodeType === SENTINEL ? nodeParent[VALUE] : nodeParent;
            if (nodeParent == null || nodeType !== void 0 || typeof nodeParent !== 'object' || Array.isArray(nodeValue)) {
                node = nodeParent;
                nodeParent = nodes;
                key = depth - 1;
                isKeySet = false;
                optimizedPath[optimizedPath.length = depth + (refLength - refIndex)] = key;
                node = nodeParent[key];
                nodeType = node && node[$TYPE] || void 0;
                nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                nodeTimestamp = node && node[$TIMESTAMP];
                nodeExpires = node && node[$EXPIRES];
                if (node != null && typeof node === 'object') {
                    if (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true) {
                        node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                    } else {
                        if (nodeExpires !== 1) {
                            var root$2 = root, head = root$2.__head, tail = root$2.__tail, next = node.__next, prev = node.__prev;
                            if (node !== head) {
                                next && (next != null && typeof next === 'object') && (next.__prev = prev);
                                prev && (prev != null && typeof prev === 'object') && (prev.__next = next);
                                (next = head) && (head != null && typeof head === 'object') && (head.__prev = node);
                                root$2.__head = root$2.__next = head = node;
                                head.__next = next;
                                head.__prev = void 0;
                            }
                            if (tail == null || node === tail) {
                                root$2.__tail = root$2.__prev = tail = prev || node;
                            }
                            root$2 = head = tail = next = prev = void 0;
                        }
                    }
                }
                if (depth >= boundLength) {
                    if (node != null && jsonParent != null) {
                        if (boxed === true) {
                            jsonParent[key] = node;
                        } else {
                            var val = nodeValue;
                            if (val != null && typeof val === 'object') {
                                var src = val, keys = Object.keys(src), x, i$2 = -1, n = keys.length;
                                val = Array.isArray(src) && new Array(src.length) || Object.create(null);
                                while (++i$2 < n) {
                                    x = keys[i$2];
                                    !(!(x[0] !== '_' || x[1] !== '_') || (x === __SELF || x === __PARENT || x === __ROOT) || x[0] === '$') && (val[x] = src[x]);
                                }
                            }
                            if (val != null && typeof val === 'object' && !Array.isArray(val)) {
                                val[$TYPE] = LEAF;
                            }
                            jsonParent[key] = val;
                        }
                    }
                }
                node = node;
            } else {
                nodeParent = node = nodes[depth - 1];
                jsonParent = jsonNode = jsons[depth - 1];
                depth = depth;
                follow_path_8377:
                    do {
                        key = path[depth];
                        if (isKeySet = key != null && typeof key === 'object') {
                            if (Array.isArray(key)) {
                                if ((key = key[key.index || (key.index = 0)]) != null && typeof key === 'object') {
                                    key = key[__OFFSET] === void 0 && (key[__OFFSET] = key.from || (key.from = 0)) || key[__OFFSET];
                                }
                            } else {
                                key = key[__OFFSET] === void 0 && (key[__OFFSET] = key.from || (key.from = 0)) || key[__OFFSET];
                            }
                        }
                        if (key === __NULL) {
                            key = null;
                        }
                        depth >= boundLength && (requestedPath[requestedPath.length = depth - boundLength] = key);
                        if (key != null) {
                            if (depth < height) {
                                optimizedPath[optimizedPath.length = depth + (refLength - refIndex)] = key;
                                node = nodeParent[key];
                                nodeType = node && node[$TYPE] || void 0;
                                nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                                nodeTimestamp = node && node[$TIMESTAMP];
                                nodeExpires = node && node[$EXPIRES];
                                if (node != null && typeof node === 'object' && (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true)) {
                                    node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                                }
                                if ((!nodeType || nodeType === SENTINEL) && Array.isArray(nodeValue)) {
                                    do {
                                        if (nodeExpires !== 1) {
                                            var root$3 = root, head$2 = root$3.__head, tail$2 = root$3.__tail, next$2 = node.__next, prev$2 = node.__prev;
                                            if (node !== head$2) {
                                                next$2 && (next$2 != null && typeof next$2 === 'object') && (next$2.__prev = prev$2);
                                                prev$2 && (prev$2 != null && typeof prev$2 === 'object') && (prev$2.__next = next$2);
                                                (next$2 = head$2) && (head$2 != null && typeof head$2 === 'object') && (head$2.__prev = node);
                                                root$3.__head = root$3.__next = head$2 = node;
                                                head$2.__next = next$2;
                                                head$2.__prev = void 0;
                                            }
                                            if (tail$2 == null || node === tail$2) {
                                                root$3.__tail = root$3.__prev = tail$2 = prev$2 || node;
                                            }
                                            root$3 = head$2 = tail$2 = next$2 = prev$2 = void 0;
                                        }
                                        refs[depth] = nodeValue;
                                        refIndex = depth + 1;
                                        refDepth = 0;
                                        var location = (nodeValue[__CONTAINER] || nodeValue)[__CONTEXT];
                                        if (location !== void 0) {
                                            node = location;
                                            refHeight = (refLength = nodeValue.length) - 1;
                                            while (refDepth < refLength) {
                                                optimizedPath[refDepth] = nodeValue[refDepth++];
                                            }
                                            optimizedPath.length = refLength;
                                        } else {
                                            var key$2, isKeySet$2;
                                            reference = nodeValue;
                                            refHeight = (refLength = reference.length) - 1;
                                            nodeParent = nodeRoot;
                                            nodeType = nodeParent && nodeParent[$TYPE] || void 0;
                                            nodeValue = nodeType === SENTINEL ? nodeParent[VALUE] : nodeParent;
                                            if (nodeParent == null || nodeType !== void 0 || typeof nodeParent !== 'object' || Array.isArray(nodeValue)) {
                                                node = node = nodeParent;
                                            } else {
                                                nodeParent = nodeRoot;
                                                jsonParent = jsonRoot;
                                                refDepth = refDepth;
                                                follow_path_8560:
                                                    do {
                                                        key$2 = reference[refDepth];
                                                        isKeySet$2 = false;
                                                        if (key$2 != null) {
                                                            if (refDepth < refHeight) {
                                                                optimizedPath[optimizedPath.length = refDepth] = key$2;
                                                                node = nodeParent[key$2];
                                                                nodeType = node && node[$TYPE] || void 0;
                                                                nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                                                                nodeTimestamp = node && node[$TIMESTAMP];
                                                                nodeExpires = node && node[$EXPIRES];
                                                                if (node != null && typeof node === 'object' && (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true)) {
                                                                    node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                                                                }
                                                                if (appendNullKey = node == null || nodeType !== void 0 || typeof node !== 'object' || Array.isArray(nodeValue)) {
                                                                    nodeParent = node;
                                                                    break follow_path_8560;
                                                                }
                                                                nodeParent = node;
                                                                jsonParent = jsonNode;
                                                                refDepth = refDepth + 1;
                                                                continue follow_path_8560;
                                                            } else if (refDepth === refHeight) {
                                                                optimizedPath[optimizedPath.length = refDepth] = key$2;
                                                                node = nodeParent[key$2];
                                                                nodeType = node && node[$TYPE] || void 0;
                                                                nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                                                                nodeTimestamp = node && node[$TIMESTAMP];
                                                                nodeExpires = node && node[$EXPIRES];
                                                                if (node != null && typeof node === 'object' && (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true)) {
                                                                    node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                                                                }
                                                                if (node != null) {
                                                                    var refContainer = reference[__CONTAINER] || reference, refContext = refContainer[__CONTEXT];
                                                                    // Set up the hard-link so we don't have to do all
                                                                    // this work the next time we follow this reference.
                                                                    if (refContext === void 0) {
                                                                        // create a back reference
                                                                        var backRefs = node[__REFS_LENGTH] || 0;
                                                                        node[__REF + backRefs] = refContainer;
                                                                        node[__REFS_LENGTH] = backRefs + 1;
                                                                        // create a hard reference
                                                                        refContainer[__REF_INDEX] = backRefs;
                                                                        refContainer[__CONTEXT] = node;
                                                                        refContainer = backRefs = void 0;
                                                                    }
                                                                    ;
                                                                }
                                                                appendNullKey = node == null || nodeType !== void 0 || typeof node !== 'object' || Array.isArray(nodeValue);
                                                                nodeParent = node;
                                                                break follow_path_8560;
                                                            }
                                                        } else if (refDepth < refHeight) {
                                                            nodeParent = node;
                                                            jsonParent = jsonNode;
                                                            refDepth = refDepth + 1;
                                                            continue follow_path_8560;
                                                        }
                                                        nodeParent = node;
                                                        break follow_path_8560;
                                                    } while (true);
                                                node = nodeParent;
                                            }
                                        }
                                        nodeType = node && node[$TYPE] || void 0;
                                        nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                                        nodeExpires = node && node[$EXPIRES];
                                        if (node != null && typeof node === 'object' && (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true)) {
                                            node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                                        }
                                    } while ((!nodeType || nodeType === SENTINEL) && Array.isArray(nodeValue));
                                    if (node == null) {
                                        while (refDepth <= refHeight) {
                                            optimizedPath[refDepth] = reference[refDepth++];
                                        }
                                    }
                                }
                                if (depth >= boundLength) {
                                    if (node != null && jsonParent != null) {
                                        if (!nodeType && (node != null && typeof node === 'object') && !Array.isArray(nodeValue)) {
                                            if (!(jsonNode = jsonParent[key]) || !(jsonNode != null && typeof jsonNode === 'object')) {
                                                jsonNode = jsonParent[key] = Object.create(null);
                                            }
                                            jsonNode[__KEY] = key;
                                            jsonNode[__GENERATION] = node[__GENERATION] || 0;
                                        } else {
                                            if (boxed === true) {
                                                jsonParent[key] = node;
                                            } else {
                                                var val$2 = nodeValue;
                                                if (val$2 != null && typeof val$2 === 'object') {
                                                    var src$2 = val$2, keys$2 = Object.keys(src$2), x$2, i$3 = -1, n$2 = keys$2.length;
                                                    val$2 = Array.isArray(src$2) && new Array(src$2.length) || Object.create(null);
                                                    while (++i$3 < n$2) {
                                                        x$2 = keys$2[i$3];
                                                        !(!(x$2[0] !== '_' || x$2[1] !== '_') || (x$2 === __SELF || x$2 === __PARENT || x$2 === __ROOT) || x$2[0] === '$') && (val$2[x$2] = src$2[x$2]);
                                                    }
                                                }
                                                if (val$2 != null && typeof val$2 === 'object' && !Array.isArray(val$2)) {
                                                    val$2[$TYPE] = LEAF;
                                                }
                                                jsonParent[key] = val$2;
                                            }
                                        }
                                    }
                                }
                                if (node == null || nodeType !== void 0 || typeof node !== 'object' || Array.isArray(nodeValue)) {
                                    nodeParent = node;
                                    break follow_path_8377;
                                }
                                nodeParent = nodes[depth] = node;
                                jsonParent = jsons[depth] = jsonNode;
                                depth = depth + 1;
                                continue follow_path_8377;
                            } else if (depth === height) {
                                optimizedPath[optimizedPath.length = depth + (refLength - refIndex)] = key;
                                node = nodeParent[key];
                                nodeType = node && node[$TYPE] || void 0;
                                nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                                nodeTimestamp = node && node[$TIMESTAMP];
                                nodeExpires = node && node[$EXPIRES];
                                if (node != null && typeof node === 'object') {
                                    if (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true) {
                                        node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                                    } else {
                                        if (nodeExpires !== 1) {
                                            var root$4 = root, head$3 = root$4.__head, tail$3 = root$4.__tail, next$3 = node.__next, prev$3 = node.__prev;
                                            if (node !== head$3) {
                                                next$3 && (next$3 != null && typeof next$3 === 'object') && (next$3.__prev = prev$3);
                                                prev$3 && (prev$3 != null && typeof prev$3 === 'object') && (prev$3.__next = next$3);
                                                (next$3 = head$3) && (head$3 != null && typeof head$3 === 'object') && (head$3.__prev = node);
                                                root$4.__head = root$4.__next = head$3 = node;
                                                head$3.__next = next$3;
                                                head$3.__prev = void 0;
                                            }
                                            if (tail$3 == null || node === tail$3) {
                                                root$4.__tail = root$4.__prev = tail$3 = prev$3 || node;
                                            }
                                            root$4 = head$3 = tail$3 = next$3 = prev$3 = void 0;
                                        }
                                    }
                                }
                                if (depth >= boundLength) {
                                    if (node != null && jsonParent != null) {
                                        if (boxed === true) {
                                            jsonParent[key] = node;
                                        } else {
                                            var val$3 = nodeValue;
                                            if (val$3 != null && typeof val$3 === 'object') {
                                                var src$3 = val$3, keys$3 = Object.keys(src$3), x$3, i$4 = -1, n$3 = keys$3.length;
                                                val$3 = Array.isArray(src$3) && new Array(src$3.length) || Object.create(null);
                                                while (++i$4 < n$3) {
                                                    x$3 = keys$3[i$4];
                                                    !(!(x$3[0] !== '_' || x$3[1] !== '_') || (x$3 === __SELF || x$3 === __PARENT || x$3 === __ROOT) || x$3[0] === '$') && (val$3[x$3] = src$3[x$3]);
                                                }
                                            }
                                            if (val$3 != null && typeof val$3 === 'object' && !Array.isArray(val$3)) {
                                                val$3[$TYPE] = LEAF;
                                            }
                                            jsonParent[key] = val$3;
                                        }
                                    }
                                }
                                appendNullKey = false;
                                nodeParent = node;
                                break follow_path_8377;
                            }
                        } else if (depth < height) {
                            nodeParent = nodeParent;
                            jsonParent = jsonParent;
                            depth = depth + 1;
                            continue follow_path_8377;
                        }
                        nodeParent = node;
                        break follow_path_8377;
                    } while (true);
                node = nodeParent;
            }
            if (node != null || boxed === true) {
                if (nodeType === ERROR) {
                    if (nodeExpires !== 1) {
                        var root$5 = root, head$4 = root$5.__head, tail$4 = root$5.__tail, next$4 = node.__next, prev$4 = node.__prev;
                        if (node !== head$4) {
                            next$4 && (next$4 != null && typeof next$4 === 'object') && (next$4.__prev = prev$4);
                            prev$4 && (prev$4 != null && typeof prev$4 === 'object') && (prev$4.__next = next$4);
                            (next$4 = head$4) && (head$4 != null && typeof head$4 === 'object') && (head$4.__prev = node);
                            root$5.__head = root$5.__next = head$4 = node;
                            head$4.__next = next$4;
                            head$4.__prev = void 0;
                        }
                        if (tail$4 == null || node === tail$4) {
                            root$5.__tail = root$5.__prev = tail$4 = prev$4 || node;
                        }
                        root$5 = head$4 = tail$4 = next$4 = prev$4 = void 0;
                    }
                    var nodeType$2 = node && node[$TYPE] || void 0;
                    nodeValue = nodeType$2 === SENTINEL ? node[VALUE] : nodeType$2 === ERROR ? node = errorSelector(requestedPath, node) : node;
                    var pbv = Object.create(null);
                    var src$4 = requestedPath, i$5 = -1, n$4 = src$4.length, req = new Array(n$4);
                    while (++i$5 < n$4) {
                        req[i$5] = src$4[i$5];
                    }
                    if (appendNullKey === true) {
                        req[req.length] = null;
                    }
                    pbv.path = req;
                    if (boxed === true) {
                        pbv.value = node;
                    } else {
                        var dest = nodeValue, src$5 = dest, x$4;
                        if (dest != null && typeof dest === 'object') {
                            dest = Array.isArray(src$5) && [] || Object.create(null);
                            for (x$4 in src$5) {
                                !(!(x$4[0] !== '_' || x$4[1] !== '_') || (x$4 === __SELF || x$4 === __PARENT || x$4 === __ROOT) || x$4[0] === '$') && (dest[x$4] = src$5[x$4]);
                            }
                        }
                        pbv.value = dest;
                    }
                    errors[errors.length] = pbv;
                }
                hasValue || (hasValue = jsonParent != null);
                var src$6 = optimizedPath, i$6 = -1, n$5 = src$6.length, opt = new Array(n$5);
                while (++i$6 < n$5) {
                    opt[i$6] = src$6[i$6];
                }
                var src$7 = requestedPath, i$7 = -1, n$6 = src$7.length, req$2 = new Array(n$6);
                while (++i$7 < n$6) {
                    req$2[i$7] = src$7[i$7];
                }
                if (appendNullKey === true) {
                    req$2[req$2.length] = null;
                }
                requestedPaths[requestedPaths.length] = req$2;
                optimizedPaths[optimizedPaths.length] = opt;
            }
            if (boxed === false && node == null || refreshing === true) {
                var src$8 = boundPath, i$8 = -1, n$7 = src$8.length, req$3 = new Array(n$7);
                while (++i$8 < n$7) {
                    req$3[i$8] = src$8[i$8];
                }
                var src$9 = optimizedPath, i$9 = -1, n$8 = src$9.length, opt$2 = new Array(n$8);
                while (++i$9 < n$8) {
                    opt$2[i$9] = src$9[i$9];
                }
                var reqLen = req$3.length - 1, optLen = opt$2.length - 1, i$10 = -1, n$9 = requestedPath.length, j$2 = depth, k = height, x$5;
                while (++i$10 < n$9) {
                    req$3[++reqLen] = path[i$10 + boundLength] != null && typeof path[i$10 + boundLength] === 'object' && [requestedPath[i$10]] || requestedPath[i$10];
                }
                i$10 = -1;
                n$9 = height - depth;
                while (++i$10 < n$9) {
                    x$5 = req$3[++reqLen] = path[++j$2 + boundLength];
                    x$5 != null && (opt$2[++optLen] = x$5);
                }
                req$3.pathSetIndex = index;
                requestedMissingPaths[requestedMissingPaths.length] = req$3;
                optimizedMissingPaths[optimizedMissingPaths.length] = opt$2;
            }
            appendNullKey = false;
            var key$3;
            depth = depth;
            unroll_8225:
                do {
                    if (depth < 0) {
                        depth = (path.depth = 0) - 1;
                        break unroll_8225;
                    }
                    if (!((key$3 = path[depth]) != null && typeof key$3 === 'object')) {
                        depth = path.depth = depth - 1;
                        continue unroll_8225;
                    }
                    if (Array.isArray(key$3)) {
                        if (++key$3.index === key$3.length) {
                            if (!((key$3 = key$3[key$3.index = 0]) != null && typeof key$3 === 'object')) {
                                depth = path.depth = depth - 1;
                                continue unroll_8225;
                            }
                        } else {
                            depth = path.depth = depth;
                            break unroll_8225;
                        }
                    }
                    if (++key$3[__OFFSET] > (key$3.to || (key$3.to = key$3.from + (key$3.length || 1) - 1))) {
                        key$3[__OFFSET] = key$3.from;
                        depth = path.depth = depth - 1;
                        continue unroll_8225;
                    }
                    depth = path.depth = depth;
                    break unroll_8225;
                } while (true);
            depth = depth;
        }
    }
    values && (values[0] = hasValue && { json: jsons[-1] } || undefined);
    return {
        'values': values,
        'errors': errors,
        'requestedPaths': requestedPaths,
        'optimizedPaths': optimizedPaths,
        'requestedMissingPaths': requestedMissingPaths,
        'optimizedMissingPaths': optimizedMissingPaths
    };
}
function setPathMapsAsValues(model, pathMaps, values, errorSelector, boundPath) {
    ++__GENERATION_VERSION;
    Array.isArray(values) && (values.length = 0);
    var boundLength = 0, nodeRoot = model._cache || (model._cache = {}), nodeParent, node;
    if (Array.isArray(boundPath)) {
        nodeParent = nodeRoot;
        boundLength = boundPath.length;
    } else {
        nodeParent = getBoundContext(model);
        boundPath = model._path || [];
    }
    var root = model._root || model, boxed = model._boxed || false, expired = root.expired || (root.expired = []), refreshing = model._refreshing || false, appendNullKey = false;
    typeof errorSelector === 'function' || (errorSelector = model._errorSelector) || (errorSelector = function (x$4, y$2) {
        return y$2;
    });
    var pathMapStack = pathMaps.pathMapStack || (pathMaps.pathMapStack = []);
    var nodes = pathMaps.nodes || (pathMaps.nodes = []);
    var errors = pathMaps.errors || (pathMaps.errors = []);
    var refs = pathMaps.refs || (pathMaps.refs = []);
    var depth = pathMaps.depth || (pathMaps.depth = 0);
    var refIndex = pathMaps.refIndex || (pathMaps.refIndex = 0);
    var refDepth = pathMaps.refDepth || (pathMaps.refDepth = 0);
    var requestedPath = pathMaps.requestedPath || (pathMaps.requestedPath = []);
    var optimizedPath = pathMaps.optimizedPath || (pathMaps.optimizedPath = []);
    var requestedPaths = pathMaps.requestedPaths || (pathMaps.requestedPaths = []);
    var optimizedPaths = pathMaps.optimizedPaths || (pathMaps.optimizedPaths = []);
    var requestedMissingPaths = pathMaps.requestedMissingPaths || (pathMaps.requestedMissingPaths = []);
    var optimizedMissingPaths = pathMaps.optimizedMissingPaths || (pathMaps.optimizedMissingPaths = []);
    var pathMap, length = 0, height = 0, reference, refLength = 0, refHeight = 0, nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires;
    refs[-1] = boundPath;
    nodes[-1] = nodeParent;
    var index = -1, count = pathMaps.length;
    while (++index < count) {
        pathMap = pathMaps[index];
        pathMapStack[0] = pathMap;
        depth = 0;
        length = pathMap.length;
        height = length - 1;
        var ref;
        refs.length = 0;
        while (depth > -1) {
            refIndex = depth;
            while (--refIndex >= -1) {
                if (!!(ref = refs[refIndex])) {
                    refLength = ref.length;
                    var i = -1, j = 0;
                    while (++i < refLength) {
                        optimizedPath[j++] = ref[i];
                    }
                    i = ++refIndex;
                    while (i < depth) {
                        optimizedPath[j++] = requestedPath[i++];
                    }
                    optimizedPath.length = j;
                    break;
                }
            }
            var offset, keys, index$2, key, isKeySet;
            pathMap = pathMap;
            height = (length = depth) - 1;
            nodeParent = nodes[depth - 1];
            nodeType = nodeParent && nodeParent[$TYPE] || void 0;
            nodeValue = nodeType === SENTINEL ? nodeParent[VALUE] : nodeParent;
            if (nodeParent == null || nodeType !== void 0 || typeof nodeParent !== 'object' || Array.isArray(nodeValue)) {
                node = nodeParent;
                nodeParent = nodes;
                key = depth - 1;
                isKeySet = false;
                optimizedPath[optimizedPath.length = depth + (refLength - refIndex)] = key;
                node = nodeParent[key];
                nodeType = node && node[$TYPE] || void 0;
                nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                nodeTimestamp = node && node[$TIMESTAMP];
                nodeExpires = node && node[$EXPIRES];
                if (node != null && typeof node === 'object' && (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true)) {
                    node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                }
                nodeType = pathMap && pathMap[$TYPE] || void 0;
                nodeValue = nodeType === SENTINEL ? pathMap[VALUE] : pathMap;
                nodeTimestamp = pathMap && pathMap[$TIMESTAMP];
                nodeExpires = pathMap && pathMap[$EXPIRES];
                var newNode, size_offset, leafSize = node && node[$SIZE] || 0;
                newNode = pathMap;
                if ((!nodeType || nodeType === SENTINEL) && Array.isArray(nodeValue)) {
                    nodeType = 'array';
                    newNode[$SIZE] = nodeSize = (nodeType === SENTINEL && 50 || 0) + (nodeValue.length || 1);
                    delete nodeValue[$SIZE];
                    nodeValue[__CONTAINER] = newNode;
                } else if (nodeType === SENTINEL) {
                    newNode[$SIZE] = nodeSize = 50 + (typeof nodeValue === 'string' && nodeValue.length || 1);
                } else if (nodeType === ERROR) {
                    newNode[$SIZE] = nodeSize = pathMap && pathMap[$SIZE] || 0 || 50 + 1;
                } else if (!(pathMap != null && typeof pathMap === 'object')) {
                    nodeSize = 50 + (typeof nodeValue === 'string' && nodeValue.length || 1);
                    nodeType = 'sentinel';
                    newNode = { 'value': nodeValue };
                    newNode[$TYPE] = nodeType;
                    newNode[$SIZE] = nodeSize;
                } else {
                    nodeType = newNode[$TYPE] = nodeType || 'leaf';
                    newNode[$SIZE] = nodeSize = pathMap && pathMap[$SIZE] || 0 || 50 + 1;
                }
                ;
                if (node != null && node !== newNode) {
                    var nodeRefsLength = node[__REFS_LENGTH] || 0, destRefsLength = newNode[__REFS_LENGTH] || 0, i$2 = -1, ref$2;
                    while (++i$2 < nodeRefsLength) {
                        if ((ref$2 = node[__REF + i$2]) !== void 0) {
                            ref$2[__CONTEXT] = newNode;
                            newNode[__REF + (destRefsLength + i$2)] = ref$2;
                            node[__REF + i$2] = void 0;
                        }
                    }
                    newNode[__REFS_LENGTH] = nodeRefsLength + destRefsLength;
                    node[__REFS_LENGTH] = ref$2 = void 0;
                    var invParent = nodeParent, invChild = node, invKey = key, keys$2, index$3, offset$2, childType, childValue, isBranch, stack = [
                        nodeParent,
                        invKey,
                        node
                    ], depth$2 = 0;
                    while (depth$2 > -1) {
                        nodeParent = stack[offset$2 = depth$2 * 8];
                        invKey = stack[offset$2 + 1];
                        node = stack[offset$2 + 2];
                        if ((childType = stack[offset$2 + 3]) === void 0 || (childType = void 0)) {
                            childType = stack[offset$2 + 3] = node && node[$TYPE] || void 0 || null;
                        }
                        childValue = stack[offset$2 + 4] || (stack[offset$2 + 4] = childType === SENTINEL ? node[VALUE] : node);
                        if ((isBranch = stack[offset$2 + 5]) === void 0) {
                            isBranch = stack[offset$2 + 5] = !childType && (node != null && typeof node === 'object') && !Array.isArray(childValue);
                        }
                        if (isBranch === true) {
                            if ((keys$2 = stack[offset$2 + 6]) === void 0) {
                                keys$2 = stack[offset$2 + 6] = [];
                                index$3 = -1;
                                for (invKey in node) {
                                    !(!(invKey[0] !== '_' || invKey[1] !== '_') || (invKey === __SELF || invKey === __PARENT || invKey === __ROOT) || invKey[0] === '$') && (keys$2[++index$3] = invKey);
                                }
                            }
                            index$3 = stack[offset$2 + 7] || (stack[offset$2 + 7] = 0);
                            if (index$3 < keys$2.length) {
                                stack[offset$2 + 7] = index$3 + 1;
                                stack[offset$2 = ++depth$2 * 8] = node;
                                stack[offset$2 + 1] = invKey = keys$2[index$3];
                                stack[offset$2 + 2] = node[invKey];
                                continue;
                            }
                        }
                        var ref$3 = node[$TYPE] === SENTINEL ? node[VALUE] : node, destination;
                        if (ref$3 && Array.isArray(ref$3)) {
                            destination = ref$3[__CONTEXT];
                            if (destination) {
                                var i$3 = (ref$3[__REF_INDEX] || 0) - 1, n = (destination[__REFS_LENGTH] || 0) - 1;
                                while (++i$3 <= n) {
                                    destination[__REF + i$3] = destination[__REF + (i$3 + 1)];
                                }
                                destination[__REFS_LENGTH] = n;
                                ref$3[__REF_INDEX] = ref$3[__CONTEXT] = destination = void 0;
                            }
                        }
                        var ref$4, i$4 = -1, n$2 = node[__REFS_LENGTH] || 0;
                        while (++i$4 < n$2) {
                            if ((ref$4 = node[__REF + i$4]) !== void 0) {
                                ref$4[__CONTEXT] = node[__REF + i$4] = void 0;
                            }
                        }
                        node[__REFS_LENGTH] = void 0;
                        if (node != null && typeof node === 'object') {
                            var root$2 = root, head = root$2.__head, tail = root$2.__tail, next, prev;
                            (next = node.__next) && (next != null && typeof next === 'object') && (next.__prev = prev);
                            (prev = node.__prev) && (prev != null && typeof prev === 'object') && (prev.__next = next);
                            node === head && (root$2.__head = root$2.__next = head = next);
                            node === tail && (root$2.__tail = root$2.__prev = tail = prev);
                            node.__next = node.__prev = void 0;
                            head = tail = next = prev = void 0;
                        }
                        nodeParent[invKey] = node[__SELF] = node[__PARENT] = node[__ROOT] = void 0;
                        delete stack[offset$2 + 0];
                        delete stack[offset$2 + 1];
                        delete stack[offset$2 + 2];
                        delete stack[offset$2 + 3];
                        delete stack[offset$2 + 4];
                        delete stack[offset$2 + 5];
                        delete stack[offset$2 + 6];
                        delete stack[offset$2 + 7];
                        --depth$2;
                    }
                    nodeParent = invParent;
                    node = invChild;
                }
                nodeParent[key] = node = newNode;
                node = !node[__SELF] && ((node[__SELF] = node) || true) && ((node[__KEY] = key) || true) && ((node[__PARENT] = nodeParent) || true) && ((node[__ROOT] = nodeRoot) || true) && (node[__GENERATION] || (node[__GENERATION] = 0) || node) && ((!nodeType || nodeType === SENTINEL) && Array.isArray(nodeValue) && (nodeValue[__CONTAINER] = node)) || node;
                size_offset = leafSize - nodeSize;
                var node$2 = nodeParent, child = node, stack$2 = [];
                while (node = nodeParent) {
                    nodeParent = node[__PARENT];
                    if ((node[$SIZE] = (node[$SIZE] || 0) - size_offset) <= 0 && true && nodeParent) {
                        var ref$5 = node[$TYPE] === SENTINEL ? node[VALUE] : node, destination$2;
                        if (ref$5 && Array.isArray(ref$5)) {
                            destination$2 = ref$5[__CONTEXT];
                            if (destination$2) {
                                var i$5 = (ref$5[__REF_INDEX] || 0) - 1, n$3 = (destination$2[__REFS_LENGTH] || 0) - 1;
                                while (++i$5 <= n$3) {
                                    destination$2[__REF + i$5] = destination$2[__REF + (i$5 + 1)];
                                }
                                destination$2[__REFS_LENGTH] = n$3;
                                ref$5[__REF_INDEX] = ref$5[__CONTEXT] = destination$2 = void 0;
                            }
                        }
                        var ref$6, i$6 = -1, n$4 = node[__REFS_LENGTH] || 0;
                        while (++i$6 < n$4) {
                            if ((ref$6 = node[__REF + i$6]) !== void 0) {
                                ref$6[__CONTEXT] = node[__REF + i$6] = void 0;
                            }
                        }
                        node[__REFS_LENGTH] = void 0;
                        if (node != null && typeof node === 'object') {
                            var root$3 = root, head$2 = root$3.__head, tail$2 = root$3.__tail, next$2, prev$2;
                            (next$2 = node.__next) && (next$2 != null && typeof next$2 === 'object') && (next$2.__prev = prev$2);
                            (prev$2 = node.__prev) && (prev$2 != null && typeof prev$2 === 'object') && (prev$2.__next = next$2);
                            node === head$2 && (root$3.__head = root$3.__next = head$2 = next$2);
                            node === tail$2 && (root$3.__tail = root$3.__prev = tail$2 = prev$2);
                            node.__next = node.__prev = void 0;
                            head$2 = tail$2 = next$2 = prev$2 = void 0;
                        }
                        nodeParent[node[__KEY]] = node[__SELF] = node[__PARENT] = node[__ROOT] = void 0;
                    } else if (node[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                        var depth$3 = 0, references, ref$7, i$7, k, n$5;
                        while (depth$3 > -1) {
                            if ((references = stack$2[depth$3]) === void 0) {
                                i$7 = k = -1;
                                n$5 = node[__REFS_LENGTH] || 0;
                                node[__GENERATION_UPDATED] = __GENERATION_VERSION;
                                node[__GENERATION] = __GENERATION_GUID++;
                                if ((ref$7 = node[__PARENT]) !== void 0 && ref$7[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                    stack$2[depth$3] = references = new Array(n$5 + 1);
                                    references[++k] = ref$7;
                                } else if (n$5 > 0) {
                                    stack$2[depth$3] = references = new Array(n$5);
                                }
                                while (++i$7 < n$5) {
                                    if ((ref$7 = node[__REF + i$7]) !== void 0 && ref$7[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                        references[++k] = ref$7;
                                    }
                                }
                            }
                            if ((node = references && references.pop()) !== void 0) {
                                ++depth$3;
                            } else {
                                stack$2[depth$3--] = void 0;
                            }
                        }
                    }
                }
                nodeParent = node$2;
                node = child;
                if (node != null && typeof node === 'object') {
                    if (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true) {
                        node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                    } else {
                        if (nodeExpires !== 1) {
                            var root$4 = root, head$3 = root$4.__head, tail$3 = root$4.__tail, next$3 = node.__next, prev$3 = node.__prev;
                            if (node !== head$3) {
                                next$3 && (next$3 != null && typeof next$3 === 'object') && (next$3.__prev = prev$3);
                                prev$3 && (prev$3 != null && typeof prev$3 === 'object') && (prev$3.__next = next$3);
                                (next$3 = head$3) && (head$3 != null && typeof head$3 === 'object') && (head$3.__prev = node);
                                root$4.__head = root$4.__next = head$3 = node;
                                head$3.__next = next$3;
                                head$3.__prev = void 0;
                            }
                            if (tail$3 == null || node === tail$3) {
                                root$4.__tail = root$4.__prev = tail$3 = prev$3 || node;
                            }
                            root$4 = head$3 = tail$3 = next$3 = prev$3 = void 0;
                        }
                    }
                }
                node = node;
            } else {
                nodeParent = node = nodes[depth - 1];
                depth = depth;
                follow_path_map_9410:
                    do {
                        if ((pathMap = pathMapStack[offset = depth * 4]) != null && typeof pathMap === 'object' && (keys = pathMapStack[offset + 1] || (pathMapStack[offset + 1] = Object.keys(pathMap))) && ((index$2 = pathMapStack[offset + 2] || (pathMapStack[offset + 2] = 0)) || true) && ((key = pathMapStack[offset + 3]) || true) && ((isKeySet = keys.length > 1) || keys.length > 0)) {
                            key = keys[index$2];
                            if (key == __NULL) {
                                pathMapStack[offset = 3 * (depth + 1)] = pathMap[__NULL];
                                pathMapStack[offset + 1] = keys;
                                pathMapStack[offset + 2] = 0;
                                nodeParent = nodes[depth] = node;
                                depth = depth + 1;
                                continue follow_path_map_9410;
                            } else if (key === $SIZE || (!(key[0] !== '_' || key[1] !== '_') || (key === __SELF || key === __PARENT || key === __ROOT))) {
                                nodeParent = node;
                                break follow_path_map_9410;
                            } else if (!(key[0] !== '_' || key[1] !== '_') || (key === __SELF || key === __PARENT || key === __ROOT) || key[0] === '$') {
                                nodeParent[key] || (nodeParent[key] = pathMap[key]);
                                nodeParent = node;
                                break follow_path_map_9410;
                            } else {
                                depth >= boundLength && (requestedPath[requestedPath.length = depth - boundLength] = key);
                                pathMapStack[offset = 4 * (depth + 1)] = pathMap = pathMap[key];
                                if (pathMap != null && typeof pathMap === 'object' && pathMap[$TYPE] === void 0 && Array.isArray(pathMap) === false && (keys = Object.keys(pathMap)) && keys.length > 0) {
                                    optimizedPath[optimizedPath.length = depth + (refLength - refIndex)] = key;
                                    node = nodeParent[key];
                                    nodeType = node && node[$TYPE] || void 0;
                                    nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                                    nodeTimestamp = node && node[$TIMESTAMP];
                                    nodeExpires = node && node[$EXPIRES];
                                    if (node != null && typeof node === 'object' && (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true)) {
                                        node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                                    }
                                    if (typeof node !== 'object' || !!nodeType && nodeType !== SENTINEL && !Array.isArray(nodeValue)) {
                                        nodeType = void 0;
                                        nodeValue = Object.create(null);
                                        nodeSize = node && node[$SIZE] || 0;
                                        if (node != null && node !== nodeValue) {
                                            var nodeRefsLength$2 = node[__REFS_LENGTH] || 0, destRefsLength$2 = nodeValue[__REFS_LENGTH] || 0, i$8 = -1, ref$8;
                                            while (++i$8 < nodeRefsLength$2) {
                                                if ((ref$8 = node[__REF + i$8]) !== void 0) {
                                                    ref$8[__CONTEXT] = nodeValue;
                                                    nodeValue[__REF + (destRefsLength$2 + i$8)] = ref$8;
                                                    node[__REF + i$8] = void 0;
                                                }
                                            }
                                            nodeValue[__REFS_LENGTH] = nodeRefsLength$2 + destRefsLength$2;
                                            node[__REFS_LENGTH] = ref$8 = void 0;
                                            var invParent$2 = nodeParent, invChild$2 = node, invKey$2 = key, keys$3, index$4, offset$3, childType$2, childValue$2, isBranch$2, stack$3 = [
                                                nodeParent,
                                                invKey$2,
                                                node
                                            ], depth$4 = 0;
                                            while (depth$4 > -1) {
                                                nodeParent = stack$3[offset$3 = depth$4 * 8];
                                                invKey$2 = stack$3[offset$3 + 1];
                                                node = stack$3[offset$3 + 2];
                                                if ((childType$2 = stack$3[offset$3 + 3]) === void 0 || (childType$2 = void 0)) {
                                                    childType$2 = stack$3[offset$3 + 3] = node && node[$TYPE] || void 0 || null;
                                                }
                                                childValue$2 = stack$3[offset$3 + 4] || (stack$3[offset$3 + 4] = childType$2 === SENTINEL ? node[VALUE] : node);
                                                if ((isBranch$2 = stack$3[offset$3 + 5]) === void 0) {
                                                    isBranch$2 = stack$3[offset$3 + 5] = !childType$2 && (node != null && typeof node === 'object') && !Array.isArray(childValue$2);
                                                }
                                                if (isBranch$2 === true) {
                                                    if ((keys$3 = stack$3[offset$3 + 6]) === void 0) {
                                                        keys$3 = stack$3[offset$3 + 6] = [];
                                                        index$4 = -1;
                                                        for (invKey$2 in node) {
                                                            !(!(invKey$2[0] !== '_' || invKey$2[1] !== '_') || (invKey$2 === __SELF || invKey$2 === __PARENT || invKey$2 === __ROOT) || invKey$2[0] === '$') && (keys$3[++index$4] = invKey$2);
                                                        }
                                                    }
                                                    index$4 = stack$3[offset$3 + 7] || (stack$3[offset$3 + 7] = 0);
                                                    if (index$4 < keys$3.length) {
                                                        stack$3[offset$3 + 7] = index$4 + 1;
                                                        stack$3[offset$3 = ++depth$4 * 8] = node;
                                                        stack$3[offset$3 + 1] = invKey$2 = keys$3[index$4];
                                                        stack$3[offset$3 + 2] = node[invKey$2];
                                                        continue;
                                                    }
                                                }
                                                var ref$9 = node[$TYPE] === SENTINEL ? node[VALUE] : node, destination$3;
                                                if (ref$9 && Array.isArray(ref$9)) {
                                                    destination$3 = ref$9[__CONTEXT];
                                                    if (destination$3) {
                                                        var i$9 = (ref$9[__REF_INDEX] || 0) - 1, n$6 = (destination$3[__REFS_LENGTH] || 0) - 1;
                                                        while (++i$9 <= n$6) {
                                                            destination$3[__REF + i$9] = destination$3[__REF + (i$9 + 1)];
                                                        }
                                                        destination$3[__REFS_LENGTH] = n$6;
                                                        ref$9[__REF_INDEX] = ref$9[__CONTEXT] = destination$3 = void 0;
                                                    }
                                                }
                                                var ref$10, i$10 = -1, n$7 = node[__REFS_LENGTH] || 0;
                                                while (++i$10 < n$7) {
                                                    if ((ref$10 = node[__REF + i$10]) !== void 0) {
                                                        ref$10[__CONTEXT] = node[__REF + i$10] = void 0;
                                                    }
                                                }
                                                node[__REFS_LENGTH] = void 0;
                                                if (node != null && typeof node === 'object') {
                                                    var root$5 = root, head$4 = root$5.__head, tail$4 = root$5.__tail, next$4, prev$4;
                                                    (next$4 = node.__next) && (next$4 != null && typeof next$4 === 'object') && (next$4.__prev = prev$4);
                                                    (prev$4 = node.__prev) && (prev$4 != null && typeof prev$4 === 'object') && (prev$4.__next = next$4);
                                                    node === head$4 && (root$5.__head = root$5.__next = head$4 = next$4);
                                                    node === tail$4 && (root$5.__tail = root$5.__prev = tail$4 = prev$4);
                                                    node.__next = node.__prev = void 0;
                                                    head$4 = tail$4 = next$4 = prev$4 = void 0;
                                                }
                                                nodeParent[invKey$2] = node[__SELF] = node[__PARENT] = node[__ROOT] = void 0;
                                                delete stack$3[offset$3 + 0];
                                                delete stack$3[offset$3 + 1];
                                                delete stack$3[offset$3 + 2];
                                                delete stack$3[offset$3 + 3];
                                                delete stack$3[offset$3 + 4];
                                                delete stack$3[offset$3 + 5];
                                                delete stack$3[offset$3 + 6];
                                                delete stack$3[offset$3 + 7];
                                                --depth$4;
                                            }
                                            nodeParent = invParent$2;
                                            node = invChild$2;
                                        }
                                        nodeParent[key] = node = nodeValue;
                                        node = !node[__SELF] && ((node[__SELF] = node) || true) && ((node[__KEY] = key) || true) && ((node[__PARENT] = nodeParent) || true) && ((node[__ROOT] = nodeRoot) || true) && (node[__GENERATION] || (node[__GENERATION] = 0) || node) && ((!nodeType || nodeType === SENTINEL) && Array.isArray(nodeValue) && (nodeValue[__CONTAINER] = node)) || node;
                                        var node$3 = nodeParent, child$2 = node, stack$4 = [];
                                        while (node = nodeParent) {
                                            nodeParent = node[__PARENT];
                                            if ((node[$SIZE] = (node[$SIZE] || 0) - nodeSize) <= 0 && false && nodeParent) {
                                                var ref$11 = node[$TYPE] === SENTINEL ? node[VALUE] : node, destination$4;
                                                if (ref$11 && Array.isArray(ref$11)) {
                                                    destination$4 = ref$11[__CONTEXT];
                                                    if (destination$4) {
                                                        var i$11 = (ref$11[__REF_INDEX] || 0) - 1, n$8 = (destination$4[__REFS_LENGTH] || 0) - 1;
                                                        while (++i$11 <= n$8) {
                                                            destination$4[__REF + i$11] = destination$4[__REF + (i$11 + 1)];
                                                        }
                                                        destination$4[__REFS_LENGTH] = n$8;
                                                        ref$11[__REF_INDEX] = ref$11[__CONTEXT] = destination$4 = void 0;
                                                    }
                                                }
                                                var ref$12, i$12 = -1, n$9 = node[__REFS_LENGTH] || 0;
                                                while (++i$12 < n$9) {
                                                    if ((ref$12 = node[__REF + i$12]) !== void 0) {
                                                        ref$12[__CONTEXT] = node[__REF + i$12] = void 0;
                                                    }
                                                }
                                                node[__REFS_LENGTH] = void 0;
                                                if (node != null && typeof node === 'object') {
                                                    var root$6 = root, head$5 = root$6.__head, tail$5 = root$6.__tail, next$5, prev$5;
                                                    (next$5 = node.__next) && (next$5 != null && typeof next$5 === 'object') && (next$5.__prev = prev$5);
                                                    (prev$5 = node.__prev) && (prev$5 != null && typeof prev$5 === 'object') && (prev$5.__next = next$5);
                                                    node === head$5 && (root$6.__head = root$6.__next = head$5 = next$5);
                                                    node === tail$5 && (root$6.__tail = root$6.__prev = tail$5 = prev$5);
                                                    node.__next = node.__prev = void 0;
                                                    head$5 = tail$5 = next$5 = prev$5 = void 0;
                                                }
                                                nodeParent[node[__KEY]] = node[__SELF] = node[__PARENT] = node[__ROOT] = void 0;
                                            } else if (node[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                                var depth$5 = 0, references$2, ref$13, i$13, k$2, n$10;
                                                while (depth$5 > -1) {
                                                    if ((references$2 = stack$4[depth$5]) === void 0) {
                                                        i$13 = k$2 = -1;
                                                        n$10 = node[__REFS_LENGTH] || 0;
                                                        node[__GENERATION_UPDATED] = __GENERATION_VERSION;
                                                        node[__GENERATION] = __GENERATION_GUID++;
                                                        if ((ref$13 = node[__PARENT]) !== void 0 && ref$13[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                                            stack$4[depth$5] = references$2 = new Array(n$10 + 1);
                                                            references$2[++k$2] = ref$13;
                                                        } else if (n$10 > 0) {
                                                            stack$4[depth$5] = references$2 = new Array(n$10);
                                                        }
                                                        while (++i$13 < n$10) {
                                                            if ((ref$13 = node[__REF + i$13]) !== void 0 && ref$13[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                                                references$2[++k$2] = ref$13;
                                                            }
                                                        }
                                                    }
                                                    if ((node = references$2 && references$2.pop()) !== void 0) {
                                                        ++depth$5;
                                                    } else {
                                                        stack$4[depth$5--] = void 0;
                                                    }
                                                }
                                            }
                                        }
                                        nodeParent = node$3;
                                        node = child$2;
                                    }
                                    if ((!nodeType || nodeType === SENTINEL) && Array.isArray(nodeValue)) {
                                        do {
                                            if (nodeExpires !== 1) {
                                                var root$7 = root, head$6 = root$7.__head, tail$6 = root$7.__tail, next$6 = node.__next, prev$6 = node.__prev;
                                                if (node !== head$6) {
                                                    next$6 && (next$6 != null && typeof next$6 === 'object') && (next$6.__prev = prev$6);
                                                    prev$6 && (prev$6 != null && typeof prev$6 === 'object') && (prev$6.__next = next$6);
                                                    (next$6 = head$6) && (head$6 != null && typeof head$6 === 'object') && (head$6.__prev = node);
                                                    root$7.__head = root$7.__next = head$6 = node;
                                                    head$6.__next = next$6;
                                                    head$6.__prev = void 0;
                                                }
                                                if (tail$6 == null || node === tail$6) {
                                                    root$7.__tail = root$7.__prev = tail$6 = prev$6 || node;
                                                }
                                                root$7 = head$6 = tail$6 = next$6 = prev$6 = void 0;
                                            }
                                            refs[depth] = nodeValue;
                                            refIndex = depth + 1;
                                            refDepth = 0;
                                            var location = (nodeValue[__CONTAINER] || nodeValue)[__CONTEXT];
                                            if (location !== void 0) {
                                                node = location;
                                                refHeight = (refLength = nodeValue.length) - 1;
                                                while (refDepth < refLength) {
                                                    optimizedPath[refDepth] = nodeValue[refDepth++];
                                                }
                                                optimizedPath.length = refLength;
                                            } else {
                                                var key$2, isKeySet$2;
                                                reference = nodeValue;
                                                refHeight = (refLength = reference.length) - 1;
                                                nodeParent = nodeRoot;
                                                nodeType = nodeParent && nodeParent[$TYPE] || void 0;
                                                nodeValue = nodeType === SENTINEL ? nodeParent[VALUE] : nodeParent;
                                                if (nodeParent == null || nodeType !== void 0 || typeof nodeParent !== 'object' || Array.isArray(nodeValue)) {
                                                    node = node = nodeParent;
                                                } else {
                                                    nodeParent = nodeRoot;
                                                    refDepth = refDepth;
                                                    follow_path_9803:
                                                        do {
                                                            key$2 = reference[refDepth];
                                                            isKeySet$2 = false;
                                                            if (key$2 != null) {
                                                                if (refDepth < refHeight) {
                                                                    optimizedPath[optimizedPath.length = refDepth] = key$2;
                                                                    node = nodeParent[key$2];
                                                                    nodeType = node && node[$TYPE] || void 0;
                                                                    nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                                                                    nodeTimestamp = node && node[$TIMESTAMP];
                                                                    nodeExpires = node && node[$EXPIRES];
                                                                    if (node != null && typeof node === 'object' && (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true)) {
                                                                        node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                                                                    }
                                                                    if (typeof node !== 'object' || !!nodeType && nodeType !== SENTINEL && !Array.isArray(nodeValue)) {
                                                                        nodeType = void 0;
                                                                        nodeValue = Object.create(null);
                                                                        nodeSize = node && node[$SIZE] || 0;
                                                                        if (node != null && node !== nodeValue) {
                                                                            var nodeRefsLength$3 = node[__REFS_LENGTH] || 0, destRefsLength$3 = nodeValue[__REFS_LENGTH] || 0, i$14 = -1, ref$14;
                                                                            while (++i$14 < nodeRefsLength$3) {
                                                                                if ((ref$14 = node[__REF + i$14]) !== void 0) {
                                                                                    ref$14[__CONTEXT] = nodeValue;
                                                                                    nodeValue[__REF + (destRefsLength$3 + i$14)] = ref$14;
                                                                                    node[__REF + i$14] = void 0;
                                                                                }
                                                                            }
                                                                            nodeValue[__REFS_LENGTH] = nodeRefsLength$3 + destRefsLength$3;
                                                                            node[__REFS_LENGTH] = ref$14 = void 0;
                                                                            var invParent$3 = nodeParent, invChild$3 = node, invKey$3 = key$2, keys$4, index$5, offset$4, childType$3, childValue$3, isBranch$3, stack$5 = [
                                                                                nodeParent,
                                                                                invKey$3,
                                                                                node
                                                                            ], depth$6 = 0;
                                                                            while (depth$6 > -1) {
                                                                                nodeParent = stack$5[offset$4 = depth$6 * 8];
                                                                                invKey$3 = stack$5[offset$4 + 1];
                                                                                node = stack$5[offset$4 + 2];
                                                                                if ((childType$3 = stack$5[offset$4 + 3]) === void 0 || (childType$3 = void 0)) {
                                                                                    childType$3 = stack$5[offset$4 + 3] = node && node[$TYPE] || void 0 || null;
                                                                                }
                                                                                childValue$3 = stack$5[offset$4 + 4] || (stack$5[offset$4 + 4] = childType$3 === SENTINEL ? node[VALUE] : node);
                                                                                if ((isBranch$3 = stack$5[offset$4 + 5]) === void 0) {
                                                                                    isBranch$3 = stack$5[offset$4 + 5] = !childType$3 && (node != null && typeof node === 'object') && !Array.isArray(childValue$3);
                                                                                }
                                                                                if (isBranch$3 === true) {
                                                                                    if ((keys$4 = stack$5[offset$4 + 6]) === void 0) {
                                                                                        keys$4 = stack$5[offset$4 + 6] = [];
                                                                                        index$5 = -1;
                                                                                        for (invKey$3 in node) {
                                                                                            !(!(invKey$3[0] !== '_' || invKey$3[1] !== '_') || (invKey$3 === __SELF || invKey$3 === __PARENT || invKey$3 === __ROOT) || invKey$3[0] === '$') && (keys$4[++index$5] = invKey$3);
                                                                                        }
                                                                                    }
                                                                                    index$5 = stack$5[offset$4 + 7] || (stack$5[offset$4 + 7] = 0);
                                                                                    if (index$5 < keys$4.length) {
                                                                                        stack$5[offset$4 + 7] = index$5 + 1;
                                                                                        stack$5[offset$4 = ++depth$6 * 8] = node;
                                                                                        stack$5[offset$4 + 1] = invKey$3 = keys$4[index$5];
                                                                                        stack$5[offset$4 + 2] = node[invKey$3];
                                                                                        continue;
                                                                                    }
                                                                                }
                                                                                var ref$15 = node[$TYPE] === SENTINEL ? node[VALUE] : node, destination$5;
                                                                                if (ref$15 && Array.isArray(ref$15)) {
                                                                                    destination$5 = ref$15[__CONTEXT];
                                                                                    if (destination$5) {
                                                                                        var i$15 = (ref$15[__REF_INDEX] || 0) - 1, n$11 = (destination$5[__REFS_LENGTH] || 0) - 1;
                                                                                        while (++i$15 <= n$11) {
                                                                                            destination$5[__REF + i$15] = destination$5[__REF + (i$15 + 1)];
                                                                                        }
                                                                                        destination$5[__REFS_LENGTH] = n$11;
                                                                                        ref$15[__REF_INDEX] = ref$15[__CONTEXT] = destination$5 = void 0;
                                                                                    }
                                                                                }
                                                                                var ref$16, i$16 = -1, n$12 = node[__REFS_LENGTH] || 0;
                                                                                while (++i$16 < n$12) {
                                                                                    if ((ref$16 = node[__REF + i$16]) !== void 0) {
                                                                                        ref$16[__CONTEXT] = node[__REF + i$16] = void 0;
                                                                                    }
                                                                                }
                                                                                node[__REFS_LENGTH] = void 0;
                                                                                if (node != null && typeof node === 'object') {
                                                                                    var root$8 = root, head$7 = root$8.__head, tail$7 = root$8.__tail, next$7, prev$7;
                                                                                    (next$7 = node.__next) && (next$7 != null && typeof next$7 === 'object') && (next$7.__prev = prev$7);
                                                                                    (prev$7 = node.__prev) && (prev$7 != null && typeof prev$7 === 'object') && (prev$7.__next = next$7);
                                                                                    node === head$7 && (root$8.__head = root$8.__next = head$7 = next$7);
                                                                                    node === tail$7 && (root$8.__tail = root$8.__prev = tail$7 = prev$7);
                                                                                    node.__next = node.__prev = void 0;
                                                                                    head$7 = tail$7 = next$7 = prev$7 = void 0;
                                                                                }
                                                                                nodeParent[invKey$3] = node[__SELF] = node[__PARENT] = node[__ROOT] = void 0;
                                                                                delete stack$5[offset$4 + 0];
                                                                                delete stack$5[offset$4 + 1];
                                                                                delete stack$5[offset$4 + 2];
                                                                                delete stack$5[offset$4 + 3];
                                                                                delete stack$5[offset$4 + 4];
                                                                                delete stack$5[offset$4 + 5];
                                                                                delete stack$5[offset$4 + 6];
                                                                                delete stack$5[offset$4 + 7];
                                                                                --depth$6;
                                                                            }
                                                                            nodeParent = invParent$3;
                                                                            node = invChild$3;
                                                                        }
                                                                        nodeParent[key$2] = node = nodeValue;
                                                                        node = !node[__SELF] && ((node[__SELF] = node) || true) && ((node[__KEY] = key$2) || true) && ((node[__PARENT] = nodeParent) || true) && ((node[__ROOT] = nodeRoot) || true) && (node[__GENERATION] || (node[__GENERATION] = 0) || node) && ((!nodeType || nodeType === SENTINEL) && Array.isArray(nodeValue) && (nodeValue[__CONTAINER] = node)) || node;
                                                                        var node$4 = nodeParent, child$3 = node, stack$6 = [];
                                                                        while (node = nodeParent) {
                                                                            nodeParent = node[__PARENT];
                                                                            if ((node[$SIZE] = (node[$SIZE] || 0) - nodeSize) <= 0 && false && nodeParent) {
                                                                                var ref$17 = node[$TYPE] === SENTINEL ? node[VALUE] : node, destination$6;
                                                                                if (ref$17 && Array.isArray(ref$17)) {
                                                                                    destination$6 = ref$17[__CONTEXT];
                                                                                    if (destination$6) {
                                                                                        var i$17 = (ref$17[__REF_INDEX] || 0) - 1, n$13 = (destination$6[__REFS_LENGTH] || 0) - 1;
                                                                                        while (++i$17 <= n$13) {
                                                                                            destination$6[__REF + i$17] = destination$6[__REF + (i$17 + 1)];
                                                                                        }
                                                                                        destination$6[__REFS_LENGTH] = n$13;
                                                                                        ref$17[__REF_INDEX] = ref$17[__CONTEXT] = destination$6 = void 0;
                                                                                    }
                                                                                }
                                                                                var ref$18, i$18 = -1, n$14 = node[__REFS_LENGTH] || 0;
                                                                                while (++i$18 < n$14) {
                                                                                    if ((ref$18 = node[__REF + i$18]) !== void 0) {
                                                                                        ref$18[__CONTEXT] = node[__REF + i$18] = void 0;
                                                                                    }
                                                                                }
                                                                                node[__REFS_LENGTH] = void 0;
                                                                                if (node != null && typeof node === 'object') {
                                                                                    var root$9 = root, head$8 = root$9.__head, tail$8 = root$9.__tail, next$8, prev$8;
                                                                                    (next$8 = node.__next) && (next$8 != null && typeof next$8 === 'object') && (next$8.__prev = prev$8);
                                                                                    (prev$8 = node.__prev) && (prev$8 != null && typeof prev$8 === 'object') && (prev$8.__next = next$8);
                                                                                    node === head$8 && (root$9.__head = root$9.__next = head$8 = next$8);
                                                                                    node === tail$8 && (root$9.__tail = root$9.__prev = tail$8 = prev$8);
                                                                                    node.__next = node.__prev = void 0;
                                                                                    head$8 = tail$8 = next$8 = prev$8 = void 0;
                                                                                }
                                                                                nodeParent[node[__KEY]] = node[__SELF] = node[__PARENT] = node[__ROOT] = void 0;
                                                                            } else if (node[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                                                                var depth$7 = 0, references$3, ref$19, i$19, k$3, n$15;
                                                                                while (depth$7 > -1) {
                                                                                    if ((references$3 = stack$6[depth$7]) === void 0) {
                                                                                        i$19 = k$3 = -1;
                                                                                        n$15 = node[__REFS_LENGTH] || 0;
                                                                                        node[__GENERATION_UPDATED] = __GENERATION_VERSION;
                                                                                        node[__GENERATION] = __GENERATION_GUID++;
                                                                                        if ((ref$19 = node[__PARENT]) !== void 0 && ref$19[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                                                                            stack$6[depth$7] = references$3 = new Array(n$15 + 1);
                                                                                            references$3[++k$3] = ref$19;
                                                                                        } else if (n$15 > 0) {
                                                                                            stack$6[depth$7] = references$3 = new Array(n$15);
                                                                                        }
                                                                                        while (++i$19 < n$15) {
                                                                                            if ((ref$19 = node[__REF + i$19]) !== void 0 && ref$19[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                                                                                references$3[++k$3] = ref$19;
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    if ((node = references$3 && references$3.pop()) !== void 0) {
                                                                                        ++depth$7;
                                                                                    } else {
                                                                                        stack$6[depth$7--] = void 0;
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                        nodeParent = node$4;
                                                                        node = child$3;
                                                                    }
                                                                    if (appendNullKey = node == null || nodeType !== void 0 || typeof node !== 'object' || Array.isArray(nodeValue)) {
                                                                        nodeParent = node;
                                                                        break follow_path_9803;
                                                                    }
                                                                    nodeParent = node;
                                                                    refDepth = refDepth + 1;
                                                                    continue follow_path_9803;
                                                                } else if (refDepth === refHeight) {
                                                                    optimizedPath[optimizedPath.length = refDepth] = key$2;
                                                                    node = nodeParent[key$2];
                                                                    nodeType = node && node[$TYPE] || void 0;
                                                                    nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                                                                    nodeTimestamp = node && node[$TIMESTAMP];
                                                                    nodeExpires = node && node[$EXPIRES];
                                                                    if (node != null && typeof node === 'object' && (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true)) {
                                                                        node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                                                                    }
                                                                    if (typeof node !== 'object' || !!nodeType && nodeType !== SENTINEL && !Array.isArray(nodeValue)) {
                                                                        nodeType = void 0;
                                                                        nodeValue = Object.create(null);
                                                                        nodeSize = node && node[$SIZE] || 0;
                                                                        if (node != null && node !== nodeValue) {
                                                                            var nodeRefsLength$4 = node[__REFS_LENGTH] || 0, destRefsLength$4 = nodeValue[__REFS_LENGTH] || 0, i$20 = -1, ref$20;
                                                                            while (++i$20 < nodeRefsLength$4) {
                                                                                if ((ref$20 = node[__REF + i$20]) !== void 0) {
                                                                                    ref$20[__CONTEXT] = nodeValue;
                                                                                    nodeValue[__REF + (destRefsLength$4 + i$20)] = ref$20;
                                                                                    node[__REF + i$20] = void 0;
                                                                                }
                                                                            }
                                                                            nodeValue[__REFS_LENGTH] = nodeRefsLength$4 + destRefsLength$4;
                                                                            node[__REFS_LENGTH] = ref$20 = void 0;
                                                                            var invParent$4 = nodeParent, invChild$4 = node, invKey$4 = key$2, keys$5, index$6, offset$5, childType$4, childValue$4, isBranch$4, stack$7 = [
                                                                                nodeParent,
                                                                                invKey$4,
                                                                                node
                                                                            ], depth$8 = 0;
                                                                            while (depth$8 > -1) {
                                                                                nodeParent = stack$7[offset$5 = depth$8 * 8];
                                                                                invKey$4 = stack$7[offset$5 + 1];
                                                                                node = stack$7[offset$5 + 2];
                                                                                if ((childType$4 = stack$7[offset$5 + 3]) === void 0 || (childType$4 = void 0)) {
                                                                                    childType$4 = stack$7[offset$5 + 3] = node && node[$TYPE] || void 0 || null;
                                                                                }
                                                                                childValue$4 = stack$7[offset$5 + 4] || (stack$7[offset$5 + 4] = childType$4 === SENTINEL ? node[VALUE] : node);
                                                                                if ((isBranch$4 = stack$7[offset$5 + 5]) === void 0) {
                                                                                    isBranch$4 = stack$7[offset$5 + 5] = !childType$4 && (node != null && typeof node === 'object') && !Array.isArray(childValue$4);
                                                                                }
                                                                                if (isBranch$4 === true) {
                                                                                    if ((keys$5 = stack$7[offset$5 + 6]) === void 0) {
                                                                                        keys$5 = stack$7[offset$5 + 6] = [];
                                                                                        index$6 = -1;
                                                                                        for (invKey$4 in node) {
                                                                                            !(!(invKey$4[0] !== '_' || invKey$4[1] !== '_') || (invKey$4 === __SELF || invKey$4 === __PARENT || invKey$4 === __ROOT) || invKey$4[0] === '$') && (keys$5[++index$6] = invKey$4);
                                                                                        }
                                                                                    }
                                                                                    index$6 = stack$7[offset$5 + 7] || (stack$7[offset$5 + 7] = 0);
                                                                                    if (index$6 < keys$5.length) {
                                                                                        stack$7[offset$5 + 7] = index$6 + 1;
                                                                                        stack$7[offset$5 = ++depth$8 * 8] = node;
                                                                                        stack$7[offset$5 + 1] = invKey$4 = keys$5[index$6];
                                                                                        stack$7[offset$5 + 2] = node[invKey$4];
                                                                                        continue;
                                                                                    }
                                                                                }
                                                                                var ref$21 = node[$TYPE] === SENTINEL ? node[VALUE] : node, destination$7;
                                                                                if (ref$21 && Array.isArray(ref$21)) {
                                                                                    destination$7 = ref$21[__CONTEXT];
                                                                                    if (destination$7) {
                                                                                        var i$21 = (ref$21[__REF_INDEX] || 0) - 1, n$16 = (destination$7[__REFS_LENGTH] || 0) - 1;
                                                                                        while (++i$21 <= n$16) {
                                                                                            destination$7[__REF + i$21] = destination$7[__REF + (i$21 + 1)];
                                                                                        }
                                                                                        destination$7[__REFS_LENGTH] = n$16;
                                                                                        ref$21[__REF_INDEX] = ref$21[__CONTEXT] = destination$7 = void 0;
                                                                                    }
                                                                                }
                                                                                var ref$22, i$22 = -1, n$17 = node[__REFS_LENGTH] || 0;
                                                                                while (++i$22 < n$17) {
                                                                                    if ((ref$22 = node[__REF + i$22]) !== void 0) {
                                                                                        ref$22[__CONTEXT] = node[__REF + i$22] = void 0;
                                                                                    }
                                                                                }
                                                                                node[__REFS_LENGTH] = void 0;
                                                                                if (node != null && typeof node === 'object') {
                                                                                    var root$10 = root, head$9 = root$10.__head, tail$9 = root$10.__tail, next$9, prev$9;
                                                                                    (next$9 = node.__next) && (next$9 != null && typeof next$9 === 'object') && (next$9.__prev = prev$9);
                                                                                    (prev$9 = node.__prev) && (prev$9 != null && typeof prev$9 === 'object') && (prev$9.__next = next$9);
                                                                                    node === head$9 && (root$10.__head = root$10.__next = head$9 = next$9);
                                                                                    node === tail$9 && (root$10.__tail = root$10.__prev = tail$9 = prev$9);
                                                                                    node.__next = node.__prev = void 0;
                                                                                    head$9 = tail$9 = next$9 = prev$9 = void 0;
                                                                                }
                                                                                nodeParent[invKey$4] = node[__SELF] = node[__PARENT] = node[__ROOT] = void 0;
                                                                                delete stack$7[offset$5 + 0];
                                                                                delete stack$7[offset$5 + 1];
                                                                                delete stack$7[offset$5 + 2];
                                                                                delete stack$7[offset$5 + 3];
                                                                                delete stack$7[offset$5 + 4];
                                                                                delete stack$7[offset$5 + 5];
                                                                                delete stack$7[offset$5 + 6];
                                                                                delete stack$7[offset$5 + 7];
                                                                                --depth$8;
                                                                            }
                                                                            nodeParent = invParent$4;
                                                                            node = invChild$4;
                                                                        }
                                                                        nodeParent[key$2] = node = nodeValue;
                                                                        node = !node[__SELF] && ((node[__SELF] = node) || true) && ((node[__KEY] = key$2) || true) && ((node[__PARENT] = nodeParent) || true) && ((node[__ROOT] = nodeRoot) || true) && (node[__GENERATION] || (node[__GENERATION] = 0) || node) && ((!nodeType || nodeType === SENTINEL) && Array.isArray(nodeValue) && (nodeValue[__CONTAINER] = node)) || node;
                                                                        var node$5 = nodeParent, child$4 = node, stack$8 = [];
                                                                        while (node = nodeParent) {
                                                                            nodeParent = node[__PARENT];
                                                                            if ((node[$SIZE] = (node[$SIZE] || 0) - nodeSize) <= 0 && false && nodeParent) {
                                                                                var ref$23 = node[$TYPE] === SENTINEL ? node[VALUE] : node, destination$8;
                                                                                if (ref$23 && Array.isArray(ref$23)) {
                                                                                    destination$8 = ref$23[__CONTEXT];
                                                                                    if (destination$8) {
                                                                                        var i$23 = (ref$23[__REF_INDEX] || 0) - 1, n$18 = (destination$8[__REFS_LENGTH] || 0) - 1;
                                                                                        while (++i$23 <= n$18) {
                                                                                            destination$8[__REF + i$23] = destination$8[__REF + (i$23 + 1)];
                                                                                        }
                                                                                        destination$8[__REFS_LENGTH] = n$18;
                                                                                        ref$23[__REF_INDEX] = ref$23[__CONTEXT] = destination$8 = void 0;
                                                                                    }
                                                                                }
                                                                                var ref$24, i$24 = -1, n$19 = node[__REFS_LENGTH] || 0;
                                                                                while (++i$24 < n$19) {
                                                                                    if ((ref$24 = node[__REF + i$24]) !== void 0) {
                                                                                        ref$24[__CONTEXT] = node[__REF + i$24] = void 0;
                                                                                    }
                                                                                }
                                                                                node[__REFS_LENGTH] = void 0;
                                                                                if (node != null && typeof node === 'object') {
                                                                                    var root$11 = root, head$10 = root$11.__head, tail$10 = root$11.__tail, next$10, prev$10;
                                                                                    (next$10 = node.__next) && (next$10 != null && typeof next$10 === 'object') && (next$10.__prev = prev$10);
                                                                                    (prev$10 = node.__prev) && (prev$10 != null && typeof prev$10 === 'object') && (prev$10.__next = next$10);
                                                                                    node === head$10 && (root$11.__head = root$11.__next = head$10 = next$10);
                                                                                    node === tail$10 && (root$11.__tail = root$11.__prev = tail$10 = prev$10);
                                                                                    node.__next = node.__prev = void 0;
                                                                                    head$10 = tail$10 = next$10 = prev$10 = void 0;
                                                                                }
                                                                                nodeParent[node[__KEY]] = node[__SELF] = node[__PARENT] = node[__ROOT] = void 0;
                                                                            } else if (node[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                                                                var depth$9 = 0, references$4, ref$25, i$25, k$4, n$20;
                                                                                while (depth$9 > -1) {
                                                                                    if ((references$4 = stack$8[depth$9]) === void 0) {
                                                                                        i$25 = k$4 = -1;
                                                                                        n$20 = node[__REFS_LENGTH] || 0;
                                                                                        node[__GENERATION_UPDATED] = __GENERATION_VERSION;
                                                                                        node[__GENERATION] = __GENERATION_GUID++;
                                                                                        if ((ref$25 = node[__PARENT]) !== void 0 && ref$25[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                                                                            stack$8[depth$9] = references$4 = new Array(n$20 + 1);
                                                                                            references$4[++k$4] = ref$25;
                                                                                        } else if (n$20 > 0) {
                                                                                            stack$8[depth$9] = references$4 = new Array(n$20);
                                                                                        }
                                                                                        while (++i$25 < n$20) {
                                                                                            if ((ref$25 = node[__REF + i$25]) !== void 0 && ref$25[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                                                                                references$4[++k$4] = ref$25;
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                    if ((node = references$4 && references$4.pop()) !== void 0) {
                                                                                        ++depth$9;
                                                                                    } else {
                                                                                        stack$8[depth$9--] = void 0;
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                        nodeParent = node$5;
                                                                        node = child$4;
                                                                    }
                                                                    if (node != null) {
                                                                        var refContainer = reference[__CONTAINER] || reference, refContext = refContainer[__CONTEXT];
                                                                        // Set up the hard-link so we don't have to do all
                                                                        // this work the next time we follow this reference.
                                                                        if (refContext === void 0) {
                                                                            // create a back reference
                                                                            var backRefs = node[__REFS_LENGTH] || 0;
                                                                            node[__REF + backRefs] = refContainer;
                                                                            node[__REFS_LENGTH] = backRefs + 1;
                                                                            // create a hard reference
                                                                            refContainer[__REF_INDEX] = backRefs;
                                                                            refContainer[__CONTEXT] = node;
                                                                            refContainer = backRefs = void 0;
                                                                        }
                                                                        ;
                                                                    }
                                                                    appendNullKey = node == null || nodeType !== void 0 || typeof node !== 'object' || Array.isArray(nodeValue);
                                                                    nodeParent = node;
                                                                    break follow_path_9803;
                                                                }
                                                            } else if (refDepth < refHeight) {
                                                                nodeParent = node;
                                                                refDepth = refDepth + 1;
                                                                continue follow_path_9803;
                                                            }
                                                            nodeParent = node;
                                                            break follow_path_9803;
                                                        } while (true);
                                                    node = nodeParent;
                                                }
                                            }
                                            nodeType = node && node[$TYPE] || void 0;
                                            nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                                            nodeExpires = node && node[$EXPIRES];
                                            if (node != null && typeof node === 'object' && (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true)) {
                                                node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                                            }
                                        } while ((!nodeType || nodeType === SENTINEL) && Array.isArray(nodeValue));
                                        if (node == null) {
                                            while (refDepth <= refHeight) {
                                                optimizedPath[refDepth] = reference[refDepth++];
                                            }
                                        }
                                    }
                                    if (node == null || nodeType !== void 0 || typeof node !== 'object' || Array.isArray(nodeValue)) {
                                        nodeParent = node;
                                        break follow_path_map_9410;
                                    }
                                    pathMapStack[offset + 1] = keys;
                                    pathMapStack[offset + 3] = key;
                                    nodeParent = nodes[depth] = node;
                                    depth = depth + 1;
                                    continue follow_path_map_9410;
                                }
                            }
                        }
                        if (key != null) {
                            optimizedPath[optimizedPath.length = depth + (refLength - refIndex)] = key;
                            node = nodeParent[key];
                            nodeType = node && node[$TYPE] || void 0;
                            nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                            nodeTimestamp = node && node[$TIMESTAMP];
                            nodeExpires = node && node[$EXPIRES];
                            if (node != null && typeof node === 'object' && (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true)) {
                                node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                            }
                            nodeType = pathMap && pathMap[$TYPE] || void 0;
                            nodeValue = nodeType === SENTINEL ? pathMap[VALUE] : pathMap;
                            nodeTimestamp = pathMap && pathMap[$TIMESTAMP];
                            nodeExpires = pathMap && pathMap[$EXPIRES];
                            var newNode$2, size_offset$2, leafSize$2 = node && node[$SIZE] || 0;
                            newNode$2 = pathMap;
                            if ((!nodeType || nodeType === SENTINEL) && Array.isArray(nodeValue)) {
                                nodeType = 'array';
                                newNode$2[$SIZE] = nodeSize = (nodeType === SENTINEL && 50 || 0) + (nodeValue.length || 1);
                                delete nodeValue[$SIZE];
                                nodeValue[__CONTAINER] = newNode$2;
                            } else if (nodeType === SENTINEL) {
                                newNode$2[$SIZE] = nodeSize = 50 + (typeof nodeValue === 'string' && nodeValue.length || 1);
                            } else if (nodeType === ERROR) {
                                newNode$2[$SIZE] = nodeSize = pathMap && pathMap[$SIZE] || 0 || 50 + 1;
                            } else if (!(pathMap != null && typeof pathMap === 'object')) {
                                nodeSize = 50 + (typeof nodeValue === 'string' && nodeValue.length || 1);
                                nodeType = 'sentinel';
                                newNode$2 = { 'value': nodeValue };
                                newNode$2[$TYPE] = nodeType;
                                newNode$2[$SIZE] = nodeSize;
                            } else {
                                nodeType = newNode$2[$TYPE] = nodeType || 'leaf';
                                newNode$2[$SIZE] = nodeSize = pathMap && pathMap[$SIZE] || 0 || 50 + 1;
                            }
                            ;
                            if (node != null && node !== newNode$2) {
                                var nodeRefsLength$5 = node[__REFS_LENGTH] || 0, destRefsLength$5 = newNode$2[__REFS_LENGTH] || 0, i$26 = -1, ref$26;
                                while (++i$26 < nodeRefsLength$5) {
                                    if ((ref$26 = node[__REF + i$26]) !== void 0) {
                                        ref$26[__CONTEXT] = newNode$2;
                                        newNode$2[__REF + (destRefsLength$5 + i$26)] = ref$26;
                                        node[__REF + i$26] = void 0;
                                    }
                                }
                                newNode$2[__REFS_LENGTH] = nodeRefsLength$5 + destRefsLength$5;
                                node[__REFS_LENGTH] = ref$26 = void 0;
                                var invParent$5 = nodeParent, invChild$5 = node, invKey$5 = key, keys$6, index$7, offset$6, childType$5, childValue$5, isBranch$5, stack$9 = [
                                    nodeParent,
                                    invKey$5,
                                    node
                                ], depth$10 = 0;
                                while (depth$10 > -1) {
                                    nodeParent = stack$9[offset$6 = depth$10 * 8];
                                    invKey$5 = stack$9[offset$6 + 1];
                                    node = stack$9[offset$6 + 2];
                                    if ((childType$5 = stack$9[offset$6 + 3]) === void 0 || (childType$5 = void 0)) {
                                        childType$5 = stack$9[offset$6 + 3] = node && node[$TYPE] || void 0 || null;
                                    }
                                    childValue$5 = stack$9[offset$6 + 4] || (stack$9[offset$6 + 4] = childType$5 === SENTINEL ? node[VALUE] : node);
                                    if ((isBranch$5 = stack$9[offset$6 + 5]) === void 0) {
                                        isBranch$5 = stack$9[offset$6 + 5] = !childType$5 && (node != null && typeof node === 'object') && !Array.isArray(childValue$5);
                                    }
                                    if (isBranch$5 === true) {
                                        if ((keys$6 = stack$9[offset$6 + 6]) === void 0) {
                                            keys$6 = stack$9[offset$6 + 6] = [];
                                            index$7 = -1;
                                            for (invKey$5 in node) {
                                                !(!(invKey$5[0] !== '_' || invKey$5[1] !== '_') || (invKey$5 === __SELF || invKey$5 === __PARENT || invKey$5 === __ROOT) || invKey$5[0] === '$') && (keys$6[++index$7] = invKey$5);
                                            }
                                        }
                                        index$7 = stack$9[offset$6 + 7] || (stack$9[offset$6 + 7] = 0);
                                        if (index$7 < keys$6.length) {
                                            stack$9[offset$6 + 7] = index$7 + 1;
                                            stack$9[offset$6 = ++depth$10 * 8] = node;
                                            stack$9[offset$6 + 1] = invKey$5 = keys$6[index$7];
                                            stack$9[offset$6 + 2] = node[invKey$5];
                                            continue;
                                        }
                                    }
                                    var ref$27 = node[$TYPE] === SENTINEL ? node[VALUE] : node, destination$9;
                                    if (ref$27 && Array.isArray(ref$27)) {
                                        destination$9 = ref$27[__CONTEXT];
                                        if (destination$9) {
                                            var i$27 = (ref$27[__REF_INDEX] || 0) - 1, n$21 = (destination$9[__REFS_LENGTH] || 0) - 1;
                                            while (++i$27 <= n$21) {
                                                destination$9[__REF + i$27] = destination$9[__REF + (i$27 + 1)];
                                            }
                                            destination$9[__REFS_LENGTH] = n$21;
                                            ref$27[__REF_INDEX] = ref$27[__CONTEXT] = destination$9 = void 0;
                                        }
                                    }
                                    var ref$28, i$28 = -1, n$22 = node[__REFS_LENGTH] || 0;
                                    while (++i$28 < n$22) {
                                        if ((ref$28 = node[__REF + i$28]) !== void 0) {
                                            ref$28[__CONTEXT] = node[__REF + i$28] = void 0;
                                        }
                                    }
                                    node[__REFS_LENGTH] = void 0;
                                    if (node != null && typeof node === 'object') {
                                        var root$12 = root, head$11 = root$12.__head, tail$11 = root$12.__tail, next$11, prev$11;
                                        (next$11 = node.__next) && (next$11 != null && typeof next$11 === 'object') && (next$11.__prev = prev$11);
                                        (prev$11 = node.__prev) && (prev$11 != null && typeof prev$11 === 'object') && (prev$11.__next = next$11);
                                        node === head$11 && (root$12.__head = root$12.__next = head$11 = next$11);
                                        node === tail$11 && (root$12.__tail = root$12.__prev = tail$11 = prev$11);
                                        node.__next = node.__prev = void 0;
                                        head$11 = tail$11 = next$11 = prev$11 = void 0;
                                    }
                                    nodeParent[invKey$5] = node[__SELF] = node[__PARENT] = node[__ROOT] = void 0;
                                    delete stack$9[offset$6 + 0];
                                    delete stack$9[offset$6 + 1];
                                    delete stack$9[offset$6 + 2];
                                    delete stack$9[offset$6 + 3];
                                    delete stack$9[offset$6 + 4];
                                    delete stack$9[offset$6 + 5];
                                    delete stack$9[offset$6 + 6];
                                    delete stack$9[offset$6 + 7];
                                    --depth$10;
                                }
                                nodeParent = invParent$5;
                                node = invChild$5;
                            }
                            nodeParent[key] = node = newNode$2;
                            node = !node[__SELF] && ((node[__SELF] = node) || true) && ((node[__KEY] = key) || true) && ((node[__PARENT] = nodeParent) || true) && ((node[__ROOT] = nodeRoot) || true) && (node[__GENERATION] || (node[__GENERATION] = 0) || node) && ((!nodeType || nodeType === SENTINEL) && Array.isArray(nodeValue) && (nodeValue[__CONTAINER] = node)) || node;
                            size_offset$2 = leafSize$2 - nodeSize;
                            var node$6 = nodeParent, child$5 = node, stack$10 = [];
                            while (node = nodeParent) {
                                nodeParent = node[__PARENT];
                                if ((node[$SIZE] = (node[$SIZE] || 0) - size_offset$2) <= 0 && true && nodeParent) {
                                    var ref$29 = node[$TYPE] === SENTINEL ? node[VALUE] : node, destination$10;
                                    if (ref$29 && Array.isArray(ref$29)) {
                                        destination$10 = ref$29[__CONTEXT];
                                        if (destination$10) {
                                            var i$29 = (ref$29[__REF_INDEX] || 0) - 1, n$23 = (destination$10[__REFS_LENGTH] || 0) - 1;
                                            while (++i$29 <= n$23) {
                                                destination$10[__REF + i$29] = destination$10[__REF + (i$29 + 1)];
                                            }
                                            destination$10[__REFS_LENGTH] = n$23;
                                            ref$29[__REF_INDEX] = ref$29[__CONTEXT] = destination$10 = void 0;
                                        }
                                    }
                                    var ref$30, i$30 = -1, n$24 = node[__REFS_LENGTH] || 0;
                                    while (++i$30 < n$24) {
                                        if ((ref$30 = node[__REF + i$30]) !== void 0) {
                                            ref$30[__CONTEXT] = node[__REF + i$30] = void 0;
                                        }
                                    }
                                    node[__REFS_LENGTH] = void 0;
                                    if (node != null && typeof node === 'object') {
                                        var root$13 = root, head$12 = root$13.__head, tail$12 = root$13.__tail, next$12, prev$12;
                                        (next$12 = node.__next) && (next$12 != null && typeof next$12 === 'object') && (next$12.__prev = prev$12);
                                        (prev$12 = node.__prev) && (prev$12 != null && typeof prev$12 === 'object') && (prev$12.__next = next$12);
                                        node === head$12 && (root$13.__head = root$13.__next = head$12 = next$12);
                                        node === tail$12 && (root$13.__tail = root$13.__prev = tail$12 = prev$12);
                                        node.__next = node.__prev = void 0;
                                        head$12 = tail$12 = next$12 = prev$12 = void 0;
                                    }
                                    nodeParent[node[__KEY]] = node[__SELF] = node[__PARENT] = node[__ROOT] = void 0;
                                } else if (node[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                    var depth$11 = 0, references$5, ref$31, i$31, k$5, n$25;
                                    while (depth$11 > -1) {
                                        if ((references$5 = stack$10[depth$11]) === void 0) {
                                            i$31 = k$5 = -1;
                                            n$25 = node[__REFS_LENGTH] || 0;
                                            node[__GENERATION_UPDATED] = __GENERATION_VERSION;
                                            node[__GENERATION] = __GENERATION_GUID++;
                                            if ((ref$31 = node[__PARENT]) !== void 0 && ref$31[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                                stack$10[depth$11] = references$5 = new Array(n$25 + 1);
                                                references$5[++k$5] = ref$31;
                                            } else if (n$25 > 0) {
                                                stack$10[depth$11] = references$5 = new Array(n$25);
                                            }
                                            while (++i$31 < n$25) {
                                                if ((ref$31 = node[__REF + i$31]) !== void 0 && ref$31[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                                    references$5[++k$5] = ref$31;
                                                }
                                            }
                                        }
                                        if ((node = references$5 && references$5.pop()) !== void 0) {
                                            ++depth$11;
                                        } else {
                                            stack$10[depth$11--] = void 0;
                                        }
                                    }
                                }
                            }
                            nodeParent = node$6;
                            node = child$5;
                            if (node != null && typeof node === 'object') {
                                if (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true) {
                                    node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                                } else {
                                    if (nodeExpires !== 1) {
                                        var root$14 = root, head$13 = root$14.__head, tail$13 = root$14.__tail, next$13 = node.__next, prev$13 = node.__prev;
                                        if (node !== head$13) {
                                            next$13 && (next$13 != null && typeof next$13 === 'object') && (next$13.__prev = prev$13);
                                            prev$13 && (prev$13 != null && typeof prev$13 === 'object') && (prev$13.__next = next$13);
                                            (next$13 = head$13) && (head$13 != null && typeof head$13 === 'object') && (head$13.__prev = node);
                                            root$14.__head = root$14.__next = head$13 = node;
                                            head$13.__next = next$13;
                                            head$13.__prev = void 0;
                                        }
                                        if (tail$13 == null || node === tail$13) {
                                            root$14.__tail = root$14.__prev = tail$13 = prev$13 || node;
                                        }
                                        root$14 = head$13 = tail$13 = next$13 = prev$13 = void 0;
                                    }
                                }
                            }
                            appendNullKey = false;
                        }
                        nodeParent = node;
                        break follow_path_map_9410;
                    } while (true);
                node = nodeParent;
            }
            if (node != null || boxed === true) {
                if (nodeType === ERROR) {
                    if (nodeExpires !== 1) {
                        var root$15 = root, head$14 = root$15.__head, tail$14 = root$15.__tail, next$14 = node.__next, prev$14 = node.__prev;
                        if (node !== head$14) {
                            next$14 && (next$14 != null && typeof next$14 === 'object') && (next$14.__prev = prev$14);
                            prev$14 && (prev$14 != null && typeof prev$14 === 'object') && (prev$14.__next = next$14);
                            (next$14 = head$14) && (head$14 != null && typeof head$14 === 'object') && (head$14.__prev = node);
                            root$15.__head = root$15.__next = head$14 = node;
                            head$14.__next = next$14;
                            head$14.__prev = void 0;
                        }
                        if (tail$14 == null || node === tail$14) {
                            root$15.__tail = root$15.__prev = tail$14 = prev$14 || node;
                        }
                        root$15 = head$14 = tail$14 = next$14 = prev$14 = void 0;
                    }
                    var nodeType$2 = node && node[$TYPE] || void 0;
                    nodeValue = nodeType$2 === SENTINEL ? node[VALUE] : nodeType$2 === ERROR ? node = errorSelector(requestedPath, node) : node;
                    var pbv = Object.create(null);
                    var src = requestedPath, i$32 = -1, n$26 = src.length, req = new Array(n$26);
                    while (++i$32 < n$26) {
                        req[i$32] = src[i$32];
                    }
                    if (appendNullKey === true) {
                        req[req.length] = null;
                    }
                    pbv.path = req;
                    if (boxed === true) {
                        pbv.value = node;
                    } else {
                        var dest = nodeValue, src$2 = dest, x;
                        if (dest != null && typeof dest === 'object') {
                            dest = Array.isArray(src$2) && [] || Object.create(null);
                            for (x in src$2) {
                                !(!(x[0] !== '_' || x[1] !== '_') || (x === __SELF || x === __PARENT || x === __ROOT) || x[0] === '$') && (dest[x] = src$2[x]);
                            }
                        }
                        pbv.value = dest;
                    }
                    errors[errors.length] = pbv;
                }
                var src$3 = optimizedPath, i$33 = -1, n$27 = src$3.length, opt = new Array(n$27);
                while (++i$33 < n$27) {
                    opt[i$33] = src$3[i$33];
                }
                var src$4 = requestedPath, i$34 = -1, n$28 = src$4.length, req$2 = new Array(n$28);
                while (++i$34 < n$28) {
                    req$2[i$34] = src$4[i$34];
                }
                if (appendNullKey === true) {
                    req$2[req$2.length] = null;
                }
                requestedPaths[requestedPaths.length] = req$2;
                optimizedPaths[optimizedPaths.length] = opt;
                if (values != null) {
                    var pbv$2 = Object.create(null);
                    var src$5 = requestedPath, i$35 = -1, n$29 = src$5.length, req$3 = new Array(n$29);
                    while (++i$35 < n$29) {
                        req$3[i$35] = src$5[i$35];
                    }
                    if (appendNullKey === true) {
                        req$3[req$3.length] = null;
                    }
                    pbv$2.path = req$3;
                    if (boxed === true) {
                        pbv$2.value = node;
                    } else {
                        var dest$2 = nodeValue, src$6 = dest$2, x$2;
                        if (dest$2 != null && typeof dest$2 === 'object') {
                            dest$2 = Array.isArray(src$6) && [] || Object.create(null);
                            for (x$2 in src$6) {
                                !(!(x$2[0] !== '_' || x$2[1] !== '_') || (x$2 === __SELF || x$2 === __PARENT || x$2 === __ROOT) || x$2[0] === '$') && (dest$2[x$2] = src$6[x$2]);
                            }
                        }
                        pbv$2.value = dest$2;
                    }
                    typeof values === 'function' && (values(pbv$2) || true) || Array.isArray(values) && (values[values.length] = pbv$2);
                }
            }
            if (boxed === false && node == null || refreshing === true) {
                var src$7 = boundPath, i$36 = -1, n$30 = src$7.length, req$4 = new Array(n$30);
                while (++i$36 < n$30) {
                    req$4[i$36] = src$7[i$36];
                }
                var src$8 = optimizedPath, i$37 = -1, n$31 = src$8.length, opt$2 = new Array(n$31);
                while (++i$37 < n$31) {
                    opt$2[i$37] = src$8[i$37];
                }
                var reqLen = req$4.length - 1, optLen = opt$2.length - 1, i$38 = -1, n$32 = requestedPath.length, map, offset$7, keys$7, index$8, reqKeys, optKeys, optKeysLen, x$3, y, z;
                while (++i$38 < n$32) {
                    req$4[++reqLen] = (reqKeys = pathMapStack[offset$7 = (i$38 + boundLength) * 4 + 1]) && reqKeys.length > 1 && [requestedPath[i$38]] || requestedPath[i$38];
                }
                var j$2 = depth, k$6 = reqLen, l = optLen;
                i$38 = j$2++;
                while (j$2 > i$38) {
                    if ((map = pathMapStack[offset$7 = (j$2 + boundLength) * 4]) != null && typeof map === 'object' && map[$TYPE] === void 0 && Array.isArray(map) === false && (keys$7 = pathMapStack[offset$7 + 1] || (pathMapStack[offset$7 + 1] = Object.keys(map))) && ((index$8 = pathMapStack[offset$7 + 2] || (pathMapStack[offset$7 + 2] = 0)) || true) && keys$7.length > 0) {
                        if ((pathMapStack[offset$7 + 2] = ++index$8) - 1 < keys$7.length) {
                            if (reqLen - k$6 < j$2 - i$38) {
                                var src$9 = keys$7, i$39 = -1, n$33 = src$9.length, dest$3 = new Array(n$33);
                                while (++i$39 < n$33) {
                                    dest$3[i$39] = src$9[i$39];
                                }
                                reqKeys = dest$3;
                                x$3 = -1;
                                y = reqKeys.length;
                                while (++x$3 < y) {
                                    reqKeys[x$3] = (z = reqKeys[x$3]) == __NULL ? null : z;
                                }
                                req$4[++reqLen] = y === 1 ? reqKeys[0] : reqKeys;
                            }
                            if (optLen - l < j$2 - i$38) {
                                var src$10 = keys$7, i$40 = -1, n$34 = src$10.length, dest$4 = new Array(n$34);
                                while (++i$40 < n$34) {
                                    dest$4[i$40] = src$10[i$40];
                                }
                                reqKeys = dest$4;
                                optKeys = [];
                                optKeysLen = 0;
                                x$3 = -1;
                                y = reqKeys.length;
                                while (++x$3 < y) {
                                    (z = reqKeys[x$3]) !== __NULL && (optKeys[optKeysLen++] = z);
                                }
                                if (optKeysLen > 0) {
                                    opt$2[++optLen] = optKeysLen === 1 ? optKeys[0] : optKeys;
                                }
                            }
                            pathMapStack[offset$7 = 4 * (++j$2 + boundLength)] = map[keys$7[index$8 - 1]];
                            continue;
                        }
                    }
                    delete pathMapStack[offset$7 = 4 * (j$2-- + boundLength)];
                    delete pathMapStack[offset$7 + 1];
                    delete pathMapStack[offset$7 + 2];
                    delete pathMapStack[offset$7 + 3];
                }
                req$4.pathSetIndex = index;
                requestedMissingPaths[requestedMissingPaths.length] = req$4;
                optimizedMissingPaths[optimizedMissingPaths.length] = opt$2;
            }
            appendNullKey = false;
            var offset$8, keys$8, index$9;
            while (depth > -1 && (keys$8 = pathMapStack[(offset$8 = 4 * depth) + 1]) && ((index$9 = pathMapStack[offset$8 + 2]) || true) && (pathMapStack[offset$8 + 2] = ++index$9) >= keys$8.length) {
                delete pathMapStack[offset$8 + 0];
                delete pathMapStack[offset$8 + 1];
                delete pathMapStack[offset$8 + 2];
                delete pathMapStack[offset$8 + 3];
                --depth;
            }
        }
    }
    return {
        'values': values,
        'errors': errors,
        'requestedPaths': requestedPaths,
        'optimizedPaths': optimizedPaths,
        'requestedMissingPaths': requestedMissingPaths,
        'optimizedMissingPaths': optimizedMissingPaths
    };
}
function getPathsAsValues(model, pathSets, values, errorSelector, boundPath) {
    Array.isArray(values) && (values.length = 0);
    var boundLength = 0, nodeRoot = model._cache || (model._cache = {}), nodeParent, node;
    if (Array.isArray(boundPath)) {
        nodeParent = nodeRoot;
        boundLength = boundPath.length;
    } else {
        nodeParent = getBoundContext(model);
        boundPath = model._path || [];
    }
    var root = model._root || model, boxed = model._boxed || false, expired = root.expired || (root.expired = []), refreshing = model._refreshing || false, appendNullKey = false;
    typeof errorSelector === 'function' || (errorSelector = model._errorSelector) || (errorSelector = function (x$4, y) {
        return y;
    });
    var nodes = pathSets.nodes || (pathSets.nodes = []);
    var errors = pathSets.errors || (pathSets.errors = []);
    var refs = pathSets.refs || (pathSets.refs = []);
    var depth = pathSets.depth || (pathSets.depth = 0);
    var refIndex = pathSets.refIndex || (pathSets.refIndex = 0);
    var refDepth = pathSets.refDepth || (pathSets.refDepth = 0);
    var requestedPath = pathSets.requestedPath || (pathSets.requestedPath = []);
    var optimizedPath = pathSets.optimizedPath || (pathSets.optimizedPath = []);
    var requestedPaths = pathSets.requestedPaths || (pathSets.requestedPaths = []);
    var optimizedPaths = pathSets.optimizedPaths || (pathSets.optimizedPaths = []);
    var requestedMissingPaths = pathSets.requestedMissingPaths || (pathSets.requestedMissingPaths = []);
    var optimizedMissingPaths = pathSets.optimizedMissingPaths || (pathSets.optimizedMissingPaths = []);
    var path, length = 0, height = 0, reference, refLength = 0, refHeight = 0, nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires;
    refs[-1] = boundPath;
    nodes[-1] = nodeParent;
    var index = -1, count = pathSets.length;
    while (++index < count) {
        path = pathSets[index];
        depth = 0;
        length = path.length;
        height = length - 1;
        var ref;
        refs.length = 0;
        while (depth > -1) {
            refIndex = depth;
            while (--refIndex >= -1) {
                if (!!(ref = refs[refIndex])) {
                    refLength = ref.length;
                    var i = -1, j = 0;
                    while (++i < refLength) {
                        optimizedPath[j++] = ref[i];
                    }
                    i = ++refIndex;
                    while (i < depth) {
                        optimizedPath[j++] = requestedPath[i++];
                    }
                    optimizedPath.length = j;
                    break;
                }
            }
            var key, isKeySet;
            path = path;
            height = (length = path.length) - 1;
            nodeParent = nodes[depth - 1];
            nodeType = nodeParent && nodeParent[$TYPE] || void 0;
            nodeValue = nodeType === SENTINEL ? nodeParent[VALUE] : nodeParent;
            if (nodeParent == null || nodeType !== void 0 || typeof nodeParent !== 'object' || Array.isArray(nodeValue)) {
                node = nodeParent;
                nodeParent = nodes;
                key = depth - 1;
                isKeySet = false;
                optimizedPath[optimizedPath.length = depth + (refLength - refIndex)] = key;
                node = nodeParent[key];
                nodeType = node && node[$TYPE] || void 0;
                nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                nodeTimestamp = node && node[$TIMESTAMP];
                nodeExpires = node && node[$EXPIRES];
                if (node != null && typeof node === 'object') {
                    if (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true) {
                        node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                    } else {
                        if (nodeExpires !== 1) {
                            var root$2 = root, head = root$2.__head, tail = root$2.__tail, next = node.__next, prev = node.__prev;
                            if (node !== head) {
                                next && (next != null && typeof next === 'object') && (next.__prev = prev);
                                prev && (prev != null && typeof prev === 'object') && (prev.__next = next);
                                (next = head) && (head != null && typeof head === 'object') && (head.__prev = node);
                                root$2.__head = root$2.__next = head = node;
                                head.__next = next;
                                head.__prev = void 0;
                            }
                            if (tail == null || node === tail) {
                                root$2.__tail = root$2.__prev = tail = prev || node;
                            }
                            root$2 = head = tail = next = prev = void 0;
                        }
                    }
                }
                node = node;
            } else {
                nodeParent = node = nodes[depth - 1];
                depth = depth;
                follow_path_10187:
                    do {
                        key = path[depth];
                        if (isKeySet = key != null && typeof key === 'object') {
                            if (Array.isArray(key)) {
                                if ((key = key[key.index || (key.index = 0)]) != null && typeof key === 'object') {
                                    key = key[__OFFSET] === void 0 && (key[__OFFSET] = key.from || (key.from = 0)) || key[__OFFSET];
                                }
                            } else {
                                key = key[__OFFSET] === void 0 && (key[__OFFSET] = key.from || (key.from = 0)) || key[__OFFSET];
                            }
                        }
                        if (key === __NULL) {
                            key = null;
                        }
                        depth >= boundLength && (requestedPath[requestedPath.length = depth - boundLength] = key);
                        if (key != null) {
                            if (depth < height) {
                                optimizedPath[optimizedPath.length = depth + (refLength - refIndex)] = key;
                                node = nodeParent[key];
                                nodeType = node && node[$TYPE] || void 0;
                                nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                                nodeTimestamp = node && node[$TIMESTAMP];
                                nodeExpires = node && node[$EXPIRES];
                                if (node != null && typeof node === 'object' && (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true)) {
                                    node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                                }
                                if ((!nodeType || nodeType === SENTINEL) && Array.isArray(nodeValue)) {
                                    do {
                                        if (nodeExpires !== 1) {
                                            var root$3 = root, head$2 = root$3.__head, tail$2 = root$3.__tail, next$2 = node.__next, prev$2 = node.__prev;
                                            if (node !== head$2) {
                                                next$2 && (next$2 != null && typeof next$2 === 'object') && (next$2.__prev = prev$2);
                                                prev$2 && (prev$2 != null && typeof prev$2 === 'object') && (prev$2.__next = next$2);
                                                (next$2 = head$2) && (head$2 != null && typeof head$2 === 'object') && (head$2.__prev = node);
                                                root$3.__head = root$3.__next = head$2 = node;
                                                head$2.__next = next$2;
                                                head$2.__prev = void 0;
                                            }
                                            if (tail$2 == null || node === tail$2) {
                                                root$3.__tail = root$3.__prev = tail$2 = prev$2 || node;
                                            }
                                            root$3 = head$2 = tail$2 = next$2 = prev$2 = void 0;
                                        }
                                        refs[depth] = nodeValue;
                                        refIndex = depth + 1;
                                        refDepth = 0;
                                        var location = (nodeValue[__CONTAINER] || nodeValue)[__CONTEXT];
                                        if (location !== void 0) {
                                            node = location;
                                            refHeight = (refLength = nodeValue.length) - 1;
                                            while (refDepth < refLength) {
                                                optimizedPath[refDepth] = nodeValue[refDepth++];
                                            }
                                            optimizedPath.length = refLength;
                                        } else {
                                            var key$2, isKeySet$2;
                                            reference = nodeValue;
                                            refHeight = (refLength = reference.length) - 1;
                                            nodeParent = nodeRoot;
                                            nodeType = nodeParent && nodeParent[$TYPE] || void 0;
                                            nodeValue = nodeType === SENTINEL ? nodeParent[VALUE] : nodeParent;
                                            if (nodeParent == null || nodeType !== void 0 || typeof nodeParent !== 'object' || Array.isArray(nodeValue)) {
                                                node = node = nodeParent;
                                            } else {
                                                nodeParent = nodeRoot;
                                                refDepth = refDepth;
                                                follow_path_10364:
                                                    do {
                                                        key$2 = reference[refDepth];
                                                        isKeySet$2 = false;
                                                        if (key$2 != null) {
                                                            if (refDepth < refHeight) {
                                                                optimizedPath[optimizedPath.length = refDepth] = key$2;
                                                                node = nodeParent[key$2];
                                                                nodeType = node && node[$TYPE] || void 0;
                                                                nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                                                                nodeTimestamp = node && node[$TIMESTAMP];
                                                                nodeExpires = node && node[$EXPIRES];
                                                                if (node != null && typeof node === 'object' && (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true)) {
                                                                    node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                                                                }
                                                                if (appendNullKey = node == null || nodeType !== void 0 || typeof node !== 'object' || Array.isArray(nodeValue)) {
                                                                    nodeParent = node;
                                                                    break follow_path_10364;
                                                                }
                                                                nodeParent = node;
                                                                refDepth = refDepth + 1;
                                                                continue follow_path_10364;
                                                            } else if (refDepth === refHeight) {
                                                                optimizedPath[optimizedPath.length = refDepth] = key$2;
                                                                node = nodeParent[key$2];
                                                                nodeType = node && node[$TYPE] || void 0;
                                                                nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                                                                nodeTimestamp = node && node[$TIMESTAMP];
                                                                nodeExpires = node && node[$EXPIRES];
                                                                if (node != null && typeof node === 'object' && (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true)) {
                                                                    node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                                                                }
                                                                if (node != null) {
                                                                    var refContainer = reference[__CONTAINER] || reference, refContext = refContainer[__CONTEXT];
                                                                    // Set up the hard-link so we don't have to do all
                                                                    // this work the next time we follow this reference.
                                                                    if (refContext === void 0) {
                                                                        // create a back reference
                                                                        var backRefs = node[__REFS_LENGTH] || 0;
                                                                        node[__REF + backRefs] = refContainer;
                                                                        node[__REFS_LENGTH] = backRefs + 1;
                                                                        // create a hard reference
                                                                        refContainer[__REF_INDEX] = backRefs;
                                                                        refContainer[__CONTEXT] = node;
                                                                        refContainer = backRefs = void 0;
                                                                    }
                                                                    ;
                                                                }
                                                                appendNullKey = node == null || nodeType !== void 0 || typeof node !== 'object' || Array.isArray(nodeValue);
                                                                nodeParent = node;
                                                                break follow_path_10364;
                                                            }
                                                        } else if (refDepth < refHeight) {
                                                            nodeParent = node;
                                                            refDepth = refDepth + 1;
                                                            continue follow_path_10364;
                                                        }
                                                        nodeParent = node;
                                                        break follow_path_10364;
                                                    } while (true);
                                                node = nodeParent;
                                            }
                                        }
                                        nodeType = node && node[$TYPE] || void 0;
                                        nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                                        nodeExpires = node && node[$EXPIRES];
                                        if (node != null && typeof node === 'object' && (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true)) {
                                            node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                                        }
                                    } while ((!nodeType || nodeType === SENTINEL) && Array.isArray(nodeValue));
                                    if (node == null) {
                                        while (refDepth <= refHeight) {
                                            optimizedPath[refDepth] = reference[refDepth++];
                                        }
                                    }
                                }
                                if (node == null || nodeType !== void 0 || typeof node !== 'object' || Array.isArray(nodeValue)) {
                                    nodeParent = node;
                                    break follow_path_10187;
                                }
                                nodeParent = nodes[depth] = node;
                                depth = depth + 1;
                                continue follow_path_10187;
                            } else if (depth === height) {
                                optimizedPath[optimizedPath.length = depth + (refLength - refIndex)] = key;
                                node = nodeParent[key];
                                nodeType = node && node[$TYPE] || void 0;
                                nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                                nodeTimestamp = node && node[$TIMESTAMP];
                                nodeExpires = node && node[$EXPIRES];
                                if (node != null && typeof node === 'object') {
                                    if (nodeExpires != null && nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < Date.now()) || node[__INVALIDATED] === true) {
                                        node = nodeValue = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                                    } else {
                                        if (nodeExpires !== 1) {
                                            var root$4 = root, head$3 = root$4.__head, tail$3 = root$4.__tail, next$3 = node.__next, prev$3 = node.__prev;
                                            if (node !== head$3) {
                                                next$3 && (next$3 != null && typeof next$3 === 'object') && (next$3.__prev = prev$3);
                                                prev$3 && (prev$3 != null && typeof prev$3 === 'object') && (prev$3.__next = next$3);
                                                (next$3 = head$3) && (head$3 != null && typeof head$3 === 'object') && (head$3.__prev = node);
                                                root$4.__head = root$4.__next = head$3 = node;
                                                head$3.__next = next$3;
                                                head$3.__prev = void 0;
                                            }
                                            if (tail$3 == null || node === tail$3) {
                                                root$4.__tail = root$4.__prev = tail$3 = prev$3 || node;
                                            }
                                            root$4 = head$3 = tail$3 = next$3 = prev$3 = void 0;
                                        }
                                    }
                                }
                                appendNullKey = false;
                                nodeParent = node;
                                break follow_path_10187;
                            }
                        } else if (depth < height) {
                            nodeParent = nodeParent;
                            depth = depth + 1;
                            continue follow_path_10187;
                        }
                        nodeParent = node;
                        break follow_path_10187;
                    } while (true);
                node = nodeParent;
            }
            if (node != null || boxed === true) {
                if (nodeType === ERROR) {
                    if (nodeExpires !== 1) {
                        var root$5 = root, head$4 = root$5.__head, tail$4 = root$5.__tail, next$4 = node.__next, prev$4 = node.__prev;
                        if (node !== head$4) {
                            next$4 && (next$4 != null && typeof next$4 === 'object') && (next$4.__prev = prev$4);
                            prev$4 && (prev$4 != null && typeof prev$4 === 'object') && (prev$4.__next = next$4);
                            (next$4 = head$4) && (head$4 != null && typeof head$4 === 'object') && (head$4.__prev = node);
                            root$5.__head = root$5.__next = head$4 = node;
                            head$4.__next = next$4;
                            head$4.__prev = void 0;
                        }
                        if (tail$4 == null || node === tail$4) {
                            root$5.__tail = root$5.__prev = tail$4 = prev$4 || node;
                        }
                        root$5 = head$4 = tail$4 = next$4 = prev$4 = void 0;
                    }
                    var nodeType$2 = node && node[$TYPE] || void 0;
                    nodeValue = nodeType$2 === SENTINEL ? node[VALUE] : nodeType$2 === ERROR ? node = errorSelector(requestedPath, node) : node;
                    var pbv = Object.create(null);
                    var src = requestedPath, i$2 = -1, n = src.length, req = new Array(n);
                    while (++i$2 < n) {
                        req[i$2] = src[i$2];
                    }
                    if (appendNullKey === true) {
                        req[req.length] = null;
                    }
                    pbv.path = req;
                    if (boxed === true) {
                        pbv.value = node;
                    } else {
                        var dest = nodeValue, src$2 = dest, x;
                        if (dest != null && typeof dest === 'object') {
                            dest = Array.isArray(src$2) && [] || Object.create(null);
                            for (x in src$2) {
                                !(!(x[0] !== '_' || x[1] !== '_') || (x === __SELF || x === __PARENT || x === __ROOT) || x[0] === '$') && (dest[x] = src$2[x]);
                            }
                        }
                        pbv.value = dest;
                    }
                    errors[errors.length] = pbv;
                }
                var src$3 = optimizedPath, i$3 = -1, n$2 = src$3.length, opt = new Array(n$2);
                while (++i$3 < n$2) {
                    opt[i$3] = src$3[i$3];
                }
                var src$4 = requestedPath, i$4 = -1, n$3 = src$4.length, req$2 = new Array(n$3);
                while (++i$4 < n$3) {
                    req$2[i$4] = src$4[i$4];
                }
                if (appendNullKey === true) {
                    req$2[req$2.length] = null;
                }
                requestedPaths[requestedPaths.length] = req$2;
                optimizedPaths[optimizedPaths.length] = opt;
                if (values != null) {
                    var pbv$2 = Object.create(null);
                    var src$5 = requestedPath, i$5 = -1, n$4 = src$5.length, req$3 = new Array(n$4);
                    while (++i$5 < n$4) {
                        req$3[i$5] = src$5[i$5];
                    }
                    if (appendNullKey === true) {
                        req$3[req$3.length] = null;
                    }
                    pbv$2.path = req$3;
                    if (boxed === true) {
                        pbv$2.value = node;
                    } else {
                        var dest$2 = nodeValue, src$6 = dest$2, x$2;
                        if (dest$2 != null && typeof dest$2 === 'object') {
                            dest$2 = Array.isArray(src$6) && [] || Object.create(null);
                            for (x$2 in src$6) {
                                !(!(x$2[0] !== '_' || x$2[1] !== '_') || (x$2 === __SELF || x$2 === __PARENT || x$2 === __ROOT) || x$2[0] === '$') && (dest$2[x$2] = src$6[x$2]);
                            }
                        }
                        pbv$2.value = dest$2;
                    }
                    typeof values === 'function' && (values(pbv$2) || true) || Array.isArray(values) && (values[values.length] = pbv$2);
                }
            }
            if (boxed === false && node == null || refreshing === true) {
                var src$7 = boundPath, i$6 = -1, n$5 = src$7.length, req$4 = new Array(n$5);
                while (++i$6 < n$5) {
                    req$4[i$6] = src$7[i$6];
                }
                var src$8 = optimizedPath, i$7 = -1, n$6 = src$8.length, opt$2 = new Array(n$6);
                while (++i$7 < n$6) {
                    opt$2[i$7] = src$8[i$7];
                }
                var reqLen = req$4.length - 1, optLen = opt$2.length - 1, i$8 = -1, n$7 = requestedPath.length, j$2 = depth, k = height, x$3;
                while (++i$8 < n$7) {
                    req$4[++reqLen] = path[i$8 + boundLength] != null && typeof path[i$8 + boundLength] === 'object' && [requestedPath[i$8]] || requestedPath[i$8];
                }
                i$8 = -1;
                n$7 = height - depth;
                while (++i$8 < n$7) {
                    x$3 = req$4[++reqLen] = path[++j$2 + boundLength];
                    x$3 != null && (opt$2[++optLen] = x$3);
                }
                req$4.pathSetIndex = index;
                requestedMissingPaths[requestedMissingPaths.length] = req$4;
                optimizedMissingPaths[optimizedMissingPaths.length] = opt$2;
            }
            appendNullKey = false;
            var key$3;
            depth = depth;
            unroll_10060:
                do {
                    if (depth < 0) {
                        depth = (path.depth = 0) - 1;
                        break unroll_10060;
                    }
                    if (!((key$3 = path[depth]) != null && typeof key$3 === 'object')) {
                        depth = path.depth = depth - 1;
                        continue unroll_10060;
                    }
                    if (Array.isArray(key$3)) {
                        if (++key$3.index === key$3.length) {
                            if (!((key$3 = key$3[key$3.index = 0]) != null && typeof key$3 === 'object')) {
                                depth = path.depth = depth - 1;
                                continue unroll_10060;
                            }
                        } else {
                            depth = path.depth = depth;
                            break unroll_10060;
                        }
                    }
                    if (++key$3[__OFFSET] > (key$3.to || (key$3.to = key$3.from + (key$3.length || 1) - 1))) {
                        key$3[__OFFSET] = key$3.from;
                        depth = path.depth = depth - 1;
                        continue unroll_10060;
                    }
                    depth = path.depth = depth;
                    break unroll_10060;
                } while (true);
            depth = depth;
        }
    }
    return {
        'values': values,
        'errors': errors,
        'requestedPaths': requestedPaths,
        'optimizedPaths': optimizedPaths,
        'requestedMissingPaths': requestedMissingPaths,
        'optimizedMissingPaths': optimizedMissingPaths
    };
}

function getBoundContext(model) {
    return getBoundValue(model || this).value;
}
function getBoundValue(model, path, value, boxed, shorted) {
    model || (model = this);
    path || (path = model._path || []);
    if (path.length) {
        model._boxed = (boxed = model._boxed) || true;
        value = getValueSync(model, path.concat(null));
        model._boxed = boxed;
        path = value.path;
        shorted = value.shorted;
        value = value.value;
        while (path[path.length - 1] == null) {
            path.pop();
        }
    } else {
        value = model._cache;
        shorted = false;
    }
    return {
        path: path,
        value: value,
        shorted: shorted
    };
}
