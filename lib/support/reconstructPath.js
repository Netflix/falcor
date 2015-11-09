/**
 * Reconstructs the path for the current key, from currentPath (requestedPath)
 * state maintained during walk operations.
 *
 * During the walk, since the requestedPath array, and requestedPath.index
 * is updated after we attempt to merge/insert nodes during a walk (it reflects
 * the inserted node's parent branch) we need to reconstitute a path from it.
 *
 * @param  {Array} currentPath The current requestedPath state, during the walk
 * @param  {String} key        The current key value, during the walk
 * @return {Array} A new array, with the path which represents the node we're about
 * to insert
 */
module.exports = function reconstructPath(currentPath, key) {

    // The first time called during a walk, currentPath.index won't be set.
    var currentPathIndex = (currentPath.index || 0) + 1;

    var path = currentPath.slice(0, currentPathIndex);
    path[path.length] = key;

    return path;
};
