var __head = require("./../internal/head");
var __tail = require("./../internal/tail");
var __next = require("./../internal/next");
var __prev = require("./../internal/prev");
var EXPIRES_NEVER = require("./../values/expires-never");

// [H] -> Next -> ... -> [T]
// [T] -> Prev -> ... -> [H]
module.exports = function lruPromote(root, object) {
    // Never promote node.$expires === 1.  They cannot expire.
    if (object.$expires === EXPIRES_NEVER) {
        return;
    }

    var head = root.ツhead;

    // Nothing is in the cache.
    if (!head) {
        root.ツhead = root.ツtail = object;
        return;
    }

    if (head === object) {
        return;
    }

    // The item always exist in the cache since to get anything in the
    // cache it first must go through set.
    var prev = object.ツprev;
    var next = object.ツnext;
    if (next) {
        next.ツprev = prev;
    }
    if (prev) {
        prev.ツnext = next;
    }
    object.ツprev = undefined;

    // Insert into head position
    root.ツhead = object;
    object.ツnext = head;
    head.ツprev = object;

    // If the item we promoted was the tail, then set prev to tail.
    if (object === root.ツtail) {
        root.ツtail = prev;
    }
};
