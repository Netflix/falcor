var __parent = require("./../internal/parent");
var $ref = require("./../types/ref");

var isObject = require("./../support/is-object");
var isExpired = require("./../support/is-expired");
var promote = require("./../lru/promote");
var wrapNode = require("./../support/wrap-node");
var graphNode = require("./../support/graph-node");
var replaceNode = require("./../support/replace-node");
var updateGraph = require("./../support/update-graph");
var invalidateNode = require("./../support/invalidate-node");

/* eslint-disable eqeqeq */
module.exports = function mergeNode(roots, parent, nodeArg, messageParent, messageArg, key, requested) {

    var node = nodeArg;
    var message = messageArg;
    var type, messageType, nodeIsObject, messageIsObject;

    // If the cache and message are the same, we can probably return early:
    // - If they're both null, return null.
    // - If they're both branches, return the branch.
    // - If they're both edges, continue below.
    if (node == message) {
        if (node == null) {
            return null;
        } else if ((nodeIsObject = isObject(node))) {
            type = node.$type;
            if (type == null) {
                if (node[__parent] == null) {
                    return graphNode(roots[0], parent, node, key, void 0);
                }
                return node;
            }
        }
    } else if ((nodeIsObject = isObject(node))) {
        type = node.$type;
    }

    var value, messageValue;

    if (type == $ref) {
        if (message == null) {
            // If the cache is an expired reference, but the message
            // is empty, remove the cache value and return undefined
            // so we build a missing path.
            if (isExpired(roots, node)) {
                invalidateNode(parent, node, key, roots.lru);
                return void 0;
            }
            // If the cache has a reference and the message is empty,
            // leave the cache alone and follow the reference.
            return node;
        } else if ((messageIsObject = isObject(message))) {
            messageType = message.$type;
            // If the cache and the message are both references,
            // check if we need to replace the cache reference.
            if (messageType == $ref) {
                if (node === message) {
                    // If the cache and message are the same reference,
                    // we performed a whole-branch merge of one of the
                    // grandparents. If we've previously graphed this
                    // reference, break early.
                    if (node[__parent] != null) {
                        return node;
                    }
                }
                // If the message doesn't expire immediately and is newer than the
                // cache (or either cache or message don't have timestamps), attempt
                // to use the message value.
                // Note: Number and `undefined` compared LT/GT to `undefined` is `false`.
                else if ((
                    isExpired(roots, message) === false) && ((
                    message.$timestamp < node.$timestamp) === false)) {

                    // Compare the cache and message references.
                    // - If they're the same, break early so we don't insert.
                    // - If they're different, replace the cache reference.

                    value = node.value;
                    messageValue = message.value;

                    var count = value.length;

                    // If the reference lengths are equal, check their keys for equality.
                    if (count === messageValue.length) {
                        while (--count > -1) {
                            // If any of their keys are different, replace the reference
                            // in the cache with the reference in the message.
                            if (value[count] !== messageValue[count]) {
                                break;
                            }
                        }
                        // If all their keys are equal, leave the cache value alone.
                        if (count === -1) {
                            return node;
                        }
                    }
                }
            }
        }
    } else {
        if ((messageIsObject = isObject(message))) {
            messageType = message.$type;
        }
        if (nodeIsObject && !type) {
            // Otherwise if the cache is a branch and the message is either
            // null or also a branch, continue with the cache branch.
            if (message == null || (messageIsObject && !messageType)) {
                return node;
            }
        }
    }

    // If the message is an expired edge, report it back out so we don't build a missing path, but
    // don't insert it into the cache. If a value exists in the cache that didn't come from a
    // whole-branch grandparent merge, remove the cache value.
    if (Boolean(messageType) && Boolean(message[__parent]) && isExpired(roots, message)) {
        if (nodeIsObject && node != message) {
            invalidateNode(parent, node, key, roots.lru);
        }
        return message;
    }
    // If the cache is a value, but the message is a branch, merge the branch over the value.
    else if (Boolean(type) && messageIsObject && !messageType) {
        node = replaceNode(parent, node, message, key, roots.lru);
        return graphNode(roots[0], parent, node, key, void 0);
    }
    // If the message is a value, insert it into the cache.
    else if (!messageIsObject || Boolean(messageType)) {
        var offset = 0;
        // If we've arrived at this message value, but didn't perform a whole-branch merge
        // on one of its ancestors, replace the cache node with the message value.
        if (node != message) {
            messageValue = messageValue || (Boolean(messageType) ? message.value : message);
            message = wrapNode(message, messageType, messageValue);
            var comparator = roots.comparator;
            var isDistinct = roots.isDistinct = true;
            if (Boolean(comparator)) {
                isDistinct = roots.isDistinct = !comparator(requested, node, message);
            }
            if (isDistinct) {
                var size = nodeIsObject && node.$size || 0;
                var messageSize = message.$size;
                offset = size - messageSize;

                node = replaceNode(parent, node, message, key, roots.lru);
                updateGraph(parent, offset, roots.version, roots.lru);
                node = graphNode(roots[0], parent, node, key, roots.version);
            }
        }
        // If the cache and the message are the same value, we branch-merged one of its
        // ancestors. Give the message a $size and $type, attach its graph pointers, and
        // update the cache sizes and versions.
        else if (nodeIsObject && node[__parent] == null) {
            roots.isDistinct = true;
            node = parent[key] = wrapNode(node, type, node.value);
            offset = -node.$size;
            updateGraph(parent, offset, roots.version, roots.lru);
            node = graphNode(roots[0], parent, node, key, roots.version);
        }
        // Otherwise, cache and message are the same primitive value. Wrap in a atom and insert.
        else {
            roots.isDistinct = true;
            node = parent[key] = wrapNode(node, type, node);
            offset = -node.$size;
            updateGraph(parent, offset, roots.version, roots.lru);
            node = graphNode(roots[0], parent, node, key, roots.version);
        }
        // If the node is already expired, return undefined to build a missing path.
        // if(isExpired(roots, node)) {
        //     return undefined;
        // }

        // Promote the message edge in the LRU.
        promote(roots.lru, node);
    }
    // If we get here, the cache is empty and the message is a branch.
    // Merge the whole branch over.
    else if (node == null) {
        node = parent[key] = graphNode(roots[0], parent, message, key, void 0);
    }

    return node;
};
/* eslint-enable */
