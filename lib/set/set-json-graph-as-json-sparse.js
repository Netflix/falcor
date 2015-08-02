module.exports = setJsonGraphAsJsonSparse;

var $ref = require("./../types/ref");
var __version = require("./../internal/version");

var clone = require("./../support/clone-dense-json");
var arrayClone = require("./../support/array-clone");

var options = require("./../support/options");
var walkPathSet = require("./../walk/walk-path-set-soft-link");

var isObject = require("./../support/is-object");

var getValidKey = require("./../support/get-valid-key");
var mergeNode = require("./../support/merge-node");

var setNodeIfMissingPath = require("./../support/treat-node-as-missing-path-set");
var setNodeIfError = require("./../support/treat-node-as-error");
var setSuccessfulPaths = require("./../support/set-successful-paths");

var positions = require("./../support/positions");
var _cache = positions.cache;
var _message = positions.message;
var _json = positions.json;

function setJsonGraphAsJsonSparse(model, envelopes, values, errorSelector, comparator) {

    var modelRoot = model._root;
    var modelCache = modelRoot.cache;
    var initialVersion = modelCache[__version];

    var roots = [];
    roots.offset = model._path.length;
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
    roots[_json] = parents[_json] = nodes[_json] = json.json || (json.json = {});

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
        json.json = roots[_json];
    } else {
        delete json.json;
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
    var parent, messageParent, json, jsonkey;

    if (key == null) {
        key = getValidKey(optimized);
        if (key == null) {
            return;
        }
        jsonkey = getValidKey(requested);
        json = parents[_json];
        parent = parents[_cache];
        messageParent = parents[_message];
    } else {
        jsonkey = key;
        json = nodes[_json];
        parent = nodes[_cache];
        messageParent = nodes[_message];
    }

    var node = parent[key];
    var message = messageParent && messageParent[key];

    nodes[_message] = message;
    nodes[_cache] = node = mergeNode(roots, parent, node, messageParent, message, key, requested);

    if (isReference) {
        parents[_cache] = parent;
        parents[_message] = messageParent;
        return;
    }

    parents[_json] = json;

    if (isBranch) {
        var length = requested.length;
        var offset = roots.offset;
        var type = isObject(node) && node.$type || void 0;

        parents[_cache] = node;
        parents[_message] = message;
        if ((length > offset) && (!type || type === $ref)) {
            nodes[_json] = json[jsonkey] || (json[jsonkey] = {});
        }
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

    var isError = setNodeIfError(roots, node, type, requested);

    if (isError) {
        return;
    }

    if (roots.isDistinct === true) {
        roots.isDistinct = false;
        setSuccessfulPaths(roots, requested, optimized);
        if (keyset == null && !roots.hasValue && getValidKey(optimized) == null) {
            node = clone(roots, node, type, node && node.value);
            json = roots[_json];
            json.$type = node.$type;
            json.value = node.value;
        } else {
            json = parents[_json];
            json[key] = clone(roots, node, type, node && node.value);
        }
        roots.hasValue = true;
    }
}
