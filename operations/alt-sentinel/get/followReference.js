var hardLink = require('./../util/hardlink');
var createHardlink = hardLink.create;
var onValue = require('./onValue');
var isExpired = require('./../util/support').isExpired;

function followReference(model, root, node, referenceContainer, reference, seed, outputFormat) {

    var depth = 0;
    var k, next;

    debugger
    while (true) {
        if (depth === 0 && referenceContainer.__context) {
            depth = reference.length;
            next = referenceContainer.__context;
        } else {
            k = reference[depth++];
            next = node[k];
        }
        
        if (next) {
            var type = next.$type;
            var value = type && next.value || next;

            if (depth < reference.length) {
                if (type) {
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

                if (!referenceContainer.__context) {
                    createHardlink(referenceContainer, next);
                }

                // Restart the reference follower.
                if (type === 'reference') {
                    if (outputFormat === 'JSONG') {
                        onValue(model, next, reference, depth, seed, null, null, reference, null, outputFormat);
                    }

                    depth = 0;
                    reference = value;
                    referenceContainer = next;
                    node = root;
                    continue;
                }

                break;
            }
        } else {
            node = undefined;
        }
        break;
    }

    if (depth < reference.length) {
        debugger
        var ref = [];
        for (var i = 0; i < depth; i++) {
            ref[i] = reference[i];
        }
        reference = ref;
    }

    return [node, reference];
}

module.exports = followReference;