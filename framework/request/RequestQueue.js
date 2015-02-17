// Ties the requestQueue to a jsongModel.
// For dataSource purposes.
var RequestQueue = jsong.RequestQueue = function(jsongModel, scheduler) {
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
            if (!requests[i].pending) {
                return requests[i];
            }
        }
        return requests[requests.length] = new Request2(this._jsongModel, this);
    },

    remove: function(request) {
        for (var i = this._requests.length - 1; i > -1; i--) {
            if (this._requests[i].id === request.id && this._requests.splice(i, 1)) {
                break;
            }
        }
    },

    request: function(requestedPaths, optimizedPaths, observer) {
        var self = this;

        // TODO: A contains check.
        self._get().batch(requestedPaths, optimizedPaths, observer);

        if (!self._scheduled) {
            self._scheduled = true;
            self._scheduler.schedule(self._flush.bind(self));
        }

        return {
            dispose: function() {
                // TODO: 2 things to dispose of.
                // TODO: Current batched requests (if any).
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
                // TODO: In-flight batched requests.  This is just a place holder.
                disposables.forEach(function(d) { d.dispose(); });
            }
        }
    }
};

var REQUEST_ID = 0;

var Request2 = function(jsongModel, queue) {
    var self = this;
    self._jsongModel = jsongModel;
    self._queue = queue;
    self.observers = [];
    self.optimizedPaths = [];
    self.requestedPaths = [];
    self.pending = false;
    self.id = ++REQUEST_ID;
};

Request2.prototype = {

    batch: function(requestedPaths, optimizedPaths, observer) {
        // TODO: Do we need to gap fill?
        var self = this;
        observer.onNext = observer.onNext || NOOP;
        observer.onError = observer.onError || NOOP;
        observer.onCompleted = observer.onCompleted || NOOP;
        var onNext = observer.onNext.bind(observer);

        observer.onNext = function(value) {
            // TODO: Do we need to do any intercepting?
            onNext(value);
        };

        if (!observer.__observerId) {
            observer.__observerId = ++REQUEST_ID;
        }
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

        function recurseGet(requested, optimized) {
            var optimizedMaps = {};
            var requestedMaps = {};
            var r, o, i, j, obs, resultIndex;
            for (i = 0, len = requested.length; i < len; i++) {
                r = requested[i];
                o = optimized[i];
                obs = observers[i];
                for (j = 0; j < r.length; j++) {
                    pathsToMapWithObservers(r[j], 0, readyNode(requestedMaps, null, obs), obs);
                    pathsToMapWithObservers(o[j], 0, readyNode(optimizedMaps, null, obs), obs);
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
                            jsong: incomingValues.jsong || incomingValues.values || incomingValues.value,
                            paths: incomingValues.paths
                        });
                        obs.onCompleted && obs.onCompleted();
                    }
                });
        }

        return recurseGet(requested, optimized);
    },
    // Returns the paths that are contained within this request.
    contains: function(requestedPaths, optimizedPaths) {
        // TODO: 
    }
};

function pathsToMapWithObservers(path, idx, branch, observer) {
    var curr = path[idx];

    // Object / Array
    if (typeof curr === 'object') {
        if (Array.isArray(curr)) {
            curr.forEach(function(v) {
                readyNode(branch, v, observer);
                if (path.length > idx + 1) {
                    pathsToMapWithObservers(path, idx + 1, branch[v], observer);
                }
            });
        } else {
            var from = curr.from || 0;
            var to = curr.to >= 0 ? curr.to : curr.length;
            for (var i = from; i <= to; i++) {
                readyNode(branch, i, observer);
                if (path.length > idx + 1) {
                    pathsToMapWithObservers(path, idx + 1, branch[i], observer);
                }
            }
        }
    } else {
        readyNode(branch, curr, observer);
        if (path.length > idx + 1) {
            pathsToMapWithObservers(path, idx + 1, branch[curr], observer);
        }
    }
}

/**
 * Builds the set of collapsed
 * queries by traversing the tree
 * once
 */
