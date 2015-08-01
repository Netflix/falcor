module.exports = setJsonSparseAsJsonGraph;

var $ref = require("./../types/ref");
var $error = require("./../types/error");
var $atom = require("./../types/atom");
var __version = require("./../internal/version");

var clone = require("./../support/clone-graph-json");
var arrayClone = require("./../support/array-clone");

var options = require("./../support/options");
var walkPathMap = require("./../walk/walk-path-map-soft-link");

var isObject = require("./../support/is-object");

var getValidKey = require("./../support/get-valid-key");
var createBranch = require("./../support/create-branch");
var wrapNode = require("./../support/wrap-node");
var replaceNode = require("./../support/replace-node");
var graphNode = require("./../support/graph-node");
var updateGraph = require("./../support/update-graph");

var setSuccessfulPaths = require("./../support/set-successful-paths");

var promote = require("./../lru/promote");

var positions = require("./../support/positions");
var _cache = positions.cache;
var _jsong = positions.jsong;

function setJsonSparseAsJsonGraph(model, pathmaps, values, errorSelector, comparator) {

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
    var json = values[0];
    var hasValue;

    roots[_cache] = roots.root;
    roots[_jsong] = parents[_jsong] = nodes[_jsong] = json.jsonGraph || (json.jsonGraph = {});
    roots.requestedPaths = json.paths || (json.paths = roots.requestedPaths);

    while (++index < count) {
        var pathmap = pathmaps[index].json;
        walkPathMap(onNode, onEdge, pathmap, keysStack, 0, roots, parents, nodes, requested, optimized);
    }

    hasValue = roots.hasValue;
    if (hasValue) {
        json.jsonGraph = roots[_jsong];
    } else {
        delete json.jsonGraph;
        delete json.paths;
    }

    var newVersion = modelCache[__version];
    var rootChangeHandler = modelRoot.onChange;

    if (rootChangeHandler && initialVersion !== newVersion) {
        rootChangeHandler();
    }

    return {
        values: values,
        errors: roots.errors,
        hasValue: hasValue,
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
        json = parents[_jsong];
        parent = parents[_cache];
    } else {
        json = nodes[_jsong];
        parent = nodes[_cache];
    }

    var jsonkey = key;
    var node = parent[key],
        type;

    if (isReference) {
        type = isObject(node) && node.$type || void 0;
        type = type && isBranch && "." || type;
        node = createBranch(roots, parent, node, type, key);
        parents[_cache] = parent;
        nodes[_cache] = node;
        parents[_jsong] = json;
        if (type === $ref) {
            json[jsonkey] = clone(roots, node, type, node.value);
            roots.hasValue = true;
        } else {
            nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    if (isBranch) {
        type = isObject(node) && node.$type || void 0;
        node = createBranch(roots, parent, node, type, key);
        type = node.$type;
        parents[_cache] = nodes[_cache] = node;
        parents[_jsong] = json;
        if (type === $ref) {
            json[jsonkey] = clone(roots, node, type, node.value);
            roots.hasValue = true;
        } else {
            nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
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
    type  = type || $atom;

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

        json[jsonkey] = clone(roots, node, type, node && node.value);
        roots.hasValue = true;
    }
    nodes[_cache] = node;
}

function onEdge(pathmap, keysStack, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = isObject(node) && node.$type || (node = void 0);

    promote(roots.lru, node);

    if (roots.isDistinct === true) {
        roots.isDistinct = false;
        setSuccessfulPaths(roots, requested, optimized);
        if (keyset == null && !roots.hasValue && getValidKey(optimized) == null) {
            node = clone(roots, node, type, node && node.value);
            json = roots[_jsong];
            json.$type = node.$type;
            json.value = node.value;
        }
        roots.hasValue = true;
    }
}
