var EXPIRES_NEVER = require("./../values/expires-never");

// [H] -> Next -> ... -> [T]
// [T] -> Prev -> ... -> [H]
module.exports = function lruPromote(root, object) {
    // Never promote node.$expires === 1.  They cannot expire.
    if (object.$expires === EXPIRES_NEVER) {
        return;
    }

    var head = root.$head;

    // Nothing is in the cache.
    if (!head) {
        root.$head = root.$tail = object;
        return;
    }

    if (head === object) {
        return;
    }

    // The item always exist in the cache since to get anything in the
    // cache it first must go through set.
    var prev = object.$prev;
    var next = object.$next;
    if (next) {
        next.$prev = prev;
    }
    if (prev) {
        prev.$next = next;
    }
    object.$prev = undefined;

    // Insert into head position
    root.$head = object;
    object.$next = head;
    head.$prev = object;

    // If the item we promoted was the tail, then set prev to tail.
    if (object === root.$tail) {
        root.$tail = prev;
    }
};
