var $ref = require("./../types/ref");
var $error = require("./../types/error");
var getType = require("./../support/getType");
var getSize = require("./../support/getSize");
var getTimestamp = require("./../support/getTimestamp");

var isExpired = require("./../support/isExpired");
var isPrimitive = require("./../support/isPrimitive");
var isFunction = require("./../support/isFunction");

var wrapNode = require("./../support/wrapNode");
var expireNode = require("./../support/expireNode");
var insertNode = require("./../support/insertNode");
var replaceNode = require("./../support/replaceNode");
var updateNodeAncestors = require("./../support/updateNodeAncestors");
var updateBackReferenceVersions = require("./../support/updateBackReferenceVersions");
var reconstructPath = require("./../support/reconstructPath");

module.exports = function mergeValueOrInsertBranch(
    parent, node, key, value,
    branch, reference, requestedPath, optimizedPath,
    version, expired, lru, comparator, errorSelector) {

    var type = getType(node, reference);

    if (branch || reference) {
        if (type && isExpired(node)) {
            type = "expired";
            expireNode(node, expired, lru);
        }
        if ((type && type !== $ref) || isPrimitive(node)) {
            node = replaceNode(node, {}, parent, key, lru);
            node = insertNode(node, parent, key, version);
            node = updateBackReferenceVersions(node, version);
        }
    } else {
        var message = value;
        var mType = getType(message);
        // Compare the current cache value with the new value. If either of
        // them don't have a timestamp, or the message's timestamp is newer,
        // replace the cache value with the message value. If a comparator
        // is specified, the comparator takes precedence over timestamps.
        //
        // Comparing either Number or undefined to undefined always results in false.
        var isDistinct = (getTimestamp(message) < getTimestamp(node)) === false;
        // If at least one of the cache/message are sentinels, compare them.
        if ((type || mType) && isFunction(comparator)) {
            isDistinct = !comparator(node, message, optimizedPath.slice(0, optimizedPath.index));
        }
        if (isDistinct) {

            if (mType === $error && isFunction(errorSelector)) {
                message = errorSelector(reconstructPath(requestedPath, key), message);
            }

            message = wrapNode(message, mType, mType ? message.value : message);

            var sizeOffset = getSize(node) - getSize(message);

            node = replaceNode(node, message, parent, key, lru);
            parent = updateNodeAncestors(parent, sizeOffset, lru, version);
            node = insertNode(node, parent, key, version);
        }
    }

    return node;
};
