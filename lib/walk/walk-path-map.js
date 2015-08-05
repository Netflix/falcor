module.exports = walkPathMap;

var prefix = require("./../internal/prefix");
var __context = require("./../internal/context");
var $ref = require("./../types/ref");

var walkReference = require("./../walk/walk-reference");

var arrayClone = require("./../support/array-clone");
var arrayAppend = require("./../support/array-append");

var isExpired = require("./../support/is-expired");
var isPrimitive = require("./../support/is-primitive");
var isObject = require("./../support/is-object");
var isArray = Array.isArray;

var promote = require("./../lru/promote");

var positions = require("./../support/positions");
var _cache = positions.cache;

function walkPathMap(onNode, onValueType, pathmap, keysStack, depth, roots, parents, nodes, requested, optimizedArg, key, keyset, isKeyset) {

    var optimized = optimizedArg;
    var node = nodes[_cache];

    if (isPrimitive(pathmap) || isPrimitive(node)) {
        return onValueType(pathmap, keysStack, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var type = node.$type;

    while (type === $ref) {

        if (isExpired(roots, node)) {
            nodes[_cache] = void 0;
            return onValueType(pathmap, keysStack, depth, roots, parents, nodes, requested, optimized, key, keyset);
        }

        promote(roots.lru, node);

        var container = node;
        var reference = node.value;
        node = node[__context];

        if (node != null) {
            type = node.$type;
            optimized = arrayClone(reference);
            nodes[_cache] = node;
        } else {

            nodes[_cache] = parents[_cache] = roots[_cache];

            walkReference(onNode, container, reference, roots, parents, nodes, requested, optimized);

            node = nodes[_cache];

            if (node == null) {
                optimized = arrayClone(reference);
                return onValueType(pathmap, keysStack, depth, roots, parents, nodes, requested, optimized, key, keyset);
            } else {
                if (isObject(node)) {
                    type = node.$type;
                }
                if ((Boolean(type) && type !== $ref) || isPrimitive(node)) {
                    onNode(pathmap, roots, parents, nodes, requested, optimized, false, null, keyset, false);
                    return onValueType(pathmap, keysStack, depth, roots, parents, nodes, arrayAppend(requested, null), optimized, key, keyset);
                }
            }
        }
    }

    if (type != null) {
        return onValueType(pathmap, keysStack, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var keys = keysStack[depth] = Object.keys(pathmap);

    // Force in the arrays hidden field length.
    if (isArray(pathmap)) {
        keys[keys.length] = "length";
    }

    if (keys.length === 0) {
        return onValueType(pathmap, keysStack, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var isOuterKeyset = keys.length > 1;

    for (var i = -1, n = keys.length; ++i < n;) {

        var innerKey = keys[i];

        if ((innerKey[0] === prefix) || (innerKey[0] === "$")) {
            continue;
        }

        var innerKeyset = isOuterKeyset ? innerKey : keyset;
        var nodes2 = arrayClone(nodes);
        var parents2 = arrayClone(parents);
        var pathmap2 = pathmap[innerKey];
        var requested2, optimized2;
        var childKey = false;

        var isBranch = isObject(pathmap2) && !pathmap2.$type; // && !isArray(pathmap2);

        if (isBranch) {
            for (childKey in pathmap2) {
                if ((childKey[0] === prefix) || (childKey[0] === "$")) {
                    continue;
                }
                childKey = pathmap2.hasOwnProperty(childKey);
                break;
            }
            isBranch = childKey === true;
        }

        if (innerKey === "null") {
            requested2 = arrayAppend(requested, null);
            optimized2 = arrayClone(optimized);
            innerKey = key;
            innerKeyset = keyset;
            pathmap2 = pathmap;
            onNode(pathmap2, roots, parents2, nodes2, requested2, optimized2, false, isBranch, null, innerKeyset, false);
        } else {
            requested2 = arrayAppend(requested, innerKey);
            optimized2 = arrayAppend(optimized, innerKey);
            onNode(pathmap2, roots, parents2, nodes2, requested2, optimized2, false, isBranch, innerKey, innerKeyset, isOuterKeyset);
        }

        if (isBranch) {
            walkPathMap(onNode, onValueType,
                pathmap2, keysStack, depth + 1,
                roots, parents2, nodes2,
                requested2, optimized2,
                innerKey, innerKeyset, isOuterKeyset
            );
        } else {
            onValueType(pathmap2, keysStack, depth + 1, roots, parents2, nodes2, requested2, optimized2, innerKey, innerKeyset);
        }
    }
}
