module.exports = function lruSplice(root, object) {

    // Its in the cache.  Splice out.
    var prev = object.__prev;
    var next = object.__next;
    if (next) {
        next.__prev = prev;
    }
    if (prev) {
        prev.__next = next;
    }
    object.__prev = object.__next = undefined;

    if (object === root.__head) {
        root.__head = next;
    }
    if (object === root.__tail) {
        root.__tail = prev;
    }
};
