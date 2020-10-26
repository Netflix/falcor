var followReference = require("./followReference");
var onValueType = require("./onValueType");
var onValue = require("./onValue");
var isExpired = require("./util/isExpired");
var iterateKeySet = require("falcor-path-utils").iterateKeySet;
var $ref = require("./../types/ref");
var promote = require("./../lru/promote");

module.exports = function walkPath(model, root, curr, path, depth, seed,
                                   outerResults, branchInfo, requestedPath,
                                   optimizedPathArg, optimizedLength, isJSONG,
                                   fromReferenceArg, referenceContainerArg) {

    var fromReference = fromReferenceArg;
    var optimizedPath = optimizedPathArg;
    var referenceContainer = referenceContainerArg;

    // The walk is finished when:
    // - there is no value in the current cache position
    // - there is a JSONG leaf node in the current cache position
    // - we've reached the end of the path
    if (!curr || curr.$type || depth === path.length) {
        onValueType(model, curr, path, depth, seed, outerResults, branchInfo,
                requestedPath, optimizedPath, optimizedLength,
                isJSONG, fromReference);
        return;
    }

    var keySet = path[depth];
    var isKeySet = keySet !== null && typeof keySet === "object";
    var iteratorNote = false;
    var key = keySet;

    if (isKeySet) {
        iteratorNote = {};
        key = iterateKeySet(keySet, iteratorNote);
    }

    var allowFromWhenceYouCame = model._allowFromWhenceYouCame;
    var optimizedLengthPlus1 = optimizedLength + 1;
    var nextDepth = depth + 1;
    var refPath;

    // loop over every key in the key set
    do {
        if (key == null) {
            // Skip null/undefined/empty keysets in path and do not descend, but capture the partial path in the result
            onValueType(model, curr, path, depth, seed, outerResults, branchInfo,
                requestedPath, optimizedPath, optimizedLength,
                isJSONG, fromReference);

            if (iteratorNote && !iteratorNote.done) {
                key = iterateKeySet(keySet, iteratorNote);
            }

            continue;
        }

        fromReference = false;
        optimizedPath[optimizedLength] = key;
        requestedPath[depth] = key;

        var next = curr[key];
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

                // promote the node so that the references don't get cleaned up.
                promote(model._root, next);

                if (isJSONG) {
                    onValue(model, next, seed, nextDepth, outerResults, null,
                            null, optimizedPath, nextOptimizedLength, isJSONG);
                }

                var ref = followReference(model, root, root, next,
                                          value, seed, isJSONG);
                fromReference = true;
                next = ref[0];
                refPath = ref[1];
                referenceContainer = ref[2];
                nextOptimizedPath = refPath.slice();
                nextOptimizedLength = refPath.length;
            }

            // The next can be set to undefined by following a reference that
            // does not exist.
            if (next) {
                var obj;

                // There was a reference container.
                if (referenceContainer && allowFromWhenceYouCame) {
                    obj = {
                        // eslint-disable-next-line camelcase
                        $__path: next.$_absolutePath,
                        // eslint-disable-next-line camelcase
                        $__refPath: referenceContainer.value,
                        // eslint-disable-next-line camelcase
                        $__toReference: referenceContainer.$_absolutePath
                    };
                }

                // There is no reference container meaning this request was
                // neither from a model and/or the first n (depth) keys do not
                // contain references.
                else {
                    obj = {
                        // eslint-disable-next-line camelcase
                        $__path: next.$_absolutePath
                    };
                }

                branchInfo[depth] = obj;
            }
        }

        // Recurse to the next level.
        walkPath(model, root, next, path, nextDepth, seed, outerResults,
                 branchInfo, requestedPath, nextOptimizedPath,
                 nextOptimizedLength, isJSONG,
                 fromReference, referenceContainer);

        // If the iteratorNote is not done, get the next key.
        if (iteratorNote && !iteratorNote.done) {
            key = iterateKeySet(keySet, iteratorNote);
        }
    } while (iteratorNote && !iteratorNote.done);
};
