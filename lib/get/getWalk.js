var followReference = require("./../get/followReference");
var onError = require("./../get/onError");
var onMissing = require("./../get/onMissing");
var onValue = require("./../get/onValue");
var lru = require("./../get/util/lru");
var hardLink = require("./../get/util/hardlink");
var isMaterialized = require("./../get/util/isMaterialzed");
var removeHardlink = hardLink.remove;
var splice = lru.splice;
var arraySlice = require("../support/array-slice");
var isExpired = require("./../get/util/isExpired");
var iterateKeySet = require("falcor-path-utils").iterateKeySet;
var $ref = require("./../types/ref");
var $error = require("./../types/error");
var __invalidated = require("./../internal/invalidated");
var prefix = require("./../internal/prefix");

function getWalk(model, root, curr, pathOrJSON, depthArg, seedOrFunction, positionalInfoArg, outerResults, optimizedPath, requestedPath, inputFormat, outputFormat, fromReferenceArg) {
    var depth = depthArg;
    var fromReference = fromReferenceArg;
    var positionalInfo = positionalInfoArg;
    if ((!curr || curr && curr.$type) &&
        evaluateNode(model, curr, pathOrJSON, depth, seedOrFunction, requestedPath, optimizedPath, positionalInfo, outerResults, outputFormat, fromReference)) {
        return;
    }

    // We continue the search to the end of the path/json structure.
    else {

        // Base case of the searching:  Have we hit the end of the road?
        // Paths
        // 1) depth === path.length
        // PathMaps (json input)
        // 2) if its an object with no keys
        // 3) its a non-object
        var jsonQuery = inputFormat === "JSON";
        var atEndOfJSONQuery = false;
        var keySet, i, len;
        if (jsonQuery) {
            // it has a $type property means we have hit a end.
            if (pathOrJSON && pathOrJSON.$type) {
                atEndOfJSONQuery = true;
            }

            else if (pathOrJSON && typeof pathOrJSON === "object") {
                keySet = Object.keys(pathOrJSON);

                // Parses out all the prefix keys so that later parts
                // of the algorithm do not have to consider them.
                var parsedKeys = [];
                var parsedKeysLength = -1;
                for (i = 0, len = keySet.length; i < len; ++i) {
                    if (keySet[i][0] !== prefix && keySet[i][0] !== "$") {
                        parsedKeys[++parsedKeysLength] = keySet[i];
                    }
                }
                keySet = parsedKeys;
                if (keySet.length === 1) {
                    keySet = keySet[0];
                }
            }

            // found a primitive, we hit the end.
            else {
                atEndOfJSONQuery = true;
            }
        } else {
            keySet = pathOrJSON[depth];
        }

        // BaseCase: we have hit the end of our query without finding a "leaf" node, therefore emit missing.
        if (atEndOfJSONQuery || !jsonQuery && depth === pathOrJSON.length) {
            if (isMaterialized(model)) {
                onValue(model, curr, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat, fromReference);
                return;
            }
            onMissing(model, curr, pathOrJSON, depth, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat);
            return;
        }

        var iteratorNote = {};
        var permutePosition = positionalInfo;
        var permuteRequested = requestedPath;
        var permuteOptimized = optimizedPath;
        var asJSONG = outputFormat === "JSONG";
        var asJSON = outputFormat === "JSON";
        var isKeySet = false;
        var hasChildren = false;
        depth++;

        var key = iterateKeySet(keySet, iteratorNote);

        // Checks for empty keyset values.  This happens when the iterator
        // comes back empty.
        if (key === void 0 && iteratorNote.done) {
            return;
        }

        isKeySet = !iteratorNote.done;
        if (asJSON && isKeySet) {
            permutePosition = arraySlice(positionalInfo);
            permutePosition.push(depth - 1);
        }

        do {
            fromReference = false;
            if (isKeySet) {
                permuteOptimized = arraySlice(optimizedPath);
                permuteRequested = arraySlice(requestedPath);
            }

            var nextPathOrPathMap = jsonQuery ? pathOrJSON[key] : pathOrJSON;
            if (jsonQuery && nextPathOrPathMap) {
                if (typeof nextPathOrPathMap === "object") {
                    if (nextPathOrPathMap.$type) {
                        hasChildren = false;
                    } else {
                        hasChildren = Object.keys(nextPathOrPathMap).length > 0;
                    }
                }
            }

            var next;
            if (key === null || jsonQuery && key === "__null") {
                next = curr;
            } else {
                next = curr[key];
                permuteOptimized.push(key);
                permuteRequested.push(key);
            }

            if (next) {
                var nType = next.$type;
                var value = nType && next.value || next;

                if (jsonQuery && hasChildren || !jsonQuery && depth < pathOrJSON.length) {

                    if (nType && nType === $ref && !isExpired(next)) {
                        if (asJSONG) {
                            onValue(model, next, seedOrFunction, outerResults, false, permuteOptimized, permutePosition, outputFormat);
                        }
                        var ref = followReference(model, root, root, next, value, seedOrFunction, outputFormat);
                        fromReference = true;
                        next = ref[0];
                        var refPath = ref[1];

                        permuteOptimized = arraySlice(refPath);
                    }
                }
            }
            getWalk(model, root, next, nextPathOrPathMap, depth, seedOrFunction, permutePosition, outerResults, permuteOptimized, permuteRequested, inputFormat, outputFormat, fromReference);

            if (!iteratorNote.done) {
                key = iterateKeySet(keySet, iteratorNote);
            }

        } while (!iteratorNote.done);
    }
}

function evaluateNode(model, curr, pathOrJSON, depth, seedOrFunction, requestedPath, optimizedPath, positionalInfoArg, outerResults, outputFormat, fromReference) {
    var positionalInfo = positionalInfoArg;
    // BaseCase: This position does not exist, emit missing.
    if (!curr) {
        if (isMaterialized(model)) {
            onValue(model, curr, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat, fromReference);
        } else {
            onMissing(model, curr, pathOrJSON, depth, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat);
        }
        return true;
    }

    var currType = curr.$type;

    positionalInfo = positionalInfo || [];

    // The Base Cases.  There is a type, therefore we have hit a "leaf" node.
    if (currType === $error) {
        if (fromReference) {
            requestedPath.push(null);
        }
        if (outputFormat === "JSONG" || model._treatErrorsAsValues) {
            onValue(model, curr, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat, fromReference);
        } else {
            onError(model, curr, requestedPath, optimizedPath, outerResults);
        }
    }

    // Else we have found a value, emit the current position information.
    else if (isExpired(curr)) {
        if (!curr[__invalidated]) {
            splice(model, curr);
            removeHardlink(curr);
        }
        onMissing(model, curr, pathOrJSON, depth, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat);
    } else {
        onValue(model, curr, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat, fromReference);
    }

    return true;
}

module.exports = getWalk;
