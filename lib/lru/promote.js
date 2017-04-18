var EXPIRES_NEVER = require("./../values/expires-never");

// [H] -> Next -> ... -> [T]
// [T] -> Prev -> ... -> [H]
module.exports = function lruPromote(root, object) {
    // Never promote node.$expires === 1.  They cannot expire.
    if (object.$expires === EXPIRES_NEVER) {
        return;
    }

    // eslint-disable-next-line camelcase
    var head = root.$_head;

    // Nothing is in the cache.
    if (!head) {
        // eslint-disable-next-line camelcase
        root.$_head = root.$_tail = object;
        return;
    }

    if (head === object) {
        return;
    }

    // The item always exist in the cache since to get anything in the
    // cache it first must go through set.
    // eslint-disable-next-line camelcase
    var prev = object.$_prev;
    // eslint-disable-next-line camelcase
    var next = object.$_next;
    if (next) {
        // eslint-disable-next-line camelcase
        next.$_prev = prev;
    }
    if (prev) {
        // eslint-disable-next-line camelcase
        prev.$_next = next;
    }
    // eslint-disable-next-line camelcase
    object.$_prev = undefined;

    // Insert into head position
    // eslint-disable-next-line camelcase
    root.$_head = object;
    // eslint-disable-next-line camelcase
    object.$_next = head;
    // eslint-disable-next-line camelcase
    head.$_prev = object;

    // If the item we promoted was the tail, then set prev to tail.
    // eslint-disable-next-line camelcase
    if (object === root.$_tail) {
        // eslint-disable-next-line camelcase
        root.$_tail = prev;
    }
};
