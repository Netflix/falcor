module.exports = function lruSplice(root, object) {

    // Its in the cache.  Splice out.
    var prev = object.$_prev;
    var next = object.$_next;
    if (next) {
        next.$_prev = prev;
    }
    if (prev) {
        prev.$_next = next;
    }
    object.$_prev = object.$_next = undefined;

    if (object === root.$_head) {
        root.$_head = next;
    }
    if (object === root.$_tail) {
        root.$_tail = prev;
    }
};
