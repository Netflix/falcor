var pathUtils = require('falcor-path-utils');
var pathsComplementWithTree = pathUtils.pathsComplementWithTree;
var toTree = pathUtils.toTree;
var toPaths = pathUtils.toPaths;
var REQUEST_ID = 0;

/**
 * Creates a new GetRequest.  This GetRequest takes a scheduler and
 * the request queue.  Once the scheduler fires, all batched requests
 * will be sent to the server.  Upon request completion, the data is
 * merged back into the cache and all callbacks are notified.
 *
 * @param {Scheduler} scheduler -
 * @param {RequestQueueV2} requestQueue -
 */
var GetRequestV2 = function(scheduler, requestQueue) {
    this.sent = false;
    this.scheduled = false;
    this.requestQueue = requestQueue;
    this.id = ++REQUEST_ID;

    this._scheduler = scheduler;
    this._pathMap = {};
    this._optimizedPaths = [];
    this._callbacks = [];
    this._count = 0;
    this._disposable = null;
    this._collapsed = null;
    this._disposed = false;
};

GetRequestV2.prototype = {
    /**
     * batches the paths that are passed in.  Once the request is complete,
     * all callbacks will be called and the request will be removed from
     * parent queue.
     * @param {Array} optimizedPaths -
     * @param {Function} callback -
     */
    batch: function(optimizedPaths, callback) {
        var self = this;
        var oPaths = self._optimizedPaths;
        var callbacks = self._callbacks;
        var idx = oPaths.length;
        var disposed = false;

        // If its not sent, simply add it to the requested paths
        // and callbacks.
        oPaths[idx] = optimizedPaths;
        callbacks[idx] = callback;
        ++self._count;

        // If it has not been scheduled, then schedule the action
        if (!self.scheduled) {
            self.scheduled = true;
            self._disposable = self._scheduler.schedule(function() {
                flush(self, oPaths, function(err, data) {
                    self._disposed = true;

                    // If there is at least one callback remaining, then
                    // callback the callbacks.
                    if (self._count) {
                        var callbackKeys = Object.keys(callbacks);
                        var i = 0, len = callbackKeys.length;

                        // Call the callbacks.  The first one inserts all the
                        // data so that the rest do not have consider if their
                        // data is present or not.
                        for (; i < len; ++i) {
                            var callback = callbacks[callbackKeys[i]];
                            if (callback) {
                                callback(err, data);
                            }
                        }
                    }
                });
            });
        }

        // Disposes this batched request.  This does not mean that the
        // entire request has been disposed, but just the local one, if all
        // requests are disposed, then the outer disposable will be removed.
        return function() {
            if (disposed || self._disposed) {
                return;
            }

            disposed = true;
            callbacks[idx] = undefined;
            oPaths[idx] = [];

            // If there are no more requests, then dispose all of the request.
            var count = --self._count;
            if (count === 0) {
                self._disposable.dispose();
                self.requestQueue.removeRequest(self);
            }
        };
    },

    /**
     * Attempts to add paths to the outgoing request.  If there are added
     * paths then the request callback will be added to the callback list.
     *
     * @returns {Array} - the remaining paths in the request.
     */
    add: function(paths, callback) {
    }
};

// Flushes the current set of requests.  This will send the paths to the
// dataSource.  The results of the dataSource will be sent to callbacks.
function flush(request, listOfPaths, callback) {
    if (request._count === 0) {
        self.requestQueue.removeRequest(request);
        return;
    }

    request.sent = true;
    request.scheduled = false;

    // TODO: Move this to the collapse algorithm,
    // TODO: we should have a collapse that returns the paths and
    // TODO: the trees.

    // Take all the paths and add them to the pathMap by length.
    // Since its a list of paths
    var pathMap = request._pathMap;
    var listKeys = Object.keys(listOfPaths);
    var listIdx = 0, listLen = listKeys.length;
    for (; listIdx < listLen; ++listIdx) {
        var paths = listOfPaths[listIdx];
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
    var pathMapIdx = 0, pathMapLen = pathMapKeys.length;
    for (; pathMapIdx < pathMapLen; ++pathMapIdx) {
        var pathMapKey = pathMapKeys[pathMapIdx];
        pathMap[pathMapKey] = toTree(pathMap[pathMapKey]);
    }

    // Take the pathMapTree and create the collapsed paths and send those
    // off to the server.
    var collapsedPaths = request._collasped = toPaths(pathMap);
    var jsonGraphData;

    // Make the request.
    // You are probably wondering why this is not cancellable.  If a request
    // goes out, and all the requests are removed, the request should not be
    // cancelled.  The reasoning is that another request could come in, after
    // all callbacks have been removed and be deduped.  Might as well keep this
    // around until it comes back.  If at that point there are no requests then
    // we cancel at the callback above.
    request.
        requestQueue.dataSource.
        get(collapsedPaths).
        subscribe(function(data) {
            jsonGraphData = data;
        }, function(err) {
            callback(err, jsonGraphData);
        }, function() {
            callback(null, jsonGraphData);
        });
}


module.exports = GetRequestV2;
