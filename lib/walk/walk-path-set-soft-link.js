module.exports = walkPathSet;

var $ref = require("./../types/ref");

var walkReference = require("./../walk/walk-reference");

var arrayClone = require("./../support/array-clone");
var arrayAppend = require("./../support/array-append");

var isExpired = require("./../support/is-expired");
var isPrimitive = require("./../support/is-primitive");
var isObject = require("./../support/is-object");

var keysetToKey = require("./../support/keyset-to-key");
var permuteKeyset = require("./../support/permute-keyset");

var promote = require("./../lru/promote");

var positions = require("./../support/positions");
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;

function walkPathSet(onNode, onValueType, pathset, depth, roots, parents, nodes, requested, optimizedArg, key, keyset, isKeyset) {

    var optimized = optimizedArg;
    var node = nodes[_cache];

    if (depth >= pathset.length || isPrimitive(node)) {
        return onValueType(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var type = node.$type;

    while (type === $ref) {

        if (isExpired(roots, node)) {
            nodes[_cache] = void 0;
            return onValueType(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset);
        }

        promote(roots.lru, node);

        var container = node;
        var reference = node.value;

        nodes[_cache] = parents[_cache] = roots[_cache];
        nodes[_jsong] = parents[_jsong] = roots[_jsong];
        nodes[_message] = parents[_message] = roots[_message];

        walkReference(onNode, container, reference, roots, parents, nodes, requested, optimized);

        node = nodes[_cache];

        if (node == null) {
            optimized = arrayClone(reference);
            return onValueType(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset);
        } else {
            if (isObject(node)) {
                type = node.$type;
            }
            if ((Boolean(type) && type !== $ref) || isPrimitive(node)) {
                onNode(pathset, roots, parents, nodes, requested, optimized, false, false, null, keyset, false);
                return onValueType(pathset, depth, roots, parents, nodes, arrayAppend(requested, null), optimized, key, keyset);
            }
        }
    }

    if (type != null) {
        return onValueType(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset);
    }

    var outerKey = pathset[depth];
    var isOuterKeyset = isObject(outerKey);
    var isBranch = depth < pathset.length - 1;
    var runOnce = false;

    while (isOuterKeyset && permuteKeyset(outerKey) || (!runOnce)) {
        runOnce = true;
        var innerKey, innerKeyset;

        if (isOuterKeyset === true) {
            innerKey = keysetToKey(outerKey, true);
            innerKeyset = innerKey;
        } else {
            innerKey = outerKey;
            innerKeyset = keyset;
        }

        var nodes2 = arrayClone(nodes);
        var parents2 = arrayClone(parents);
        var requested2, optimized2;

        if (innerKey == null) {
            requested2 = arrayAppend(requested, null);
            optimized2 = arrayClone(optimized);
            // optimized2 = optimized;
            innerKey = key;
            innerKeyset = keyset;
            onNode(pathset, roots, parents2, nodes2, requested2, optimized2, false, isBranch, null, innerKeyset, false);
        } else {
            requested2 = arrayAppend(requested, innerKey);
            optimized2 = arrayAppend(optimized, innerKey);
            onNode(pathset, roots, parents2, nodes2, requested2, optimized2, false, isBranch, innerKey, innerKeyset, isOuterKeyset);
        }

        walkPathSet(onNode, onValueType,
            pathset, depth + 1,
            roots, parents2, nodes2,
            requested2, optimized2,
            innerKey, innerKeyset, isOuterKeyset
        );
    }
}
