var createHardlink = require("./../support/createHardlink");
var $ref = require("./../types/ref");

var getBoundValue = require("./../get/getBoundValue");

var isExpired = require("./../support/isExpired");
var isFunction = require("./../support/isFunction");
var isPrimitive = require("./../support/isPrimitive");
var expireNode = require("./../support/expireNode");
var iterateKeySet = require("falcor-path-utils").iterateKeySet;
var incrementVersion = require("./../support/incrementVersion");
var mergeValueOrInsertBranch = require("./../support/mergeValueOrInsertBranch");
var NullInPathError = require("./../errors/NullInPathError");

/**
 * Sets a list of {@link PathValue}s into a {@link JSONGraph}.
 * @function
 * @param {Object} model - the Model for which to insert the {@link PathValue}s.
 * @param {Array.<PathValue>} pathValues - the list of {@link PathValue}s to set.
 * @return {Array.<Array.<Path>>} - an Array of Arrays where each inner Array is a list of requested and optimized paths (respectively) for the successfully set values.
 */

module.exports = function setPathValues(model, pathValues, x, errorSelector, comparator) {

    var modelRoot = model._root;
    var lru = modelRoot;
    var expired = modelRoot.expired;
    var version = incrementVersion();
    var bound = model._path;
    var cache = modelRoot.cache;
    var node = bound.length ? getBoundValue(model, bound).value : cache;
    var parent = node.$_parent || cache;
    var initialVersion = cache.$_version;

    var requestedPath = [];
    var requestedPaths = [];
    var optimizedPaths = [];
    var optimizedIndex = bound.length;
    var pathValueIndex = -1;
    var pathValueCount = pathValues.length;

    while (++pathValueIndex < pathValueCount) {

        var pathValue = pathValues[pathValueIndex];
        var path = pathValue.path;
        var value = pathValue.value;
        var optimizedPath = bound.slice(0);
        optimizedPath.index = optimizedIndex;

        setPathSet(
            value, path, 0, cache, parent, node,
            requestedPaths, optimizedPaths, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector
        );
    }

    var newVersion = cache.$_version;
    var rootChangeHandler = modelRoot.onChange;

    if (isFunction(rootChangeHandler) && initialVersion !== newVersion) {
        rootChangeHandler();
    }

    return [requestedPaths, optimizedPaths];
};

/* eslint-disable no-constant-condition */
function setPathSet(
    value, path, depth, root, parent, node,
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
            root, parent, node, key, value,
            branch, false, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector, replacedPaths
        );
        requestedPath[depth] = key;
        requestedPath.index = depth;
        optimizedPath[optimizedPath.index++] = key;
        var nextNode = results[0];
        var nextParent = results[1];
        if (nextNode) {
            if (branch) {
                setPathSet(
                    value, path, depth + 1,
                    root, nextParent, nextNode,
                    requestedPaths, optimizedPaths, requestedPath, optimizedPath,
                    version, expired, lru, comparator, errorSelector
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
    value, root, node, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, replacedPaths) {

    var reference = node.value;
    optimizedPath.splice(0, optimizedPath.length);
    optimizedPath.push.apply(optimizedPath, reference);

    if (isExpired(node)) {
        optimizedPath.index = reference.length;
        expireNode(node, expired, lru);
        return [undefined, root];
    }

    var container = node;
    var parent = root;

    node = node.$_context;

    if (node != null) {
        parent = node.$_parent || root;
        optimizedPath.index = reference.length;
    } else {

        var index = 0;
        var count = reference.length - 1;

        parent = node = root;

        do {
            var key = reference[index];
            var branch = index < count;
            optimizedPath.index = index;

            var results = setNode(
                root, parent, node, key, value,
                branch, true, requestedPath, optimizedPath,
                version, expired, lru, comparator, errorSelector, replacedPaths
            );
            node = results[0];
            if (isPrimitive(node)) {
                optimizedPath.index = index;
                return results;
            }
            parent = results[1];
        } while (index++ < count);

        optimizedPath.index = index;

        if (container.$_context !== node) {
            createHardlink(container, node);
        }
    }

    return [node, parent];
}

function setNode(
    root, parent, node, key, value,
    branch, reference, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector, replacedPaths) {

    var type = node.$type;

    while (type === $ref) {

        var results = setReference(
            value, root, node, requestedPath, optimizedPath,
            version, expired, lru, comparator, errorSelector, replacedPaths
        );

        node = results[0];

        if (isPrimitive(node)) {
            return results;
        }

        parent = results[1];
        type = node.$type;
    }

    if (branch && type !== void 0) {
        return [node, parent];
    }

    if (key == null) {
        if (branch) {
            throw new NullInPathError();
        } else if (node) {
            key = node.$_key;
        }
    } else {
        parent = node;
        node = parent[key];
    }

    node = mergeValueOrInsertBranch(
        parent, node, key, value,
        branch, reference, requestedPath, optimizedPath,
        version, expired, lru, comparator, errorSelector, replacedPaths
    );

    return [node, parent];
}
