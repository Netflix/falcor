module.exports = setCache;

var $error = require("./../types/error");
var $atom = require("./../types/atom");

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

var promote = require("./../lru/promote");

var positions = require("./../support/positions");
var _cache = positions.cache;

/**
 * Populates a model's cache from an existing deserialized cache.
 * Traverses the existing cache as a path map, writing all the leaves
 * into the model's cache as they're encountered.
 * @private
 */
function setCache(model, pathmap, errorSelector) {

    var modelRoot = model._root;

    var roots = options([], model, errorSelector);
    var nodes = roots.nodes;
    var parents = arrayClone(nodes);
    var requested = [];
    var optimized = [];
    var keysStack = [];

    roots[_cache] = roots.root;

    walkPathMap(onNode, onEdge, pathmap, keysStack, 0, roots, parents, nodes, requested, optimized);

    var rootChangeHandler = modelRoot.onChange;

    if (rootChangeHandler) {
        rootChangeHandler();
    }

    return model;
}

function onNode(pathmap, roots, parents, nodes, requested, optimized, isReference, isBranch, keyArg, keyset, isKeyset) {

    var key = keyArg;
    var parent;

    if (key == null) {
        key = getValidKey(optimized);
        if (key == null) {
            return;
        }
        parent = parents[_cache];
    } else {
        parent = nodes[_cache];
    }

    var node = parent[key],
        type;

    if (isBranch) {
        type = isObject(node) && node.$type || void 0;
        node = createBranch(roots, parent, node, type, key);
        parents[_cache] = nodes[_cache] = node;
        return;
    }

    var selector = roots.errorSelector;
    var root = roots[_cache];
    var size = isObject(node) && node.$size || 0;
    var mess = pathmap;

    type = isObject(mess) && mess.$type || void 0;
    mess = wrapNode(mess, type, Boolean(type) ? mess.value : mess);
    type = type || $atom;

    if (type === $error && Boolean(selector)) {
        mess = selector(requested, mess);
    }

    node = replaceNode(parent, node, mess, key, roots.lru);
    node = graphNode(root, parent, node, key, roots.version);
    updateGraph(parent, size - node.$size, roots.version, roots.lru);
    nodes[_cache] = node;
}

function onEdge(pathmap, keysStack, depth, roots, parents, nodes, requested, optimized, key, keyset) {
    if (depth > 0) {
        promote(roots.lru, nodes[_cache]);
    }
}
