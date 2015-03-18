var followReference = require('./followReference');
var onError = require('./onError');
var onMissing = require('./onMissing');
var onValue = require('./onValue');
var lru = require('./../util/lru');
var hardLink = require('./../util/hardlink');
var removeHardlink = hardLink.remove;
var splice = lru.splice;
var support = require('./../util/support');
var isExpired = support.isExpired;

// TODO: Objectify?
function walk(model, root, curr, pathOrJSON, depth, seedOrFunction, positionalInfo, outerResults, optimizedPath, requestedPath, inputFormat, outputFormat, fromReference) {
    if (evaluateNode(model, curr, pathOrJSON, depth, seedOrFunction, requestedPath, optimizedPath, positionalInfo, outerResults, outputFormat, fromReference)) {
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
        var jsonQuery = inputFormat === 'JSON';
        var atEndOfJSONQuery = false;
        var k, i, len;
        if (jsonQuery) {
            if (pathOrJSON && typeof pathOrJSON === 'object') {
                if (Array.isArray(pathOrJSON)) {
                    atEndOfJSONQuery = true;
                } else {
                    k = Object.keys(pathOrJSON);
                    if (k.length === 1) {
                        k = k[0];
                    }
                }
            } else {
                atEndOfJSONQuery = true;
            }
        } else {
            k = pathOrJSON[depth];
        }


        // BaseCase: we have hit the end of our query without finding a 'leaf' node, therefore emit missing.
        if (atEndOfJSONQuery || !jsonQuery && depth === pathOrJSON.length) {
            onMissing(pathOrJSON, depth, requestedPath, optimizedPath, positionalInfo, outerResults, outputFormat);
            return;
        }

        var memo = {done: false};
        var first = true;
        var permutePosition = positionalInfo;
        var permuteRequested = requestedPath;
        var permuteOptimized = optimizedPath;
        var asJSONG = outputFormat === 'JSONG';
        var asJSON = outputFormat === 'JSON';
        var isKeySet = false;
        var hasChildren = false;
        fromReference = false;
        depth++;

        var key;
        if (k && typeof k === 'object') {
            memo.isArray = Array.isArray(k);
            memo.arrOffset = 0;

            key = permuteKey(k, memo);
            isKeySet = true;
        } else {
            key = k;
            memo.done = true;
        }

        if (asJSON && isKeySet) {
            permutePosition.push(depth - 1);
        }

        while (!memo.done || first) {
            first = false;
            if (!memo.done) {
                permuteOptimized = [];
                permuteRequested = [];
                for (i = 0, len = requestedPath.length; i < len; i++) {
                    permuteRequested[i] = requestedPath[i];
                }
                for (i = 0, len = optimizedPath.length; i < len; i++) {
                    permuteOptimized[i] = optimizedPath[i];
                }
            }

            var nextPathOrPathMap = jsonQuery ? pathOrJSON[key] : pathOrJSON;
            if (jsonQuery && nextPathOrPathMap) {
                // TODO: consider an array, types, and simple values.
                if (typeof nextPathOrPathMap === 'object' && !Array.isArray(nextPathOrPathMap)) {
                    hasChildren = Object.keys(nextPathOrPathMap).length > 0;
                }
            }

            var next = curr[key];

            if (key !== null) {
                permuteOptimized.push(key);
                permuteRequested.push(key);
            }

            if (next) {
                var nType = next.$type;
                var nSentinel = nType === 'sentinel';
                var value = nSentinel ? next.value : next;
                var valueIsArray = Array.isArray(value);

                if (jsonQuery && hasChildren || !jsonQuery && depth < pathOrJSON.length) {

                    if (valueIsArray && (!nSentinel || nSentinel && !isExpired(next))) {
                        if (asJSONG) {
                            onValue(model, next, nextPathOrPathMap, depth, seedOrFunction, outerResults, false, permuteOptimized, permutePosition, outputFormat);
                        }
                        debugger;
                        var ref = followReference(model, root, root, next, value, seedOrFunction, outputFormat);
                        fromReference = true;
                        next = ref[0];
                        var refPath = ref[1];

                        permuteOptimized = [];
                        for (i = 0, len = refPath.length; i < len; i++) {
                            permuteOptimized[i] = refPath[i];
                        }
                    }
                }
            }
            walk(model, root, next, nextPathOrPathMap, depth, seedOrFunction, permutePosition, outerResults, permuteOptimized, permuteRequested, inputFormat, outputFormat, fromReference);

            if (!memo.done) {
                key = permuteKey(k, memo);
            }
        }
    }
}

function evaluateNode(model, curr, pathOrJSON, depth, seedOrFunction, requestedPath, optimizedPath, positionalInfo, outerResults, outputFormat, fromReference) {
    // BaseCase: This position does not exist, emit missing.
    if (!curr) {
        onMissing(pathOrJSON, depth, requestedPath, optimizedPath, positionalInfo, outerResults);
        return true;
    }

    var currType = curr.$type;
    var currValue = currType === 'sentinel' ? curr.value : curr;
    var atLeaf = currType || Array.isArray(currValue);

    positionalInfo = positionalInfo || [];

    // The Base Cases.  There is a type, therefore we have hit a 'leaf' node.
    if (atLeaf) {
        if (currType === 'error') {
            if (fromReference) {
                requestedPath.push(null);
            }
            if (outputFormat === 'JSONG') {
                onValue(model, curr, pathOrJSON, depth, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat);
                onError(model, curr, currValue, requestedPath, null, outerResults);
            } else {
                onError(model, curr, currValue, requestedPath, optimizedPath, outerResults);
            }
        }

        // Else we have found a value, emit the current position information.
        else {
            if (isExpired(curr)) {
                if (!curr.__invalidated) {
                    splice(model, curr);
                    removeHardlink(curr);
                }
                onMissing(pathOrJSON, depth, requestedPath, optimizedPath, positionalInfo, outerResults, outputFormat);
            } else {
                onValue(model, curr, pathOrJSON, depth, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat);
            }
        }

        return true;
    }
    return false;
}

// TODO:
module.exports = walk;
