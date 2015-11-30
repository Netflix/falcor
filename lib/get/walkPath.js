var followReference = require("./followReference");
var onValueType = require("./onValueType");
var isExpired = require("./util/isExpired");
var iterateKeySet = require("falcor-path-utils").iterateKeySet;
var $ref = require("./../types/ref");
var promote = require("./util/lru").promote;

module.exports = function walkPath(model, root, curr, path, depth, seed,
                                   outerResults, requestedPath,
                                   optimizedPathArg, optimizedLength, isJSONG,
                                   fromReferenceArg) {

    var fromReference = fromReferenceArg;
    var optimizedPath = optimizedPathArg;

    // If there is not a value in the current cache position or its a
    // value type, then we are at the end of the getWalk.
    if ((!curr || curr && curr.$type) || depth === path.length) {
        onValueType(model, curr, path, depth, seed, outerResults,
                requestedPath, optimizedPath, optimizedLength,
                isJSONG, fromReference);
        return;
    }

    var keySet, i;
    keySet = path[depth];

    var isKeySet = typeof keySet === "object";
    var nextDepth = depth + 1;
    var iteratorNote = false;
    var key = keySet;
    if (isKeySet) {
        iteratorNote = {};
        key = iterateKeySet(keySet, iteratorNote);
    }

    // The key can be undefined if there is an empty path.  An example of an
    // empty path is: [lolomo, [], summary]
    if (key === undefined && iteratorNote.done) {
        return;
    }

    // loop over every key over the keySet
    var optimizedLengthPlus1 = optimizedLength + 1;
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

        var nextOptimizedPath = optimizedPath;
        var nextOptimizedLength = optimizedLengthPlus1;

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
                                nextOptimizedLength, isJSONG, fromReference);
                }

                // promote the reference so that it will not be cleaned out of
                // the cache when its heavily used.
                promote(model, next);
                var ref = followReference(model, root, root, next,
                                          value, seed, isJSONG);
                fromReference = true;
                next = ref[0];
                var refPath = ref[1];
                nextOptimizedPath = [];
                nextOptimizedLength = refPath.length;
                for (i = 0; i < nextOptimizedLength; ++i) {
                    nextOptimizedPath[i] = refPath[i];
                }
            }
        }

        // Recurse to the next level.
        walkPath(model, root, next, path, nextDepth, seed, outerResults,
                requestedPath, nextOptimizedPath, nextOptimizedLength,
                isJSONG, fromReference);

        // If the iteratorNote is not done, get the next key.
        if (iteratorNote && !iteratorNote.done) {
            key = iterateKeySet(keySet, iteratorNote);
        }

    } while (iteratorNote && !iteratorNote.done);
};
