var __head = require("./../../internal/head");
var __tail = require("./../../internal/tail");
var __next = require("./../../internal/next");
var __prev = require("./../../internal/prev");
var __invalidated = require("./../../internal/invalidated");

// [H] -> Next -> ... -> [T]
// [T] -> Prev -> ... -> [H]
function lruPromote(root, object) {
    // Never promote node.$expires === 1.  They cannot expire.
    if (object.$expires === 1) {
        return;
    }

    var head = root[__head];

    // Nothing is in the cache.
    if (!head) {
        root[__head] = root[__tail] = object;
        return;
    }

    if (head === object) {
        return;
    }

    // The item always exist in the cache since to get anything in the
    // cache it first must go through set.
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

    // If the item we promoted was the tail, then set prev to tail.
    if (object === root[__tail]) {
        root[__tail] = prev;
    }
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
    object[__prev] = void 0;

    if (object === root[__head]) {
        root[__head] = void 0;
    }
    if (object === root[__tail]) {
        root[__tail] = void 0;
    }
    object[__invalidated] = true;
    root.expired.push(object);
}

module.exports = {
    promote: lruPromote,
    splice: lruSplice
};
