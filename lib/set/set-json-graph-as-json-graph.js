module.exports = setJsonGraphAsJsonGraph;

var $ref = require("./../types/ref");
var __version = require("./../internal/version");

var clone = require("./../support/clone-graph-json");
var arrayClone = require("./../support/array-clone");

var options = require("./../support/options");
var walkPathSet = require("./../walk/walk-path-set-soft-link");

var isObject = require("./../support/is-object");

var getValidKey = require("./../support/get-valid-key");
var mergeNode = require("./../support/merge-node");

var setNodeIfMissingPath = require("./../support/treat-node-as-missing-path-set");
var setSuccessfulPaths = require("./../support/set-successful-paths");

var promote = require("./../lru/promote");

var positions = require("./../support/positions");
var _cache = positions.cache;
var _message = positions.message;
var _jsong = positions.jsong;

function setJsonGraphAsJsonGraph(model, envelopes, values, errorSelector, comparator) {

    var modelRoot = model._root;
    var modelCache = modelRoot.cache;
    var initialVersion = modelCache[__version];

    var roots = [];
    roots.offset = 0;
    roots.bound = [];
    roots = options(roots, model, errorSelector, comparator);

    var index = -1;
    var count = envelopes.length;
    var nodes = roots.nodes;
    var parents = arrayClone(nodes);
    var requested = [];
    var optimized = [];
    var json = values[0];
    var hasValue;

    roots[_cache] = roots.root;
    roots[_jsong] = parents[_jsong] = nodes[_jsong] = json.jsonGraph || (json.jsonGraph = {});
    roots.requestedPaths = json.paths || (json.paths = roots.requestedPaths);

    while (++index < count) {
        var envelope = envelopes[index];
        var pathsets = envelope.paths;
        var jsong = envelope.jsonGraph || envelope.jsong || envelope.values || envelope.value;
        var index2 = -1;
        var count2 = pathsets.length;
        roots[_message] = jsong;
        nodes[_message] = jsong;
        while (++index2 < count2) {
            var pathset = pathsets[index2];
            walkPathSet(onNode, onEdge, pathset, 0, roots, parents, nodes, requested, optimized);
        }
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

function onNode(pathset, roots, parents, nodes, requested, optimized, isReference, isBranch, keyArg, keyset, isKeyset) {

    var key = keyArg;
    var parent, messageParent, json;

    if (key == null) {
        key = getValidKey(optimized);
        if (key == null) {
            return;
        }
        json = parents[_jsong];
        parent = parents[_cache];
        messageParent = parents[_message];
    } else {
        json = nodes[_jsong];
        parent = nodes[_cache];
        messageParent = nodes[_message];
    }

    var jsonkey = key;
    var node = parent[key];
    var message = messageParent && messageParent[key];

    nodes[_message] = message;
    nodes[_cache] = node = mergeNode(roots, parent, node, messageParent, message, key, requested);

    var type = isObject(node) && node.$type || void 0;

    if (isReference) {
        parents[_cache] = parent;
        parents[_message] = messageParent;
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
        parents[_cache] = node;
        parents[_message] = message;
        parents[_jsong] = json;
        if (type === $ref) {
            json[jsonkey] = clone(roots, node, type, node.value);
            roots.hasValue = true;
        } else {
            nodes[_jsong] = json[jsonkey] || (json[jsonkey] = {});
        }
        return;
    }

    if (roots.isDistinct === true) {
        roots.isDistinct = false;
        json[jsonkey] = clone(roots, node, type, node && node.value);
        roots.hasValue = true;
    }
}

function onEdge(pathset, depth, roots, parents, nodes, requested, optimized, key, keyset) {

    var json;
    var node = nodes[_cache];
    var type = isObject(node) && node.$type || (node = void 0);

    var isMissingPath = setNodeIfMissingPath(roots, node, type, pathset, depth, requested, optimized);

    if (isMissingPath) {
        return;
    }

    promote(roots.lru, node);

    setSuccessfulPaths(roots, requested, optimized);

    if (keyset == null && !roots.hasValue && getValidKey(optimized) == null) {
        node = clone(roots, node, type, node && node.value);
        json = roots[_jsong];
        json.$type = node.$type;
        json.value = node.value;
    }
    roots.hasValue = true;
}
