function followReference(model, root, node, referenceContainer, reference) {

    var depth = 0;
    var k, next;

    while (true) {
        if (depth === 0 && referenceContainer[__CONTEXT]) {
            depth = reference.length;
            next = referenceContainer[__CONTEXT];
        } else {
            k = reference[depth++];
            next = node[k];
        }
        
        if (next) {
            var type = next.$type;
            var value = type === 'sentinel' ? next.value : next;

            if (depth < reference.length) {
                if (type || Array.isArray(value)) {
                    node = next;
                    break;
                }

                node = next;
                continue;
            }

            else if (depth === reference.length) {

                node = next;

                if (type && isExpired(next)) {
                    break;
                }

                if (!referenceContainer[__CONTEXT]) {
                    createHardlink(referenceContainer, next);
                }

                // Restart the reference follower.
                if (Array.isArray(value)) {
                    depth = 0;
                    reference = value;
                    referenceContainer = next;
                    node = root;
                    continue;
                }

                break;
            }
        }
        break;
    }

    if (depth < reference.length) {
        var ref = [];
        for (var i = 0; i < depth; i++) {
            ref[i] = reference[i];
        }
        reference = ref;
    }

    return [node, reference];
}

