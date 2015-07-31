module.exports = invalidateJsonSparseAsJsonDense;

var clone = require("./../support/clone-dense-json");
var arrayClone = require("./../support/array-clone");
var arraySlice = require("./../support/array-slice");

var options = require("./../support/options");
var walkPathMap = require("./../walk/walk-path-map");

var isObject = require("./../support/is-object");

var getValidKey = require("./../support/get-valid-key");
var updateGraph = require("./../support/update-graph");
var invalidateNode = require("./../support/invalidate-node");

var positions = require("./../support/positions");
var _cache = positions.cache;
var _json = positions.json;

function invalidateJsonSparseAsJsonDense(model, pathmaps, values, errorSelector, comparator) {

    var roots = options([], model, errorSelector, comparator);
    var index = -1;
    var count = pathmaps.length;
    var nodes = roots.nodes;
    var parents = arrayClone(nodes);
    var requested = [];
    var optimized = arrayClone(roots.bound);
    var keysStack = [];
    var json, hasValue, hasValues;

    roots[_cache] = roots.root;

    while (++index < count) {

        json = values && values[index];
        if (isObject(json)) {
            roots.json = roots[_json] = parents[_json] = nodes[_json] = json.json || (json.json = {});
        } else {
            roots.json = roots[_json] = parents[_json] = nodes[_json] = void 0;
        }

        var pathmap = pathmaps[index].json;
        roots.index = index;

        walkPathMap(onNode, onEdge, pathmap, keysStack, 0, roots, parents, nodes, requested, optimized);

        hasValue = roots.hasValue;
        if (Boolean(hasValue)) {
            hasValues = true;
            if (isObject(json)) {
                json.json = roots.json;
            }
            delete roots.json;
            delete roots.hasValue;
        } else if (isObject(json)) {
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

function onNode(pathmap, roots, parents, nodes, requested, optimized, isReference, isBranch, keyArg, keyset, isKeyset) {

    var key = keyArg;
    var parent, json;

    if (key == null) {
        key = getValidKey(optimized);
        if (key == null) {
            return;
        }
        json = parents[_json];
        parent = parents[_cache];
    } else {
        json = isKeyset && nodes[_json] || parents[_json];
        parent = nodes[_cache];
    }

    var node = parent[key];

    if (isReference) {
        parents[_cache] = parent;
        nodes[_cache] = node;
        return;
    }

    parents[_json] = json;

    if (isBranch) {
        parents[_cache] = nodes[_cache] = node;
        if (isKeyset && Boolean(json)) {
            nodes[_json] = json[keyset] || (json[keyset] = {});
        }
        return;
    }

    nodes[_cache] = node;

    var lru = roots.lru;
    var size = node.$size || 0;
    var version = roots.version;
    invalidateNode(parent, node, key, lru);
    updateGraph(parent, size, version, lru);
}

function onEdge(pathmap, keysStack, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = isObject(node) && node.$type || (node = void 0);

    if (keyset == null) {
        roots.json = clone(roots, node, type, node && node.value);
    } else {
        json = parents[_json];
        if (Boolean(json)) {
            json[keyset] = clone(roots, node, type, node && node.value);
        }
    }
    roots.hasValue = true;
    roots.requestedPaths.push(arraySlice(requested, roots.offset));
}
