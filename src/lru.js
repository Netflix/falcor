function lruPromote(model, object) {
    var root = model._root;
    var head = root.head;
    if (head === object) {
        return;
    }

    // First insert
    if (!head) {
        root.head = object;
        return;
    }

    // The head and the tail need to separate
    if (!root.tail) {
        root.head = object;
        root.tail = head;
        object.__prev = head;
        head.__next = object;
        return;
    }

    // Its in the cache.
    var prev = object.__prev;
    var next = object.__next;
    if (prev || next) {
        if (next && prev) {
            prev.__next = next;
            next.__prev = prev;
        } else if (next) {
            next.__prev = undefined;
        } else if (prev) {
            prev.__next = undefined;
        }
        object.__next = undefined;
    } else {
        root.size++;
    }

    // Insert into head position
    root.head = object;
    object.__prev = head;
    head.__next = object;
}

function lruRemove(model, parent, key) {
//    var sentinel = parent.$type === 'sentinel';
//    var object;
//
//    if (sentinel) {
//        object = parent.value[key];
//        parent.value[key] = undefined;
//    } else {
//        object = parent[key];
//        parent[key] = undefined;
//    }
//
//    var root = model._root;
//    var size = --root.size;
//
//    // last remove
//    if (size === 0) {
//        root.head = root.tail = false;
//    }
//
//    else if (root.size === 1) {
//        root.head = root.tail = false;
//        return;
//    }
//
//    else if (root.size === 2) {
//        root.tail = root.head;
//        root.head.__prev = undefined;
//        return;
//    }
//
//    var prev = object.__prev;
//    var next = object.__next;
//    if (next && prev) {
//        prev.__next = next;
//        next.__prev = prev;
//    } else if (next) {
//        next.__prev = undefined;
//    }

    // removes all references to the object.
//    Object.
//        keys(object).
//        forEach(function(k) {
//            object[k] = null;
//        });
}

