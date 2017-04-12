var EXPIRES_NEVER = require("./../values/expires-never");

// [H] -> Next -> ... -> [T]
// [T] -> Prev -> ... -> [H]
module.exports = function lruPromote(root, object) {
    // Never promote node.$expires === 1.  They cannot expire.
    if (object.$expires === EXPIRES_NEVER) {
        return;
    }

    var head = root.$_head;

    // Nothing is in the cache.
    if (!head) {
        root.$_head = root.$_tail = object;
        return;
    }

    if (head === object) {
        return;
    }

    // The item always exist in the cache since to get anything in the
    // cache it first must go through set.
    var prev = object.$_prev;
    var next = object.$_next;
    if (next) {
        next.$_prev = prev;
    }
    if (prev) {
        prev.$_next = next;
    }
    object.$_prev = undefined;

    // Insert into head position
    root.$_head = object;
    object.$_next = head;
    head.$_prev = object;

    // If the item we promoted was the tail, then set prev to tail.
    if (object === root.$_tail) {
        root.$_tail = prev;
    }
};
