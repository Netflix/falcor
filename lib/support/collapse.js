var __count = require("falcor/internal/count");
var __prefix = require("falcor/internal/prefix");
var array_map = require("falcor/support/array-map");
var is_array = Array.isArray;
var is_primitive = require("falcor/support/is-primitive");

var empty_array = new Array(0);

module.exports = function collapse(pathmap) {
    return array_map(pathmapToPathsets(pathmap).sets, collapseRangeIndexes);
};

// Note: export this for testing
module.exports.pathmapToPathsets = pathmapToPathsets;

/**
 * Collapse range indexers, e.g. when there is a continuous
 * range in an array, turn it into an object instead:
 *
 * [1,2,3,4,5,6] => {"from":1, "to":6}
 *
 */
function collapseRangeIndexes(pathset) {
    
    var keysetIndex = -1;
    var keysetCount = pathset.length;

    while (++keysetIndex < keysetCount) {

        var keyset = pathset[keysetIndex];

        if (is_array(keyset)) {

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
                    pathset[keysetIndex] = {
                        from: from,
                        to: to
                    };
                }
            }
        }
    }
    
    return pathset;
}

function sortListAscending(a, b) {
    return a - b;
}

/**
 * Builds the set of collapsed
 * queries by traversing the tree
 * once
 */

/* jshint forin: false */
function pathmapToPathsets(pathmap, pathmapKey) {

    var key;
    var subs = Object.create(null);
    var subKeys = "";
    var pathsets = [];
    var pathsetsLength = 0;

    var subPath, subPathKeys, subPathKeysCount,
        subPathSets, subPathSetsCount, subPathSetsIndex;

    for(key in pathmap) {
        if(key === __count) {
            if(pathmapKey !== void 0) {
                subs[__prefix + pathmapKey] = {
                    key: pathmapKey,
                    keys: empty_array,
                    sets: empty_array
                };
            }
            delete pathmap[key];
        } else if(key[0] === __prefix) {
            continue;
        } else {
            subPath = pathmapToPathsets(pathmap[key], key);
            subPathKeys = subPath.key;
            subPathSets = subs[subPathKeys] || (subs[subPathKeys] = {
                key: subPathKeys,
                keys: [],
                sets: subPath.sets
            });
            subPathSets.key = key + ", " + subPathSets.key;
            subPathSets.keys.push(isNumber(key) ? parseInt(key, 10) : key);
        }
    }

    var pathset, pathsetCount, pathsetIndex,
        pathsetClone, firstSubPathsKey;

    for(key in subs) {

        subPath = subs[key];
        subPathKeys = subPath.keys;
        subPathKeysCount = subPathKeys.length;

        if(subPathKeysCount > 0) {

            subKeys += (subKeys ? ", " : "") + "[" + subPath.key + "]";
            subPathSets = subPath.sets;
            subPathSetsIndex = -1;
            subPathSetsCount = subPathSets.length;
            firstSubPathsKey = subPathKeys[0];

            while(++subPathSetsIndex < subPathSetsCount) {

                pathset = subPathSets[subPathSetsIndex];
                pathsetIndex = -1;
                pathsetCount = pathset.length;
                pathsetClone = new Array(pathsetCount);

                if(subPathKeysCount > 1) {
                    pathsetClone[0] = subPathKeys;
                } else {
                    pathsetClone[0] = firstSubPathsKey;
                }

                while(++pathsetIndex < pathsetCount) {
                    pathsetClone[pathsetIndex + 1] = pathset[pathsetIndex];
                }

                pathsets[pathsetsLength++] = pathsetClone;
            }
        } else {
            subKeys += subKeys ? ", []" : "[]";
            pathsets[pathsetsLength++] = empty_array;
        }
    }

    if(pathsetsLength === 0) {
        pathsets[0] = empty_array;
    }

    return {
        key: subKeys || "[]",
        sets: pathsets
    };
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

/**
 * allUnique
 * return true if every number in an array is unique
 */
function allUnique(arr) {
    var hash = {},
        index, count;
    for (index = 0, count = arr.length; index < count; index++) {
        if (hash[arr[index]]) {
            return false;
        }
        hash[arr[index]] = true;
    }
    return true;
}

/**
 * Create a unique hash key for a set of paths
 */
function createKey(list) {
    return JSON.stringify(sortListOfLists(list));
}

/**
 * Sort a list-of-lists
 * Used for generating a unique hash key for each subtree; used by the memoization
 */
function sortListOfLists(list) {
    var index = 0;
    var result = [];
    var listIndex = -1;
    var listCount = list.length;
    while(++listIndex < listCount) {
        var value = list[listIndex];
        result[index++] = is_array(value) ?
            sortListOfLists(value) :
            value;
    }
    return result.sort();
}