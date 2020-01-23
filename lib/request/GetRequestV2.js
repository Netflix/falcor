var complement = require("./complement");
var flushGetRequest = require("./flushGetRequest");
var incrementVersion = require("../support/incrementVersion");
var currentCacheVersion = require("../support/currentCacheVersion");

var REQUEST_ID = 0;
var GetRequestType = require("./RequestTypes").GetRequest;
var setJSONGraphs = require("./../set/setJSONGraphs");
var setPathValues = require("./../set/setPathValues");
var $error = require("./../types/error");
var emptyArray = [];
var InvalidSourceError = require("./../errors/InvalidSourceError");

/**
 * Creates a new GetRequest.  This GetRequest takes a scheduler and
 * the request queue.  Once the scheduler fires, all batched requests
 * will be sent to the server.  Upon request completion, the data is
 * merged back into the cache and all callbacks are notified.
 *
 * @param {Scheduler} scheduler -
 * @param {RequestQueueV2} requestQueue -
 * @param {number} attemptCount
 */
var GetRequestV2 = function(scheduler, requestQueue, attemptCount) {
    this.sent = false;
    this.scheduled = false;
    this.requestQueue = requestQueue;
    this.id = ++REQUEST_ID;
    this.type = GetRequestType;

    this._scheduler = scheduler;
    this._attemptCount = attemptCount;
    this._pathMap = {};
    this._optimizedPaths = [];
    this._requestedPaths = [];
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
     * @param {Array} requestedPaths -
     * @param {Array} optimizedPaths -
     * @param {Function} callback -
     */
    batch: function(requestedPaths, optimizedPaths, callback) {
        var self = this;
        var batchedOptPathSets = self._optimizedPaths;
        var batchedReqPathSets = self._requestedPaths;
        var batchedCallbacks = self._callbacks;
        var batchIx = batchedOptPathSets.length;

        // If its not sent, simply add it to the requested paths
        // and callbacks.
        batchedOptPathSets[batchIx] = optimizedPaths;
        batchedReqPathSets[batchIx] = requestedPaths;
        batchedCallbacks[batchIx] = callback;
        ++self._count;

        // If it has not been scheduled, then schedule the action
        if (!self.scheduled) {
            self.scheduled = true;

            var flushedDisposable;
            var scheduleDisposable = self._scheduler.schedule(function() {
                flushedDisposable = flushGetRequest(self, batchedOptPathSets, function(err, data) {
                    var i, fn, len;
                    var model = self.requestQueue.model;
                    self.requestQueue.removeRequest(self);
                    self._disposed = true;

                    if (model._treatDataSourceErrorsAsJSONGraphErrors ? err instanceof InvalidSourceError : !!err) {
                        for (i = 0, len = batchedCallbacks.length; i < len; ++i) {
                            fn = batchedCallbacks[i];
                            if (fn) {
                                fn(err);
                            }
                        }
                        return;
                    }

                    // If there is at least one callback remaining, then
                    // callback the callbacks.
                    if (self._count) {
                        // currentVersion will get added to each inserted
                        // node as node.$_version inside of self._merge.
                        //
                        // atom values just downloaded with $expires: 0
                        // (now-expired) will get assigned $_version equal
                        // to currentVersion, and checkCacheAndReport will
                        // later consider those nodes to not have expired
                        // for the duration of current event loop tick
                        //
                        // we unset currentCacheVersion after all callbacks
                        // have been called, to ensure that only these
                        // particular callbacks and any synchronous model.get
                        // callbacks inside of these, get the now-expired
                        // values
                        var currentVersion = incrementVersion.getCurrentVersion();
                        currentCacheVersion.setVersion(currentVersion);
                        var mergeContext = { hasInvalidatedResult: false };

                        var pathsErr = model._useServerPaths && data && data.paths === undefined ?
                            new Error("Server responses must include a 'paths' field when Model._useServerPaths === true") : undefined;

                        if (!pathsErr) {
                            self._merge(batchedReqPathSets, err, data, mergeContext);
                        }

                        // Call the callbacks.  The first one inserts all
                        // the data so that the rest do not have consider
                        // if their data is present or not.
                        for (i = 0, len = batchedCallbacks.length; i < len; ++i) {
                            fn = batchedCallbacks[i];
                            if (fn) {
                                fn(pathsErr || err, data, mergeContext.hasInvalidatedResult);
                            }
                        }
                        currentCacheVersion.setVersion(null);
                    }
                });
                self._disposable = flushedDisposable;
            });

            // If the scheduler is sync then `flushedDisposable` will be
            // defined, and we want to use it, because that's what aborts an
            // in-flight XHR request, for example.
            // But if the scheduler is async, then `flushedDisposable` won't be
            // defined yet, and so we must use the scheduler's disposable until
            // `flushedDisposable` is defined. Since we want to still use
            // `flushedDisposable` once it is defined (to be able to abort in-
            // flight XHR requests), hence the reassignment of `_disposable`
            // above.
            self._disposable = flushedDisposable || scheduleDisposable;
        }

        // Disposes this batched request.  This does not mean that the
        // entire request has been disposed, but just the local one, if all
        // requests are disposed, then the outer disposable will be removed.
        return createDisposable(self, batchIx);
    },

    /**
     * Attempts to add paths to the outgoing request.  If there are added
     * paths then the request callback will be added to the callback list.
     * Handles adding partial paths as well
     *
     * @returns {Array} - whether new requested paths were inserted in this
     *                    request, the remaining paths that could not be added,
     *                    and disposable for the inserted requested paths.
     */
    add: function(requested, optimized, callback) {
        // uses the length tree complement calculator.
        var self = this;
        var complementResult = complement(requested, optimized, self._pathMap);

        var inserted = false;
        var disposable = false;

        // If we found an intersection, then just add new callback
        // as one of the dependents of that request
        if (complementResult.intersection.length) {
            inserted = true;
            var batchIx = self._callbacks.length;
            self._callbacks[batchIx] = callback;
            self._requestedPaths[batchIx] = complementResult.intersection;
            self._optimizedPaths[batchIx] = [];
            ++self._count;

            disposable = createDisposable(self, batchIx);
        }

        return [inserted, complementResult.requestedComplement, complementResult.optimizedComplement, disposable];
    },

    /**
     * merges the response into the model"s cache.
     */
    _merge: function(requested, err, data, mergeContext) {
        var self = this;
        var model = self.requestQueue.model;
        var modelRoot = model._root;
        var errorSelector = modelRoot.errorSelector;
        var comparator = modelRoot.comparator;
        var boundPath = model._path;

        model._path = emptyArray;

        // flatten all the requested paths, adds them to the
        var nextPaths = model._useServerPaths ? data.paths : flattenRequestedPaths(requested);

        // Insert errors in every requested position.
        if (err && model._treatDataSourceErrorsAsJSONGraphErrors) {
            var error = err;

            // Converts errors to objects, a more friendly storage
            // of errors.
            if (error instanceof Error) {
                error = {
                    message: error.message
                };
            }

            // Not all errors are value $types.
            if (!error.$type) {
                error = {
                    $type: $error,
                    value: error
                };
            }

            var pathValues = nextPaths.map(function(x) {
                return {
                    path: x,
                    value: error
                };
            });
            setPathValues(model, pathValues, null, errorSelector, comparator, mergeContext);
        }

        // Insert the jsonGraph from the dataSource.
        else {
            setJSONGraphs(model, [{
                paths: nextPaths,
                jsonGraph: data.jsonGraph
            }], null, errorSelector, comparator, mergeContext);
        }

        // return the model"s boundPath
        model._path = boundPath;
    }
};

// Creates a more efficient closure of the things that are
// needed.  So the request and the batch index.  Also prevents code
// duplication.
function createDisposable(request, batchIx) {
    var disposed = false;
    return function() {
        if (disposed || request._disposed) {
            return;
        }

        disposed = true;
        request._callbacks[batchIx] = null;
        request._optimizedPaths[batchIx] = [];
        request._requestedPaths[batchIx] = [];

        // If there are no more requests, then dispose all of the request.
        var count = --request._count;
        var disposable = request._disposable;
        if (count === 0) {
            // looking for unsubscribe here to support more data sources (Rx)
            if (disposable.unsubscribe) {
                disposable.unsubscribe();
            } else {
                disposable.dispose();
            }
            request.requestQueue.removeRequest(request);
        }
    };
}

function flattenRequestedPaths(requested) {
    var out = [];
    var outLen = -1;
    for (var i = 0, len = requested.length; i < len; ++i) {
        var paths = requested[i];
        for (var j = 0, innerLen = paths.length; j < innerLen; ++j) {
            out[++outLen] = paths[j];
        }
    }
    return out;
}

module.exports = GetRequestV2;
