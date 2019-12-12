var createHardlink = require("../support/createHardlink");
var __prefix = require("./../internal/reservedPrefix");

var $ref = require("./../types/ref");

var getBoundValue = require("./../get/getBoundValue");

var promote = require("./../lru/promote");
var getSize = require("./../support/getSize");
var hasOwn = require("./../support/hasOwn");
var isObject = require("./../support/isObject");
var isExpired = require("./../support/isExpired");
var isFunction = require("./../support/isFunction");
var isPrimitive = require("./../support/isPrimitive");
var expireNode = require("./../support/expireNode");
var incrementVersion = require("./../support/incrementVersion");
var updateNodeAncestors = require("./../support/updateNodeAncestors");
var removeNodeAndDescendants = require("./../support/removeNodeAndDescendants");

/**
 * Sets a list of PathMaps into a JSON Graph.
 * @function
 * @param {Object} model - the Model for which to insert the PathMaps.
 * @param {Array.<PathMapEnvelope>} pathMapEnvelopes - the a list of @PathMapEnvelopes to set.
 */

module.exports = function invalidatePathMaps(model, pathMapEnvelopes) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = incrementVersion();
    var bound = model._path;
    var cache = modelRoot.cache;
    var node = bound.length ? getBoundValue(model, bound).value : cache;
    var parent = node.$_parent || cache;
    var initialVersion = cache.$_version;

    var pathMapIndex = -1;
    var pathMapCount = pathMapEnvelopes.length;

    while (++pathMapIndex < pathMapCount) {

        var pathMapEnvelope = pathMapEnvelopes[pathMapIndex];

        invalidatePathMap(pathMapEnvelope.json, cache, parent, node, version, expired, lru);
    }

    var newVersion = cache.$_version;
    var rootChangeHandler = modelRoot.onChange;

    if (isFunction(rootChangeHandler) && initialVersion !== newVersion) {
        rootChangeHandler();
    }
};

function invalidatePathMap(pathMap, root, parent, node, version, expired, lru) {

    if (isPrimitive(pathMap) || pathMap.$type) {
        return;
    }

    for (var key in pathMap) {
        if (key[0] !== __prefix && hasOwn(pathMap, key)) {
            var child = pathMap[key];
            var branch = isObject(child) && !child.$type;
            var results = invalidateNode(root, parent, node, key, branch, expired, lru);
            var nextNode = results[0];
            var nextParent = results[1];
            if (nextNode) {
                if (branch) {
                    invalidatePathMap(child, root, nextParent, nextNode, version, expired, lru);
                } else if (removeNodeAndDescendants(nextNode, nextParent, key, lru)) {
                    updateNodeAncestors(nextParent, getSize(nextNode), lru, version);
                }
            }
        }
    }
}

function invalidateReference(root, node, expired, lru) {

    if (isExpired(node)) {
        expireNode(node, expired, lru);
        return [undefined, root];
    }

    promote(lru, node);

    var container = node;
    var reference = node.value;
    var parent = root;

    node = node.$_context;

    if (node != null) {
        parent = node.$_parent || root;
    } else {

        var index = 0;
        var count = reference.length - 1;

        parent = node = root;

        do {
            var key = reference[index];
            var branch = index < count;
            var results = invalidateNode(root, parent, node, key, branch, expired, lru);
            node = results[0];
            if (isPrimitive(node)) {
                return results;
            }
            parent = results[1];
        } while (index++ < count);

        if (container.$_context !== node) {
            createHardlink(container, node);
        }
    }

    return [node, parent];
}

function invalidateNode(root, parent, node, key, branch, expired, lru) {

    var type = node.$type;

    while (type === $ref) {
        var results = invalidateReference(root, node, expired, lru);

        node = results[0];

        if (isPrimitive(node)) {
            return results;
        }

        parent = results[1];
        type = node && node.$type;
    }

    if (type !== void 0) {
        return [node, parent];
    }

    if (key == null) {
        if (branch) {
            throw new Error("`null` is not allowed in branch key positions.");
        } else if (node) {
            key = node.$_key;
        }
    } else {
        parent = node;
        node = parent[key];
    }

    return [node, parent];
}
