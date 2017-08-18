var createHardlink = require("./../support/createHardlink");
var $ref = require("./../types/ref");

var isExpired = require("./../support/isAlreadyExpired");
var isFunction = require("./../support/isFunction");
var isPrimitive = require("./../support/isPrimitive");
var expireNode = require("./../support/expireNode");
var iterateKeySet = require("falcor-path-utils").iterateKeySet;
var incrementVersion = require("./../support/incrementVersion");
var mergeJSONGraphNode = require("./../support/mergeJSONGraphNode");
var NullInPathError = require("./../errors/NullInPathError");

/**
 * Merges a list of {@link JSONGraphEnvelope}s into a {@link JSONGraph}.
 * @function
 * @param {Object} model - the Model for which to merge the {@link JSONGraphEnvelope}s.
 * @param {Array.<PathValue>} jsonGraphEnvelopes - the {@link JSONGraphEnvelope}s to merge.
 * @return {Array.<Array.<Path>>} - an Array of Arrays where each inner Array is a list of requested and optimized paths (respectively) for the successfully set values.
 */

module.exports = function setJSONGraphs(model, jsonGraphEnvelopes, x, errorSelector, comparator, replacedPaths) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = incrementVersion();
    var cache = modelRoot.cache;
    var initialVersion = cache.$_version;

    var requestedPath = [];
    var optimizedPath = [];
    var requestedPaths = [];
    var optimizedPaths = [];
    var jsonGraphEnvelopeIndex = -1;
    var jsonGraphEnvelopeCount = jsonGraphEnvelopes.length;

    while (++jsonGraphEnvelopeIndex < jsonGraphEnvelopeCount) {

        var jsonGraphEnvelope = jsonGraphEnvelopes[jsonGraphEnvelopeIndex];
        var paths = jsonGraphEnvelope.paths;
        var jsonGraph = jsonGraphEnvelope.jsonGraph;

        var pathIndex = -1;
        var pathCount = paths.length;

        while (++pathIndex < pathCount) {

            var path = paths[pathIndex];
            optimizedPath.index = 0;

            setJSONGraphPathSet(
                path, 0,
                cache, cache, cache,
                jsonGraph, jsonGraph, jsonGraph,
                requestedPaths, optimizedPaths, requestedPath, optimizedPath,
                version, expired, lru, comparator, errorSelector, replacedPaths
            );
        }
    }

    var newVersion = cache.$_version;
    var rootChangeHandler = modelRoot.onChange;

    if (isFunction(rootChangeHandler) && initialVersion !== newVersion) {
        rootChangeHandler();
    }

    return [requestedPaths, optimizedPaths];
};

/* eslint-disable no-constant-condition */
function setJSONGraphPathSet(
    path, depth, root, parent, node,
    messageRoot, messageParent, message,
    requestedPaths, optimizedPaths, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, replacedPaths) {

    var note = {};
    var branch = depth < path.length - 1;
    var keySet = path[depth];
    var key = iterateKeySet(keySet, note);
    var optimizedIndex = optimizedPath.index;

    do {

        requestedPath.depth = depth;

        var results = setNode(
            root, parent, node, messageRoot, messageParent, message,
            key, branch, false, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector, replacedPaths
        );

        requestedPath[depth] = key;
        requestedPath.index = depth;
        optimizedPath[optimizedPath.index++] = key;
        var nextNode = results[0];
        var nextParent = results[1];
        if (nextNode) {
            if (branch) {
                setJSONGraphPathSet(
                    path, depth + 1, root, nextParent, nextNode,
                    messageRoot, results[3], results[2],
                    requestedPaths, optimizedPaths, requestedPath, optimizedPath,
                    version, expired, lru, comparator, errorSelector, replacedPaths
                );
            } else {
                requestedPaths.push(requestedPath.slice(0, requestedPath.index + 1));
                optimizedPaths.push(optimizedPath.slice(0, optimizedPath.index));
            }
        }
        key = iterateKeySet(keySet, note);
        if (note.done) {
            break;
        }
        optimizedPath.index = optimizedIndex;
    } while (true);
}
/* eslint-enable */

function setReference(
    root, node, messageRoot, message, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, replacedPaths) {

    var reference = node.value;
    optimizedPath.splice(0, optimizedPath.length);
    optimizedPath.push.apply(optimizedPath, reference);

    if (isExpired(node)) {
        optimizedPath.index = reference.length;
        expireNode(node, expired, lru);
        return [undefined, root, message, messageRoot];
    }

    var index = 0;
    var container = node;
    var count = reference.length - 1;
    var parent = node = root;
    var messageParent = message = messageRoot;

    do {
        var key = reference[index];
        var branch = index < count;
        optimizedPath.index = index;

        var results = setNode(
            root, parent, node, messageRoot, messageParent, message,
            key, branch, true, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector, replacedPaths
        );
        node = results[0];
        if (isPrimitive(node)) {
            optimizedPath.index = index;
            return results;
        }
        parent = results[1];
        message = results[2];
        messageParent = results[3];
    } while (index++ < count);

    optimizedPath.index = index;

    if (container.$_context !== node) {
        createHardlink(container, node);
    }

    return [node, parent, message, messageParent];
}

function setNode(
    root, parent, node, messageRoot, messageParent, message,
    key, branch, reference, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, replacedPaths) {

    var type = node.$type;

    while (type === $ref) {

        var results = setReference(
            root, node, messageRoot, message, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector, replacedPaths
        );

        node = results[0];

        if (isPrimitive(node)) {
            return results;
        }

        parent = results[1];
        message = results[2];
        messageParent = results[3];
        type = node.$type;
    }

    if (type !== void 0) {
        return [node, parent, message, messageParent];
    }

    if (key == null) {
        if (branch) {
            throw new NullInPathError();
        } else if (node) {
            key = node.$_key;
        }
    } else {
        parent = node;
        messageParent = message;
        node = parent[key];
        message = messageParent && messageParent[key];
    }

    node = mergeJSONGraphNode(
        parent, node, message, key, requestedPath, optimizedPath,
        version, expired, lru, comparator, errorSelector, replacedPaths
    );

    return [node, parent, message, messageParent];
}
