var is_array = Array.isArray;
var is_object = require("falcor/support/is-object");

module.exports = function collapse(lengths) {
    var pathmap;
    var allPaths = [];
    var allPathsLength = 0;
    for (var length in lengths) {
        if (isNumber(length) && is_object(pathmap = lengths[length])) {
            var paths = collapsePathMap(pathmap, parseInt(length, 10));
            var pathsIndex = -1;
            var pathsCount = paths.length;
            while (++pathsIndex < pathsCount) {
                allPaths[allPathsLength++] = collapsePathSetIndexes(paths[pathsIndex]);
            }
        }
    }
    return allPaths;
};

function collapsePathMap(pathmap, length) {
    return pathmapToPathsets(pathmap, 0, length).sets;
}

/**
 * Builds the set of collapsed queries
 * by traversing the tree once.
 */

/* jshint forin: false */
function pathmapToPathsets(pathmap, depth, length, pathmapKey) {

    if (typeof pathmapKey === "undefined") {
        pathmapKey = "";
    }


    var key;
    var code = getHashCode(String(depth));
    var subs = Object.create(null);
    var pathsets = [];
    var pathsetsLength = 0;

    var subPath, subCode,
        subKeys, subKeysCount, firstSubKey,
        subSets, subSetsCount, subSetsIndex,
        pathset, pathsetCount, pathsetIndex, pathsetClone;

    if (depth < length - 1) {

        for (key in pathmap) {

            subPath = pathmapToPathsets(pathmap[key], depth + 1, length, key);
            subCode = subPath.code;
            subPath = subs[subCode] || (subs[subCode] = {
                keys: [],
                sets: subPath.sets
            });

            code = getHashCode(code + key + subCode);

            isNumber(key) &&
                subPath.keys.push(parseInt(key, 10)) ||
                subPath.keys.push(key);
        }

        for (key in subs) {

            subPath = subs[key];
            subKeys = subPath.keys;
            subKeysCount = subKeys.length;

            if (subKeysCount > 0) {

                subSets = subPath.sets;
                subSetsIndex = -1;
                subSetsCount = subSets.length;
                firstSubKey = subKeys[0];

                while (++subSetsIndex < subSetsCount) {

                    pathset = subSets[subSetsIndex];
                    pathsetIndex = -1;
                    pathsetCount = pathset.length;
                    pathsetClone = new Array(pathsetCount + 1);
                    pathsetClone[0] = subKeysCount > 1 && subKeys || firstSubKey;

                    while (++pathsetIndex < pathsetCount) {
                        pathsetClone[pathsetIndex + 1] = pathset[pathsetIndex];
                    }

                    pathsets[pathsetsLength++] = pathsetClone;
                }
            }
        }
    } else {
        subSets = [];
        subSetsIndex = 0;
        for (key in pathmap) {
            code = getHashCode(code + key);
            subSets[subSetsIndex++] = key;
        }
        pathsets[pathsetsLength++] = subSetsIndex > 1 && [subSets] || subSets;
    }

    return {
        code: code,
        sets: pathsets
    };
}

function collapsePathSetIndexes(pathset) {

    var keysetIndex = -1;
    var keysetCount = pathset.length;

    while (++keysetIndex < keysetCount) {
        var keyset = pathset[keysetIndex];
        if (is_array(keyset)) {
            pathset[keysetIndex] = collapseIndex(keyset);
        }
    }

    return pathset;
}

/**
 * Collapse range indexers, e.g. when there is a continuous
 * range in an array, turn it into an object instead:
 *
 * [1,2,3,4,5,6] => {"from":1, "to":6}
 *
 */
function collapseIndex(keyset) {

    // Do we need to dedupe an indexer keyset if they're duplicate consecutive integers?
    // var hash = {};
    var keyIndex = -1;
    var keyCount = keyset.length - 1;
    var isSparseRange = keyCount > 0;

    while (++keyIndex <= keyCount) {

        var key = keyset[keyIndex];

        if (!isNumber(key) /* || hash[key] === true*/ ) {
            isSparseRange = false;
            break;
        }
        // hash[key] = true;
        // Cast number indexes to integers.
        keyset[keyIndex] = parseInt(key, 10);
    }

    if (isSparseRange === true) {

        keyset.sort(sortListAscending);

        var from = keyset[0];
        var to = keyset[keyCount];

        // If we re-introduce deduped integer indexers, change this comparson to "===".
        if (to - from <= keyCount) {
            return {
                from: from,
                to: to
            };
        }
    }

    return keyset;
}

function sortListAscending(a, b) {
    return a - b;
}

function getHashCode(key) {
    var code = 5381;
    var index = -1;
    var count = key.length;
    while (++index < count) {
        code = (code << 5) + code + key.charCodeAt(index);
    }
    return String(code);
}

/**
 * Return true if argument is a number or can be cast to a number
 */
function isNumber(val) {
    // parseFloat NaNs numeric-cast false positives (null|true|false|"")
    // ...but misinterprets leading-number strings, particularly hex literals ("0x...")
    // subtraction forces infinities to NaN
    // adding 1 corrects loss of precision from parseFloat (#15100)
    return !is_array(val) && (val - parseFloat(val) + 1) >= 0;
}