/* istanbul ignore next */
/*eslint-disable */
// this file is transpiled, no point in linting it
var NOOP = function NOOP() {},
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
    ],

    $TYPE = "$type",
    $SIZE = "$size",
    $EXPIRES = "$expires",
    $TIMESTAMP = "$timestamp",

    SENTINEL = "atom",
    PATH = "ref",
    ERROR = "error",
    VALUE = "value",
    EXPIRED = "expired",
    LEAF = "leaf";

/* istanbul ignore next */
module.exports = function setCache(model, map) {
    var root = model._root, expired = root.expired, depth = 0, height = 0, mapStack = [], nodes = [], nodeRoot = model._cache, nodeParent = nodeRoot, node = nodeParent, nodeType, nodeValue, nodeSize, nodeTimestamp, nodeExpires;
    mapStack[0] = map;
    nodes[-1] = nodeParent;
    while (depth > -1) {
        /* Walk Path Map */
        var isTerminus = false, offset = 0, keys = void 0, index = void 0, key = void 0, isKeySet = false;
        node = nodeParent = nodes[depth - 1];
        depth = depth;
        follow_path_map_9177:
            do {
                height = depth;
                nodeType = node && node[$TYPE] || void 0;
                nodeValue = nodeType === SENTINEL ? node[VALUE] : node;
                if ((isTerminus = !((map = mapStack[offset = depth * 4]) != null && typeof map === 'object') || map[$TYPE] !== void 0 || Array.isArray(map) || !((keys = mapStack[offset + 1] || (mapStack[offset + 1] = Object.keys(map))) && ((index = mapStack[offset + 2] || (mapStack[offset + 2] = 0)) || true) && ((isKeySet = keys.length > 1) || keys.length > 0))) || (node == null || nodeType !== void 0 || typeof node !== 'object' || Array.isArray(nodeValue))) {
                    if ((nodeExpires = (node && node[$EXPIRES]) != null) && (nodeExpires !== 1 && (nodeExpires === 0 || nodeExpires < now())) || node != null && node[__INVALIDATED] === true) {
                        nodeType = void 0;
                        nodeValue = void 0;
                        node = (expired[expired.length] = node) && (node[__INVALIDATED] = true) && void 0;
                    }
                    if (!isTerminus && ((!nodeType || nodeType === SENTINEL) && Array.isArray(nodeValue))) {
                        if (node == null || nodeType !== void 0 || typeof node !== 'object' || Array.isArray(nodeValue)) {
                            key = null;
                            node = node;
                            depth = depth;
                            continue follow_path_map_9177;
                        }
                    } else {
                        if (key != null) {
                            var newNode, sizeOffset, edgeSize = node && node[$SIZE] || 0;
                            nodeType = map && map[$TYPE] || void 0;
                            nV2 = nodeType ? map[VALUE] : void 0;
                            nodeValue = nodeType === SENTINEL ? map[VALUE] : map;
                            newNode = map;
                            if ((!nodeType || nodeType === SENTINEL || nodeType === PATH) && Array.isArray(nodeValue)) {
                                delete nodeValue[$SIZE];
                                // console.log(1);
                                if (nodeType) {
                                    nodeSize = 50 + (nodeValue.length || 1);
                                } else {
                                    nodeSize = nodeValue.length || 1;
                                }
                                newNode[$SIZE] = nodeSize;
                                nodeValue[__CONTAINER] = newNode;
                            } else if (nodeType === SENTINEL || nodeType === PATH) {
                                newNode[$SIZE] = nodeSize = 50 + (nV2 && typeof nV2.length === 'number' ? nV2.length : 1);
                            } else if (nodeType === ERROR) {
                                newNode[$SIZE] = nodeSize = map && map[$SIZE] || 0 || 50 + 1;
                            } else if (!(map != null && typeof map === 'object')) {
                                nodeSize = 50 + (typeof nodeValue === 'string' && nodeValue.length || 1);
                                nodeType = 'atom';
                                newNode = {};
                                newNode[VALUE] = nodeValue;
                                newNode[$TYPE] = nodeType;
                                newNode[$SIZE] = nodeSize;
                            } else {
                                nodeType = newNode[$TYPE] = nodeType || GROUP;
                                newNode[$SIZE] = nodeSize = map && map[$SIZE] || 0 || 50 + 1;
                            }
                            ;
                            if (node !== newNode && (node != null && typeof node === 'object')) {
                                var nodeRefsLength = node[__REFS_LENGTH] || 0, destRefsLength = newNode[__REFS_LENGTH] || 0, i = -1, ref;
                                while (++i < nodeRefsLength) {
                                    if ((ref = node[__REF + i]) !== void 0) {
                                        ref[__CONTEXT] = newNode;
                                        newNode[__REF + (destRefsLength + i)] = ref;
                                        node[__REF + i] = void 0;
                                    }
                                }
                                newNode[__REFS_LENGTH] = nodeRefsLength + destRefsLength;
                                node[__REFS_LENGTH] = ref = void 0;
                                var invParent = nodeParent, invChild = node, invKey = key, keys$2, index$2, offset$2, childType, childValue, isBranch, stack = [
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
                                            index$2 = -1;
                                            for (var childKey in node) {
                                                !(!(childKey[0] !== '_' || childKey[1] !== '_') || (childKey === __SELF || childKey === __PARENT || childKey === __ROOT) || childKey[0] === '$') && (keys$2[++index$2] = childKey);
                                            }
                                        }
                                        index$2 = stack[offset$2 + 7] || (stack[offset$2 + 7] = 0);
                                        if (index$2 < keys$2.length) {
                                            stack[offset$2 + 7] = index$2 + 1;
                                            stack[offset$2 = ++depth$2 * 8] = node;
                                            stack[offset$2 + 1] = invKey = keys$2[index$2];
                                            stack[offset$2 + 2] = node[invKey];
                                            continue;
                                        }
                                    }
                                    var ref$2 = node[$TYPE] === SENTINEL ? node[VALUE] : node, destination;
                                    if (ref$2 && Array.isArray(ref$2)) {
                                        destination = ref$2[__CONTEXT];
                                        if (destination) {
                                            var i$2 = (ref$2[__REF_INDEX] || 0) - 1, n = (destination[__REFS_LENGTH] || 0) - 1;
                                            while (++i$2 <= n) {
                                                destination[__REF + i$2] = destination[__REF + (i$2 + 1)];
                                            }
                                            destination[__REFS_LENGTH] = n;
                                            ref$2[__REF_INDEX] = ref$2[__CONTEXT] = destination = void 0;
                                        }
                                    }
                                    if (node != null && typeof node === 'object') {
                                        var ref$3, i$3 = -1, n$2 = node[__REFS_LENGTH] || 0;
                                        while (++i$3 < n$2) {
                                            if ((ref$3 = node[__REF + i$3]) !== void 0) {
                                                ref$3[__CONTEXT] = node[__REF + i$3] = void 0;
                                            }
                                        }
                                        node[__REFS_LENGTH] = void 0;
                                        var root$2 = root, head = root$2.__head, tail = root$2.__tail, next = node.__next, prev = node.__prev;
                                        next != null && typeof next === 'object' && (next.__prev = prev);
                                        prev != null && typeof prev === 'object' && (prev.__next = next);
                                        node === head && (root$2.__head = root$2.__next = next);
                                        node === tail && (root$2.__tail = root$2.__prev = prev);
                                        node.__next = node.__prev = void 0;
                                        head = tail = next = prev = void 0;
                                        ;
                                        nodeParent[invKey] = node[__SELF] = node[__PARENT] = node[__ROOT] = void 0;
                                    }
                                    ;
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
                            nodeType = node && node[$TYPE] || void 0;
                            node = !node[__SELF] && ((node[__SELF] = node) || true) && ((node[__KEY] = key) || true) && ((node[__PARENT] = nodeParent) || true) && ((node[__ROOT] = nodeRoot) || true) && (node[__GENERATION] || (node[__GENERATION] = ++__GENERATION_GUID) && node) && ((!nodeType || nodeType === SENTINEL) && Array.isArray(nodeValue) && (nodeValue[__CONTAINER] = node)) || node;
                            sizeOffset = edgeSize - nodeSize;
                            var self = nodeParent, child = node;
                            while ((node = nodeParent)) {
                                nodeParent = node[__PARENT];
                                if ((node[$SIZE] = (node[$SIZE] || 0) - sizeOffset) <= 0 && nodeParent) {
                                    var ref$4 = node[$TYPE] === SENTINEL ? node[VALUE] : node, destination$2;
                                    if (ref$4 && Array.isArray(ref$4)) {
                                        destination$2 = ref$4[__CONTEXT];
                                        if (destination$2) {
                                            var i$4 = (ref$4[__REF_INDEX] || 0) - 1, n$3 = (destination$2[__REFS_LENGTH] || 0) - 1;
                                            while (++i$4 <= n$3) {
                                                destination$2[__REF + i$4] = destination$2[__REF + (i$4 + 1)];
                                            }
                                            destination$2[__REFS_LENGTH] = n$3;
                                            ref$4[__REF_INDEX] = ref$4[__CONTEXT] = destination$2 = void 0;
                                        }
                                    }
                                    if (node != null && typeof node === 'object') {
                                        var ref$5, i$5 = -1, n$4 = node[__REFS_LENGTH] || 0;
                                        while (++i$5 < n$4) {
                                            if ((ref$5 = node[__REF + i$5]) !== void 0) {
                                                ref$5[__CONTEXT] = node[__REF + i$5] = void 0;
                                            }
                                        }
                                        node[__REFS_LENGTH] = void 0;
                                        var root$3 = root, head$2 = root$3.__head, tail$2 = root$3.__tail, next$2 = node.__next, prev$2 = node.__prev;
                                        next$2 != null && typeof next$2 === 'object' && (next$2.__prev = prev$2);
                                        prev$2 != null && typeof prev$2 === 'object' && (prev$2.__next = next$2);
                                        node === head$2 && (root$3.__head = root$3.__next = next$2);
                                        node === tail$2 && (root$3.__tail = root$3.__prev = prev$2);
                                        node.__next = node.__prev = void 0;
                                        head$2 = tail$2 = next$2 = prev$2 = void 0;
                                        ;
                                        nodeParent[node[__KEY]] = node[__SELF] = node[__PARENT] = node[__ROOT] = void 0;
                                    }
                                } else if (node[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                    var self$2 = node, stack$2 = [], depth$3 = 0, linkPaths, ref$6, i$6, k, n$5;
                                    while (depth$3 > -1) {
                                        if ((linkPaths = stack$2[depth$3]) === void 0) {
                                            i$6 = k = -1;
                                            n$5 = node[__REFS_LENGTH] || 0;
                                            node[__GENERATION_UPDATED] = __GENERATION_VERSION;
                                            node[__GENERATION] = ++__GENERATION_GUID;
                                            if ((ref$6 = node[__PARENT]) !== void 0 && ref$6[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                                stack$2[depth$3] = linkPaths = new Array(n$5 + 1);
                                                linkPaths[++k] = ref$6;
                                            } else if (n$5 > 0) {
                                                stack$2[depth$3] = linkPaths = new Array(n$5);
                                            }
                                            while (++i$6 < n$5) {
                                                if ((ref$6 = node[__REF + i$6]) !== void 0 && ref$6[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                                    linkPaths[++k] = ref$6;
                                                }
                                            }
                                        }
                                        if ((node = linkPaths && linkPaths.pop()) !== void 0) {
                                            ++depth$3;
                                        } else {
                                            stack$2[depth$3--] = void 0;
                                        }
                                    }
                                    node = self$2;
                                }
                            }
                            nodeParent = self;
                            node = child;
                        }
                        ;
                        node = node;
                        break follow_path_map_9177;
                    }
                }
                if ((key = keys[index]) == null) {
                    node = node;
                    break follow_path_map_9177;
                } else if (key === __NULL && ((key = null) || true) || !(!(key[0] !== '_' || key[1] !== '_') || (key === __SELF || key === __PARENT || key === __ROOT) || key[0] === '$') && ((mapStack[(depth + 1) * 4] = map[key]) || true)) {
                    mapStack[(depth + 1) * 4 + 3] = key;
                } else {
                    mapStack[offset + 2] = index + 1;
                    node = node;
                    depth = depth;
                    continue follow_path_map_9177;
                }
                nodes[depth - 1] = nodeParent = node;
                if (key != null) {
                    node = nodeParent && nodeParent[key];
                    if (typeof map === 'object') {
                        for (var key$2 in map) {
                            key$2[0] === '$' && key$2 !== $SIZE && (nodeParent && (nodeParent[key$2] = map[key$2]) || true);
                        }
                        map = map[key];
                    }
                    var mapType = map && map[$TYPE] || void 0;
                    var mapValue = mapType === SENTINEL ? map[VALUE] : map;
                    if ((node == null || typeof node !== 'object' || !!nodeType && nodeType !== SENTINEL && !Array.isArray(nodeValue)) && (!mapType && (map != null && typeof map === 'object') && !Array.isArray(mapValue))) {
                        nodeType = void 0;
                        nodeValue = {};
                        nodeSize = node && node[$SIZE] || 0;
                        if (node !== nodeValue && (node != null && typeof node === 'object')) {
                            var nodeRefsLength$2 = node[__REFS_LENGTH] || 0, destRefsLength$2 = nodeValue[__REFS_LENGTH] || 0, i$7 = -1, ref$7;
                            while (++i$7 < nodeRefsLength$2) {
                                if ((ref$7 = node[__REF + i$7]) !== void 0) {
                                    ref$7[__CONTEXT] = nodeValue;
                                    nodeValue[__REF + (destRefsLength$2 + i$7)] = ref$7;
                                    node[__REF + i$7] = void 0;
                                }
                            }
                            nodeValue[__REFS_LENGTH] = nodeRefsLength$2 + destRefsLength$2;
                            node[__REFS_LENGTH] = ref$7 = void 0;
                            var invParent$2 = nodeParent, invChild$2 = node, invKey$2 = key, keys$3, index$3, offset$3, childType$2, childValue$2, isBranch$2, stack$3 = [
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
                                        index$3 = -1;
                                        for (var childKey$2 in node) {
                                            !(!(childKey$2[0] !== '_' || childKey$2[1] !== '_') || (childKey$2 === __SELF || childKey$2 === __PARENT || childKey$2 === __ROOT) || childKey$2[0] === '$') && (keys$3[++index$3] = childKey$2);
                                        }
                                    }
                                    index$3 = stack$3[offset$3 + 7] || (stack$3[offset$3 + 7] = 0);
                                    if (index$3 < keys$3.length) {
                                        stack$3[offset$3 + 7] = index$3 + 1;
                                        stack$3[offset$3 = ++depth$4 * 8] = node;
                                        stack$3[offset$3 + 1] = invKey$2 = keys$3[index$3];
                                        stack$3[offset$3 + 2] = node[invKey$2];
                                        continue;
                                    }
                                }
                                var ref$8 = node[$TYPE] === SENTINEL ? node[VALUE] : node, destination$3;
                                if (ref$8 && Array.isArray(ref$8)) {
                                    destination$3 = ref$8[__CONTEXT];
                                    if (destination$3) {
                                        var i$8 = (ref$8[__REF_INDEX] || 0) - 1, n$6 = (destination$3[__REFS_LENGTH] || 0) - 1;
                                        while (++i$8 <= n$6) {
                                            destination$3[__REF + i$8] = destination$3[__REF + (i$8 + 1)];
                                        }
                                        destination$3[__REFS_LENGTH] = n$6;
                                        ref$8[__REF_INDEX] = ref$8[__CONTEXT] = destination$3 = void 0;
                                    }
                                }
                                if (node != null && typeof node === 'object') {
                                    var ref$9, i$9 = -1, n$7 = node[__REFS_LENGTH] || 0;
                                    while (++i$9 < n$7) {
                                        if ((ref$9 = node[__REF + i$9]) !== void 0) {
                                            ref$9[__CONTEXT] = node[__REF + i$9] = void 0;
                                        }
                                    }
                                    node[__REFS_LENGTH] = void 0;
                                    var root$4 = root, head$3 = root$4.__head, tail$3 = root$4.__tail, next$3 = node.__next, prev$3 = node.__prev;
                                    next$3 != null && typeof next$3 === 'object' && (next$3.__prev = prev$3);
                                    prev$3 != null && typeof prev$3 === 'object' && (prev$3.__next = next$3);
                                    node === head$3 && (root$4.__head = root$4.__next = next$3);
                                    node === tail$3 && (root$4.__tail = root$4.__prev = prev$3);
                                    node.__next = node.__prev = void 0;
                                    head$3 = tail$3 = next$3 = prev$3 = void 0;
                                    ;
                                    nodeParent[invKey$2] = node[__SELF] = node[__PARENT] = node[__ROOT] = void 0;
                                }
                                ;
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
                        node = !node[__SELF] && ((node[__SELF] = node) || true) && ((node[__KEY] = key) || true) && ((node[__PARENT] = nodeParent) || true) && ((node[__ROOT] = nodeRoot) || true) && (node[__GENERATION] || (node[__GENERATION] = ++__GENERATION_GUID) && node) && ((!nodeType || nodeType === SENTINEL) && Array.isArray(nodeValue) && (nodeValue[__CONTAINER] = node)) || node;
                        var self$3 = node, node$2;
                        while ((node$2 = node)) {
                            if (node[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                var self$4 = node, stack$4 = [], depth$5 = 0, linkPaths$2, ref$10, i$10, k$2, n$8;
                                while (depth$5 > -1) {
                                    if ((linkPaths$2 = stack$4[depth$5]) === void 0) {
                                        i$10 = k$2 = -1;
                                        n$8 = node[__REFS_LENGTH] || 0;
                                        node[__GENERATION_UPDATED] = __GENERATION_VERSION;
                                        node[__GENERATION] = ++__GENERATION_GUID;
                                        if ((ref$10 = node[__PARENT]) !== void 0 && ref$10[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                            stack$4[depth$5] = linkPaths$2 = new Array(n$8 + 1);
                                            linkPaths$2[++k$2] = ref$10;
                                        } else if (n$8 > 0) {
                                            stack$4[depth$5] = linkPaths$2 = new Array(n$8);
                                        }
                                        while (++i$10 < n$8) {
                                            if ((ref$10 = node[__REF + i$10]) !== void 0 && ref$10[__GENERATION_UPDATED] !== __GENERATION_VERSION) {
                                                linkPaths$2[++k$2] = ref$10;
                                            }
                                        }
                                    }
                                    if ((node = linkPaths$2 && linkPaths$2.pop()) !== void 0) {
                                        ++depth$5;
                                    } else {
                                        stack$4[depth$5--] = void 0;
                                    }
                                }
                                node = self$4;
                            }
                            node = node$2[__PARENT];
                        }
                        node = self$3;
                    }
                }
                node = node;
                depth = depth + 1;
                continue follow_path_map_9177;
            } while (true);
        node = node;
        var offset$4 = depth * 4, keys$4, index$4;
        do {
            delete mapStack[offset$4 + 0];
            delete mapStack[offset$4 + 1];
            delete mapStack[offset$4 + 2];
            delete mapStack[offset$4 + 3];
        } while ((keys$4 = mapStack[(offset$4 = 4 * --depth) + 1]) && ((index$4 = mapStack[offset$4 + 2]) || true) && (mapStack[offset$4 + 2] = ++index$4) >= keys$4.length);
    }
    return nodeRoot;
}
/*eslint-enable */
