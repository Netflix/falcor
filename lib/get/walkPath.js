var followReference = require("./followReference");
var onError = require("./onError");
var onMissing = require("./onMissing");
var onValue = require("./onValue");
var onValueType = require("./onValueType");
var isExpired = require("./util/isExpired");
var iterateKeySet = require("falcor-path-utils").iterateKeySet;
var $ref = require("./../types/ref");
var __invalidated = require("./../internal/invalidated");
var prefix = require("./../internal/prefix");

module.exports = function walkPath(model, root, curr, path,
                  depthArg, seed, outerResults, requestedPath,
                  optimizedPath, isJSONG,
                  fromReferenceArg) {

    var depth = depthArg;
    var fromReference = fromReferenceArg;

    // If there is not a value in the current cache position or its a
    // value type, then we are at the end of the getWalk.
    if ((!curr || curr && curr.$type) || depth === path.length) {
        onValueType(model, curr, path, depth, seed, outerResults,
                requestedPath, optimizedPath, isJSONG, fromReference);
        return;
    }

    var keySet, i, len;
    keySet = path[depth];

    var iteratorNote = {};
    var isKeySet = false;
    var optimizedLength = optimizedPath.length;
    var previousOptimizedPath = optimizedPath;
    var nextDepth = depth + 1;
    var key = iterateKeySet(keySet, iteratorNote);

    // The key can be undefined if there is an empty path.  An example of an
    // empty path is: [lolomo, [], summary]
    if (key === undefined && iteratorNote.done) {
        return;
    }

    isKeySet = !iteratorNote.done;

    // loop over every key over the keySet
    do {
        fromReference = false;

        var next;
        if (key === null) {
            next = curr;
        }
        else {
            next = curr[key];
            optimizedPath[optimizedLength] = key;
            requestedPath[depth] = key;
        }

        // If there is the next position we need to consider references.
        if (next) {
            var nType = next.$type;
            var value = nType && next.value || next;

            // If next is a reference follow it.  If we are in JSONG mode,
            // report that value into the seed without passing the requested
            // path.  If a requested path is passed to onValueType then it
            // will add that path to the JSONGraph envelope under `paths`
            if (nextDepth < path.length && nType &&
                nType === $ref && !isExpired(next)) {
                if (isJSONG) {
                    onValueType(model, next, path, nextDepth, seed,
                                outerResults, null, optimizedPath,
                                isJSONG, fromReference);
                }
                var ref = followReference(model, root, root, next,
                                          value, seed, isJSONG);
                fromReference = true;
                next = ref[0];
                var refPath = ref[1];
                optimizedPath = refPath.slice();
            }
        }

        // Recurse to the next level.
        walkPath(model, root, next, path, nextDepth, seed, outerResults,
                requestedPath, optimizedPath, isJSONG, fromReference);

        // If its a keyset, we MUST copy the optimized path per loop.
        if (isKeySet) {
            optimizedPath = [];
            for (i = 0; i < optimizedLength; ++i) {
                optimizedPath[i] = previousOptimizedPath[i];
            }
        }

        // If the iteratorNote is not done, get the next key.
        if (!iteratorNote.done) {
            key = iterateKeySet(keySet, iteratorNote);
        }

    } while (!iteratorNote.done);
};
