module.exports = function lruSplice(root, object) {

    // Its in the cache.  Splice out.
    var prev = object.$prev;
    var next = object.$next;
    if (next) {
        next.$prev = prev;
    }
    if (prev) {
        prev.$next = next;
    }
    object.$prev = object.$next = undefined;

    if (object === root.$head) {
        root.$head = next;
    }
    if (object === root.$tail) {
        root.$tail = prev;
    }
};
