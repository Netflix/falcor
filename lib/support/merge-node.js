
var $self = "./";
var $path = require("../types/$path");
var $sentinel = require("../types/$sentinel");
var $expires_now = 0;

var is_object = require("./is-object");
var is_primitive = require("./is-primitive");
var promote = require("../lru/promote");
var wrap_node = require("./wrap-node");
var graph_node = require("./graph-node");
var replace_node = require("../support/replace-node");
var update_graph  = require("../support/update-graph");
var inc_generation = require("./inc-generation");
var invalidate_node = require("./invalidate-node");

module.exports = function(roots, parent, node, messageParent, message, key) {
    
    var type, messageType, node_is_object, message_is_object;
    
    // If the cache and message are the same, we can probably return early:
    // - If they're both null, return null.
    // - If they're both branches, return the branch.
    // - If they're both edges, continue below.
    if(node == message) {
        if(node == null) {
            return null;
        } else if(node_is_object = is_object(node)) {
            type = node.$type;
            if(type == null) {
                if(node[$self] == null) {
                    return graph_node(roots[0], parent, node, key, 0);
                }
                return node;
            }
        }
    } else if(node_is_object = is_object(node)) {
        type = node.$type;
    }
    
    var value, messageValue;
    
    if(type == $path) {
        if(message == null) {
            // If the cache has a reference and the message is empty,
            // leave the cache alone and follow the reference.
            return node;
        } else if(message_is_object = is_object(message)) {
            messageType = message.$type;
            // If the cache and the message are both references,
            // check if we need to replace the cache reference.
            if(messageType == $path) {
                if(node === message) {
                    // If the cache and message are the same reference,
                    // we performed a whole-branch merge of one of the
                    // grandparents. If we've previously graphed this
                    // reference, break early.
                    if(node[$self] != null) {
                        return node;
                    }
                } else if((
                    // If the message doesn't expire immediately and is newer
                    // than the cache (or either cache or message don't have timestamps),
                    // attempt to use the message value.
                    // Compare timestamp LT to false, since (Number < undefined) === false
                    message.$expires !== $expires_now) && ((
                    message.$timestamp < node.$timestamp) === false)) {
                    
                    // Compare the cache and message references.
                    // - If they're the same, break early so we don't insert.
                    // - If they're different, replace the cache reference.
                    
                    value = node.value;
                    messageValue = message.value;
                    
                    var count = value.length;
                    
                    // If the reference lengths are equal, check their keys for equality.
                    if(count === messageValue.length) {
                        while(--count > -1) {
                            // If any of their keys are different, replace the reference
                            // in the cache with the reference in the message.
                            if(value[count] !== messageValue[count]) {
                                break;
                            }
                        }
                        // If all their keys are equal, leave the cache value alone.
                        if(count === -1) {
                            return node;
                        }
                    }
                }
            }
        }
    } else {
        if(message_is_object = is_object(message)) {
            messageType = message.$type;
        }
        if(node_is_object && !type) {
            // Otherwise if the cache is a branch and the message is either
            // null or also a branch, continue with the cache branch.
            if(message == null || !messageType) {
                return node;
            }
        }
    }
    
    // If the message is an edge, but it expires immediately, remove the
    // cache value, and report the message value without inserting it.
    if(!!messageType && message.$expires === $expires_now) {
        if(node_is_object) {
            invalidate_node(parent, node, key, roots.lru);
        }
        return message;
    }
    
    // If the cache is a value, but the message is a branch, merge the branch over the value.
    if(!!type && message_is_object && !messageType) {
        // message.$size = node.$size || 0;
        node = replace_node(parent, node, message, key, roots.lru);
        return graph_node(roots[0], parent, node, key, 0);
    } else if(!message_is_object || !!messageType) {
        // If the message is a value, insert it into the cache.
        var offset = 0;
        // If we've arrived at this message value, but didn't perform a whole-branch merge
        // on one of its ancestors, replace the cache node with the message value.
        if(node != message) {
            messageValue || (messageValue = !!messageType ? message.value : message);
            message = wrap_node(message, messageType, messageValue);
            
            var size = node_is_object && node.$size || 0;
            var messageSize = message.$size;
            offset = size - messageSize;
            
            node = replace_node(parent, node, message, key, roots.lru);
            update_graph(parent, offset, roots.version, roots.lru);
            return graph_node(roots[0], parent, node, key, inc_generation());
        } else if(node_is_object && node[$self] == null) {
            // If the cache and the message are the same value, we branch-merged one of its
            // ancestors, so give the message a $size and $type, attach its graph pointers,
            // and update the cache sizes and generations.
            node = wrap_node(node, type, node.value);
            offset = -node.$size;
            update_graph(parent, offset, roots.version, roots.lru);
            return graph_node(roots[0], parent, node, key, inc_generation());
        } else {
            node = wrap_node(node, type, node);
            parent[key] = node;
            offset = -node.$size;
            update_graph(parent, offset, roots.version, roots.lru);
            return graph_node(roots[0], parent, node, key, inc_generation());
        }
        // Otherwise, the message is already in the cache, so promote it in the LRU.
        promote(roots.lru, node);
    } else if(node == null) {
        parent[key] = node = message;
        return graph_node(roots[0], parent, node, key, 0);
    }
    
    return node;
}
