var pathUtils = require("falcor-path-utils");
var toTree = pathUtils.toTree;
var toPaths = pathUtils.toPaths;
var InvalidSourceError = require("./../errors/InvalidSourceError");

/**
 * Flushes the current set of requests.  This will send the paths to the dataSource.
 * The results of the dataSource will be sent to callback which should perform the zip of all callbacks.
 *
 * @param {GetRequest} request - GetRequestV2 to be flushed to the DataSource
 * @param {Array} pathSetArrayBatch - Array of Arrays of path sets
 * @param {Function} callback -
 * @private
 */
module.exports = function flushGetRequest(request, pathSetArrayBatch, callback) {
    if (request._count === 0) {
        request.requestQueue.removeRequest(request);
        return null;
    }

    request.sent = true;
    request.scheduled = false;

    var requestPaths;

    var model = request.requestQueue.model;
    if (model._enablePathCollapse || model._enableRequestDeduplication) {
        // Note on the if-condition: request deduplication uses request._pathMap,
        // so we need to populate that field if the feature is enabled.

        // TODO: Move this to the collapse algorithm,
        // TODO: we should have a collapse that returns the paths and
        // TODO: the trees.

        // Take all the paths and add them to the pathMap by length.
        // Since its a list of paths
        var pathMap = request._pathMap;
        var listIdx = 0,
            listLen = pathSetArrayBatch.length;
        for (; listIdx < listLen; ++listIdx) {
            var paths = pathSetArrayBatch[listIdx];
            for (var j = 0, pathLen = paths.length; j < pathLen; ++j) {
                var pathSet = paths[j];
                var len = pathSet.length;

                if (!pathMap[len]) {
                    pathMap[len] = [pathSet];
                } else {
                    var pathSetsByLength = pathMap[len];
                    pathSetsByLength[pathSetsByLength.length] = pathSet;
                }
            }
        }

        // now that we have them all by length, convert each to a tree.
        var pathMapKeys = Object.keys(pathMap);
        var pathMapIdx = 0,
            pathMapLen = pathMapKeys.length;
        for (; pathMapIdx < pathMapLen; ++pathMapIdx) {
            var pathMapKey = pathMapKeys[pathMapIdx];
            pathMap[pathMapKey] = toTree(pathMap[pathMapKey]);
        }
    }

    if (model._enablePathCollapse) {
        // Take the pathMapTree and create the collapsed paths and send those
        // off to the server.
        requestPaths = toPaths(request._pathMap);
    } else if (pathSetArrayBatch.length === 1) {
        // Single batch Array of path sets, just extract it
        requestPaths = pathSetArrayBatch[0];
    } else {
        // Multiple batches of Arrays of path sets, shallowly flatten into an Array of path sets
        requestPaths = Array.prototype.concat.apply([], pathSetArrayBatch);
    }

    // Make the request.
    // You are probably wondering why this is not cancellable.  If a request
    // goes out, and all the requests are removed, the request should not be
    // cancelled.  The reasoning is that another request could come in, after
    // all callbacks have been removed and be deduped.  Might as well keep this
    // around until it comes back.  If at that point there are no requests then
    // we cancel at the callback above.
    var getRequest;
    try {
        getRequest = model._source.get(requestPaths, request._dataSourceRequestOptions);
    } catch (e) {
        callback(new InvalidSourceError());
        return null;
    }

    // Ensures that the disposable is available for the outside to cancel.
    var jsonGraphData;
    var disposable = getRequest.subscribe(
        function(data) {
            jsonGraphData = data;
        },
        function(err) {
            callback(err, jsonGraphData);
        },
        function() {
            callback(null, jsonGraphData);
        }
    );

    return disposable;
};
