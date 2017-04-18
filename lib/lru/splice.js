module.exports = function lruSplice(root, object) {

    // Its in the cache.  Splice out.
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
    object.$_prev = object.$_next = undefined;

    // eslint-disable-next-line camelcase
    if (object === root.$_head) {
        // eslint-disable-next-line camelcase
        root.$_head = next;
    }
    // eslint-disable-next-line camelcase
    if (object === root.$_tail) {
        // eslint-disable-next-line camelcase
        root.$_tail = prev;
    }
};
