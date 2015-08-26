var followReference = require("./followReference");
var onValue = require("./onValue");
var onValueType = require("./onValueType");
var isMaterialized = require("./util/isMaterialzed");
var isExpired = require("./util/isExpired");
var iterateKeySet = require("falcor-path-utils").iterateKeySet;
var $ref = require("./../types/ref");
var __invalidated = require("./../internal/invalidated");
var prefix = require("./../internal/prefix");

module.exports = function walkJSON(model, root, curr, json,
                  depthArg, seed, outerResults, requestedPath,
                  optimizedPath, isJSONG, fromReferenceArg) {

    var depth = depthArg;
    var fromReference = fromReferenceArg;

    if ((!curr || curr && curr.$type)) {
        onValueType(model, curr, json, depth, seed, outerResults,
                requestedPath, optimizedPath, isJSONG, fromReference);
        return;
    }

    var atEndOfJSONQuery = false;
    var keySet, i, len;

    // it has a $type property means we have hit a end.
    if (json && json.$type) {
        atEndOfJSONQuery = true;
    }

    else if (json && typeof json === "object") {
        keySet = Object.keys(json);

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

    // BaseCase: we have hit the end of our query without finding a "leaf" node, therefore emit missing.
    if (atEndOfJSONQuery) {
        onValueType(model, curr, path, depth, seed, outerResults,
                requestedPath, optimizedPath, isJSONG, fromReference);
    }

    var iteratorNote = {};
    var isKeySet = false;
    var optimizedLength = optimizedPath.length;
    var previousOptimizedPath = optimizedPath;
    var key = iterateKeySet(keySet, iteratorNote);
    var nextDepth = depth + 1;

    // Checks for empty keyset values.  This happens when the iterator
    // comes back empty.
    if (key === undefined && iteratorNote.done) {
        return;
    }

    isKeySet = !iteratorNote.done;

    do {
        fromReference = false;

        var nextJSON = json[key];
        if (nextJSON) {
            if (typeof nextJSON === "object") {
                if (nextJSON.$type) {
                    hasChildren = false;
                } else {
                    hasChildren = Object.keys(nextJSON).length > 0;
                }
            }
        }

        var next;
        next = curr[key];
        optimizedPath[optimizedLength] = key;
        requestedPath[depth] = key;

        if (next) {
            var nType = next.$type;
            var value = nType && next.value || next;

            if (hasChildren && nType && nType === $ref && !isExpired(next)) {
                if (isJSONG) {
                    onValueType(model, next, nextJSON, null, seed,
                                outerResults, requestedPath, optimizedPath,
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
        walkJSON(model, root, next, nextJSON, nextDepth, seed, outerResults,
                requestedPath, optimizedPath, isJSONG, fromReference);

        requestedPath.length = depth;
        if (isKeySet) {
            optimizedPath = previousOptimizedPath.slice(0, optimizedLength);
        }

        if (!iteratorNote.done) {
            key = iterateKeySet(keySet, iteratorNote);
        }

    } while (!iteratorNote.done);
};
