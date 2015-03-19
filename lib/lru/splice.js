module.exports = function(root, node) {
    var head = root.__head, tail = root.__tail,
        next = node.__next, prev = node.__prev;
    (next != null && typeof next === "object") && (next.__prev = prev);
    (prev != null && typeof prev === "object") && (prev.__next = next);
    (node === head) && (root.__head = root.__next = next);
    (node === tail) && (root.__tail = root.__prev = prev);
    node.__next = node.__prev = undefined;
    head = tail = next = prev = undefined;
};