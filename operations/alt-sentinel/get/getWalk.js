var followReference = require('./followReference');
var onError = require('./onError');
var onMissing = require('./onMissing');
var onValue = require('./onValue');
var lru = require('../util/lru');
var hardLink = require('../util/hardlink');
var removeHardlink = hardLink.remove;
var splice = lru.splice;
var isExpired = require('../util/isExpired');
var permuteKey = require('../util/permuteKey');

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
            model._materialized ?
                onValue(model, curr, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat, fromReference) :
                onMissing(model, curr, pathOrJSON, depth, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat);
            return;
        }

        var memo = {done: false};
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

        do {
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
                if (typeof nextPathOrPathMap === 'object' && !Array.isArray(nextPathOrPathMap)) {
                    hasChildren = Object.keys(nextPathOrPathMap).length > 0;
                }
            }

            var next;
            if (key === null || jsonQuery && key === '__null') {
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

                    if (nType && nType === 'path' && !isExpired(next)) {
                        if (asJSONG) {
                            onValue(model, next, seedOrFunction, outerResults, false, permuteOptimized, permutePosition, outputFormat);
                        }
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
            
        } while (!memo.done);
    }
}

function evaluateNode(model, curr, pathOrJSON, depth, seedOrFunction, requestedPath, optimizedPath, positionalInfo, outerResults, outputFormat, fromReference) {
    // BaseCase: This position does not exist, emit missing.
    if (!curr) {
        model._materialized ?
            onValue(model, curr, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat, fromReference) :
            onMissing(model, curr, pathOrJSON, depth, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat);
        return true;
    }

    var currType = curr.$type;

    positionalInfo = positionalInfo || [];

    // The Base Cases.  There is a type, therefore we have hit a 'leaf' node.
    if (currType) {
        if (currType === 'error') {
            if (fromReference) {
                requestedPath.push(null);
            }
            if (outputFormat === 'JSONG') {
                onValue(model, curr, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat, fromReference);
                if (!model._treatErrorsAsValues) {
                    onError(model, curr, requestedPath, null, outerResults);
                }
            } else {
                if (model._treatErrorsAsValues) {
                    onValue(model, curr, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat, fromReference);
                } else {
                    onError(model, curr, requestedPath, optimizedPath, outerResults);
                }
            }
        }

        // Else we have found a value, emit the current position information.
        else {
            if (isExpired(curr)) {
                if (!curr.__invalidated) {
                    splice(model, curr);
                    removeHardlink(curr);
                }
                onMissing(model, curr, pathOrJSON, depth, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat);
            } else {
                onValue(model, curr, seedOrFunction, outerResults, requestedPath, optimizedPath, positionalInfo, outputFormat, fromReference);
            }
        }

        return true;
    }
    return false;
}

module.exports = walk;
