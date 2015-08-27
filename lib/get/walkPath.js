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

    if ((!curr || curr && curr.$type)) {
        onValueType(model, curr, path, depth, seed, outerResults,
                requestedPath, optimizedPath, isJSONG, fromReference);
        return;
    }

    // We continue the search to the end of the path/json structure.
    // Base case of the searching:  Have we hit the end of the road?
    // Paths
    // 1) depth === path.length
    // PathMaps (json input)
    // 2) if its an object with no keys
    // 3) its a non-object
    var keySet, i, len;
    keySet = path[depth];

    // BaseCase: we have hit the end of our query without finding a "leaf" node, therefore emit missing.
    if (depth === path.length) {
        onValueType(model, curr, path, depth, seed, outerResults,
                requestedPath, optimizedPath, isJSONG, fromReference);
    }

    var iteratorNote = {};
    var isKeySet = false;
    var optimizedLength = optimizedPath.length;
    var previousOptimizedPath = optimizedPath;
    var nextDepth = depth + 1;
    var key = iterateKeySet(keySet, iteratorNote);

    // Checks for empty keyset values.  This happens when the iterator
    // comes back empty.
    if (key === undefined && iteratorNote.done) {
        return;
    }

    isKeySet = !iteratorNote.done;

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

        if (next) {
            var nType = next.$type;
            var value = nType && next.value || next;

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
        walkPath(model, root, next, path, nextDepth, seed, outerResults,
                requestedPath, optimizedPath, isJSONG, fromReference);

        if (isKeySet) {
            optimizedPath = previousOptimizedPath.slice(0, optimizedLength);
        }

        if (!iteratorNote.done) {
            key = iterateKeySet(keySet, iteratorNote);
        }

    } while (!iteratorNote.done);
};
