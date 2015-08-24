var pathUtils = require('falcor-path-utils');
var pathsComplementWithLengthTree = pathUtils.pathsComplementFromLengthTree;
var flushGetRequest = require('./flushGetRequest');
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
                flushGetRequest(self, oPaths, function(err, data) {
                    self.requestQueue.removeRequest(self);
                    self._disposed = true;

                    // If there is at least one callback remaining, then
                    // callback the callbacks.
                    if (self._count) {

                        // Call the callbacks.  The first one inserts all the
                        // data so that the rest do not have consider if their
                        // data is present or not.
                        for (var i = 0, len = callbacks.length; i < len; ++i) {
                            var callback = callbacks[i];
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
        return createDisposable(self, idx);
    },

    /**
     * Attempts to add paths to the outgoing request.  If there are added
     * paths then the request callback will be added to the callback list.
     *
     * @returns {Array} - the remaining paths in the request.
     */
    add: function(paths, callback) {
        // uses the length tree complement calculator.
        var self = this;
        var outPaths = pathsComplementWithLengthTree(paths, self._pathMap);
        var inserted = false;
        var disposable = false;

        // If the out paths is less than the passed in paths, then there
        // has been an intersection and the complement has been returned.
        // Therefore, this can be deduped across requests.
        if (outPaths.length < paths.length) {
            inserted = true;
            var idx = self._callbacks.length;
            self._callbacks[idx] = callback;
            ++self._count;

            disposable = createDisposable(self, idx);
        }

        return [inserted, outPaths, disposable];
    }
};

// Creates a more efficient closure of the things that are
// needed.  So the request and the idx.  Also prevents code
// duplication.
function createDisposable(request, idx) {
    var disposed = false;
    return function() {
        if (disposed || request._disposed) {
            return;
        }

        disposed = true;
        request._callbacks[idx] = undefined;
        request._optimizedPaths[idx] = [];

        // If there are no more requests, then dispose all of the request.
        var count = --request._count;
        if (count === 0 && !request.sent) {
            request._disposable.dispose();
            request.requestQueue.removeRequest(self);
        }
    };
}


module.exports = GetRequestV2;
