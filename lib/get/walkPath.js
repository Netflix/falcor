var followReference = require("./followReference");
var onValueType = require("./onValueType");
var onValue = require("./onValue");
var isExpired = require("./util/isExpired");
var iterateKeySet = require("falcor-path-utils").iterateKeySet;
var $ref = require("./../types/ref");
var NullInPathError = require("./../errors/NullInPathError");
var promote = require("./../lru/promote");

module.exports = function walkPath(model, root, curr, path, depth, seed,
                                   outerResults, branchInfo, requestedPath,
                                   optimizedPathArg, optimizedLength, isJSONG,
                                   fromReferenceArg, referenceContainerArg) {

    var fromReference = fromReferenceArg;
    var optimizedPath = optimizedPathArg;
    var referenceContainer = referenceContainerArg;

    // If there is not a value in the current cache position or its a
    // value type, then we are at the end of the getWalk.
    if ((!curr || curr && curr.$type) || depth === path.length) {
        onValueType(model, curr, path, depth, seed, outerResults, branchInfo,
                requestedPath, optimizedPath, optimizedLength,
                isJSONG, fromReference);
        return;
    }

    var i;
    var keySet = path[depth];
    var isKeySet = typeof keySet === "object";
    var nextDepth = depth + 1;
    var iteratorNote = false;
    var key = keySet;
    var allowFromWhenceYouCame = model._allowFromWhenceYouCame;

    if (isKeySet) {
        iteratorNote = {};
        key = iterateKeySet(keySet, iteratorNote);
    }

    // loop over every key over the keySet
    var optimizedLengthPlus1 = optimizedLength + 1;
    var refPath;
    do {
        fromReference = false;

        var next;

        // There are two cases when it comes to a null key.  In path vs at the
        // end of a path.
        if (key === null) {
            // If the key is null and we are not at the end of a path, then
            // throw an error.
            if (depth < path.length) {
                throw new NullInPathError();
            }

            // Else, we are at the end of a path, then just say next is current.
            else {
                next = curr;
            }
        }

        // The standard case, do the depth search into the cache.
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
                nextOptimizedPath = [];
                nextOptimizedLength = refPath.length;
                for (i = 0; i < nextOptimizedLength; ++i) {
                    nextOptimizedPath[i] = refPath[i];
                }
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
