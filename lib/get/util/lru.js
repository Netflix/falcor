var prefix = require("../../types/internal-prefix");
var __head = prefix + "head";
var __tail = prefix + "tail";
var __next = prefix + "next";
var __prev = prefix + "prev";
var __invalidated = prefix + "invalidated";

// [H] -> Next -> ... -> [T]
// [T] -> Prev -> ... -> [H]
function lruPromote(model, object) {
    var root = model._root;
    var head = root[__head];
    if (head === object) {
        return;
    }

    // First insert
    if (!head) {
        root[__head] = object;
        return;
    }

    // The head and the tail need to separate
    if (!root[__tail]) {
        root[__head] = object;
        root[__tail] = head;
        object[__next] = head;
        
        // Now tail
        head[__prev] = object;
        return;
    }

    // Its in the cache.  Splice out.
    var prev = object[__prev];
    var next = object[__next];
    if (next) {
        next[__prev] = prev;
    }
    if (prev) {
        prev[__next] = next;
    }
    object[__prev] = undefined;

    // Insert into head position
    root[__head] = object;
    object[__next] = head;
    head[__prev] = object;
}

function lruSplice(model, object) {
    var root = model._root;

    // Its in the cache.  Splice out.
    var prev = object[__prev];
    var next = object[__next];
    if (next) {
        next[__prev] = prev;
    }
    if (prev) {
        prev[__next] = next;
    }
    object[__prev] = undefined;
    
    if (object === root[__head]) {
        root[__head] = undefined;
    }
    if (object === root[__tail]) {
        root[__tail] = undefined;
    }
    object[__invalidated] = true;
    root.expired.push(object);
}

module.exports = {
    promote: lruPromote,
    splice: lruSplice
};