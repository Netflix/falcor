module.exports = function(root, node) {
    if(node != null && typeof node == "object" && (node.$expires !== 1)) {
        var head = root.__head, tail = root.__tail,
            next = node.__next, prev = node.__prev;
        if (node !== head) {
            (next != null && typeof next === "object") && (next.__prev = prev);
            (prev != null && typeof prev === "object") && (prev.__next = next);
            (next = head) && (head != null && typeof head === "object") && (head.__prev = node);
            (root.__head = root.__next = head = node);
            (head.__next = next);
            (head.__prev = undefined);
        }
        if (tail == null || node === tail) {
            root.__tail = root.__prev = tail = prev || node;
        }
    }
    return node;
};