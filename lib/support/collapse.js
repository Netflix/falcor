var array_map = require("./array-map");
var is_array = Array.isArray;
var is_primitive = require("./is-primitive");

module.exports = function collapse(pathmap) {
    return array_map(buildQueries(pathmap), collapseRangeIndexes);
};

// Note: export this for testing
module.exports.buildQueries = buildQueries;

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
            var isSparseRange = true;
            var keyIndex = -1;
            var keyCount = keyset.length - 1;

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
function buildQueries(pathmap) {

    if (is_primitive(pathmap)) {
        return [[]];
    }

    var keys = Object.keys(pathmap);
    var keysIndex = -1;
    var keysCount = keys.length;
    
    if (keysCount === 0) {
        return [[]];
    }

    var subPaths = {};
    var subPath, subPathKeys, subPathSets, clone, j, k, x;

    while (++keysIndex < keysCount) {
        
        var key = keys[keysIndex];
        var pathsets = buildQueries(pathmap[key]);
        var pathsetsKey = createKey(pathsets);
        
        subPath = subPaths[pathsetsKey] || (subPaths[pathsetsKey] = {
            head: [],
            tail: pathsets
        });
        subPathKeys = subPath.head;
        subPathKeys[subPathKeys.length] = isNumber(key) ? parseInt(key, 10) : key;
    }

    var results = [];
    var resultsLength = 0;

    for(pathsetsKey in subPaths) {
        
        subPath = subPaths[pathsetsKey];
        subPathKeys = subPath.head;
        subPathSets = subPath.tail;
        
        var firstSubPathsKey = subPathKeys[0];
        var subPathKeysCount = subPathKeys.length;
        
        var subPathSetsIndex = -1;
        var subPathSetsCount = subPathSets.length;
        
        while(++subPathSetsIndex < subPathSetsCount) {
            
            var pathset = subPathSets[subPathSetsIndex];
            var pathsetClone = [];
            
            if(firstSubPathsKey !== "") {
                
                pathsetClone[0] = subPathKeysCount === 1 ? firstSubPathsKey : subPathKeys;
                
                var pathsetIndex = -1;
                var pathsetCount = pathset.length;
                
                while(++pathsetIndex < pathsetCount) {
                    pathsetClone[pathsetIndex + 1] = pathset[pathsetIndex];
                }
            }
            
            results[resultsLength++] = pathsetClone;
        }
    }
    
    return results;
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