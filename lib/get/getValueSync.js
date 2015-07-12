var followReference = require('falcor/get/followReference');
var clone = require('falcor/get/util/clone');
var isExpired = require('falcor/get/util/isExpired');
var promote = require('falcor/get/util/lru').promote;
var $ref = require('falcor/types/ref');
var $atom = require('falcor/types/atom');
var $error = require('falcor/types/error');

module.exports = function getValueSync(model, simplePath, noClone) {
    var root = model._cache;
    var len = simplePath.length;
    var optimizedPath = [];
    var shorted = false, shouldShort = false;
    var depth = 0;
    var key, i, next = root, type, curr = root, out, ref, refNode;
    var found = true;

    do {
        key = simplePath[depth++];
        if (key !== null) {
            next = curr[key];
            optimizedPath[optimizedPath.length] = key;
        }

        if (!next) {
            out = undefined;
            shorted = true;
            found = false;
            break;
        }

        type = next.$type;

        // Up to the last key we follow references
        if (depth < len) {
            if (type === $ref) {
                ref = followReference(model, root, root, next, next.value);
                refNode = ref[0];

                // The next node is also set to undefined because nothing
                // could be found, this reference points to nothing, so
                // nothing must be returned.
                if (!refNode) {
                    out = undefined;
                    next = undefined;
                    break;
                }
                type = refNode.$type;
                next = refNode;
                optimizedPath = ref[1].slice(0);
            }

            if (type) {
                break;
            }
        }
        // If there is a value, then we have great success, else, report an undefined.
        else {
            out = next;
        }
        curr = next;

    } while (next && depth < len);

    if (depth < len) {
        // Unfortunately, if all that follows are nulls, then we have not shorted.
        for (i = depth; i < len; ++i) {
            if (simplePath[depth] !== null) {
                shouldShort = true;
                break;
            }
        }
        // if we should short or report value.  Values are reported on nulls.
        if (shouldShort) {
            shorted = true;
            out = undefined;
        } else {
            out = next;
        }

        for (i = depth; i < len; ++i) {
            optimizedPath[optimizedPath.length] = simplePath[i];
        }
    }

    // promotes if not expired
    if (out) {
        if (isExpired(out)) {
            out = undefined;
        } else {
            promote(model, out);
        }
    }

    if (out && out.$type === $error && !model._treatErrorsAsValues) {
        throw {
            path: depth === len ? simplePath : simplePath.slice(0, depth),
            value: out.value
        };
    } else if (out && model._boxed) {
        out = Boolean(type) && !noClone ? clone(out) : out;
    } else if (!out && model._materialized) {
        out = {$type: $atom};
    } else if (out) {
        out = out.value;
    }

    return {
        value: out,
        shorted: shorted,
        optimizedPath: optimizedPath,
        found: found
    };
};