var charPattern = /\D/i;

function readyNode(branch, key, observer) {
    if (key === null) {
        branch.__observers = branch.__observers || [];
        !containsObserver(branch.__observers, observer) && branch.__observers.push(observer);
        return branch;
    }

    if (!branch[key]) {
        branch[key] = {__observers: []};
    }

    !containsObserver(branch[key].__observers, observer) && branch[key].__observers.push(observer);
    return branch;
}

function containsObserver(observers, observer) {
    if (!observer) {
        return;
    }
    return observers.reduce(function(acc, x) {
        return acc || x.__observerId === observer.__observerId;
    }, false);
}

function collapse(pathMap) {
    return rangeCollapse(buildQueries(pathMap));
}

/**
 * Collapse ranges, e.g. when there is a continuous range
 * in an array, turn it into an object instead
 *
 * [1,2,3,4,5,6] => {"from":1, "to":6}
 *
 */
function rangeCollapse(paths) {
    paths.forEach(function (path) {
        path.forEach(function (elt, index) {
            var range;
            if (Array.isArray(elt) && elt.every(isNumber) && allUnique(elt)) {
                elt.sort(function(a, b) {
                    return a - b;
                });
                if (elt[elt.length-1] - elt[0] === elt.length-1) {
                    // create range
                    range = {};
                    range.from = elt[0];
                    range.to = elt[elt.length-1];
                    path[index] = range;
                }
            }
        });
    });
    return paths;
}

/* jshint forin: false */
function buildQueries(root) {

    if(root == null) {
        return [ [] ];
    }

    var children = Object.keys(root).filter(notPathMapInternalKeys),
        child, memo, paths, key, childIsNum,
        list, head, tail, clone, results,
        i = -1, n = children.length,
        j, k, x;

    if (n === 0 || Array.isArray(root) === true) {
        return [ [] ];
    }

    memo = {};
    while(++i < n) {
        child = children[i];
        paths = buildQueries(root[child]);
        key = createKey(paths);

        childIsNum = typeof child === 'string' && !charPattern.test(child);

        if ((list = memo[key]) && (head = list.head)) {
            head[head.length] = childIsNum ? parseInt(child, 10) : child;
        } else {
            memo[key] = {
                head: [childIsNum ? parseInt(child, 10) : child],
                tail: paths
            };
        }
    }

    results = [];
    for(x in memo) {
        head = (list = memo[x]).head;
        tail = list.tail;
        i = -1;
        n = tail.length;
        while(++i < n) {
            list = tail[i];
            j = -1;
            k = list.length;
            if(head[0] === '') {
                clone = [];
            } else {
                clone = [head.length === 1 ? head[0] : head];
                while(++j < k) {
                    clone[j + 1] = list[j];
                }
            }
            results[results.length] = clone;
        }
    }
    return results;
}

function notPathMapInternalKeys(key) {
    return (
        key !== "__observers" &&
        key !== "__pending" &&
        key !== "__batchID"
        );
}

/**
 * Return true if argument is a number
 */
function isNumber(val) {
    return typeof val === "number";
}

/**
 * allUnique
 * return true if every number in an array is unique
 */
function allUnique(arr) {
    var hash = {},
        index,
        len;

    for (index = 0, len = arr.length; index < len; index++) {
        if (hash[arr[index]]) {
            return false;
        }
        hash[arr[index]] = true;
    }
    return true;
}

/**
 * Sort a list-of-lists
 * Used for generating a unique hash
 * key for each subtree; used by the
 * memoization
 */
function sortLol(lol) {
    return lol.reduce(function (result, curr) {
        if (curr instanceof Array) {
            result.push(sortLol(curr).slice(0).sort());
            return result;
        }
        return result.concat(curr);
    }, []).slice(0).sort();
}

/**
 * Create a unique hash key for a set
 * of paths
 */
function createKey(list) {
    return JSON.stringify(sortLol(list));
}
// Note: For testing
jsong.__Internals.buildQueries = buildQueries;
