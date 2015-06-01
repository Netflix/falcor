var falcor = require('./../Falcor');
var collapse = require("../../support/collapse");
var NOOP = falcor.NOOP;
var RequestQueue = function(jsongModel, scheduler) {
    this._scheduler = scheduler;
    this._jsongModel = jsongModel;

    this._scheduled = false;
    this._requests = [];
};

RequestQueue.prototype = {
    _get: function() {
        var i = -1;
        var requests = this._requests;
        while (++i < requests.length) {
            if (!requests[i].pending && requests[i].isGet) {
                return requests[i];
            }
        }
        return requests[requests.length] = new GetRequest(this._jsongModel, this);
    },
    _set: function() {
        var i = -1;
        var requests = this._requests;

        // TODO: Set always sends off a request immediately, so there is no batching.
        // while (++i < requests.length) {
        //     if (!requests[i].pending && requests[i].isSet) {
        //         return requests[i];
        //     }
        // }
        return requests[requests.length] = new SetRequest(this._jsongModel, this);
    },

    remove: function(request) {
        for (var i = this._requests.length - 1; i > -1; i--) {
            if (this._requests[i].id === request.id && this._requests.splice(i, 1)) {
                break;
            }
        }
    },

    set: function(jsongEnv, observer) {
        var self = this;
        var disposable = self._set().batch(jsongEnv, observer).flush();

        return {
            dispose: function() {
                disposable.dispose();
            }
        };
    },

    get: function(requestedPaths, optimizedPaths, observer) {
        var self = this;
        var disposable = null;

        // TODO: get does not batch across requests.
        self._get().batch(requestedPaths, optimizedPaths, observer);

        if (!self._scheduled) {
            self._scheduled = true;
            disposable = self._scheduler.schedule(self._flush.bind(self));
        }

        return {
            dispose: function() {
                disposable.dispose();
            }
        };
    },

    _flush: function() {
        this._scheduled = false;

        var requests = this._requests, i = -1;
        var disposables = [];
        while (++i < requests.length) {
            if (!requests[i].pending) {
                disposables[disposables.length] = requests[i].flush();
            }
        }

        return {
            dispose: function() {
                disposables.forEach(function(d) { d.dispose(); });
            }
        };
    }
};

var REQUEST_ID = 0;

var SetRequest = function(model, queue) {
    var self = this;
    self._jsongModel = model;
    self._queue = queue;
    self.observers = [];
    self.jsongEnvs = [];
    self.pending = false;
    self.id = ++REQUEST_ID;
    self.isSet = true;
};

SetRequest.prototype = {
    batch: function(jsongEnv, observer) {
        var self = this;
        observer.onNext = observer.onNext || NOOP;
        observer.onError = observer.onError || NOOP;
        observer.onCompleted = observer.onCompleted || NOOP;
        observer._requestId = self.id;
        self.observers[self.observers.length] = observer;
        self.jsongEnvs[self.jsongEnvs.length] = jsongEnv;

        return self;
    },
    flush: function() {
        var incomingValues, query, op, len;
        var self = this;
        var jsongs = self.jsongEnvs;
        var observers = self.observers;
        var model = self._jsongModel;
        self.pending = true;

        // TODO: Set does not batch.
        return model._dataSource.
            set(jsongs[0]).
            subscribe(function(response) {
                incomingValues = response;
            }, function(err) {
                var i = -1;
                var n = observers.length;
                while (++i < n) {
                    obs = observers[i];
                    obs.onError && obs.onError(err);
                }
            }, function() {
                var i, n, obs;
                self._queue.remove(self);
                i = -1;
                n = observers.length;
                while (++i < n) {
                    obs = observers[i];
                    obs.onNext && obs.onNext({
                        jsong: incomingValues.jsong || incomingValues.value,
                        paths: incomingValues.paths
                    });
                    obs.onCompleted && obs.onCompleted();
                }
            });
    }
};

var GetRequest = function(jsongModel, queue) {
    var self = this;
    self._jsongModel = jsongModel;
    self._queue = queue;
    self.observers = [];
    self.optimizedPaths = [];
    self.requestedPaths = [];
    self.pending = false;
    self.id = ++REQUEST_ID;
    self.isGet = true;
};

GetRequest.prototype = {

    batch: function(requestedPaths, optimizedPaths, observer) {
        // TODO: Do we need to gap fill?
        var self = this;
        observer.onNext = observer.onNext || NOOP;
        observer.onError = observer.onError || NOOP;
        observer.onCompleted = observer.onCompleted || NOOP;
        observer._requestId = self.id;
        self.observers[self.observers.length] = observer;
        self.optimizedPaths[self.optimizedPaths.length] = optimizedPaths;
        self.requestedPaths[self.requestedPaths.length] = requestedPaths;

        return self;
    },

    flush: function() {
        var incomingValues, query, op, len;
        var self = this;
        var requested = self.requestedPaths;
        var optimized = self.optimizedPaths;
        var observers = self.observers;
        var disposables = [];
        var results = [];
        var model = self._jsongModel;
        self._scheduled = false;
        self.pending = true;

        var optimizedMaps = {};
        var o, i, j, obs;
        for (i = 0, len = requested.length; i < len; i++) {
            o = optimized[i];
            for (j = 0; j < o.length; j++) {
                pathsToMapWithObservers(o[j], 0, optimizedMaps);
            }
        }
        return model._dataSource.
            get(collapse(optimizedMaps)).
            subscribe(function(response) {
                incomingValues = response;
            }, function(err) {
                var i = -1;
                var n = observers.length;
                while (++i < n) {
                    obs = observers[i];
                    obs.onError && obs.onError(err);
                }
            }, function() {
                var i, n, obs;
                self._queue.remove(self);
                i = -1;
                n = observers.length;
                while (++i < n) {
                    obs = observers[i];
                    obs.onNext && obs.onNext({
                        jsong: incomingValues.jsong || incomingValues.value,
                        paths: incomingValues.paths
                    });
                    obs.onCompleted && obs.onCompleted();
                }
            });
    }
};

function pathsToMapWithObservers(path, idx, branch) {
    var curr = path[idx];
    // Object / Array
    if (typeof curr === 'object') {
        if (Array.isArray(curr)) {
            curr.forEach(function(v) {
                var child = branch[v] || (branch[v] = {});
                if (path.length > idx + 1) {
                    pathsToMapWithObservers(path, idx + 1, child);
                }
            });
        } else {
            var from = curr.from || 0;
            var to = curr.to >= 0 ? curr.to : curr.length;
            for (var i = from; i <= to; i++) {
                var child = branch[i] || (branch[i] = {});
                if (path.length > idx + 1) {
                    pathsToMapWithObservers(path, idx + 1, child);
                }
            }
        }
    } else {
        if (path.length > idx + 1) {
            pathsToMapWithObservers(path, idx + 1, branch[curr] || (branch[curr] = {}));
        } else {
            branch[curr] = true;
        }
    }
}

module.exports = RequestQueue;
