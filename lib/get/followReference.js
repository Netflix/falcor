var createHardlink = require("./../support/createHardlink");
var onValue = require("./../get/onValue");
var isExpired = require("./../get/util/isExpired");
var $ref = require("./../types/ref");
var promote = require("./../lru/promote");

/* eslint-disable no-constant-condition */
function followReference(model, root, nodeArg, referenceContainerArg,
                         referenceArg, seed, isJSONG) {

    var node = nodeArg;
    var reference = referenceArg;
    var referenceContainer = referenceContainerArg;
    var depth = 0;
    var k, next;

    while (true) {
        if (depth === 0 && referenceContainer.$_context) {
            depth = reference.length;
            next = referenceContainer.$_context;
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

                if (!referenceContainer.$_context) {
                    createHardlink(referenceContainer, next);
                }

                // Restart the reference follower.
                if (type === $ref) {

                    // Nulls out the depth, outerResults,
                    if (isJSONG) {
                        onValue(model, next, seed, null, null, null, null,
                                reference, reference.length, isJSONG);
                    } else {
                        promote(model._root, next);
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
            node = void 0;
        }
        break;
    }


    if (depth < reference.length && node !== void 0) {
        var ref = [];
        for (var i = 0; i < depth; i++) {
            ref[i] = reference[i];
        }
        reference = ref;
    }

    return [node, reference, referenceContainer];
}
/* eslint-enable */

module.exports = followReference;
