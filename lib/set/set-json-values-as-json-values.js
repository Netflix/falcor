module.exports = setJsonValuesAsJsonValues;

var $error = require("./../types/error");
var $atom = require("./../types/atom");
var __version = require("./../internal/version");

var clone = require("./../support/clone-dense-json");
var arrayClone = require("./../support/array-clone");

var options = require("./../support/options");
var walkPathSet = require("./../walk/walk-path-set");

var isObject = require("./../support/is-object");

var getValidKey = require("./../support/get-valid-key");
var createBranch = require("./../support/create-branch");
var wrapNode = require("./../support/wrap-node");
var invalidateNode = require("./../support/invalidate-node");
var replaceNode = require("./../support/replace-node");
var graphNode = require("./../support/graph-node");
var updateGraph = require("./../support/update-graph");

var setNodeIfMissingPath = require("./../support/treat-node-as-missing-path-set");
var setNodeIfError = require("./../support/treat-node-as-error");
var setSuccessfulPaths = require("./../support/set-successful-paths");

var positions = require("./../support/positions");
var _cache = positions.cache;

/**
 * TODO: CR More comments.
 * Sets a list of PathValues into the cache and calls the onNext for each value.
 * @private
 */
function setJsonValuesAsJsonValues(model, pathvalues, onNext, errorSelector, comparator) {

    var modelRoot = model._root;
    var modelCache = modelRoot.cache;
    var initialVersion = modelCache[__version];

    // TODO: CR Rename options to setup set state
    var roots = options([], model, errorSelector, comparator);
    var pathsIndex = -1;
    var pathsCount = pathvalues.length;
    var nodes = roots.nodes;
    var parents = arrayClone(nodes);
    var requestedPath = [];
    var optimizedPath = arrayClone(roots.bound);

    // TODO: CR Rename node array indicies
    roots[_cache] = roots.root;
    roots.onNext = onNext;

    while (++pathsIndex < pathsCount) {
        var pv = pathvalues[pathsIndex];
        var pathset = pv.path;
        roots.value = pv.value;
        walkPathSet(onNode, onValueType, pathset, 0, roots, parents, nodes, requestedPath, optimizedPath);
    }

    var newVersion = modelCache[__version];
    var rootChangeHandler = modelRoot.onChange;

    if (rootChangeHandler && initialVersion !== newVersion) {
        rootChangeHandler();
    }

    return {
        values: null,
        errors: roots.errors,
        requestedPaths: roots.requestedPaths,
        optimizedPaths: roots.optimizedPaths,
        requestedMissingPaths: roots.requestedMissingPaths,
        optimizedMissingPaths: roots.optimizedMissingPaths
    };
}

// TODO: CR
// - comment parents and nodes initial state
// - comment parents and nodes mutation

function onNode(pathset, roots, parents, nodes, requested, optimized, isReference, isBranch, keyArg, keyset, isKeyset) {

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

    if (isReference) {
        type = isObject(node) && node.$type || void 0;
        type = type && isBranch && "." || type;
        node = createBranch(roots, parent, node, type, key);
        parents[_cache] = parent;
        nodes[_cache] = node;
        return;
    }

    if (isBranch) {
        type = isObject(node) && node.$type || void 0;
        node = createBranch(roots, parent, node, type, key);
        parents[_cache] = parent;
        nodes[_cache] = node;
        return;
    }

    var selector = roots.errorSelector;
    var comparator = roots.comparator;
    var root = roots[_cache];
    var size = isObject(node) && node.$size || 0;
    var message = roots.value;

    if (message === void 0 && roots.noDataSource) {
        invalidateNode(parent, node, key, roots.lru);
        updateGraph(parent, size, roots.version, roots.lru);
        node = void 0;
    } else {
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
    }
    nodes[_cache] = node;
}

// TODO: CR describe onValueType's job
function onValueType(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var node = nodes[_cache];
    var type = isObject(node) && node.$type || (node = void 0);
    var isMissingPath = setNodeIfMissingPath(roots, node, type, pathset, depth, requested, optimized);

    if (isMissingPath) {
        return;
    }

    var isError = setNodeIfError(roots, node, type, requested);

    if (isError) {
        return;
    }

    if (roots.isDistinct === true) {
        // TODO: CR Explain what's happening here.
        roots.isDistinct = false;
        setSuccessfulPaths(roots, requested, optimized);
        roots.onNext({
            path: arrayClone(requested),
            value: clone(roots, node, type, node && node.value)
        });
    }
}
