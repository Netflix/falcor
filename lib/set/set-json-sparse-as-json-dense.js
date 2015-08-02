module.exports = setJsonSparseAsJsonDense;

var $error = require("./../types/error");
var $atom = require("./../types/atom");
var __version = require("./../internal/version");

var clone = require("./../support/clone-dense-json");
var arrayClone = require("./../support/array-clone");

var options = require("./../support/options");
var walkPathMap = require("./../walk/walk-path-map");

var isObject = require("./../support/is-object");

var getValidKey = require("./../support/get-valid-key");
var createBranch = require("./../support/create-branch");
var wrapNode = require("./../support/wrap-node");
var replaceNode = require("./../support/replace-node");
var graphNode = require("./../support/graph-node");
var updateGraph = require("./../support/update-graph");

var setNodeIfError = require("./../support/treat-node-as-error");
var setSuccessfulPaths = require("./../support/set-successful-paths");

var positions = require("./../support/positions");
var _cache = positions.cache;
var _json = positions.json;

function setJsonSparseAsJsonDense(model, pathmaps, values, errorSelector, comparator) {

    var modelRoot = model._root;
    var modelCache = modelRoot.cache;
    var initialVersion = modelCache[__version];

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

    var newVersion = modelCache[__version];
    var rootChangeHandler = modelRoot.onChange;

    if (rootChangeHandler && initialVersion !== newVersion) {
        rootChangeHandler();
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

    var node = parent[key],
        type;

    if (isReference) {
        type = isObject(node) && node.$type || void 0;
        type = type && isBranch && "." || type;
        node = createBranch(roots, parent, node, type, key);
        parents[_cache] = parent;
        nodes[_cache] = node;
        return;
    }

    parents[_json] = json;

    if (isBranch) {
        type = isObject(node) && node.$type || void 0;
        node = createBranch(roots, parent, node, type, key);
        parents[_cache] = nodes[_cache] = node;
        if (isKeyset && Boolean(json)) {
            nodes[_json] = json[keyset] || (json[keyset] = {});
        }
        return;
    }

    var selector = roots.errorSelector;
    var comparator = roots.comparator;
    var root = roots[_cache];
    var size = isObject(node) && node.$size || 0;
    var message = pathmap;

    type = isObject(message) && message.$type || void 0;
    message = wrapNode(message, type, Boolean(type) ? message.value : message);
    type = type || $atom;

    if (type === $error && Boolean(selector)) {
        message = selector(requested, message);
    }

    var isDistinct = roots.isDistinct = true;

    if (Boolean(comparator)) {
        isDistinct = roots.isDistinct = !comparator(requested, node, message);
    }

    if (isDistinct) {
        node = replaceNode(parent, node, message, key, roots.lru);
        node = graphNode(root, parent, node, key, roots.version);
        updateGraph(parent, size - node.$size, roots.version, roots.lru);
    }
    nodes[_cache] = node;
}

function onEdge(pathmap, keysStack, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = isObject(node) && node.$type || (node = void 0);

    var isError = setNodeIfError(roots, node, type, requested);

    if (isError) {
        return;
    }

    if (roots.isDistinct === true) {
        roots.isDistinct = false;
        setSuccessfulPaths(roots, requested, optimized);
        if (keyset == null) {
            roots.json = clone(roots, node, type, node && node.value);
        } else {
            json = parents[_json];
            if (Boolean(json)) {
                json[keyset] = clone(roots, node, type, node && node.value);
            }
        }
        roots.hasValue = true;
    }
}
