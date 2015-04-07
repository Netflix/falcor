var hardLink = require('./util/hardlink');
var createHardlink = hardLink.create;
var onValue = require('./onValue');
var isExpired = require('./util/isExpired');
var $path = require('./../types/$path.js');

function followReference(model, root, node, referenceContainer, reference, seed, outputFormat) {

    var depth = 0;
    var k, next;

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

            // We need to report a value or follow another reference.
            else {

                node = next;

                if (type && isExpired(next)) {
                    break;
                }

                if (!referenceContainer.__context) {
                    createHardlink(referenceContainer, next);
                }

                // Restart the reference follower.
                if (type === $path) {
                    if (outputFormat === 'JSONG') {
                        onValue(model, next, seed, null, null, reference, null, outputFormat);
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
        var ref = [];
        for (var i = 0; i < depth; i++) {
            ref[i] = reference[i];
        }
        reference = ref;
    }

    return [node, reference];
}

module.exports = followReference;